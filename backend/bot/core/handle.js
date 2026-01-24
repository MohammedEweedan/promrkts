const { chatOllama } = require('./llm');
const { routeToolCall } = require('./router');
const { getConv, saveConv, getProfile, updateProfile } = require('./state');
const { SYSTEM_PROMPT, toolSpecs } = require('./prompts');

// Simple in-memory cache for large facts payloads keyed by user
const FACTS_TTL_MS = Number(process.env.CHAT_FACTS_TTL_MS || 5 * 60 * 1000);
const factsCache = new Map(); // userId -> { data, ts }

// Resilient LLM caller with fallback model and lighter options on failure
async function callLLM({ system, messages, tools, model, stream }) {
  const primaryModel = model || process.env.OLLAMA_MODEL || 'llama3.1';
  const fallbackModel = process.env.OLLAMA_FALLBACK_MODEL || 'llama3.1';
  const baseOpts = {
    temperature: Number(process.env.OLLAMA_TEMPERATURE || 0.4),
    num_ctx: Number(process.env.OLLAMA_NUM_CTX || 8192),
    num_predict: Number(process.env.OLLAMA_NUM_PREDICT || 1024),
  };
  const lightOpts = {
    ...baseOpts,
    num_ctx: Math.min(baseOpts.num_ctx || 4096, 4096),
    num_predict: Math.min(baseOpts.num_predict || 768, 768),
    temperature: Number(process.env.OLLAMA_FALLBACK_TEMPERATURE || 0.35),
  };
  try {
    return await chatOllama({ system, messages, tools, model: primaryModel, stream, options: baseOpts });
  } catch (e) {
    const msg = String(e?.message || '').toLowerCase();
    const shouldFallback = msg.includes('ollama 500') || msg.includes('terminated') || msg.includes('killed') || msg.includes('oom');
    if (!shouldFallback) throw e;
    console.warn(`[LLM FALLBACK] primary (${primaryModel}) failed: ${e.message}. Retrying with ${fallbackModel} and light options.`);
    return await chatOllama({ system, messages, tools, model: fallbackModel, stream, options: lightOpts });
  }
}

// Parse tool calls from LLM text output (for models that don't use structured tool_calls)
const parseToolCallsFromText = (text) => {
  const toolCalls = [];
  // Match patterns like: {"name": "get_courses", "parameters": {...}}
  const jsonPattern = /\{\s*["']name["']\s*:\s*["']([^"']+)["']\s*,\s*["']parameters["']\s*:\s*(\{[^}]*\}|[^}]+)\s*\}/g;
  let match;
  while ((match = jsonPattern.exec(text)) !== null) {
    try {
      const name = match[1];
      let params = match[2];
      // Handle both object and string parameters
      if (typeof params === 'string' && !params.startsWith('{')) {
        params = `{"filter":"${params}"}`;
      }
      const args = JSON.parse(params);
      toolCalls.push({ id: `call_${Date.now()}_${toolCalls.length}`, name, arguments: args });
    } catch (e) {
      console.warn('Failed to parse tool call:', match[0]);
    }
  }
  return toolCalls;
};

async function handleMessage({ channel, userId, text, lang, role, context, facts, model, stream }) {
  function sanitizeAssistant(t) {
    if (!t) return '';
    let s = String(t);
    s = s.replace(/^(?:since|because)\b[^\n]*\b(tool|tools|function|call|api)[^\n]*\n?/i, '');
    s = s.replace(/^(?:i\s+will(?:\s+not)?|i\s+won't)\b[^\n]*\b(tool|tools|function|call)[^\n]*\n?/i, '');
    s = s.replace(/\{\s*"name"\s*:\s*"[^"]+"[\s\S]*?\}/g, '');
    s = s.replace(/i\s+do(?:\s+not|n't)?\s+have\s+(any\s+)?tools?[^\n]*\n?/i, '');
    s = s.replace(/i\s+can(?:not|\'t)\s+assist[^\n]*(api|endpoint|code)[^\n]*\n?/i, '');
    s = s.replace(/it\s+seems\s+like\s+there\s+was\s+an\s+error\s+in\s+the\s+api\s+call[\s\S]*/i, '');
    return s.trim();
  }

  const conv = await getConv(channel, userId);
  const profile = await getProfile(userId);
  if (lang && profile.language !== lang) await updateProfile(userId, { language: lang });

  const lng = String(lang || profile.language || '').slice(0,2).toLowerCase() || 'en';
  const lowerCaseText = String(text || '').trim().toLowerCase();
  const isNameAsk = /(what'?s\s+my\s+name|who\s+am\s+i|ما\s+اسمي|اسمي\s+ما|je\s+m'appelle\s+quoi|mon\s+nom|c'est\s+quoi\s+mon\s+nom)/i.test(lowerCaseText);
  if (isNameAsk) {
    let display = '';
    try {
      // Try profile fields if present
      display = profile?.name || profile?.displayName || profile?.username || '';
      // Try to parse from context hint: e.g., "user=email@example.com | ..."
      if (!display && typeof context === 'string') {
        const m = context.match(/\buser=([^|\s]+)/i);
        if (m && m[1]) display = m[1];
      }
      // Mask email for privacy
      if (display && display.includes('@')) {
        const [u, d] = display.split('@');
        const masked = u.length > 2 ? u.slice(0,2) + '***' : u[0] + '***';
        display = `${masked}@${d}`;
      }
    } catch {}
    let reply = '';
    if (!display) {
      reply = lng === 'ar' ? 'لم أتعرف على اسمك بعد — هل تود أن أخزّنه لأجل التخصيص؟' : lng === 'fr' ? "Je n'ai pas encore votre nom — voulez-vous que je l'enregistre pour personnaliser ?" : "I don't know your name yet — would you like me to save it for personalization?";
    } else {
      reply = lng === 'ar' ? `أنت على ما أظن: ${display}` : lng === 'fr' ? `Vous êtes probablement : ${display}` : `You appear to be: ${display}`;
    }
    const messages = [...(conv.history || []), { role: 'user', content: text }, { role: 'assistant', content: reply }];
    await saveConv(channel, userId, messages);
    return { text: reply };
  }

  // Cache or retrieve facts (to reduce repeated large payloads)
  try {
    const now = Date.now();
    if (facts && typeof facts === 'object') {
      factsCache.set(userId, { data: facts, ts: now });
    } else {
      const entry = factsCache.get(userId);
      if (entry && now - entry.ts < FACTS_TTL_MS) facts = entry.data;
    }
  } catch {}

  // Build augmented system prompt with role/context/facts
  const systemBase = SYSTEM_PROMPT(profile, lang);
  const roleLine = String(role || '').toLowerCase() === 'admin'
    ? 'ROLE=ADMIN — You may synthesize internal analytics and operational insights. NEVER reveal raw JSON, secrets, coupon codes, or PII. Summarize and aggregate only.'
    : 'ROLE=USER — Restrict to learner-facing information (courses, subscriptions, purchases, progress, badges, communications, promos). Do not expose any internal-only data.';
  const safeStr = (obj) => {
    try {
      const s = typeof obj === 'string' ? obj : JSON.stringify(obj);
      const lim = Number(process.env.CHAT_FACTS_MAX_CHARS || 8000);
      return s.length > lim ? s.slice(0, lim) + ' …[truncated]' : s;
    } catch {
      return '';
    }
  };
  const system = `${systemBase}\n\n# Role & Runtime Context\n${roleLine}\n${context ? `Context: ${safeStr(context)}\n` : ''}${facts ? `Facts (for reasoning only; NEVER output raw JSON): ${safeStr(facts)}\n` : ''}`;
  const userMsg = { role: 'user', content: text };
  const messages = [...conv.history, userMsg];
  
  // FORCE tool call for price/chart/quote requests (bypass LLM decision)
  const textLower = (text || '').toLowerCase();
  const priceSymbols = [
    'xauusd','xagusd','xagusd','xau','xag','gold','silver',
    'eurusd','gbpusd','usdjpy','audusd','usdcad','nzdusd','usdchf',
    'btc','eth','bitcoin','ethereum','sol','solana','xrp','ada','doge','ton']
  ;
  const priceKeywords = ['price','chart','quote','show','display','سعر','شارت','مخطط','أرني','ارني','عرض','تحليل','analysis'];
  const hasSymbolMention = priceSymbols.some(s => textLower.includes(s));
  const hasPriceIntent = priceKeywords.some(k => textLower.includes(k));
  const hasPriceRequest = hasSymbolMention && hasPriceIntent;
  // More specific intents
  const chartIntentWords = ['chart', 'show chart', 'display chart', 'render chart', 'graphique', 'مخطط', 'شارت'];
  const analysisIntentWords = ['analysis', 'analyse', 'تحليل', 'strategy', 'strategies', 'best strategy', 'how to trade', 'setup', 'entry', 'exit', 'plan'];
  const wantsChart = chartIntentWords.some(w => textLower.includes(w));
  const wantsAnalysis = analysisIntentWords.some(w => textLower.includes(w));
  // FORCE tool call for courses/tiers/enrollment queries to ensure real data
  const courseKeywords = [
    'course','courses','tier','tiers','enroll','enrollment','subscribe','subscription','plan','vip','premium','standard',
    'learning path','path','learning','track','start learning','help me enroll','enroll me',
    'مسار','تعلم','التسجيل','سجل','اشتراك',
    'parcours','apprentissage','inscription'
  ];
  const hasCourseRequest = courseKeywords.some(k => textLower.includes(k));
  
  let toolCalls = [];
  let assistantMsg = null;
  let llm = null;
  
  if (hasPriceRequest || wantsChart || wantsAnalysis) {
    // Force get_price tool call (and analysis if requested)
    let symbol = priceSymbols.find(s => textLower.includes(s));
    // If user said "show me the chart" without symbol, try to infer last symbol from history
    if (!symbol && (wantsChart || wantsAnalysis)) {
      try {
        const hist = conv.history || [];
        for (let i = hist.length - 1; i >= 0; i--) {
          const m = hist[i];
          if (m && m.role === 'tool' && typeof m.content === 'string') {
            try { const obj = JSON.parse(m.content); if (obj && obj.symbol) { symbol = String(obj.symbol).toLowerCase(); break; } } catch {}
          }
        }
      } catch {}
    }
    if (!symbol) {
      // Fall back to normal LLM flow if no symbol could be determined
      llm = await callLLM({ system, messages, tools: toolSpecs, model, stream });
      assistantMsg = llm.message || llm.choices?.[0]?.message || {};
      toolCalls = assistantMsg.tool_calls || [];
      if (!toolCalls.length && assistantMsg.content) {
        toolCalls = parseToolCallsFromText(assistantMsg.content);
      }
    } else {
    let type = 'crypto';
    if (['xauusd','xagusd','xagusd','xau','xag','gold','silver'].includes(symbol)) type = 'commodity';
    if (['eurusd','gbpusd','usdjpy','audusd','usdcad','nzdusd','usdchf'].includes(symbol)) type = 'forex';
    
    toolCalls = [{
      id: `forced_price_${Date.now()}`,
      name: 'get_price',
      arguments: { symbol: symbol.toUpperCase(), type }
    }];
    if (wantsChart || wantsAnalysis) {
      toolCalls.push({
        id: `forced_analysis_${Date.now()}`,
        name: 'get_market_analysis',
        arguments: { symbol: symbol.toUpperCase(), timeframe: '1D' }
      });
    }
    console.log(`[FORCED TOOL CALL] get_price(${symbol.toUpperCase()}, ${type})${(wantsChart||wantsAnalysis)?' + get_market_analysis':''}`);
    }
  } else if (hasCourseRequest) {
    // Force get_courses to ground the response in real DB data
    toolCalls = [{
      id: `forced_courses_${Date.now()}`,
      name: 'get_courses',
      arguments: { limit: 10 }
    }];
    console.log(`[FORCED TOOL CALL] get_courses(limit=10)`);
  } else {
    // First LLM call
    llm = await callLLM({ system, messages, tools: toolSpecs, model, stream });
    assistantMsg = llm.message || llm.choices?.[0]?.message || {};
    
    // Check for tool calls (structured or in text)
    toolCalls = assistantMsg.tool_calls || [];
    if (!toolCalls.length && assistantMsg.content) {
      // Try to parse tool calls from text content
      toolCalls = parseToolCallsFromText(assistantMsg.content);
    }
  }
  
  // If LLM wants to call tools
  if (toolCalls.length) {
    // Add assistant message with tool calls to history (strip tool syntax from content)
    const baseContent = hasPriceRequest ? 'Let me check that for you...' : (assistantMsg?.content || '');
    const cleanContent = sanitizeAssistant(baseContent);
    messages.push({ role: 'assistant', content: cleanContent, tool_calls: toolCalls });
    
    // Execute each tool and add results
    let lastPrice = null;
    let lastCourses = null;
    let lastAnalysis = null;
    let anyToolError = false;
    for (const call of toolCalls) {
      try {
        const result = await routeToolCall(call);
        // Add tool result message
        messages.push({ 
          role: 'tool', 
          tool_call_id: call.id || call.name,
          name: call.name,
          content: JSON.stringify(result)
        });
        if (call.name === 'get_price') lastPrice = result;
        if (call.name === 'get_courses') lastCourses = result;
        if (call.name === 'get_market_analysis') lastAnalysis = result;
        if (result && result.error) anyToolError = true;
      } catch (err) {
        messages.push({ 
          role: 'tool', 
          tool_call_id: call.id || call.name,
          name: call.name,
          content: JSON.stringify({ error: err.message || 'Tool execution failed' })
        });
        anyToolError = true;
      }
    }

    // If any tool failed, do NOT leak internal details; provide a friendly localized fallback
    if (anyToolError) {
      const lng = String(lang || '').slice(0,2).toLowerCase();
      let textOut = '';
      if (lng === 'ar') {
        textOut = 'عذراً، تعذّر جلب بعض البيانات الآن. هل تود أن أعيد المحاولة أو تحدد لي ما الذي تريد بالضبط (الرمز/الإطار الزمني)؟';
      } else if (lng === 'fr') {
        textOut = "Désolé, nous n'avons pas pu récupérer certaines données pour le moment. Voulez-vous que je réessaie ou préciser (symbole/temps) ?";
      } else {
        textOut = "Sorry, I couldn't fetch some data right now. Would you like me to retry, or can you specify the symbol/timeframe?";
      }
      messages.push({ role: 'assistant', content: textOut });
      await saveConv(channel, userId, messages);
      return { text: textOut };
    }

    // Deterministic synthesis for chart/analysis, price and course queries (privacy-safe, no hallucinations)
    const lng = String(lang || '').slice(0,2).toLowerCase();
    // If chart or analysis was requested, synthesize a chart directive + concise analysis
    if ((wantsChart || wantsAnalysis) && (lastPrice?.ok || lastAnalysis?.ok)) {
      const sym = (lastPrice?.symbol || lastAnalysis?.symbol || '').toString();
      const src = lastPrice?.source || 'source';
      const val = lastPrice ? (typeof lastPrice.price_str === 'string' ? lastPrice.price_str : String(lastPrice.price)) : '';
      // Localized chart directive that the frontend recognizes
      let chartLine = '';
      if (lng === 'ar') chartLine = `عرض مخطط ${sym}`; else if (lng === 'fr') chartLine = `Graphique pour ${sym}`; else chartLine = `Show chart for ${sym}`;
      // Short analysis summary
      const tf = (lastAnalysis?.timeframe || '1D').toString();
      const notes = Array.isArray(lastAnalysis?.educationalNotes) ? lastAnalysis.educationalNotes.slice(0,2) : [];
      let analysisLines = '';
      if (notes.length) {
        analysisLines = notes.map(n => `- ${n}`).join('\n');
      }
      let priceLine = '';
      if (sym && val) {
        if (lng === 'ar') priceLine = `وفقًا لـ ${src}، ${sym} = ${val}.`;
        else if (lng === 'fr') priceLine = `Selon ${src}, ${sym} est à ${val}.`;
        else priceLine = `According to ${src}, ${sym} is ${val}.`;
      }
      const disclaimer = (lng === 'ar')
        ? '⚠️ هذا محتوى تعليمي فقط وليس نصيحة مالية.'
        : (lng === 'fr')
          ? '⚠️ Ceci est un contenu éducatif uniquement, pas un conseil financier.'
          : '⚠️ This is educational content only, not financial advice.';
      const textOut = [chartLine, priceLine, analysisLines, '', disclaimer].filter(Boolean).join('\n');
      messages.push({ role: 'assistant', content: textOut });
      await saveConv(channel, userId, messages);
      return { text: textOut };
    }
    if (hasPriceRequest && lastPrice && lastPrice.ok) {
      const p = lastPrice;
      const src = p.source || 'source';
      const sym = p.symbol || '';
      const val = typeof p.price_str === 'string' ? p.price_str : String(p.price);
      let textOut = '';
      if (lng === 'ar') {
        textOut = `وفقًا لـ ${src}، سعر ${sym} هو ${val}.\n\n⚠️ هذا محتوى تعليمي فقط وليس نصيحة مالية.`;
      } else if (lng === 'fr') {
        textOut = `Selon ${src}, ${sym} est à ${val}.\n\n⚠️ Ceci est un contenu éducatif uniquement, pas un conseil financier.`;
      } else {
        textOut = `According to ${src}, ${sym} is ${val}.\n\n⚠️ This is educational content only, not financial advice.`;
      }
      messages.push({ role: 'assistant', content: textOut });
      await saveConv(channel, userId, messages);
      return { text: textOut };
    }
    if (hasCourseRequest && lastCourses && lastCourses.ok && Array.isArray(lastCourses.courses)) {
      const rf = (facts && typeof facts === 'object') ? facts : {};
      const purchases = Array.isArray(rf.purchases) ? rf.purchases : [];
      const confirmedIds = new Set((purchases || []).filter((p) => String(p?.status || '').toUpperCase() === 'CONFIRMED').map((p) => p?.tier?.id || p?.courseId || p?.id).filter(Boolean));
      const lvlOrder = ['beginner','intermediate','advanced','expert'];
      const sorted = (lastCourses.courses || []).slice().sort((a,b) => {
        const ai = lvlOrder.indexOf(String(a?.level||'').toLowerCase());
        const bi = lvlOrder.indexOf(String(b?.level||'').toLowerCase());
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
      const filtered = sorted.filter(c => !(c?.id && confirmedIds.has(c.id)));
      const items = filtered.slice(0, 6);

      let header = '';
      let footer = '';
      if (lng === 'ar') {
        header = 'مسارك التعليمي المقترح:';
        footer = "للاشتراك، أخبرني 'Enroll in <اسم الدورة>' أو تفضل بزيارة /courses.";
      } else if (lng === 'fr') {
        header = 'Parcours d’apprentissage recommandé :';
        footer = "Pour vous inscrire, dites 'Enroll in <Titre>' ou visitez /courses.";
      } else {
        header = 'Recommended learning path:';
        footer = "To enroll, tell me 'Enroll in <Title>' or visit /courses.";
      }

      if (items.length === 0) {
        const none = (lng === 'ar') ? 'لا توجد اقتراحات لأنك مشترك بالفعل في العروض المتاحة.'
          : (lng === 'fr') ? "Aucune suggestion pour le moment, vous possédez déjà les offres disponibles."
          : 'No suggestions right now — you already own the available offerings.';
        const textOut = `${header}\n${none}\n\n${footer}`;
        messages.push({ role: 'assistant', content: textOut });
        await saveConv(channel, userId, messages);
        return { text: textOut };
      }

      const lines = items.map((c) => {
        const title = c?.title || (lng==='ar' ? 'دورة' : lng==='fr' ? 'Cours' : 'Course');
        const tier = c?.tier ? ` ${c.tier}` : '';
        const level = c?.level ? `, ${c.level}` : '';
        const price = (c?.price != null && c?.currency) ? `, ${c.price} ${c.currency}` : (c?.price != null ? `, ${c.price}` : '');
        const descRaw = (c?.description || '').toString().trim();
        const desc = descRaw.length > 220 ? descRaw.slice(0,220) + '…' : descRaw;
        return `- ${title}${tier}${level}${price}\n  ${desc}`.trim();
      }).join('\n');

      const textOut = `${header}\n${lines}\n\n${footer}`;
      messages.push({ role: 'assistant', content: textOut });
      await saveConv(channel, userId, messages);
      return { text: textOut };
    }

    // Second LLM call to synthesize tool results into natural language
    const final = await callLLM({ system, messages, tools: toolSpecs, model, stream });
    const finalMsg = final.message || final.choices?.[0]?.message || {};
    const finalClean = sanitizeAssistant(finalMsg.content || '');
    messages.push({ role: 'assistant', content: finalClean });
    
    await saveConv(channel, userId, messages);
    return normalize(final);
  }

  // No tool calls, just save and return
  messages.push({ role: 'assistant', content: sanitizeAssistant(assistantMsg.content || '') });
  await saveConv(channel, userId, messages);
  return normalize(llm);
};

const normalize = (llm) => {
  const text = llm?.message?.content || llm?.choices?.[0]?.message?.content || '';
  return { text };
};

module.exports = { handleMessage };

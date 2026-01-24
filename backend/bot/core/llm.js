const chatOllama = async ({ system, messages, tools, model, stream, options }) => {
  const mdl = model || process.env.OLLAMA_MODEL || 'llama3.1';
  let envOpts = undefined;
  try {
    if (process.env.OLLAMA_OPTIONS_JSON) {
      envOpts = JSON.parse(process.env.OLLAMA_OPTIONS_JSON);
    }
  } catch {}
  const body = {
    model: mdl,
    messages: [
      { role: 'system', content: system || '' },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ],
    tools: tools || [],
    stream: !!stream,
    options: { ...(envOpts || {}), ...(options || {}) }
  };
  const base = process.env.OLLAMA_URL
    || (process.env.OLLAMA_BASE_URL ? `${process.env.OLLAMA_BASE_URL.replace(/\/?$/, '')}/api/chat` : null)
    || `http://127.0.0.1:${process.env.OLLAMA_PORT || '11435'}/api/chat`;
  const resp = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`ollama ${resp.status}: ${text || 'request failed'}`);
  }
  return resp.json();
};

module.exports = { chatOllama };

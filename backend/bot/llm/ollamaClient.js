const MODEL = process.env.LLM_MODEL || 'gaja-bot';
const OLLAMA = process.env.OLLAMA_URL
  || (process.env.OLLAMA_BASE_URL ? process.env.OLLAMA_BASE_URL.replace(/\/?$/, '') : null)
  || `http://127.0.0.1:${process.env.OLLAMA_PORT || '11435'}`;

async function chat(messages, opts = {}) {
  const res = await fetch(`${OLLAMA}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages, stream: false, ...opts }),
  });
  if (!res.ok) throw new Error(`ollama error ${res.status}`);
  return res.json();
}

module.exports = { chat };

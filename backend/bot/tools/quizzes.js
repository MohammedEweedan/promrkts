const current = new Map();

async function quiz_new({ topic = 'candlesticks', level = 1 }) {
  const id = Math.random().toString(36).slice(2);
  const q = {
    id,
    question: `What does a hammer candle indicate?`,
    choices: [
      { id: 'a', text: 'Bullish reversal after a downtrend' },
      { id: 'b', text: 'Bearish continuation' },
      { id: 'c', text: 'No significance' }
    ],
    correctId: 'a',
    topic,
    level
  };
  current.set(id, q);
  return { id: q.id, question: q.question, choices: q.choices };
}

async function quiz_check({ answerId }) {
  let found;
  for (const q of current.values()) { if (q.choices.find(c => c.id === answerId)) { found = q; break; } }
  if (!found) return { correct: false, explanation: 'No quiz in progress.' };
  const correct = found.correctId === answerId;
  return { correct, explanation: correct ? 'Correct. Hammer often signals bullish reversal near support.' : 'Not quite. Hammers suggest buyers stepping in near lows.' };
}

module.exports = { quiz_new, quiz_check };

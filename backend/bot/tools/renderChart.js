const fetch = (...args) => global.fetch(...args);

async function render_chart({ symbol, timeframe = '1h', pattern }) {
  const config = {
    type: 'candlestick',
    data: { datasets: [{ label: `${symbol} ${timeframe}`, data: [] }] },
    options: { plugins: { legend: { display: false } } }
  };
  const resp = await fetch('https://quickchart.io/chart/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chart: config, backgroundColor: 'white', width: 900, height: 500 })
  });
  const data = await resp.json();
  return { imageUrl: data.url, caption: `Candlestick ${symbol} ${timeframe}${pattern ? ' - ' + pattern : ''}` };
}

module.exports = { render_chart };

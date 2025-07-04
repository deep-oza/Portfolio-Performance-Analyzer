const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 5000;

app.get('/api/quote', async (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) return res.status(400).json({ error: 'Symbol is required' });
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`)); 
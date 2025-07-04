/**
 * Utility functions for fetching stock data from Yahoo Finance API via AllOrigins public CORS proxy
 */

// Add a debugging function to log all environment variables
const debugEnvVars = () => {
  console.log('All environment variables starting with REACT_APP_:');
  Object.keys(process.env)
    .filter(key => key.startsWith('REACT_APP_'))
    .forEach(key => {
      console.log(`${key}: ${process.env[key] ? 'Set (value hidden)' : 'Not set'}`);
    });
};

// Call it when the file is loaded
debugEnvVars();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3, delayMs = 500) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(delayMs);
      }
    }
  }
  throw lastError;
}

/**
 * Fetches the latest price data for a given stock symbol using Yahoo Finance chart API via AllOrigins
 * @param {string} symbol - Stock symbol (without .NS suffix)
 * @returns {Promise} - Promise that resolves to the stock data
 */
export const getLTP = async (symbol) => {
  try {
    if (!symbol) throw new Error('Symbol is required');
    const url = `https://api.allorigins.win/raw?url=https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS`;
    const data = await fetchWithRetry(url, 3, 500);

    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      throw new Error('No data found for this symbol or invalid Yahoo Finance response.');
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];
    const timestamps = result.timestamp;

    if (!meta || meta.regularMarketPrice == null || meta.previousClose == null) {
      throw new Error('Missing regular market price or previous close in Yahoo Finance response.');
    }

    const price = meta.regularMarketPrice;
    const previousClose = meta.previousClose;
    const percentChange = ((price - previousClose) / previousClose) * 100;

    return {
      symbol: meta.symbol,
      name: meta.shortName || meta.symbol,
      price,
      previousClose,
      percentChange,
      exchange: meta.exchangeName,
      currency: meta.currency,
      timestamp: timestamps && timestamps.length > 0 ? timestamps[timestamps.length - 1] : null
    };
  } catch (error) {
    console.error('Error fetching stock LTP:', error);
    throw new Error(error.message || 'Failed to fetch stock quote.');
  }
};

/**
 * Batch fetch multiple stock symbols at once using Yahoo Finance chart API via AllOrigins
 * Adds a 500ms delay between requests to avoid rate limiting.
 * Retries up to 3 times per symbol if a request fails.
 * @param {Array} symbols - Array of stock symbols (without .NS suffix)
 * @returns {Promise} - Promise that resolves to an object with symbol keys and data values or error messages
 */
export const batchGetLTP = async (symbols) => {
  if (!symbols || !symbols.length) return {};
  const results = {};
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    try {
      const url = `https://api.allorigins.win/raw?url=https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS`;
      const data = await fetchWithRetry(url, 3, 500);
      if (!data.chart || !data.chart.result || !data.chart.result[0]) {
        results[symbol] = { error: 'No data found or invalid Yahoo Finance response.' };
        continue;
      }
      const result = data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];
      const timestamps = result.timestamp;
      if (!meta || meta.regularMarketPrice == null || meta.previousClose == null) {
        results[symbol] = { error: 'Missing regular market price or previous close in Yahoo Finance response.' };
        continue;
      }
      const price = meta.regularMarketPrice;
      const previousClose = meta.previousClose;
      const percentChange = ((price - previousClose) / previousClose) * 100;
      results[symbol] = {
        symbol: meta.symbol,
        name: meta.shortName || meta.symbol,
        price,
        previousClose,
        percentChange,
        exchange: meta.exchangeName,
        currency: meta.currency,
        timestamp: timestamps && timestamps.length > 0 ? timestamps[timestamps.length - 1] : null
      };
    } catch (error) {
      console.error(`Error fetching LTP for ${symbol}:`, error);
      results[symbol] = { error: error.message || 'Failed to fetch stock quote.' };
    }
    // Add delay between requests
    if (i < symbols.length - 1) {
      await sleep(800);
    }
  }
  return results;
}; 
import { useState, useEffect, useCallback } from 'react';
import { getLTP } from '../utils/stockUtils';

/**
 * Custom hook to fetch and manage stock quote data
 * @param {string} symbol - Stock symbol to fetch data for
 * @param {boolean} autoFetch - Whether to fetch data automatically when symbol changes
 * @returns {Object} Stock data with loading and error states
 */
const useStockQuote = (symbol, autoFetch = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch stock data
  const fetchStockData = useCallback(async () => {
    if (!symbol) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stockData = await getLTP(symbol);
      setData(stockData);
    } catch (err) {
      setError(err.message || 'Failed to fetch stock data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // Fetch data when symbol changes (only if autoFetch is true)
  useEffect(() => {
    if (autoFetch && symbol) {
      fetchStockData();
    }
  }, [symbol, fetchStockData, autoFetch]);

  // Refresh function that can be called manually
  const refresh = useCallback(() => {
    fetchStockData();
  }, [fetchStockData]);

  return {
    data,
    loading,
    error,
    refresh,
    fetchData: fetchStockData
  };
};

export default useStockQuote; 
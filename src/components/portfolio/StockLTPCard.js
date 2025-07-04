import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSync, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import useStockQuote from '../../hooks/useStockQuote';

/**
 * Component to display stock Last Traded Price (LTP) data
 */
const StockLTPCard = () => {
  const [symbol, setSymbol] = useState('');
  const [inputValue, setInputValue] = useState('');
  const { data, loading, error, refresh, fetchData } = useStockQuote(symbol, false); // Disable auto-fetch

  useEffect(() => {
    // Only fetch data when symbol is set initially
    if (symbol) {
      fetchData();
    }
  }, [symbol, fetchData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSymbol(inputValue.trim().toUpperCase());
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleRefresh = () => {
    if (symbol) {
      refresh();
    }
  };

  return (
    <div className="stock-ltp-card">
      <h3>Stock Quote</h3>
      
      <form onSubmit={handleSubmit} className="stock-search-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter stock symbol (e.g. TCS, INFY)"
            value={inputValue}
            onChange={handleInputChange}
            className="form-control"
          />
          <button type="submit" className="btn btn-primary">
            <FontAwesomeIcon icon={faSearch} />
          </button>
          {symbol && (
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleRefresh}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSync} spin={loading} />
            </button>
          )}
        </div>
      </form>

      <div className="quote-result">
        {loading && <div className="loading-spinner">Loading...</div>}
        
        {error && !loading && (
          <div className="error-message">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>{error}</span>
          </div>
        )}
        
        {data && !loading && !error && (
          <div className="quote-data">
            <div className="quote-header">
              <h4>{data.name} ({data.symbol})</h4>
              <span className="exchange-info">{data.exchange} • {data.currency}</span>
            </div>
            
            <div className="quote-price">
              <span className="price">{data.price.toFixed(2)}</span>
              <span className={`percent-change ${data.percentChange >= 0 ? 'positive' : 'negative'}`}>
                {data.percentChange >= 0 ? '+' : ''}{data.percentChange.toFixed(2)}%
              </span>
            </div>
            
            <div className="quote-timestamp">
              Last updated: {new Date(data.timestamp * 1000).toLocaleString()}
            </div>
          </div>
        )}
        
        {!data && !loading && !error && symbol && (
          <div className="no-data-message">
            No data found for {symbol}
          </div>
        )}
        
        {!symbol && !loading && (
          <div className="instructions">
            Enter a stock symbol above to get real-time price data
          </div>
        )}
      </div>
    </div>
  );
};

export default StockLTPCard; 
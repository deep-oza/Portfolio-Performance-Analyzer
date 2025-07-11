import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSync, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import useStockQuote from '../../hooks/useStockQuote';
import './StockLTPCard.css';

/**
 * Component to display stock Last Traded Price (LTP) data
 */
const StockLTPCard = () => {
  const [symbol, setSymbol] = useState('');
  const [inputValue, setInputValue] = useState('');
  const { data, loading, error, refresh, fetchData } = useStockQuote(symbol, false); // Disable auto-fetch
  const [localData, setLocalData] = useState(null);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    // Only fetch data when symbol is set initially
    if (symbol) {
      fetchData().then(() => {
        setLocalData(data);
        setLocalError(error);
      });
    } else {
      setLocalData(null);
      setLocalError(null);
    }
    // eslint-disable-next-line
  }, [symbol]);

  useEffect(() => {
    setLocalData(data);
    setLocalError(error);
  }, [data, error]);

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

  const handleClear = () => {
    setSymbol('');
    setInputValue('');
    setLocalData(null);
    setLocalError(null);
  };

  return (
    <div className="stock-ltp-card" data-tour="stock-ltp-card">
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
            <>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleRefresh}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSync} spin={loading} />
              </button>
              <button
                type="button"
                className="btn btn-danger stock-ltp-clear-btn"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </button>
            </>
          )}
        </div>
      </form>

      <div className="quote-result">
        {loading && <div className="loading-spinner">Loading...</div>}
        
        {localError && !loading && (
          <div className="error-message">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>{localError}</span>
          </div>
        )}
        
        {localData && !loading && !localError && (
          <div className="quote-data">
            <div className="quote-header">
              <h4>{localData.name} ({localData.symbol})</h4>
              <span className="exchange-info">{localData.exchange} • {localData.currency}</span>
            </div>
            
            <div className="quote-price">
              <span className="price">{localData.price.toFixed(2)}</span>
              <span className={`percent-change ${localData.percentChange >= 0 ? 'positive' : 'negative'}`}>
                {localData.percentChange >= 0 ? '+' : ''}{localData.percentChange.toFixed(2)}%
              </span>
            </div>
            
            <div className="quote-timestamp">
              Last updated: {new Date(localData.timestamp * 1000).toLocaleString()}
            </div>
          </div>
        )}
        
        {!localData && !loading && !localError && symbol && (
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
import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faEdit, faTimes, faCheck, faSearch, faSync, faExclamationTriangle, faPlus } from '@fortawesome/free-solid-svg-icons';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import useStockQuote from '../../hooks/useStockQuote';
import './StockFormPortfolioSection.css';

const StockForm = () => {
  const { 
    showAddStockForm, 
    setShowAddStockForm, 
    editingStock, 
    setEditingStock,
    addStock,
    updateStock,
    showError,
    updateCurrentPrice,
    portfolios,
    removeStock,
    theme // <-- Add theme from context
  } = useContext(PortfolioContext);
  
  // Form state
  const [symbol, setSymbol] = useState('');
  const [qty, setQty] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [realizedGain, setRealizedGain] = useState('');
  const [dividend, setDividend] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState({
    symbol: false,
    qty: false,
    avgPrice: false,
    purchaseDate: false
  });
  
  // Add state for price fetch error and manual entry
  const [fetchTried, setFetchTried] = useState(false);
  const [manualPrice, setManualPrice] = useState(false);
  const { data: quoteData, loading: quoteLoading, error: quoteError, fetchData: fetchQuote } = useStockQuote(symbol.trim(), false);
  
  // Portfolio selection state
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [newPortfolio, setNewPortfolio] = useState('');
  const [addNewPortfolio, setAddNewPortfolio] = useState(false);
  
  // Reset form fields
  const resetFormFields = () => {
    setSymbol('');
    setQty('');
    setAvgPrice('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setRealizedGain('');
    setDividend('');
    setErrors({
      symbol: false,
      qty: false,
      avgPrice: false,
      purchaseDate: false
    });
  };
  
  // Initialize form fields when editing
  useEffect(() => {
    if (editingStock) {
      // Find the portfolio containing this stock by matching symbol, purchaseDate, and avgPrice
      let foundPortfolio = '';
      Object.entries(portfolios).forEach(([pid, stocks]) => {
        if (pid !== 'default') {
          const match = stocks.find(
            s => s.symbol === editingStock.stock.symbol &&
                 s.purchaseDate === editingStock.stock.purchaseDate &&
                 s.avgPrice === editingStock.stock.avgPrice
          );
          if (match) {
            foundPortfolio = pid;
          }
        }
      });
      setSelectedPortfolio(foundPortfolio);
      setAddNewPortfolio(false);
      setNewPortfolio('');
    } else {
      // Set default date to today when adding new stock
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      // Default to current selected or first portfolio
      const keys = Object.keys(portfolios).filter(k => k !== 'default');
      if (keys.length > 0) {
        setSelectedPortfolio(keys[0]);
        setAddNewPortfolio(false);
        setNewPortfolio('');
      } else {
        setSelectedPortfolio('');
        setAddNewPortfolio(true);
      }
    }
  }, [editingStock, portfolios]);
  
  // Hide form
  const hideForm = () => {
    setShowAddStockForm(false);
    setEditingStock(null);
    resetFormFields();
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {
      symbol: !symbol.trim(),
      qty: !qty || parseFloat(qty) <= 0,
      avgPrice: !avgPrice || parseFloat(avgPrice) <= 0,
      purchaseDate: !purchaseDate
    };
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(error => error);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    let portfolioId = selectedPortfolio;
    if (addNewPortfolio) {
      if (!newPortfolio.trim()) {
        setErrors(e => ({ ...e, portfolio: true }));
        return;
      }
      portfolioId = newPortfolio.trim();
    }
    const stockData = {
      symbol: symbol.trim().toUpperCase(),
      qty: parseFloat(qty),
      avgPrice: parseFloat(avgPrice),
      purchaseDate,
      realizedGain: realizedGain ? parseFloat(realizedGain) : 0,
      dividend: dividend ? parseFloat(dividend) : 0
    };
    try {
      if (editingStock) {
        // If portfolio changed, move stock
        const oldPortfolioId = editingStock.portfolioId || selectedPortfolio;
        if (portfolioId !== oldPortfolioId) {
          removeStock(editingStock.index, oldPortfolioId);
          addStock(stockData, portfolioId);
        } else {
          updateStock(editingStock.index, stockData);
        }
      } else {
        // Check for duplicate symbols
        addStock(stockData, portfolioId);
      }
      // If quoteData is available and has price, update currentPrices context
      if (quoteData && quoteData.price) {
        updateCurrentPrice(stockData.symbol, Number(quoteData.price));
      }
      hideForm();
    } catch (error) {
      showError(error.message);
    }
  };
  
  // Keyboard handler for Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // Modal close logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && (showAddStockForm || editingStock)) {
        hideForm();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAddStockForm, editingStock]);

  const handleOutsideClick = (e) => {
    if (e.target.id === 'stockFormModal') {
      hideForm();
    }
  };

  // Fetch price when symbol input loses focus
  const handleSymbolBlur = async () => {
    if (symbol.trim()) {
      setFetchTried(true);
      setManualPrice(false);
      await fetchQuote();
    }
  };

  // If error, allow manual price entry
  useEffect(() => {
    if (fetchTried && quoteError) {
      setManualPrice(true);
    }
  }, [quoteError, fetchTried]);

  if (!showAddStockForm && !editingStock) {
    return null;
  }
  
  const isEditing = !!editingStock;

  // Portfolio selector UI
  const portfolioKeys = Object.keys(portfolios).filter(k => k !== 'default');
  const portfolioError = addNewPortfolio && (!newPortfolio.trim() || portfolioKeys.includes(newPortfolio.trim()));
  const isDarkTheme = theme === 'dark'; // <-- Add dark theme detection

  return (
    <div 
      id="stockFormModal" 
      className={`modal-overlay${isDarkTheme ? ' dark' : ''}`} 
      style={{ display: 'flex' }}
      onClick={handleOutsideClick}
      data-tour="stock-form"
    >
      <div className="modal-container" style={{ maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header" style={{ padding: '2rem 2rem 0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="form-title" id="stockFormTitle" style={{ margin: 0 }}>
            <FontAwesomeIcon icon={isEditing ? faEdit : faPlusCircle} />
            {isEditing ? ' Edit Stock' : ' Add New Stock'}
          </h3>
          <button 
            className="modal-close-btn" 
            onClick={hideForm}
            aria-label="Close"
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '2rem' }}>
          {/* Portfolio selector - professional UI */}
          <div className={`portfolio-section-card${isDarkTheme ? ' dark' : ''}`}>
            <div className="portfolio-section-row">
              <label htmlFor="portfolio-select" className="portfolio-section-label">Portfolio</label>
              {portfolioKeys.length > 0 && !addNewPortfolio ? (
                <>
                  <select
                    id="portfolio-select"
                    value={selectedPortfolio}
                    onChange={e => {
                      if (e.target.value === '__add_new__') {
                        setAddNewPortfolio(true);
                        setNewPortfolio('');
                      } else {
                        setSelectedPortfolio(e.target.value);
                      }
                    }}
                    className="portfolio-section-select"
                  >
                    <option value="" disabled>Select portfolio</option>
                    {portfolioKeys.map(id => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="portfolio-section-add-btn"
                    onClick={() => { setAddNewPortfolio(true); setNewPortfolio(''); }}
                    title="Add new portfolio"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    id="portfolio-input"
                    placeholder="New portfolio name"
                    value={newPortfolio}
                    onChange={e => setNewPortfolio(e.target.value)}
                    className={`portfolio-section-input${portfolioError ? ' portfolio-section-input-error' : ''}`}
                    aria-invalid={portfolioError}
                  />
                  {portfolioKeys.length > 0 && (
                    <button type="button" onClick={() => { setAddNewPortfolio(false); setNewPortfolio(''); }} className="portfolio-section-cancel">
                      Cancel
                    </button>
                  )}
                </>
              )}
            </div>
            {portfolioError && (
              <div className="portfolio-section-error">{!newPortfolio.trim() ? 'Portfolio name is required.' : 'Portfolio already exists.'}</div>
            )}
          </div>
          <div className="form-section">
            <h4 className="form-section-title">Stock Information</h4>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label required" htmlFor="newSymbol">Stock Symbol</label>
                <input
                  type="text"
                  id="newSymbol"
                  className={`form-input ${errors.symbol ? 'error' : ''}`}
                  placeholder="e.g. AAPL"
                  value={symbol}
                  onChange={(e) => { setSymbol(e.target.value); setFetchTried(false); setManualPrice(false); }}
                  onBlur={handleSymbolBlur}
                  onKeyPress={handleKeyPress}
                  autoComplete="off"
                />
                {fetchTried && quoteData && quoteData.price && !quoteError && (
                  <div style={{ marginTop: 8, color: '#1976d2', fontWeight: 500, fontSize: '1rem' }}>
                    Current Price (LTP): ₹{Number(quoteData.price).toFixed(2)}
                  </div>
                )}
                {fetchTried && quoteError && (
                  <div className="form-error" style={{ marginTop: 8, color: '#b71c1c', display: 'flex', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: 6 }} />
                    Stock data not available. Enter manual current price later or try proper stock symbol.
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label required" htmlFor="newQty">Quantity</label>
                <input
                  type="number"
                  id="newQty"
                  className={`form-input ${errors.qty ? 'error' : ''}`}
                  placeholder="e.g. 10"
                  min="0"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <div className="form-error">Quantity must be greater than 0</div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4 className="form-section-title">Purchase Details</h4>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label required" htmlFor="newAvgPrice">Average Price</label>
                <input
                  type="number"
                  id="newAvgPrice"
                  className={`form-input ${errors.avgPrice ? 'error' : ''}`}
                  placeholder="e.g. 1000"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={false}
                />
                <div className="form-error">Price must be greater than 0</div>
              </div>
              <div className="form-group">
                <label className="form-label required" htmlFor="newPurchaseDate">Purchase Date</label>
                <input 
                  type="date" 
                  id="newPurchaseDate" 
                  className={`form-input ${errors.purchaseDate ? 'error' : ''}`}
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
                <div className="form-helper">Date when you purchased the stock</div>
                <div className="form-error">Please select a valid date</div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4 className="form-section-title">Performance Metrics (Optional)</h4>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="newRealizedGain">Realized Gain</label>
                <input
                  type="number"
                  id="newRealizedGain"
                  className="form-input"
                  placeholder="e.g. 100.50"
                  step="0.01"
                  value={realizedGain}
                  onChange={(e) => setRealizedGain(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <div className="form-helper">Profits already realized from this stock</div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="newDividend">Dividend</label>
                <input
                  type="number"
                  id="newDividend"
                  className="form-input"
                  placeholder="e.g. 25.75"
                  step="0.01"
                  value={dividend}
                  onChange={(e) => setDividend(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <div className="form-helper">Total dividends received</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ padding: '1.5rem 2rem', borderTop: '1px solid #eee', background: 'var(--bg-card)', position: 'sticky', bottom: 0, zIndex: 2 }}>
          <div className="form-actions" style={{ margin: 0 }}>
            <button className="btn btn-secondary" onClick={hideForm}>
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
            <button className="btn" onClick={handleSubmit} id="saveStockBtn">
              <FontAwesomeIcon icon={faCheck} /> {isEditing ? 'Update Stock' : 'Add Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockForm; 
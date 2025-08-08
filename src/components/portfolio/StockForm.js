import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faEdit, faTimes, faCheck, faSearch, faSync, faExclamationTriangle, faPlus, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import useStockQuote from '../../hooks/useStockQuote';
import './StockForm.css';

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
    theme,
    selectedPortfolioId,
    currentPrices
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
  
  // Add state for manual current price
  const [currentPrice, setCurrentPrice] = useState('');
  
  // Track if user has manually changed the current price
  const [currentPriceTouched, setCurrentPriceTouched] = useState(false);
  
  // Portfolio selection state
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [newPortfolio, setNewPortfolio] = useState('');
  const [addNewPortfolio, setAddNewPortfolio] = useState(false);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form fields
  const resetFormFields = () => {
    setSymbol('');
    setQty('');
    setAvgPrice('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setRealizedGain('');
    setDividend('');
    setCurrentPrice('');
    setErrors({
      symbol: false,
      qty: false,
      avgPrice: false,
      purchaseDate: false
    });
    setFetchTried(false);
    setManualPrice(false);
    setCurrentPriceTouched(false);
    setIsSubmitting(false);
  };
  
  // Initialize form fields when editing
  useEffect(() => {
    if (editingStock) {
      // Pre-fill all form fields with existing stock data
      setSymbol(editingStock.stock.symbol || '');
      setQty(editingStock.stock.qty ? editingStock.stock.qty.toString() : '');
      setAvgPrice(editingStock.stock.avgPrice ? editingStock.stock.avgPrice.toString() : '');
      setPurchaseDate(editingStock.stock.purchaseDate || '');
      setRealizedGain(editingStock.stock.realizedGain ? editingStock.stock.realizedGain.toString() : '');
      setDividend(editingStock.stock.dividend ? editingStock.stock.dividend.toString() : '');
      
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
      
      // Prefill manual price if available in context
      if (editingStock.stock && editingStock.stock.symbol) {
        const symbolKey = editingStock.stock.symbol.trim().toUpperCase();
        if (currentPrices && currentPrices[symbolKey]) {
          setCurrentPrice(currentPrices[symbolKey].toString());
        } else {
          setCurrentPrice('');
        }
      }
      
      // Reset validation errors
      setErrors({
        symbol: false,
        qty: false,
        avgPrice: false,
        purchaseDate: false
      });
    } else {
      // Reset form fields for new stock
      setSymbol('');
      setQty('');
      setAvgPrice('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setRealizedGain('');
      setDividend('');
      setCurrentPrice('');
      
      // Default to current selected portfolio or first portfolio
      const keys = Object.keys(portfolios).filter(k => k !== 'default');
      if (keys.length > 0) {
        // Use the currently selected portfolio from context if it's not 'default'
        if (selectedPortfolioId !== 'default' && portfolios[selectedPortfolioId]) {
          setSelectedPortfolio(selectedPortfolioId);
        } else {
          // Otherwise use the first available portfolio
          setSelectedPortfolio(keys[0]);
        }
        setAddNewPortfolio(false);
        setNewPortfolio('');
      } else {
        setSelectedPortfolio('');
        setAddNewPortfolio(true);
      }
      
      // Reset validation errors
      setErrors({
        symbol: false,
        qty: false,
        avgPrice: false,
        purchaseDate: false
      });
    }
  }, [editingStock, portfolios, selectedPortfolioId, currentPrices]);
  
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
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let portfolioId = selectedPortfolio;
      if (addNewPortfolio) {
        if (!newPortfolio.trim()) {
          setErrors(e => ({ ...e, portfolio: true }));
          setIsSubmitting(false);
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
      } else if (manualPrice && currentPrice) {
        // If manual price entry is active and value is provided
        updateCurrentPrice(stockData.symbol, Number(currentPrice));
      }
      
      hideForm();
    } catch (error) {
      showError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Keyboard handler for Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSubmitting) {
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

  // When quoteData.price changes and user hasn't touched the field, update currentPrice
  useEffect(() => {
    if (fetchTried && quoteData && quoteData.price && !quoteError) {
      setCurrentPrice(quoteData.price.toString());
      setCurrentPriceTouched(false);
    } else if (fetchTried && (!quoteData || !quoteData.price || quoteError)) {
      setCurrentPrice('');
      setCurrentPriceTouched(false);
    }
  }, [fetchTried, quoteData, quoteError, symbol]);

  if (!showAddStockForm && !editingStock) {
    return null;
  }
  
  const isEditing = !!editingStock;

  // Portfolio selector UI
  const portfolioKeys = Object.keys(portfolios).filter(k => k !== 'default');
  const portfolioError = addNewPortfolio && (!newPortfolio.trim() || portfolioKeys.includes(newPortfolio.trim()));
  const isDarkTheme = theme === 'dark';

  return (
    <div
      id="stockFormModal"
      className={`stock-form-modal-overlay${isDarkTheme ? ' dark' : ''}`}
      onClick={handleOutsideClick}
      data-tour="stock-form"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-form-title"
    >
      <div className="stock-form-modal-container" role="document">
        {/* Header */}
        <div className="stock-form-modal-header">
          <h3 id="stock-form-title" className="stock-form-modal-title">
            <FontAwesomeIcon icon={isEditing ? faEdit : faPlusCircle} />
            {isEditing ? ' Edit Stock' : ' Add New Stock'}
          </h3>
          <button
            type="button"
            className="stock-form-modal-close-btn"
            aria-label="Close add or edit stock form"
            onClick={hideForm}
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Portfolio selector - professional UI */}
          <div className={`portfolio-section-card${isDarkTheme ? ' dark' : ''}`}>
            <div className="portfolio-section-header">
              <label className="portfolio-section-label">Select Portfolio</label>
              <div className="portfolio-section-description">
                Choose an existing portfolio or create a new one
              </div>
            </div>
            
            {portfolioKeys.length > 0 && !addNewPortfolio ? (
              <div className="portfolio-selection-container">
                <div className="portfolio-select-group">
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
                    disabled={isSubmitting}
                  >
                    <option value="" disabled>Choose a portfolio...</option>
                    {portfolioKeys.map(id => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                    <option value="__add_new__">➕ Create New Portfolio</option>
                  </select>
                </div>
                
                {selectedPortfolio && (
                  <div className="portfolio-selected-info">
                    <FontAwesomeIcon icon={faCheck} />
                    Selected: <strong>{selectedPortfolio}</strong>
                  </div>
                )}
              </div>
            ) : (
              <div className="portfolio-create-container">
                <div className="portfolio-create-header">
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Create New Portfolio</span>
                </div>
                
                <div className="portfolio-input-group">
                  <input
                    type="text"
                    id="portfolio-input"
                    placeholder="Enter portfolio name (e.g., My Stocks, Long Term)"
                    value={newPortfolio}
                    onChange={e => setNewPortfolio(e.target.value)}
                    className={`portfolio-section-input${portfolioError ? ' portfolio-section-input-error' : ''}`}
                    aria-invalid={portfolioError}
                    disabled={isSubmitting}
                    autoFocus
                  />
                  
                  {portfolioKeys.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => { setAddNewPortfolio(false); setNewPortfolio(''); }} 
                      className="portfolio-section-cancel"
                      disabled={isSubmitting}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      Cancel
                    </button>
                  )}
                </div>
                
                {newPortfolio.trim() && (
                  <div className="portfolio-preview">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    New portfolio: <strong>{newPortfolio.trim()}</strong>
                  </div>
                )}
              </div>
            )}
            
            {portfolioError && (
              <div className="portfolio-section-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                {!newPortfolio.trim() ? 'Portfolio name is required.' : 'Portfolio already exists.'}
              </div>
            )}
            
            {portfolioKeys.length === 0 && !addNewPortfolio && (
              <div className="portfolio-empty-state">
                <FontAwesomeIcon icon={faPlus} />
                <div>No portfolios yet. Create your first portfolio to get started!</div>
                <button
                  type="button"
                  className="portfolio-create-first-btn"
                  onClick={() => { setAddNewPortfolio(true); setNewPortfolio(''); }}
                  disabled={isSubmitting}
                >
                  Create First Portfolio
                </button>
              </div>
            )}
          </div>

          <div className="form-section">
            <h4 className="form-section-title">Stock Information</h4>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label required" htmlFor="newSymbol">Stock Symbol</label>
                <div className="input-group">
                  <input
                    type="text"
                    id="newSymbol"
                    className={`form-input ${errors.symbol ? 'error' : ''}`}
                    placeholder="e.g. RELIANCE, TCS, INFY"
                    value={symbol}
                    onChange={(e) => { setSymbol(e.target.value); setFetchTried(false); setManualPrice(false); }}
                    onBlur={handleSymbolBlur}
                    onKeyPress={handleKeyPress}
                    autoComplete="off"
                    disabled={isSubmitting}
                    autoFocus
                    aria-describedby="symbol-helper"
                  />
                  <button
                    type="button"
                    className={`fetch-quote-btn ${quoteLoading ? 'loading' : ''}`}
                    onClick={async () => { if (symbol.trim()) { setFetchTried(true); setManualPrice(false); await fetchQuote(); } }}
                    disabled={isSubmitting || !symbol.trim()}
                    aria-label="Fetch latest price for symbol"
                    title="Fetch latest price"
                  >
                    <FontAwesomeIcon icon={faSync} spin={quoteLoading} />
                  </button>
                </div>
                <div className="form-helper">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span id="symbol-helper">Stock ticker symbol (e.g., TCS for Tata Consultancy, RELIANCE for Reliance Industries, INFY for Infosys)</span>
                </div>
                {fetchTried && quoteData && quoteData.price && !quoteError && (
                  <div className="stock-form-fetched-price">
                    <FontAwesomeIcon icon={faCheck} />
                    Fetched Price: ₹{Number(quoteData.price).toFixed(2)}
                  </div>
                )}
                {fetchTried && quoteError && (
                  <div className="stock-form-error">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="stock-form-error-icon" />
                    Stock data not available. Enter price manually or try proper stock symbol.
                  </div>
                )}
                {errors.symbol && <div className="form-error">Stock symbol is required</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label required" htmlFor="newQty">Quantity</label>
                <input
                  type="number"
                  id="newQty"
                  className={`form-input ${errors.qty ? 'error' : ''}`}
                  placeholder="e.g. 10"
                  min="0"
                  step="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSubmitting}
                />
                <div className="form-helper">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Number of shares you own
                </div>
                {errors.qty && <div className="form-error">Quantity must be greater than 0</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label required" htmlFor="manualCurrentPrice">Current Price</label>
                <input
                  type="number"
                  id="manualCurrentPrice"
                  className="form-input"
                  placeholder="Enter current price"
                  value={currentPrice}
                  onChange={e => { setCurrentPrice(e.target.value); setCurrentPriceTouched(true); }}
                  min="0"
                  step="0.01"
                  required
                  disabled={isSubmitting}
                />
                <div className="form-helper">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Latest market price per share (auto-fetched when available)
                </div>
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
                  min="0"
                  step="0.01"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSubmitting}
                />
                <div className="form-helper">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Stock Purchase Average Price
                </div>
                {errors.avgPrice && <div className="form-error">Price must be greater than 0</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label required" htmlFor="newPurchaseDate">Purchase Date</label>
                <input 
                  type="date" 
                  id="newPurchaseDate" 
                  className={`form-input ${errors.purchaseDate ? 'error' : ''}`}
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  disabled={isSubmitting}
                />
                <div className="form-helper">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Date when you purchased the shares
                </div>
                {errors.purchaseDate && <div className="form-error">Please select a valid date</div>}
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
                  disabled={isSubmitting}
                />
                <div className="form-helper">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Total profits from selling shares (leave empty if none)
                </div>
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
                  disabled={isSubmitting}
                />
                <div className="form-helper">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Total dividends received from this stock
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="form-actions">
            <button 
              className="btn btn-secondary" 
              onClick={hideForm}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
            <button 
              className={`btn ${isSubmitting ? 'btn-loading' : ''}`} 
              onClick={handleSubmit} 
              id="saveStockBtn"
              disabled={isSubmitting}
            >
              {!isSubmitting && <FontAwesomeIcon icon={faCheck} />}
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Stock' : 'Add Stock')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockForm; 
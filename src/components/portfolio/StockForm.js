import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faEdit, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { PortfolioContext } from '../../contexts/PortfolioContext';

const StockForm = () => {
  const { 
    showAddStockForm, 
    setShowAddStockForm, 
    editingStock, 
    setEditingStock,
    addStock,
    updateStock,
    showError
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
      const stock = editingStock.stock;
      setSymbol(stock.symbol);
      setQty(stock.qty.toString());
      setAvgPrice(stock.avgPrice.toString());
      setPurchaseDate(stock.purchaseDate);
      setRealizedGain(stock.realizedGain ? stock.realizedGain.toString() : '');
      setDividend(stock.dividend ? stock.dividend.toString() : '');
    } else {
      // Set default date to today when adding new stock
      setPurchaseDate(new Date().toISOString().split('T')[0]);
    }
  }, [editingStock]);
  
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
        // Update existing stock
        updateStock(editingStock.index, stockData);
      } else {
        // Check for duplicate symbols
        addStock(stockData);
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

  if (!showAddStockForm && !editingStock) {
    return null;
  }
  
  const isEditing = !!editingStock;

  return (
    <div 
      id="stockFormModal" 
      className="modal-overlay" 
      style={{ display: 'flex' }}
      onClick={handleOutsideClick}
      data-tour="stock-form"
    >
      <div className="modal-container" style={{ maxWidth: 700 }}>
        <div className="modal-content">
          <h3 className="form-title" id="stockFormTitle">
            <FontAwesomeIcon icon={isEditing ? faEdit : faPlusCircle} />
            {isEditing ? ' Edit Stock' : ' Add New Stock'}
          </h3>

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
                  onChange={(e) => setSymbol(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoComplete="off"
                />
                <div className="form-error">Please enter a valid stock symbol</div>
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
                  placeholder="e.g. 150.75"
                  step="0.01"
                  min="0"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  onKeyPress={handleKeyPress}
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

          <div className="form-actions">
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
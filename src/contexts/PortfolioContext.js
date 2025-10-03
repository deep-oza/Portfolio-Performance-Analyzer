import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { batchGetLTP } from '../utils/stockUtils';

// Create context
export const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
  // Main state for multiple portfolios, initialized from localStorage
  const [portfolios, setPortfolios] = useState(() => {
    const stored = localStorage.getItem("portfolios");
    return stored ? JSON.parse(stored) : { default: [] };
  });
  // Track selected portfolio
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(() => {
    const stored = localStorage.getItem("selectedPortfolioId");
    return stored || "default";
  });
  
  // Main state for portfolio data, initialized from localStorage
  const [currentPrices, setCurrentPrices] = useState(() => {
    const stored = localStorage.getItem("currentPrices");
    return stored ? JSON.parse(stored) : {};
  });
  
  // Sorting state
  const [sortState, setSortState] = useState({
    column: "symbol",
    direction: "asc"
  });
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme || "light";
  });
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [performanceFilter, setPerformanceFilter] = useState("all");
  
  // Modal states
  const [showAddStockForm, setShowAddStockForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => {},
    onCancel: () => {},
    showCancel: true
  });
  
  // API data loading state
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [priceError, setPriceError] = useState(null);
  
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  
  // Batch error modal state
  const [batchErrors, setBatchErrors] = useState([]);
  const [showBatchErrorModal, setShowBatchErrorModal] = useState(false);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("portfolios", JSON.stringify(portfolios));
  }, [portfolios]);
  
  useEffect(() => {
    localStorage.setItem("selectedPortfolioId", selectedPortfolioId);
  }, [selectedPortfolioId]);
  
  useEffect(() => {
    localStorage.setItem("currentPrices", JSON.stringify(currentPrices));
  }, [currentPrices]);
  
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);
  
  // Helper to get current portfolio's data
  const portfolioData = selectedPortfolioId === 'default'
    ? Object.entries(portfolios)
        .filter(([id]) => id !== 'default')
        .flatMap(([, stocks]) => stocks)
    : portfolios[selectedPortfolioId] || [];
  
  // Fetch latest stock prices from Yahoo Finance
  const fetchLatestPrices = useCallback(async () => {
    if (!portfolioData.length) return;
    
    // Get unique symbols from portfolio
    const symbols = [...new Set(portfolioData.map(stock => stock.symbol))];
    
    if (!symbols.length) return;
    
    setIsLoadingPrices(true);
    setPriceError(null);
    setBatchErrors([]);
    setShowBatchErrorModal(false);
    
    try {
      // The API key check is now handled in stockUtils.js
      const stockData = await batchGetLTP(symbols);
      
      // Update prices
      const newPrices = { ...currentPrices };
      const failed = [];
      
      // Update portfolioData with latest price for each stock
      setPortfolios(prev => ({
        ...prev,
        [selectedPortfolioId]: (prev[selectedPortfolioId] || []).map(stock => {
          const ltp = stockData[stock.symbol]?.price;
          if (ltp != null) {
            return {
              ...stock,
              currentPrice: Number(ltp).toFixed(2),
            };
          }
          return stock;
        })
      }));
      
      for (const symbol of symbols) {
        if (stockData[symbol]?.price) {
          newPrices[symbol] = Number(stockData[symbol].price).toFixed(2);
        } else if (stockData[symbol]?.error) {
          failed.push({ symbol, error: stockData[symbol].error });
        }
      }
      
      setCurrentPrices(newPrices);
      if (failed.length > 0) {
        setBatchErrors(failed);
        setShowBatchErrorModal(true);
      }
    } catch (error) {
      console.error('Error fetching stock prices:', error);
      setPriceError(error.message || 'Failed to fetch stock prices');
    } finally {
      setIsLoadingPrices(false);
    }
  }, [portfolioData, currentPrices, setPortfolios]);
  
  // Calculate days held
  const calculateDaysHeld = useCallback((purchaseDate) => {
    const purchase = new Date(purchaseDate);
    const today = new Date();
    const diffTime = Math.abs(today - purchase);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);
  
  // Add new stock to selected or specified portfolio
  const addStock = (newStock, portfolioId) => {
    const targetId = portfolioId || selectedPortfolioId;
    setPortfolios(prev => ({
      ...prev,
      [targetId]: [
        ...(prev[targetId] || []),
        { ...newStock, invested: newStock.qty * newStock.avgPrice }
      ]
    }));
  };
  
  // Update existing stock in selected portfolio
  const updateStock = (index, updatedStock) => {
    setPortfolios(prev => {
      const newPortfolio = [...(prev[selectedPortfolioId] || [])];
      newPortfolio[index] = { ...updatedStock, invested: updatedStock.qty * updatedStock.avgPrice };
      return { ...prev, [selectedPortfolioId]: newPortfolio };
    });
  };
  
  // Delete stock from selected portfolio
  const deleteStock = (index) => {
    const stock = portfolioData[index];
    const symbol = stock.symbol;
    setPortfolios(prev => {
      const newPortfolio = (prev[selectedPortfolioId] || []).filter((_, i) => i !== index);
      return { ...prev, [selectedPortfolioId]: newPortfolio };
    });
    setCurrentPrices(prevPrices => {
      const newPrices = { ...prevPrices };
      delete newPrices[symbol];
      return newPrices;
    });
  };
  
  // Update current price
  const updateCurrentPrice = (symbol, price) => {
    setCurrentPrices(prevPrices => ({
      ...prevPrices,
      [symbol]: price
    }));
  };
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
  };
  
  // Import CSV into selected or specified portfolio
  const importCSV = (data, portfolioId) => {
    const targetId = portfolioId || selectedPortfolioId;
    setPortfolios(prev => ({
      ...prev,
      [targetId]: data.portfolio
    }));
    setCurrentPrices(data.prices);
  };
  
  // Clear selected portfolio
  const clearPortfolio = () => {
    setPortfolios(prev => ({ ...prev, [selectedPortfolioId]: [] }));
    setCurrentPrices({});
  };
  
  // Portfolio management functions
  const createPortfolio = (id) => {
    if (!id || portfolios[id]) return;
    setPortfolios(prev => ({ ...prev, [id]: [] }));
    setSelectedPortfolioId(id);
  };
  const deletePortfolio = (id) => {
    if (id === "default") return; // Don't delete default
    setPortfolios(prev => {
      const newPortfolios = { ...prev };
      delete newPortfolios[id];
      return newPortfolios;
    });
    if (selectedPortfolioId === id) setSelectedPortfolioId("default");
  };
  const switchPortfolio = (id) => {
    if (portfolios[id]) setSelectedPortfolioId(id);
  };
  
  // Show modal
  const showModal = (config) => {
    setModalConfig({
      visible: true,
      title: "Confirm Action",
      message: "Are you sure you want to proceed?",
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: () => {},
      onCancel: () => {},
      showCancel: true,
      ...config
    });
  };
  
  // Hide modal
  const hideModal = () => {
    setModalConfig(prev => ({ ...prev, visible: false }));
  };
  
  // Show message (uses modal with just OK button)
  const showMessage = (title, message, onClose) => {
    showModal({
      title: title || "Information",
      message,
      confirmText: "OK",
      showCancel: false,
      onConfirm: onClose || hideModal,
    });
  };
  
  // Show error (uses modal with error styling)
  const showError = (message, onClose) => {
    showModal({
      title: "Error",
      message,
      confirmText: "OK",
      showCancel: false,
      confirmButtonClass: "btn-danger",
      onConfirm: onClose || hideModal,
    });
  };
  
  // Calculate summary values
  const calculateSummary = useCallback(() => {
    let totalInvested = 0;
    let currentValue = 0;
    let sumWeightedCagr = 0;
    let sumInvestedWithPrice = 0;
    
    portfolioData.forEach((stock) => {
      const symbol = stock.symbol;
      const invested = stock.invested || 0;
      totalInvested += invested;
      
      const price = parseFloat(currentPrices[symbol]);
      if (price && price > 0) {
        const currentVal = stock.qty * price;
        currentValue += currentVal;
        
        const daysHeld = calculateDaysHeld(stock.purchaseDate);
        const years = daysHeld / 365.25;
        if (years >= 1 && invested > 0 && currentVal > 0) {
          try {
            const cagr = (Math.pow(currentVal / invested, 1 / years) - 1) * 100;
            if (isFinite(cagr) && !isNaN(cagr) && cagr > -100 && cagr < 200) {
              sumWeightedCagr += invested * cagr;
              sumInvestedWithPrice += invested;
            }
          } catch (e) {
            console.error("Summary CAGR calculation error:", e);
          }
        }
      }
    });
    
    const totalGainLoss = currentValue - totalInvested;
    
    let overallReturn = 0;
    if (totalInvested > 0) {
      overallReturn = (totalGainLoss / totalInvested) * 100;
      overallReturn = Math.max(Math.min(overallReturn, 999999), -99.99);
    }
    
    let weightedAvgCagr = 0;
    if (sumInvestedWithPrice > 0) {
      weightedAvgCagr = sumWeightedCagr / sumInvestedWithPrice;
      weightedAvgCagr = Math.max(Math.min(weightedAvgCagr, 999999), -99.99);
    }
    
    return {
      totalInvested,
      currentValue,
      totalGainLoss,
      overallReturn,
      weightedAvgCagr
    };
  }, [portfolioData, currentPrices, calculateDaysHeld]);
  
  // Remove stock from a specified portfolio
  const removeStock = (index, portfolioId) => {
    setPortfolios(prev => {
      const newPortfolio = (prev[portfolioId] || []).filter((_, i) => i !== index);
      return { ...prev, [portfolioId]: newPortfolio };
    });
  };
  
  return (
    <PortfolioContext.Provider value={{
      portfolios,
      selectedPortfolioId,
      setSelectedPortfolioId,
      createPortfolio,
      deletePortfolio,
      switchPortfolio,
      portfolioData,
      currentPrices,
      sortState,
      theme,
      searchTerm,
      performanceFilter,
      showAddStockForm,
      editingStock,
      modalConfig,
      helpModalVisible,
      isLoadingPrices,
      priceError,
      batchErrors,
      showBatchErrorModal,
      setShowBatchErrorModal,
      setBatchErrors,
      setSortState,
      setSearchTerm,
      setPerformanceFilter,
      setShowAddStockForm,
      setEditingStock,
      setHelpModalVisible,
      addStock,
      updateStock,
      deleteStock,
      updateCurrentPrice,
      toggleTheme,
      importCSV,
      clearPortfolio,
      showModal,
      hideModal,
      showMessage,
      showError,
      calculateSummary,
      calculateDaysHeld,
      fetchLatestPrices,
      removeStock,
      setPortfolios
    }}>
      {children}
      {/* Batch error modal */}
      {showBatchErrorModal && batchErrors.length > 0 && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Failed to Load Data</h3>
            <ul>
              {batchErrors.map(({ symbol, error }) => {
                // Try to find the stock name from portfolioData
                const stock = portfolioData.find(s => s.symbol === symbol);
                const name = stock && stock.name ? stock.name : '';
                let userMessage = error;
                if (typeof error === 'string' && error.includes('No data found')) {
                  userMessage = `No data found for ${symbol}${name ? ` (${name})` : ''}. Enter the current price manually or change to a proper stock symbol.`;
                }
                return (
                  <li key={symbol}>
                    <strong>{symbol}{name ? ` (${name})` : ''}:</strong> {userMessage}
                  </li>
                );
              })}
            </ul>
            <button onClick={() => setShowBatchErrorModal(false)}>Close</button>
          </div>
        </div>
      )}
    </PortfolioContext.Provider>
  );
};

export default PortfolioContext; 
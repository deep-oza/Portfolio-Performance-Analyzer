import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';

// Create context
export const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
  // Main state for portfolio data, initialized from localStorage
  const [portfolioData, setPortfolioData] = useState(() => {
    const stored = localStorage.getItem("portfolioData");
    return stored ? JSON.parse(stored) : [];
  });
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
  const [theme, setTheme] = useState("light");
  
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
  
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("portfolioData", JSON.stringify(portfolioData));
  }, [portfolioData]);
  
  useEffect(() => {
    localStorage.setItem("currentPrices", JSON.stringify(currentPrices));
  }, [currentPrices]);
  
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);
  
  useEffect(() => {
    // First-time user onboarding
    const onboardingKey = 'portfolioOnboardingShown';
    if (!localStorage.getItem(onboardingKey)) {
      setHelpModalVisible(true);
      localStorage.setItem(onboardingKey, 'true');
    }
  }, []);
  
  // Calculate days held
  const calculateDaysHeld = useCallback((purchaseDate) => {
    const purchase = new Date(purchaseDate);
    const today = new Date();
    const diffTime = Math.abs(today - purchase);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);
  
  // Add new stock
  const addStock = (newStock) => {
    setPortfolioData(prevData => [...prevData, {
      ...newStock,
      invested: newStock.qty * newStock.avgPrice
    }]);
  };
  
  // Update existing stock
  const updateStock = (index, updatedStock) => {
    setPortfolioData(prevData => {
      const newData = [...prevData];
      newData[index] = {
        ...updatedStock,
        invested: updatedStock.qty * updatedStock.avgPrice
      };
      return newData;
    });
  };
  
  // Delete stock
  const deleteStock = (index) => {
    const stock = portfolioData[index];
    const symbol = stock.symbol;
    
    setPortfolioData(prevData => prevData.filter((_, i) => i !== index));
    
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
  
  // Import CSV
  const importCSV = (data) => {
    setPortfolioData(data.portfolio);
    setCurrentPrices(data.prices);
  };
  
  // Clear portfolio
  const clearPortfolio = () => {
    setPortfolioData([]);
    setCurrentPrices({});
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
        if (years > 0 && invested > 0 && currentVal > 0) {
          try {
            const cagr = (Math.pow(currentVal / invested, 1 / years) - 1) * 100;
            if (isFinite(cagr) && !isNaN(cagr) && cagr > -100 && cagr < 1000000) {
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
  
  return (
    <PortfolioContext.Provider value={{
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
      calculateDaysHeld,
      calculateSummary
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export default PortfolioContext; 
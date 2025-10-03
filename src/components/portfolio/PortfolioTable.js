import React, { useContext, useMemo, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import AnalyticsDashboard from './AnalyticsDashboard';
import './PortfolioTable.css';

const DEFAULT_COLUMNS = [
  { key: 'symbol', label: 'Stock Name' },
  { key: 'qty', label: 'Quantity' },
  { key: 'avgPrice', label: 'Buy Price' },
  { key: 'currentPrice', label: 'Current Price' },
  { key: 'invested', label: 'Total Invested' },
  { key: 'currentValue', label: 'Current Value' },
  { key: 'unrealizedGL', label: 'Gain/Loss' },
  { key: 'returnPercent', label: '% Return' },
  { key: 'cagr', label: 'CAGR' },
  // Keep legacy/extra columns to avoid breaking persisted preferences
  { key: 'purchaseDate', label: 'Purchase Date' },
  { key: 'totalReturnMerged', label: 'Total Return' },
  { key: 'realizedGain', label: 'Realized Gain' },
  { key: 'dividend', label: 'Dividend' },
  { key: 'daysHeld', label: 'Days Held' },
];

const COLUMN_STORAGE_KEY = 'portfolioTableColumns';

const PortfolioTable = ({
  showAnalytics,
  setShowAnalytics,
  showColumnDropdown,
  setShowColumnDropdown,
  handleToggleColumn,
  visibleColumns,
  setVisibleColumns
}) => {
  const { 
    portfolioData, // now only the selected portfolio's stocks
    currentPrices, 
    sortState,
    setSortState,
    updateCurrentPrice,
    calculateDaysHeld,
    setEditingStock,
    showModal,
    showMessage,
    showError,
    searchTerm,
    performanceFilter,
    deleteStock,
    updateStock,
    removeStock,
    portfolios,
    selectedPortfolioId
  } = useContext(PortfolioContext);
  
  // Bulk selection state
  const [selectedRows, setSelectedRows] = useState([]);
  // Removed unused bulk edit queue

  // Column customization state
  const [editingCell, setEditingCell] = useState({ row: null, col: null, value: '' });

  // Drag-and-drop for column reordering (handlers removed as unused)

  useEffect(() => {
    localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Sort the portfolio data based on current sort state
  const sortedData = useMemo(() => {
    if (!portfolioData || portfolioData.length === 0) return [];
    
    const { column, direction } = sortState;
    
    return [...portfolioData].sort((a, b) => {
      let valueA, valueB;
      
      // Handle different column types
      switch (column) {
        case "symbol":
          valueA = a.symbol.toUpperCase();
          valueB = b.symbol.toUpperCase();
          break;

        case "qty":
          valueA = a.qty;
          valueB = b.qty;
          break;

        case "avgPrice":
          valueA = a.avgPrice;
          valueB = b.avgPrice;
          break;

        case "invested":
          valueA = a.invested;
          valueB = b.invested;
          break;

        case "purchaseDate":
          valueA = new Date(a.purchaseDate || "1900-01-01").getTime();
          valueB = new Date(b.purchaseDate || "1900-01-01").getTime();
          break;

        case "currentPrice":
          valueA = parseFloat(currentPrices[a.symbol]) || 0;
          valueB = parseFloat(currentPrices[b.symbol]) || 0;
          break;

        case "currentValue":
          valueA = a.qty * (parseFloat(currentPrices[a.symbol]) || 0);
          valueB = b.qty * (parseFloat(currentPrices[b.symbol]) || 0);
          break;

        case "unrealizedGL":
          valueA = a.qty * (parseFloat(currentPrices[a.symbol]) || 0) - a.invested;
          valueB = b.qty * (parseFloat(currentPrices[b.symbol]) || 0) - b.invested;
          break;

        case "returnPercent":
          {
            const priceA = parseFloat(currentPrices[a.symbol]) || 0;
            const priceB = parseFloat(currentPrices[b.symbol]) || 0;
            const currValA = a.qty * priceA;
            const currValB = b.qty * priceB;
            const investedA = a.invested || (a.qty * a.avgPrice) || 0;
            const investedB = b.invested || (b.qty * b.avgPrice) || 0;
            const rpA = investedA > 0 && priceA > 0 ? ((currValA - investedA) / investedA) * 100 : -Infinity;
            const rpB = investedB > 0 && priceB > 0 ? ((currValB - investedB) / investedB) * 100 : -Infinity;
            valueA = Math.max(Math.min(rpA, 999999), -99.99);
            valueB = Math.max(Math.min(rpB, 999999), -99.99);
          }
          break;

        case "totalReturnMerged":
          const unrGainA = a.qty * (parseFloat(currentPrices[a.symbol]) || 0) - a.invested;
          const unrGainB = b.qty * (parseFloat(currentPrices[b.symbol]) || 0) - b.invested;
          // Precomputed current values are not needed further; removing unused variables
          valueA = unrGainA + (a.realizedGain || 0) + (a.dividend || 0);
          valueB = unrGainB + (b.realizedGain || 0) + (b.dividend || 0);
          break;

        case "realizedGain":
          valueA = a.realizedGain || 0;
          valueB = b.realizedGain || 0;
          break;

        case "dividend":
          valueA = a.dividend || 0;
          valueB = b.dividend || 0;
          break;

        case "cagr":
          const priceA = parseFloat(currentPrices[a.symbol]) || 0;
          const priceB = parseFloat(currentPrices[b.symbol]) || 0;
          const daysA = calculateDaysHeld(a.purchaseDate);
          const daysB = calculateDaysHeld(b.purchaseDate);
          const yearsA = daysA / 365.25;
          const yearsB = daysB / 365.25;
          const currValueA = a.qty * priceA;
          const currValueB = b.qty * priceB;

          try {
            // Safe CAGR calculation for sorting stock A (including dividends and realized gains)
            if (yearsA >= 1 && a.invested > 0 && currValueA > 0) {
              const totalReturnA = currValueA + (a.dividend || 0) + (a.realizedGain || 0);
              valueA = (Math.pow(totalReturnA / a.invested, 1 / yearsA) - 1) * 100;
              // Apply bounds to prevent extreme values
              if (!isFinite(valueA) || isNaN(valueA)) {
                valueA = -Infinity;
              } else {
                valueA = Math.max(Math.min(valueA, 999999), -99.99);
              }
            } else {
              valueA = -Infinity;
            }

            // Safe CAGR calculation for sorting stock B (including dividends and realized gains)
            if (yearsB >= 1 && b.invested > 0 && currValueB > 0) {
              const totalReturnB = currValueB + (b.dividend || 0) + (b.realizedGain || 0);
              valueB = (Math.pow(totalReturnB / b.invested, 1 / yearsB) - 1) * 100;
              // Apply bounds to prevent extreme values
              if (!isFinite(valueB) || isNaN(valueB)) {
                valueB = -Infinity;
              } else {
                valueB = Math.max(Math.min(valueB, 999999), -99.99);
              }
            } else {
              valueB = -Infinity;
            }
          } catch (e) {
            console.error("Error calculating CAGR for sorting:", e);
            valueA = -Infinity;
            valueB = -Infinity;
          }
          break;

        case "daysHeld":
          valueA = calculateDaysHeld(a.purchaseDate);
          valueB = calculateDaysHeld(b.purchaseDate);
          break;

        default:
          valueA = a[column] || 0;
          valueB = b[column] || 0;
      }

      // Handle null or undefined values
      if (valueA === null || valueA === undefined)
        valueA = direction === "asc" ? -Infinity : Infinity;
      if (valueB === null || valueB === undefined)
        valueB = direction === "asc" ? -Infinity : Infinity;

      // Compare based on direction
      if (direction === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  }, [portfolioData, currentPrices, sortState, calculateDaysHeld]);
  
  // Apply search and filter
  const filteredData = useMemo(() => {
    if (!sortedData || sortedData.length === 0) return [];
    
    return sortedData.filter(stock => {
      // Search filter
      const matchesSearch = searchTerm 
        ? stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      // Performance filter
      let matchesPerformance = true;
      
      if (performanceFilter !== 'all') {
        const price = parseFloat(currentPrices[stock.symbol]) || 0;
        if (price > 0) {
          const unrealizedGL = stock.qty * price - stock.invested;
          const isGainer = unrealizedGL >= 0;
          
          if (performanceFilter === 'gainers') {
            matchesPerformance = isGainer;
          } else if (performanceFilter === 'losers') {
            matchesPerformance = !isGainer;
          }
        }
      }
      
      return matchesSearch && matchesPerformance;
    });
  }, [sortedData, searchTerm, performanceFilter, currentPrices]);
  
  // Handle column header click for sorting
  const handleSort = (column) => {
    setSortState(prevState => {
      if (prevState.column === column) {
        return {
          ...prevState,
          direction: prevState.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        return {
          column,
          direction: 'asc'
        };
      }
    });
  };
  
  // Handle current price change
  const handlePriceChange = (e, symbol) => {
    const price = e.target.value;
    updateCurrentPrice(symbol, price ? parseFloat(price) : null);
  };
  
  // Calculate metrics for a stock
  const calculateRowMetrics = (stock) => {
    const symbol = stock.symbol;
    const currentPrice = parseFloat(currentPrices[symbol]);
    
    if (!currentPrice || currentPrice <= 0) {
      return {
        currentValue: null,
        unrealizedGL: null,
        totalReturn: null,
        returnPercent: null,
        cagr: null
      };
    }
    
    const currentValue = stock.qty * currentPrice;
    const unrealizedGL = currentValue - stock.invested;
    const totalReturn = unrealizedGL + (stock.realizedGain || 0) + (stock.dividend || 0);
    const daysHeld = calculateDaysHeld(stock.purchaseDate);
    const years = daysHeld / 365.25;
    
    // Calculate return percentage with validation
    let returnPercent = 0;
    if (stock.invested > 0) {
      returnPercent = (unrealizedGL / stock.invested) * 100;
      // Cap return percentage at reasonable bounds
      returnPercent = Math.max(Math.min(returnPercent, 999999), -99.99);
    }
    
    // Calculate CAGR with validation (including dividends and realized gains)
    let cagr = 0;
    if (years >= 1 && stock.invested > 0 && currentValue > 0) {
      try {
        // Include dividends and realized gains in total return
        const totalReturn = currentValue + (stock.dividend || 0) + (stock.realizedGain || 0);
        cagr = (Math.pow(totalReturn / stock.invested, 1 / years) - 1) * 100;
        
        // Apply reasonable bounds to CAGR
        if (!isFinite(cagr) || isNaN(cagr)) {
          cagr = 0;
        } else {
          cagr = Math.max(Math.min(cagr, 999999), -99.99);
        }
      } catch (e) {
        console.error("CAGR calculation error:", e);
        cagr = 0;
      }
    }
    
    return {
      currentValue,
      unrealizedGL,
      totalReturn,
      returnPercent,
      cagr
    };
  };
  
  // Handle edit stock click
  const editStock = (index) => {
    setEditingStock({
      index,
      stock: portfolioData[index]
    });
  };
  
  // Handle delete stock click
  const handleDeleteStock = (index) => {
    const stock = portfolioData[index];
    const symbol = stock.symbol;
    // Helper to locate the stock's original portfolio and index
    const findStockLocation = (targetStock) => {
      for (const [pid, stocks] of Object.entries(portfolios)) {
        if (pid === 'default') continue;
        const idx = (stocks || []).findIndex(s => 
          s.symbol === targetStock.symbol &&
          s.purchaseDate === targetStock.purchaseDate &&
          s.avgPrice === targetStock.avgPrice
        );
        if (idx !== -1) return { portfolioId: pid, index: idx };
      }
      return { portfolioId: selectedPortfolioId, index };
    };
    
    showModal({
      title: "Delete Stock",
      message: `Are you sure you want to delete ${symbol} from your portfolio?`,
      confirmText: "Delete",
      onConfirm: () => {
        try {
          const { portfolioId, index: idxInPortfolio } = findStockLocation(stock);
          if (portfolioId && portfolioId !== 'default') {
            removeStock(idxInPortfolio, portfolioId);
          } else {
            deleteStock(index);
          }
          
          showMessage(
            "Success",
            `${symbol} has been removed from your portfolio.`
          );
        } catch (error) {
          console.error("Error deleting stock:", error);
          showError(
            "An error occurred while deleting the stock. Please try again."
          );
        }
      }
    });
  };
  
  // Get sort class for a column
  const getSortClass = (column) => {
    if (sortState.column === column) {
      return sortState.direction === 'asc' ? 'sortable sort-asc sorted' : 'sortable sort-desc sorted';
    }
    return 'sortable';
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };
  
  // Format percent
  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Select all handler
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredData.map(stock => stock.symbol));
    } else {
      setSelectedRows([]);
    }
  };

  // Select one handler
  const handleSelectRow = (symbol) => {
    setSelectedRows(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  // Bulk delete handler
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    showModal({
      title: 'Delete Selected Stocks',
      message: `Are you sure you want to delete ${selectedRows.length} selected stock(s) from your portfolio?`,
      confirmText: 'Delete',
      onConfirm: () => {
        // Build list of concrete locations across portfolios
        const locations = portfolioData
          .map((stock, idx) => ({ stock, idx }))
          .filter(item => selectedRows.includes(item.stock.symbol))
          .map(({ stock, idx }) => {
            // Find exact portfolio and index
            for (const [pid, stocks] of Object.entries(portfolios)) {
              if (pid === 'default') continue;
              const foundIdx = (stocks || []).findIndex(s => 
                s.symbol === stock.symbol &&
                s.purchaseDate === stock.purchaseDate &&
                s.avgPrice === stock.avgPrice
              );
              if (foundIdx !== -1) return { portfolioId: pid, index: foundIdx };
            }
            return { portfolioId: selectedPortfolioId, index: idx };
          });
        // Delete in reverse order per portfolio to keep indices stable
        const grouped = locations.reduce((acc, loc) => {
          const key = loc.portfolioId || 'default';
          acc[key] = acc[key] || [];
          acc[key].push(loc.index);
          return acc;
        }, {});
        Object.entries(grouped).forEach(([pid, indices]) => {
          indices.sort((a, b) => b - a).forEach(i => {
            if (pid !== 'default') {
              removeStock(i, pid);
            } else {
              deleteStock(i);
            }
          });
        });
        setSelectedRows([]);
        showMessage('Success', 'Selected stocks have been deleted.');
      }
    });
  };

  // Removed unused bulk edit handler and related effect
  
  const startEditCell = (rowIdx, colKey, initialValue) => {
    setEditingCell({ row: rowIdx, col: colKey, value: initialValue });
  };

  const handleEditInputChange = (e) => {
    setEditingCell(editing => ({ ...editing, value: e.target.value }));
  };

  const saveEditCell = (rowIdx, colKey) => {
    if (editingCell.row !== rowIdx || editingCell.col !== colKey) return;
    const updatedStock = { ...portfolioData[rowIdx] };
    let val = editingCell.value;
    if (colKey === 'qty' || colKey === 'avgPrice' || colKey === 'realizedGain' || colKey === 'dividend') {
      val = parseFloat(val) || 0;
    }
    updatedStock[colKey] = val;
    if (colKey === 'qty' || colKey === 'avgPrice') {
      updatedStock.invested = updatedStock.qty * updatedStock.avgPrice;
    }
    if (typeof updateStock === 'function') {
      updateStock(rowIdx, updatedStock);
    }
    setEditingCell({ row: null, col: null, value: '' });
  };

  const handleEditInputBlur = (rowIdx, colKey) => {
    saveEditCell(rowIdx, colKey);
  };

  const handleEditInputKeyDown = (e, rowIdx, colKey) => {
    if (e.key === 'Enter') {
      saveEditCell(rowIdx, colKey);
    } else if (e.key === 'Escape') {
      setEditingCell({ row: null, col: null, value: '' });
    }
  };
  
  // Calculate summary for the displayed (filtered) data
  const displayedSummary = useMemo(() => {
    let totalInvested = 0;
    let currentValue = 0;
    let totalGainLoss = 0;
    let sumWeightedCagr = 0;
    let sumInvestedWithPrice = 0;
    let totalQuantity = 0;

    filteredData.forEach((stock) => {
      const symbol = stock.symbol;
      const invested = stock.invested || (stock.qty * stock.avgPrice) || 0;
      totalInvested += invested;
      totalQuantity += stock.qty || 0;

      const price = parseFloat(currentPrices[symbol]);
      if (price && price > 0) {
        const currVal = stock.qty * price;
        currentValue += currVal;
        const gl = currVal - invested;
        totalGainLoss += gl;

        const daysHeld = calculateDaysHeld(stock.purchaseDate);
        const years = daysHeld / 365.25;
        if (years >= 1 && invested > 0 && currVal > 0) {
          try {
            const totalReturn = currVal + (stock.dividend || 0) + (stock.realizedGain || 0);
            const cagr = (Math.pow(totalReturn / invested, 1 / years) - 1) * 100;
            if (isFinite(cagr) && !isNaN(cagr) && cagr > -100 && cagr < 200) {
              sumWeightedCagr += invested * cagr;
              sumInvestedWithPrice += invested;
            }
          } catch (e) {
            // ignore
          }
        }
      }
    });

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
      weightedAvgCagr,
      totalQuantity
    };
  }, [filteredData, currentPrices, calculateDaysHeld]);
  
  // If no data, return message
  if (!portfolioData || portfolioData.length === 0) {
    return (
      <div className="table-container">
        <table id="portfolioTable" aria-label="Portfolio table">
          <caption className="sr-only">Portfolio positions</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky-col select-col">Select</th>
              <th scope="col" className="sortable">Stock Name</th>
              <th scope="col" className="sortable numeric">Quantity</th>
              <th scope="col" className="sortable numeric">Buy Price</th>
              <th scope="col" className="sortable numeric">Total Invested</th>
              <th scope="col" className="sortable">Purchase Date</th>
              <th scope="col" className="sortable numeric">Current Price</th>
              <th scope="col" className="sortable numeric">Current Value</th>
              <th scope="col" className="sortable numeric">Gain/Loss</th>
              <th scope="col" className="sortable numeric">% Return</th>
              <th scope="col" className="sortable numeric">CAGR</th>
              <th scope="col" className="action-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="12" className="empty-state-cell">No stocks in portfolio. Add a stock to get started.</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  // If filtered data is empty, show no results message
  if (filteredData.length === 0) {
    return (
      <div className="table-container">
        <table id="portfolioTable" aria-label="Portfolio table">
          <caption className="sr-only">Portfolio positions</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky-col select-col">Select</th>
              <th scope="col" className="sortable">Stock Name</th>
              <th scope="col" className="sortable numeric">Quantity</th>
              <th scope="col" className="sortable numeric">Buy Price</th>
              <th scope="col" className="sortable numeric">Total Invested</th>
              <th scope="col" className="sortable">Purchase Date</th>
              <th scope="col" className="sortable numeric">Current Price</th>
              <th scope="col" className="sortable numeric">Current Value</th>
              <th scope="col" className="sortable numeric">Gain/Loss</th>
              <th scope="col" className="sortable numeric">% Return</th>
              <th scope="col" className="sortable numeric">CAGR</th>
              <th scope="col" className="action-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr id="noResultsRow">
              <td colSpan="12" className="empty-state-cell">No matching stocks found</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  
  
  return (
    <>
      {showAnalytics && portfolioData.length > 0 && (
        <AnalyticsDashboard
          portfolioData={portfolioData}
          currentPrices={currentPrices}
          onClose={() => setShowAnalytics(false)}
        />
      )}
      
      <div className="portfolio-table-container" data-tour="portfolio-table">
        <div className="portfolio-table-toolbar" aria-live="polite">
          {selectedRows.length > 0 && (
            <div className="selection-actions">
              <button className="btn btn-danger" onClick={handleBulkDelete}>
                Delete Selected
              </button>
              <span className="selection-count">{selectedRows.length} selected</span>
            </div>
          )}
        </div>
        <div className="table-container">
          <table id="portfolioTable" aria-label="Portfolio table">
            <caption className="sr-only">Portfolio positions</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky-col select-col">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Select all stocks"
                    tabIndex={0}
                  />
                </th>
                {visibleColumns.map(colKey => {
                  const col = DEFAULT_COLUMNS.find(c => c.key === colKey);
                  if (!col) return null;
                  return (
                    <th
                      key={col.key}
                      className={`${getSortClass(col.key)} ${['qty','avgPrice','invested','currentPrice','currentValue','unrealizedGL','returnPercent','cagr','realizedGain','dividend','daysHeld'].includes(col.key) ? 'numeric' : ''}`}
                      onClick={() => handleSort(col.key)}
                      aria-sort={sortState.column === col.key ? (sortState.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      {col.label}
                    </th>
                  );
                })}
                <th scope="col" className="action-col">Actions</th>
              </tr>
            </thead>
            <tbody id="portfolioBody">
              {filteredData.map((stock, index) => {
                const originalIndex = portfolioData.indexOf(stock);
                const symbol = stock.symbol;
                const metrics = calculateRowMetrics(stock);
                return (
                  <tr key={symbol}>
                    <td className="sticky-col select-col">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(symbol)}
                        onChange={() => handleSelectRow(symbol)}
                        aria-label={`Select ${symbol}`}
                        tabIndex={0}
                      />
                    </td>
                    {visibleColumns.map(colKey => {
                      switch (colKey) {
                        case 'symbol':
                          return (
                            <td key="symbol" className="stock-symbol" title={symbol}>
                              <FontAwesomeIcon icon={faChartLine} /> {symbol}
                            </td>
                          );
                        case 'qty':
                          return (
                            <td key="qty" className="numeric" onClick={() => startEditCell(originalIndex, 'qty', stock.qty)} tabIndex={0} aria-label="Edit quantity" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') startEditCell(originalIndex, 'qty', stock.qty); }}>
                              {editingCell.row === originalIndex && editingCell.col === 'qty' ? (
                                <input
                                  type="number"
                                  value={editingCell.value}
                                  autoFocus
                                  onChange={handleEditInputChange}
                                  onBlur={() => handleEditInputBlur(originalIndex, 'qty')}
                                  onKeyDown={e => handleEditInputKeyDown(e, originalIndex, 'qty')}
                                  className="table-edit-input table-edit-input-qty"
                                />
                              ) : (
                                stock.qty.toLocaleString()
                              )}
                            </td>
                          );
                        case 'avgPrice':
                          return (
                            <td key="avgPrice" className="numeric" onClick={() => startEditCell(originalIndex, 'avgPrice', stock.avgPrice)} tabIndex={0} aria-label="Edit average price" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') startEditCell(originalIndex, 'avgPrice', stock.avgPrice); }}>
                              {editingCell.row === originalIndex && editingCell.col === 'avgPrice' ? (
                                <input
                                  type="number"
                                  value={editingCell.value}
                                  autoFocus
                                  onChange={handleEditInputChange}
                                  onBlur={() => handleEditInputBlur(originalIndex, 'avgPrice')}
                                  onKeyDown={e => handleEditInputKeyDown(e, originalIndex, 'avgPrice')}
                                  className="table-edit-input table-edit-input-avgPrice"
                                />
                              ) : (
                                `₹${stock.avgPrice.toFixed(2)}`
                              )}
                            </td>
                          );
                        case 'invested':
                          return (
                            <td key="invested" className="numeric">₹{stock.invested.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                          );
                        case 'purchaseDate':
                          return (
                            <td key="purchaseDate" onClick={() => startEditCell(originalIndex, 'purchaseDate', stock.purchaseDate)} tabIndex={0} aria-label="Edit purchase date" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') startEditCell(originalIndex, 'purchaseDate', stock.purchaseDate); }}>
                              {editingCell.row === originalIndex && editingCell.col === 'purchaseDate' ? (
                                <input
                                  type="date"
                                  value={editingCell.value}
                                  autoFocus
                                  onChange={handleEditInputChange}
                                  onBlur={() => handleEditInputBlur(originalIndex, 'purchaseDate')}
                                  onKeyDown={e => handleEditInputKeyDown(e, originalIndex, 'purchaseDate')}
                                  className="table-edit-input table-edit-input-purchaseDate"
                                />
                              ) : (
                                stock.purchaseDate
                              )}
                            </td>
                          );
                        case 'currentPrice':
                          return (
                            <td key="currentPrice" className="numeric">
                              <input 
                                type="number" 
                                className="current-price-input" 
                                id={`price_${symbol}`} 
                                step="0.01" 
                                placeholder="Enter price" 
                                value={currentPrices[symbol] || ''} 
                                onChange={(e) => handlePriceChange(e, symbol)}
                              />
                            </td>
                          );
                        case 'currentValue':
                          return (
                            <td key="currentValue" id={`currentValue_${symbol}`} className="numeric">
                              {metrics.currentValue ? formatCurrency(metrics.currentValue) : '-'}
                            </td>
                          );
                        case 'unrealizedGL':
                          return (
                            <td key="unrealizedGL" id={`unrealizedGL_${symbol}`} className="numeric">
                              {metrics.unrealizedGL ? (
                                <span className={metrics.unrealizedGL >= 0 ? 'positive' : 'negative'}>
                                  {formatCurrency(metrics.unrealizedGL)}
                                </span>
                              ) : '-'}
                            </td>
                          );
                        case 'returnPercent':
                          return (
                            <td key="returnPercent" id={`returnPercent_${symbol}`} className="numeric">
                              {metrics.returnPercent !== null && metrics.returnPercent !== undefined ? (
                                <span className={metrics.returnPercent >= 0 ? 'positive' : 'negative'}>
                                  {metrics.returnPercent >= 0 ? '+' : ''}{formatPercent(metrics.returnPercent)}
                                </span>
                              ) : '-'}
                            </td>
                          );
                        case 'totalReturnMerged':
                          return (
                            <td key="totalReturnMerged" id={`totalReturnMerged_${symbol}`} className="numeric">
                              {metrics.totalReturn !== null && metrics.returnPercent !== null ? (
                                <span className={metrics.totalReturn >= 0 ? 'positive' : 'negative'}>
                                  {formatCurrency(metrics.totalReturn)} ({metrics.returnPercent >= 0 ? '+' : ''}{formatPercent(metrics.returnPercent)})
                                </span>
                              ) : '-'}
                            </td>
                          );
                        case 'realizedGain':
                          return (
                            <td key="realizedGain" className="numeric" onClick={() => startEditCell(originalIndex, 'realizedGain', stock.realizedGain)} tabIndex={0} aria-label="Edit realized gain" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') startEditCell(originalIndex, 'realizedGain', stock.realizedGain); }}>
                              {editingCell.row === originalIndex && editingCell.col === 'realizedGain' ? (
                                <input
                                  type="number"
                                  value={editingCell.value}
                                  autoFocus
                                  onChange={handleEditInputChange}
                                  onBlur={() => handleEditInputBlur(originalIndex, 'realizedGain')}
                                  onKeyDown={e => handleEditInputKeyDown(e, originalIndex, 'realizedGain')}
                                  className="table-edit-input table-edit-input-realizedGain"
                                />
                              ) : (
                                <span className={stock.realizedGain >= 0 ? 'positive' : 'negative'}>
                                  ₹{stock.realizedGain.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                </span>
                              )}
                            </td>
                          );
                        case 'dividend':
                          return (
                            <td key="dividend" className="positive numeric" onClick={() => startEditCell(originalIndex, 'dividend', stock.dividend)} tabIndex={0} aria-label="Edit dividend" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') startEditCell(originalIndex, 'dividend', stock.dividend); }}>
                              {editingCell.row === originalIndex && editingCell.col === 'dividend' ? (
                                <input
                                  type="number"
                                  value={editingCell.value}
                                  autoFocus
                                  onChange={handleEditInputChange}
                                  onBlur={() => handleEditInputBlur(originalIndex, 'dividend')}
                                  onKeyDown={e => handleEditInputKeyDown(e, originalIndex, 'dividend')}
                                  className="table-edit-input table-edit-input-dividend"
                                />
                              ) : (
                                `₹${stock.dividend.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                              )}
                            </td>
                          );
                        case 'cagr':
                          return (
                            <td key="cagr" id={`cagr_${symbol}`} className="numeric">
                              {metrics.cagr ? (
                                <span className={metrics.cagr >= 0 ? 'positive' : 'negative'}>
                                  {formatPercent(metrics.cagr)}
                                </span>
                              ) : '-'}
                            </td>
                          );
                        case 'daysHeld':
                          return (
                            <td key="daysHeld" id={`daysHeld_${symbol}`} className="numeric">
                              {calculateDaysHeld(stock.purchaseDate)}
                            </td>
                          );
                        default:
                          return null;
                      }
                    })}
                    <td className="table-actions">
                      <button 
                        onClick={() => editStock(originalIndex)} 
                        className="btn btn-sm btn-secondary"
                        aria-label={`Edit ${symbol}`}
                        tabIndex={0}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStock(originalIndex)} 
                        className="btn btn-sm btn-danger"
                        aria-label={`Delete ${symbol}`}
                        tabIndex={0}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="summary-row">
                <td className="sticky-col select-col" aria-hidden="true"></td>
                {visibleColumns.map(colKey => {
                  switch (colKey) {
                    case 'symbol':
                      return (
                        <td key="summary-symbol" className="summary-label">Totals</td>
                      );
                    case 'qty':
                      return (
                        <td key="summary-qty" className="numeric">{displayedSummary.totalQuantity.toLocaleString()}</td>
                      );
                    case 'avgPrice':
                      return <td key="summary-avgPrice"></td>;
                    case 'currentPrice':
                      return <td key="summary-currentPrice"></td>;
                    case 'invested':
                      return (
                        <td key="summary-invested" className="numeric">{formatCurrency(displayedSummary.totalInvested)}</td>
                      );
                    case 'currentValue':
                      return (
                        <td key="summary-currentValue" className="numeric">{formatCurrency(displayedSummary.currentValue)}</td>
                      );
                    case 'unrealizedGL':
                      return (
                        <td key="summary-unrealizedGL" className="numeric">
                          <span className={displayedSummary.totalGainLoss >= 0 ? 'positive' : 'negative'}>
                            {formatCurrency(displayedSummary.totalGainLoss)}
                          </span>
                        </td>
                      );
                    case 'returnPercent':
                      return (
                        <td key="summary-returnPercent" className="numeric">
                          <span className={displayedSummary.overallReturn >= 0 ? 'positive' : 'negative'}>
                            {displayedSummary.overallReturn >= 0 ? '+' : ''}{formatPercent(displayedSummary.overallReturn)}
                          </span>
                        </td>
                      );
                    case 'cagr':
                      return (
                        <td key="summary-cagr" className="numeric">
                          <span className={displayedSummary.weightedAvgCagr >= 0 ? 'positive' : 'negative'}>
                            {displayedSummary.weightedAvgCagr >= 0 ? '+' : ''}{formatPercent(displayedSummary.weightedAvgCagr)}
                          </span>
                        </td>
                      );
                    default:
                      return <td key={`summary-${colKey}`}></td>;
                  }
                })}
                <td className="action-col" aria-hidden="true"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
};

export default PortfolioTable; 
import React, { useContext, useMemo, useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faEdit, faTrashAlt, faCog } from '@fortawesome/free-solid-svg-icons';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import AnalyticsDashboard from './AnalyticsDashboard';

const DEFAULT_COLUMNS = [
  { key: 'symbol', label: 'Stock' },
  { key: 'qty', label: 'Qty' },
  { key: 'avgPrice', label: 'Avg Price' },
  { key: 'invested', label: 'Invested' },
  { key: 'purchaseDate', label: 'Purchase Date' },
  { key: 'currentPrice', label: 'Current Price' },
  { key: 'currentValue', label: 'Current Value' },
  { key: 'unrealizedGL', label: 'Unrealized G/L' },
  { key: 'realizedGain', label: 'Realized Gain' },
  { key: 'dividend', label: 'Dividend' },
  { key: 'totalReturn', label: 'Total Return' },
  { key: 'returnPercent', label: 'Return % Since Purchase' },
  { key: 'cagr', label: 'CAGR %' },
  { key: 'daysHeld', label: 'Days Held' },
];

const COLUMN_STORAGE_KEY = 'portfolioTableColumns';

const PortfolioTable = () => {
  const { 
    portfolioData, 
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
    updateStock
  } = useContext(PortfolioContext);
  
  // Bulk selection state
  const [selectedRows, setSelectedRows] = useState([]);
  const [editQueue, setEditQueue] = useState([]);

  // Column customization state
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const stored = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_COLUMNS.map(col => col.key);
      }
    }
    return DEFAULT_COLUMNS.map(col => col.key);
  });

  const [editingCell, setEditingCell] = useState({ row: null, col: null, value: '' });
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Drag-and-drop for column reordering
  const dragColIndex = useRef(null);
  const handleDragStart = (index) => {
    dragColIndex.current = index;
  };
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (index) => {
    const from = dragColIndex.current;
    if (from === null || from === index) return;
    setVisibleColumns(cols => {
      const newCols = [...cols];
      const [moved] = newCols.splice(from, 1);
      newCols.splice(index, 0, moved);
      return newCols;
    });
    dragColIndex.current = null;
  };
  const handleDragEnd = () => {
    dragColIndex.current = null;
  };

  useEffect(() => {
    localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const handleToggleColumn = (key) => {
    setVisibleColumns(cols =>
      cols.includes(key)
        ? cols.filter(col => col !== key)
        : [...cols, key]
    );
  };

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

        case "realizedGain":
          valueA = a.realizedGain || 0;
          valueB = b.realizedGain || 0;
          break;

        case "dividend":
          valueA = a.dividend || 0;
          valueB = b.dividend || 0;
          break;

        case "totalReturn":
          const unrGainA = a.qty * (parseFloat(currentPrices[a.symbol]) || 0) - a.invested;
          const unrGainB = b.qty * (parseFloat(currentPrices[b.symbol]) || 0) - b.invested;
          valueA = unrGainA + (a.realizedGain || 0) + (a.dividend || 0);
          valueB = unrGainB + (b.realizedGain || 0) + (b.dividend || 0);
          break;

        case "returnPercent":
          const currValA = a.qty * (parseFloat(currentPrices[a.symbol]) || 0);
          const currValB = b.qty * (parseFloat(currentPrices[b.symbol]) || 0);
          valueA = a.invested > 0 ? ((currValA - a.invested) / a.invested) * 100 : 0;
          valueB = b.invested > 0 ? ((currValB - b.invested) / b.invested) * 100 : 0;
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
            // Safe CAGR calculation for sorting stock A
            if (yearsA > 0 && a.invested > 0 && currValueA > 0) {
              valueA = (Math.pow(currValueA / a.invested, 1 / yearsA) - 1) * 100;
              // Apply bounds to prevent extreme values
              if (!isFinite(valueA) || isNaN(valueA)) {
                valueA = -Infinity;
              } else {
                valueA = Math.max(Math.min(valueA, 999999), -99.99);
              }
            } else {
              valueA = -Infinity;
            }

            // Safe CAGR calculation for sorting stock B
            if (yearsB > 0 && b.invested > 0 && currValueB > 0) {
              valueB = (Math.pow(currValueB / b.invested, 1 / yearsB) - 1) * 100;
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
    
    // Calculate CAGR with validation
    let cagr = 0;
    if (years > 0 && stock.invested > 0 && currentValue > 0) {
      try {
        // Use a safe calculation approach for CAGR
        cagr = (Math.pow(currentValue / stock.invested, 1 / years) - 1) * 100;
        
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
    
    showModal({
      title: "Delete Stock",
      message: `Are you sure you want to delete ${symbol} from your portfolio?`,
      confirmText: "Delete",
      onConfirm: () => {
        try {
          // Delete stock using the context method
          deleteStock(index);
          
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
        const toDelete = portfolioData
          .map((stock, idx) => ({ symbol: stock.symbol, idx }))
          .filter(item => selectedRows.includes(item.symbol))
          .map(item => item.idx)
          .sort((a, b) => b - a);
        toDelete.forEach(idx => deleteStock(idx));
        setSelectedRows([]);
        showMessage('Success', 'Selected stocks have been deleted.');
      }
    });
  };

  // Bulk edit handler (edit all selected, one after another)
  const handleBulkEdit = () => {
    if (selectedRows.length === 0) return;
    // Create a queue of indices to edit
    const indices = selectedRows
      .map(symbol => portfolioData.findIndex(stock => stock.symbol === symbol))
      .filter(idx => idx !== -1);
    if (indices.length > 0) {
      setEditQueue(indices);
      setEditingStock({ index: indices[0], stock: portfolioData[indices[0]] });
    }
  };
  
  // When editing is done, move to next in queue
  React.useEffect(() => {
    if (editQueue.length > 1 && !selectedRows.includes(portfolioData[editQueue[0]]?.symbol)) {
      // Remove the first index and open the next
      const nextQueue = editQueue.slice(1);
      setEditQueue(nextQueue);
      if (nextQueue.length > 0) {
        setEditingStock({ index: nextQueue[0], stock: portfolioData[nextQueue[0]] });
      }
    }
    // eslint-disable-next-line
  }, [portfolioData]);
  
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
  
  // If no data, return message
  if (!portfolioData || portfolioData.length === 0) {
    return (
      <div className="table-container">
        <table id="portfolioTable">
          <thead>
            <tr>
              <th className="sortable">Stock</th>
              <th className="sortable">Qty</th>
              <th className="sortable">Avg Price</th>
              <th className="sortable">Invested</th>
              <th className="sortable">Purchase Date</th>
              <th className="sortable">Current Price</th>
              <th className="sortable">Current Value</th>
              <th className="sortable">Unrealized G/L</th>
              <th className="sortable">Realized Gain</th>
              <th className="sortable">Dividend</th>
              <th className="sortable">Total Return</th>
              <th className="sortable">Return % Since Purchase</th>
              <th className="sortable">CAGR %</th>
              <th className="sortable">Days Held</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="15" style={{ textAlign: 'center', padding: '2rem' }}>
                No stocks in portfolio. Add a stock to get started.
              </td>
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
        <table id="portfolioTable">
          <thead>
            <tr>
              <th className="sortable">Stock</th>
              <th className="sortable">Qty</th>
              <th className="sortable">Avg Price</th>
              <th className="sortable">Invested</th>
              <th className="sortable">Purchase Date</th>
              <th className="sortable">Current Price</th>
              <th className="sortable">Current Value</th>
              <th className="sortable">Unrealized G/L</th>
              <th className="sortable">Realized Gain</th>
              <th className="sortable">Dividend</th>
              <th className="sortable">Total Return</th>
              <th className="sortable">Return % Since Purchase</th>
              <th className="sortable">CAGR %</th>
              <th className="sortable">Days Held</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr id="noResultsRow">
              <td colSpan="15" className="no-results">No matching stocks found</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  return (
    <div className="portfolio-table-container" data-tour="portfolio-table">
      <div className="table-controls-row">
        <button
          className="show-analytics-btn"
          onClick={() => setShowAnalytics((prev) => !prev)}
        >
          {showAnalytics ? '📊 Hide Analytics' : '📊 Show Analytics'}
        </button>
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setShowColumnDropdown((prev) => !prev)}
            aria-label="Column settings"
          >
            <FontAwesomeIcon icon={faCog} /> Columns
          </button>
          {showColumnDropdown && (
            <div className="column-dropdown">
              <div className="column-dropdown-header">Customize Columns</div>
              <div className="column-dropdown-list">
                {visibleColumns.map((colKey, idx) => {
                  const col = DEFAULT_COLUMNS.find(c => c.key === colKey);
                  if (!col) return null;
                  return (
                    <label
                      key={col.key}
                      className="column-dropdown-checkbox"
                      style={{ fontWeight: col.key === 'symbol' ? 600 : 400, opacity: col.key === 'symbol' ? 0.7 : 1, cursor: col.key === 'symbol' ? 'not-allowed' : 'grab', background: dragColIndex.current === idx ? 'var(--primary-100)' : undefined }}
                      draggable={col.key !== 'symbol'}
                      onDragStart={col.key !== 'symbol' ? () => handleDragStart(idx) : undefined}
                      onDragOver={col.key !== 'symbol' ? (e) => handleDragOver(e, idx) : undefined}
                      onDrop={col.key !== 'symbol' ? () => handleDrop(idx) : undefined}
                      onDragEnd={col.key !== 'symbol' ? handleDragEnd : undefined}
                    >
                      {col.key !== 'symbol' && <span style={{ marginRight: 8, cursor: 'grab', opacity: 0.7 }}>☰</span>}
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.key)}
                        onChange={() => handleToggleColumn(col.key)}
                        disabled={col.key === 'symbol'}
                      />
                      {col.label}
                    </label>
                  );
                })}
              </div>
              <div className="column-dropdown-actions">
                <button className="btn btn-sm btn-secondary" onClick={() => setVisibleColumns(DEFAULT_COLUMNS.map(col => col.key))}>
                  Reset to Default Columns
                </button>
                <button className="btn btn-sm" onClick={() => setShowColumnDropdown(false)}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showAnalytics && (
        <AnalyticsDashboard
          portfolioData={portfolioData}
          currentPrices={currentPrices}
          onClose={() => setShowAnalytics(false)}
        />
      )}
      {/* Column settings dropdown and bulk action controls */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '1rem' }}>
        {selectedRows.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="btn btn-danger" onClick={handleBulkDelete}>
              Delete Selected
            </button>
            <span style={{ color: '#888', fontSize: '0.95em' }}>
              {selectedRows.length} selected
            </span>
          </div>
        )}
      </div>
      {/* END Column settings dropdown */}
      <div className="table-container">
        <table id="portfolioTable">
          <thead>
            <tr>
              <th>
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
                    className={getSortClass(col.key)}
                    onClick={() => handleSort(col.key)}
                    style={{ cursor: 'pointer' }}
                  >
                    {col.label}
                  </th>
                );
              })}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="portfolioBody">
            {filteredData.map((stock, index) => {
              const originalIndex = portfolioData.indexOf(stock);
              const symbol = stock.symbol;
              const metrics = calculateRowMetrics(stock);
              return (
                <tr key={symbol}>
                  <td>
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
                          <td key="symbol" className="stock-symbol">
                            <FontAwesomeIcon icon={faChartLine} /> {symbol}
                          </td>
                        );
                      case 'qty':
                        return (
                          <td key="qty" onClick={() => startEditCell(originalIndex, 'qty', stock.qty)} tabIndex={0} aria-label="Edit quantity" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') startEditCell(originalIndex, 'qty', stock.qty); }}>
                            {editingCell.row === originalIndex && editingCell.col === 'qty' ? (
                              <input
                                type="number"
                                value={editingCell.value}
                                autoFocus
                                onChange={handleEditInputChange}
                                onBlur={() => handleEditInputBlur(originalIndex, 'qty')}
                                onKeyDown={e => handleEditInputKeyDown(e, originalIndex, 'qty')}
                                style={{ width: '70px' }}
                              />
                            ) : (
                              stock.qty.toLocaleString()
                            )}
                          </td>
                        );
                      case 'avgPrice':
                        return (
                          <td key="avgPrice" onClick={() => startEditCell(originalIndex, 'avgPrice', stock.avgPrice)} tabIndex={0} aria-label="Edit average price" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') startEditCell(originalIndex, 'avgPrice', stock.avgPrice); }}>
                            {editingCell.row === originalIndex && editingCell.col === 'avgPrice' ? (
                              <input
                                type="number"
                                value={editingCell.value}
                                autoFocus
                                onChange={handleEditInputChange}
                                onBlur={() => handleEditInputBlur(originalIndex, 'avgPrice')}
                                onKeyDown={e => handleEditInputKeyDown(e, originalIndex, 'avgPrice')}
                                style={{ width: '70px' }}
                              />
                            ) : (
                              `₹${stock.avgPrice.toFixed(2)}`
                            )}
                          </td>
                        );
                      case 'invested':
                        return (
                          <td key="invested">₹{stock.invested.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
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
                                style={{ width: '120px' }}
                              />
                            ) : (
                              stock.purchaseDate
                            )}
                          </td>
                        );
                      case 'currentPrice':
                        return (
                          <td key="currentPrice">
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
                          <td key="currentValue" id={`currentValue_${symbol}`}>
                            {metrics.currentValue ? formatCurrency(metrics.currentValue) : '-'}
                          </td>
                        );
                      case 'unrealizedGL':
                        return (
                          <td key="unrealizedGL" id={`unrealizedGL_${symbol}`}>
                            {metrics.unrealizedGL ? (
                              <span className={metrics.unrealizedGL >= 0 ? 'positive' : 'negative'}>
                                {formatCurrency(metrics.unrealizedGL)}
                              </span>
                            ) : '-'}
                          </td>
                        );
                      case 'realizedGain':
                        return (
                          <td key="realizedGain" className="positive" onClick={() => startEditCell(originalIndex, 'realizedGain', stock.realizedGain)} tabIndex={0} aria-label="Edit realized gain" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') startEditCell(originalIndex, 'realizedGain', stock.realizedGain); }}>
                            {editingCell.row === originalIndex && editingCell.col === 'realizedGain' ? (
                              <input
                                type="number"
                                value={editingCell.value}
                                autoFocus
                                onChange={handleEditInputChange}
                                onBlur={() => handleEditInputBlur(originalIndex, 'realizedGain')}
                                onKeyDown={e => handleEditInputKeyDown(e, originalIndex, 'realizedGain')}
                                style={{ width: '70px' }}
                              />
                            ) : (
                              `₹${stock.realizedGain.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                            )}
                          </td>
                        );
                      case 'dividend':
                        return (
                          <td key="dividend" className="positive" onClick={() => startEditCell(originalIndex, 'dividend', stock.dividend)} tabIndex={0} aria-label="Edit dividend" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') startEditCell(originalIndex, 'dividend', stock.dividend); }}>
                            {editingCell.row === originalIndex && editingCell.col === 'dividend' ? (
                              <input
                                type="number"
                                value={editingCell.value}
                                autoFocus
                                onChange={handleEditInputChange}
                                onBlur={() => handleEditInputBlur(originalIndex, 'dividend')}
                                onKeyDown={e => handleEditInputKeyDown(e, originalIndex, 'dividend')}
                                style={{ width: '70px' }}
                              />
                            ) : (
                              `₹${stock.dividend.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                            )}
                          </td>
                        );
                      case 'totalReturn':
                        return (
                          <td key="totalReturn" id={`totalReturn_${symbol}`}>
                            {metrics.totalReturn ? (
                              <span className={metrics.totalReturn >= 0 ? 'positive' : 'negative'}>
                                {formatCurrency(metrics.totalReturn)}
                              </span>
                            ) : '-'}
                          </td>
                        );
                      case 'returnPercent':
                        return (
                          <td key="returnPercent" id={`returnPercent_${symbol}`}>
                            {metrics.returnPercent ? (
                              <span className={metrics.returnPercent >= 0 ? 'positive' : 'negative'}>
                                {formatPercent(metrics.returnPercent)}
                              </span>
                            ) : '-'}
                          </td>
                        );
                      case 'cagr':
                        return (
                          <td key="cagr" id={`cagr_${symbol}`}>
                            {metrics.cagr ? (
                              <span className={metrics.cagr >= 0 ? 'positive' : 'negative'}>
                                {formatPercent(metrics.cagr)}
                              </span>
                            ) : '-'}
                          </td>
                        );
                      case 'daysHeld':
                        return (
                          <td key="daysHeld" id={`daysHeld_${symbol}`}>
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
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable; 
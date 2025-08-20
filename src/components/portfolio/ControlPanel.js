import React, { useContext, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileImport, faDownload, faTrashAlt, faSync, faFileAlt, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import { importPortfolioCSV, exportPortfolioCSV, downloadCSV } from '../../utils/csvUtils';
import ConfirmModal from '../modals/ConfirmModal';
import '../portfolio/StockFormPortfolioSection.css';
import ImportCSVInstructions from './ImportCSVInstructions';

const ControlPanel = () => {
  const { 
    portfolioData, 
    currentPrices,
    calculateDaysHeld,
    setShowAddStockForm, 
    importCSV, 
    showModal, 
    clearPortfolio,
    showMessage,
    showError,
    fetchLatestPrices,
    isLoadingPrices,
    priceError,
    batchErrors,
    portfolios,
    selectedPortfolioId,
    setPortfolios,
    theme // <-- add theme from context
  } = useContext(PortfolioContext);
  
  const fileInputRef = useRef(null);
  const pendingFileRef = useRef(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [importPortfolioId, setImportPortfolioId] = useState('');
  const [importAddNew, setImportAddNew] = useState(false);
  const [importNewName, setImportNewName] = useState('');
  const importNewNameRef = useRef(null);
  const [importError, setImportError] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  
  const isDarkTheme = theme === 'dark';

  // Remove csvModalConfig and handleImportClick using showModal
  const handleImportClick = () => {
    setShowImportModal(true);
  };

  // Directly process file after selection (no modal here)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    processCSVFile(file);
  };
  
  // Actual CSV import logic after confirmation
  const processCSVFile = async (file) => {
    if (!file) return;
    try {
      const result = await importPortfolioCSV(file);
      setPendingImport(result);
      // Show local modal to select portfolio
      const keys = Object.keys(portfolios).filter(k => k !== 'default');
      setImportPortfolioId(keys[0] || '');
      setImportAddNew(false);
      setImportNewName('');
      setImportError('');
      setShowImportModal(true);
    } catch (error) {
      showError(error.message);
    } finally {
      pendingFileRef.current = null;
      // Reset the file input
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };
  
  const handleExportClick = () => {
    const csv = exportPortfolioCSV(portfolioData, currentPrices, calculateDaysHeld);
    const fileName = selectedPortfolioId === 'default' 
      ? "all_portfolios.csv" 
      : `${selectedPortfolioId}_portfolio.csv`;
    downloadCSV(csv, fileName);
  };
  
  const handleAddClick = () => {
    setShowAddStockForm(true);
  };
  
  const handleRefreshPrices = async () => {
    if (isLoadingPrices) return; // Prevent multiple clicks
    try {
      if (selectedPortfolioId === 'default') {
        // All Portfolios: gather all unique symbols
        const allSymbols = Array.from(new Set(
          Object.entries(portfolios)
            .filter(([id]) => id !== 'default')
            .flatMap(([, stocks]) => stocks.map(s => s.symbol))
        ));
        if (allSymbols.length === 0) {
          showMessage('No stocks to update', 'There are no stocks in any portfolio.');
          return;
        }
        // Simulate batch price update for all symbols
        await fetchLatestPrices(allSymbols);
        showMessage('Success', 'All stock prices updated successfully.');
      } else {
        await fetchLatestPrices();
        showMessage('Success', 'Stock prices updated successfully.');
      }
    } catch (error) {
      showError(`Failed to refresh prices: ${error.message || 'Unknown error'}`);
    }
  };
  
  const confirmClearPortfolio = () => {
    if (selectedPortfolioId === 'default') {
      showModal({
        title: "Clear All Portfolios",
        message: "Are you sure you want to permanently delete all stocks from all portfolios?",
        confirmText: "Yes, Delete All",
        onConfirm: () => {
          // Clear all portfolios except 'default'
          setPortfolios(prev => {
            const newPortfolios = { ...prev };
            Object.keys(newPortfolios).forEach(id => { if (id !== 'default') newPortfolios[id] = []; });
            return newPortfolios;
          });
          showMessage("Success", "All portfolios have been cleared successfully.");
        }
      });
    } else {
      showModal({
        title: "Clear Portfolio",
        message: "Are you sure you want to permanently delete all stocks from this portfolio?",
        confirmText: "Yes, Delete All",
        onConfirm: () => {
          clearPortfolio();
          showMessage("Success", "Your portfolio has been cleared successfully.");
        }
      });
    }
  };
  
  // Only show export and clear buttons if there is data
  const hasData = portfolioData && portfolioData.length > 0;
  
  // Helper to get latest new portfolio name
  const getLatestImportNewName = () => importNewNameRef.current ? importNewNameRef.current.value : importNewName;
  
  return (
    <div className="controls" data-tour="control-panel">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <button className="btn btn-primary control-btn" onClick={handleImportClick}>
        <FontAwesomeIcon icon={faFileImport} /> Import Portfolio (CSV)
      </button>
      <button className="btn btn-primary control-btn" onClick={handleAddClick}>
        <FontAwesomeIcon icon={faPlus} /> Add New Stock
      </button>
      {hasData && (
        <button 
          className="btn btn-primary control-btn"
          onClick={handleRefreshPrices}
          disabled={isLoadingPrices}
        >
          <FontAwesomeIcon icon={faSync} spin={isLoadingPrices} /> 
          {isLoadingPrices ? 'Updating Prices...' : 'Refresh Prices'}
        </button>
      )}
      {hasData && (
        <button id="exportDataBtn" className="btn btn-primary control-btn" onClick={handleExportClick}>
          <FontAwesomeIcon icon={faDownload} /> Export Data
        </button>
      )}
      {hasData && (
        <button id="clearPortfolioBtn" className="btn btn-danger control-btn" onClick={confirmClearPortfolio}>
          <FontAwesomeIcon icon={faTrashAlt} /> Clear Portfolio
        </button>
      )}
      {/* Use only ImportCSVInstructions modal for import */}
      {showImportModal && (
        <ImportCSVInstructions 
          onClose={() => setShowImportModal(false)}
          portfolios={portfolios}
          importCSV={importCSV}
          showMessage={showMessage}
          showError={showError}
        />
      )}
    </div>
  );
};

export default ControlPanel;
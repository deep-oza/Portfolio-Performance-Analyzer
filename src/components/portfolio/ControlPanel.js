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
  // Modal text for CSV upload confirmation
  const csvModalConfig = {
    title: '', // Title is now in the component
    message: <ImportCSVInstructions />,
    confirmText: "Confirm and Upload",
    cancelText: "Cancel",
    confirmButtonClass: "btn-primary",
    showCancel: true
  };
  
  const handleImportClick = () => {
    showModal({
      ...csvModalConfig,
      onConfirm: () => {
        if (fileInputRef.current) fileInputRef.current.value = null; // reset file input
        fileInputRef.current.click();
      },
      onCancel: () => {},
    });
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
    downloadCSV(csv, "portfolio_full_export.csv");
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
      {/* Local Import Portfolio Modal */}
      {showImportModal && (
        <div className="modal-overlay active import-modal-overlay">
          <div className="modal-container import-modal-card">
            <div className="modal-header import-modal-header">
              <div className="import-modal-title-row">
                <span className="import-modal-title-icon"><FontAwesomeIcon icon={faFileImport} /></span>
                <div>
                  <h3 className="modal-title import-modal-title">Import Portfolio</h3>
                  <div className="import-modal-subtitle">Select or create a portfolio to import your CSV data into.</div>
                </div>
              </div>
            </div>
            <div className="modal-body import-modal-body">
              <div className="import-modal-guide">
                <strong>How to Import:</strong>
                <ol className="import-modal-guide-list">
                  <li>Download the <a href="/sample_portfolio.csv" download className="import-modal-link">Sample CSV</a> for reference.</li>
                  <li>Ensure your file includes <b>all required columns</b>:</li>
                </ol>
                <ul className="import-modal-required-cols">
                  <li><b>symbol</b> <span className="import-modal-col-alt">(or: stock, ticker, scrip)</span></li>
                  <li><b>qty</b> <span className="import-modal-col-alt">(or: quantity, shares, units, holding)</span></li>
                  <li><b>avg price</b> <span className="import-modal-col-alt">(or: average price, buy price, purchase price, cost)</span></li>
                </ul>
                <div className="import-modal-optional-label">Optional columns for enhanced analysis:</div>
                <ul className="import-modal-optional-cols">
                  <li>name, purchase date, realized gain, dividend</li>
                </ul>
                <div className="import-modal-tips-label"><b>Tips:</b></div>
                <ul className="import-modal-tips-list">
                  <li>Check your data for accuracy before uploading.</li>
                  <li>Missing or incorrect data may result in incomplete or inaccurate analysis.</li>
                  <li>File must be in <b>.csv</b> format (comma or tab separated).</li>
                </ul>
                <div className="import-modal-warning">
                  <FontAwesomeIcon icon={faFileImport} /> This will <b>replace</b> the selected portfolio's data with the imported CSV.
                </div>
              </div>
              <div className="import-modal-row">
                <label htmlFor="import-portfolio-select" className="import-modal-label">Portfolio</label>
                {Object.keys(portfolios).filter(k => k !== 'default').length > 0 && !importAddNew ? (
                  <>
                    <select
                      id="import-portfolio-select"
                      value={importPortfolioId}
                      onChange={e => {
                        if (e.target.value === '__add_new__') {
                          setImportAddNew(true);
                          setImportNewName('');
                        } else {
                          setImportPortfolioId(e.target.value);
                        }
                      }}
                      className="import-modal-select modern"
                    >
                      <option value="" disabled>Select portfolio</option>
                      {Object.keys(portfolios).filter(k => k !== 'default').map(id => (
                        <option key={id} value={id}>{id}</option>
                      ))}
                      <option value="__add_new__">+ Add new portfolio</option>
                    </select>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      id="import-portfolio-input"
                      placeholder="New portfolio name"
                      value={importNewName}
                      onChange={e => setImportNewName(e.target.value)}
                      ref={importNewNameRef}
                      className={`import-modal-input modern${importError ? ' import-modal-input-error' : ''}`}
                      aria-invalid={importError ? 'true' : 'false'}
                    />
                    {Object.keys(portfolios).filter(k => k !== 'default').length > 0 && (
                      <button type="button" onClick={() => { setImportAddNew(false); setImportNewName(''); }} className="import-modal-cancel">
                        Cancel
                      </button>
                    )}
                  </>
                )}
              </div>
              {importError && <div className="import-modal-error">{importError}</div>}
            </div>
            <div className="modal-footer import-modal-footer">
              <div className="modal-actions import-modal-actions">
                <button className="import-modal-btn btn-secondary" onClick={() => setShowImportModal(false)}>Cancel</button>
                <button className="import-modal-btn btn-primary" onClick={() => {
                  let keys = Object.keys(portfolios).filter(k => k !== 'default');
                  let portfolioId = importPortfolioId;
                  const noPortfolios = keys.length === 0;
                  if (importAddNew || noPortfolios) {
                    const latestName = getLatestImportNewName();
                    if (!latestName.trim()) {
                      setImportError('Portfolio name is required.');
                      return;
                    }
                    if (keys.includes(latestName.trim())) {
                      setImportError('Portfolio already exists.');
                      return;
                    }
                    portfolioId = latestName.trim();
                  }
                  if (!portfolioId) {
                    setImportError('Portfolio name is required.');
                    return;
                  }
                  importCSV(pendingImport, portfolioId);
                  let message = '✅ Imported portfolio from CSV!';
                  if (pendingImport.warnings && pendingImport.warnings.length > 0) {
                    message += '\n\nWarnings:\n' + pendingImport.warnings.join('\n');
                  }
                  showMessage('Import Successful', message);
                  setPendingImport(null);
                  setImportPortfolioId('');
                  setImportAddNew(false);
                  setImportNewName('');
                  setImportError('');
                  setShowImportModal(false);
                }}>Import</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel; 
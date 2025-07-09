import React, { useContext, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileImport, faDownload, faTrashAlt, faSync, faFileAlt, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import { importPortfolioCSV, exportPortfolioCSV, downloadCSV } from '../../utils/csvUtils';
import ConfirmModal from '../modals/ConfirmModal';
import '../portfolio/StockFormPortfolioSection.css';

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
    title: "Import Portfolio from CSV",
    message: (
      <div style={{ textAlign: 'left', fontSize: '1.05em' }}>
        <div style={{
          marginBottom: 16,
          background: isDarkTheme ? '' : '#f8f9fa',
          padding: 12,
          borderRadius: 8,
          border: isDarkTheme ? '1px solid #444' : '1px solid #e0e0e0',
          color: isDarkTheme ? '#f1f1f1' : undefined
        }}>
          <strong>How to Import:</strong>
          <ol style={{ margin: '10px 0 0 20px' }}>
            <li>Download the <a href="/sample_portfolio.csv" download style={{ color: isDarkTheme ? '#66bfff' : '#007bff', textDecoration: 'underline' }}>Sample CSV</a> for reference.</li>
            <li>Ensure your file includes <b>all required columns</b>:</li>
          </ol>
          <ul style={{ marginLeft: 30 }}>
            <li><b>symbol</b> <span style={{ color: isDarkTheme ? '#bbb' : '#888' }}>(or: stock, ticker, scrip)</span></li>
            <li><b>qty</b> <span style={{ color: isDarkTheme ? '#bbb' : '#888' }}>(or: quantity, shares, units, holding)</span></li>
            <li><b>avg price</b> <span style={{ color: isDarkTheme ? '#bbb' : '#888' }}>(or: average price, buy price, purchase price, cost)</span></li>
          </ul>
          <div style={{ marginTop: 8 }}>Optional columns for enhanced analysis:</div>
          <ul style={{ marginLeft: 30 }}>
            <li>name, purchase date, realized gain, dividend</li>
          </ul>
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Tips:</b>
          <ul style={{ marginLeft: 20 }}>
            <li>Check your data for accuracy before uploading.</li>
            <li>Missing or incorrect data may result in incomplete or inaccurate analysis.</li>
            <li>File must be in <b>.csv</b> format (comma or tab separated).</li>
          </ul>
        </div>
        <div style={{ color: '#d9534f', fontWeight: 500, marginBottom: 8 }}>
          <FontAwesomeIcon icon={faFileImport} /> This will <b>replace</b> your current portfolio.
        </div>
        <div style={{ marginTop: 10 }}>Do you want to proceed with the upload?</div>
      </div>
    ),
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
      <button className="btn btn-primary" style={{ fontWeight: 600, marginRight: 10 }} onClick={handleImportClick}>
        <FontAwesomeIcon icon={faFileImport} /> Import Portfolio (CSV)
      </button>
      <button className="btn btn-primary" style={{ fontWeight: 600, marginRight: 10 }} onClick={handleAddClick}>
        <FontAwesomeIcon icon={faPlus} /> Add New Stock
      </button>
      {hasData && (
        <button 
          className="btn btn-primary"
          style={{ fontWeight: 600, marginRight: 10 }}
          onClick={handleRefreshPrices}
          disabled={isLoadingPrices}
        >
          <FontAwesomeIcon icon={faSync} spin={isLoadingPrices} /> 
          {isLoadingPrices ? 'Updating Prices...' : 'Refresh Prices'}
        </button>
      )}
      {hasData && (
        <button id="exportDataBtn" className="btn btn-primary" style={{ fontWeight: 600, marginRight: 10 }} onClick={handleExportClick}>
          <FontAwesomeIcon icon={faDownload} /> Export Data
        </button>
      )}
      {hasData && (
        <button id="clearPortfolioBtn" className="btn btn-danger" style={{ fontWeight: 600 }} onClick={confirmClearPortfolio}>
          <FontAwesomeIcon icon={faTrashAlt} /> Clear Portfolio
        </button>
      )}
      {/* Local Import Portfolio Modal */}
      {showImportModal && (
        <div className="modal-overlay active import-modal-overlay">
          <div className="modal-container import-modal-card">
            <div className="modal-header import-modal-header" style={{ padding: '1.2rem 1.2rem 0 1.2rem' }}>
              <div className="import-modal-title-row" style={{ gap: 10 }}>
                <span className="import-modal-title-icon" style={{ fontSize: '1.5rem', padding: 5 }}><FontAwesomeIcon icon={faFileImport} /></span>
                <div>
                  <h3 className="modal-title import-modal-title" style={{ fontSize: '1.08rem', margin: 0 }}>Import Portfolio</h3>
                  <div className="import-modal-subtitle" style={{ fontSize: '0.97rem', marginTop: 1 }}>Select or create a portfolio to import your CSV data into.</div>
                </div>
              </div>
            </div>
            <div className="modal-body import-modal-body" style={{ padding: '1.2rem' }}>
              <div className="portfolio-section-row" style={{ marginBottom: 0, gap: 8 }}>
                <label htmlFor="import-portfolio-select" className="portfolio-section-label" style={{ fontSize: '0.98rem', minWidth: 70 }}>Portfolio</label>
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
                      className="portfolio-section-select"
                      style={{ fontSize: '0.98rem', padding: '7px 10px', minWidth: 120 }}
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
                      className={`portfolio-section-input${importError ? ' portfolio-section-input-error' : ''}`}
                      aria-invalid={importError ? 'true' : 'false'}
                      style={{ fontSize: '0.98rem', padding: '7px 10px', minWidth: 120 }}
                    />
                    {Object.keys(portfolios).filter(k => k !== 'default').length > 0 && (
                      <button type="button" onClick={() => { setImportAddNew(false); setImportNewName(''); }} className="portfolio-section-cancel" style={{ fontSize: '0.98rem', padding: '0 6px 2px 6px' }}>
                        Cancel
                      </button>
                    )}
                  </>
                )}
              </div>
              {importError && <div className="portfolio-section-error" style={{ fontSize: '0.93rem', marginTop: 2 }}>{importError}</div>}
              <div style={{ height: 10 }} />
              <div className="import-modal-info" style={{ fontSize: '0.97rem', padding: '8px 10px', borderRadius: 6 }}>
                <FontAwesomeIcon icon={faFileImport} style={{ marginRight: 6, color: '#1976d2', fontSize: '1rem' }} />
                This will <b>replace</b> the selected portfolio's data with the imported CSV.
              </div>
            </div>
            <div className="modal-footer import-modal-footer" style={{ padding: '1rem 1.2rem' }}>
              <div className="modal-actions import-modal-actions" style={{ gap: 10 }}>
                <button className="btn btn-secondary import-modal-btn" style={{ fontSize: '0.98rem', padding: '7px 22px', minWidth: 80 }} onClick={() => setShowImportModal(false)}>Cancel</button>
                <button className="btn btn-primary import-modal-btn" style={{ fontSize: '0.98rem', padding: '7px 22px', minWidth: 80 }} onClick={() => {
                  let keys = Object.keys(portfolios).filter(k => k !== 'default');
                  let portfolioId = importPortfolioId;
                  // If there are no portfolios, always use the new name
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
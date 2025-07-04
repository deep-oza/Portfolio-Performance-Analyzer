import React, { useContext, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileImport, faDownload, faTrashAlt, faSync, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import { importPortfolioCSV, exportPortfolioCSV, downloadCSV } from '../../utils/csvUtils';

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
    priceError
  } = useContext(PortfolioContext);
  
  const fileInputRef = useRef(null);
  const pendingFileRef = useRef(null);
  
  // Modal text for CSV upload confirmation
  const csvModalConfig = {
    title: "Import Portfolio from CSV",
    message: (
      <div style={{ textAlign: 'left', fontSize: '1.05em' }}>
        <div style={{ marginBottom: 16, background: '#f8f9fa', padding: 12, borderRadius: 8, border: '1px solid #e0e0e0' }}>
          <strong>How to Import:</strong>
          <ol style={{ margin: '10px 0 0 20px' }}>
            <li>Download the <a href="/sample_portfolio.csv" download style={{ color: '#007bff', textDecoration: 'underline' }}>Sample CSV</a> for reference.</li>
            <li>Ensure your file includes <b>all required columns</b>:</li>
          </ol>
          <ul style={{ marginLeft: 30 }}>
            <li><b>symbol</b> <span style={{ color: '#888' }}>(or: stock, ticker, scrip)</span></li>
            <li><b>qty</b> <span style={{ color: '#888' }}>(or: quantity, shares, units, holding)</span></li>
            <li><b>avg price</b> <span style={{ color: '#888' }}>(or: average price, buy price, purchase price, cost)</span></li>
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
      importCSV(result);
      let message = "✅ Imported portfolio from CSV—predefined stocks removed!";
      if (result.warnings && result.warnings.length > 0) {
        message += "\n\nWarnings:\n" + result.warnings.join("\n");
      }
      showMessage("Import Successful", message);
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
      await fetchLatestPrices();
      showMessage("Success", "Stock prices updated successfully.");
    } catch (error) {
      showError(`Failed to refresh prices: ${error.message || 'Unknown error'}`);
    }
  };
  
  const confirmClearPortfolio = () => {
    showModal({
      title: "Clear Portfolio",
      message: "Are you sure you want to permanently delete all stocks from your portfolio?",
      confirmText: "Yes, Delete All",
      onConfirm: () => {
        clearPortfolio();
        showMessage("Success", "Your portfolio has been cleared successfully.");
      }
    });
  };
  
  // Only show export and clear buttons if there is data
  const hasData = portfolioData && portfolioData.length > 0;
  
  return (
    <div className="controls">
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
    </div>
  );
};

export default ControlPanel; 
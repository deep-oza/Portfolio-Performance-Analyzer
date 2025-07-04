import React, { useContext, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileImport, faDownload, faTrashAlt, faSync } from '@fortawesome/free-solid-svg-icons';
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
    title: "CSV Upload Confirmation",
    message: (
      <div style={{textAlign: 'left'}}>
        <p>Before uploading your portfolio CSV, please ensure your file contains the <b>required columns</b>:</p>
        <ul>
          <li><b>symbol</b> (or: stock, ticker, scrip)</li>
          <li><b>qty</b> (or: quantity, shares, units, holding)</li>
          <li><b>avg price</b> (or: average price, buy price, purchase price, cost)</li>
        </ul>
        <p>Optional columns for more accurate analysis:</p>
        <ul>
          <li>name, purchase date, current price, realized gain, dividend</li>
        </ul>
        <p>Please verify your CSV data is complete and accurate.<br/>Missing or incorrect data may result in incomplete or inaccurate portfolio analysis, including metrics like investment, returns, XIRR, and CAGR.</p>
        <p>Do you want to proceed with the upload?</p>
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
      showMessage("Success", "Stock prices updated successfully from Twelve Data API.");
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
      <button className="btn" onClick={handleImportClick}>
        <FontAwesomeIcon icon={faFileImport} /> Import Portfolio (CSV)
      </button>
      
      <button className="btn" onClick={handleAddClick}>
        <FontAwesomeIcon icon={faPlus} /> Add New Stock
      </button>
      
      {hasData && (
        <button 
          className="btn btn-primary"
          onClick={handleRefreshPrices}
          disabled={isLoadingPrices}
        >
          <FontAwesomeIcon icon={faSync} spin={isLoadingPrices} /> 
          {isLoadingPrices ? 'Updating Prices...' : 'Refresh Prices'}
        </button>
      )}
      
      {hasData && (
        <button id="exportDataBtn" className="btn" onClick={handleExportClick}>
          <FontAwesomeIcon icon={faDownload} /> Export Data
        </button>
      )}
      
      {hasData && (
        <button id="clearPortfolioBtn" className="btn btn-danger" onClick={confirmClearPortfolio}>
          <FontAwesomeIcon icon={faTrashAlt} /> Clear Portfolio
        </button>
      )}
    </div>
  );
};

export default ControlPanel; 
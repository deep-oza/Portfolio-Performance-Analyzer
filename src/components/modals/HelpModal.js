import React, { useContext, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faRoute } from '@fortawesome/free-solid-svg-icons';
import { PortfolioContext } from '../../contexts/PortfolioContext';

const HelpModal = () => {
  const { helpModalVisible, setHelpModalVisible } = useContext(PortfolioContext);
  
  const hideHelpModal = useCallback(() => {
    setHelpModalVisible(false);
  }, [setHelpModalVisible]);
  
  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && helpModalVisible) {
        hideHelpModal();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [helpModalVisible, hideHelpModal]);
  
  const handleOutsideClick = (e) => {
    if (e.target.id === 'helpModal') {
      hideHelpModal();
    }
  };

  const restartTour = () => {
    // Save current theme
    const currentTheme = localStorage.getItem('theme');
    
    // Remove only tour-related localStorage item
    localStorage.removeItem('tourModalShown');
    
    hideHelpModal();
    
    // Use a more elegant approach with URL parameters instead of full page reload
    const url = new URL(window.location);
    url.searchParams.set('restart-tour', 'true');
    window.location.href = url.toString();
  };
  
  if (!helpModalVisible) {
    return null;
  }
  
  // Responsive styles
  const modalStyles = {
    container: {
      maxWidth: 700,
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      width: '95%'
    },
    header: {
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    body: {
      overflowY: 'auto',
      flex: 1,
      padding: '1.5rem'
    },
    footer: {
      padding: '1rem',
      borderTop: '1px solid #eee',
      background: 'var(--bg-card)',
      position: 'sticky',
      bottom: 0,
      zIndex: 2
    },
    title: {
      margin: 0,
      fontSize: 'calc(1.1rem + 0.3vw)'
    }
  };
  
  return (
    <div 
      id="helpModal" 
      className="modal-overlay" 
      style={{ display: 'flex' }}
      onClick={handleOutsideClick}
    >
      <div className="modal-container help-modal-container" style={modalStyles.container}>
        {/* Header */}
        <div className="modal-header" style={modalStyles.header}>
          <h3 className="modal-title" style={modalStyles.title}>
            <FontAwesomeIcon icon={faQuestionCircle} /> Help & Instructions
          </h3>
        </div>
        {/* Body */}
        <div className="modal-body" style={modalStyles.body}>
          <div className="help-content" style={{ fontSize: 'calc(0.85rem + 0.2vw)' }}>
            <div className="help-section">
              <h4 style={{ fontSize: 'calc(1rem + 0.2vw)' }}>How to Use</h4>
              <h5 style={{ fontSize: 'calc(0.9rem + 0.2vw)' }}>Creating & Managing Portfolios</h5>
              <ol style={{ paddingLeft: '1.2rem' }}>
                <li>Find the "Portfolios" section with the "Active Portfolio" dropdown</li>
                <li>Click the <strong>+</strong> button next to the dropdown to create a new portfolio</li>
                <li>Enter a unique portfolio name and click "Create"</li>
                <li>Switch between portfolios using the dropdown selector</li>
                <li>Delete a portfolio by selecting it and clicking the trash icon (cannot delete "All Portfolios")</li>
              </ol>
              
              <h5 style={{ fontSize: 'calc(0.9rem + 0.2vw)' }}>Adding & Managing Stocks</h5>
              <ol style={{ paddingLeft: '1.2rem' }}>
                <li>Click <strong>Add New Stock</strong> button in the control panel</li>
                <li>Select a portfolio to add the stock to (defaults to currently selected portfolio)</li>
                <li>Enter the stock symbol and click outside the field to automatically fetch current price</li>
                <li>Fill in quantity, purchase price, and purchase date (required fields)</li>
                <li>Optionally add realized gains and dividend information</li>
                <li>Click <strong>Add Stock</strong> to save to your portfolio</li>
                <li>To edit a stock, click the edit icon in the table row</li>
                <li>To delete a stock, use the trash icon in the table row</li>
              </ol>
              
              <h5 style={{ fontSize: 'calc(0.9rem + 0.2vw)' }}>Getting Stock Quotes</h5>
              <ol style={{ paddingLeft: '1.2rem' }}>
                <li>Use the "Stock Quote" section to get real-time prices</li>
                <li>Enter a stock symbol and click the search button</li>
                <li>View current price, percent change, and other information</li>
                <li>Click the refresh button to update the price</li>
                <li>Click "Clear" to reset the quote search</li>
              </ol>
              
              <h5 style={{ fontSize: 'calc(0.9rem + 0.2vw)' }}>Importing & Exporting Data</h5>
              <ol style={{ paddingLeft: '1.2rem' }}>
                <li>Click <strong>Import CSV</strong> in the control panel</li>
                <li>Review the import instructions and click "Confirm and Upload"</li>
                <li>Select a portfolio to import into or create a new one</li>
                <li>Click <strong>Export Data</strong> to download your current portfolio as a CSV file</li>
                <li>Download the sample CSV template as a guide for formatting your import files</li>
              </ol>
              
              <h5 style={{ fontSize: 'calc(0.9rem + 0.2vw)' }}>Using Analytics</h5>
              <ol style={{ paddingLeft: '1.2rem' }}>
                <li>Click <strong>Show Analytics</strong> button in the portfolio section</li>
                <li>View charts showing portfolio allocation and performance</li>
                <li>Analyze performance metrics across different holdings</li>
                <li>Click <strong>Hide Analytics</strong> to return to the table view</li>
              </ol>
              
              <h5 style={{ fontSize: 'calc(0.9rem + 0.2vw)' }}>Customizing Your View</h5>
              <ol style={{ paddingLeft: '1.2rem' }}>
                <li>Click the <strong>Columns</strong> button to open the column customization dropdown</li>
                <li>Check/uncheck boxes to show/hide specific data columns</li>
                <li>Drag and drop column names using the handle (☰) to reorder them</li>
                <li>Click "Reset" to restore all default columns</li>
                <li>Click "Close" to apply your column settings</li>
                <li>Use the theme toggle in the top-right corner to switch between light and dark modes</li>
                <li>Sort the table by clicking on any column header</li>
                <li>Use the search bar to filter stocks by name or symbol</li>
                <li>Use the dropdown filter to show all stocks, gainers only, or losers only</li>
              </ol>
            </div>

            <div className="help-section">
              <h4 style={{ fontSize: 'calc(1rem + 0.2vw)' }}>Getting Started</h4>
              <p>Welcome to the Portfolio Performance Analyzer! This tool helps you track and analyze your stock investments.</p>
              <ol style={{ paddingLeft: '1.2rem' }}>
                <li>Add stocks using the <strong>Add New Stock</strong> button</li>
                <li>Create multiple portfolios to organize your investments</li>
                <li>Import existing portfolios from CSV files</li>
                <li>View performance metrics and visualization charts</li>
              </ol>
            </div>
            
            <div className="help-section">
              <h4 style={{ fontSize: 'calc(1rem + 0.2vw)' }}>Portfolio Management</h4>
              <ul style={{ paddingLeft: '1.2rem' }}>
                <li><strong>Create Portfolios:</strong> Organize investments by strategy, account type, or goals</li>
                <li><strong>Switch Portfolios:</strong> Use the dropdown to view different portfolios</li>
                <li><strong>All Portfolios View:</strong> See combined performance across all your investments</li>
                <li><strong>Add/Edit Stocks:</strong> Enter stock details including purchase date, price, and quantity</li>
                <li><strong>Track Dividends:</strong> Record dividend income for each position</li>
                <li><strong>Realized Gains:</strong> Track profits from partial sells separately</li>
              </ul>
            </div>
            
            <div className="help-section">
              <h4 style={{ fontSize: 'calc(1rem + 0.2vw)' }}>Key Metrics Explained</h4>
              <ul style={{ paddingLeft: '1.2rem' }}>
                <li><strong>Total Invested:</strong> Sum of all purchase amounts (price × quantity)</li>
                <li><strong>Current Value:</strong> Market value based on latest prices</li>
                <li><strong>Overall Return %:</strong> Total percentage gain/loss across your portfolio</li>
                <li><strong>CAGR %:</strong> Compound Annual Growth Rate - annualized return over time</li>
                <li><strong>Unrealized G/L:</strong> Current gain or loss based on market price</li>
                <li><strong>Realized Gain:</strong> Profits already booked from partial sells</li>
                <li><strong>Total Return:</strong> Combined realized and unrealized gains plus dividends</li>
              </ul>
            </div>
            
            <div className="help-section">
              <h4 style={{ fontSize: 'calc(1rem + 0.2vw)' }}>Features & Tools</h4>
              <ul style={{ paddingLeft: '1.2rem' }}>
                <li><strong>Real-time Quotes:</strong> Get current market prices for any stock symbol</li>
                <li><strong>Search & Filter:</strong> Quickly find stocks or filter by performance</li>
                <li><strong>Analytics Dashboard:</strong> View charts showing allocation and performance</li>
                <li><strong>Column Customization:</strong> Show/hide and reorder table columns</li>
                <li><strong>Dark/Light Theme:</strong> Toggle between viewing modes</li>
                <li><strong>Bulk Actions:</strong> Select multiple stocks to edit or delete</li>
                <li><strong>In-place Editing:</strong> Click on table cells to edit values directly</li>
              </ul>
            </div>
            
            <div className="help-section">
              <h4 style={{ fontSize: 'calc(1rem + 0.2vw)' }}>Data Management</h4>
              <ul style={{ paddingLeft: '1.2rem' }}>
                <li><strong>Local Storage:</strong> Your data is stored securely in your browser</li>
                <li><strong>Export Data:</strong> Backup your portfolio as a CSV file</li>
                <li><strong>Import CSV:</strong> Load portfolio data from spreadsheets</li>
                <li><strong>Data Privacy:</strong> All data stays on your device - nothing is sent to servers</li>
              </ul>
            </div>
            
            <div className="help-section">
              <h4 style={{ fontSize: 'calc(1rem + 0.2vw)' }}>Tips & Tricks</h4>
              <ul style={{ paddingLeft: '1.2rem' }}>
                <li>Use keyboard shortcuts: <strong>Enter</strong> to save edits, <strong>Escape</strong> to cancel</li>
                <li>Click column headers to sort the table by that metric</li>
                <li>Create separate portfolios for different investment strategies</li>
                <li>Use the analytics view to identify portfolio imbalances</li>
                <li>Export your data regularly as a backup</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="modal-footer" style={modalStyles.footer}>
          <div className="modal-actions" style={{ margin: 0 }}>
            <button className="btn btn-secondary" onClick={restartTour} style={{ marginRight: '10px', fontSize: 'calc(0.85rem + 0.1vw)' }}>
              <FontAwesomeIcon icon={faRoute} /> Restart Tour
            </button>
            <button id="helpModalClose" className="btn" onClick={hideHelpModal} style={{ fontSize: 'calc(0.85rem + 0.1vw)' }}>
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 
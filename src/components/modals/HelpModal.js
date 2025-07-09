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
  
  return (
    <div 
      id="helpModal" 
      className="modal-overlay" 
      style={{ display: 'flex' }}
      onClick={handleOutsideClick}
    >
      <div className="modal-container help-modal-container" style={{ maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header" style={{ padding: '2rem 2rem 0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="modal-title" style={{ margin: 0 }}>
            <FontAwesomeIcon icon={faQuestionCircle} /> Help & Instructions
          </h3>
          <button 
            className="modal-close-btn" 
            onClick={hideHelpModal}
            aria-label="Close"
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
        {/* Body */}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '2rem' }}>
          <div className="help-content">
            <div className="help-section">
              <h4>Getting Started</h4>
              <p>Welcome to the Portfolio Performance Analyzer! This tool helps you track and analyze your stock investments.</p>
              <ol>
                <li>Add stocks using the <strong>Add New Stock</strong> button</li>
                <li>Create multiple portfolios to organize your investments</li>
                <li>Import existing portfolios from CSV files</li>
                <li>View performance metrics and visualization charts</li>
              </ol>
            </div>
            
            <div className="help-section">
              <h4>Portfolio Management</h4>
              <ul>
                <li><strong>Create Portfolios:</strong> Organize investments by strategy, account type, or goals</li>
                <li><strong>Switch Portfolios:</strong> Use the dropdown to view different portfolios</li>
                <li><strong>All Portfolios View:</strong> See combined performance across all your investments</li>
                <li><strong>Add/Edit Stocks:</strong> Enter stock details including purchase date, price, and quantity</li>
                <li><strong>Track Dividends:</strong> Record dividend income for each position</li>
                <li><strong>Realized Gains:</strong> Track profits from partial sells separately</li>
              </ul>
            </div>
            
            <div className="help-section">
              <h4>Key Metrics Explained</h4>
              <ul>
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
              <h4>Features & Tools</h4>
              <ul>
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
              <h4>Data Management</h4>
              <ul>
                <li><strong>Local Storage:</strong> Your data is stored securely in your browser</li>
                <li><strong>Export Data:</strong> Backup your portfolio as a CSV file</li>
                <li><strong>Import CSV:</strong> Load portfolio data from spreadsheets</li>
                <li><strong>Data Privacy:</strong> All data stays on your device - nothing is sent to servers</li>
              </ul>
            </div>
            
            <div className="help-section">
              <h4>Tips & Tricks</h4>
              <ul>
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
        <div className="modal-footer" style={{ padding: '1.5rem 2rem', borderTop: '1px solid #eee', background: 'var(--bg-card)', position: 'sticky', bottom: 0, zIndex: 2 }}>
          <div className="modal-actions" style={{ margin: 0 }}>
            <button className="btn btn-secondary" onClick={restartTour} style={{ marginRight: '10px' }}>
              <FontAwesomeIcon icon={faRoute} /> Restart Tour
            </button>
            <button id="helpModalClose" className="btn" onClick={hideHelpModal}>
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 
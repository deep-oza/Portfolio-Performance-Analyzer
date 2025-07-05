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
                <li>Enter current market prices in the table</li>
                <li>View performance metrics and charts</li>
              </ol>
            </div>
            <div className="help-section">
              <h4>Key Metrics Explained</h4>
              <ul>
                <li><strong>Return % Since Purchase:</strong> Simple return percentage based on unrealized gain/loss only</li>
                <li><strong>CAGR %:</strong> Compound Annual Growth Rate - annualized return over time</li>
                <li><strong>Unrealized G/L:</strong> Current gain or loss based on market price</li>
                <li><strong>Realized Gain:</strong> Profits already booked from partial sells</li>
              </ul>
            </div>
            <div className="help-section">
              <h4>Data Management</h4>
              <ul>
                <li>Your data is stored locally in your browser</li>
                <li>Use <strong>Export Data</strong> to backup your portfolio</li>
                <li>Import a CSV file with your portfolio data</li>
              </ul>
            </div>
            <div className="help-section">
              <h4>Tips & Tricks</h4>
              <ul>
                <li>Use the search bar to quickly find stocks</li>
                <li>Filter by gainers/losers to focus on specific stocks</li>
                <li>Click column headers to sort the table</li>
                <li>Use the charts to visualize your portfolio allocation and performance</li>
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
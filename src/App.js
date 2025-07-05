import React, { useState, useEffect } from 'react';
import './styles.css';
import { PortfolioProvider } from './contexts/PortfolioContext';
import ThemeToggle from './components/ThemeToggle';
import HelpButton from './components/HelpButton';
import SummaryCards from './components/portfolio/SummaryCards';
import ControlPanel from './components/portfolio/ControlPanel';
import SearchFilterBar from './components/portfolio/SearchFilterBar';
import ConfirmModal from './components/modals/ConfirmModal';
import HelpModal from './components/modals/HelpModal';
import StockForm from './components/portfolio/StockForm';
import PortfolioTable from './components/portfolio/PortfolioTable';
import Footer from './components/Footer';
import StockLTPCard from './components/portfolio/StockLTPCard';
import { TourProvider, useTour } from '@reactour/tour';
// We'll add more imports as we create the components

function MainApp() {
  // Modal to introduce the tour
  const [showTourModal, setShowTourModal] = useState(true);
  const { setIsOpen } = useTour();

  // Log when tour state changes
  useEffect(() => {
    console.log('Tour component mounted');
  }, []);

  // Define Reactour steps (selector/content)
  const steps = [
    {
      selector: '[data-tour="summary-cards"]',
      content: '📊 View your portfolio overview including total invested, current value, gains/losses, CAGR, and overall returns.'
    },
    {
      selector: '[data-tour="control-panel"]',
      content: '⚙️ Manage your portfolio: Import CSV files or add new stocks. After adding stocks, you\'ll also see options to refresh prices, export data, and clear your portfolio.'
    },
    {
      selector: '[data-tour="stock-ltp-card"]',
      content: '💹 Get real-time stock quotes and current market prices for any stock symbol by entering the ticker.'
    },
    {
      selector: '[data-tour="search-filter-bar"]',
      content: '🔍 Search for specific stocks in your portfolio or filter to show only gainers or losers.'
    },
    {
      selector: '[data-tour="portfolio-table"]',
      content: '📋 View your complete portfolio with detailed metrics, sort by clicking column headers, customize visible columns, and perform bulk actions.'
    },
    {
      selector: '[data-tour="theme-toggle"]',
      content: '🌙 Toggle between light and dark themes to customize your viewing experience.'
    },
    {
      selector: '[data-tour="help-button"]',
      content: '❓ Click here anytime for help, tips, and detailed instructions about using the app.'
    },
  ];

  // Handle tour start
  const handleStartTour = () => {
    setShowTourModal(false);
    console.log('Starting tour...');
    setIsOpen(true);
  };

  // Enhanced professional modal markup
  const tourModal = showTourModal && (
    <div className="modal-overlay" style={{ 
      display: 'flex', 
      zIndex: 11000,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }}>
      <div className="modal-container" style={{ 
        maxWidth: 500,
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #2563eb, #1e40af)',
          padding: '20px 30px',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <i className="fas fa-chart-line" style={{ fontSize: '24px', color: 'white' }}></i>
            <h3 style={{ 
              margin: 0, 
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              color: 'white'
            }}>
              Welcome to Portfolio Performance Analyzer
            </h3>
          </div>
        </div>
        
        <div className="modal-content" style={{ padding: '25px 30px' }}>
          <div style={{ 
            display: 'flex',
            marginBottom: '20px'
          }}>
            <div style={{ 
              backgroundColor: '#ebf5ff', 
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px',
              flexShrink: 0,
              border: '1px solid #d1e6ff'
            }}>
              <i className="fas fa-route" style={{ fontSize: '24px', color: '#2563eb' }}></i>
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#111827', fontWeight: 600 }}>Take a Quick Tour</h4>
              <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.5' }}>
                Would you like a guided tour of the main features? This will help you get familiar with the app's capabilities.
              </p>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '25px',
            gap: '12px'
          }}>
            <button 
              className="btn" 
              onClick={() => setShowTourModal(false)}
              style={{ 
                padding: '10px 16px',
                background: '#e5e7eb',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                color: '#000000 !important',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '100px',
                fontSize: '14px',
                lineHeight: '20px',
                textAlign: 'center'
              }}
            >
              <span style={{ color: '#000000', fontWeight: 500 }}>Skip Tour</span>
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleStartTour}
              style={{ 
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s ease',
                minWidth: '100px'
              }}
            >
              Start Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PortfolioProvider>
      {tourModal}
      <ThemeToggle />
      <HelpButton />
      <div className="container">
        <div className="card">
          <h1>
            <i className="fas fa-chart-line"></i> Portfolio Performance Analyzer
          </h1>
          
          <SummaryCards />
          <ControlPanel />
          {/* Add StockForm component here */}
          <StockForm />
          {/* Stock Quote Card */}
          <StockLTPCard />
          <SearchFilterBar />
          
          {/* Add PortfolioTable component here */}
          <PortfolioTable />
          
          <Footer />
        </div>
      </div>
      
      {/* Add Modal components here */}
      <ConfirmModal />
      <HelpModal />
    </PortfolioProvider>
  );
}

function App() {
  const steps = [
    {
      selector: '[data-tour="summary-cards"]',
      content: '📊 View your portfolio overview including total invested, current value, gains/losses, CAGR, and overall returns.'
    },
    {
      selector: '[data-tour="control-panel"]',
      content: '⚙️ Manage your portfolio: Import CSV files or add new stocks. After adding stocks, you\'ll also see options to refresh prices, export data, and clear your portfolio.'
    },
    {
      selector: '[data-tour="stock-ltp-card"]',
      content: '💹 Get real-time stock quotes and current market prices for any stock symbol by entering the ticker.'
    },
    {
      selector: '[data-tour="theme-toggle"]',
      content: '🌙 Toggle between light and dark themes to customize your viewing experience.'
    },
    {
      selector: '[data-tour="help-button"]',
      content: '❓ Click here anytime for help, tips, and detailed instructions about using the app.'
    },
  ];

  // Simplified styles for the tour to fix the error
  const tourStyles = {
    popover: base => ({
      ...base,
      padding: '20px',
      maxWidth: '350px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    })
  };

  return (
    <TourProvider 
      steps={steps} 
      showNavigation={true} 
      showBadge={false}
      padding={10}
      styles={tourStyles}
      position="center"
    >
      <MainApp />
    </TourProvider>
  );
}

export default App;

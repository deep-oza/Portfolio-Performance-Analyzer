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
import PortfolioSelector from './components/portfolio/PortfolioSelector';
// Google Analytics import
import ReactGA from 'react-ga';

// Initialize Google Analytics
// Replace UA-XXXXXXXX-X with your actual Google Analytics tracking ID when you get one
const TRACKING_ID = "G-9M4XD5TLJ1";
ReactGA.initialize(TRACKING_ID);

function MainApp() {
  // Check URL parameters for tour restart
  const urlParams = new URLSearchParams(window.location.search);
  const restartTour = urlParams.get('restart-tour') === 'true';
  
  // If restart-tour parameter is present, remove it from URL without page reload
  if (restartTour) {
    const url = new URL(window.location);
    url.searchParams.delete('restart-tour');
    window.history.replaceState({}, '', url.toString());
  }

  // Modal to introduce the tour - check localStorage first
  const [showTourModal, setShowTourModal] = useState(() => {
    return restartTour || localStorage.getItem('tourModalShown') !== 'true';
  });
  const { setIsOpen } = useTour();

  // Get current theme from localStorage
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Track page view when component mounts
  useEffect(() => {
    // Send page view to Google Analytics
    ReactGA.pageview(window.location.pathname + window.location.search);
    console.log('Page view tracked');
  }, []);

  // Log when tour state changes
  useEffect(() => {
    console.log('Tour component mounted');
  }, []);

  // Handle tour start
  const handleStartTour = () => {
    setShowTourModal(false);
    // Save to localStorage that tour has been shown
    localStorage.setItem('tourModalShown', 'true');
    console.log('Starting tour...');
    setIsOpen(true);
    
    // Track tour start event
    ReactGA.event({
      category: 'User Engagement',
      action: 'Started Tour'
    });
  };

  // When user skips the tour, also save to localStorage
  const handleSkipTour = () => {
    setShowTourModal(false);
    localStorage.setItem('tourModalShown', 'true');
    
    // Track tour skip event
    ReactGA.event({
      category: 'User Engagement',
      action: 'Skipped Tour'
    });
  };

  // Add state for analytics and columns controls
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const COLUMN_STORAGE_KEY = 'portfolioTableColumns';
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
    { key: 'totalReturnMerged', label: 'Total Return (₹, %)' },
    { key: 'cagr', label: 'CAGR %' },
    { key: 'daysHeld', label: 'Days Held' },
  ];
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
        maxWidth: 550,
        width: '90%',
        backgroundColor: currentTheme === 'dark' ? '#3C4043' : '#fff',
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
        
        <div className="modal-content" style={{ 
          padding: '25px 30px',
          color: currentTheme === 'dark' ? '#fff' : '#111827'
        }}>
          <div style={{ 
            display: 'flex',
            marginBottom: '20px'
          }}>
            <div style={{ 
              backgroundColor: currentTheme === 'dark' ? '#1e3a8a' : '#ebf5ff', 
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px',
              flexShrink: 0,
              border: currentTheme === 'dark' ? '1px solid #2563eb' : '1px solid #d1e6ff'
            }}>
              <i className="fas fa-route" style={{ fontSize: '24px', color: currentTheme === 'dark' ? '#90cdf4' : '#2563eb' }}></i>
            </div>
            <div>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '18px', 
                color: currentTheme === 'dark' ? '#fff' : '#111827', 
                fontWeight: 600 
              }}>Take a Quick Tour</h4>
              <p style={{ 
                margin: 0, 
                color: currentTheme === 'dark' ? '#e0e0e0' : '#4b5563', 
                lineHeight: '1.5' 
              }}>
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
              onClick={handleSkipTour}
              style={{ 
                padding: '10px 16px',
                background: currentTheme === 'dark' ? '#5F6368' : '#e5e7eb',
                border: currentTheme === 'dark' ? '1px solid #80868B' : '1px solid #d1d5db',
                borderRadius: '6px',
                color: currentTheme === 'dark' ? '#fff !important' : '#000000 !important',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '100px',
                fontSize: '14px',
                lineHeight: '20px',
                textAlign: 'center'
              }}
            >
              <span style={{ color: currentTheme === 'dark' ? '#fff' : '#000000', fontWeight: 500 }}>Skip Tour</span>
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
          
          <PortfolioSelector
            showAnalytics={showAnalytics}
            setShowAnalytics={setShowAnalytics}
            showColumnDropdown={showColumnDropdown}
            setShowColumnDropdown={setShowColumnDropdown}
            handleToggleColumn={handleToggleColumn}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            DEFAULT_COLUMNS={DEFAULT_COLUMNS}
          />
          
          {/* Add PortfolioTable component here */}
          <PortfolioTable
            showAnalytics={showAnalytics}
            setShowAnalytics={setShowAnalytics}
            showColumnDropdown={showColumnDropdown}
            setShowColumnDropdown={setShowColumnDropdown}
            handleToggleColumn={handleToggleColumn}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            DEFAULT_COLUMNS={DEFAULT_COLUMNS}
          />
          
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
  // Get current theme from localStorage
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isDarkMode = currentTheme === 'dark';

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

  // Function to reset tour state
  const resetTour = () => {
    localStorage.removeItem('tourModalShown');
    window.location.reload(); // Reload to show the tour modal again
  };

  // Styles for the tour with dark mode support
  const tourStyles = {
    popover: base => ({
      ...base,
      padding: '40px',
      maxWidth: '550px',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      backgroundColor: isDarkMode ? '#3C4043' : '#fff',
      color: isDarkMode ? '#fff' : '#111827'
    }),
    badge: base => ({
      ...base,
      backgroundColor: isDarkMode ? '#2563eb' : '#1A73E8',
      color: '#fff'
    }),
    controls: base => ({
      ...base,
      backgroundColor: isDarkMode ? '#3C4043' : '#fff',
      color: isDarkMode ? '#fff' : '#111827'
    }),
    button: base => ({
      ...base,
      color: isDarkMode ? '#fff' : '#111827'
    }),
    close: base => ({
      ...base,
      color: isDarkMode ? '#fff' : '#111827'
    })
  };

  return (
    <TourProvider 
      steps={steps} 
      showNavigation={true} 
      showBadge={false}
      padding={10}
      styles={tourStyles}
      position="center-bottom"
    >
      <MainApp />
    </TourProvider>
  );
}

export default App;

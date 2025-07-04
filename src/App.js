import React from 'react';
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
// We'll add more imports as we create the components

function App() {
  return (
    <PortfolioProvider>
      <ThemeToggle />
      <HelpButton />
      <div className="container">
        <div className="card">
          <h1>
            <i className="fas fa-chart-line"></i> Portfolio Performance Analyzer
          </h1>
          
          <SummaryCards />
          <ControlPanel />
          {/* Stock Quote Card */}
          <StockLTPCard />
          <SearchFilterBar />
          
          {/* Add StockForm component here */}
          <StockForm />
          
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

export default App;

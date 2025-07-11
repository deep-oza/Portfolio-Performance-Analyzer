import React, { useContext, useMemo } from 'react';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import './SummaryCards.css';

const SummaryCards = () => {
  const { calculateSummary } = useContext(PortfolioContext);
  
  // Calculate summary values
  const summary = useMemo(() => {
    return calculateSummary();
  }, [calculateSummary]);
  
  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };
  
  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  const getPercentClass = (value) => {
    return value >= 0 ? 'positive' : 'negative';
  };
  
  return (
    <div className="summary-cards" data-tour="summary-cards">
      <div className="summary-card">
        <h3>Total Invested</h3>
        <p className="value" id="totalInvested">
          {formatCurrency(summary.totalInvested)}
        </p>
      </div>
      <div className="summary-card">
        <h3>Current Value</h3>
        <p className="value" id="currentValue">
          {formatCurrency(summary.currentValue)}
        </p>
      </div>
      <div className="summary-card">
        <h3>Total Gain/Loss</h3>
        <p className="value" id="totalGain">
          <span className={getPercentClass(summary.totalGainLoss)}>
            {formatCurrency(summary.totalGainLoss)}
          </span>
        </p>
      </div>
      <div className="summary-card">
        <h3>Average CAGR</h3>
        <p className="value" id="averageCagr">
          {summary.weightedAvgCagr ? (
            <span className={getPercentClass(summary.weightedAvgCagr)}>
              {formatPercent(summary.weightedAvgCagr)}
            </span>
          ) : (
            '-%'
          )}
        </p>
      </div>
      <div className="summary-card">
        <h3>Overall Return</h3>
        <p className="value" id="overallReturn">
          {summary.overallReturn ? (
            <span className={getPercentClass(summary.overallReturn)}>
              {formatPercent(summary.overallReturn)}
            </span>
          ) : (
            '-%'
          )}
        </p>
      </div>
    </div>
  );
};

export default SummaryCards; 
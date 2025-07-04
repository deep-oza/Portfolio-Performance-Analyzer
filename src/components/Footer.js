import React from 'react';

const Footer = () => {
  return (
    <div className="footer">
      <p>
        <strong>Instructions:</strong> Enter current market prices in the
        "Current Price" column and click "Calculate All Metrics" to see CAGR
        and performance analysis.
      </p>
      <p>
        <strong>Return % Since Purchase:</strong> Simple return percentage
        based on unrealized gain/loss only (excluding dividends and realized
        gains)
      </p>
      <p>
        <strong>CAGR:</strong> Compound Annual Growth Rate based on
        unrealized gain/loss only (excluding dividends and realized gains)
      </p>
      <p>
        <strong>Overall Return:</strong> Total portfolio return percentage
        based on unrealized gain/loss only (excluding dividends and realized
        gains)
      </p>
    </div>
  );
};

export default Footer; 
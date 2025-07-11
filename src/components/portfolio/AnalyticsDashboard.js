import React, { useContext, useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import './AnalyticsDashboard.css';

// Helper to format days as years, months, days
function formatDuration(days) {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remDays = days % 30;
  let str = '';
  if (years > 0) str += years + 'y ';
  if (months > 0) str += months + 'm ';
  if (remDays > 0 || (!years && !months)) str += remDays + 'd';
  return str.trim();
}

// Helper to truncate long names
function truncateName(name, maxLen = 18, windowWidth) {
  if (!name) return '';
  // Adjust max length based on screen size
  const adjustedMaxLen = windowWidth <= 767 ? Math.min(maxLen, 12) : maxLen;
  return name.length > adjustedMaxLen ? name.slice(0, adjustedMaxLen - 1) + '…' : name;
}

const AnalyticsDashboard = ({ portfolioData, currentPrices }) => {
  // Get current theme from context
  const { theme } = useContext(PortfolioContext);
  const isDarkTheme = theme === 'dark';
  
  // Add responsive state
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = window.matchMedia && window.matchMedia('(max-width: 500px)').matches;
  const isTablet = windowWidth > 767 && windowWidth <= 1023;

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Theme-aware colors
  const chartBackground = isDarkTheme ? '#383838' : '#fff';
  const cardBackground = isDarkTheme ? '#363636' : '#fff';
  const gridColor = isDarkTheme ? '#606060' : '#ccc';
  const textColor = isDarkTheme ? '#f5f5f5' : '#333';
  const tooltipBackground = isDarkTheme ? '#404040' : '#fff';
  const tooltipBorder = isDarkTheme ? '#606060' : '#ccc';
  const tooltipText = isDarkTheme ? '#f5f5f5' : '#333';

  if (!portfolioData || portfolioData.length === 0) {
    return (
      <div style={{ margin: '2rem 0', textAlign: 'center', color: '#888' }}>
        No portfolio data available for analytics.
      </div>
    );
  }

  // Prepare data for charts
  const chartData = portfolioData.map(stock => {
    const price = parseFloat(currentPrices[stock.symbol]) || 0;
    const invested = stock.qty * stock.avgPrice;
    const currentValue = stock.qty * price;
    const daysHeld = Math.ceil((new Date() - new Date(stock.purchaseDate)) / (1000 * 60 * 60 * 24));
    const years = daysHeld / 365.25;
    let cagr = null;
    if (years > 0 && invested > 0 && currentValue > 0 && daysHeld >= 90) {
      try {
        const rawCagr = (Math.pow(currentValue / invested, 1 / years) - 1) * 100;
        if (isFinite(rawCagr) && !isNaN(rawCagr) && rawCagr > -100 && rawCagr < 200) {
          cagr = rawCagr;
        }
      } catch {}
    }
    return {
      symbol: stock.symbol,
      invested,
      currentValue,
      unrealizedGL: currentValue - invested,
      cagr,
      returnPercent: invested > 0 ? ((currentValue - invested) / invested) * 100 : 0,
    };
  });

  // Prepare data for Top Gainers & Losers
  const sortedByReturn = [...chartData].sort((a, b) => b.returnPercent - a.returnPercent);
  const topGainers = sortedByReturn.slice(0, 5);
  const topLosers = sortedByReturn.slice(-5).reverse();
  const gainersLosersData = [...topGainers, ...topLosers.filter(l => !topGainers.some(g => g.symbol === l.symbol))];

  // Layout styles
  const gridStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? '24px' : '48px',
    margin: isMobile ? '16px 0' : '32px 0',
    width: '100%',
  };
  const cardStyle = {
    background: cardBackground,
    borderRadius: '12px',
    boxShadow: isDarkTheme 
      ? '0 2px 8px rgba(0,0,0,0.2)'
      : '0 2px 8px rgba(0,0,0,0.07)',
    padding: isMobile ? '8px' : '16px',
    minHeight: isMobile ? '300px' : '340px',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${isDarkTheme ? '#444' : '#e0e0e0'}`,
  };
  const titleStyle = {
    fontWeight: 600,
    fontSize: isMobile ? '0.85rem' : '1.1rem',
    marginBottom: '0.5rem',
    color: isDarkTheme ? '#f5f5f5' : 'var(--text-primary, #222)'
  };

  // Responsive grid for short/long term cards
  const holdingGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: isMobile ? '24px' : '32px',
    margin: isMobile ? '16px 0' : '32px 0',
    alignItems: 'start',
  };

  // Theme-aware list group styles
  const listGroupStyle = {
    marginTop: isMobile ? 8 : 12,
    borderRadius: 8,
    border: `1px solid ${isDarkTheme ? '#505050' : '#e0e0e0'}`,
    background: isDarkTheme ? '#383838' : '#fafbfc',
    padding: 0,
    overflow: 'hidden',
  };
  const listItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isMobile ? '8px 12px' : '10px 16px',
    borderBottom: `1px solid ${isDarkTheme ? '#484848' : '#ececec'}`,
    fontSize: isMobile ? 12 : 14,
    minHeight: isMobile ? 36 : 40,
    background: isDarkTheme ? '#404040' : '#fff',
  };
  const lastListItemStyle = {
    ...listItemStyle,
    borderBottom: 'none',
  };
  const nameTextStyle = {
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: isMobile ? '65%' : '75%',
    fontSize: isMobile ? 13 : 15,
    color: isDarkTheme ? '#f5f5f5' : 'inherit',
  };
  const heldTextStyle = {
    color: isDarkTheme ? '#4f8cff' : '#2563c7', // blue highlight - brighter in dark mode
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    marginLeft: isMobile ? 8 : 12,
    minWidth: isMobile ? 50 : 60,
    fontSize: isMobile ? 12 : 'inherit',
    textAlign: 'right',
  };

  // Chart configuration - responsive adjustments
  const getChartMargin = () => {
    if (isMobile) {
      return { top: 10, right: 10, left: -15, bottom: 40 };
    } else if (isTablet) {
      return { top: 10, right: 15, left: -10, bottom: 30 };
    } else {
      return { top: 10, right: 20, left: 0, bottom: 20 };
    }
  };

  const getChartHeight = () => {
    return isMobile ? 220 : 260;
  };

  const getXAxisConfig = () => {
    if (isMobile) {
      return {
        angle: -45,
        fontSize: 9,
        dy: 10,
        interval: 0,
        height: 60
      };
    } else if (isTablet) {
      return {
        angle: -45,
        fontSize: 10,
        dy: 10,
        interval: 0,
        height: 50
      };
    } else {
      return {
        angle: -45,
        fontSize: 11,
        dy: 10,
        interval: 0
      };
    }
  };

  const getLegendStyle = () => {
    return {
      color: textColor,
      fontSize: isMobile ? 10 : 12,
      marginTop: isMobile ? 0 : 5
    };
  };

  // Chart custom tooltip style
  const getTooltipStyle = () => {
    return {
      background: tooltipBackground,
      border: `1px solid ${tooltipBorder}`,
      color: tooltipText,
      fontSize: isMobile ? 10 : 12,
      padding: isMobile ? '5px' : '10px',
    };
  };

  return (
    <div className="analytics-dashboard-wrapper">
      <h2 className="analytics-dashboard-title">
        📊 Portfolio Analytics
      </h2>
      {isMobile ? (
        <div className="analytics-dashboard-mobile-info">
          <div className="analytics-dashboard-mobile-icon">📊</div>
          <div className="analytics-dashboard-mobile-title">
            Analytics Available on Desktop
          </div>
          <div className="analytics-dashboard-mobile-desc">
            For the best experience, please use a desktop or tablet device to view detailed portfolio analytics and charts.
          </div>
          <button
            className="analytics-dashboard-mobile-btn"
            onClick={() => window.location.href = '/'}
          >
            Back to Portfolio
          </button>
        </div>
      ) : (
        <div className="analytics-dashboard-grid">
        {/* CAGR by Stock – Column/Vertical bar chart */}
        <div style={cardStyle}>
          <div style={titleStyle}>CAGR by Stock</div>
            <ResponsiveContainer width="100%" height={getChartHeight()} style={{ background: chartBackground }}>
              <BarChart data={chartData} margin={getChartMargin()}>
              <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" tick={getXAxisConfig()} />
                <YAxis width={isMobile ? 35 : 40} tickFormatter={v => v + '%'} />
                <Tooltip 
                  formatter={v => v.toFixed(2) + '%'} 
                  contentStyle={getTooltipStyle()}
                />
                <Legend wrapperStyle={getLegendStyle()} />
              <Bar dataKey="cagr" fill="#82ca9d" name="CAGR %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--divider, #444)', margin: isMobile ? '16px 0' : '32px 0' }} />
        {/* Return % per Stock – Column chart */}
        <div style={cardStyle}>
          <div style={titleStyle}>Return % per Stock</div>
            <ResponsiveContainer width="100%" height={getChartHeight()} style={{ background: chartBackground }}>
              <BarChart data={chartData} margin={getChartMargin()}>
              <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" tick={getXAxisConfig()} />
                <YAxis width={isMobile ? 35 : 40} tickFormatter={v => v + '%'} />
                <Tooltip 
                  formatter={v => v.toFixed(2) + '%'} 
                  contentStyle={getTooltipStyle()}
                />
                <Legend wrapperStyle={getLegendStyle()} />
              <Bar dataKey="returnPercent" fill="#ffc658" name="Return %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--divider, #444)', margin: isMobile ? '16px 0' : '32px 0' }} />
        {/* Invested vs Current Value – Grouped bar chart */}
        <div style={cardStyle}>
          <div style={titleStyle}>Invested vs Current Value</div>
            <ResponsiveContainer width="100%" height={getChartHeight()} style={{ background: chartBackground }}>
              <BarChart data={chartData} margin={getChartMargin()}>
              <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" tick={getXAxisConfig()} />
                <YAxis 
                  width={isMobile ? 35 : 40} 
                  tickFormatter={value => 
                    isMobile ? value.toLocaleString(undefined, {notation: 'compact', maximumFractionDigits: 1}) : value
                  }
                />
                <Tooltip 
                  formatter={v => v.toLocaleString(undefined, { maximumFractionDigits: 2 })} 
                  contentStyle={getTooltipStyle()}
                />
                <Legend wrapperStyle={getLegendStyle()} />
              <Bar dataKey="invested" fill="#8884d8" name="Invested" />
              <Bar dataKey="currentValue" fill="#82ca9d" name="Current Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--divider, #444)', margin: isMobile ? '16px 0' : '32px 0' }} />
        {/* Top Gainers & Losers – Bar chart */}
        <div style={cardStyle}>
          <div style={titleStyle}>Top Gainers & Losers</div>
            <ResponsiveContainer width="100%" height={getChartHeight()} style={{ background: chartBackground }}>
              <BarChart data={gainersLosersData} margin={getChartMargin()}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis 
                  dataKey="symbol" 
                  tick={{ 
                    ...getXAxisConfig(), 
                    fill: textColor 
                  }} 
                />
                <YAxis 
                  width={isMobile ? 35 : 40} 
                  tickFormatter={v => v + '%'} 
                  tick={{ fill: textColor }} 
                />
              <Tooltip 
                formatter={v => v.toFixed(2) + '%'} 
                  contentStyle={getTooltipStyle()}
              />
                <Legend wrapperStyle={getLegendStyle()} />
              <Bar dataKey="returnPercent" name="Return %" >
                {gainersLosersData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.returnPercent >= 0 ? '#4caf50' : '#e53935'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--divider, #444)', margin: isMobile ? '16px 0' : '32px 0' }} />
        <div style={holdingGridStyle}>
          {/* Short Term Holdings – List group only, no chart */}
          <div style={cardStyle}>
            <div style={titleStyle}>Short Term Holdings (≤ 1 year)</div>
            {/* List stocks in short term as list group */}
              <div style={{ marginTop: isMobile ? 10 : 16 }}>
                <div style={{ fontWeight: 500, marginBottom: 4, fontSize: isMobile ? 13 : 'inherit' }}>Stocks:</div>
              {(() => {
                const stocks = portfolioData.filter(stock => {
                  const purchase = new Date(stock.purchaseDate);
                  const today = new Date();
                  const days = Math.ceil(Math.abs(today - purchase) / (1000 * 60 * 60 * 24));
                  return days <= 365;
                });
                if (stocks.length === 0) return <div style={{ color: '#888' }}>No short term holdings</div>;
                return (
                  <div style={listGroupStyle}>
                    {stocks.map((stock, idx) => {
                      const purchase = new Date(stock.purchaseDate);
                      const today = new Date();
                      const days = Math.ceil(Math.abs(today - purchase) / (1000 * 60 * 60 * 24));
                      const isLast = idx === stocks.length - 1;
                      return (
                        <div key={stock.symbol} style={isLast ? lastListItemStyle : listItemStyle}>
                            <span style={nameTextStyle} title={stock.name || stock.symbol}>{truncateName(stock.name || stock.symbol, 32, windowWidth)}</span>
                          <span style={heldTextStyle}>{formatDuration(days)}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
          {/* Long Term Holdings – List group only, no chart */}
          <div style={cardStyle}>
            <div style={titleStyle}>Long Term Holdings (&gt; 1 year)</div>
            {/* List stocks in long term as list group */}
              <div style={{ marginTop: isMobile ? 10 : 16 }}>
                <div style={{ fontWeight: 500, marginBottom: 4, fontSize: isMobile ? 13 : 'inherit' }}>Stocks:</div>
              {(() => {
                const stocks = portfolioData.filter(stock => {
                  const purchase = new Date(stock.purchaseDate);
                  const today = new Date();
                  const days = Math.ceil(Math.abs(today - purchase) / (1000 * 60 * 60 * 24));
                  return days > 365;
                });
                if (stocks.length === 0) return <div style={{ color: '#888' }}>No long term holdings</div>;
                return (
                  <div style={listGroupStyle}>
                    {stocks.map((stock, idx) => {
                      const purchase = new Date(stock.purchaseDate);
                      const today = new Date();
                      const days = Math.ceil(Math.abs(today - purchase) / (1000 * 60 * 60 * 24));
                      const isLast = idx === stocks.length - 1;
                      return (
                        <div key={stock.symbol} style={isLast ? lastListItemStyle : listItemStyle}>
                            <span style={nameTextStyle} title={stock.name || stock.symbol}>{truncateName(stock.name || stock.symbol, 32, windowWidth)}</span>
                          <span style={heldTextStyle}>{formatDuration(days)}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 
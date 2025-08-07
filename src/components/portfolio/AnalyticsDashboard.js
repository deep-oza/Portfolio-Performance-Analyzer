import React, { useContext, useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import GainLossChart from './GainLossChart'; // Import the new component
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
        height: 60
      };
    } else {
      return {
        angle: -30,
        fontSize: 12,
        dy: 5,
        interval: 0,
        height: 40
      };
    }
  };

  const getYAxisConfig = () => {
    return {
      fontSize: isMobile ? 10 : 12,
      width: isMobile ? 30 : 40,
      tickFormatter: (value) => `₹${(value / 1000).toFixed(0)}k`,
    };
  };

  const getTooltipConfig = () => {
    return {
      cursor: { fill: 'transparent' },
      contentStyle: { 
        backgroundColor: tooltipBackground, 
        borderColor: tooltipBorder, 
        borderRadius: '8px', 
        fontSize: isMobile ? 12 : 14,
        padding: '10px 12px',
      },
      labelStyle: { color: tooltipText, marginBottom: '5px', fontWeight: 'bold' },
      itemStyle: { color: tooltipText },
      formatter: (value) => `₹${value.toLocaleString('en-IN')}`,
    };
  };

  const getLegendConfig = () => {
    return {
      wrapperStyle: {
        fontSize: isMobile ? 10 : 12,
        color: textColor,
        paddingTop: '10px',
      },
      iconSize: isMobile ? 10 : 12,
    };
  };

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-grid" style={gridStyle}>
        {/* Top Gainers Card */}
        <div className="card" style={cardStyle}>
          <h3 style={titleStyle}>Top 5 Gainers</h3>
          <div style={listGroupStyle}>
            {topGainers.length > 0 ? (
              topGainers.map((stock, idx) => (
                <div key={stock.symbol} style={idx === topGainers.length - 1 ? lastListItemStyle : listItemStyle}>
                  <span style={nameTextStyle} title={stock.symbol}>{truncateName(stock.symbol, 18, windowWidth)}</span>
                  <span style={{ color: '#4CAF50', fontWeight: 600, fontSize: isMobile ? 13 : 15 }}>
                    {stock.returnPercent.toFixed(2)}%
                  </span>
                </div>
              ))
            ) : (
              <div style={{ ...listItemStyle, justifyContent: 'center', color: '#888' }}>No top gainers.</div>
            )}
          </div>
        </div>

        {/* Top Losers Card */}
        <div className="card" style={cardStyle}>
          <h3 style={titleStyle}>Top 5 Losers</h3>
          <div style={listGroupStyle}>
            {topLosers.length > 0 ? (
              topLosers.map((stock, idx) => (
                <div key={stock.symbol} style={idx === topLosers.length - 1 ? lastListItemStyle : listItemStyle}>
                  <span style={nameTextStyle} title={stock.symbol}>{truncateName(stock.symbol, 18, windowWidth)}</span>
                  <span style={{ color: '#F44336', fontWeight: 600, fontSize: isMobile ? 13 : 15 }}>
                    {stock.returnPercent.toFixed(2)}%
                  </span>
                </div>
              ))
            ) : (
              <div style={{ ...listItemStyle, justifyContent: 'center', color: '#888' }}>No top losers.</div>
            )}
          </div>
        </div>

        {/* New GainLossChart component */}
        <div className="card gain-loss-chart-card" style={{ ...cardStyle, gridColumn: 'span 2' }}>
          <h3 style={titleStyle}>Total Gain/Loss Distribution</h3>
          <GainLossChart portfolioData={portfolioData} currentPrices={currentPrices} />
        </div>

        {/* CAGR Distribution Chart */}
        <div className="card" style={cardStyle}>
          <h3 style={titleStyle}>CAGR Distribution</h3>
          <ResponsiveContainer width="100%" height={getChartHeight()}>
            <BarChart
              data={chartData.filter(d => d.cagr !== null).sort((a, b) => b.cagr - a.cagr)}
              margin={getChartMargin()}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="symbol"
                stroke={textColor}
                tickLine={false}
                axisLine={false}
                {...getXAxisConfig()}
                formatter={(value) => truncateName(value, 10, windowWidth)}
              />
              <YAxis
                stroke={textColor}
                tickLine={false}
                axisLine={false}
                {...getYAxisConfig()}
                label={{ value: 'CAGR (%)', angle: -90, position: 'insideLeft', fill: textColor, fontSize: isMobile ? 10 : 12 }}
              />
              <Tooltip {...getTooltipConfig()} formatter={(value) => `${value.toFixed(2)}%`} />
              <Legend {...getLegendConfig()} />
              <Bar dataKey="cagr" name="CAGR" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cagr >= 0 ? '#4CAF50' : '#F44336'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Investment vs. Current Value Chart */}
        <div className="card" style={cardStyle}>
          <h3 style={titleStyle}>Investment vs. Current Value</h3>
          <ResponsiveContainer width="100%" height={getChartHeight()}>
            <BarChart
              data={chartData.sort((a, b) => b.invested - a.invested)}
              margin={getChartMargin()}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="symbol"
                stroke={textColor}
                tickLine={false}
                axisLine={false}
                {...getXAxisConfig()}
                formatter={(value) => truncateName(value, 10, windowWidth)}
              />
              <YAxis
                stroke={textColor}
                tickLine={false}
                axisLine={false}
                {...getYAxisConfig()}
                label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', fill: textColor, fontSize: isMobile ? 10 : 12 }}
              />
              <Tooltip {...getTooltipConfig()} />
              <Legend {...getLegendConfig()} />
              <Bar dataKey="invested" name="Invested" fill="#82ca9d" />
              <Bar dataKey="currentValue" name="Current Value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Longest Held Stocks Card */}
        <div className="card" style={{ ...cardStyle, ...holdingGridStyle }}>
          <h3 style={titleStyle}>Longest Held Stocks</h3>
          <div style={listGroupStyle}>
            {(() => {
              const sortedStocks = [...portfolioData].sort((a, b) => {
                const daysA = Math.ceil((new Date() - new Date(a.purchaseDate)) / (1000 * 60 * 60 * 24));
                const daysB = Math.ceil((new Date() - new Date(b.purchaseDate)) / (1000 * 60 * 60 * 24));
                return daysB - daysA;
              }).slice(0, 5);

              return sortedStocks.length > 0 ? (
                sortedStocks.map((stock, idx, stocks) => {
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
                })
              ) : (
                <div style={{ ...listItemStyle, justifyContent: 'center', color: '#888' }}>No stocks held for long term.</div>
              );
            })()}
          </div>
        </div>

        {/* Shortest Held Stocks Card */}
        <div className="card" style={{ ...cardStyle, ...holdingGridStyle }}>
          <h3 style={titleStyle}>Shortest Held Stocks</h3>
          <div style={listGroupStyle}>
            {(() => {
              const sortedStocks = [...portfolioData].sort((a, b) => {
                const daysA = Math.ceil((new Date() - new Date(a.purchaseDate)) / (1000 * 60 * 60 * 24));
                const daysB = Math.ceil((new Date() - new Date(b.purchaseDate)) / (1000 * 60 * 60 * 24));
                return daysA - daysB;
              }).slice(0, 5);

              return sortedStocks.length > 0 ? (
                sortedStocks.map((stock, idx, stocks) => {
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
                })
              ) : (
                <div style={{ ...listItemStyle, justifyContent: 'center', color: '#888' }}>No stocks held for short term.</div>
              );
            })()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;
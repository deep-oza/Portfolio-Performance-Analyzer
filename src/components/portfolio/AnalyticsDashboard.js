import React, { useContext, useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { PortfolioContext } from '../../contexts/PortfolioContext';

// Helper to calculate CAGR
function calculateCAGR(invested, currentValue, purchaseDate) {
  if (!invested || !currentValue || !purchaseDate) return 0;
  const start = new Date(purchaseDate);
  const now = new Date();
  const years = (now - start) / (1000 * 60 * 60 * 24 * 365.25);
  if (years <= 0 || invested <= 0 || currentValue <= 0) return 0;
  try {
    return (Math.pow(currentValue / invested, 1 / years) - 1) * 100;
  } catch {
    return 0;
  }
}

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
  const isMobile = windowWidth <= 767;
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

  // Prepare data for Short Term and Long Term Holding Period Histograms
  const shortTermBins = [
    { label: '0-30d', min: 0, max: 30 },
    { label: '31-90d', min: 31, max: 90 },
    { label: '91-180d', min: 91, max: 180 },
    { label: '181-365d', min: 181, max: 365 },
  ];
  const longTermBins = [
    { label: '1-2y', min: 366, max: 730 },
    { label: '2y+', min: 731, max: Infinity },
  ];
  const shortTermHistogram = shortTermBins.map(bin => ({
    label: bin.label,
    count: portfolioData.filter(stock => {
      const purchase = new Date(stock.purchaseDate);
      const today = new Date();
      const days = Math.ceil(Math.abs(today - purchase) / (1000 * 60 * 60 * 24));
      return days >= bin.min && days <= bin.max;
    }).length
  }));
  const longTermHistogram = longTermBins.map(bin => ({
    label: bin.label,
    count: portfolioData.filter(stock => {
      const purchase = new Date(stock.purchaseDate);
      const today = new Date();
      const days = Math.ceil(Math.abs(today - purchase) / (1000 * 60 * 60 * 24));
      return days >= bin.min && days <= bin.max;
    }).length
  }));

  // Custom tooltip for holding period histogram
  const HoldingTooltip = (bins) => ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const bin = bins.find(b => b.label === label);
      const stocksInBin = portfolioData.filter(stock => {
        const purchase = new Date(stock.purchaseDate);
        const today = new Date();
        const days = Math.ceil(Math.abs(today - purchase) / (1000 * 60 * 60 * 24));
        return days >= bin.min && days <= bin.max;
      });
      return (
        <div style={{ 
          background: tooltipBackground, 
          border: `1px solid ${tooltipBorder}`, 
          padding: isMobile ? 6 : 10, 
          borderRadius: 6, 
          minWidth: isMobile ? 100 : 120,
          fontSize: isMobile ? 11 : 'inherit',
          color: tooltipText
        }}>
          <div style={{ fontWeight: 600 }}>{label}</div>
          <div>Stocks: {payload[0].value}</div>
          {stocksInBin.length > 0 && (
            <div style={{ marginTop: isMobile ? 4 : 6, fontSize: isMobile ? 10 : 12 }}>
              <div style={{ fontWeight: 500 }}>Symbols:</div>
              <div>{stocksInBin.map(s => s.symbol).join(', ')}</div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Layout styles
  const gridStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? '1.5rem' : '3rem',
    margin: isMobile ? '1rem 0' : '2rem 0',
    width: '100%',
  };
  const cardStyle = {
    background: cardBackground,
    borderRadius: '12px',
    boxShadow: isDarkTheme 
      ? '0 2px 8px rgba(0,0,0,0.2)'
      : '0 2px 8px rgba(0,0,0,0.07)',
    padding: isMobile ? '0.5rem' : '1rem',
    minHeight: isMobile ? '300px' : '340px',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${isDarkTheme ? '#444' : '#e0e0e0'}`,
  };
  const titleStyle = {
    fontWeight: 600,
    fontSize: isMobile ? '0.95rem' : '1.1rem',
    marginBottom: '0.5rem',
    color: isDarkTheme ? '#f5f5f5' : 'var(--text-primary, #222)'
  };

  // Responsive grid for short/long term cards
  const holdingGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: isMobile ? '1.5rem' : '2rem',
    margin: isMobile ? '1rem 0' : '2rem 0',
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
    <div style={{ width: '100%' }}>
      <h2 style={{ 
        textAlign: 'center', 
        margin: isMobile ? '1rem 0 0.25rem' : '1.5rem 0 0.5rem', 
        fontSize: isMobile ? '1.2rem' : '1.5rem' 
      }}>
        📊 Portfolio Analytics
      </h2>
      {isMobile ? (
        <div style={{
          margin: '2.5rem auto',
          maxWidth: 370,
          background: isDarkTheme ? 'linear-gradient(135deg, #23272f 80%, #2563c7 100%)' : 'linear-gradient(135deg, #f4f6fa 80%, #dbeafe 100%)',
          border: isDarkTheme ? '1.5px solid #2563c7' : '1.5px solid #2563c7',
          borderRadius: 18,
          boxShadow: isDarkTheme ? '0 4px 16px rgba(0,0,0,0.22)' : '0 4px 16px rgba(0,0,0,0.09)',
          padding: '2.5rem 1.5rem 2rem 1.5rem',
          textAlign: 'center',
          color: isDarkTheme ? '#e0e6f0' : '#1e293b',
          fontSize: 17,
          fontWeight: 500,
          letterSpacing: 0.01,
          position: 'relative',
        }}>
          <div style={{
            fontSize: 48,
            marginBottom: 18,
            color: '#2563c7',
            filter: isDarkTheme ? 'drop-shadow(0 2px 6px #111)' : 'drop-shadow(0 2px 6px #b6c6e6)'
          }}>📊</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            Analytics Available on Desktop
          </div>
          <div style={{ fontSize: 15, color: isDarkTheme ? '#b6c6e6' : '#334155', marginBottom: 22 }}>
            For the best experience, please use a desktop or tablet device to view detailed portfolio analytics and charts.
          </div>
          <button
            style={{
              background: '#2563c7',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 22px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: isDarkTheme ? '0 2px 8px #111' : '0 2px 8px #b6c6e6',
              transition: 'background 0.2s',
            }}
            onClick={() => window.location.href = '/'}
          >
            Back to Portfolio
          </button>
        </div>
      ) : (
        <div style={gridStyle}>
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
          <hr style={{ border: 'none', borderTop: '1px solid var(--divider, #444)', margin: isMobile ? '1rem 0' : '2rem 0' }} />
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
          <hr style={{ border: 'none', borderTop: '1px solid var(--divider, #444)', margin: isMobile ? '1rem 0' : '2rem 0' }} />
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
          <hr style={{ border: 'none', borderTop: '1px solid var(--divider, #444)', margin: isMobile ? '1rem 0' : '2rem 0' }} />
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
          <hr style={{ border: 'none', borderTop: '1px solid var(--divider, #444)', margin: isMobile ? '1rem 0' : '2rem 0' }} />
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
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';

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
function truncateName(name, maxLen = 18) {
  if (!name) return '';
  return name.length > maxLen ? name.slice(0, maxLen - 1) + '…' : name;
}

const AnalyticsDashboard = ({ portfolioData, currentPrices }) => {
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
    return {
      symbol: stock.symbol,
      invested,
      currentValue,
      unrealizedGL: currentValue - invested,
      cagr: calculateCAGR(invested, currentValue, stock.purchaseDate),
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
        <div style={{ background: '#fff', border: '1px solid #ccc', padding: 10, borderRadius: 6, minWidth: 120 }}>
          <div style={{ fontWeight: 600 }}>{label}</div>
          <div>Stocks: {payload[0].value}</div>
          {stocksInBin.length > 0 && (
            <div style={{ marginTop: 6, fontSize: 12 }}>
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
    gap: '3rem',
    margin: '2rem 0',
    width: '100%',
  };
  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    padding: '1rem',
    minHeight: '340px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e0e0e0',
  };
  const titleStyle = {
    fontWeight: 600,
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
    color: 'var(--text-primary, #222)'
  };

  // Responsive grid for short/long term cards
  const holdingGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    margin: '2rem 0',
    alignItems: 'start',
  };

  // List group item style
  const listGroupStyle = {
    marginTop: 12,
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    background: '#fafbfc',
    padding: 0,
    overflow: 'hidden',
  };
  const listItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderBottom: '1px solid #ececec',
    fontSize: 14,
    minHeight: 36,
    background: '#fff',
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
    maxWidth: 180,
  };
  const heldTextStyle = {
    color: '#2563c7',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    marginLeft: 12,
    minWidth: 60,
    textAlign: 'right',
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ textAlign: 'center', margin: '1.5rem 0 0.5rem', fontSize: '1.5rem' }}>
        📊 Portfolio Analytics
      </h2>
      <div style={gridStyle}>
        {/* Unrealized Gain/Loss per Stock – Bar chart */}
        <div style={cardStyle}>
          <div style={titleStyle}>Unrealized Gain/Loss per Stock</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symbol" interval={0} tick={{ angle: -45, fontSize: 11, dy: 10 }} />
              <YAxis />
              <Tooltip formatter={v => v.toLocaleString(undefined, { maximumFractionDigits: 2 })} />
              <Legend />
              <Bar dataKey="unrealizedGL" fill="#8884d8" name="Unrealized G/L" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--divider, #444)', margin: '2rem 0' }} />
        {/* CAGR by Stock – Column/Vertical bar chart */}
        <div style={cardStyle}>
          <div style={titleStyle}>CAGR by Stock</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symbol" interval={0} tick={{ angle: -45, fontSize: 11, dy: 10 }} />
              <YAxis tickFormatter={v => v + '%'} />
              <Tooltip formatter={v => v.toFixed(2) + '%'} />
              <Legend />
              <Bar dataKey="cagr" fill="#82ca9d" name="CAGR %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--divider, #444)', margin: '2rem 0' }} />
        {/* Return % per Stock – Column chart */}
        <div style={cardStyle}>
          <div style={titleStyle}>Return % per Stock</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symbol" interval={0} tick={{ angle: -45, fontSize: 11, dy: 10 }} />
              <YAxis tickFormatter={v => v + '%'} />
              <Tooltip formatter={v => v.toFixed(2) + '%'} />
              <Legend />
              <Bar dataKey="returnPercent" fill="#ffc658" name="Return %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--divider, #444)', margin: '2rem 0' }} />
        {/* Invested vs Current Value – Grouped bar chart */}
        <div style={cardStyle}>
          <div style={titleStyle}>Invested vs Current Value</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symbol" interval={0} tick={{ angle: -45, fontSize: 11, dy: 10 }} />
              <YAxis />
              <Tooltip formatter={v => v.toLocaleString(undefined, { maximumFractionDigits: 2 })} />
              <Legend />
              <Bar dataKey="invested" fill="#8884d8" name="Invested" />
              <Bar dataKey="currentValue" fill="#82ca9d" name="Current Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--divider, #444)', margin: '2rem 0' }} />
        {/* Top Gainers & Losers – Bar chart */}
        <div style={cardStyle}>
          <div style={titleStyle}>Top Gainers & Losers</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={gainersLosersData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symbol" interval={0} tick={{ angle: -45, fontSize: 11, dy: 10 }} />
              <YAxis tickFormatter={v => v + '%'} />
              <Tooltip formatter={v => v.toFixed(2) + '%'} />
              <Legend />
              <Bar dataKey="returnPercent" name="Return %" >
                {gainersLosersData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.returnPercent >= 0 ? '#4caf50' : '#e53935'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--divider, #444)', margin: '2rem 0' }} />
        <div style={holdingGridStyle}>
          {/* Short Term Holdings – Histogram */}
          <div style={cardStyle}>
            <div style={titleStyle}>Short Term Holdings (≤ 1 year)</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={shortTermHistogram} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" interval={0} tick={{ angle: -45, fontSize: 11, dy: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip content={HoldingTooltip(shortTermBins)} />
                <Legend />
                <Bar dataKey="count" fill="#4f8cff" name="Stocks" />
              </BarChart>
            </ResponsiveContainer>
            {/* List stocks in short term as list group */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Stocks:</div>
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
                          <span style={nameTextStyle} title={stock.name || stock.symbol}>{truncateName(stock.name || stock.symbol, 24)}</span>
                          <span style={heldTextStyle}>{formatDuration(days)}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
          {/* Long Term Holdings – Histogram */}
          <div style={cardStyle}>
            <div style={titleStyle}>Long Term Holdings (&gt; 1 year)</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={longTermHistogram} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" interval={0} tick={{ angle: -45, fontSize: 11, dy: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip content={HoldingTooltip(longTermBins)} />
                <Legend />
                <Bar dataKey="count" fill="#4f8cff" name="Stocks" />
              </BarChart>
            </ResponsiveContainer>
            {/* List stocks in long term as list group */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Stocks:</div>
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
                          <span style={nameTextStyle} title={stock.name || stock.symbol}>{truncateName(stock.name || stock.symbol, 24)}</span>
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
    </div>
  );
};

export default AnalyticsDashboard; 
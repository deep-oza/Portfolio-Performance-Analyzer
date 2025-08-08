import React, { useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import './GainLossChart.css';

const GainLossChart = ({ portfolioData, currentPrices }) => {
  const { theme } = useContext(PortfolioContext);
  const isDarkTheme = theme === 'dark';

  if (!portfolioData || portfolioData.length === 0) {
    return null;
  }

  // Calculate total gains and losses
  let totalGain = 0; 
  let totalLoss = 0;

  portfolioData.forEach(stock => {
    const price = parseFloat(currentPrices[stock.symbol]) || 0;
    const unrealizedGL = (price - stock.avgPrice) * stock.qty;
    if (unrealizedGL > 0) {
      totalGain += unrealizedGL;
    } else {
      totalLoss += Math.abs(unrealizedGL);
    }
  });

  const data = [
    { name: 'Total Gain', value: totalGain, fill: '#4CAF50' },
    { name: 'Total Loss', value: totalLoss, fill: '#F44336' },
  ];

  return (
    <div className="gain-loss-chart-container" style={{ background: isDarkTheme ? '#363636' : '#fff' }}>
      <h3 style={{ color: isDarkTheme ? '#f5f5f5' : '#333' }}>Total Gain vs. Total Loss</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkTheme ? '#555' : '#eee'} />
          <XAxis dataKey="name" stroke={isDarkTheme ? '#f5f5f5' : '#333'} />
          <YAxis stroke={isDarkTheme ? '#f5f5f5' : '#333'} />
          <Tooltip 
            formatter={(value) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
            contentStyle={{
              background: isDarkTheme ? '#424242' : '#fff',
              borderColor: isDarkTheme ? '#555' : '#ddd'
            }}
          />
          <Bar dataKey="value" fill="#8884d8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList dataKey="value" position="top" formatter={(value) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GainLossChart;
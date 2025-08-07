import React, { useContext } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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
    { name: 'Total Gain', value: totalGain },
    { name: 'Total Loss', value: totalLoss },
  ];

  const COLORS = ['#4CAF50', '#F44336'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="gain-loss-chart-container" style={{ background: isDarkTheme ? '#363636' : '#fff' }}>
      <h3 style={{ color: isDarkTheme ? '#f5f5f5' : '#333' }}>Total Gain vs. Total Loss</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GainLossChart;
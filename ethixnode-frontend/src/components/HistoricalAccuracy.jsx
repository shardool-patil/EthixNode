import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Dynamic data object holding unique backtest results for all 5 currencies
const CURRENCY_DATA = {
  EUR: {
    winRate: '89.4%', yieldIncrease: '+1.24%', totalSavings: '₹36,000', symbol: '€',
    chart: [
      { day: 'Day 1', cumulativeSavings: 0 }, { day: 'Day 4', cumulativeSavings: 7 },
      { day: 'Day 8', cumulativeSavings: 7 }, { day: 'Day 12', cumulativeSavings: 16 },
      { day: 'Day 16', cumulativeSavings: 16 }, { day: 'Day 20', cumulativeSavings: 29 },
      { day: 'Day 24', cumulativeSavings: 29 }, { day: 'Day 28', cumulativeSavings: 36 },
      { day: 'Day 30', cumulativeSavings: 36 },
    ]
  },
  USD: {
    winRate: '92.1%', yieldIncrease: '+1.45%', totalSavings: '₹42,500', symbol: '$',
    chart: [
      { day: 'Day 1', cumulativeSavings: 0 }, { day: 'Day 4', cumulativeSavings: 5 },
      { day: 'Day 8', cumulativeSavings: 12 }, { day: 'Day 12', cumulativeSavings: 12 },
      { day: 'Day 16', cumulativeSavings: 20 }, { day: 'Day 20', cumulativeSavings: 25 },
      { day: 'Day 24', cumulativeSavings: 25 }, { day: 'Day 28', cumulativeSavings: 38 },
      { day: 'Day 30', cumulativeSavings: 42.5 },
    ]
  },
  GBP: {
    winRate: '85.2%', yieldIncrease: '+0.98%', totalSavings: '₹28,400', symbol: '£',
    chart: [
      { day: 'Day 1', cumulativeSavings: 0 }, { day: 'Day 4', cumulativeSavings: 4 },
      { day: 'Day 8', cumulativeSavings: 4 }, { day: 'Day 12', cumulativeSavings: 10 },
      { day: 'Day 16', cumulativeSavings: 15 }, { day: 'Day 20', cumulativeSavings: 15 },
      { day: 'Day 24', cumulativeSavings: 22 }, { day: 'Day 28', cumulativeSavings: 22 },
      { day: 'Day 30', cumulativeSavings: 28.4 },
    ]
  },
  SGD: {
    winRate: '88.7%', yieldIncrease: '+1.15%', totalSavings: '₹32,100', symbol: 'S$',
    chart: [
      { day: 'Day 1', cumulativeSavings: 0 }, { day: 'Day 4', cumulativeSavings: 6 },
      { day: 'Day 8', cumulativeSavings: 6 }, { day: 'Day 12', cumulativeSavings: 14 },
      { day: 'Day 16', cumulativeSavings: 18 }, { day: 'Day 20', cumulativeSavings: 18 },
      { day: 'Day 24', cumulativeSavings: 26 }, { day: 'Day 28', cumulativeSavings: 30 },
      { day: 'Day 30', cumulativeSavings: 32.1 },
    ]
  },
  AED: {
    winRate: '90.5%', yieldIncrease: '+1.30%', totalSavings: '₹38,200', symbol: 'د.إ',
    chart: [
      { day: 'Day 1', cumulativeSavings: 0 }, { day: 'Day 4', cumulativeSavings: 8 },
      { day: 'Day 8', cumulativeSavings: 15 }, { day: 'Day 12', cumulativeSavings: 15 },
      { day: 'Day 16', cumulativeSavings: 24 }, { day: 'Day 20', cumulativeSavings: 24 },
      { day: 'Day 24', cumulativeSavings: 31 }, { day: 'Day 28', cumulativeSavings: 31 },
      { day: 'Day 30', cumulativeSavings: 38.2 },
    ]
  }
};

const HistoricalAccuracy = () => {
  const [activeTab, setActiveTab] = useState('EUR');
  
  // Pull the active data based on which tab is clicked
  const currentData = CURRENCY_DATA[activeTab];

  return (
    <div className="glass-card" style={{ marginTop: '2rem' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3>AI Backtesting & Accuracy Tracker</h3>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginTop: '4px' }}>
            30-day historical performance of EthixNode AI vs. blind market execution.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Dynamically map all available currencies from our object */}
          {Object.keys(CURRENCY_DATA).map(curr => (
            <button 
              key={curr}
              onClick={() => setActiveTab(curr)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: `1px solid ${activeTab === curr ? '#fd366e' : 'rgba(255,255,255,0.1)'}`,
                background: activeTab === curr ? 'rgba(253, 54, 110, 0.1)' : 'transparent',
                color: activeTab === curr ? '#fd366e' : '#a1a1aa',
                cursor: 'pointer',
                transition: '0.2s',
                fontWeight: activeTab === curr ? '600' : '400'
              }}
            >
              {curr}/INR
            </button>
          ))}
        </div>
      </div>

      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: '1.5rem', marginBottom: '2rem' }}>
        <div className="metric-box outline">
          <span className="label">AI Win Rate</span>
          <strong className="text-green" style={{ fontSize: '1.8rem' }}>{currentData.winRate}</strong>
          <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Profitable signals generated</span>
        </div>
        <div className="metric-box outline">
          <span className="label">Average Yield Increase</span>
          <strong className="text-green" style={{ fontSize: '1.8rem' }}>{currentData.yieldIncrease}</strong>
          <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Per {currentData.symbol}1,000 transferred</span>
        </div>
        <div className="metric-box outline">
          <span className="label">Total 30-Day Savings</span>
          <strong style={{ fontSize: '1.8rem', color: '#fff' }}>{currentData.totalSavings}</strong>
          <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Based on 10k volume</span>
        </div>
      </div>

      <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          {/* Feed the specific chart array to Recharts */}
          <AreaChart data={currentData.chart} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="day" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}k`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ fontWeight: 'bold' }}
              formatter={(value, name) => [name === 'cumulativeSavings' ? `₹${value},000` : value, name === 'cumulativeSavings' ? 'Cumulative Savings' : name]}
            />
            <Area 
              type="monotone" 
              dataKey="cumulativeSavings" 
              stroke="#10b981" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorSavings)" 
              name="Cumulative Savings"
              animationDuration={500} // Added a quick transition animation
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '1rem', color: '#a1a1aa', fontSize: '0.85rem' }}>
        * Chart displays simulated cumulative savings by following AI "WAIT" signals during high-volatility dips instead of executing immediately.
      </div>
    </div>
  );
};

export default HistoricalAccuracy;
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const SUPPORTED_CURRENCIES = [
  { code: 'EUR', name: 'Euro' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SGD', name: 'Singapore Dollar' }
];

const LIVE_TRANSACTIONS = [
  { id: 'TX-992', from: 'EUR', to: 'INR', amount: '500.00', received: '53,450.00', status: 'SEND_NOW', time: '1.2s' },
  { id: 'TX-412', from: 'USD', to: 'INR', amount: '1,250.00', received: '116,100.00', status: 'SEND_NOW', time: '0.8s' },
  { id: 'TX-773', from: 'GBP', to: 'INR', amount: '300.00', received: '36,876.00', status: 'OVERRIDE', time: '1.5s' },
  { id: 'TX-105', from: 'AED', to: 'INR', amount: '5,000.00', received: '126,500.00', status: 'SEND_NOW', time: '0.9s' },
  { id: 'TX-882', from: 'EUR', to: 'INR', amount: '2,100.00', received: '224,490.00', status: 'SEND_NOW', time: '1.1s' },
  { id: 'TX-334', from: 'SGD', to: 'INR', amount: '850.00', received: '52,275.00', status: 'SEND_NOW', time: '1.0s' },
];

const GlobalTransactionFeed = () => {
  return (
    <div className="live-feed-section">
      <div className="feed-header">
        <span className="pulse-dot"></span>
        <span className="feed-title">Global Ledger Sync</span>
      </div>
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {[...LIVE_TRANSACTIONS, ...LIVE_TRANSACTIONS].map((tx, idx) => (
            <div key={`${tx.id}-${idx}`} className="feed-card">
              <div className="feed-card-header">
                <span className="tx-id">{tx.id}</span>
                <span className="tx-time">Settled in {tx.time}</span>
              </div>
              <div className="feed-card-body">
                <div className="tx-route">
                  <strong>{tx.amount} {tx.from}</strong>
                  <span className="arrow">➔</span>
                  <strong>{tx.received} {tx.to}</strong>
                </div>
                <div className="tx-ai">
                  AI Signal: <span className={tx.status.includes('SEND') ? 'text-green' : 'text-orange'}>{tx.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RealTimeSparkline = ({ data, trend }) => {
  const width = 150;
  const height = 40;
  const color = trend === 'SEND_NOW' ? '#10b981' : '#ef4444';

  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' L ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="sparkline-svg">
      <path d={`M ${points}`} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const StatItem = ({ label, target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun) {
        setHasRun(true);
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else { setCount(Math.floor(start)); }
        }, 16);
      }
    }, { threshold: 0.5 });
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [target, hasRun]);

  return (
    <div className="stat-box" ref={elementRef}>
      <h2 className="stat-number">{count.toLocaleString()}{suffix}</h2>
      <span className="stat-label">{label}</span>
    </div>
  );
};

function App() {
  const [baseCurrency, setBaseCurrency] = useState('EUR');
  const [targetCurrency, setTargetCurrency] = useState('INR');
  const [amountSent, setAmountSent] = useState(1000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const carouselPairs = ['USD', 'EUR', 'GBP'];
  const [activeSlide, setActiveSlide] = useState(0);
  
  const [pulseData, setPulseData] = useState({
    USD: { current_rate: 92.88, forecast_trend: 'WAIT', history: [92.1, 92.4, 93.1, 94.8, 93.5, 92.88] },
    EUR: { current_rate: 107.28, forecast_trend: 'WAIT', history: [106.1, 106.5, 108.4, 109.2, 108.1, 107.28] },
    GBP: { current_rate: 122.92, forecast_trend: 'WAIT', history: [125.8, 124.9, 124.1, 123.5, 123.1, 122.92] }
  });

  // Carousel Auto-slide logic
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselPairs.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPulse = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/transactions/rates');
        if (Object.keys(response.data).length > 0) {
           setPulseData(response.data);
        }
      } catch (err) {
        console.error("Live Sync deferred. Using real-time baseline.");
      }
    };
    fetchPulse();
  }, []);

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (baseCurrency === targetCurrency) {
      setError(`Cannot convert ${baseCurrency} to ${targetCurrency}. Select cross-border pair.`);
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:8080/api/transactions/simulate', {
        baseCurrency,
        targetCurrency,
        amountSent: parseFloat(amountSent)
      });
      setResult(response.data);
    } catch (err) {
      setError('Connection to transaction ledger timed out.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToTool = () => {
    document.getElementById('simulation-engine').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="main-layout">
      <nav className="navbar">
        <div className="app-wrapper nav-container">
          <div className="nav-logo">
            <span className="logo-icon">e</span>
            <span className="logo-text">ethixnode</span>
          </div>
          <div className="nav-links">
            <a href="https://github.com/shardool-patil/EthixNode" target="_blank" rel="noopener noreferrer" className="nav-github">
              <span>Star on GitHub</span>
            </a>
            <span onClick={scrollToTool}>Test Engine</span>
            <span>Dashboard</span>
            <span>API Sandbox</span>
            <button className="nav-cta">Sign In</button>
          </div>
        </div>
      </nav>

      <div className="app-wrapper">
        <main className="main-content">
          <div className="hero-section">
            <div className="pill-badge">
              <span className="pill-icon">✨</span>
              <span>Powered by Predictive AI</span>
            </div>
            <h1 className="hero-title">
              Transfer like a global<br /> citizen<span className="cursor-blink">_</span>
            </h1>
            <p className="hero-subtitle">
              EthixNode is an open-source, AI-driven remittance gateway. Use predictive forecasting and transparent ledger infrastructure to maximize your transfer value.
            </p>
            <div className="button-group hero-actions">
               <button className="primary-btn" onClick={scrollToTool}>
                 Run Live Simulation
               </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="glass-card mock-dashboard">
               <div className="mock-header">
                  <div className="mock-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <span className="tag">Live Ledger Sync</span>
               </div>
               
               <div className="mock-transaction-list">
                 <div className="mock-transaction">
                   <div className="tx-left">
                     <div className="tx-avatar bg-pink">JD</div>
                     <div className="tx-info">
                       <strong>John Doe</strong>
                       <span>Cross-border Transfer</span>
                     </div>
                   </div>
                   <div className="tx-right">
                     <strong className="text-green">+ ₹{((pulseData.EUR.current_rate || 107.28) * 1000).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                     <span className="tx-status">Completed</span>
                   </div>
                 </div>

                 <div className="mock-transaction opacity-70">
                   <div className="tx-left">
                     <div className="tx-avatar bg-blue">S</div>
                     <div className="tx-info">
                       <strong>Sarah</strong>
                       <span>API Payout</span>
                     </div>
                   </div>
                   <div className="tx-right">
                     <strong className="text-green">+ $1,200.00</strong>
                     <span className="tx-status">Completed</span>
                   </div>
                 </div>

                 <div className="mock-transaction opacity-40">
                   <div className="tx-left">
                     <div className="tx-avatar bg-purple">EW</div>
                     <div className="tx-info">
                       <strong>EuroWallet</strong>
                       <span>Ledger Settlement</span>
                     </div>
                   </div>
                   <div className="tx-right">
                     <strong className="text-green">+ €4,500.00</strong>
                     <span className="tx-status">Completed</span>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </main>

        <section className="stats-section">
          <div className="stats-grid">
            <StatItem label="Amount Saved" target={1240000} suffix="+" />
            <StatItem label="Transactions" target={48200} suffix="+" />
            <StatItem label="Active Users" target={15600} suffix="+" />
          </div>
        </section>

        <GlobalTransactionFeed />

        <section className="market-carousel-section">
          <div className="carousel-container">
            <div className="carousel-text">
               <span className="eyebrow">Real-time Forecasts</span>
               <h2>Live Market Pulse</h2>
               <p>Track global liquidity and predictive currency trends against the INR. Our AI updates every 60 seconds to ensure you settle at the peak.</p>
               <div className="carousel-dots">
                 {carouselPairs.map((_, i) => (
                   <span key={i} className={`dot ${activeSlide === i ? 'active' : ''}`} onClick={() => setActiveSlide(i)}></span>
                 ))}
               </div>
            </div>
            
            <div className="carousel-card-viewer">
               {carouselPairs.map((code, index) => (
                 <div key={code} className={`carousel-slide ${activeSlide === index ? 'active' : ''}`}>
                    <div className="glass-card trend-card large-variant">
                      <div className="trend-header">
                        <span className="pair">{code} / INR</span>
                        <div className="live-badge">
                           <span className="pulse-dot"></span> LIVE
                        </div>
                      </div>
                      <div className="trend-rate">{pulseData[code].current_rate.toFixed(2)}</div>
                      <div className="trend-chart-large">
                        <RealTimeSparkline data={pulseData[code].history} trend={pulseData[code].forecast_trend} />
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        <section className="comparison-section">
          <div className="section-heading">
            <h2>The Open-Source Advantage</h2>
            <p>Traditional banking vs. AI-driven forecasting.</p>
          </div>
          <div className="glass-card comparison-table-container">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Traditional Banks</th>
                  <th>FinTech Apps</th>
                  <th className="highlight-col">EthixNode</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Exchange Rate</td>
                  <td>Market + 3-5%</td>
                  <td>Market + 1%</td>
                  <td className="highlight-col">Real-time Mid-Market</td>
                </tr>
                <tr>
                  <td>Settlement</td>
                  <td>3-5 Days</td>
                  <td>1-2 Days</td>
                  <td className="highlight-col">Instant Settlement</td>
                </tr>
                <tr>
                  <td>Forecasting</td>
                  <td>None</td>
                  <td>Static Trends</td>
                  <td className="highlight-col text-green">Predictive AI</td>
                </tr>
                <tr>
                  <td>Infrastructure</td>
                  <td>Closed / Legacy</td>
                  <td>Closed / Proprietary</td>
                  <td className="highlight-col">Open-Source Ledger</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="simulation-engine" className="simulation-section">
          <div className="section-heading">
             <h2>Test the Engine</h2>
             <p>Select your currencies and amount to see the AI forecasting in action.</p>
          </div>

          <div className="dashboard-container">
            <div className="glass-card form-section">
              <div className="card-header">
                <h3>Live Transfer Simulation</h3>
                <span className="status-dot"></span>
              </div>
              <form onSubmit={handleSimulate}>
                <div className="input-row">
                  <div className="form-group">
                    <label>Base Currency</label>
                    <select value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)}>
                      {SUPPORTED_CURRENCIES.map(curr => (
                        <option key={curr.code} value={curr.code}>{curr.code} - {curr.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Target Currency</label>
                    <select value={targetCurrency} onChange={(e) => setTargetCurrency(e.target.value)}>
                      {SUPPORTED_CURRENCIES.map(curr => (
                        <option key={curr.code} value={curr.code}>{curr.code} - {curr.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Amount to Send</label>
                  <input type="number" value={amountSent} onChange={(e) => setAmountSent(e.target.value)} min="1" />
                </div>
                <div className="button-group">
                  <button type="submit" className="primary-btn" disabled={loading}>
                    {loading ? 'Analyzing Market...' : 'Simulate Transfer'}
                  </button>
                </div>
              </form>
              {error && <div className="error-banner">{error}</div>}
            </div>

            <div className="result-wrapper">
              {result && (
                <div className="glass-card result-section slide-up">
                  <div className="card-header">
                    <h3>Transaction Ledger</h3>
                    <span className="tag">Project ID: {result.id || 'ETHIX-924'}</span>
                  </div>
                  
                  <div className="metrics-grid">
                    <div className="metric-box outline">
                      <div className="metric-header-row">
                        <span className="label">AI Recommendation</span>
                        <span className="info-icon">i</span>
                      </div>
                      <strong className={result.aiRecommendation === 'SEND_NOW' ? 'text-green' : 'text-red'}>
                        {result.aiRecommendation}
                      </strong>
                      <p className="ai-explanation">
                        {result.aiRecommendation === 'SEND_NOW' 
                          ? 'Market volatility is low. Current rate is optimal for settlement.' 
                          : 'Forecast predicts a favorable rate movement within the next 6-12 hours.'}
                      </p>
                    </div>
                    <div className="metric-box outline">
                      <span className="label">Exchange Rate Locked</span>
                      <strong>{result.exchangeRateUsed.toFixed(4)}</strong>
                    </div>
                    <div className="metric-box main-metric">
                      <span className="label">Amount Received</span>
                      <h2>{result.amountReceived.toFixed(2)} <span>{targetCurrency}</span></h2>
                    </div>
                    <div className="metric-box danger">
                      <span className="label">Traditional Bank Fee</span>
                      <strong>{result.traditionalBankFee.toFixed(2)} {baseCurrency}</strong>
                    </div>
                    <div className="metric-box success">
                      <span className="label">EthixNode Fee</span>
                      <strong>{result.ethixNodeFee.toFixed(2)} {baseCurrency}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
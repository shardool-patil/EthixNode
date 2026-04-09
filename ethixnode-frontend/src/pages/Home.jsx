import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis, XAxis } from 'recharts';
import { Link } from 'react-router-dom';
import WalletManager from '../components/WalletManager';
import LiveLedger from '../components/LiveLedger';
import HistoricalAccuracy from '../components/HistoricalAccuracy';
import TransactionLedger from '../components/TransactionLedger';
import SmartAlertModal from '../components/SmartAlertModal';

// -------------------------------------------------------------
// 1. ERROR BOUNDARY
// -------------------------------------------------------------
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Error Caught:", error, errorInfo);
    this.setState({ errorInfo: error.toString() });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', margin: '20px' }}>
          <h3>⚠️ Component Render Error</h3>
          <p>A section of the UI crashed, but the app was prevented from white-screening.</p>
          <pre style={{ fontSize: '12px', overflowX: 'auto' }}>{this.state.errorInfo}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// -------------------------------------------------------------
// 2. CONSTANTS & MOCK DATA
// -------------------------------------------------------------
const SUPPORTED_CURRENCIES = [
  { code: 'EUR', name: 'Euro' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SGD', name: 'Singapore Dollar' }
];

const LIVE_TRANSACTIONS = [
  { id: 'TX-992', from: 'EUR', to: 'INR', amount: '500.00', received: '53,640.00', status: 'SEND_NOW', time: '1.2s' },
  { id: 'TX-412', from: 'USD', to: 'INR', amount: '1,250.00', received: '116,100.00', status: 'SEND_NOW', time: '0.8s' },
  { id: 'TX-773', from: 'GBP', to: 'INR', amount: '300.00', received: '36,876.00', status: 'OVERRIDE', time: '1.5s' },
  { id: 'TX-105', from: 'AED', to: 'INR', amount: '5,000.00', received: '126,550.00', status: 'SEND_NOW', time: '0.9s' },
  { id: 'TX-882', from: 'EUR', to: 'INR', amount: '2,100.00', received: '225,288.00', status: 'SEND_NOW', time: '1.1s' },
  { id: 'TX-334', from: 'SGD', to: 'INR', amount: '850.00', received: '61,565.50', status: 'SEND_NOW', time: '1.0s' },
];

// -------------------------------------------------------------
// 3. SUB-COMPONENTS
// -------------------------------------------------------------
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
                  AI Signal: <span className={tx.status?.includes('SEND') ? 'text-green' : 'text-orange'}>{tx.status || 'WAIT'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InteractiveChart = ({ data, trend }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  const color = trend === 'SEND_NOW' ? '#10b981' : '#ef4444';
  
  const chartData = data.map((val, i) => {
    const daysAgo = data.length - 1 - i;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { time: dateLabel, rate: Number(val) || 0 };
  });

  const min = Math.min(...data.map(v => Number(v) || 0));
  const max = Math.max(...data.map(v => Number(v) || 0));
  const padding = (max - min) * 0.1 || 1;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`gradient-${trend}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="time" hide />
        <YAxis domain={[min - padding, max + padding]} hide />
        <Tooltip 
          contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
          itemStyle={{ color: color, fontWeight: 'bold' }}
          labelStyle={{ color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '4px' }}
          formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Market Rate']}
          labelFormatter={(label) => label}
          animationDuration={200}
        />
        <Area type="monotone" dataKey="rate" stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#gradient-${trend})`} isAnimationActive={true} />
      </AreaChart>
    </ResponsiveContainer>
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

// -------------------------------------------------------------
// 4. MAIN PAGE COMPONENT
// -------------------------------------------------------------
export default function Home({ user, onLogout }) {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const [baseCurrency, setBaseCurrency] = useState('EUR');
  const [targetCurrency, setTargetCurrency] = useState('INR');
  const [amountSent, setAmountSent] = useState(1000);
  const [result, setResult] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState(null);
  
  const carouselPairs = ['USD', 'EUR', 'GBP', 'SGD', 'AED'];
  const [activeSlide, setActiveSlide] = useState(0);

  const [pulseData, setPulseData] = useState({
    USD: { current_rate: 92.88, change_pct: 0.14, forecast_trend: 'WAIT', history: [92.10, 92.40, 93.10, 92.50, 92.75, 92.88] },
    EUR: { current_rate: 107.28, change_pct: -0.20, forecast_trend: 'WAIT', history: [106.10, 106.50, 108.40, 109.20, 107.50, 107.28] },
    GBP: { current_rate: 122.92, change_pct: 0.34, forecast_trend: 'WAIT', history: [125.80, 124.90, 124.10, 123.50, 122.50, 122.92] },
    SGD: { current_rate: 72.43, change_pct: 0.18, forecast_trend: 'SEND_NOW', history: [71.80, 72.10, 72.90, 73.20, 72.30, 72.43] },
    AED: { current_rate: 25.31, change_pct: -0.16, forecast_trend: 'WAIT', history: [25.10, 25.20, 25.50, 25.40, 25.35, 25.31] }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselPairs.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const fetchPulse = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/transactions/rates');
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data) && response.data.USD) {
         setPulseData(prev => {
            const newData = { ...prev };
            Object.keys(response.data).forEach(key => {
               newData[key] = { ...prev[key], ...response.data[key] };
            });
            return newData;
         });
      }
    } catch (err) {
      console.error("Live Sync deferred. Using fallback baseline data.", err.message);
    }
  };

  useEffect(() => {
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
      setLoadingText('Initializing AI Engine...');
      const aiResponse = await axios.post('http://localhost:8000/api/ai/predict', {
        amount: parseFloat(amountSent),
        base_currency: baseCurrency,
        target_currency: targetCurrency,
        network: 'EthixNode Direct'
      });

      const jobId = aiResponse.data.job_id;
      
      let aiResult = null;
      let attempts = 0;
      
      while (!aiResult && attempts < 15) { 
        attempts++;
        setLoadingText(`Analyzing Volatility [Job: ${jobId.substring(0,6)}]... ${attempts}s`);
        
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        
        const statusRes = await axios.get(`http://localhost:8000/api/ai/status/${jobId}`);
        if (statusRes.data.status === 'COMPLETED') {
          aiResult = statusRes.data.result;
        }
      }

      if (!aiResult) throw new Error("AI Prediction Timed Out");

      setLoadingText('Locking Ledger Math...');
      
      let sbData = {};
      try {
        const sbResponse = await axios.post('http://localhost:8080/api/transactions/simulate', {
          baseCurrency,
          targetCurrency,
          amountSent: parseFloat(amountSent),
          aiSignal: aiResult.signal
        });
        sbData = sbResponse.data;
      } catch (sbErr) {
        console.warn("Spring Boot offline. Using frontend fallback math for demo.");
        const fallbackRate = pulseData?.[baseCurrency]?.current_rate || 90.00;
        sbData = {
          exchangeRateUsed: fallbackRate,
          amountReceived: parseFloat(amountSent) * fallbackRate,
          traditionalBankFee: parseFloat(amountSent) * 0.05,
          ethixNodeFee: parseFloat(amountSent) * 0.005,
        };
      }

      setResult({
        ...sbData,
        aiRecommendation: aiResult.signal,
        confidence: aiResult.confidence_score,
        reasoning: aiResult.reasoning,
        volatility: aiResult.volatility_index
      });
      
      await fetchPulse();
    } catch (err) {
      console.error(err);
      setError('Error communicating with the AI Engine. Ensure FastAPI is running on Port 8000.');
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  const scrollToTool = () => {
    document.getElementById('simulation-engine').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ErrorBoundary>
      <div className="main-layout">
        
        <nav className="navbar">
          <div className="app-wrapper nav-container">
            <div className="nav-logo">
              <span className="logo-icon">e</span>
              <span className="logo-text">ethixnode</span>
            </div>
            <div className="nav-links">
              <a href="https://github.com/shardool-patil/EthixNode" target="_blank" rel="noopener noreferrer" className="nav-github" style={{ display: 'flex', alignItems: 'center' }}>
                <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '8px' }}>
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                <span>Star on GitHub</span>
              </a>
              <span onClick={scrollToTool}>Test Engine</span>
              <span>Dashboard</span>
              <span>API Sandbox</span>
              
              {user ? (
                <div className="user-profile-nav" style={{ display: 'flex', alignItems: 'center' }}>
                  {/* The Set Alert button is NOW HERE, only visible to logged-in users */}
                  <button 
                    onClick={() => setIsAlertModalOpen(true)}
                    className="primary-btn" 
                    style={{ padding: '6px 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '15px' }}
                  >
                    <span>🔔</span> Set Alert
                  </button>

                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="user-avatar" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="user-avatar">{user.initials}</div>
                  )}
                  <span className="user-name">{user.name}</span>
                  <button onClick={onLogout} className="logout-icon-btn" title="Logout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                  </button>
                </div>
              ) : (
                <Link to="/login" style={{ textDecoration: 'none', marginLeft: '10px' }}>
                  <button className="nav-cta">
                    Sign In
                  </button>
                </Link>
              )}
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
              <ErrorBoundary>
                <div className="glass-card mock-dashboard">
                   <div className="mock-header">
                      <div className="mock-dots"><span></span><span></span><span></span></div>
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
                         <strong className="text-green">+ ₹{((pulseData?.EUR?.current_rate || 107.28) * 1000).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
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
              </ErrorBoundary>
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

          <section className="app-wrapper" style={{ paddingTop: '40px' }}>
            <LiveLedger />
          </section>

          {user && (
            <section className="app-wrapper" style={{ paddingTop: '60px' }}>
              <WalletManager user={user} />
            </section>
          )}

          <section className="app-wrapper" style={{ paddingTop: '40px', paddingBottom: '20px' }}>
             <ErrorBoundary>
                <TransactionLedger />
             </ErrorBoundary>
          </section>

          <section className="market-carousel-section">
            <div className="carousel-container">
              <div className="carousel-text">
                 <span className="eyebrow">Real-time Forecasts</span>
                 <h2>Live Market Pulse</h2>
                 <p>Track global liquidity and predictive currency trends against the INR. Hover over the charts to see historical price points. Syncs dynamically on interaction.</p>
                 <div className="carousel-dots">
                   {carouselPairs.map((_, i) => (
                     <span key={i} className={`dot ${activeSlide === i ? 'active' : ''}`} onClick={() => setActiveSlide(i)}></span>
                   ))}
                 </div>
              </div>
              
              <div className="carousel-card-viewer">
                 {carouselPairs.map((code, index) => (
                   <div key={code} className={`carousel-slide ${activeSlide === index ? 'active' : ''}`}>
                      <ErrorBoundary>
                        <div className="glass-card trend-card large-variant">
                          <div className="trend-header">
                            <span className="pair">{code} / INR</span>
                            <div className="live-badge">
                               <span className="pulse-dot"></span> LIVE
                            </div>
                          </div>
                          
                          <div className="trend-rate" style={{ display: 'flex', alignItems: 'center' }}>
                            {Number(pulseData?.[code]?.current_rate || 0).toFixed(2)}
                            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '16px' }}>
                               <span 
                                 className={(pulseData?.[code]?.change_pct || 0) >= 0 ? 'text-green' : 'text-red'} 
                                 style={{ fontSize: '1.2rem', fontWeight: '600' }}
                               >
                                 {(pulseData?.[code]?.change_pct || 0) > 0 ? '+' : ''}{Number(pulseData?.[code]?.change_pct || 0).toFixed(2)}%
                               </span>
                               <span style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '-2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                 24h Change
                               </span>
                            </div>
                          </div>

                          <div className="trend-chart-large">
                            <InteractiveChart 
                               data={pulseData?.[code]?.historical_data || pulseData?.[code]?.history || []} 
                               trend={pulseData?.[code]?.forecast_trend || 'WAIT'} 
                            />
                          </div>
                        </div>
                      </ErrorBoundary>
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

            <div className="app-wrapper" style={{ paddingBottom: '2rem' }}>
               <HistoricalAccuracy />
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
                    <button type="submit" className="primary-btn" disabled={loading} style={{ minWidth: '200px' }}>
                      {loading ? loadingText || 'Initializing...' : 'Simulate Transfer'}
                    </button>
                  </div>
                </form>
                {error && <div className="error-banner">{error}</div>}
              </div>

              <div className="result-wrapper">
                {result && (
                  <ErrorBoundary>
                    <div className="glass-card result-section slide-up">
                      <div className="card-header">
                        <h3>Transaction Ledger</h3>
                        <span className="tag">Project ID: {result?.id || 'ETHIX-924'}</span>
                      </div>
                      
                      <div className="metrics-grid">
                        
                        <div className="metric-box outline" style={{ gridColumn: '1 / -1' }}>
                          <div className="metric-header-row">
                            <span className="label">AI Intelligence Report</span>
                            <span className="info-icon">i</span>
                          </div>
                          <strong className={result?.aiRecommendation === 'SEND_NOW' ? 'text-green' : 'text-orange'} style={{ fontSize: '1.5rem', display: 'block', marginBottom: '8px' }}>
                            {result?.aiRecommendation || 'UNKNOWN'}
                          </strong>
                          <p className="ai-explanation" style={{ fontSize: '0.9rem', color: '#a1a1aa', lineHeight: '1.5' }}>
                            {result?.reasoning}
                          </p>
                          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#38bdf8' }}>
                              Confidence Score: {result?.confidence}%
                            </span>
                            <span style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.3)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#fb923c' }}>
                              Market Volatility: {result?.volatility}/10
                            </span>
                          </div>
                        </div>

                        <div className="metric-box outline">
                          <span className="label">Exchange Rate Locked</span>
                          <strong>{Number(result?.exchangeRateUsed || 0).toFixed(4)}</strong>
                        </div>
                        <div className="metric-box main-metric">
                          <span className="label">Amount Received</span>
                          <h2>{Number(result?.amountReceived || 0).toFixed(2)} <span>{targetCurrency}</span></h2>
                        </div>
                        <div className="metric-box danger">
                          <span className="label">Traditional Bank Fee</span>
                          <strong>{Number(result?.traditionalBankFee || 0).toFixed(2)} {baseCurrency}</strong>
                        </div>
                        <div className="metric-box success">
                          <span className="label">EthixNode Fee</span>
                          <strong>{Number(result?.ethixNodeFee || 0).toFixed(2)} {baseCurrency}</strong>
                        </div>
                      </div>
                    </div>
                  </ErrorBoundary>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>

      <SmartAlertModal 
        isOpen={isAlertModalOpen} 
        onClose={() => setIsAlertModalOpen(false)} 
        user={user} 
      />
    </ErrorBoundary>
  );
}
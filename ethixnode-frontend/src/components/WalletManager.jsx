import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WalletManager = ({ user }) => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Connection Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provider, setProvider] = useState('WISE');
  const [currency, setCurrency] = useState('EUR');
  const [connecting, setConnecting] = useState(false);

  // Disconnect Warning Modal State
  const [walletToDisconnect, setWalletToDisconnect] = useState(null);

  const fetchBalances = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/wallets/balances', { withCredentials: true });
      setBalances(response.data);
    } catch (err) {
      console.error("Failed to fetch wallets:", err);
      setError("Could not sync with wallet providers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [user]);

  const handleConnect = async (e) => {
    e.preventDefault();
    setConnecting(true);
    setError(null);
    try {
      await axios.post('http://localhost:8080/api/wallets/connect', { provider, currency }, { withCredentials: true });
      setIsModalOpen(false);
      fetchBalances(); 
    } catch (err) {
      // This will now display our "Duplicate Wallet" backend error perfectly!
      setError(err.response?.data?.error || "Failed to connect wallet.");
    } finally {
      setConnecting(false);
    }
  };

  // Trigger the disconnect process
  const confirmDisconnect = async () => {
    if (!walletToDisconnect) return;
    try {
      await axios.delete(`http://localhost:8080/api/wallets/${walletToDisconnect.walletId}`, { withCredentials: true });
      setWalletToDisconnect(null); // Close the warning modal
      fetchBalances(); // Refresh the grid to remove the card
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  if (!user) return null;

  return (
    <div className="wallet-manager-section">
      <div className="section-heading" style={{ textAlign: 'left', marginBottom: '24px' }}>
        <h2>Connected Wallets</h2>
        <p>Live liquidity synced directly from your external providers.</p>
      </div>

      <div className="wallet-grid">
        {balances.map((wallet) => (
          <div key={wallet.walletId} className="glass-card wallet-card group">
            <div className="wallet-header">
              <span className="wallet-provider">{wallet.provider}</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="status-badge pulse">Synced</span>
                {/* NEW DISCONNECT BUTTON (Reveals on Hover) */}
                <button 
                  className="disconnect-btn" 
                  onClick={() => setWalletToDisconnect(wallet)}
                  title="Disconnect Wallet"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                </button>
              </div>
            </div>
            <div className="wallet-balance">
              <h3>{Number(wallet.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <span className="wallet-currency">{wallet.currency}</span>
            </div>
          </div>
        ))}

        <div className="glass-card wallet-card add-wallet-card" onClick={() => setIsModalOpen(true)}>
          <div className="add-icon">+</div>
          <span>Connect Provider</span>
        </div>
      </div>

      {/* Connection Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h3>Link External Wallet</h3>
              <button className="close-btn" onClick={() => { setIsModalOpen(false); setError(null); }}>×</button>
            </div>
            {error && <div className="error-banner" style={{marginBottom: '16px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.3)'}}>{error}</div>}
            
            <form onSubmit={handleConnect}>
              <div className="form-group">
                <label>Select Provider</label>
                <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                  <option value="WISE">Wise (TransferWise)</option>
                  <option value="REVOLUT">Revolut</option>
                  <option value="PLAID">Plaid (US Banking)</option>
                  <option value="PAYPAL">PayPal</option>
                </select>
              </div>
              <div className="form-group">
                <label>Primary Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>
              <button type="submit" className="primary-btn w-full" disabled={connecting} style={{marginTop: '16px'}}>
                {connecting ? 'Authenticating...' : 'Securely Connect'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NEW: Disconnect Warning Modal */}
      {walletToDisconnect && (
        <div className="modal-overlay">
          <div className="glass-card modal-content warning-modal">
            <div className="modal-header">
              <h3 style={{ color: '#ef4444' }}>Revoke Access?</h3>
            </div>
            <p style={{ color: '#a1a1aa', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to disconnect your <strong>{walletToDisconnect.provider}</strong> wallet? EthixNode will immediately lose access to your live liquidity data.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="secondary-btn w-full" onClick={() => setWalletToDisconnect(null)}>Cancel</button>
              <button className="primary-btn w-full" style={{ backgroundColor: '#ef4444', color: 'white' }} onClick={confirmDisconnect}>
                Yes, Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManager;
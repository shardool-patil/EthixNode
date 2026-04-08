import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const TransactionLedger = () => {
  const [transactions, setTransactions] = useState([]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/transactions/history');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch ledger:", error);
    }
  };

  // Fetch immediately and also refresh every 5 seconds
  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card" style={{ marginTop: '2rem', width: '100%' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.25rem', color: '#fff' }}>
          <ShieldCheck color="#10b981" size={24} /> Immutable Audit Ledger
        </h3>
        <span className="tag" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>POSTGRESQL BACKED</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px' }}>
              <th style={{ padding: '12px 8px' }}>TXN Hash</th>
              <th style={{ padding: '12px 8px' }}>Pair</th>
              <th style={{ padding: '12px 8px' }}>Amount</th>
              <th style={{ padding: '12px 8px' }}>AI Signal</th>
              <th style={{ padding: '12px 8px' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '16px 8px', fontFamily: 'monospace', color: '#10b981', fontSize: '13px' }}>{txn.transactionHash}</td>
                <td style={{ padding: '16px 8px', fontWeight: 'bold', color: '#fff' }}>{txn.baseCurrency} → {txn.targetCurrency}</td>
                <td style={{ padding: '16px 8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#fff' }}>{txn.amountSent} {txn.baseCurrency}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Rate: {txn.exchangeRateUsed}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 8px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    backgroundColor: txn.aiSignal === 'SEND_NOW' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: txn.aiSignal === 'SEND_NOW' ? '#34d399' : '#fbbf24',
                    border: txn.aiSignal === 'SEND_NOW' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                  }}>
                    {txn.aiSignal}
                  </span>
                </td>
                <td style={{ padding: '16px 8px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                  {new Date(txn.createdAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {transactions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontSize: '0.9rem' }}>
            No transactions found in the ledger. Run a simulation above to generate immutable records.
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionLedger;
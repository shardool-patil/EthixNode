import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

const LiveLedger = () => {
  // View Toggle State
  const [isHistoryView, setIsHistoryView] = useState(false);

  // Live WebSocket State
  const [liveTransactions, setLiveTransactions] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Historical Pagination State
  const [historyData, setHistoryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // --- 1. WEBSOCKET LOGIC (Runs only in Live View) ---
  useEffect(() => {
    if (isHistoryView) return; // Don't run websockets if we are viewing history

    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-ledger'),
      debug: () => {}, // Muted logs
      onConnect: () => {
        setIsConnected(true);
        stompClient.subscribe('/topic/global-ledger', (message) => {
          const newTransaction = JSON.parse(message.body);
          setLiveTransactions((prevTxns) => {
            const updated = [newTransaction, ...prevTxns];
            return updated.slice(0, 5); // Keep top 5
          });
        });
      },
      onDisconnect: () => setIsConnected(false),
      onWebSocketClose: () => setIsConnected(false)
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  }, [isHistoryView]);

  // --- 2. REST API LOGIC (Runs only in History View) ---
  const fetchHistory = async (page) => {
    try {
      setIsLoadingHistory(true);
      const response = await axios.get(`http://localhost:8080/api/transactions/history?page=${page}&limit=5`, { withCredentials: true });
      setHistoryData(response.data.data);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isHistoryView) fetchHistory(currentPage);
  }, [isHistoryView, currentPage]);

  // --- 3. HELPER FOR PAGINATION NUMBERS ---
  const generatePageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="live-ledger-section">
      <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>{isHistoryView ? 'Historical Network Log' : 'Network Transparency Ledger'}</h2>
          <p>{isHistoryView ? 'Auditable ledger of past cross-border settlements.' : 'Real-time fee savings calculated against traditional banking markups.'}</p>
        </div>
        <div className="connection-status">
          {!isHistoryView && (
            isConnected ? (
              <span className="status-badge pulse" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                Live Sync Active
              </span>
            ) : (
              <span className="status-badge" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>Connecting...</span>
            )
          )}
        </div>
      </div>

      <div className="glass-card ledger-table-container" style={{ padding: '0' }}>
        <table className="ledger-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa' }}>
              <th style={{ padding: '16px' }}>Time</th>
              <th style={{ padding: '16px' }}>Route</th>
              <th style={{ padding: '16px' }}>Network</th>
              <th style={{ padding: '16px' }}>Amount</th>
              <th style={{ padding: '16px' }}>EthixNode Savings</th>
            </tr>
          </thead>
          <tbody>
            {isHistoryView && isLoadingHistory ? (
              <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#a1a1aa' }}>Fetching ledger records...</td></tr>
            ) : (
              (isHistoryView ? historyData : liveTransactions).map((txn) => (
                <tr key={txn.id} className={!isHistoryView ? "ledger-row slide-down" : "ledger-row"} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', color: '#a1a1aa' }}>{txn.timestamp}</td>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>{txn.route}</td>
                  <td style={{ padding: '16px' }}><span style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{txn.network}</span></td>
                  <td style={{ padding: '16px' }}>{txn.amount}</td>
                  <td style={{ padding: '16px', color: '#10b981', fontWeight: 'bold' }}>{txn.savings}</td>
                </tr>
              ))
            )}
          </tbody>

          {/* FOOTER: Changes based on view mode */}
          <tfoot>
            <tr>
              <td colSpan="5" style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {!isHistoryView ? (
                  <button onClick={() => setIsHistoryView(true)} style={{ fontSize: '0.85rem', padding: '8px 16px', border: 'none', background: 'transparent', color: '#fd366e', cursor: 'pointer', transition: '0.2s' }}>
                    View Full Network History →
                  </button>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
                    {/* Switch back to Live Feed */}
                    <button onClick={() => { setIsHistoryView(false); setCurrentPage(1); }} style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>
                      ← Back to Live Feed
                    </button>
                    
                    {/* Pagination Numbers */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => Math.max(1, c - 1))} style={{ padding: '6px 12px', background: 'transparent', color: currentPage === 1 ? '#52525b' : 'white', border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>Prev</button>
                      
                      {generatePageNumbers().map(num => (
                        <button key={num} onClick={() => setCurrentPage(num)} style={{ padding: '6px 12px', borderRadius: '4px', background: currentPage === num ? 'rgba(253, 54, 110, 0.2)' : 'transparent', color: currentPage === num ? '#fd366e' : '#a1a1aa', border: currentPage === num ? '1px solid rgba(253, 54, 110, 0.5)' : 'none', cursor: 'pointer' }}>
                          {num}
                        </button>
                      ))}

                      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))} style={{ padding: '6px 12px', background: 'transparent', color: currentPage === totalPages ? '#52525b' : 'white', border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default LiveLedger;
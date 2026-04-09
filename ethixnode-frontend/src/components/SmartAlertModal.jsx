import React, { useState, useEffect } from 'react';

const SmartAlertModal = ({ isOpen, onClose, user }) => {
    // Default to the user's email if they are logged in!
    const [email, setEmail] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [targetRate, setTargetRate] = useState('');
    const [status, setStatus] = useState('idle'); 
    const [message, setMessage] = useState('');

    // Update the email field automatically when the modal opens
    useEffect(() => {
        if (isOpen && user?.email) {
            setEmail(user.email);
        }
    }, [isOpen, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        const alertData = {
            userEmail: email,
            targetCurrency: currency,
            targetRate: parseFloat(targetRate)
        };

        try {
            const response = await fetch('http://localhost:8080/api/alerts/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alertData),
            });

            if (response.ok) {
                const data = await response.json();
                setStatus('success');
                setMessage(data.message);
                
                setTimeout(() => {
                    setTargetRate('');
                    setStatus('idle');
                    onClose();
                }, 2000);
            } else {
                setStatus('error');
                setMessage('Failed to set alert. Please try again.');
            }
        } catch (error) {
            console.error("Error setting alert:", error);
            setStatus('error');
            setMessage('Network error. Is your Redis/Backend running?');
        }
    };

    if (!isOpen) return null;

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h2 style={{ marginTop: 0, color: '#f4f4f5' }}>🔔 Set Smart Alert</h2>
                <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '20px' }}>
                    Get notified the moment your target exchange rate is hit.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <div>
                        <label style={labelStyle}>Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            style={inputStyle}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Currency</label>
                            <select 
                                value={currency} 
                                onChange={(e) => setCurrency(e.target.value)} 
                                style={inputStyle}
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="SGD">SGD - Singapore Dollar</option>
                                <option value="AED">AED - UAE Dirham</option>
                            </select>
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Target Rate (INR)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                required 
                                value={targetRate} 
                                onChange={(e) => setTargetRate(e.target.value)} 
                                style={inputStyle}
                                placeholder="e.g. 83.50"
                            />
                        </div>
                    </div>

                    {status === 'success' && <div style={successMessageStyle}>{message}</div>}
                    {status === 'error' && <div style={errorMessageStyle}>{message}</div>}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                        <button type="button" onClick={onClose} style={cancelButtonStyle} disabled={status === 'loading'}>
                            Cancel
                        </button>
                        <button type="submit" style={submitButtonStyle} disabled={status === 'loading'}>
                            {status === 'loading' ? 'Saving...' : 'Set Alert'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Updated Dark Theme Styles ---
const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
    backdropFilter: 'blur(4px)'
};
const modalStyle = {
    backgroundColor: '#18181b', // Dark gray/black
    padding: '30px', 
    borderRadius: '12px',
    width: '100%', 
    maxWidth: '450px', 
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    border: '1px solid #27272a'
};
const labelStyle = { 
    display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#e4e4e7' 
};
const inputStyle = { 
    width: '100%', padding: '12px', borderRadius: '8px', 
    backgroundColor: '#27272a', // Darker input background
    color: '#fff', // White text so you can read it!
    border: '1px solid #3f3f46', outline: 'none', fontSize: '14px', boxSizing: 'border-box'
};
const submitButtonStyle = { 
    backgroundColor: '#0ea5e9', color: '#fff', border: 'none', padding: '10px 20px', 
    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' 
};
const cancelButtonStyle = { 
    backgroundColor: 'transparent', color: '#a1a1aa', border: '1px solid #3f3f46', 
    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' 
};
const successMessageStyle = { 
    backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid #059669', 
    padding: '10px', borderRadius: '8px', fontSize: '14px', marginTop: '10px' 
};
const errorMessageStyle = { 
    backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid #dc2626', 
    padding: '10px', borderRadius: '8px', fontSize: '14px', marginTop: '10px' 
};

export default SmartAlertModal;
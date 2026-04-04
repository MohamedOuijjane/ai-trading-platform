import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tradingApi from '../../api/trading.api';

/**
 * TradePage Component
 * Orchestrates trade execution and synchronizes system state.
 * Backend is the source of truth; UI reflects successful mutations.
 */
const TradePage = () => {
  const [ticker, setTicker] = useState('');
  const [action, setAction] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  /**
   * Validates and submits trade request to the backend.
   */
  const handleTrade = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!ticker.trim()) return setError('Ticker symbol is required.');
    if (!quantity || parseFloat(quantity) <= 0) return setError('Quantity must be greater than zero.');
    if (!['BUY', 'SELL'].includes(action)) return setError('Invalid trade action.');

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ticker: ticker.toUpperCase().trim(),
        action,
        quantity: parseFloat(quantity),
      };

      await tradingApi.executeTrade(payload);
      
      setSuccess(true);
      setTicker('');
      setQuantity('');
      
      // Data Consistency: After a successful trade, the user's portfolio has changed.
      // We redirect to portfolio to trigger a fresh fetch from the backend (source of truth).
      setTimeout(() => {
        navigate('/portfolio');
      }, 2000);

    } catch (err) {
      console.error('[Trade Execution Error]:', err);
      setError(err.message || 'Trade failed. Please check your balance and ticker.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trade-container">
      <h1>Execute Trade</h1>
      
      {success && (
        <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          <strong>Success!</strong> Trade executed. Redirecting to portfolio...
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleTrade} style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Ticker Symbol</label>
          <input 
            type="text" 
            placeholder="e.g. BTC-USD" 
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Action</label>
          <select 
            value={action} 
            onChange={(e) => setAction(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>

        <div>
          <label>Quantity</label>
          <input 
            type="number" 
            step="any"
            placeholder="0.00"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '12px', 
            backgroundColor: action === 'BUY' ? '#007bff' : '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : `Confirm ${action} Order`}
        </button>
      </form>

      <div style={{ marginTop: '30px', color: '#666' }}>
        <p><small>Note: All trades are simulated and executed against current market prices.</small></p>
      </div>
    </div>
  );
};

export default TradePage;

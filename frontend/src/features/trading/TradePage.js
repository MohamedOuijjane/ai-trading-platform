import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import tradingApi from '../../api/trading.api';
import { fetchPortfolio } from '../portfolio/portfolioSlice';

/**
 * TradePage Component
 * Orchestrates trade execution and synchronizes system state.
 */
const TradePage = () => {
  const [ticker, setTicker] = useState('');
  const [action, setAction] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { balance, positions } = useSelector(state => state.portfolio);
  const { prices } = useSelector(state => state.market);

  useEffect(() => {
    dispatch(fetchPortfolio());
  }, [dispatch]);

  const currentPrice = prices[ticker.toUpperCase()] || 0;
  const currentPosition = positions.find(p => p.symbol === ticker.toUpperCase())?.quantity || 0;

  /**
   * Validates and submits trade request to the backend.
   */
  const handleTrade = async (e) => {
    e.preventDefault();
    
    if (!ticker.trim()) return setError('Ticker symbol is required.');
    if (!quantity || parseFloat(quantity) <= 0) return setError('Quantity must be greater than zero.');

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
      
      // Update portfolio in Redux immediately
      dispatch(fetchPortfolio());
      
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
    <div className="trade-container" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
      <section>
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
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>

          <div>
            <label>Action</label>
            <select 
              value={action} 
              onChange={(e) => setAction(e.target.value)}
              disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>

          <div>
            <label>Quantity</label>
            <input 
              type="number" 
              step="0.0001"
              placeholder="0.00" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Market Price:</span>
              <span style={{ fontWeight: 'bold' }}>${currentPrice.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Est:</span>
              <span style={{ fontWeight: 'bold' }}>
                ${(currentPrice * (parseFloat(quantity) || 0)).toFixed(2)}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '15px', 
              backgroundColor: action === 'BUY' ? '#28a745' : '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            {loading ? 'Processing...' : `Confirm ${action}`}
          </button>
        </form>
      </section>

      <aside style={{ backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '15px', alignSelf: 'start' }}>
        <h3>Portfolio Context</h3>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', color: '#666' }}>Available Balance</label>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${parseFloat(balance).toLocaleString()}</div>
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: '#666' }}>Current {ticker.toUpperCase() || 'Asset'} Holding</label>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{parseFloat(currentPosition).toFixed(4)}</div>
        </div>
      </aside>
    </div>
  );
};

export default TradePage;
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

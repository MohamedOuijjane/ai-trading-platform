import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import tradingApi from '../../api/trading.api';
import useWebSocket from '../../hooks/useWebSocket';
import SignalCard from './components/SignalCard';
import { updatePrice, updateSignal } from '../marketSlice';
import { addPrediction } from '../predictionsSlice';

/**
 * DashboardPage Component
 * Reactive hub for real-time ML predictions.
 */
const DashboardPage = () => {
  const dispatch = useDispatch();
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [inputTicker, setInputTicker] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { prices, signals } = useSelector(state => state.market);
  const { latestPredictions } = useSelector(state => state.predictions);

  // Activate WebSockets for real-time updates
  const { isConnected } = useWebSocket();

  /**
   * Fetches prediction data for the selected ticker.
   */
  const getTickerPrediction = useCallback(async (ticker) => {
    const symbol = ticker.toUpperCase().trim();
    
    setLoading(true);
    setError(null);

    try {
      const data = await tradingApi.getPrediction(symbol);
      // Update Redux state
      dispatch(updatePrice({ ticker: symbol, price: data.price }));
      dispatch(updateSignal({ ticker: symbol, signal: data.signal }));
      dispatch(addPrediction(data));
    } catch (err) {
      console.error(`[Prediction Error for ${symbol}]:`, err);
      setError(`Failed to get prediction for ${symbol}. ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Trigger fetch when selectedTicker changes
  useEffect(() => {
    getTickerPrediction(selectedTicker);
  }, [selectedTicker, getTickerPrediction]);

  /**
   * Handles form submission for ticker search
   */
  const handleTickerSearch = (e) => {
    e.preventDefault();
    if (inputTicker.trim()) {
      setSelectedTicker(inputTicker.toUpperCase());
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Market Dashboard</h1>
        <div style={{ 
          padding: '4px 12px', 
          borderRadius: '20px', 
          backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
          color: isConnected ? '#155724' : '#721c24',
          fontSize: '0.8rem'
        }}>
          {isConnected ? '● Real-time Connected' : '○ Connecting...'}
        </div>
      </div>

      {/* --- Search & Control Bar --- */}
      <section className="controls" style={{ marginBottom: '30px' }}>
        <form onSubmit={handleTickerSearch} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Search ticker (e.g. BTC-USD)" 
            value={inputTicker}
            onChange={(e) => setInputTicker(e.target.value)}
            style={{ padding: '8px', width: '200px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Analyze Asset
          </button>
        </form>
      </section>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px' }}>
        {/* --- Main Display --- */}
        <section>
          {loading && !prices[selectedTicker] ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Analyzing Market...</div>
          ) : (
            <div style={{ padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
              <h2>Active Analysis: {selectedTicker}</h2>
              <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                ${prices[selectedTicker]?.toFixed(2)}
              </div>
              <div style={{ marginTop: '20px', fontSize: '1.5rem' }}>
                Signal: <span style={{ fontWeight: 'bold' }}>{signals[selectedTicker]}</span>
              </div>
            </div>
          )}
        </section>

        {/* --- Recent Signals Sidebar --- */}
        <section>
          <h3>Recent Signals</h3>
          {latestPredictions.map((pred, idx) => (
            <SignalCard key={idx} prediction={pred} />
          ))}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
            style={{ marginLeft: '10px' }}
          >
            Refresh
          </button>
        </form>
      </section>

      {/* --- Main Content --- */}
      {loading ? (
        <div className="loading"><h3>AI is analyzing {selectedTicker} trends...</h3></div>
      ) : error ? (
        <div className="error-alert" style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '15px', borderRadius: '5px' }}>
          <strong>Analysis Failed:</strong> {error}
        </div>
      ) : prediction ? (
        <div className="prediction-display" style={{ border: '1px solid #ddd', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Asset: {prediction.ticker}</h2>
            <span style={getSignalBadgeStyle(prediction.signal)}>
              {prediction.signal} SIGNAL
            </span>
          </div>

          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div>
              <label>AI Confidence</label>
              <div style={{ fontSize: '1.5rem', color: '#007bff' }}>
                {(prediction.confidence * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <label>Current Price</label>
              <div style={{ fontSize: '1.5rem' }}>
                ${prediction.price?.toLocaleString()}
              </div>
            </div>
            <div>
              <label>Analysis Time</label>
              <div style={{ color: '#666' }}>
                {new Date(prediction.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {prediction.latency_ms && (
            <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#999' }}>
              Inference completed in {prediction.latency_ms}ms
            </div>
          )}
        </div>
      ) : (
        <div className="placeholder">Select an asset to begin AI market analysis.</div>
      )}
    </div>
  );
};

export default DashboardPage;

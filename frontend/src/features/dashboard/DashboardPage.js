import React, { useState, useEffect, useCallback } from 'react';
import tradingApi from '../../api/trading.api';

/**
 * DashboardPage Component
 * Reactive hub for real-time ML predictions.
 * Supports multiple tickers and maintains data consistency via the backend.
 */
const DashboardPage = () => {
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [inputTicker, setInputTicker] = useState('AAPL');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Local cache to avoid redundant API calls within the same component lifecycle
  const [predictionCache, setPredictionCache] = useState({});

  /**
   * Fetches prediction data for the selected ticker.
   */
  const getTickerPrediction = useCallback(async (ticker) => {
    const symbol = ticker.toUpperCase().trim();
    
    // Check local cache first
    if (predictionCache[symbol]) {
      setPrediction(predictionCache[symbol]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await tradingApi.getPrediction(symbol);
      setPrediction(data);
      
      // Update cache
      setPredictionCache(prev => ({
        ...prev,
        [symbol]: data
      }));
    } catch (err) {
      console.error(`[Prediction Error for ${symbol}]:`, err);
      setError(`Failed to get prediction for ${symbol}. ${err.message}`);
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }, [predictionCache]);

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

  /**
   * Returns visual styles for signal types
   */
  const getSignalBadgeStyle = (signal) => {
    const base = { padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', color: 'white' };
    switch (signal) {
      case 'BUY': return { ...base, backgroundColor: '#28a745' };
      case 'SELL': return { ...base, backgroundColor: '#dc3545' };
      case 'HOLD': return { ...base, backgroundColor: '#6c757d' };
      default: return { ...base, backgroundColor: '#000' };
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Market Dashboard</h1>

      {/* --- Search & Control Bar --- */}
      <section className="controls" style={{ marginBottom: '30px' }}>
        <form onSubmit={handleTickerSearch} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Search ticker (e.g. BTC-USD)" 
            value={inputTicker}
            onChange={(e) => setInputTicker(e.target.value)}
            style={{ padding: '8px', width: '200px' }}
          />
          <button type="submit" disabled={loading}>
            Analyze Asset
          </button>
          <button 
            type="button" 
            onClick={() => getTickerPrediction(selectedTicker)} 
            disabled={loading}
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

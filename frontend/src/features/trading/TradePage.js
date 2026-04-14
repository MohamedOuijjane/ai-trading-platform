import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tradingApi from '../../api/trading.api';

const TradePage = () => {
  const [ticker, setTicker] = useState('');
  const [action, setAction] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

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
      setTimeout(() => navigate('/app/portfolio'), 2000);
    } catch (err) {
      setError(err.message || 'Trade failed. Please check your balance and ticker.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Execute Trade</h1>
        <p className="text-sm text-trading-muted mt-1">Place a market order for any asset</p>
      </div>

      <form onSubmit={handleTrade} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium text-trading-muted mb-2">Ticker Symbol</label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="e.g. BTC-USD, AAPL, TSLA"
            className="input-field"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-trading-muted mb-2">Action</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAction('BUY')}
              className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                action === 'BUY'
                  ? 'btn-buy shadow-lg shadow-emerald-500/20'
                  : 'bg-trading-card border border-trading-border text-trading-muted hover:border-emerald-500/40'
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setAction('SELL')}
              className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                action === 'SELL'
                  ? 'btn-sell shadow-lg shadow-red-500/20'
                  : 'bg-trading-card border border-trading-border text-trading-muted hover:border-red-500/40'
              }`}
            >
              SELL
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-trading-muted mb-2">Quantity</label>
          <input
            type="number"
            step="0.0001"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00"
            className="input-field"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-trading-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-trading-green">Trade Executed Successfully</p>
                <p className="text-xs text-trading-muted mt-0.5">Redirecting to portfolio...</p>
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || success} className="w-full btn-primary py-3 text-base font-semibold">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `Confirm ${action}`
          )}
        </button>
      </form>
    </div>
  );
};

export default TradePage;
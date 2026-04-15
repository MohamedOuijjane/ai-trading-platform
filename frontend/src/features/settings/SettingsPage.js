import React, { useState, useEffect } from 'react';

const DEFAULT_CONFIG = {
  is_active: false,
  paper_trading: true,
  max_trade_amount: 1000,
  min_confidence: 0.75,
  stop_loss_pct: 2,
};

const SettingsPage = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('http://127.0.0.1:8000/api/v1/my-config/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch {
        setError('Could not load settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://127.0.0.1:8000/api/v1/my-config/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to save settings.');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const update = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-trading-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Trading Settings</h1>
        <p className="text-sm text-trading-muted mt-1">Configure your bot behavior and risk management</p>
      </div>

      <form onSubmit={handleSave} className="card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Auto-Trading</p>
            <p className="text-xs text-trading-muted mt-0.5">Automatically execute trades based on AI signals</p>
          </div>
          <button
            type="button"
            onClick={() => update('is_active', !config.is_active)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              config.is_active ? 'bg-trading-accent' : 'bg-trading-border'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                config.is_active ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Paper Trading</p>
            <p className="text-xs text-trading-muted mt-0.5">Simulate trades without real capital</p>
          </div>
          <button
            type="button"
            onClick={() => update('paper_trading', !config.paper_trading)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              config.paper_trading ? 'bg-trading-yellow' : 'bg-trading-border'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                config.paper_trading ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Max Trade Amount ($)</label>
          <input
            type="number"
            min="1"
            step="1"
            value={config.max_trade_amount}
            onChange={(e) => update('max_trade_amount', parseFloat(e.target.value))}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Min Confidence Threshold: {(config.min_confidence * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={config.min_confidence}
            onChange={(e) => update('min_confidence', parseFloat(e.target.value))}
            className="w-full accent-trading-accent"
          />
          <div className="flex justify-between text-xs text-trading-muted mt-1">
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Stop Loss (%)</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={config.stop_loss_pct}
            onChange={(e) => update('stop_loss_pct', parseFloat(e.target.value))}
            className="input-field"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-sm text-trading-green font-medium">Settings saved successfully!</p>
          </div>
        )}

        <button type="submit" disabled={saving} className="w-full btn-primary py-3 font-semibold">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
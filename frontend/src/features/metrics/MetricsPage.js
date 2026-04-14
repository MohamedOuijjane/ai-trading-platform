import React, { useState } from 'react';

const MOCK_METRICS = {
  total_trades: 0,
  accuracy: 0,
  avg_confidence: 0,
  total_pnl: 0,
};

const MOCK_RESULTS = [
  { period: '1D', return_pct: 0, trades: 0 },
  { period: '1W', return_pct: 0, trades: 0 },
  { period: '1M', return_pct: 0, trades: 0 },
];

const MetricsPage = () => {
  const [metrics] = useState(MOCK_METRICS);
  const [backtestResults] = useState(MOCK_RESULTS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Trading Metrics</h1>
        <p className="text-sm text-trading-muted mt-1">Model performance and backtesting results</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="stat-label">Total Trades</p>
          <p className="text-2xl font-bold text-white mt-1">{metrics.total_trades}</p>
        </div>
        <div className="card">
          <p className="stat-label">Accuracy</p>
          <p className="text-2xl font-bold text-trading-accent mt-1">{metrics.accuracy}%</p>
        </div>
        <div className="card">
          <p className="stat-label">Avg Confidence</p>
          <p className="text-2xl font-bold text-white mt-1">{metrics.avg_confidence}%</p>
        </div>
        <div className="card">
          <p className="stat-label">Total P&L</p>
          <p className={`text-2xl font-bold mt-1 ${metrics.total_pnl >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
            {metrics.total_pnl >= 0 ? '+' : ''}{metrics.total_pnl}%
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Backtesting Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-trading-border">
                <th className="text-left text-xs font-semibold text-trading-muted uppercase tracking-wider pb-3">Period</th>
                <th className="text-right text-xs font-semibold text-trading-muted uppercase tracking-wider pb-3">Return</th>
                <th className="text-right text-xs font-semibold text-trading-muted uppercase tracking-wider pb-3">Trades</th>
              </tr>
            </thead>
            <tbody>
              {backtestResults.map((r) => (
                <tr key={r.period} className="table-row">
                  <td className="table-cell font-medium text-white">{r.period}</td>
                  <td className={`table-cell text-right font-mono font-semibold ${r.return_pct >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
                    {r.return_pct >= 0 ? '+' : ''}{r.return_pct}%
                  </td>
                  <td className="table-cell text-right font-mono text-trading-muted">{r.trades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-trading-yellow font-medium">⚠️ Backtesting requires ML service connection</p>
          <p className="text-xs text-trading-muted mt-1">Connect to the ML service to enable real backtesting results.</p>
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;
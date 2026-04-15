import React, { useState, useEffect } from "react";
import { getMetrics } from "../../store/metricsStore";

const MOCK_RESULTS = [
  { period: "1D", return_pct: 0, trades: 0 },
  { period: "1W", return_pct: 0, trades: 0 },
  { period: "1M", return_pct: 0, trades: 0 },
];

const MetricsPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backtestResults] = useState(MOCK_RESULTS);

  useEffect(() => {
    let cancelled = false;

    getMetrics()
      .then((data) => {
        if (!cancelled) {
          setMetrics(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setMetrics({
            total_trades: 0,
            accuracy: 0,
            avg_confidence: 0,
            total_pnl: 0,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-trading-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-trading-muted">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 font-medium">Failed to load metrics</p>
          <p className="text-sm text-trading-muted mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const m = metrics || {
    total_trades: 0,
    accuracy: 0,
    avg_confidence: 0,
    total_pnl: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Trading Metrics</h1>
        <p className="text-sm text-trading-muted mt-1">
          Model performance and backtesting results
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="stat-label">Total Trades</p>
          <p className="text-2xl font-bold text-white mt-1">{m.total_trades}</p>
        </div>
        <div className="card">
          <p className="stat-label">Accuracy</p>
          <p className="text-2xl font-bold text-trading-accent mt-1">
            {m.accuracy}%
          </p>
        </div>
        <div className="card">
          <p className="stat-label">Avg Confidence</p>
          <p className="text-2xl font-bold text-white mt-1">
            {m.avg_confidence}%
          </p>
        </div>
        <div className="card">
          <p className="stat-label">Total P&L</p>
          <p
            className={`text-2xl font-bold mt-1 ${m.total_pnl >= 0 ? "text-trading-green" : "text-trading-red"}`}
          >
            {m.total_pnl >= 0 ? "+" : ""}$
            {m.total_pnl.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Backtesting Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-trading-border">
                <th className="text-left text-xs font-semibold text-trading-muted uppercase tracking-wider pb-3">
                  Period
                </th>
                <th className="text-right text-xs font-semibold text-trading-muted uppercase tracking-wider pb-3">
                  Return
                </th>
                <th className="text-right text-xs font-semibold text-trading-muted uppercase tracking-wider pb-3">
                  Trades
                </th>
              </tr>
            </thead>
            <tbody>
              {backtestResults.map((r) => (
                <tr key={r.period} className="table-row">
                  <td className="table-cell font-medium text-white">
                    {r.period}
                  </td>
                  <td
                    className={`table-cell text-right font-mono font-semibold ${r.return_pct >= 0 ? "text-trading-green" : "text-trading-red"}`}
                  >
                    {r.return_pct >= 0 ? "+" : ""}
                    {r.return_pct}%
                  </td>
                  <td className="table-cell text-right font-mono text-trading-muted">
                    {r.trades}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;

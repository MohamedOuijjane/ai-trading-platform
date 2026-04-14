import React, { useState, useEffect } from "react";
import portfolioApi from "../../api/portfolio.api";

const PortfolioPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        const result = await portfolioApi.getPortfolio();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-trading-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-trading-muted">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 font-medium">Failed to load portfolio</p>
          <p className="text-sm text-trading-muted mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const positions = data?.positions || [];
  const totalValue = data?.balance || 0;
  const totalPnL = data?.pnl || 0;
  const pnlPct =
    totalValue > 0 ? ((totalPnL / totalValue) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Portfolio</h1>
        <p className="text-sm text-trading-muted mt-1">
          Your current holdings and performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="stat-label">Total Balance</p>
          <p className="text-2xl font-bold text-white mt-1">
            $
            {totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="card">
          <p className="stat-label">Total P&L</p>
          <p
            className={`text-2xl font-bold mt-1 ${totalPnL >= 0 ? "text-trading-green" : "text-trading-red"}`}
          >
            {totalPnL >= 0 ? "+" : ""}
            {totalPnL.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="card">
          <p className="stat-label">Return</p>
          <p
            className={`text-2xl font-bold mt-1 ${parseFloat(pnlPct) >= 0 ? "text-trading-green" : "text-trading-red"}`}
          >
            {parseFloat(pnlPct) >= 0 ? "+" : ""}
            {pnlPct}%
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Positions</h3>
        {positions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-trading-accent/10 flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-7 h-7 text-trading-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="text-sm text-trading-muted">No open positions yet.</p>
            <p className="text-xs text-trading-muted mt-1">
              Execute a trade to see your holdings here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-trading-border">
                  <th className="text-left text-xs font-semibold text-trading-muted uppercase tracking-wider pb-3">
                    Asset
                  </th>
                  <th className="text-right text-xs font-semibold text-trading-muted uppercase tracking-wider pb-3">
                    Qty
                  </th>
                  <th className="text-right text-xs font-semibold text-trading-muted uppercase tracking-wider pb-3">
                    Avg Price
                  </th>
                  <th className="text-right text-xs font-semibold text-trading-muted uppercase tracking-wider pb-3">
                    Current
                  </th>
                  <th className="text-right text-xs font-semibold text-trading-muted uppercase tracking-wider pb-3">
                    P&L
                  </th>
                  <th className="text-right text-xs font-semibold text-trading-muted uppercase tracking-wider pb-3">
                    Return
                  </th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => {
                  const p = parseFloat(pos.avg_entry_price) || 0;
                  const pnl = parseFloat(pos.unrealized_pnl || 0);
                  const pnlPct = p > 0 ? ((pnl / p) * 100).toFixed(2) : "0.00";
                  return (
                    <tr key={pos.symbol} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-trading-accent/20 flex items-center justify-center text-xs font-bold text-trading-accent">
                            {pos.symbol.slice(0, 2)}
                          </div>
                          <span className="font-medium text-white">
                            {pos.symbol}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell text-right font-mono text-trading-text">
                        {parseFloat(pos.quantity).toFixed(4)}
                      </td>
                      <td className="table-cell text-right font-mono text-trading-muted">
                        ${p.toFixed(2)}
                      </td>
                      <td className="table-cell text-right font-mono text-white">
                        ${parseFloat(pos.current_price || 0).toFixed(2)}
                      </td>
                      <td
                        className={`table-cell text-right font-mono font-semibold ${pnl >= 0 ? "text-trading-green" : "text-trading-red"}`}
                      >
                        {pnl >= 0 ? "+" : ""}
                        {pnl.toFixed(2)}
                      </td>
                      <td
                        className={`table-cell text-right font-mono font-semibold ${pnl >= 0 ? "text-trading-green" : "text-trading-red"}`}
                      >
                        {pnl >= 0 ? "+" : ""}
                        {pnlPct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data?.history && data.history.length > 0 && (
        <div className="card">
          <h3 className="section-title">Recent Activity</h3>
          <div className="space-y-2">
            {data.history.slice(0, 5).map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-trading-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${h.action === "BUY" ? "bg-trading-green" : "bg-trading-red"}`}
                  />
                  <span className="text-sm font-medium text-white">
                    {h.symbol}
                  </span>
                  <span className="text-xs text-trading-muted">{h.action}</span>
                </div>
                <span className="text-xs text-trading-muted">
                  {new Date(h.executed_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;

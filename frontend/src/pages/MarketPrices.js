import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8000";

const styles = `
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .page-header h2 { font-size: 18px; font-weight: 600; color: var(--text); }
  .page-header-right { display: flex; align-items: center; gap: 12px; }

  .last-update { font-size: 11px; color: var(--text-muted); font-family: 'Space Mono', monospace; }

  .btn-refresh { padding: 7px 16px; border-radius: 8px; border: 1px solid var(--card-border); background: transparent; color: var(--text-dim); font-size: 12px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .btn-refresh:hover { border-color: var(--green); color: var(--green); }
  .btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

  .market-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }

  .market-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 14px; padding: 20px;
    transition: border-color 0.2s, transform 0.1s;
    cursor: default;
  }
  .market-card:hover { border-color: #3a3b48; transform: translateY(-1px); }
  .market-card.up   { border-left: 3px solid var(--green); }
  .market-card.down { border-left: 3px solid var(--red);   }
  .market-card.flat { border-left: 3px solid var(--text-muted); }

  .mc-symbol { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
  .mc-price  { font-family: 'Space Mono', monospace; font-size: 24px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .mc-change { font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
  .mc-change.up   { color: var(--green); }
  .mc-change.down { color: var(--red);   }
  .mc-change.flat { color: var(--text-muted); }

  .mc-stats { display: flex; justify-content: space-between; }
  .mc-stat { text-align: center; }
  .mc-stat-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-muted); margin-bottom: 3px; }
  .mc-stat-value { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--text-dim); }

  .table-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; overflow: hidden; }
  .table-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--card-border); }
  .table-header h3 { font-size: 15px; font-weight: 600; color: var(--text); }

  table { width: 100%; border-collapse: collapse; }
  thead th { padding: 12px 24px; text-align: left; font-size: 10px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--card-border); background: rgba(255,255,255,0.01); }
  tbody tr { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: rgba(255,255,255,0.02); }
  td { padding: 14px 24px; font-size: 13px; color: var(--text-dim); }
  td.symbol { font-family: 'Space Mono', monospace; font-weight: 700; color: var(--text); font-size: 13px; }
  td.price  { font-family: 'Space Mono', monospace; font-weight: 700; color: var(--text); font-size: 13px; }
  td.mono   { font-family: 'Space Mono', monospace; font-size: 12px; }

  .change-up   { color: var(--green); font-weight: 600; font-family: 'Space Mono', monospace; font-size: 12px; }
  .change-down { color: var(--red);   font-weight: 600; font-family: 'Space Mono', monospace; font-size: 12px; }
  .change-flat { color: var(--text-muted); font-family: 'Space Mono', monospace; font-size: 12px; }

  .sparkline { display: flex; align-items: flex-end; gap: 2px; height: 28px; }
  .spark-bar { width: 4px; border-radius: 2px; background: var(--green); opacity: 0.7; }

  .loading { display: flex; align-items: center; justify-content: center; padding: 80px; font-family: 'Space Mono', monospace; font-size: 13px; color: var(--text-muted); letter-spacing: 2px; }
  .empty { text-align: center; padding: 48px; color: var(--text-muted); font-size: 13px; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 10px; }
`;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const formatVolume = (v) => {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return v;
};

const changeClass = (c) => (c > 0 ? "up" : c < 0 ? "down" : "flat");
const changeSign = (c) => (c > 0 ? "▲" : c < 0 ? "▼" : "—");

export default function MarketPrices({ onExpired }) {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    console.log("MARKET FETCH START");
    console.log("TOKEN:", localStorage.getItem("access_token"));

    try {
      const res = await fetch(`${API_URL}/api/v1/market/prices/`, {
        headers: getHeaders(),
      });
      console.log("MARKET RESPONSE:", res);

      if (res.status === 401) {
        console.warn("MARKET: 401 received, calling onExpired");
        onExpired();
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      console.log("MARKET DATA RAW:", data);

      const formatted = (Array.isArray(data) ? data : []).map((item) => ({
        symbol: item.symbol || item.ticker || "UNKNOWN",
        price: item.price || 0,
        change: item.change || 0,
        change_pct: item.change_pct || 0,
        high: item.high || item.price || 0,
        low: item.low || item.price || 0,
        volume: item.volume || 0,
      }));

      setPrices(formatted);
      setLastUpdate(new Date().toLocaleTimeString("fr-FR"));
    } catch (err) {
      console.error("MARKET FETCH ERROR:", err);
      setPrices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 60000); // refresh toutes les 60s
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="admin-page">
        <style>{styles}</style>
        <div className="loading">CHARGEMENT DES PRIX...</div>
      </div>
    );

  return (
    <div className="admin-page">
      <style>{styles}</style>

      <div className="page-header">
        <h2>Prix du marché</h2>
        <div className="page-header-right">
          {lastUpdate && (
            <span className="last-update">Mis à jour à {lastUpdate}</span>
          )}
          <button
            className="btn-refresh"
            onClick={() => load(true)}
            disabled={refreshing}
          >
            {refreshing ? "..." : "↻ Actualiser"}
          </button>
        </div>
      </div>

      {/* CARDS */}
      <div className="market-grid">
        {prices.map((p) => {
          const cls = changeClass(p.change);
          return (
            <div key={p.symbol} className={`market-card ${cls}`}>
              <div className="mc-symbol">
                <span>{p.symbol}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    fontFamily: "DM Sans",
                  }}
                >
                  {p.change > 0 ? "📈" : p.change < 0 ? "📉" : "➡️"}
                </span>
              </div>
              <div className="mc-price">
                ${p.price > 0 ? p.price.toLocaleString() : "—"}
              </div>
              <div className={`mc-change ${cls}`}>
                <span>{changeSign(p.change)}</span>
                <span>
                  {p.change > 0 ? "+" : ""}
                  {p.change}
                </span>
                <span>
                  ({p.change_pct > 0 ? "+" : ""}
                  {p.change_pct}%)
                </span>
              </div>
              <div className="mc-stats">
                <div className="mc-stat">
                  <div className="mc-stat-label">Haut</div>
                  <div className="mc-stat-value">${p.high}</div>
                </div>
                <div className="mc-stat">
                  <div className="mc-stat-label">Bas</div>
                  <div className="mc-stat-value">${p.low}</div>
                </div>
                <div className="mc-stat">
                  <div className="mc-stat-label">Volume</div>
                  <div className="mc-stat-value">{formatVolume(p.volume)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="table-card">
        <div className="table-header">
          <h3>Tableau des cours</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Symbole</th>
              <th>Prix</th>
              <th>Variation</th>
              <th>Variation %</th>
              <th>Haut</th>
              <th>Bas</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {prices.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty">
                  Aucune donnée
                </td>
              </tr>
            ) : (
              prices.map((p) => {
                const cls = changeClass(p.change);
                return (
                  <tr key={p.symbol}>
                    <td className="symbol">{p.symbol}</td>
                    <td className="price">
                      ${p.price > 0 ? p.price.toLocaleString() : "—"}
                    </td>
                    <td className={`change-${cls}`}>
                      {changeSign(p.change)} {p.change > 0 ? "+" : ""}
                      {p.change}
                    </td>
                    <td className={`change-${cls}`}>
                      {p.change_pct > 0 ? "+" : ""}
                      {p.change_pct}%
                    </td>
                    <td className="mono">${p.high}</td>
                    <td className="mono">${p.low}</td>
                    <td className="mono">{formatVolume(p.volume)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

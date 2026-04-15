import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8000";

const styles = `
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .page-header h2 { font-size: 18px; font-weight: 600; color: var(--text); }

  .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
  .mini-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 18px 20px; }
  .mini-label { font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
  .mini-value { font-family: 'Space Mono', monospace; font-size: 24px; font-weight: 700; color: var(--text); }
  .mini-sub { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
  .mini-sub.green { color: var(--green); }
  .mini-sub.red   { color: var(--red);   }

  .table-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; overflow: hidden; }
  .table-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--card-border); }
  .table-header h3 { font-size: 15px; font-weight: 600; color: var(--text); }

  .filters { display: flex; gap: 8px; }
  .filter-btn { padding: 5px 14px; border-radius: 20px; border: 1px solid var(--card-border); background: transparent; color: var(--text-dim); font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
  .filter-btn:hover { border-color: var(--text-muted); color: var(--text); }
  .filter-btn.active-all    { background: rgba(255,255,255,0.06); color: var(--text); border-color: var(--text-muted); }
  .filter-btn.active-buy    { background: rgba(0,212,138,0.12);  color: var(--green);  border-color: var(--green);  }
  .filter-btn.active-sell   { background: rgba(248,113,113,0.12);color: var(--red);    border-color: var(--red);    }

  table { width: 100%; border-collapse: collapse; }
  thead th { padding: 12px 24px; text-align: left; font-size: 10px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--card-border); background: rgba(255,255,255,0.01); }
  tbody tr { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: rgba(255,255,255,0.02); }
  td { padding: 14px 24px; font-size: 13px; color: var(--text-dim); }
  td.mono { font-family: 'Space Mono', monospace; font-size: 12px; }
  td.symbol { font-family: 'Space Mono', monospace; font-weight: 700; color: var(--text); font-size: 13px; }
  td.user { color: var(--text); font-weight: 500; }

  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; letter-spacing: 0.5px; }
  .badge-green  { background: rgba(0,212,138,0.12);  color: var(--green); }
  .badge-red    { background: rgba(248,113,113,0.12);color: var(--red);   }
  .badge-orange { background: rgba(245,158,11,0.12); color: var(--orange);}

  .confidence-bar { height: 5px; border-radius: 3px; background: var(--card-border); width: 70px; display: inline-block; vertical-align: middle; margin-left: 8px; overflow: hidden; }
  .confidence-fill { height: 100%; border-radius: 3px; background: var(--green); }

  .pl-positive { color: var(--green); font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700; }
  .pl-negative { color: var(--red);   font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700; }

  .empty { text-align: center; padding: 48px; color: var(--text-muted); font-size: 13px; }
  .loading { display: flex; align-items: center; justify-content: center; padding: 48px; font-family: 'Space Mono', monospace; font-size: 13px; color: var(--text-muted); letter-spacing: 2px; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 10px; }
`;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

export default function Trades({ onExpired }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const fetchTrades = async () => {
      console.log("TRADES FETCH START");
      console.log("TOKEN:", localStorage.getItem("access_token"));
      try {
        const res = await fetch(`${API_URL}/api/v1/trades/`, {
          headers: getHeaders(),
        });
        console.log("TRADES RESPONSE:", res);

        if (res.status === 401) {
          onExpired();
          return;
        }

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        console.log("TRADES DATA RAW:", data);

        const formatted = (Array.isArray(data) ? data : []).map((t) => ({
          ...t,
          ticker: t.ticker || t.symbol || "UNKNOWN",
          action: (t.action || t.type || "BUY").toUpperCase(),
          price: parseFloat(t.price) || 0,
          quantity: parseFloat(t.quantity) || 0,
          profit_loss: t.profit_loss ? parseFloat(t.profit_loss) : null,
          confidence: parseFloat(t.confidence) || 0,
          user: t.user || "system",
        }));

        setTrades(formatted);
      } catch (err) {
        console.error("TRADES FETCH ERROR:", err);
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  const filtered =
    filter === "ALL" ? trades : trades.filter((t) => t.action === filter);

  const totalBuy = trades.filter((t) => t.action === "BUY").length;
  const totalSell = trades.filter((t) => t.action === "SELL").length;
  const totalPL = trades.reduce(
    (acc, t) => acc + (parseFloat(t.profit_loss) || 0),
    0,
  );
  const avgConf = trades.length
    ? (
        (trades.reduce((a, t) => a + (parseFloat(t.confidence) || 0), 0) /
          trades.length) *
        100
      ).toFixed(0)
    : 0;

  return (
    <div className="admin-page">
      <style>{styles}</style>

      <div className="page-header">
        <h2>Trades ({trades.length})</h2>
      </div>

      {/* MINI STATS */}
      <div className="stats-row">
        <div className="mini-card">
          <div className="mini-label">Total trades</div>
          <div className="mini-value">{trades.length}</div>
          <div className="mini-sub">
            {totalBuy} BUY · {totalSell} SELL
          </div>
        </div>
        <div className="mini-card">
          <div className="mini-label">Profit / Perte total</div>
          <div
            className="mini-value"
            style={{ color: totalPL >= 0 ? "var(--green)" : "var(--red)" }}
          >
            {totalPL >= 0 ? "+" : ""}
            {totalPL.toFixed(2)}$
          </div>
          <div className={`mini-sub ${totalPL >= 0 ? "green" : "red"}`}>
            {totalPL >= 0 ? "En profit" : "En perte"}
          </div>
        </div>
        <div className="mini-card">
          <div className="mini-label">Confiance IA moy.</div>
          <div className="mini-value">{avgConf}%</div>
          <div className="mini-sub">Sur {trades.length} trades</div>
        </div>
        <div className="mini-card">
          <div className="mini-label">Taux BUY</div>
          <div className="mini-value">
            {trades.length ? ((totalBuy / trades.length) * 100).toFixed(0) : 0}%
          </div>
          <div className="mini-sub green">{totalBuy} achats</div>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <div className="table-header">
          <h3>Historique des trades</h3>
          <div className="filters">
            {["ALL", "BUY", "SELL"].map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? `active-${f.toLowerCase()}` : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "ALL" ? "Tous" : f}
              </button>
            ))}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Utilisateur</th>
              <th>Symbole</th>
              <th>Action</th>
              <th>Prix</th>
              <th>Quantité</th>
              <th>Confiance IA</th>
              <th>P&L</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">
                  <div className="loading">CHARGEMENT...</div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty">
                  Aucun trade trouvé
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const pl = parseFloat(t.profit_loss);
                const confPct = (parseFloat(t.confidence) || 0) * 100;
                const date = new Date(t.executed_at).toLocaleString("fr-FR");
                return (
                  <tr key={t.id}>
                    <td className="mono">{date}</td>
                    <td className="user">{t.user}</td>
                    <td className="symbol">{t.ticker}</td>
                    <td>
                      <span
                        className={`badge ${t.action === "BUY" ? "badge-green" : "badge-red"}`}
                      >
                        {t.action}
                      </span>
                    </td>
                    <td className="mono">
                      ${parseFloat(t.price).toLocaleString()}
                    </td>
                    <td className="mono">{t.quantity}</td>
                    <td>
                      <span style={{ fontSize: 12 }}>
                        {confPct.toFixed(0)}%
                      </span>
                      <div className="confidence-bar">
                        <div
                          className="confidence-fill"
                          style={{ width: `${confPct}%` }}
                        />
                      </div>
                    </td>
                    <td>
                      {t.profit_loss ? (
                        <span
                          className={pl >= 0 ? "pl-positive" : "pl-negative"}
                        >
                          {pl >= 0 ? "+" : ""}
                          {pl.toFixed(2)}$
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
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

import { useState, useEffect } from "react";
import Charts from "./Charts";
import useAuth from "../hooks/useAuth";

const API_URL = "http://127.0.0.1:8000";

const styles = `
  :root {
    --bg: #0e0f13;
    --card-bg: #1a1b23;
    --card-border: #2a2b35;
    --text: #e8e9f0;
    --text-muted: #6b6d80;
    --text-dim: #9a9bb0;
    --green: #00d48a;
    --orange: #f59e0b;
    --purple: #a78bfa;
    --blue: #60a5fa;
    --red: #f87171;
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    margin-bottom: 32px;
  }

  @media (max-width: 1200px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 768px) {
    .stats-grid { grid-template-columns: 1fr; }
  }

  .stat-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 16px; padding: 24px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative; overflow: hidden;
  }
  .stat-card:hover {
    border-color: var(--green);
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.2);
  }

  .stat-label {
    font-size: 11px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px;
  }

  .stat-value {
    font-family: 'Space Mono', monospace;
    font-size: 32px; font-weight: 700; color: var(--text);
    line-height: 1; margin-bottom: 12px;
  }

  .stat-sub { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
  .stat-sub span { color: var(--green); font-weight: 600; }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  @media (max-width: 1024px) {
    .dashboard-grid { grid-template-columns: 1fr; }
  }

  .table-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--card-border);
  }
  .table-header h2 { font-size: 15px; font-weight: 600; color: var(--text); }

  .btn-outline {
    padding: 7px 16px; border-radius: 8px;
    border: 1px solid var(--card-border);
    background: transparent; color: var(--text-dim);
    font-size: 12px; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-outline:hover { border-color: var(--text-muted); color: var(--text); }

  table { width: 100%; border-collapse: collapse; }

  thead th {
    padding: 12px 24px; text-align: left;
    font-size: 10px; font-weight: 600; letter-spacing: 1.2px;
    text-transform: uppercase; color: var(--text-muted);
    border-bottom: 1px solid var(--card-border);
    background: rgba(255,255,255,0.01);
  }

  tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.1s;
  }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: rgba(255,255,255,0.02); }

  td { padding: 14px 24px; font-size: 13px; color: var(--text-dim); }
  td.time { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--text-muted); }
  td.user { color: var(--text); font-weight: 500; }
  td.action { color: var(--text); }

  .badge {
    display: inline-block; padding: 3px 10px;
    border-radius: 20px; font-size: 10px;
    font-weight: 600; letter-spacing: 0.5px;
  }
  .badge-green  { background: rgba(0,212,138,0.12);  color: var(--green);  }
  .badge-orange { background: rgba(245,158,11,0.12); color: var(--orange); }
  .badge-purple { background: rgba(167,139,250,0.12);color: var(--purple); }
  .badge-red    { background: rgba(248,113,113,0.12);color: var(--red);    }

  .loading {
    display: flex; align-items: center; justify-content: center;
    height: 100%; font-family: 'Space Mono', monospace;
    font-size: 13px; color: var(--text-muted); letter-spacing: 2px;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 10px; }
`;

const statusBadge = (s) => {
  const map = {
    green: ["badge-green", "OK"],
    orange: ["badge-orange", "AVERT."],
    red: ["badge-red", "STOP"],
    purple: ["badge-purple", "INFO"],
  };
  const [cls, label] = map[s] || ["badge-green", "OK"];
  return <span className={`badge ${cls}`}>{label}</span>;
};

const MOCK_ACTIONS = [
  {
    time: "09:14:32",
    user: "bot_engine",
    action: "Exécuté trade BUY...",
    model: "Trade",
    status: "green",
  },
  {
    time: "09:10:05",
    user: "celery",
    action: "Prédiction générée...",
    model: "Prediction",
    status: "green",
  },
  {
    time: "09:05:00",
    user: "celery",
    action: "Fetch prix BTC/USD",
    model: "StockPrice",
    status: "green",
  },
  {
    time: "08:58:11",
    user: "superadmin",
    action: "Modifié seuil confi...",
    model: "BotConfig",
    status: "orange",
  },
  {
    time: "08:45:22",
    user: "bot_engine",
    action: "Stop-loss déclenché...",
    model: "Trade",
    status: "red",
  },
];

export default function Dashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    users: "—",
    trades: "—",
    predictions: "—",
    bots: "—",
    pnl: 0,
    recent_activity: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/stats/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const d = await res.json();
        setStats({
          users: d.users ?? "—",
          trades: d.trades ?? "—",
          predictions: d.predictions ?? "—",
          bots: d.bots ?? "—",
          pnl: d.pnl ?? "0",
          recent_activity: d.recent_activity ?? [],
        });
      } catch (err) {
        console.error("STATS FETCH ERROR:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-page">
      <style>{styles}</style>
      {statsLoading ? (
        <div className="loading">CHARGEMENT...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Utilisateurs actifs</div>
              <div className="stat-value">{stats.users || 0}</div>
              <div className="stat-sub">
                <span>▲ 12%</span> vs mois dernier
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Trades exécutés</div>
              <div className="stat-value">{stats.trades || 0}</div>
              <div className="stat-sub">
                <span>▲ 24%</span> volume total
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Prédictions IA</div>
              <div className="stat-value">{stats.predictions || 0}</div>
              <div className="stat-sub">
                <span>▲ 8%</span> précision 82%
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">PnL Global</div>
              <div className="stat-value">{stats.pnl || 0}$</div>
              <div className="stat-sub">
                <span>▲ 1.2k$</span> ce mois-ci
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div style={{ gridColumn: "span 2" }}>
              <Charts onExpired={logout} />
            </div>

            <div className="table-card" style={{ gridColumn: "span 2" }}>
              <div className="table-header">
                <h2>Dernières actions</h2>
                <button className="btn-outline">Voir tout</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Heure</th>
                    <th>Utilisateur</th>
                    <th>Action</th>
                    <th>Modèle</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_activity.length === 0
                    ? MOCK_ACTIONS.map((a, i) => (
                        <tr key={i}>
                          <td className="time">{a.time}</td>
                          <td className="user">{a.user}</td>
                          <td className="action">{a.action}</td>
                          <td>{a.model}</td>
                          <td>{statusBadge(a.status)}</td>
                        </tr>
                      ))
                    : stats.recent_activity.map((a, i) => (
                        <tr key={i}>
                          <td className="time">{a.time}</td>
                          <td className="user">{a.user}</td>
                          <td className="action">{a.action}</td>
                          <td>{a.model}</td>
                          <td>{statusBadge(a.status)}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

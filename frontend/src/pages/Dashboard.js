import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Charts from "./Charts";

const API_URL = "http://127.0.0.1:8000";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #0e0f13;
    --sidebar-bg: #13141a;
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
    --accent: #00d48a;
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

  .layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg); }

  .sidebar {
    width: 260px; min-width: 260px;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--card-border);
    display: flex; flex-direction: column;
    overflow-y: auto; padding: 24px 0;
    transition: all 0.3s ease;
  }

  .sidebar-logo {
    padding: 0 24px 28px;
    border-bottom: 1px solid var(--card-border);
    margin-bottom: 8px;
  }

  .sidebar-logo h2 {
    font-family: 'Space Mono', monospace;
    font-size: 16px; color: var(--text); letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .sidebar-logo span {
    font-size: 10px; color: var(--green);
    font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
    opacity: 0.8;
  }

  .sidebar-section { padding: 16px 16px 4px; }

  .sidebar-section-label {
    font-size: 10px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--text-muted); margin-bottom: 12px;
    padding-left: 8px;
  }

  .sidebar-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 16px; border-radius: 10px;
    cursor: pointer; font-size: 14px;
    color: var(--text-dim); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 4px;
  }

  .sidebar-item:hover { 
    background: rgba(255,255,255,0.03); 
    color: var(--text);
    transform: translateX(4px);
  }

  .sidebar-item.active {
    background: rgba(0,212,138,0.1);
    color: var(--green); font-weight: 600;
    box-shadow: inset 3px 0 0 var(--green);
  }

  .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .dot-green { background: var(--green); box-shadow: 0 0 8px rgba(0,212,138,0.4); }
  .dot-orange { background: var(--orange); box-shadow: 0 0 8px rgba(245,158,11,0.4); }
  .dot-purple { background: var(--purple); box-shadow: 0 0 8px rgba(167,139,250,0.4); }
  .dot-blue { background: var(--blue); box-shadow: 0 0 8px rgba(96,165,250,0.4); }
  .dot-gray { background: var(--text-muted); }

  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }

  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 32px; border-bottom: 1px solid var(--card-border);
    background: rgba(19, 20, 26, 0.8);
    backdrop-filter: blur(12px);
    flex-shrink: 0; z-index: 10;
  }

  .topbar-left h1 { font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .breadcrumb { font-size: 12px; color: var(--text-muted); font-weight: 500; }

  .topbar-right { display: flex; align-items: center; gap: 16px; }

  .avatar {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, var(--green), #0066ff);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: white;
    font-family: 'Space Mono', monospace;
  }

  .username { font-size: 14px; font-weight: 600; color: var(--text); }

  .btn-logout {
    padding: 8px 16px; border-radius: 8px;
    border: 1px solid rgba(248,113,113,0.2);
    background: rgba(248,113,113,0.05); color: #f87171;
    font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-logout:hover { background: rgba(248,113,113,0.15); border-color: #f87171; }

  .content { 
    flex: 1; overflow-y: auto; padding: 32px;
    background: radial-gradient(circle at top right, rgba(0, 212, 138, 0.03), transparent 400px);
  }

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
    .sidebar { width: 0; min-width: 0; overflow: hidden; }
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

  /* USERS PAGE */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center; z-index: 100;
  }
  .modal {
    background: #1a1b23; border: 1px solid #2a2b35;
    border-radius: 16px; padding: 32px; width: 100%; max-width: 440px;
  }
  .modal h3 { font-size: 16px; font-weight: 600; color: #e8e9f0; margin-bottom: 24px; }
  .form-group { margin-bottom: 16px; }
  .form-label {
    display: block; font-size: 11px; font-weight: 600;
    letter-spacing: 1px; text-transform: uppercase;
    color: #6b6d80; margin-bottom: 6px;
  }
  .form-input {
    width: 100%; padding: 10px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid #2a2b35; border-radius: 8px;
    color: #e8e9f0; font-size: 13px;
    font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s;
  }
  .form-input:focus { border-color: #00d48a; }
  .modal-actions { display: flex; gap: 10px; margin-top: 24px; }
  .btn-primary {
    flex: 1; padding: 10px; background: #00d48a;
    border: none; border-radius: 8px; color: #0e0f13;
    font-weight: 700; font-size: 13px;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .btn-cancel {
    flex: 1; padding: 10px; background: transparent;
    border: 1px solid #2a2b35; border-radius: 8px;
    color: #6b6d80; font-size: 13px;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .btn-icon {
    padding: 5px 12px; border-radius: 6px; border: none;
    font-size: 11px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-toggle-on  { background: rgba(0,212,138,0.12);  color: #00d48a; }
  .btn-toggle-off { background: rgba(245,158,11,0.12); color: #f59e0b; }
  .btn-delete     { background: rgba(248,113,113,0.12);color: #f87171; }
  .btn-add {
    padding: 9px 20px; background: #00d48a; border: none;
    border-radius: 8px; color: #0e0f13; font-weight: 700;
    font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .page-header {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 24px;
  }
  .page-header h2 { font-size: 18px; font-weight: 600; color: #e8e9f0; }
  .empty { text-align: center; padding: 40px; color: #6b6d80; font-size: 13px; }
  .checkbox-row { display: flex; align-items: center; gap: 8px; }
  .checkbox-row input { width: auto; }
  .checkbox-row label { font-size: 13px; color: #9a9bb0; margin: 0; }

  .loading {
    display: flex; align-items: center; justify-content: center;
    height: 100%; font-family: 'Space Mono', monospace;
    font-size: 13px; color: var(--text-muted); letter-spacing: 2px;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 10px; }
`;

// ─── SIDEBAR CONFIG ───────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  {
    section: "TABLEAU DE BORD",
    items: [{ label: "Vue d'ensemble", dot: "green", page: "dashboard" }],
  },
  {
    section: "UTILISATEURS",
    items: [
      { label: "Utilisateurs", dot: "blue", page: "users" },
      { label: "Groupes", dot: "blue", page: null },
    ],
  },
  {
    section: "TRADING",
    items: [
      { label: "Trades", dot: "orange", page: "trades" },
      { label: "Prix marché", dot: "orange", page: "prices" },
      { label: "Portfolios", dot: "orange", page: "portfolios" },
    ],
  },
  {
    section: "IA / ML",
    items: [
      { label: "Prédictions", dot: "purple", page: "predictions" },
      { label: "Modèles ML", dot: "purple", page: "ml-models" },
      { label: "Logs Celery", dot: "purple", page: "celery-logs" },
    ],
  },
  {
    section: "SYSTÈME",
    items: [
      { label: "Logs d'audit", dot: "gray", page: "audit-logs" },
      { label: "Paramètres", dot: "gray", page: "settings" },
    ],
  },
];

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

// ─── PAGE TITLES ──────────────────────────────────────────────────
const PAGE_META = {
  dashboard: { title: "Vue d'ensemble", breadcrumb: "Admin › Dashboard" },
  users: { title: "Utilisateurs", breadcrumb: "Admin › Utilisateurs" },
  trades: { title: "Trades", breadcrumb: "Admin › Trading" },
  prices: { title: "Prix marché", breadcrumb: "Admin › Trading" },
  portfolios: { title: "Portfolios", breadcrumb: "Admin › Trading" },
  predictions: { title: "Prédictions IA", breadcrumb: "Admin › IA / ML" },
  "ml-models": { title: "Modèles ML", breadcrumb: "Admin › IA / ML" },
  "celery-logs": { title: "Logs Celery", breadcrumb: "Admin › IA / ML" },
  "audit-logs": { title: "Logs d'audit", breadcrumb: "Admin › Système" },
  settings: { title: "Paramètres", breadcrumb: "Admin › Système" },
};

// ─── DASHBOARD (main export) ──────────────────────────────────────
export default function Dashboard({
  onLogout,
  currentPage,
  onNavigate,
  children,
}) {
  const [stats, setStats] = useState({
    users: "—",
    trades: "—",
    predictions: "—",
    bots: "—",
    pnl: 0,
    recent_activity: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [username, setUsername] = useState("superadmin");

  useEffect(() => {
    const user = localStorage.getItem("username");
    const token = localStorage.getItem("access_token");
    if (user) setUsername(user);

    const fetchStats = async () => {
      console.log("STATS FETCH START");
      console.log("TOKEN:", token);
      try {
        const res = await fetch(`${API_URL}/api/stats/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("STATS RESPONSE:", res);

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const d = await res.json();
        console.log("STATS DATA RAW:", d);

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

  const meta = PAGE_META[currentPage] || PAGE_META.dashboard;
  const initials = username.slice(0, 2).toUpperCase();

  const renderContent = () => {
    if (children) return children;

    return (
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
            <Charts onExpired={onLogout} />
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
                {stats.recent_activity.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty">
                      Aucune activité récente
                    </td>
                  </tr>
                ) : (
                  stats.recent_activity.map((a, i) => (
                    <tr key={i}>
                      <td className="time">{a.time}</td>
                      <td className="user">{a.user}</td>
                      <td className="action">{a.action}</td>
                      <td>{a.model}</td>
                      <td>{statusBadge(a.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div className="layout">
        {/* SIDEBAR */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={onNavigate}
          items={SIDEBAR_ITEMS}
        />

        {/* MAIN */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <h1>{meta.title}</h1>
              <div className="breadcrumb">{meta.breadcrumb}</div>
            </div>
            <div className="topbar-right">
              <div className="avatar">{initials}</div>
              <span className="username">{username}</span>
              <button className="btn-logout" onClick={onLogout}>
                Déconnexion
              </button>
            </div>
          </div>

          <div className="content">
            {statsLoading && currentPage === "dashboard" ? (
              <div className="loading">CHARGEMENT...</div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
    </>
  );
}

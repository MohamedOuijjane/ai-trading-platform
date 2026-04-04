import { useState, useEffect } from "react";
import Users from "./Users";

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

  .layout { display: flex; height: 100vh; overflow: hidden; }

  .sidebar {
    width: 240px; min-width: 240px;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--card-border);
    display: flex; flex-direction: column;
    overflow-y: auto; padding: 24px 0;
  }

  .sidebar-logo {
    padding: 0 20px 28px;
    border-bottom: 1px solid var(--card-border);
  }

  .sidebar-logo h2 {
    font-family: 'Space Mono', monospace;
    font-size: 15px; color: var(--text); letter-spacing: 0.5px;
  }

  .sidebar-logo span {
    font-size: 11px; color: var(--green);
    font-weight: 500; letter-spacing: 1px; text-transform: uppercase;
  }

  .sidebar-section { padding: 20px 20px 4px; }

  .sidebar-section-label {
    font-size: 10px; font-weight: 600;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--text-muted); margin-bottom: 8px;
  }

  .sidebar-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 12px; border-radius: 8px;
    cursor: pointer; font-size: 13.5px;
    color: var(--text-dim); transition: all 0.15s; margin-bottom: 2px;
  }

  .sidebar-item:hover { background: rgba(255,255,255,0.04); color: var(--text); }

  .sidebar-item.active {
    background: rgba(0,212,138,0.1);
    color: var(--green); font-weight: 500;
  }

  .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .dot-green { background: var(--green); }
  .dot-orange { background: var(--orange); }
  .dot-purple { background: var(--purple); }
  .dot-blue { background: var(--blue); }
  .dot-gray { background: var(--text-muted); }

  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 32px; border-bottom: 1px solid var(--card-border);
    background: var(--bg); flex-shrink: 0;
  }

  .topbar-left h1 { font-size: 22px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
  .breadcrumb { font-size: 12px; color: var(--text-muted); }

  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #00d48a, #0066ff);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: white;
    font-family: 'Space Mono', monospace;
  }

  .username { font-size: 13px; font-weight: 500; color: var(--text-dim); }

  .btn-logout {
    padding: 7px 16px; border-radius: 8px;
    border: 1px solid rgba(248,113,113,0.3);
    background: transparent; color: #f87171;
    font-size: 12px; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-logout:hover { background: rgba(248,113,113,0.08); }

  .content { flex: 1; overflow-y: auto; padding: 28px 32px; }

  .stat-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 16px; margin-bottom: 24px;
  }

  .stat-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 14px; padding: 22px; transition: border-color 0.2s;
  }
  .stat-card:hover { border-color: #3a3b48; }

  .stat-label {
    font-size: 11px; font-weight: 500; letter-spacing: 0.8px;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px;
  }

  .stat-value {
    font-family: 'Space Mono', monospace;
    font-size: 36px; font-weight: 700; color: var(--text);
    line-height: 1; margin-bottom: 8px;
  }
  .stat-value.big { font-size: 28px; }

  .stat-sub { font-size: 12px; color: var(--text-muted); }
  .stat-sub.green { color: var(--green); font-weight: 500; }
  .stat-sub.orange { color: var(--orange); font-weight: 500; }

  .table-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 14px; overflow: hidden;
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
    items: [{ label: "Vue d'ensemble", dot: "green", page: "dashboard" }]
  },
  {
    section: "UTILISATEURS",
    items: [
      { label: "Utilisateurs", dot: "blue", page: "users" },
      { label: "Groupes",      dot: "blue", page: null  },
    ]
  },
  {
    section: "TRADING",
    items: [
      { label: "Trades",      dot: "orange", page: "trades"     },
      { label: "Prix marché", dot: "orange", page: "prices"     },
      { label: "Portfolios",  dot: "orange", page: "portfolios" },
    ]
  },
  {
    section: "IA / ML",
    items: [
      { label: "Prédictions", dot: "purple", page: "predictions" },
      { label: "Modèles ML",  dot: "purple", page: null          },
      { label: "Logs Celery", dot: "purple", page: null          },
    ]
  },
  {
    section: "SYSTÈME",
    items: [
      { label: "Logs d'audit", dot: "gray", page: null },
      { label: "Paramètres",   dot: "gray", page: null },
    ]
  },
];

const MOCK_ACTIONS = [
  { time: "09:14:32", user: "bot_engine",  action: "Exécuté trade BUY...",      model: "Trade",      status: "green"  },
  { time: "09:10:05", user: "celery",      action: "Prédiction générée...",      model: "Prediction", status: "green"  },
  { time: "09:05:00", user: "celery",      action: "Fetch prix BTC/USD",         model: "StockPrice", status: "green"  },
  { time: "08:58:11", user: "superadmin",  action: "Modifié seuil confi...",     model: "BotConfig",  status: "orange" },
  { time: "08:45:22", user: "bot_engine",  action: "Stop-loss déclenché...",     model: "Trade",      status: "red"    },
];

const statusBadge = (s) => {
  const map = {
    green:  ["badge-green",  "OK"],
    orange: ["badge-orange", "AVERT."],
    red:    ["badge-red",    "STOP"],
    purple: ["badge-purple", "INFO"],
  };
  const [cls, label] = map[s] || ["badge-green", "OK"];
  return <span className={`badge ${cls}`}>{label}</span>;
};

// ─── PAGE TITLES ──────────────────────────────────────────────────
const PAGE_META = {
  dashboard:   { title: "Vue d'ensemble",  breadcrumb: "Admin › Dashboard"    },
  users:       { title: "Utilisateurs",    breadcrumb: "Admin › Utilisateurs" },
  trades:      { title: "Trades",          breadcrumb: "Admin › Trading"      },
  prices:      { title: "Prix marché",     breadcrumb: "Admin › Trading"      },
  portfolios:  { title: "Portfolios",      breadcrumb: "Admin › Trading"      },
  predictions: { title: "Prédictions IA",  breadcrumb: "Admin › IA / ML"      },
};

// ─── USERS PAGE ───────────────────────────────────────────────────
function UsersPage() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]       = useState('');
  const [form, setForm]         = useState({
    username: '', email: '', password: '',
    first_name: '', last_name: '', is_staff: false,
  });

  const token = localStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const load = () => {
    setLoading(true);
    fetch(`${API_URL}/api/users/`, { headers })
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.username || !form.password) { setError("Username et mot de passe requis."); return; }
    await fetch(`${API_URL}/api/users/`, { method: 'POST', headers, body: JSON.stringify(form) });
    setShowModal(false);
    setForm({ username: '', email: '', password: '', first_name: '', last_name: '', is_staff: false });
    setError('');
    load();
  };

  const handleToggle = async (id) => {
    await fetch(`${API_URL}/api/users/${id}/toggle/`, { method: 'POST', headers });
    load();
  };

  const handleDelete = async (id, uname) => {
    if (window.confirm(`Supprimer "${uname}" ?`)) {
      await fetch(`${API_URL}/api/users/${id}/`, { method: 'DELETE', headers });
      load();
    }
  };

  if (loading) return <div className="loading">CHARGEMENT...</div>;

  return (
    <>
      <div className="page-header">
        <h2>Utilisateurs ({users.length})</h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>+ Nouvel utilisateur</button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Utilisateur</th><th>Email</th><th>Rôle</th>
              <th>Statut</th><th>Inscrit le</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="6" className="empty">Aucun utilisateur</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td className="user">{u.username}</td>
                <td>{u.email || '—'}</td>
                <td>
                  <span className={`badge ${u.is_staff ? 'badge-purple' : 'badge-green'}`}>
                    {u.is_staff ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.is_active ? 'badge-green' : 'badge-orange'}`}>
                    {u.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="time">{new Date(u.date_joined).toLocaleDateString('fr-FR')}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button
                    className={`btn-icon ${u.is_active ? 'btn-toggle-off' : 'btn-toggle-on'}`}
                    onClick={() => handleToggle(u.id)}
                  >
                    {u.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(u.id, u.username)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Nouvel utilisateur</h3>
            {error && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</div>}
            {[
              { label: "Nom d'utilisateur *", key: 'username',   type: 'text'     },
              { label: 'Email',               key: 'email',      type: 'email'    },
              { label: 'Mot de passe *',      key: 'password',   type: 'password' },
              { label: 'Prénom',              key: 'first_name', type: 'text'     },
              { label: 'Nom',                 key: 'last_name',  type: 'text'     },
            ].map(f => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                <input
                  className="form-input" type={f.type} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <div className="form-group">
              <div className="checkbox-row">
                <input type="checkbox" id="is_staff" checked={form.is_staff}
                  onChange={e => setForm({ ...form, is_staff: e.target.checked })} />
                <label htmlFor="is_staff">Administrateur (staff)</label>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn-primary" onClick={handleCreate}>Créer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── COMING SOON ──────────────────────────────────────────────────
function ComingSoon({ title }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b6d80' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🚧</div>
      <div style={{ fontFamily: 'Space Mono', fontSize: 14, letterSpacing: 2 }}>
        {title.toUpperCase()} — BIENTÔT DISPONIBLE
      </div>
    </div>
  );
}

// ─── DASHBOARD (main export) ──────────────────────────────────────
export default function Dashboard({ onLogout }) {
  const [stats, setStats]     = useState({ users: '—', trades: '—', predictions: '—', bots: '—' });
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentPage, setCurrentPage]  = useState('dashboard');
  const [username, setUsername]        = useState('superadmin');

  useEffect(() => {
    const user  = localStorage.getItem('username');
    const token = localStorage.getItem('access_token');
    if (user) setUsername(user);

    fetch(`${API_URL}/api/stats/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setStats({
        users:       d.users       ?? '—',
        trades:      d.trades      ?? '—',
        predictions: d.predictions ?? '—',
        bots:        d.bots        ?? '—',
      }))
      .finally(() => setStatsLoading(false));
  }, []);

  const meta     = PAGE_META[currentPage] || PAGE_META.dashboard;
  const initials = username.slice(0, 2).toUpperCase();

  const renderPage = () => {
    switch (currentPage) {
      case 'users':       return <UsersPage />;
      case 'trades':      return <ComingSoon title="Trades" />;
      case 'prices':      return <ComingSoon title="Prix marché" />;
      case 'portfolios':  return <ComingSoon title="Portfolios" />;
      case 'predictions': return <ComingSoon title="Prédictions IA" />;
      default:            return (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Utilisateurs</div>
              <div className="stat-value">{stats.users}</div>
              <div className="stat-sub green">+3 ce mois</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Trades total</div>
              <div className="stat-value big">
                {typeof stats.trades === 'number' ? stats.trades.toLocaleString() : stats.trades}
              </div>
              <div className="stat-sub">47 aujourd'hui</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Prédictions IA</div>
              <div className="stat-value big">
                {typeof stats.predictions === 'number' ? stats.predictions.toLocaleString() : stats.predictions}
              </div>
              <div className="stat-sub orange">Précision: 78%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Bots actifs</div>
              <div className="stat-value">{stats.bots}</div>
              <div className="stat-sub">6 en pause</div>
            </div>
          </div>

          <div className="table-card">
            <div className="table-header">
              <h2>Dernières actions</h2>
              <button className="btn-outline">Voir tout</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Heure</th><th>Utilisateur</th>
                  <th>Action</th><th>Modèle</th><th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ACTIONS.map((row, i) => (
                  <tr key={i}>
                    <td className="time">{row.time}</td>
                    <td className="user">{row.user}</td>
                    <td className="action">{row.action}</td>
                    <td>{row.model}</td>
                    <td>{statusBadge(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="layout">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h2>TradingBot Admin</h2>
            <span>Django Administration</span>
          </div>
          {SIDEBAR_ITEMS.map(section => (
            <div className="sidebar-section" key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.items.map(item => (
                <div
                  key={item.label}
                  className={`sidebar-item ${currentPage === item.page ? 'active' : ''}`}
                  onClick={() => item.page && setCurrentPage(item.page)}
                  style={{ opacity: item.page ? 1 : 0.45, cursor: item.page ? 'pointer' : 'default' }}
                >
                  <span className={`dot dot-${item.dot}`} />
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </aside>

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
              <button className="btn-logout" onClick={onLogout}>Déconnexion</button>
            </div>
          </div>

          <div className="content">
            {statsLoading && currentPage === 'dashboard'
              ? <div className="loading">CHARGEMENT...</div>
              : renderPage()
            }
          </div>
        </div>

      </div>
    </>
  );
}
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import useAuth from "../../hooks/useAuth";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

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

  .admin-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg); }

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

  .admin-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }

  .admin-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 32px; border-bottom: 1px solid var(--card-border);
    background: rgba(19, 20, 26, 0.8);
    backdrop-filter: blur(12px);
    flex-shrink: 0; z-index: 10;
  }

  .admin-topbar h1 { font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .admin-breadcrumb { font-size: 12px; color: var(--text-muted); font-weight: 500; }

  .admin-topbar-right { display: flex; align-items: center; gap: 16px; }
  .admin-avatar {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, var(--green), #0066ff);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: white;
    font-family: 'Space Mono', monospace;
  }
  .admin-username { font-size: 14px; font-weight: 600; color: var(--text); }
  .admin-btn-logout {
    padding: 8px 16px; border-radius: 8px;
    border: 1px solid rgba(248,113,113,0.2);
    background: rgba(248,113,113,0.05); color: #f87171;
    font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .admin-btn-logout:hover { background: rgba(248,113,113,0.15); border-color: #f87171; }

  .admin-content {
    flex: 1; overflow-y: auto; padding: 32px;
    background: radial-gradient(circle at top right, rgba(0, 212, 138, 0.03), transparent 400px);
  }

  .admin-page {
    width: 100%;
    max-width: 100%;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 10px; }
`;

export default function AdminLayout() {
  const { logout } = useAuth();
  const username = localStorage.getItem("username") || "admin";
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <>
      <style>{styles}</style>
      <div className="admin-layout">
        <Sidebar />
        <div className="admin-main">
          <div className="admin-topbar">
            <div className="admin-topbar-left">
              <h1>TradingBot Admin</h1>
              <div className="admin-breadcrumb">Administration</div>
            </div>
            <div className="admin-topbar-right">
              <div className="admin-avatar">{initials}</div>
              <span className="admin-username">{username}</span>
              <button className="admin-btn-logout" onClick={logout}>
                Déconnexion
              </button>
            </div>
          </div>
          <div className="admin-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

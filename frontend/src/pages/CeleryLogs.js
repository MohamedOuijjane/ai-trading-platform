import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8000";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: #0e0f13; --card-bg: #1a1b23; --card-border: #2a2b35;
    --text: #e8e9f0; --text-muted: #6b6d80; --text-dim: #9a9bb0;
    --green: #00d48a; --orange: #f59e0b; --red: #f87171; --purple: #a78bfa;
  }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .page-header h2 { font-size: 18px; font-weight: 600; color: var(--text); }
  .table-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; overflow: hidden; }
  .table-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--card-border); }
  .table-header h3 { font-size: 15px; font-weight: 600; color: var(--text); }
  .btn-refresh { padding: 7px 16px; border-radius: 8px; border: 1px solid var(--card-border); background: transparent; color: var(--text-dim); font-size: 12px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .btn-refresh:hover { border-color: var(--green); color: var(--green); }
  table { width: 100%; border-collapse: collapse; }
  thead th { padding: 12px 24px; text-align: left; font-size: 10px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--card-border); background: rgba(255,255,255,0.01); }
  tbody tr { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: rgba(255,255,255,0.02); }
  td { padding: 12px 24px; font-size: 12px; color: var(--text-dim); }
  td.mono { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--text-muted); }
  td.user { color: var(--text); font-weight: 500; font-size: 13px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .badge-add    { background: rgba(0,212,138,0.12);  color: var(--green);  }
  .badge-change { background: rgba(245,158,11,0.12); color: var(--orange); }
  .badge-delete { background: rgba(248,113,113,0.12);color: var(--red);    }
  .empty { text-align: center; padding: 48px; color: var(--text-muted); font-size: 13px; }
  .loading { display: flex; align-items: center; justify-content: center; padding: 80px; font-family: 'Space Mono', monospace; font-size: 13px; color: var(--text-muted); letter-spacing: 2px; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 10px; }
`;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const actionBadge = (action, type) => {
  if (type === "prediction")
    return (
      <span
        className="badge"
        style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}
      >
        IA
      </span>
    );
  if (type === "trade")
    return (
      <span
        className="badge"
        style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
      >
        {action}
      </span>
    );
  if (action === "Addition")
    return <span className="badge badge-add">AJOUT</span>;
  if (action === "Changement")
    return <span className="badge badge-change">MODIF</span>;
  if (action === "Suppression")
    return <span className="badge badge-delete">SUPPR</span>;
  return <span className="badge badge-add">{action}</span>;
};

export default function CeleryLogs({ onExpired }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/logs/celery/`, { headers: getHeaders() })
      .then((r) => {
        if (r.status === 401) {
          onExpired();
          return [];
        }
        return r.json();
      })
      .then((d) => setLogs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="admin-page">
      <style>{styles}</style>

      <div className="page-header">
        <h2>Logs d'activité ({logs.length})</h2>
        <button className="btn-refresh" onClick={load}>
          ↻ Rafraîchir
        </button>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Journal des actions</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date/Heure</th>
              <th>Utilisateur</th>
              <th>Action</th>
              <th>Modèle</th>
              <th>Objet</th>
              <th>Détails</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">
                  <div className="loading">CHARGEMENT...</div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty">
                  Aucun log disponible
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id}>
                  <td className="mono">{l.time}</td>
                  <td className="user">{l.user}</td>
                  <td>{actionBadge(l.action)}</td>
                  <td
                    style={{
                      color: "var(--purple)",
                      fontFamily: "Space Mono",
                      fontSize: 11,
                    }}
                  >
                    {l.model}
                  </td>
                  <td
                    style={{
                      fontSize: 12,
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {l.object}
                  </td>
                  <td
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {l.message}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

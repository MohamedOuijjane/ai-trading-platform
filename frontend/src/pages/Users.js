import { useState, useEffect } from "react";
import { getUsers, createUser, toggleUser, deleteUser } from "./api";

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

  .admin-page {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .page-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
  }

  .page-content {
    width: 100%;
  }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 20px;
  }

  .table-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead th {
    padding: 12px 24px;
    text-align: left;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--text-muted);
    border-bottom: 1px solid var(--card-border);
    background: rgba(255,255,255,0.01);
  }

  tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.1s;
  }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: rgba(255,255,255,0.02); }

  td {
    padding: 14px 24px;
    font-size: 13px;
    color: var(--text-dim);
  }

  td.user {
    color: var(--text);
    font-weight: 500;
  }

  td.time {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: var(--text-muted);
  }

  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .badge-green  { background: rgba(0,212,138,0.12);  color: var(--green);  }
  .badge-orange { background: rgba(245,158,11,0.12); color: var(--orange); }
  .badge-purple { background: rgba(167,139,250,0.12);color: var(--purple); }
  .badge-red    { background: rgba(248,113,113,0.12);color: var(--red);    }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    color: var(--text-muted);
    letter-spacing: 2px;
  }

  .empty {
    text-align: center;
    padding: 40px;
    color: var(--text-muted);
    font-size: 13px;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 10px; }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
  }
  .modal {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 32px;
    width: 100%; max-width: 440px;
  }
  .modal h3 {
    font-size: 16px; font-weight: 600;
    color: var(--text); margin-bottom: 24px;
  }
  .form-group { margin-bottom: 16px; }
  .form-label {
    display: block; font-size: 11px; font-weight: 600;
    letter-spacing: 1px; text-transform: uppercase;
    color: var(--text-muted); margin-bottom: 6px;
  }
  .form-input {
    width: 100%; padding: 10px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--card-border); border-radius: 8px;
    color: var(--text); font-size: 13px;
    font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.2s;
  }
  .form-input:focus { border-color: var(--green); }
  .modal-actions { display: flex; gap: 10px; margin-top: 24px; }
  .btn-primary {
    flex: 1; padding: 10px;
    background: var(--green); border: none; border-radius: 8px;
    color: #0e0f13; font-weight: 700; font-size: 13px;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .btn-cancel {
    flex: 1; padding: 10px;
    background: transparent; border: 1px solid var(--card-border);
    border-radius: 8px; color: var(--text-muted); font-size: 13px;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .btn-icon {
    padding: 5px 12px; border-radius: 6px; border: none;
    font-size: 11px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-toggle-on  { background: rgba(0,212,138,0.12); color: var(--green); }
  .btn-toggle-off { background: rgba(245,158,11,0.12); color: var(--orange); }
  .btn-delete     { background: rgba(248,113,113,0.12); color: var(--red); }
  .btn-add {
    padding: 9px 20px;
    background: var(--green); border: none; border-radius: 8px;
    color: #0e0f13; font-weight: 700; font-size: 13px;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: opacity 0.2s;
  }
  .btn-add:hover { opacity: 0.85; }
  .checkbox-row { display: flex; align-items: center; gap: 8px; }
  .checkbox-row input { width: auto; }
  .checkbox-row label { font-size: 13px; color: var(--text-dim); margin: 0; }
`;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    is_staff: false,
  });
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    getUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.username || !form.password) {
      setError("Username et mot de passe requis.");
      return;
    }
    await createUser(form);
    setShowModal(false);
    setForm({
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      is_staff: false,
    });
    setError("");
    load();
  };

  const handleToggle = async (id) => {
    await toggleUser(id);
    load();
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Supprimer "${username}" ?`)) {
      await deleteUser(id);
      load();
    }
  };

  return (
    <div className="admin-page">
      <style>{styles}</style>

      <div className="page-header">
        <h2>Utilisateurs ({users.length})</h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          + Nouvel utilisateur
        </button>
      </div>

      <div className="page-content">
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty">
                    Chargement...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty">
                    Aucun utilisateur
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="user">{u.username}</td>
                    <td>{u.email || "—"}</td>
                    <td>
                      <span
                        className={`badge ${u.is_staff ? "badge-purple" : "badge-green"}`}
                      >
                        {u.is_staff ? "Admin" : "User"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${u.is_active ? "badge-green" : "badge-orange"}`}
                      >
                        {u.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="time">
                      {new Date(u.date_joined).toLocaleDateString("fr-FR")}
                    </td>
                    <td style={{ display: "flex", gap: "6px" }}>
                      <button
                        className={`btn-icon ${u.is_active ? "btn-toggle-off" : "btn-toggle-on"}`}
                        onClick={() => handleToggle(u.id)}
                      >
                        {u.is_active ? "Désactiver" : "Activer"}
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(u.id, u.username)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CRÉER */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nouvel utilisateur</h3>
            {error && (
              <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>
                {error}
              </div>
            )}
            {[
              { label: "Nom d'utilisateur *", key: "username", type: "text" },
              { label: "Email", key: "email", type: "email" },
              { label: "Mot de passe *", key: "password", type: "password" },
              { label: "Prénom", key: "first_name", type: "text" },
              { label: "Nom", key: "last_name", type: "text" },
            ].map((f) => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                <input
                  className="form-input"
                  type={f.type}
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm({ ...form, [f.key]: e.target.value })
                  }
                />
              </div>
            ))}
            <div className="form-group">
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="is_staff"
                  checked={form.is_staff}
                  onChange={(e) =>
                    setForm({ ...form, is_staff: e.target.checked })
                  }
                />
                <label htmlFor="is_staff">Administrateur (staff)</label>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Annuler
              </button>
              <button className="btn-primary" onClick={handleCreate}>
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

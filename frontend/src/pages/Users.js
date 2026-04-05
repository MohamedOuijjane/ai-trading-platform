import { useState, useEffect } from "react";
import { getUsers, createUser, toggleUser, deleteUser } from "./api";

const styles = `
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
  }
  .modal {
    background: #1a1b23;
    border: 1px solid #2a2b35;
    border-radius: 16px;
    padding: 32px;
    width: 100%; max-width: 440px;
  }
  .modal h3 {
    font-size: 16px; font-weight: 600;
    color: #e8e9f0; margin-bottom: 24px;
  }
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
    font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.2s;
  }
  .form-input:focus { border-color: #00d48a; }
  .modal-actions { display: flex; gap: 10px; margin-top: 24px; }
  .btn-primary {
    flex: 1; padding: 10px;
    background: #00d48a; border: none; border-radius: 8px;
    color: #0e0f13; font-weight: 700; font-size: 13px;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .btn-cancel {
    flex: 1; padding: 10px;
    background: transparent; border: 1px solid #2a2b35;
    border-radius: 8px; color: #6b6d80; font-size: 13px;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .btn-icon {
    padding: 5px 12px; border-radius: 6px; border: none;
    font-size: 11px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-toggle-on  { background: rgba(0,212,138,0.12); color: #00d48a; }
  .btn-toggle-off { background: rgba(245,158,11,0.12); color: #f59e0b; }
  .btn-delete     { background: rgba(248,113,113,0.12); color: #f87171; }
  .page-header {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 24px;
  }
  .page-header h2 { font-size: 18px; font-weight: 600; color: #e8e9f0; }
  .btn-add {
    padding: 9px 20px;
    background: #00d48a; border: none; border-radius: 8px;
    color: #0e0f13; font-weight: 700; font-size: 13px;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
  }
  .empty { text-align: center; padding: 40px; color: #6b6d80; font-size: 13px; }
  .checkbox-row { display: flex; align-items: center; gap: 8px; }
  .checkbox-row input { width: auto; }
  .checkbox-row label { font-size: 13px; color: #9a9bb0; margin: 0; }
`;

export default function Users() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({
    username: '', email: '', password: '',
    first_name: '', last_name: '', is_staff: false
  });
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getUsers()
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.username || !form.password) {
      setError("Username et mot de passe requis.");
      return;
    }
    await createUser(form);
    setShowModal(false);
    setForm({ username: '', email: '', password: '', first_name: '', last_name: '', is_staff: false });
    setError('');
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
    <>
      <style>{styles}</style>

      <div className="page-header">
        <h2>Utilisateurs ({users.length})</h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          + Nouvel utilisateur
        </button>
      </div>

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
              <tr><td colSpan="6" className="empty">Chargement...</td></tr>
            ) : users.length === 0 ? (
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
                <td className="time">
                  {new Date(u.date_joined).toLocaleDateString('fr-FR')}
                </td>
                <td style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className={`btn-icon ${u.is_active ? 'btn-toggle-off' : 'btn-toggle-on'}`}
                    onClick={() => handleToggle(u.id)}
                  >
                    {u.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(u.id, u.username)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CRÉER */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Nouvel utilisateur</h3>
            {error && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</div>}
            {[
              { label: 'Nom d\'utilisateur *', key: 'username', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Mot de passe *', key: 'password', type: 'password' },
              { label: 'Prénom', key: 'first_name', type: 'text' },
              { label: 'Nom', key: 'last_name', type: 'text' },
            ].map(f => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                <input
                  className="form-input"
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <div className="form-group">
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="is_staff"
                  checked={form.is_staff}
                  onChange={e => setForm({ ...form, is_staff: e.target.checked })}
                />
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
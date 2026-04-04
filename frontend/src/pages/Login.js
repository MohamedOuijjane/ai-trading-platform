import { useState } from "react";
import { login } from "./api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #0e0f13;
    --card-bg: #1a1b23;
    --card-border: #2a2b35;
    --text: #e8e9f0;
    --text-muted: #6b6d80;
    --green: #00d48a;
    --red: #f87171;
  }

  body { background: var(--bg); font-family: 'DM Sans', sans-serif; }

  .login-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
  }

  .login-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 20px;
    padding: 48px 40px;
    width: 100%;
    max-width: 420px;
  }

  .login-logo {
    text-align: center;
    margin-bottom: 36px;
  }

  .login-logo h1 {
    font-family: 'Space Mono', monospace;
    font-size: 20px;
    color: var(--text);
    margin-bottom: 6px;
  }

  .login-logo span {
    font-size: 12px;
    color: var(--green);
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  .form-input {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--card-border);
    border-radius: 10px;
    color: var(--text);
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s;
  }

  .form-input:focus {
    border-color: var(--green);
  }

  .btn-login {
    width: 100%;
    padding: 13px;
    background: var(--green);
    border: none;
    border-radius: 10px;
    color: #0e0f13;
    font-size: 14px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    margin-top: 8px;
    letter-spacing: 0.5px;
    transition: opacity 0.2s;
  }

  .btn-login:hover { opacity: 0.88; }
  .btn-login:disabled { opacity: 0.5; cursor: not-allowed; }

  .error-msg {
    background: rgba(248,113,113,0.1);
    border: 1px solid rgba(248,113,113,0.3);
    color: var(--red);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    margin-bottom: 20px;
    text-align: center;
  }
`;

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) {
      setError("Remplis tous les champs.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await login(username, password);
      if (data.access) {
        onLogin();
      } else {
        setError("Identifiants incorrects.");
      }
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-logo">
            <h1>TradingBot Admin</h1>
            <span>Panneau d'administration</span>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label className="form-label">Nom d'utilisateur</label>
            <input
              className="form-input"
              type="text"
              placeholder="superadmin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>

          <button className="btn-login" onClick={handleSubmit} disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      </div>
    </>
  );
}
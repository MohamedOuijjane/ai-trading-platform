import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8000";

const styles = `
  .settings-container { max-width: 720px; }
  .settings-header { margin-bottom: 32px; }
  .settings-header h2 { font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .settings-header p { font-size: 13px; color: var(--text-muted); }
  .settings-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 20px;
  }
  .settings-card h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--card-border);
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .form-group { display: flex; flex-direction: column; gap: 8px; }
  .form-group.full-width { grid-column: span 2; }
  .form-label { font-size: 12px; font-weight: 600; color: var(--text-dim); letter-spacing: 0.5px; text-transform: uppercase; }
  .form-input {
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid var(--card-border);
    background: rgba(255,255,255,0.03);
    color: var(--text);
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s;
  }
  .form-input:focus { outline: none; border-color: var(--green); background: rgba(255,255,255,0.05); }
  .form-select {
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid var(--card-border);
    background: rgba(255,255,255,0.03);
    color: var(--text);
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .form-select:focus { outline: none; border-color: var(--green); }
  .form-select option { background: #1a1b23; }
  .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .toggle-row:last-child { border-bottom: none; }
  .toggle-info { display: flex; flex-direction: column; gap: 4px; }
  .toggle-title { font-size: 14px; font-weight: 500; color: var(--text); }
  .toggle-desc { font-size: 12px; color: var(--text-muted); }
  .toggle-switch { position: relative; width: 44px; height: 24px; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute; cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background: #2a2b35;
    border-radius: 24px;
    transition: 0.3s;
  }
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px; width: 18px;
    left: 3px; bottom: 3px;
    background: white;
    border-radius: 50%;
    transition: 0.3s;
  }
  input:checked + .toggle-slider { background: var(--green); }
  input:checked + .toggle-slider:before { transform: translateX(20px); }
  .btn-save {
    padding: 12px 28px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #00d48a, #00b377);
    color: #0e0f13;
    font-size: 14px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-save:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,212,138,0.3); }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-save.saving { background: linear-gradient(135deg, #00b377, #009966); }
  .settings-footer { display: flex; justify-content: flex-end; margin-top: 8px; }
  .alert { padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
  .alert-success { background: rgba(0,212,138,0.1); border: 1px solid rgba(0,212,138,0.3); color: var(--green); }
  .alert-error { background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.3); color: #f87171; }
  .loading { display: flex; align-items: center; justify-content: center; padding: 80px; font-family: 'Space Mono', monospace; font-size: 13px; color: var(--text-muted); letter-spacing: 2px; }
  .risk-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .risk-low { background: rgba(0,212,138,0.15); color: var(--green); }
  .risk-medium { background: rgba(245,158,11,0.15); color: var(--orange); }
  .risk-high { background: rgba(248,113,113,0.15); color: #f87171; }
`;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const RISK_LABELS = { low: "Faible", medium: "Moyen", high: "Élevé" };

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      console.log("SETTINGS FETCH START");
      try {
        const res = await fetch(`${API_URL}/api/v1/settings/`, {
          headers: getHeaders(),
        });
        console.log("SETTINGS RESPONSE:", res);

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        console.log("SETTINGS DATA:", data);
        setSettings(data);
      } catch (err) {
        console.error("SETTINGS LOAD ERROR:", err);
        setMessage({
          type: "error",
          text: "Impossible de charger les paramètres.",
        });
        setSettings({
          trading_enabled: true,
          max_trade_amount: 1000,
          risk_level: "medium",
          auto_trade: false,
          min_confidence: 0.75,
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/settings/`, {
        method: "PATCH",
        headers: { ...getHeaders() },
        body: JSON.stringify(settings),
      });
      console.log("SETTINGS SAVE RESPONSE:", res);

      if (!res.ok) throw new Error(`Save failed: ${res.status}`);

      const data = await res.json();
      setSettings(data);
      setMessage({
        type: "success",
        text: "Paramètres enregistrés avec succès.",
      });
    } catch (err) {
      console.error("SETTINGS SAVE ERROR:", err);
      setMessage({ type: "error", text: "Erreur lors de l'enregistrement." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <style>{styles}</style>
        <div className="loading">CHARGEMENT...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <style>{styles}</style>
      <div className="settings-container">
        <div className="settings-header">
          <h2>⚙️ Paramètres Système</h2>
          <p>Gérez la configuration globale de la plateforme de trading.</p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <div className="settings-card">
          <h3>🤖 Configuration IA</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Confiance minimum IA</label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={settings?.min_confidence ?? 0.75}
                onChange={(e) =>
                  handleChange("min_confidence", parseFloat(e.target.value))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Niveau de risque</label>
              <select
                className="form-select"
                value={settings?.risk_level ?? "medium"}
                onChange={(e) => handleChange("risk_level", e.target.value)}
              >
                <option value="low">🟢 Faible</option>
                <option value="medium">🟡 Moyen</option>
                <option value="high">🔴 Élevé</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h3>💹 Configuration Trading</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Montant max / trade ($)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="100"
                value={settings?.max_trade_amount ?? 1000}
                onChange={(e) =>
                  handleChange("max_trade_amount", parseFloat(e.target.value))
                }
              />
            </div>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-title">Trading activé</span>
              <span className="toggle-desc">
                Autoriser les trades sur la plateforme
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings?.trading_enabled ?? true}
                onChange={(e) =>
                  handleChange("trading_enabled", e.target.checked)
                }
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-title">Trading automatique</span>
              <span className="toggle-desc">
                Exécuter automatiquement les trades basés sur les signaux IA
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings?.auto_trade ?? false}
                onChange={(e) => handleChange("auto_trade", e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        <div className="settings-footer">
          <button
            className={`btn-save ${saving ? "saving" : ""}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "⏳ Enregistrement..."
              : "💾 Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
}

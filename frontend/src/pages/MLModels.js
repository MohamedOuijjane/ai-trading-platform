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
  .metrics-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 24px; }
  .metric-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 20px; }
  .metric-label { font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
  .metric-value { font-family: 'Space Mono', monospace; font-size: 28px; font-weight: 700; color: var(--text); }
  .metric-sub { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
  .models-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
  .model-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 18px; transition: border-color 0.2s; }
  .model-card.ready   { border-left: 3px solid var(--green); }
  .model-card.missing { border-left: 3px solid var(--red); opacity: 0.6; }
  .model-ticker { font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 12px; display: flex; justify-content: space-between; }
  .model-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .model-key { font-size: 11px; color: var(--text-muted); }
  .model-val { font-size: 11px; font-family: 'Space Mono', monospace; color: var(--text-dim); }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .badge-green  { background: rgba(0,212,138,0.12); color: var(--green); }
  .badge-red    { background: rgba(248,113,113,0.12); color: var(--red); }
  .btn-refresh { padding: 7px 16px; border-radius: 8px; border: 1px solid var(--card-border); background: transparent; color: var(--text-dim); font-size: 12px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
  .btn-refresh:hover { border-color: var(--green); color: var(--green); }
  .loading { display: flex; align-items: center; justify-content: center; padding: 80px; font-family: 'Space Mono', monospace; font-size: 13px; color: var(--text-muted); letter-spacing: 2px; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 10px; }
`;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

export default function MLModels({ onExpired }) {
  const [data,    setData]    = useState({ models: [], metrics: {} });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/ml/models/`, { headers: getHeaders() })
      .then(r => { if (r.status===401){onExpired();return null;} return r.json(); })
      .then(d => { if (d) setData(d); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <><style>{styles}</style><div className="loading">CHARGEMENT...</div></>;

  const ready   = data.models.filter(m => m.status === 'ready').length;
  const missing = data.models.filter(m => m.status === 'missing').length;
  const totalPred = data.models.reduce((a, m) => a + m.predictions, 0);

  return (
    <>
      <style>{styles}</style>

      <div className="page-header">
        <h2>Modèles ML ({data.models.length})</h2>
        <button className="btn-refresh" onClick={load}>↻ Rafraîchir</button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Modèles prêts</div>
          <div className="metric-value" style={{color:"var(--green)"}}>{ready}</div>
          <div className="metric-sub">sur {data.models.length} total</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total prédictions</div>
          <div className="metric-value">{totalPred}</div>
          <div className="metric-sub">toutes périodes</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Latence moyenne</div>
          <div className="metric-value" style={{fontSize:20}}>
            {data.metrics?.avg_latency_ms ? `${data.metrics.avg_latency_ms.toFixed(0)} ms` : "—"}
          </div>
          <div className="metric-sub">
            {data.metrics?.total_predictions ? `${data.metrics.total_predictions} requêtes` : "ML metrics"}
          </div>
        </div>
      </div>

      <div className="models-grid">
        {data.models.map(m => (
          <div key={m.ticker} className={`model-card ${m.status}`}>
            <div className="model-ticker">
              <span>{m.ticker}</span>
              <span className={`badge badge-${m.status === 'ready' ? 'green' : 'red'}`}>
                {m.status === 'ready' ? 'PRÊT' : 'MANQUANT'}
              </span>
            </div>
            <div className="model-row">
              <span className="model-key">Modèle LSTM</span>
              <span style={{color: m.model_exists ? "var(--green)" : "var(--red)", fontSize:12}}>
                {m.model_exists ? "✓" : "✗"}
              </span>
            </div>
            <div className="model-row">
              <span className="model-key">Scaler</span>
              <span style={{color: m.scaler_exists ? "var(--green)" : "var(--red)", fontSize:12}}>
                {m.scaler_exists ? "✓" : "✗"}
              </span>
            </div>
            <div className="model-row">
              <span className="model-key">Taille</span>
              <span className="model-val">{m.size_kb > 0 ? `${m.size_kb} KB` : "—"}</span>
            </div>
            <div className="model-row">
              <span className="model-key">Prédictions</span>
              <span className="model-val">{m.predictions}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
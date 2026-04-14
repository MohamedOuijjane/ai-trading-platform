import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8000";

const styles = `
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .page-header h2 { font-size: 18px; font-weight: 600; color: var(--text); }

  .ml-status { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted); padding: 6px 14px; border: 1px solid var(--card-border); border-radius: 20px; background: var(--card-bg); }
  .ml-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
  .ml-dot.offline { background: var(--red); animation: none; }
  .ml-dot.checking { background: var(--orange); }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .predict-box { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 28px; margin-bottom: 24px; }
  .predict-box h3 { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
  .predict-row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
  .predict-input { padding: 11px 16px; background: rgba(255,255,255,0.04); border: 1px solid var(--card-border); border-radius: 8px; color: var(--text); font-size: 15px; font-family: 'Space Mono', monospace; outline: none; width: 180px; text-transform: uppercase; letter-spacing: 1px; transition: border-color 0.2s; }
  .predict-input:focus { border-color: var(--green); }
  .btn-predict { padding: 11px 28px; background: var(--green); border: none; border-radius: 8px; color: #0e0f13; font-weight: 700; font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: opacity 0.2s; letter-spacing: 0.3px; }
  .btn-predict:hover { opacity: 0.88; }
  .btn-predict:disabled { opacity: 0.45; cursor: not-allowed; }

  .ticker-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
  .ticker-chip { padding: 4px 13px; border-radius: 20px; background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); color: var(--text-dim); font-size: 11px; font-family: 'Space Mono', monospace; cursor: pointer; transition: all 0.15s; letter-spacing: 0.5px; }
  .ticker-chip:hover { border-color: var(--green); color: var(--green); background: rgba(0,212,138,0.06); }

  .err-msg { color: var(--red); font-size: 12px; margin-top: 16px; padding: 10px 14px; background: rgba(248,113,113,0.08); border-radius: 8px; border: 1px solid rgba(248,113,113,0.2); }
  .success-msg { color: var(--green); font-size: 12px; margin-top: 16px; padding: 10px 14px; background: rgba(0,212,138,0.08); border-radius: 8px; border: 1px solid rgba(0,212,138,0.2); }

  .result-card { margin-top: 20px; padding: 24px; border-radius: 12px; border: 1px solid var(--card-border); background: rgba(255,255,255,0.02); display: grid; grid-template-columns: auto 1fr 1fr 1fr 1fr; gap: 24px; align-items: center; }
  .result-signal { font-family: 'Space Mono', monospace; font-size: 36px; font-weight: 700; letter-spacing: 2px; }
  .signal-BUY  { color: var(--green);  }
  .signal-SELL { color: var(--red);    }
  .signal-HOLD { color: var(--orange); }
  .result-meta label { font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 4px; }
  .result-meta strong { font-size: 15px; color: var(--text); font-weight: 600; }
  .result-meta .mono { font-family: 'Space Mono', monospace; }

  .confidence-bar { height: 6px; border-radius: 3px; background: var(--card-border); width: 100%; margin-top: 6px; overflow: hidden; }
  .confidence-fill-green  { height: 100%; border-radius: 3px; background: var(--green);  transition: width 0.6s ease; }
  .confidence-fill-red    { height: 100%; border-radius: 3px; background: var(--red);    transition: width 0.6s ease; }
  .confidence-fill-orange { height: 100%; border-radius: 3px; background: var(--orange); transition: width 0.6s ease; }

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
  td { padding: 14px 24px; font-size: 13px; color: var(--text-dim); }
  td.mono { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--text-muted); }
  td.symbol { font-family: 'Space Mono', monospace; font-weight: 700; color: var(--text); }

  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; letter-spacing: 0.5px; }
  .badge-green  { background: rgba(0,212,138,0.12);  color: var(--green);  }
  .badge-red    { background: rgba(248,113,113,0.12);color: var(--red);    }
  .badge-orange { background: rgba(245,158,11,0.12); color: var(--orange); }

  .conf-inline { display: flex; align-items: center; gap: 8px; }
  .conf-bar-sm { height: 5px; width: 80px; border-radius: 3px; background: var(--card-border); overflow: hidden; }
  .conf-bar-fill { height: 100%; border-radius: 3px; background: var(--green); }

  .empty { text-align: center; padding: 48px; color: var(--text-muted); font-size: 13px; }
  .loading-row { text-align: center; padding: 48px; font-family: 'Space Mono', monospace; font-size: 13px; color: var(--text-muted); letter-spacing: 2px; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 10px; }
`;

const TICKERS = [
  "AAPL",
  "NVDA",
  "BTC-USD",
  "ETH-USD",
  "MSFT",
  "GOOGL",
  "TSLA",
  "AMZN",
];

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const confColor = (signal) => {
  if (signal === "BUY") return "confidence-fill-green";
  if (signal === "SELL") return "confidence-fill-red";
  return "confidence-fill-orange";
};

const toPercent = (val) => {
  if (!val && val !== 0) return 0;
  return val < 1 ? parseFloat((val * 100).toFixed(1)) : parseFloat(val);
};

export default function Predictions({ onExpired }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticker, setTicker] = useState("");
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState(null);
  const [predError, setPredError] = useState("");
  const [tradeMsg, setTradeMsg] = useState(""); // ← AJOUTÉ
  const [mlStatus, setMlStatus] = useState("checking");

  const loadPredictions = () => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/predictions/`, { headers: getHeaders() })
      .then((r) => {
        if (r.status === 401) {
          onExpired();
          return [];
        }
        return r.json();
      })
      .then((d) => setPredictions(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  const checkHealth = () => {
    setMlStatus("checking");
    fetch(`${API_URL}/api/v1/health/`, { headers: getHeaders() })
      .then((r) => r.json())
      .then((d) => setMlStatus(d.status === "ok" ? "online" : "offline"))
      .catch(() => setMlStatus("offline"));
  };

  useEffect(() => {
    loadPredictions();
    checkHealth();
  }, []);

  const handlePredict = async () => {
    if (!ticker.trim()) {
      setPredError("Entrez un ticker (ex: AAPL, NVDA, BTC-USD)");
      return;
    }
    setPredicting(true);
    setPredError("");
    setTradeMsg(""); // ← reset
    setResult(null);
    try {
      const res = await fetch(
        `${API_URL}/api/v1/predict/${ticker.toUpperCase()}/`,
        {
          method: "GET",
          headers: getHeaders(),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        loadPredictions();
        // ── Message automatique si trade créé ──
        if (data.valid) {
          setTradeMsg(
            `✅ Analyse terminée pour ${data.ticker} ! Signal: ${data.signal} (${toPercent(data.confidence)}%)`,
          );
        } else {
          setPredError(data.error || "Erreur lors de la prédiction");
        }
      } else if (res.status === 401) {
        onExpired();
      } else {
        setPredError(
          data.detail || data.error || "Erreur lors de la prédiction",
        );
      }
    } catch {
      setPredError("Erreur de connexion au serveur");
    } finally {
      setPredicting(false);
    }
  };

  const signalBadge = (s) => {
    const map = { BUY: "badge-green", SELL: "badge-red", HOLD: "badge-orange" };
    return <span className={`badge ${map[s] || "badge-green"}`}>{s}</span>;
  };

  return (
    <>
      <style>{styles}</style>

      <div className="page-header">
        <h2>Prédictions IA</h2>
        <div className="ml-status">
          <div
            className={`ml-dot ${mlStatus === "offline" ? "offline" : mlStatus === "checking" ? "checking" : ""}`}
          />
          <span>
            ML Service :{" "}
            {mlStatus === "checking"
              ? "vérification..."
              : mlStatus === "online"
                ? "en ligne ✓"
                : "hors ligne ✗"}
          </span>
        </div>
      </div>

      <div className="predict-box">
        <h3>🤖 Lancer une prédiction</h3>
        <div className="predict-row">
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: 6,
              }}
            >
              Ticker
            </label>
            <input
              className="predict-input"
              placeholder="ex: AAPL"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handlePredict()}
            />
          </div>
          <button
            className="btn-predict"
            onClick={handlePredict}
            disabled={predicting || mlStatus === "offline"}
          >
            {predicting ? "Analyse en cours..." : "Prédire →"}
          </button>
          <button
            className="btn-refresh"
            onClick={checkHealth}
            style={{ marginBottom: 1 }}
          >
            ↺ ML Status
          </button>
        </div>

        <div className="ticker-chips">
          {TICKERS.map((t) => (
            <div key={t} className="ticker-chip" onClick={() => setTicker(t)}>
              {t}
            </div>
          ))}
        </div>

        {predError && <div className="err-msg">{predError}</div>}
        {tradeMsg && <div className="success-msg">{tradeMsg}</div>}

        {result && (
          <div className="result-card">
            <div className={`result-signal signal-${result.signal}`}>
              {result.signal}
            </div>
            <div className="result-meta">
              <label>Symbole</label>
              <strong className="mono">{result.ticker}</strong>
            </div>
            <div className="result-meta">
              <label>Prix actuel</label>
              <strong className="mono">
                $
                {parseFloat(result.price) > 0
                  ? parseFloat(result.price).toLocaleString()
                  : "—"}
              </strong>
            </div>
            <div className="result-meta">
              <label>Confiance</label>
              <strong>{toPercent(result.confidence)}%</strong>
              <div className="confidence-bar">
                <div
                  className={confColor(result.signal)}
                  style={{ width: `${toPercent(result.confidence)}%` }}
                />
              </div>
            </div>
            <div className="result-meta">
              <label>Latence ML</label>
              <strong className="mono">
                {result.latency_ms
                  ? `${parseFloat(result.latency_ms).toFixed(1)} ms`
                  : "—"}
              </strong>
            </div>
          </div>
        )}
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Historique des prédictions ({predictions.length})</h3>
          <button className="btn-refresh" onClick={loadPredictions}>
            ↻ Rafraîchir
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbole</th>
              <th>Signal</th>
              <th>Confiance</th>
              <th>Prix prédit</th>
              <th>Prix réel</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">
                  <div className="loading-row">CHARGEMENT...</div>
                </td>
              </tr>
            ) : predictions.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty">
                  Aucune prédiction — lancez-en une ci-dessus !
                </td>
              </tr>
            ) : (
              predictions.map((p) => {
                const confPct = toPercent(p.confidence);
                const date = new Date(p.created_at).toLocaleString("fr-FR");
                return (
                  <tr key={p.id}>
                    <td className="mono">{date}</td>
                    <td className="symbol">{p.ticker}</td>
                    <td>{signalBadge(p.signal)}</td>
                    <td>
                      <div className="conf-inline">
                        <span style={{ fontSize: 12 }}>{confPct}%</span>
                        <div className="conf-bar-sm">
                          <div
                            className="conf-bar-fill"
                            style={{ width: `${confPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="mono">
                      {parseFloat(p.price) > 0 ? (
                        `$${parseFloat(p.price).toLocaleString()}`
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="mono">
                      {p.actual_price ? (
                        `$${parseFloat(p.actual_price).toLocaleString()}`
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

import React, { useState, useEffect } from "react";
import metricsApi from "../../api/metrics.api";

/**
 * MetricsPage Component
 * Provides observability into ML model performance and historical backtesting.
 * Key metrics: ROI, Win Rate, Accuracy, Precision, Recall.
 */
const MetricsPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [backtest, setBacktest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicker, setSelectedTicker] = useState("AAPL");

  /**
   * Fetches performance and backtest data.
   */
  const fetchAllMetrics = async (ticker) => {
    setLoading(true);
    setError(null);
    try {
      const [metricsData, backtestData] = await Promise.all([
        metricsApi.getModelMetrics(),
        metricsApi.getBacktest(ticker),
      ]);

      setMetrics(metricsData);
      setBacktest(backtestData);
    } catch (err) {
      console.error("[Metrics Fetch Error]:", err);
      setError(err.message || "Failed to load system metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMetrics(selectedTicker);
  }, [selectedTicker]);

  if (loading)
    return (
      <div className="loading">
        <h3>Analyzing system performance...</h3>
      </div>
    );
  if (error)
    return (
      <div className="error" style={{ color: "red" }}>
        Error: {error}
      </div>
    );

  return (
    <div className="metrics-container">
      <h1>System Observability</h1>

      {/* --- Section 1: Model Accuracy & Health --- */}
      <section className="model-performance" style={{ marginBottom: "40px" }}>
        <h2>ML Model Performance (Real-time)</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <label>Global Accuracy</label>
            <div style={{ fontSize: "1.5rem", color: "#28a745" }}>
              {(metrics?.accuracy * 100).toFixed(1)}%
            </div>
          </div>
          <div
            style={{
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <label>Precision (Buy)</label>
            <div style={{ fontSize: "1.5rem" }}>
              {(metrics?.precision * 100).toFixed(1)}%
            </div>
          </div>
          <div
            style={{
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <label>Recall (Buy)</label>
            <div style={{ fontSize: "1.5rem" }}>
              {(metrics?.recall * 100).toFixed(1)}%
            </div>
          </div>
          <div
            style={{
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <label>Total Predictions</label>
            <div style={{ fontSize: "1.5rem" }}>
              {metrics?.total_predictions?.toLocaleString()}
            </div>
          </div>
        </div>
      </section>

      <hr />

      {/* --- Section 2: Historical Backtesting --- */}
      <section className="backtesting-results" style={{ marginTop: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>Historical Backtesting Results</h2>
          <select
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            style={{ padding: "5px" }}
          >
            <option value="AAPL">AAPL</option>
            <option value="BTC-USD">BTC-USD</option>
            <option value="TSLA">TSLA</option>
            <option value="NVDA">NVDA</option>
          </select>
        </div>

        {backtest ? (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "30px",
              }}
            >
              <div>
                <label>Total Return (ROI)</label>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: backtest.total_return_pct >= 0 ? "green" : "red",
                  }}
                >
                  {backtest.total_return_pct >= 0 ? "+" : ""}
                  {backtest.total_return_pct}%
                </div>
              </div>
              <div>
                <label>Strategy Win Rate</label>
                <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  {backtest.win_rate_pct}%
                </div>
              </div>
              <div>
                <label>Max Drawdown</label>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "#dc3545",
                  }}
                >
                  {backtest.max_drawdown_pct}%
                </div>
              </div>
              <div>
                <label>Trade Count</label>
                <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  {backtest.total_trades}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "30px",
                padding: "15px",
                borderLeft: "4px solid #007bff",
                backgroundColor: "white",
              }}
            >
              <strong>Backtest Period:</strong> Last 2 years of daily market
              data.
              <br />
              <strong>Strategy:</strong> LSTM-driven signals with 0.3% threshold
              filtering.
            </div>
          </div>
        ) : (
          <p>No backtest data available for {selectedTicker}.</p>
        )}
      </section>
    </div>
  );
};

export default MetricsPage;

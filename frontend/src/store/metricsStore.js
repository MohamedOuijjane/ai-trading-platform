import { apiClient } from "../api/client";

let metricsCache = null;
let metricsTimestamp = null;
const CACHE_TTL_MS = 30_000;

export async function getMetrics(forceRefresh = false) {
  const now = Date.now();
  if (
    !forceRefresh &&
    metricsCache &&
    metricsTimestamp &&
    now - metricsTimestamp < CACHE_TTL_MS
  ) {
    console.log("[metricsStore] Metrics cache hit — returning cached data");
    return metricsCache;
  }

  console.log("[metricsStore] Fetching metrics from API...");
  try {
    const raw = await apiClient("/api/v1/metrics/");

    const normalized = {
      total_trades: parseInt(raw.total_trades || 0),
      accuracy: parseFloat(raw.accuracy || 0),
      avg_confidence: parseFloat(raw.avg_confidence || 0),
      total_pnl: parseFloat(raw.total_pnl || 0),
    };

    metricsCache = normalized;
    metricsTimestamp = now;
    console.log("[metricsStore] Metrics cached successfully");
    return normalized;
  } catch (err) {
    console.warn("[metricsStore] Metrics fetch failed:", err.message);
    return (
      metricsCache || {
        total_trades: 0,
        accuracy: 0.0,
        avg_confidence: 0.0,
        total_pnl: 0.0,
      }
    );
  }
}

export function clearMetricsCache() {
  metricsCache = null;
  metricsTimestamp = null;
}

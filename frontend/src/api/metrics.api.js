import apiClient from "./client";

/**
 * Metrics & Backtesting API Service
 */
const metricsApi = {
  /**
   * Get ML model performance metrics
   */
  getModelMetrics: () => {
    return apiClient("/api/v1/metrics");
  },

  /**
   * Get historical backtest results for a ticker
   * @param {string} ticker
   */
  getBacktest: (ticker) => {
    return apiClient(`/api/v1/backtest/${ticker}`);
  },
};

export default metricsApi;

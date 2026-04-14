import { apiClient } from "./client";

const metricsApi = {
  getModelMetrics: () => {
    return apiClient("/api/v1/metrics/");
  },

  getBacktest: (ticker) => {
    return apiClient(`/api/v1/backtest/${ticker.toUpperCase()}/`);
  },
};

export default metricsApi;
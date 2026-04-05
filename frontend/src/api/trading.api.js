import apiClient from "./client";

/**
 * Trading API Service
 */
const tradingApi = {
  /**
   * Get AI prediction for a specific ticker
   * @param {string} ticker
   */
  getPrediction: (ticker) => {
    return apiClient(`/api/v1/predict/${ticker}`);
  },

  /**
   * Execute a trade
   * @param {Object} data
   */
  executeTrade: (data) => {
    return apiClient("/api/v1/trade", {
      body: data,
      method: "POST",
    });
  },
};

export default tradingApi;

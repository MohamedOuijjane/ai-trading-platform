import { apiClient } from "./client";

const tradingApi = {
  getPrediction: (ticker) => {
    return apiClient(`/api/v1/predict/${ticker.toUpperCase()}/`);
  },

  executeTrade: (data) => {
    return apiClient("/api/v1/trade/", {
      method: "POST",
      body: data,
    });
  },
};

export default tradingApi;
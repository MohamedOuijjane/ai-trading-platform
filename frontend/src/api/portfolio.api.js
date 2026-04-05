import apiClient from "./client";

/**
 * Portfolio API Service
 */
const portfolioApi = {
  /**
   * Get user portfolio data
   */
  getPortfolio: () => {
    return apiClient("/api/v1/portfolio");
  },
};

export default portfolioApi;

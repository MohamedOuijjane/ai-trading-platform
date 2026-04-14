import { apiClient } from "./client";

const portfolioApi = {
  getPortfolio: () => {
    return apiClient("/api/v1/portfolio/");
  },
};

export default portfolioApi;
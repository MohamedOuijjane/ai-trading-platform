import { apiClient } from "./client";

const authApi = {
  login: (username, password) => {
    return apiClient("/api/token/", {
      method: "POST",
      body: { username, password },
    });
  },

  register: (userData) => {
    return apiClient("/api/register/", {
      method: "POST",
      body: userData,
    });
  },
};

export default authApi;

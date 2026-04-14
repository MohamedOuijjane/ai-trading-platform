import apiClient from "./client";

/**
 * Authentication API Service
 */
const authApi = {
  /**
   * Login user and get tokens
   * @param {string} email
   * @param {string} password
   */
  login: (username, password) => {
    return apiClient("/api/token/", {
      body: { username, password },
      method: "POST",
    });
  },

  /**
   * Register a new user
   * @param {Object} userData
   */
  register: (userData) => {
    return apiClient("/api/register", {
      body: userData,
      method: "POST",
    });
  },
};

export default authApi;

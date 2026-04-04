/**
 * Production-grade API client using fetch.
 * Acts as the thin communication layer between React and the Django/FastAPI backend.
 */
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

async function apiClient(endpoint, { body, ...customConfig } = {}) {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // 401 Unauthorized: Auto-logout and redirect
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      // Use window.location for a hard redirect to clear all state
      window.location.assign("/login?error=session_expired");
      return Promise.reject({
        message: "Session expired. Please login again.",
      });
    }

    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (response.ok) {
      return data;
    }

    // Throw meaningful errors for non-2xx responses
    const error = new Error(
      data.message || data.detail || response.statusText || "API Error",
    );
    error.status = response.status;
    error.data = data;
    throw error;
  } catch (err) {
    // Catch network errors or JSON parsing errors
    if (!err.status) {
      console.error("[API Network Error]:", err);
      throw new Error(
        "Could not connect to the server. Please check your internet connection.",
      );
    }
    throw err;
  }
}

export default apiClient;

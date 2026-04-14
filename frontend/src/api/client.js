const BASE_URL = "http://127.0.0.1:8000";

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || data.error || "Request failed");
  return data;
};

const apiClient = async (endpoint, options = {}) => {
  const { method = "GET", body, ...rest } = options;

  const config = {
    method,
    headers: { ...getHeaders() },
    ...rest,
  };

  if (body) config.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  return handleResponse(res);
};

export { apiClient };

export const api = {
  login: (username, password) =>
    fetch(`${BASE_URL}/api/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then(handleResponse),

  getStats: () => fetch(`${BASE_URL}/api/stats/`, { headers: getHeaders() }).then(handleResponse),

  getPredictions: () =>
    fetch(`${BASE_URL}/api/v1/predictions/`, { headers: getHeaders() }).then(handleResponse),

  predictTicker: (ticker) =>
    fetch(`${BASE_URL}/api/v1/predict/${ticker.toUpperCase()}/`, { headers: getHeaders() }).then(handleResponse),

  getTrades: () => fetch(`${BASE_URL}/api/v1/trades/`, { headers: getHeaders() }).then(handleResponse),

  getMarketPrices: () =>
    fetch(`${BASE_URL}/api/v1/market/prices/`, { headers: getHeaders() }).then(handleResponse),

  getHealth: () =>
    fetch(`${BASE_URL}/api/v1/health/`, { headers: getHeaders() }).then(handleResponse),

  getUsers: () => fetch(`${BASE_URL}/api/users/`, { headers: getHeaders() }).then(handleResponse),

  createUser: (data) =>
    fetch(`${BASE_URL}/api/users/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  toggleUser: (id) =>
    fetch(`${BASE_URL}/api/users/${id}/toggle/`, {
      method: "POST",
      headers: getHeaders(),
    }).then(handleResponse),

  deleteUser: (id) =>
    fetch(`${BASE_URL}/api/users/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),
};
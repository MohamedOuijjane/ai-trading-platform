const BASE_URL = "http://127.0.0.1:8000";
const ML_URL = "http://127.0.0.1:8001";

const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
};

const handleResponse = async (response) => {
    if (response.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/"; // Force redirect to login
        throw new Error("Session expired");
    }
    const data = await response.json();
    console.log("API RESPONSE:", data);
    if (!response.ok) throw new Error(data.detail || data.error || "Request failed");
    return data;
};

export const api = {
    // Auth
    login: async (username, password) => {
        const res = await fetch(`${BASE_URL}/api/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return handleResponse(res);
    },

    // Dashboard
    getStats: () => fetch(`${BASE_URL}/api/stats/`, { headers: getHeaders() }).then(handleResponse),

    // Predictions
    getPredictions: () => fetch(`${BASE_URL}/api/v1/predictions/`, { headers: getHeaders() }).then(handleResponse),
    predictTicker: (ticker) => fetch(`${BASE_URL}/api/v1/predict/${ticker.toUpperCase()}/`, { headers: getHeaders() }).then(handleResponse),

    // Trades
    getTrades: () => fetch(`${BASE_URL}/api/v1/trades/`, { headers: getHeaders() }).then(handleResponse),

    // Market
    getMarketPrices: () => fetch(`${BASE_URL}/api/v1/market/prices/`, { headers: getHeaders() }).then(handleResponse),

    // Health
    getMLStatus: async () => {
        try {
            // Check through backend proxy or directly
            const res = await fetch(`${BASE_URL}/api/v1/health/`, { headers: getHeaders() });
            return await handleResponse(res);
        } catch (e) {
            return { status: "error" };
        }
    },

    // Users (Admin)
    getUsers: () => fetch(`${BASE_URL}/api/users/`, { headers: getHeaders() }).then(handleResponse),
    createUser: (data) => fetch(`${BASE_URL}/api/users/`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    toggleUser: (id) => fetch(`${BASE_URL}/api/users/${id}/toggle/`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
    deleteUser: (id) => fetch(`${BASE_URL}/api/users/${id}/`, { method: 'DELETE', headers: getHeaders() }),
};

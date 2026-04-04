const API_URL = "http://127.0.0.1:8000";

// Login
export const login = async (username, password) => {
    const res = await fetch(`${API_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('username', username);
    }
    return data;
};

// Helper pour les requêtes authentifiées
export const authFetch = (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    return fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        }
    });
};

// Stats
export const getStats = () => authFetch('/api/stats/').then(r => r.json());

// Utilisateurs
export const getUsers = () => authFetch('/api/users/').then(r => r.json());
export const createUser = (data) => authFetch('/api/users/', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json());
export const toggleUser = (id) => authFetch(`/api/users/${id}/toggle/`, { method: 'POST' }).then(r => r.json());
export const deleteUser = (id) => authFetch(`/api/users/${id}/`, { method: 'DELETE' });
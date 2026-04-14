import { useCallback } from "react";

const TOKEN_KEY = "access_token";
const ROLE_KEY = "role";
const USERNAME_KEY = "username";

const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return decoded;
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

const useAuth = () => {
  const login = useCallback((token, userData = {}) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(
      ROLE_KEY,
      userData.is_staff ? "admin" : "client",
    );
    localStorage.setItem(USERNAME_KEY, userData.username || "");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USERNAME_KEY);
    window.location.href = "/login";
  }, []);

  const getToken = useCallback(() => {
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    if (isTokenExpired(token)) {
      logout();
      return false;
    }
    return true;
  }, [logout]);

  const getUserRole = useCallback(() => {
    return localStorage.getItem(ROLE_KEY) || null;
  }, []);

  const isAdmin = useCallback(() => {
    return localStorage.getItem(ROLE_KEY) === "admin";
  }, []);

  return {
    login,
    logout,
    getToken,
    isAuthenticated,
    isAdmin,
    getUserRole,
  };
};

export default useAuth;

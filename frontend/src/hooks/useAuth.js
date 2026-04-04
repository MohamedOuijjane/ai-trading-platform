import { useCallback } from "react";

/**
 * Custom hook to manage JWT authentication and session
 */
const useAuth = () => {
  const login = useCallback((token) => {
    localStorage.setItem("access_token", token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    window.location.assign("/login");
  }, []);

  const getToken = useCallback(() => {
    return localStorage.getItem("access_token");
  }, []);

  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem("access_token");
    return !!token;
  }, []);

  return {
    login,
    logout,
    getToken,
    isAuthenticated,
  };
};

export default useAuth;

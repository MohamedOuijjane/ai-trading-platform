import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * Route protection component
 * Redirects to /login if user is not authenticated
 */
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    // If user is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, render the child routes (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;

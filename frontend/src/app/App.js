import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "./routes";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import MainLayout from "../components/layout/MainLayout";
import useAuth from "../hooks/useAuth";

const SessionGuard = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (!isAuthenticated()) return;

    if (path.startsWith("/app/") && isAdmin()) {
      window.location.href = "/admin/dashboard";
    } else if (path.startsWith("/admin/") && !isAdmin()) {
      window.location.href = "/app/dashboard";
    }
  }, [location.pathname, isAuthenticated, isAdmin]);

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <SessionGuard>
        <Routes>
          {ROUTES.PUBLIC.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}

          <Route element={<AdminRoute />}>
            {ROUTES.ADMIN.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {ROUTES.APP.map(({ path, component: Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </SessionGuard>
    </BrowserRouter>
  );
};

export default App;

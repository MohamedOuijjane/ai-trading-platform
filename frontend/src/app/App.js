import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routes";
import ProtectedRoute from "../components/ProtectedRoute";

/**
 * Main Application Routing Component
 */
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {ROUTES.PUBLIC.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}

        {/* Private Routes (Wrapped in ProtectedRoute) */}
        <Route element={<ProtectedRoute />}>
          {ROUTES.PRIVATE.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Route>

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

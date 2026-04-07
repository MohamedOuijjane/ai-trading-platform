import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routes";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import "../styles/global.css";

/**
 * Main Application Routing Component
 */
const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar />}
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
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
      </div>
    </BrowserRouter>
  );
};

export default App;

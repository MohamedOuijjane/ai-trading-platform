import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Trades from "./pages/Trades";
import Predictions from "./pages/Predictions";
import MarketPrices from "./pages/MarketPrices";
import Portfolios from "./pages/Portfolios";
import MLModels from "./pages/MLModels";
import CeleryLogs from "./pages/CeleryLogs";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/trades" element={<Trades />} />
        <Route path="/admin/predictions" element={<Predictions />} />
        <Route path="/admin/prices" element={<MarketPrices />} />
        <Route path="/admin/portfolios" element={<Portfolios />} />
        <Route path="/admin/charts" element={<Dashboard />} />
        <Route path="/admin/ml-models" element={<MLModels />} />
        <Route path="/admin/celery-logs" element={<CeleryLogs />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />
        <Route path="/admin/settings" element={<Settings />} />

        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import { useState, useEffect } from "react";
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  const renderPage = () => {
    switch (currentPage) {
      case "users":
        return <Users />;
      case "trades":
        return <Trades onExpired={handleLogout} />;
      case "predictions":
        return <Predictions onExpired={handleLogout} />;
      case "prices":
        return <MarketPrices onExpired={handleLogout} />;
      case "portfolios":
        return <Portfolios onExpired={handleLogout} />;
      case "ml-models":
        return <MLModels onExpired={handleLogout} />;
      case "celery-logs":
        return <CeleryLogs onExpired={handleLogout} />;
      case "audit-logs":
        return <AuditLogs onExpired={handleLogout} />;
      case "settings":
        return <Settings />;
      default:
        return null; // Dashboard handles its own default content
    }
  };

  return (
    <Dashboard
      onLogout={handleLogout}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {renderPage()}
    </Dashboard>
  );
}

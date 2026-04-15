import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_MAP = {
  dashboard: "/admin/dashboard",
  users: "/admin/users",
  trades: "/admin/trades",
  prices: "/admin/prices",
  portfolios: "/admin/portfolios",
  predictions: "/admin/predictions",
  "ml-models": "/admin/ml-models",
  "celery-logs": "/admin/celery-logs",
  "audit-logs": "/admin/audit-logs",
  settings: "/admin/settings",
};

const Sidebar = ({ currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (page) => {
    if (page && NAV_MAP[page]) {
      navigate(NAV_MAP[page]);
    }
  };

  const isActive = (page) => location.pathname === NAV_MAP[page];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>TradingBot Admin</h2>
        <span>Django Administration</span>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">TABLEAU DE BORD</div>
        <div
          className={`sidebar-item ${isActive("dashboard") ? "active" : ""}`}
          onClick={() => handleNav("dashboard")}
        >
          <span className="dot dot-green" />
          Vue d&apos;ensemble
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">UTILISATEURS</div>
        <div
          className={`sidebar-item ${isActive("users") ? "active" : ""}`}
          onClick={() => handleNav("users")}
        >
          <span className="dot dot-blue" />
          Utilisateurs
        </div>
        <div
          className="sidebar-item"
          style={{ opacity: 0.45, cursor: "default" }}
        >
          <span className="dot dot-blue" />
          Groupes
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">TRADING</div>
        <div
          className={`sidebar-item ${isActive("trades") ? "active" : ""}`}
          onClick={() => handleNav("trades")}
        >
          <span className="dot dot-orange" />
          Trades
        </div>
        <div
          className={`sidebar-item ${isActive("prices") ? "active" : ""}`}
          onClick={() => handleNav("prices")}
        >
          <span className="dot dot-orange" />
          Prix marché
        </div>
        <div
          className={`sidebar-item ${isActive("portfolios") ? "active" : ""}`}
          onClick={() => handleNav("portfolios")}
        >
          <span className="dot dot-orange" />
          Portfolios
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">IA / ML</div>
        <div
          className={`sidebar-item ${isActive("predictions") ? "active" : ""}`}
          onClick={() => handleNav("predictions")}
        >
          <span className="dot dot-purple" />
          Prédictions
        </div>
        <div
          className={`sidebar-item ${isActive("ml-models") ? "active" : ""}`}
          onClick={() => handleNav("ml-models")}
        >
          <span className="dot dot-purple" />
          Modèles ML
        </div>
        <div
          className={`sidebar-item ${isActive("celery-logs") ? "active" : ""}`}
          onClick={() => handleNav("celery-logs")}
        >
          <span className="dot dot-purple" />
          Logs Celery
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">SYSTÈME</div>
        <div
          className={`sidebar-item ${isActive("audit-logs") ? "active" : ""}`}
          onClick={() => handleNav("audit-logs")}
        >
          <span className="dot dot-gray" />
          Logs d&apos;audit
        </div>
        <div
          className={`sidebar-item ${isActive("settings") ? "active" : ""}`}
          onClick={() => handleNav("settings")}
        >
          <span className="dot dot-gray" />
          Paramètres
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

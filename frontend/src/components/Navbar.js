import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import {
  LayoutDashboard,
  Briefcase,
  RefreshCw,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav
      style={{
        backgroundColor: "#1a1a1a",
        color: "white",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <h2 style={{ margin: 0, color: "#09f" }}>AI Trading</h2>
        <Link
          to="/dashboard"
          style={{
            color: "white",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link
          to="/portfolio"
          style={{
            color: "white",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Briefcase size={18} /> Portfolio
        </Link>
        <Link
          to="/trade"
          style={{
            color: "white",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <RefreshCw size={18} /> Trade
        </Link>
        <Link
          to="/metrics"
          style={{
            color: "white",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <BarChart2 size={18} /> Metrics
        </Link>
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <span style={{ fontSize: "0.9rem", color: "#aaa" }}>
          {user?.username}
        </span>
        <Link to="/settings" style={{ color: "white" }}>
          <Settings size={18} />
        </Link>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            color: "#ff4d4d",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

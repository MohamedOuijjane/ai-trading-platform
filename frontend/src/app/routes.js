import DashboardPage from "../features/dashboard/DashboardPage";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import PortfolioPage from "../features/portfolio/PortfolioPage";
import TradePage from "../features/trading/TradePage";
import MetricsPage from "../features/metrics/MetricsPage";
import SettingsPage from "../features/settings/SettingsPage";

import Users from "../pages/Users";
import Trades from "../pages/Trades";
import Predictions from "../pages/Predictions";
import MarketPrices from "../pages/MarketPrices";
import Portfolios from "../pages/Portfolios";
import Dashboard from "../pages/Dashboard";
import Charts from "../pages/Charts";
import MLModels from "../pages/MLModels";
import CeleryLogs from "../pages/CeleryLogs";
import AuditLogs from "../pages/AuditLogs";
import SettingsAdmin from "../pages/Settings";
import AdminLayout from "../components/admin/AdminLayout";

export const ROUTES = {
  PUBLIC: [
    { path: "/login", component: LoginPage },
    { path: "/register", component: RegisterPage },
  ],

  ADMIN: [
    { path: "dashboard", component: Dashboard },
    { path: "users", component: Users },
    { path: "trades", component: Trades },
    { path: "predictions", component: Predictions },
    { path: "prices", component: MarketPrices },
    { path: "portfolios", component: Portfolios },
    { path: "charts", component: Charts },
    { path: "ml-models", component: MLModels },
    { path: "celery-logs", component: CeleryLogs },
    { path: "audit-logs", component: AuditLogs },
    { path: "settings", component: SettingsAdmin },
  ],

  APP: [
    { path: "/app/dashboard", component: DashboardPage },
    { path: "/app/portfolio", component: PortfolioPage },
    { path: "/app/trade", component: TradePage },
    { path: "/app/metrics", component: MetricsPage },
    { path: "/app/settings", component: SettingsPage },
  ],
};

export { AdminLayout };
export default ROUTES;

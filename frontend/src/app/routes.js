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

export const ROUTES = {
  PUBLIC: [
    { path: "/login", component: LoginPage },
    { path: "/register", component: RegisterPage },
  ],

  ADMIN: [
    { path: "/admin/dashboard", component: Dashboard },
    { path: "/admin/users", component: Users },
    { path: "/admin/trades", component: Trades },
    { path: "/admin/predictions", component: Predictions },
    { path: "/admin/prices", component: MarketPrices },
    { path: "/admin/portfolios", component: Portfolios },
    { path: "/admin/charts", component: Charts },
    { path: "/admin/ml-models", component: MLModels },
    { path: "/admin/celery-logs", component: CeleryLogs },
    { path: "/admin/audit-logs", component: AuditLogs },
    { path: "/admin/settings", component: SettingsAdmin },
  ],

  APP: [
    { path: "/app/dashboard", component: DashboardPage },
    { path: "/app/portfolio", component: PortfolioPage },
    { path: "/app/trade", component: TradePage },
    { path: "/app/metrics", component: MetricsPage },
    { path: "/app/settings", component: SettingsPage },
  ],
};

export default ROUTES;

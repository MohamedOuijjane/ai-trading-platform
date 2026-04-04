import DashboardPage from "../features/dashboard/DashboardPage";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import PortfolioPage from "../features/portfolio/PortfolioPage";
import TradePage from "../features/trading/TradePage";
import MetricsPage from "../features/metrics/MetricsPage";
import SettingsPage from "../features/settings/SettingsPage";

/**
 * Route Configuration Object
 * Separates public and private routes for scalability
 */
export const ROUTES = {
  PUBLIC: [
    { path: "/login", component: LoginPage },
    { path: "/register", component: RegisterPage },
  ],
  PRIVATE: [
    { path: "/dashboard", component: DashboardPage },
    { path: "/portfolio", component: PortfolioPage },
    { path: "/trade", component: TradePage },
    { path: "/metrics", component: MetricsPage },
    { path: "/settings", component: SettingsPage },
  ],
};

const routesConfig = {
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  portfolio: "/portfolio",
  trade: "/trade",
  metrics: "/metrics",
  settings: "/settings",
};

export default routesConfig;

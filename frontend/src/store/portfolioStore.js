import { apiClient } from "../api/client";

let portfolioCache = null;
let portfolioTimestamp = null;
const CACHE_TTL_MS = 30_000;

export async function getPortfolio(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && portfolioCache && portfolioTimestamp && (now - portfolioTimestamp) < CACHE_TTL_MS) {
    console.log("[portfolioStore] Portfolio cache hit — returning cached data");
    return portfolioCache;
  }

  console.log("[portfolioStore] Fetching portfolio from API...");
  try {
    const raw = await apiClient("/api/v1/portfolio/");
    const data = raw || { balance: 0, positions: [], pnl: 0 };
    portfolioCache = data;
    portfolioTimestamp = now;
    console.log("[portfolioStore] Portfolio cached");
    return data;
  } catch (err) {
    console.warn("[portfolioStore] Portfolio fetch failed:", err.message);
    return portfolioCache || { balance: 0, positions: [], pnl: 0 };
  }
}

export function clearPortfolioCache() {
  portfolioCache = null;
  portfolioTimestamp = null;
}

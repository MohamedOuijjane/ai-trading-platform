import { apiClient } from "../api/client";

let pricesCache = null;
let pricesTimestamp = null;
const CACHE_TTL_MS = 30_000;

export async function getMarketPrices(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && pricesCache && pricesTimestamp && (now - pricesTimestamp) < CACHE_TTL_MS) {
    console.log("[marketStore] Prices cache hit — returning cached data");
    return pricesCache;
  }

  console.log("[marketStore] Fetching prices from API...");
  try {
    const raw = await apiClient("/api/v1/market/prices/");
    const priceMap = {};

    if (Array.isArray(raw)) {
      raw.forEach((item) => {
        const key = item.symbol || item.ticker;
        if (key) priceMap[key] = parseFloat(item.price || 0);
      });
    } else if (typeof raw === "object" && raw !== null) {
      Object.entries(raw).forEach(([key, val]) => {
        if (typeof val === "object" && val !== null) {
          priceMap[key] = parseFloat(val.price || 0);
        } else {
          priceMap[key] = parseFloat(val || 0);
        }
      });
    }

    pricesCache = priceMap;
    pricesTimestamp = now;
    console.log(`[marketStore] Prices cached (${Object.keys(priceMap).length} symbols)`);
    return priceMap;
  } catch (err) {
    console.warn("[marketStore] Prices fetch failed:", err.message);
    return pricesCache || {};
  }
}

export function clearPricesCache() {
  pricesCache = null;
  pricesTimestamp = null;
}

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import tradingApi from "../../api/trading.api";
import portfolioApi from "../../api/portfolio.api";
import { apiClient } from "../../api/client";

const TICKERS = ["BTC-USD", "ETH-USD", "TSLA", "AAPL", "GOOGL", "NVDA"];

const TradePage = () => {
  const [ticker, setTicker] = useState("BTC-USD");
  const [action, setAction] = useState("BUY");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [balance, setBalance] = useState(0);
  const [positions, setPositions] = useState([]);
  const [prices, setPrices] = useState({});
  const [maxTradeAmount, setMaxTradeAmount] = useState(Infinity);
  const [dataLoading, setDataLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [portfolioRes, pricesRes, settingsRes] = await Promise.allSettled([
          portfolioApi.getPortfolio(),
          apiClient("/api/v1/market/prices/"),
          apiClient("/api/v1/settings/"),
        ]);

        if (!mounted) return;

        console.log("Portfolio:", portfolioRes);
        console.log("Prices:", pricesRes);
        console.log("Settings:", settingsRes);

        if (portfolioRes.status === "fulfilled" && portfolioRes.value) {
          const p = portfolioRes.value;
          setBalance(p.balance || 0);
          setPositions(p.positions || []);
        } else {
          console.warn("Portfolio fetch failed:", portfolioRes.reason);
          setBalance(0);
          setPositions([]);
        }

        if (pricesRes.status === "fulfilled" && pricesRes.value) {
          const raw = pricesRes.value;
          const priceMap = {};
          if (Array.isArray(raw)) {
            raw.forEach((item) => {
              if (item.symbol || item.ticker) {
                priceMap[item.symbol || item.ticker] = parseFloat(
                  item.price || 0,
                );
              }
            });
          } else if (typeof raw === "object") {
            Object.entries(raw).forEach(([key, val]) => {
              if (typeof val === "object" && val !== null) {
                priceMap[key] = parseFloat(val.price || 0);
              } else {
                priceMap[key] = parseFloat(val || 0);
              }
            });
          }
          if (mounted) setPrices(priceMap);
        } else {
          console.warn("Prices fetch failed:", pricesRes.reason);
          if (mounted) setPrices({});
        }

        if (settingsRes.status === "fulfilled" && settingsRes.value) {
          const max =
            settingsRes.value?.max_trade_amount ??
            settingsRes.value?.maxTradeAmount ??
            Infinity;
          if (mounted) setMaxTradeAmount(parseFloat(max) || Infinity);
        } else {
          console.warn("Settings fetch failed (optional):", settingsRes.reason);
          if (mounted) setMaxTradeAmount(Infinity);
        }
      } catch (err) {
        console.error("TradePage load error:", err);
      } finally {
        if (mounted) setDataLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const price = prices[ticker] || 0;
  const qty = parseFloat(quantity) || 0;
  const tradeValue = qty * price;

  const position = positions.find(
    (p) => (p.symbol || p.asset || "").toUpperCase() === ticker.toUpperCase(),
  );
  const positionQty = parseFloat(position?.quantity || position?.shares || 0);
  const maxBuyQty = price > 0 ? balance / price : 0;
  const maxSellQty = positionQty;

  const validation = computeValidation(
    action,
    qty,
    tradeValue,
    balance,
    maxTradeAmount,
    maxSellQty,
  );

  function computeValidation(act, q, val, bal, maxTrade, maxSell) {
    if (!ticker.trim()) return { valid: false, message: null };
    if (q <= 0 || !quantity.trim()) return { valid: false, message: null };

    if (act === "BUY") {
      if (val > bal)
        return {
          valid: false,
          message: "Insufficient balance for this purchase.",
        };
      if (val > maxTrade)
        return {
          valid: false,
          message: `Trade exceeds system limit of $${Number(maxTrade).toLocaleString()}.`,
        };
    }

    if (act === "SELL") {
      if (q > maxSell)
        return {
          valid: false,
          message: `Insufficient ${ticker} to sell. Max: ${maxSell.toFixed(6)}.`,
        };
    }

    return { valid: true, message: null };
  }

  const handleMax = useCallback(() => {
    if (action === "BUY") {
      const maxQty = maxBuyQty;
      setQuantity(maxQty > 0 ? formatQty(maxQty) : "0");
    } else {
      setQuantity(formatQty(maxSellQty));
    }
  }, [action, maxBuyQty, maxSellQty]);

  function formatQty(val) {
    if (val >= 1) return val.toFixed(4);
    return val.toFixed(6);
  }

  const handleTickerChange = (t) => {
    setTicker(t);
    setError(null);
  };

  const handleActionChange = (a) => {
    setAction(a);
    setError(null);
  };

  const handleQuantityChange = (v) => {
    setQuantity(v);
    setError(null);
  };

  const handleTrade = async (e) => {
    e.preventDefault();
    setError(null);

    if (!ticker.trim()) {
      setError("Please select a ticker symbol.");
      return;
    }
    if (!quantity.trim() || parseFloat(quantity) <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    const { valid, message } = computeValidation(
      action,
      qty,
      tradeValue,
      balance,
      maxTradeAmount,
      maxSellQty,
    );
    if (!valid) {
      setError(message);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ticker: ticker.toUpperCase().trim(),
        action: action.toUpperCase(),
        quantity: parseFloat(quantity),
      };
      await tradingApi.executeTrade(payload);
      setSuccess(true);
      setQuantity("");
      setTimeout(() => navigate("/app/portfolio"), 2000);
    } catch (err) {
      setError(err.message || "Trade failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-trading-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-trading-muted">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Execute Trade</h1>
        <p className="text-sm text-trading-muted mt-1">
          Place a market order for any asset
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="stat-label">Balance</p>
          <p className="text-lg font-bold text-white mt-1">
            $
            {Number(balance || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="card text-center">
          <p className="stat-label">{ticker} Price</p>
          <p className="text-lg font-bold text-white mt-1">
            {price > 0
              ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "—"}
          </p>
        </div>
        <div className="card text-center">
          <p className="stat-label">Holdings</p>
          <p className="text-lg font-bold text-white mt-1">
            {positionQty > 0 ? formatQty(positionQty) : "0"}
          </p>
        </div>
      </div>

      <form onSubmit={handleTrade} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium text-trading-muted mb-2">
            Ticker
          </label>
          <div className="flex flex-wrap gap-2">
            {TICKERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTickerChange(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  ticker === t
                    ? "bg-trading-accent text-white"
                    : "bg-trading-card border border-trading-border text-trading-muted hover:border-trading-accent/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-trading-muted mb-2">
            Action
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleActionChange("BUY")}
              className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                action === "BUY"
                  ? "btn-buy shadow-lg shadow-emerald-500/20"
                  : "bg-trading-card border border-trading-border text-trading-muted hover:border-emerald-500/40"
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => handleActionChange("SELL")}
              className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                action === "SELL"
                  ? "btn-sell shadow-lg shadow-red-500/20"
                  : "bg-trading-card border border-trading-border text-trading-muted hover:border-red-500/40"
              }`}
            >
              SELL
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-trading-muted">
              Quantity
            </label>
            <button
              type="button"
              onClick={handleMax}
              className="text-xs text-trading-accent hover:text-trading-accent/80 font-semibold transition-colors"
            >
              MAX
            </button>
          </div>
          <input
            type="number"
            step={price > 1 ? "0.01" : "0.0001"}
            min="0"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            placeholder="0.00"
            className="input-field"
            disabled={loading}
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-trading-muted">
              Max buy: {formatQty(maxBuyQty)} {ticker}
            </span>
            <span className="text-xs text-trading-muted">
              Max sell: {formatQty(maxSellQty)} {ticker}
            </span>
          </div>
        </div>

        {qty > 0 && price > 0 && (
          <div className="bg-trading-card rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-trading-muted">Quantity</span>
              <span className="text-white font-medium">
                {formatQty(qty)} {ticker}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-trading-muted">Price</span>
              <span className="text-white font-medium">
                ${price.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-trading-border pt-2 flex justify-between">
              <span className="text-sm font-semibold text-white">Total</span>
              <span className="text-sm font-bold text-trading-accent">
                $
                {tradeValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-3 h-3 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-trading-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-trading-green">
                Trade Executed Successfully
              </p>
              <p className="text-xs text-trading-muted mt-0.5">
                Redirecting to portfolio...
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success || !validation.valid}
          className={`w-full py-3 text-base font-semibold rounded-xl transition-all ${
            !validation.valid
              ? "bg-trading-card border border-trading-border text-trading-muted cursor-not-allowed"
              : "btn-primary"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `Confirm ${action}`
          )}
        </button>

        {!validation.valid && validation.message && (
          <p className="text-center text-xs text-trading-muted">
            {validation.message}
          </p>
        )}
      </form>
    </div>
  );
};

export default TradePage;

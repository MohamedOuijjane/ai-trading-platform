import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import tradingApi from "../../api/trading.api";
import { getMarketPrices } from "../../store/marketStore";

const POPULAR_TICKERS = [
  "BTC-USD",
  "ETH-USD",
  "TSLA",
  "AAPL",
  "NVDA",
  "MSFT",
  "GOOGL",
  "AMZN",
];

const MarketCard = ({
  symbol,
  price,
  change,
  changePct,
  onSelect,
  isSelected,
}) => {
  const isPositive = change >= 0;
  return (
    <button
      onClick={() => onSelect(symbol)}
      className={`flex-shrink-0 w-36 p-4 rounded-xl border transition-all duration-200 text-left ${
        isSelected
          ? "bg-trading-accent/15 border-trading-accent/40"
          : "bg-trading-card border-trading-border hover:border-trading-accent/40 hover:bg-trading-card/80"
      }`}
    >
      <p className="text-xs font-medium text-trading-muted mb-1">{symbol}</p>
      <p className="text-sm font-bold text-white mb-1">
        ${price?.toLocaleString() ?? "—"}
      </p>
      <p
        className={`text-xs font-semibold ${
          isPositive ? "text-trading-green" : "text-trading-red"
        }`}
      >
        {isPositive ? "+" : ""}
        {changePct?.toFixed(2) ?? "0.00"}%
      </p>
    </button>
  );
};

const SignalBadge = ({ signal }) => {
  const styles = {
    BUY: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    SELL: "bg-red-500/20 text-red-400 border border-red-500/30",
    HOLD: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
        styles[signal] || styles.HOLD
      }`}
    >
      {signal === "BUY" && (
        <svg
          className="w-4 h-4 mr-1.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      )}
      {signal === "SELL" && (
        <svg
          className="w-4 h-4 mr-1.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      )}
      {signal === "HOLD" && (
        <svg
          className="w-4 h-4 mr-1.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4"
          />
        </svg>
      )}
      {signal}
    </span>
  );
};

const DashboardPage = () => {
  const [selectedTicker, setSelectedTicker] = useState("BTC-USD");
  const [inputTicker, setInputTicker] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [predLoading, setPredLoading] = useState(false);
  const [predError, setPredError] = useState(null);
  const [marketPrices, setMarketPrices] = useState([]);
  const [pricesLoading, setPricesLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch market prices ONCE on mount — cached for 30s via marketStore
  useEffect(() => {
    let cancelled = false;
    setPricesLoading(true);

    getMarketPrices()
      .then((prices) => {
        if (!cancelled) {
          const arr = Object.entries(prices).map(([symbol, price]) => ({
            symbol,
            price,
            change: 0,
            changePct: 0,
          }));
          setMarketPrices(arr.slice(0, 8));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMarketPrices(
            POPULAR_TICKERS.map((t) => ({
              symbol: t,
              price: 0,
              change: 0,
              changePct: 0,
            })),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setPricesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch prediction ONLY when user clicks Analyze or selects a different ticker
  const getTickerPrediction = useCallback(async (ticker) => {
    const symbol = ticker.toUpperCase().trim();
    if (!symbol) return;
    setPredLoading(true);
    setPredError(null);
    setPrediction(null);
    try {
      const data = await tradingApi.getPrediction(symbol);
      setPrediction(data);
    } catch (err) {
      setPredError(err.message);
    } finally {
      setPredLoading(false);
    }
  }, []);

  // Fetch prediction on initial mount for the default selected ticker
  useEffect(() => {
    getTickerPrediction(selectedTicker);
  }, [selectedTicker, getTickerPrediction]);

  const handleTickerSearch = (e) => {
    e.preventDefault();
    if (inputTicker.trim()) {
      setSelectedTicker(inputTicker.toUpperCase().trim());
      setInputTicker("");
    }
  };

  const handleManualTrade = async () => {
    if (!prediction) return;
    try {
      await tradingApi.executeTrade({
        ticker: prediction.ticker,
        action: prediction.signal,
        quantity: 1.0,
      });
      navigate("/app/portfolio");
    } catch (err) {
      setPredError(`Trade failed: ${err.message}`);
    }
  };

  const confidencePct = prediction
    ? (prediction.confidence * 100).toFixed(1)
    : "0";
  const isAutoExecuted = prediction?.auto_executed;
  const isSkipped = !!prediction?.auto_trade_skipped;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            AI Trading Dashboard
          </h1>
          <p className="text-sm text-trading-muted mt-0.5">
            Real-time market analysis and signal generation
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-trading-muted uppercase tracking-wider mb-3">
          Market Overview
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {pricesLoading
            ? POPULAR_TICKERS.slice(0, 6).map((t) => (
                <div
                  key={t}
                  className="flex-shrink-0 w-36 p-4 rounded-xl border border-trading-border bg-trading-card animate-pulse"
                >
                  <div className="h-3 bg-trading-border rounded mb-2 w-12" />
                  <div className="h-4 bg-trading-border rounded w-20" />
                </div>
              ))
            : marketPrices.length > 0
              ? marketPrices.map((m) => (
                  <MarketCard
                    key={m.symbol}
                    symbol={m.symbol}
                    price={m.price}
                    change={m.change}
                    changePct={m.changePct}
                    onSelect={setSelectedTicker}
                    isSelected={selectedTicker === m.symbol}
                  />
                ))
              : POPULAR_TICKERS.map((t) => (
                  <MarketCard
                    key={t}
                    symbol={t}
                    price={0}
                    change={0}
                    changePct={0}
                    onSelect={setSelectedTicker}
                    isSelected={selectedTicker === t}
                  />
                ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="section-title mb-0">AI Signal Analysis</h3>
            {prediction && !predLoading && (
              <SignalBadge signal={prediction.signal} />
            )}
          </div>

          <form onSubmit={handleTickerSearch} className="flex gap-3">
            <input
              type="text"
              value={inputTicker}
              onChange={(e) => setInputTicker(e.target.value)}
              placeholder="Enter ticker (e.g. BTC-USD, TSLA)"
              className="input-field flex-1"
            />
            <button
              type="submit"
              className="btn-primary px-6"
              disabled={predLoading}
            >
              {predLoading ? "Analyzing..." : "Analyze"}
            </button>
            <button
              type="button"
              onClick={() => getTickerPrediction(selectedTicker)}
              className="btn-primary px-4"
              disabled={predLoading}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </form>

          {predLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-trading-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-trading-muted">
                AI analyzing {selectedTicker}...
              </p>
            </div>
          )}

          {!predLoading && predError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-sm text-red-400">{predError}</p>
            </div>
          )}

          {!predLoading && prediction && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="stat-label mb-1">Asset</p>
                  <p className="text-xl font-bold text-white">
                    {prediction.ticker}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="stat-label mb-1">Current Price</p>
                  <p className="text-xl font-bold text-white">
                    ${prediction.price?.toLocaleString() ?? "—"}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="stat-label mb-1">AI Signal</p>
                  <p
                    className={`text-xl font-bold ${
                      prediction.signal === "BUY"
                        ? "text-trading-green"
                        : prediction.signal === "SELL"
                          ? "text-trading-red"
                          : "text-trading-yellow"
                    }`}
                  >
                    {prediction.signal}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-trading-muted">
                    AI Confidence
                  </p>
                  <p className="text-sm font-bold text-trading-accent">
                    {confidencePct}%
                  </p>
                </div>
                <div className="w-full bg-trading-bg rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-700"
                    style={{
                      width: `${confidencePct}%`,
                      background: `linear-gradient(90deg, #3B82F6, ${
                        parseFloat(confidencePct) > 75
                          ? "#10B981"
                          : parseFloat(confidencePct) > 50
                            ? "#F59E0B"
                            : "#EF4444"
                      })`,
                    }}
                  />
                </div>
              </div>

              {isAutoExecuted && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
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
                      Trade Executed Automatically
                    </p>
                    <p className="text-xs text-trading-muted mt-0.5">
                      A {prediction.signal} trade for {prediction.ticker} was
                      automatically executed. View your updated portfolio.
                    </p>
                  </div>
                </div>
              )}

              {isSkipped && !isAutoExecuted && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-trading-yellow">
                      Auto-Trade Skipped
                    </p>
                    <button
                      onClick={handleManualTrade}
                      className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-all ${
                        prediction.signal === "BUY"
                          ? "btn-buy"
                          : prediction.signal === "SELL"
                            ? "btn-sell"
                            : "btn-primary"
                      }`}
                    >
                      Execute {prediction.signal}
                    </button>
                  </div>
                  <p className="text-xs text-trading-muted mt-1">
                    {prediction.auto_trade_skipped}
                  </p>
                </div>
              )}

              {prediction.auto_trade_error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-400">
                    Auto-Trade Error
                  </p>
                  <p className="text-xs text-trading-muted mt-1">
                    {prediction.auto_trade_error}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleManualTrade}
                  disabled={!prediction || prediction.signal === "HOLD"}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                    prediction?.signal === "BUY"
                      ? "btn-buy"
                      : prediction?.signal === "SELL"
                        ? "btn-sell"
                        : "bg-trading-bg text-trading-muted cursor-not-allowed"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Execute {prediction?.signal || "Trade"}
                </button>
                <button
                  onClick={() => navigate("/app/trade")}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Advanced Trade
                </button>
              </div>
            </div>
          )}

          {!predLoading && !prediction && !predError && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 rounded-full bg-trading-accent/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-trading-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-trading-muted">
                Enter a ticker above to get AI-powered analysis
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card">
            <h3 className="section-title">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/app/trade")}
                className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Execute Trade
              </button>
              <button
                onClick={() => navigate("/app/portfolio")}
                className="w-full bg-trading-card border border-trading-border text-trading-text hover:border-trading-accent/40 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                View Portfolio
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">Signal Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
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
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-trading-green">
                    BUY Signal
                  </p>
                  <p className="text-xs text-trading-muted">
                    AI recommends purchasing
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-trading-red"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-trading-red">
                    SELL Signal
                  </p>
                  <p className="text-xs text-trading-muted">
                    AI recommends selling
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-trading-yellow"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-trading-yellow">
                    HOLD Signal
                  </p>
                  <p className="text-xs text-trading-muted">
                    No action recommended
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

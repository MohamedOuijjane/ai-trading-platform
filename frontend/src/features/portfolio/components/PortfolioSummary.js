import React from "react";

/**
 * Summary of total assets, ROI, and P&L
 */
const PortfolioSummary = ({ balance, history }) => {
  const totalPnL = history.reduce(
    (acc, trade) => acc + parseFloat(trade.profit_loss || 0),
    0,
  );
  const winRate =
    history.length > 0
      ? (
          (history.filter((t) => parseFloat(t.profit_loss) > 0).length /
            history.length) *
          100
        ).toFixed(1)
      : 0;

  return (
    <section
      className="summary-card"
      style={{
        display: "flex",
        gap: "30px",
        padding: "20px",
        backgroundColor: "#f4f4f4",
        borderRadius: "10px",
      }}
    >
      <div>
        <label>Available Balance</label>
        <div style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
          $
          {parseFloat(balance).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </div>
      </div>
      <div>
        <label>Total Realized P&L</label>
        <div
          style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            color: totalPnL >= 0 ? "green" : "red",
          }}
        >
          {totalPnL >= 0 ? "+" : ""}$
          {totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>
      <div>
        <label>AI Win Rate</label>
        <div style={{ fontSize: "1.8rem", fontWeight: "bold" }}>{winRate}%</div>
      </div>
    </section>
  );
};

export default PortfolioSummary;

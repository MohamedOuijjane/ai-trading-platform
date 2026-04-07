import React from "react";

/**
 * Table showing all active asset positions
 */
const PositionsTable = ({ positions }) => {
  if (!positions || positions.length === 0) {
    return (
      <p>
        No active positions. Use the Trade page to open your first position.
      </p>
    );
  }

  return (
    <table
      style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}
    >
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
          <th>Ticker</th>
          <th>Quantity</th>
          <th>Avg. Entry</th>
          <th>Total Value</th>
        </tr>
      </thead>
      <tbody>
        {positions.map((pos, idx) => (
          <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: "12px 0", fontWeight: "bold" }}>
              {pos.symbol}
            </td>
            <td>{parseFloat(pos.quantity).toFixed(4)}</td>
            <td>${parseFloat(pos.avg_price).toFixed(2)}</td>
            <td>
              $
              {(parseFloat(pos.quantity) * parseFloat(pos.avg_price)).toFixed(
                2,
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PositionsTable;

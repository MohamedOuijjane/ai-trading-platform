import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Chart visualizing portfolio value (cumulative PnL) over time
 */
const PerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No trade history available for charts.</p>;
  }

  // Calculate cumulative PnL for chart
  let cumulative = 0;
  const chartData = data
    .slice()
    .reverse()
    .map((trade) => {
      cumulative += parseFloat(trade.profit_loss || 0);
      return {
        date: new Date(trade.executed_at).toLocaleDateString(),
        pnl: cumulative,
      };
    });

  return (
    <div
      style={{
        width: "100%",
        height: 300,
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="pnl"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;

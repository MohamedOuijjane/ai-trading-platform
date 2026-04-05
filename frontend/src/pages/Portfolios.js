import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const API_URL = "http://127.0.0.1:8000";

const styles = `
  body { background:#0e0f13; color:#e8e9f0; font-family:DM Sans; }

  .header {
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:20px;
  }

  .cards {
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:16px;
    margin-bottom:20px;
  }

  .card {
    background:#1a1b23;
    border:1px solid #2a2b35;
    padding:20px;
    border-radius:12px;
  }

  .title {
    font-size:12px;
    color:#9a9bb0;
    margin-bottom:6px;
  }

  .value {
    font-size:20px;
    font-weight:bold;
  }

  .profit {
    color:#00d48a;
  }

  .loss {
    color:#f87171;
  }

  table {
    width:100%;
    border-collapse:collapse;
    background:#1a1b23;
    border-radius:12px;
    overflow:hidden;
  }

  th, td {
    padding:12px;
    border-bottom:1px solid #2a2b35;
    font-size:13px;
  }

  th {
    text-align:left;
    color:#6b6d80;
    font-size:11px;
  }

  .up { color:#00d48a; }
  .down { color:#f87171; }
`;

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

export default function Portfolios() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/portfolio/`, { headers: getHeaders() })
      .then(res => res.json())
      .then(res => {
        setData(res);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{padding:40}}>Chargement...</div>;
const chartData = data.portfolio.map(p => ({
  name: p.symbol,
  value: p.invested,
}));
  return (
    <>
      <style>{styles}</style>

      <div className="header">
        <h2>Portfolio</h2>
      </div>

      {/* CARDS */}
      <div className="cards">
        <div className="card">
          <div className="title">Investi total</div>
          <div className="value">${data.total_invested}</div>
        </div>

        <div className="card">
          <div className="title">Profit / Loss</div>
          <div className={`value ${data.total_profit_loss >= 0 ? "profit" : "loss"}`}>
            {data.total_profit_loss >= 0 ? "+" : ""}
            ${data.total_profit_loss}
          </div>
        </div>
      </div>
{/* GRAPHIQUE PORTFOLIO */}
<div className="card" style={{ marginBottom: "20px", height: "320px" }}>
  <div className="title">Répartition du portfolio</div>

  <ResponsiveContainer width="100%" height="90%">
    <PieChart>
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="name"
        outerRadius={110}
        label
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} />
        ))}
      </Pie>

      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
</div>
      {/* TABLE */}
      <table>
        <thead>
          <tr>
            <th>Symbole</th>
            <th>Quantité</th>
            <th>Investi</th>
            <th>Profit / Loss</th>
          </tr>
        </thead>

        <tbody>
          {data.portfolio.map((p) => (
            <tr key={p.symbol}>
              <td>{p.symbol}</td>
              <td>{p.quantity}</td>
              <td>${p.invested.toFixed(2)}</td>
              <td className={p.profit_loss >= 0 ? "up" : "down"}>
                {p.profit_loss >= 0 ? "+" : ""}
                ${p.profit_loss.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
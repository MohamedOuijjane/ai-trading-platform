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
    const fetchPortfolio = async () => {
      console.log("FETCH PORTFOLIO START");
      console.log("TOKEN:", localStorage.getItem("access_token"));
      try {
        const res = await fetch(`${API_URL}/api/v1/portfolio/`, { headers: getHeaders() });
        console.log("RESPONSE:", res);
        
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const jsonData = await res.json();
        console.log("PORTFOLIO DATA:", jsonData);

        if (jsonData && (jsonData.positions || jsonData.portfolio)) {
          setData(jsonData);
        } else {
          console.error("Invalid portfolio data structure:", jsonData);
        }
      } catch (err) {
        console.error("PORTFOLIO FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  if (loading) return <div style={{padding:40}}>Chargement...</div>;
  
  const positions = data?.positions || data?.portfolio || [];
  
  const chartData = positions.map(p => ({
    name: p.ticker || p.symbol || "Unknown",
    value: (p.quantity || 0) * (p.current || p.price || 0),
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
          <div className="title">Balance Actuelle</div>
          <div className="value">${data?.balance?.toFixed(2) || "0.00"}</div>
        </div>

        <div className="card">
          <div className="title">Profit / Loss Réalisé</div>
          <div className={`value ${(data?.pnl || 0) >= 0 ? "profit" : "loss"}`}>
            {(data?.pnl || 0) >= 0 ? "+" : ""}
            ${data?.pnl?.toFixed(2) || "0.00"}
          </div>
        </div>
      </div>
{/* GRAPHIQUE PORTFOLIO */}
<div className="card" style={{ marginBottom: "20px", height: "320px" }}>
  <div className="title">Répartition du portfolio (Valeur actuelle)</div>

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
          <Cell key={`cell-${index}`} fill={["#00d48a", "#60a5fa", "#f59e0b", "#a78bfa", "#f87171"][index % 5]} />
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
            <th>Prix Entrée</th>
            <th>Prix Actuel</th>
            <th>Profit / Loss</th>
          </tr>
        </thead>

        <tbody>
          {positions.length === 0 ? (
            <tr><td colSpan="5" style={{textAlign:'center', padding:20}}>Aucune position ouverte</td></tr>
          ) : (
            positions.map((p, idx) => (
              <tr key={p.ticker || p.symbol || idx}>
                <td>{p.ticker || p.symbol}</td>
                <td>{p.quantity}</td>
                <td>${(p.entry || p.invested || 0).toFixed(2)}</td>
                <td>${(p.current || p.price || 0).toFixed(2)}</td>
                <td className={(p.pnl || p.profit_loss || 0) >= 0 ? "up" : "down"}>
                  {(p.pnl || p.profit_loss || 0) >= 0 ? "+" : ""}
                  ${(p.pnl || p.profit_loss || 0).toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}


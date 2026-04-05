import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const API_URL = "http://127.0.0.1:8000";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const COLORS_PIE = ["#00d48a", "#f87171", "#f59e0b"];
const COLORS_BAR = { BUY: "#00d48a", SELL: "#f87171" };

const styles = `
  .charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 24px;
  }
  .chart-card {
    background: #1a1b23;
    border: 1px solid #2a2b35;
    border-radius: 14px;
    padding: 24px;
  }
  .chart-title {
    font-size: 14px;
    font-weight: 600;
    color: #e8e9f0;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .chart-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #6b6d80;
    font-size: 13px;
  }
  .recharts-tooltip-wrapper .recharts-default-tooltip {
    background: #1a1b23 !important;
    border: 1px solid #2a2b35 !important;
    border-radius: 8px !important;
  }
`;

const CustomTooltipBar = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#1a1b23",border:"1px solid #2a2b35",borderRadius:8,padding:"10px 14px"}}>
      <div style={{color:"#e8e9f0",fontFamily:"Space Mono",fontSize:12,marginBottom:6}}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{color:p.color,fontSize:12,fontFamily:"Space Mono"}}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

const CustomTooltipPie = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#1a1b23",border:"1px solid #2a2b35",borderRadius:8,padding:"10px 14px"}}>
      <div style={{color:payload[0].payload.fill,fontSize:12,fontFamily:"Space Mono",fontWeight:700}}>
        {payload[0].name}: {payload[0].value}
      </div>
    </div>
  );
};

export default function Charts({ onExpired }) {
  const [trades,      setTrades]      = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/trades/`,      { headers: getHeaders() }).then(r => { if(r.status===401){onExpired();return[];} return r.json(); }),
      fetch(`${API_URL}/api/predictions/`, { headers: getHeaders() }).then(r => { if(r.status===401){onExpired();return[];} return r.json(); }),
    ]).then(([t, p]) => {
      setTrades(Array.isArray(t) ? t : []);
      setPredictions(Array.isArray(p) ? p : []);
    }).finally(() => setLoading(false));
  }, []);

  // ── Données Bar Chart : trades par symbole ──
  const tradesBySymbol = () => {
    const map = {};
    trades.forEach(t => {
      if (!map[t.symbol]) map[t.symbol] = { symbol: t.symbol, BUY: 0, SELL: 0 };
      map[t.symbol][t.action] = (map[t.symbol][t.action] || 0) + 1;
    });
    return Object.values(map);
  };

  // ── Données Pie Chart : signaux prédictions ──
  const predBySignal = () => {
    const map = { BUY: 0, SELL: 0, HOLD: 0 };
    predictions.forEach(p => { if (map[p.signal] !== undefined) map[p.signal]++; });
    return [
      { name: "BUY",  value: map.BUY,  fill: "#00d48a" },
      { name: "SELL", value: map.SELL, fill: "#f87171" },
      { name: "HOLD", value: map.HOLD, fill: "#f59e0b" },
    ].filter(d => d.value > 0);
  };

  const barData = tradesBySymbol();
  const pieData = predBySignal();

  if (loading) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="charts-grid">

        {/* BAR CHART — Trades par symbole */}
        <div className="chart-card">
          <div className="chart-title">📊 Trades par symbole</div>
          {barData.length === 0 ? (
            <div className="chart-empty">Aucun trade à afficher</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{top:5,right:10,left:-20,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2b35" vertical={false} />
                <XAxis
                  dataKey="symbol"
                  tick={{fill:"#6b6d80", fontSize:10, fontFamily:"Space Mono"}}
                  axisLine={{stroke:"#2a2b35"}}
                  tickLine={false}
                />
                <YAxis
                  tick={{fill:"#6b6d80", fontSize:10}}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltipBar />} />
                <Legend
                  wrapperStyle={{fontSize:11,fontFamily:"Space Mono",paddingTop:8}}
                  formatter={(val) => <span style={{color:"#9a9bb0"}}>{val}</span>}
                />
                <Bar dataKey="BUY"  fill="#00d48a" radius={[4,4,0,0]} maxBarSize={32} />
                <Bar dataKey="SELL" fill="#f87171" radius={[4,4,0,0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* PIE CHART — Signaux prédictions */}
        <div className="chart-card">
          <div className="chart-title">🤖 Répartition des signaux IA</div>
          {pieData.length === 0 ? (
            <div className="chart-empty">Aucune prédiction à afficher</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltipPie />} />
                <Legend
                  formatter={(val, entry) => (
                    <span style={{color:entry.payload.fill, fontSize:12, fontFamily:"Space Mono", fontWeight:700}}>
                      {val} ({entry.payload.value})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </>
  );
}
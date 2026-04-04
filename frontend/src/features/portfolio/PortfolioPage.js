import React, { useState, useEffect, useCallback } from 'react';
import portfolioApi from '../../api/portfolio.api';

/**
 * PortfolioPage Component
 * Displays real-time user portfolio state from the backend.
 * Features: Automatic data fetching, P&L calculations, and history tracking.
 */
const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches fresh portfolio data from the backend.
   * Defined with useCallback to allow safe inclusion in dependency arrays if needed.
   */
  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await portfolioApi.getPortfolio();
      // Normalize data to ensure default arrays for positions and history
      setPortfolio({
        balance: data.balance || 0,
        pnl: data.pnl || 0,
        winRate: data.winRate || 0,
        positions: data.positions || [],
        history: data.history || [],
      });
    } catch (err) {
      console.error('[Portfolio Fetch Error]:', err);
      setError(err.message || 'Unable to load portfolio. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on initial component mount
  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  if (loading) {
    return <div className="loading-state"><h3>Updating portfolio data...</h3></div>;
  }

  if (error) {
    return (
      <div className="error-state" style={{ color: 'red', padding: '20px' }}>
        <h3>Error Loading Portfolio</h3>
        <p>{error}</p>
        <button onClick={fetchPortfolio}>Retry Connection</button>
      </div>
    );
  }

  // Handle case where portfolio is empty
  const hasPositions = portfolio && portfolio.positions.length > 0;

  return (
    <div className="portfolio-container">
      <h1>Investment Portfolio</h1>

      {/* --- Section 1: Financial Summary --- */}
      <section className="summary-card" style={{ display: 'flex', gap: '30px', padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '10px' }}>
        <div>
          <label>Available Balance</label>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
            ${portfolio.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <label>Total Profit/Loss</label>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: portfolio.pnl >= 0 ? 'green' : 'red' }}>
            {portfolio.pnl >= 0 ? '+' : ''}${portfolio.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <label>AI Win Rate</label>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
            {portfolio.winRate}%
          </div>
        </div>
      </section>

      {/* --- Section 2: Active Positions --- */}
      <section className="positions-list" style={{ marginTop: '40px' }}>
        <h2>Active Asset Positions</h2>
        {!hasPositions ? (
          <p>No active positions. Use the Trade page to open your first position.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                <th>Ticker</th>
                <th>Quantity</th>
                <th>Avg. Entry</th>
                <th>Current Price</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.positions.map((pos) => {
                const currentPnL = (pos.current - pos.entry) * pos.quantity;
                return (
                  <tr key={pos.ticker} style={{ borderBottom: '1px solid #eee', height: '45px' }}>
                    <td style={{ fontWeight: 'bold' }}>{pos.ticker}</td>
                    <td>{pos.quantity}</td>
                    <td>${pos.entry.toLocaleString()}</td>
                    <td>${pos.current.toLocaleString()}</td>
                    <td style={{ color: currentPnL >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                      {currentPnL >= 0 ? '+' : ''}${currentPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* --- Section 3: Trade Log --- */}
      <section className="trade-history" style={{ marginTop: '40px' }}>
        <h2>Recent Activity Log</h2>
        {portfolio.history.length === 0 ? (
          <p>No history recorded yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {portfolio.history.map((item, idx) => (
              <li key={idx} style={{ padding: '10px', borderBottom: '1px dashed #ccc' }}>
                <span style={{ fontWeight: 'bold', color: item.action === 'BUY' ? 'blue' : 'orange' }}>
                  {item.action}
                </span> 
                {' '} {item.ticker} | Date: {new Date(item.date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default PortfolioPage;

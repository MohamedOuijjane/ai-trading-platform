import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPortfolio } from './portfolioSlice';
import PortfolioSummary from './components/PortfolioSummary';
import PositionsTable from './components/PositionsTable';
import PerformanceChart from './components/PerformanceChart';

/**
 * PortfolioPage Component
 * Displays real-time user portfolio state from Redux.
 */
const PortfolioPage = () => {
  const dispatch = useDispatch();
  const { balance, positions, history, loading, error } = useSelector((state) => state.portfolio);

  useEffect(() => {
    dispatch(fetchPortfolio());
  }, [dispatch]);

  if (loading && !balance) {
    return <div className="loading-state"><h3>Updating portfolio data...</h3></div>;
  }

  if (error) {
    return (
      <div className="error-state" style={{ color: 'red', padding: '20px' }}>
        <h3>Error Loading Portfolio</h3>
        <p>{error}</p>
        <button onClick={() => dispatch(fetchPortfolio())}>Retry Connection</button>
      </div>
    );
  }

  return (
    <div className="portfolio-container">
      <h1>Investment Portfolio</h1>

      <PortfolioSummary balance={balance} history={history} />
      
      <div style={{ marginTop: '40px' }}>
        <h2>Performance History</h2>
        <PerformanceChart data={history} />
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Active Asset Positions</h2>
        <PositionsTable positions={positions} />
      </div>
    </div>
  );
};

export default PortfolioPage;
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

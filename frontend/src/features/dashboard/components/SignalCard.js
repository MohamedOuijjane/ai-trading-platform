import React from 'react';

/**
 * Component to display individual trading signals
 */
const SignalCard = ({ prediction }) => {
  if (!prediction) return null;

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY': return '#28a745';
      case 'SELL': return '#dc3545';
      case 'HOLD': return '#6c757d';
      default: return '#000';
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      borderRadius: '12px', 
      backgroundColor: 'white', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      borderLeft: `6px solid ${getSignalColor(prediction.signal)}`,
      marginBottom: '15px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{prediction.ticker}</h3>
        <span style={{ 
          padding: '4px 12px', 
          borderRadius: '20px', 
          backgroundColor: getSignalColor(prediction.signal),
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}>
          {prediction.signal}
        </span>
      </div>
      <div style={{ marginTop: '15px', display: 'flex', gap: '20px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: '#666' }}>Price</label>
          <div style={{ fontWeight: 'bold' }}>${parseFloat(prediction.price).toFixed(2)}</div>
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: '#666' }}>Confidence</label>
          <div style={{ fontWeight: 'bold' }}>{(prediction.confidence * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

export default SignalCard;

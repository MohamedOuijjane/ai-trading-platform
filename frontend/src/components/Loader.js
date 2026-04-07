import React from 'react';

/**
 * Common Loading Spinner/Overlay
 */
const Loader = ({ fullPage = false, message = "Loading..." }) => {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
      <div className="spinner"></div>
      {message && <p style={{ margin: 0, fontWeight: '500', color: '#666' }}>{message}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="loading-overlay">{content}</div>;
  }

  return <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>{content}</div>;
};

export default Loader;

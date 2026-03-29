import React from 'react'; // This should be line 1

const StudioPage: React.FC = () => {
  return (
    <div style={{ 
      backgroundColor: '#000000', 
      color: '#ff5500', 
      fontFamily: 'JetBrains Mono, monospace', 
      padding: '2rem', 
      minHeight: '100vh' 
    }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{'>'} STUDIO_INITIALIZED</h1>
      <p style={{ opacity: 0.8 }}>Ready for agent configuration...</p>
      
      <div style={{ 
        border: '1px solid #ff5500', 
        padding: '1rem', 
        marginTop: '2rem',
        maxWidth: '400px'
      }}>
        <p>SYSTEM_STATUS: ONLINE</p>
        <p>AGENT_DATABASE: CONNECTED</p>
      </div>
    </div>
  );
};

export default StudioPage;
import React from 'react';
import './styles/index.css';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1> THR505 Demo - Test Mode</h1>
        <p>If you see this, React is working!</p>
      </header>
      <main style={{ padding: '20px', textAlign: 'center' }}>
        <p>Testing basic rendering...</p>
        <button onClick={() => alert('Button works!')}>Click Me</button>
      </main>
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:3001/api';

interface HealthResponse {
  message: string;
  timestamp: string;
}

function App() {
  const [health, setHealth] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        setLoading(true);
        const response = await axios.get<HealthResponse>(`${API_BASE}/health`);
        setHealth(response.data.message);
        setError('');
      } catch (err) {
        setError('❌ No se puede conectar con el backend');
        setHealth('');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkBackend();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await axios.get<HealthResponse>(`${API_BASE}/health`);
      setHealth(response.data.message);
      setError('');
    } catch (err) {
      setError('❌ No se puede conectar con el backend');
      setHealth('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Proyecto Full Stack</h1>
        <h2>Node.js + React + TypeScript</h2>
        
        <div style={{ margin: '20px 0', padding: '20px', backgroundColor: '#282c34', borderRadius: '8px' }}>
          <h3>Estado del Backend:</h3>
          
          {loading && <p>🔄 Verificando conexión...</p>}
          
          {!loading && health && (
            <p style={{ color: '#61dafb', fontSize: '18px' }}>
              ✅ {health}
            </p>
          )}
          
          {!loading && error && (
            <p style={{ color: '#ff6b6b', fontSize: '18px' }}>
              {error}
            </p>
          )}
          
          <button 
            onClick={testConnection}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#61dafb',
              color: '#282c34',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
            disabled={loading}
          >
            {loading ? 'Probando...' : 'Probar Conexión'}
          </button>
        </div>

        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          <p>Backend: http://localhost:3001</p>
          <p>Frontend: http://localhost:3000</p>
        </div>
      </header>
    </div>
  );
}

export default App;
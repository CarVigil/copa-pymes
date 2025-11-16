import React from 'react';
import { useHealth } from '../hooks/useHealth';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import './HomePage.css';

interface HomePageProps {
  onNavigateTorneos?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateTorneos  }) => {
  const { health, loading, error, refetch } = useHealth();

  if (loading) {
    return <Loading message="Conectando con el servidor..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>🏆 Copa Pymes</h1>
        <p>Sistema de gestión para torneos de Fútbol Amateur</p>
      </div>

      {/*health && (
        <div className="status-card">
          <h3>📊 Estado del Sistema</h3>
          <div className="status-info">
            <div className="status-item">
              <span className="status-label">Servidor:</span>
              <span className="status-value success">✅ Conectado</span>
            </div>
            <div className="status-item">
              <span className="status-label">Base de datos:</span>
            </div>
            <div className="status-item">
              <span className="status-label">Última actualización:</span>
              <span className="status-value">{new Date(health.timestamp).toLocaleString('es-ES')}</span>
            </div>
          </div>
          <button className="refresh-button" onClick={refetch}>
            🔄 Actualizar estado
          </button>
        </div>
      )*/}

      <div className="features-grid">
        <div className="feature-card">
          <h3>Gestión de Torneos</h3>
          <p>Administra los torneos</p>
          <button 
            className="feature-button" 
            onClick={onNavigateTorneos}
          >
            Ver Torneos
          </button>
        </div>
        
        <div className="feature-card">
          <h3>⚽ Partidos</h3>
          <p>Programa y gestiona los encuentros</p>
          <button className="feature-button">Ver Partidos</button>
        </div>
        
        <div className="feature-card">
          <h3>🏅 Resultados</h3>
          <p>Consulta resultados y estadísticas</p>
          <button className="feature-button">Ver Resultados</button>
        </div>
      </div>
    </div>
  );
};

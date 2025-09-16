import React from 'react';
import './Header.css';

interface HeaderProps {
  title?: string;
  onNavigateHome?: () => void;
  onNavigateJugadores?: () => void;
  currentPage?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'Copa Pymes', 
  onNavigateHome,
  onNavigateJugadores,
  currentPage 
}) => {
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title">{title}</h1>
        <nav className="header-nav">
          <button 
            className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
            onClick={onNavigateHome}
          >
            Inicio
          </button>
          <button 
            className={`nav-button ${currentPage === 'jugadores' ? 'active' : ''}`}
            onClick={onNavigateJugadores}
          >
            Jugadores
          </button>
          <button className="nav-button">Partidos</button>
          <button className="nav-button">Resultados</button>
        </nav>
      </div>
    </header>
  );
};

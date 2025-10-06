import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./Header.css";

interface HeaderProps {
  title?: string;
  onNavigateHome?: () => void;
  onNavigateJugadores?: () => void;
  onNavigateTorneos?: () => void;
  currentPage?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Copa Pymes",
  onNavigateHome,
  onNavigateJugadores,
  onNavigateTorneos,
  currentPage,
}) => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    // La aplicación se redirigirá automáticamente al login
  };

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title">{title}</h1>
        <nav className="header-nav">
          <button
            className={`nav-button ${currentPage === "home" ? "active" : ""}`}
            onClick={onNavigateHome}
          >
            Inicio
          </button>
          <button
            className={`nav-button ${
              currentPage === "jugadores" ? "active" : ""
            }`}
            onClick={onNavigateJugadores}
          >
            Jugadores
          </button>
          <button
            className={`nav-button ${
              currentPage === "torneos" ? "active" : ""
            }`}
            onClick={onNavigateTorneos}
          >
            Torneos
          </button>
          <button className="nav-button">Partidos</button>
          <button className="nav-button">Resultados</button>
          
          {/* Información del usuario y logout */}
          <div className="user-section">
            <span className="user-info">
              {user?.nombre} ({isAdmin ? 'Admin' : 'Jugador'})
            </span>
            <button className="nav-button logout-button" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

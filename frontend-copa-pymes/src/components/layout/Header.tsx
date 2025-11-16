import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import "./Header.css";

interface HeaderProps {
  title?: string;
  onNavigateHome?: () => void;
  onNavigateJugadores?: () => void;
  onNavigateTorneos?: () => void;
  onNavigateEquipos?: () => void;
  onNavigateProfile?: () => void;
  onNavigateEquiposDetalle?: () => void;
  currentPage?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Copa Pymes",
  onNavigateHome,
  onNavigateJugadores,
  onNavigateTorneos,
  onNavigateEquipos,
  onNavigateProfile,
  onNavigateEquiposDetalle,
  currentPage,
}) => {
  const { user, logout } = useAuth();
  const { canView } = usePermissions();

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
          
          {/* Solo mostrar si tiene permiso para ver jugadores */}
          {canView('jugadores') && (
            <button
              className={`nav-button ${
                currentPage === "jugadores" ? "active" : ""
              }`}
              onClick={onNavigateJugadores}
            >
              Jugadores
            </button>
          )}
          
          {/* Solo mostrar si tiene permiso para ver torneos */}
          {canView('torneos') && (
            <button
              className={`nav-button ${
                currentPage === "torneos" ? "active" : ""
              }`}
              onClick={onNavigateTorneos}
            >
              Torneos
            </button>
          )}
          
          {/* Solo mostrar si tiene permiso para ver equipos */}
          {canView('equipos') && (
            <button
              className={`nav-button ${
                currentPage === "equipos" ? "active" : ""
              }`}
              onClick={onNavigateEquipos}
            >
              Equipos
            </button>
          )}
          
          {/* Solo mostrar si tiene permiso para ver partidos */}
          {canView('partidos') && (
            <button className="nav-button">
              Partidos
            </button>
          )}
          
          {/* Solo mostrar si tiene permiso para ver resultados */}
          {canView('resultados') && (
            <button className="nav-button">
              Resultados
            </button>
          )}
          
          {/* Información del usuario y logout */}
          <div className="user-section">
            <button
              className={`nav-button profile-button ${
                currentPage === "profile" ? "active" : ""
              }`}
              onClick={onNavigateProfile}
              title="Ver mi perfil"
            >
              <span className="profile-avatar">
                {user?.nombre.charAt(0).toUpperCase()}
              </span>
              <span className="profile-text">Mi Perfil</span>
            </button>
            <button className="nav-button logout-button" onClick={handleLogout}>
              🚪 Salir
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

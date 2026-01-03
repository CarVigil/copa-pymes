import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faChevronDown, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    // La aplicación se redirigirá automáticamente al login
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          
          {/* Información del usuario y dropdown */}
          <div className="user-section" ref={dropdownRef}>
            <button
              className="nav-button profile-dropdown-button"
              onClick={toggleDropdown}
              title="Menú de usuario"
            >
              <span className="profile-avatar">
                {user?.nombre.charAt(0).toUpperCase()}
              </span>
              <span className="profile-text">{user?.nombre}</span>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
              />
            </button>
            {isDropdownOpen && (
              <div className="profile-dropdown">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onNavigateProfile?.();
                  }}
                >
                  <FontAwesomeIcon icon={faUser} className="dropdown-icon" />
                  Perfil
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="dropdown-icon" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

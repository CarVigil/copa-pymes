import React from 'react';
import { useJugadores } from '../hooks/useJugadores';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import './Page.css';

export const JugadoresPage: React.FC = () => {
  const { jugadores, loading, error, refetch } = useJugadores();

  if (loading) {
    return <Loading message="Cargando jugadores..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  const formatFecha = (fecha: Date | string) => {
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🏃‍♂️ Gestión de Jugadores</h1>
        <p>Administra todos los jugadores registrados en el sistema</p>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={refetch}>
          🔄 Actualizar Lista
        </button>
        <button className="btn btn-success">
          ➕ Agregar Jugador
        </button>
      </div>

      {jugadores && jugadores.length > 0 ? (
        <div className="jugadores-container">
          <div className="jugadores-stats">
            <div className="stat-card">
              <h3>{jugadores.length}</h3>
              <p>Jugadores Registrados</p>
            </div>
          </div>

          <div className="jugadores-table-container">
            <table className="jugadores-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Completo</th>
                  <th>DNI</th>
                  <th>Email</th>
                  <th>Fecha de Nacimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {jugadores.map((jugador) => (
                  <tr key={jugador.id}>
                    <td>#{jugador.id}</td>
                    <td className="nombre-completo">
                      <div className="player-info">
                        <span className="nombre">{jugador.nombre} {jugador.apellido}</span>
                      </div>
                    </td>
                    <td className="dni">{jugador.dni}</td>
                    <td className="email">{jugador.email}</td>
                    <td className="fecha">{formatFecha(jugador.fecha_nacimiento)}</td>
                    <td className="acciones">
                      <button className="btn-icon btn-edit" title="Editar">
                        ✏️
                      </button>
                      <button className="btn-icon btn-delete" title="Eliminar">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-content">
            <h3>📋 No hay jugadores registrados</h3>
            <p>Comienza agregando tu primer jugador al sistema</p>
            <button className="btn btn-primary">
              ➕ Agregar Primer Jugador
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

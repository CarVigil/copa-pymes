import React from 'react';
import { useJugadores } from '../hooks/useJugadores';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { usePermissions } from '../hooks/usePermissions';
import { ProtectedAction } from '../components/common/ProtectedAction';
import './Page.css';

export const JugadoresPage: React.FC = () => {
  const { jugadores, loading, error, refetch } = useJugadores();
  const { canCreate, canEdit, canDelete } = usePermissions();

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
        <p>
          {canEdit('jugadores') || canCreate('jugadores') 
            ? 'Administra todos los jugadores registrados en el sistema'
            : 'Consulta la información de los jugadores registrados'}
        </p>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={refetch}>
          🔄 Actualizar Lista
        </button>
        <ProtectedAction resource="jugadores" action="create">
          <button className="btn btn-success">
            ➕ Agregar Jugador
          </button>
        </ProtectedAction>
        
        {!canCreate('jugadores') && !canEdit('jugadores') && !canDelete('jugadores') && (
          <div className="read-only-notice">
            👁️ Modo solo lectura
          </div>
        )}
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
                  {(canEdit('jugadores') || canDelete('jugadores')) && (
                    <th>Acciones</th>
                  )}
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
                    {(canEdit('jugadores') || canDelete('jugadores')) && (
                      <td className="acciones">
                        <ProtectedAction resource="jugadores" action="edit">
                          <button className="btn-icon btn-edit" title="Editar">
                            ✏️
                          </button>
                        </ProtectedAction>
                        <ProtectedAction resource="jugadores" action="delete">
                          <button className="btn-icon btn-delete" title="Eliminar">
                            🗑️
                          </button>
                        </ProtectedAction>
                      </td>
                    )}
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

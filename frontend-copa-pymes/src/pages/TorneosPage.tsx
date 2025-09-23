import React from "react";
import { useTorneos } from "../hooks/useTorneos";
import { Loading } from "../components/common/Loading";
import { ErrorMessage } from "../components/common/ErrorMessage";
import "./TorneosPage.css";

export const TorneosPage: React.FC = () => {
  const { torneos, loading, error, refetch } = useTorneos();

  if (loading) {
    return <Loading message="Cargando torneos..." />;
  }
  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  const formatFecha = (fecha: Date | string) => {
    return new Date(fecha).toLocaleDateString("es-ES");
  };
  return (
    <div className="torneos-page">
      <div className="page-header">
        <h1>🏆 Gestión de Torneos</h1>
        <p>Administra todos los torneos registrados en el sistema</p>
      </div>
      <div className="torneos-actions">
        <button className="btn btn-primary" onClick={refetch}>
          🔄 Actualizar Lista
        </button>
        <button className="btn btn-success">➕ Agregar Torneo</button>
      </div>
      {torneos && torneos.length > 0 ? (
        <div className="torneos-container">
          <div className="torneos-stats">
            <div className="stat-card">
              <h3>{torneos.length}</h3>
              <p>Torneos Registrados</p>
            </div>
          </div>
          <div className="torneos-table-container">
            <table className="torneos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Modalidad</th>
                  <th>Fecha de Inicio</th>
                  <th>Fecha de Fin</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {torneos.map((torneo) => (
                  <tr key={torneo.id}>
                    <td>{torneo.id}</td>
                    <td>{torneo.nombre}</td>
                    <td>{torneo.tipo}</td>
                    <td>{torneo.modalidad}</td>
                    <td>{formatFecha(torneo.fecha_inicio)}</td>
                    <td>{formatFecha(torneo.fecha_fin)}</td>
                    <td>
                      <button className="btn btn-sm btn-warning">
                        ✏️ Editar
                      </button>
                      <button className="btn btn-sm btn-danger">
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p>No hay torneos registrados.</p>
      )}
    </div>
  );
};

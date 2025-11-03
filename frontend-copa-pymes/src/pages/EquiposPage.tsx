import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEquipos } from "../hooks/useEquipos";
import { usePermissions } from "../hooks/usePermissions";
import { ProtectedAction } from "../components/common/ProtectedAction";
import { ModalAgregarEquipo } from "../components/modals/ModalAgregarEquipo";
import { Equipo } from "../types";
import "./Page.css";

export const EquiposPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    equipos,
    loading,
    error,
    refetch,
    crearEquipo,
    actualizarEquipo,
    eliminarEquipo,
    isCreating,
  } = useEquipos();
  
  const { canEdit, canDelete } = usePermissions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipoEnEdicion, setEquipoEnEdicion] = useState<Equipo | null>(null);

  const handleAdd = () => {
    setEquipoEnEdicion(null);
    setIsModalOpen(true);
  };

  const handleEdit = (equipo: Equipo) => {
    setEquipoEnEdicion(equipo);
    setIsModalOpen(true);
  };

  const handleGestionarJugadores = (equipoId: number) => {
    navigate(`/equipos/${equipoId}`);
  };

  const handleSubmit = async (data: Partial<Equipo>) => {
    if (equipoEnEdicion && equipoEnEdicion.id) {
      await actualizarEquipo(equipoEnEdicion.id, data);
    } else {
      const { nombre, sigla, estado, escudo } = data;
      if (!nombre || !sigla || typeof estado === "undefined") {
        return;
      }
      await crearEquipo({
        nombre,
        sigla,
        estado,
        escudo: escudo ?? "",
      });
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>⚽ Gestión de Equipos</h1>
        <p>Administra los equipos registrados</p>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={refetch}>
          🔄 Actualizar
        </button>
        <ProtectedAction resource="equipos" action="create">
          <button className="btn btn-success" onClick={handleAdd}>
            ➕ Agregar Equipo
          </button>
        </ProtectedAction>
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}

      <ModalAgregarEquipo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isCreating}
        equipo={equipoEnEdicion}
      />

      {equipos && equipos.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Sigla</th>
                <th>Estado</th>
                <th>Escudo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {equipos.map((equipo) => (
                <tr key={equipo.id}>
                  <td>{equipo.id}</td>
                  <td>{equipo.nombre}</td>
                  <td>{equipo.sigla}</td>
                  <td>
                    <span
                      className={`badge ${
                        equipo.estado ? "badge-success" : "badge-danger"
                      }`}
                    >
                      {equipo.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    {equipo.escudo ? (
                      <img src={equipo.escudo} alt="escudo" width="30" />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <div className="actions-group">
                      {/* Botón para gestionar jugadores - siempre visible */}
                      <button 
                        className="btn-icon btn-info" 
                        onClick={() => handleGestionarJugadores(equipo.id!)}
                        title="Gestionar jugadores del equipo"
                      >
                        👥
                      </button>
                      
                      {/* Botón editar - solo con permisos */}
                      <ProtectedAction resource="equipos" action="edit">
                        <button 
                          className="btn-icon btn-edit" 
                          onClick={() => handleEdit(equipo)}
                          title="Editar equipo"
                        >
                          ✏️
                        </button>
                      </ProtectedAction>
                      
                      {/* Botón eliminar - solo con permisos */}
                      <ProtectedAction resource="equipos" action="delete">
                        <button 
                          className="btn-icon btn-delete" 
                          onClick={() => eliminarEquipo(equipo.id!)}
                          title="Eliminar equipo"
                        >
                          🗑️
                        </button>
                      </ProtectedAction>
                      
                      {/* Mensaje de solo lectura */}
                      {!canEdit('equipos') && !canDelete('equipos') && (
                        <span className="text-muted" style={{fontSize: '0.85rem'}}>
                          👁️ Solo lectura
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-content">
            <h3>📋 No hay equipos registrados</h3>
            <p>Comienza agregando tu primer equipo al sistema</p>
            <button className="btn btn-primary" onClick={handleAdd}>
              ➕ Agregar Primer Equipo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
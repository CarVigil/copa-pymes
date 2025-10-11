import React, { useState } from "react";
import { useEquipos } from "../hooks/useEquipos";
import { ModalAgregarEquipo } from "../components/modals/ModalAgregarEquipo";
import { Equipo } from "../types";
import "./Page.css";

export const EquiposPage: React.FC = () => {
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

  const handleSubmit = async (data: Partial<Equipo>) => {
    if (equipoEnEdicion && equipoEnEdicion.id) {
      await actualizarEquipo(equipoEnEdicion.id, data);
    } else {
      // Asegúrate de que los campos requeridos no sean undefined
      const { nombre, sigla, estado, escudo } = data;
      if (!nombre || !sigla || typeof estado === "undefined") {
        // Puedes mostrar un error aquí si lo deseas
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
        <button className="btn btn-success" onClick={handleAdd}>
          ➕ Agregar Equipo
        </button>
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
                  <button className="btn-icon btn-edit" onClick={() => handleEdit(equipo)}>✏️</button>
                  <button className="btn-icon btn-delete" onClick={() => eliminarEquipo(equipo.id!)}>🗑️</button>
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
            <button className="btn btn-primary">
              ➕ Agregar Primer Equipo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

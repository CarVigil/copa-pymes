import React, { useState } from "react";
import { useTorneos } from "../hooks/useTorneos";
import { ModalAgregarTorneo } from "../components/modals/ModalAgregarTorneo";
import { ModalEditarTorneo } from "../components/modals/ModalEditarTorneo";
import { Loading } from "../components/common/Loading";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { CreateTorneoRequest, UpdateTorneoRequest } from "../types";
import "./Page.css";

export const TorneosPage: React.FC = () => {
  const {
    torneos,
    loading,
    error,
    refetch,
    crearTorneo,
    actualizarTorneo,
    eliminarTorneo,
    isCreating,
  } = useTorneos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalEditarOpen, setIsModalEditarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [torneoEnEdicion, setTorneoEnEdicion] = useState<
    (typeof torneos)[0] | null
  >(null);

  if (loading) {
    return <Loading message="Cargando torneos..." />;
  }

  const formatFecha = (fecha: Date | string) => {
    return new Date(fecha).toLocaleDateString("es-ES");
  };

  const handleAgregarTorneo = async (datos: CreateTorneoRequest) => {
    try {
      await crearTorneo(datos);
      setSuccessMessage("Torneo creado exitosamente");
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error al crear torneo:", err);
    }
  };

  const handleEliminarTorneo = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este torneo?")) {
      try {
        await eliminarTorneo(id);
        setSuccessMessage("Torneo eliminado exitosamente");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error("Error al eliminar torneo:", err);
      }
    }
  };

  const handleActualizarTorneo = async (
    id: number,
    datos: UpdateTorneoRequest
  ) => {
    try {
      await actualizarTorneo(id, datos);
      setSuccessMessage("Torneo actualizado correctamente");
      setIsModalEditarOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
      setTorneoEnEdicion(null);
    } catch (err) {
      console.error("Error al actualizar torneo:", err);
    }
  };

  const handleEditarTorneo = (torneo: (typeof torneos)[0]) => {
    setTorneoEnEdicion(torneo);
    setIsModalEditarOpen(true);
  };

  const getEstadoBadge = (estado: string) => {
    const estadoMap: { [key: string]: string } = {
      pendiente: "badge-pending",
      inscripciones_abiertas: "badge-info",
      activo: "badge-success",
      finalizado: "badge-danger",
    };

    const badgeClass = estadoMap[estado] || "badge-pending";
    const displayText = estado.replace(/_/g, " ");

    return (
      <span className={`badge ${badgeClass}`}>{displayText}</span>
    );
  };

  const getTipo = (tipo: string) => {
    const tipoMap: { [key: string]: string } = {
      todos_contra_todos: "Todos contra Todos",
      eliminatorio: "Eliminatorio",
    };
    return tipoMap[tipo] || tipo;
  };

  const getModalidad = (modalidad: string) => {
    const modalidadMap: { [key: string]: string } = {
      futbol5: "Fútbol 5",
      futbol8: "Fútbol 8",
      futbol11: "Fútbol 11",
    };
    return modalidadMap[modalidad] || modalidad;
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🏆 Gestión de Torneos</h1>
        <p>Administra todos los torneos registrados en el sistema</p>
      </div>

      {successMessage && (
        <div className="message message-success">✓ {successMessage}</div>
      )}

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      <div className="actions">
        <button className="btn btn-primary" onClick={refetch}>
          🔄 Actualizar Lista
        </button>
        <button
          className="btn btn-success"
          onClick={() => {
            setTorneoEnEdicion(null);
            setIsModalOpen(true);
          }}
        >
          ➕ Crear Torneo
        </button>
      </div>

      <ModalAgregarTorneo
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSubmit={handleAgregarTorneo}
        isLoading={isCreating}
      />

      <ModalEditarTorneo
        isOpen={isModalEditarOpen}
        onClose={() => {
          setIsModalEditarOpen(false);
          setTorneoEnEdicion(null);
        }}
        onSubmit={async (datos) => {
          if (torneoEnEdicion) {
            await handleActualizarTorneo(torneoEnEdicion.id, datos);
          }
        }}
        isLoading={isCreating}
        torneo={
          torneoEnEdicion
            ? {
                ...torneoEnEdicion,
                fecha_inicio:
                  typeof torneoEnEdicion.fecha_inicio === "string"
                    ? new Date(torneoEnEdicion.fecha_inicio)
                    : torneoEnEdicion.fecha_inicio,
                fecha_fin:
                  typeof torneoEnEdicion.fecha_fin === "string"
                    ? new Date(torneoEnEdicion.fecha_fin)
                    : torneoEnEdicion.fecha_fin,
                estado: torneoEnEdicion.estado as
                  | "inscripciones_abiertas"
                  | "activo"
                  | "finalizado"
                  | undefined,
              }
            : null
        }
      />

      {torneos && torneos.length > 0 ? (
        <>
          <div className="stats">
            <div className="stat-card">
              <h3>{torneos.length}</h3>
              <p>Torneos Registrados</p>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Modalidad</th>
                  <th>Equipos</th>
                  <th>Divisiones</th>
                  <th>Fecha de Inicio</th>
                  <th>Fecha de Fin</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {torneos.map((torneo) => (
                  <tr key={torneo.id}>
                    <td>{torneo.id}</td>
                    <td>{torneo.nombre}</td>
                    <td>{getTipo(torneo.tipo)}</td>
                    <td>{getModalidad(torneo.modalidad)}</td>
                    <td>{torneo.cantidad_equipos}</td>
                    <td>{torneo.cantidad_divisiones}</td>
                    <td>{formatFecha(torneo.fecha_inicio)}</td>
                    <td>{formatFecha(torneo.fecha_fin)}</td>
                    <td>{getEstadoBadge(torneo.estado)}</td>
                    <td>
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEditarTorneo(torneo)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleEliminarTorneo(torneo.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h3>📋 No hay torneos registrados</h3>
          <p>Comienza agregando tu primer torneo al sistema</p>
        </div>
      )}
    </div>
  );
};
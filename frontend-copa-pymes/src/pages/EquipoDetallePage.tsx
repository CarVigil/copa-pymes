import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import { ProtectedAction } from "../components/common/ProtectedAction";
import { Loading } from "../components/common/Loading";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { ModalAgregarJugadorEquipo } from "../components/modals/ModalAgregarJugadorEquipo";
import { Equipo, Jugador } from "../types";
import { equipoService } from "../services/equipoService";
import "./Page.css";

export const EquipoDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEdit, canDelete } = usePermissions();

  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEquipoYJugadores = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const [equipoRes, jugadoresRes] = await Promise.all([
        equipoService.getEquipoById(Number(id)),
        equipoService.getJugadoresDelEquipo(Number(id)),
      ]);

      setEquipo(equipoRes.data || null);
      setJugadores(jugadoresRes.data || []);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Error desconocido";
      setError(errorMsg);
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipoYJugadores();
  }, [id]);

  const handleRemoveJugador = async (jugadorId: number) => {
    if (!window.confirm("¿Deseas quitar este jugador del equipo?")) return;

    try {
      const res = await equipoService.quitarJugadorDelEquipo(
        Number(id),
        jugadorId
      );
      if (res.success) {
        await fetchEquipoYJugadores();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al quitar jugador");
    }
  };

  const handleAgregarJugador = async (jugadorId: number) => {
    try {
      const res = await equipoService.agregarJugadorAlEquipo(
        Number(id),
        jugadorId
      );
      if (res.success) {
        await fetchEquipoYJugadores();
        setIsModalOpen(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al agregar jugador");
    }
  };

  const formatFecha = (fecha?: string | Date) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-ES");
  };

  const calcularEdad = (fecha?: string | Date) => {
    if (!fecha) return "-";
    const hoy = new Date();
    const nac = new Date(fecha);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mes = hoy.getMonth() - nac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  if (loading) return <Loading message="Cargando información del equipo..." />;
  if (error)
    return <ErrorMessage message={error} onRetry={fetchEquipoYJugadores} />;
  if (!equipo)
    return (
      <div className="page">
        <div className="empty-state">
          <h3>❌ Equipo no encontrado</h3>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/equipos")}
          >
            ← Volver
          </button>
        </div>
      </div>
    );

  return (
    <div className="page">
      <div className="page-header">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/equipos")}
        >
          ← Volver a Equipos
        </button>

        <div
          className="equipo-header"
          style={{ display: "flex", alignItems: "center", gap: "2rem" }}
        >
          {equipo.escudo && (
            <img
              src={equipo.escudo}
              alt={`Escudo ${equipo.nombre}`}
              style={{
                width: "100px",
                height: "100px",
                objectFit: "contain",
                border: "2px solid #ddd",
                borderRadius: "8px",
                padding: "8px",
                backgroundColor: "#fff",
              }}
            />
          )}
          <div>
            <h1>⚽ {equipo.nombre}</h1>
            <p>
              Sigla: <strong>{equipo.sigla}</strong>
            </p>
            <span
              className={`badge ${
                equipo.estado ? "badge-success" : "badge-danger"
              }`}
            >
              {equipo.estado ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={fetchEquipoYJugadores}>
          🔄 Actualizar
        </button>
        <ProtectedAction resource="equipos" action="edit">
          <button
            className="btn btn-success"
            onClick={() => setIsModalOpen(true)}
          >
            ➕ Agregar Jugador
          </button>
        </ProtectedAction>
      </div>

      {/* Estadísticas */}
      <div className="jugadores-stats">
        <div className="stat-card">
          <h3>{jugadores.length}</h3>
          <p>Jugadores Totales</p>
        </div>
        <div className="stat-card">
          <h3>{jugadores.filter((j) => j.activo).length}</h3>
          <p>Activos</p>
        </div>
      </div>

      {/* Tabla de jugadores */}
      {jugadores.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Email</th>
                <th>F. Nacimiento</th>
                <th>Edad</th>
                <th>Posición</th>
                <th>Nº Camiseta</th>
                <th>Estado</th>
                {(canEdit("equipos") || canDelete("equipos")) && (
                  <th>Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {jugadores.map((j) => (
                <tr key={j.id}>
                  <td>#{j.id}</td>
                  <td>
                    {j.nombre} {j.apellido}
                  </td>
                  <td>{j.documento || "-"}</td>
                  <td>{j.email}</td>
                  <td>{formatFecha(j.fecha_nacimiento!)}</td>
                  <td>{calcularEdad(j.fecha_nacimiento!)} años</td>
                  <td>{j.posicion || "-"}</td>
                  <td>{j.numero_camiseta ? `#${j.numero_camiseta}` : "-"}</td>
                  <td>
                    <span
                      className={`badge ${
                        j.activo ? "badge-success" : "badge-danger"
                      }`}
                    >
                      {j.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  {(canEdit("equipos") || canDelete("equipos")) && (
                    <td>
                      <ProtectedAction resource="equipos" action="edit">
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleRemoveJugador(j.id!)}
                          title="Quitar del equipo"
                        >
                          ❌
                        </button>
                      </ProtectedAction>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>📋 No hay jugadores en este equipo</h3>
          {canEdit("equipos") && (
            <button
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              ➕ Agregar Primer Jugador
            </button>
          )}
        </div>
      )}

      {isModalOpen && (
        <ModalAgregarJugadorEquipo
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAgregarJugador}
          equipoId={Number(id)}
        />
      )}
    </div>
  );
};

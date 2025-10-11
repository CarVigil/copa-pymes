// components/modals/ModalEditarTorneo.tsx
import React, { useState, useEffect } from "react";
import { UpdateTorneoRequest } from "../../types";
import "./Modal.css";

interface ModalEditarTorneoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (datos: UpdateTorneoRequest) => Promise<void>;
  isLoading: boolean;
  torneo: UpdateTorneoRequest | null;
}

export const ModalEditarTorneo: React.FC<ModalEditarTorneoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  torneo,
}) => {
  const [formData, setFormData] = useState<UpdateTorneoRequest>({
    nombre: "",
    tipo: "",
    modalidad: "",
    fecha_inicio: new Date(),
    fecha_fin: new Date(),
    cantidad_divisiones: undefined,
    cantidad_equipos: undefined,
    estado: "pendiente",
  });

  const [error, setError] = useState<string | null>(null);

  // Inicializar formulario cuando se abre el modal o cambia el torneo
  useEffect(() => {
    if (isOpen && torneo) {
      setFormData({
        nombre: torneo.nombre || "",
        tipo: torneo.tipo || "",
        modalidad: torneo.modalidad || "",
        fecha_inicio: torneo.fecha_inicio
          ? new Date(torneo.fecha_inicio)
          : new Date(),
        fecha_fin: torneo.fecha_fin
          ? new Date(torneo.fecha_fin)
          : new Date(),
        cantidad_divisiones: torneo.cantidad_divisiones,
        cantidad_equipos: torneo.cantidad_equipos,
        estado: torneo.estado || "pendiente",
      });
      setError(null);
    }
  }, [isOpen, torneo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let newValue: any = value;

    // Convertir a número si es cantidad
    if (name === "cantidad_divisiones" || name === "cantidad_equipos") {
      newValue = value === "" ? undefined : parseInt(value, 10);
    }

    // Convertir fecha-hora si es fecha
    if (name === "fecha_inicio" || name === "fecha_fin") {
      newValue = new Date(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (
      !formData.nombre ||
      !formData.tipo ||
      !formData.modalidad ||
      !formData.cantidad_equipos ||
      !formData.fecha_inicio ||
      !formData.fecha_fin ||
      !formData.estado
    ) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (new Date(formData.fecha_inicio) >= new Date(formData.fecha_fin)) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar los cambios");
    }
  };

  if (!isOpen || !torneo) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar Torneo</h2>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={isLoading}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="nombre">Nombre del Torneo *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Torneo Apertura 2025"
              disabled={isLoading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipo">Tipo *</label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Seleccionar tipo</option>
                <option value="eliminatorio">Eliminatorio</option>
                <option value="todos_contra_todos">Todos contra todos</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="modalidad">Modalidad *</label>
              <select
                id="modalidad"
                name="modalidad"
                value={formData.modalidad}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Seleccionar modalidad</option>
                <option value="futbol5">Fútbol 5</option>
                <option value="futbol8">Fútbol 8</option>
                <option value="futbol11">Fútbol 11</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            {formData.tipo === "todos_contra_todos" && (
              <div className="form-group">
                <label htmlFor="cantidad_divisiones">Cantidad de Divisiones</label>
                <input
                  type="number"
                  id="cantidad_divisiones"
                  name="cantidad_divisiones"
                  value={formData.cantidad_divisiones || ""}
                  onChange={handleChange}
                  placeholder="Ej: 3"
                  min={1}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="cantidad_equipos">Cantidad de Equipos *</label>
              <input
                type="number"
                id="cantidad_equipos"
                name="cantidad_equipos"
                value={formData.cantidad_equipos || ""}
                onChange={handleChange}
                placeholder="Ej: 10"
                min={1}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha_inicio">Fecha de Inicio *</label>
              <input
                type="datetime-local"
                id="fecha_inicio"
                name="fecha_inicio"
                value={
                  formData.fecha_inicio
                    ? new Date(formData.fecha_inicio)
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_fin">Fecha de Fin *</label>
              <input
                type="datetime-local"
                id="fecha_fin"
                name="fecha_fin"
                value={
                  formData.fecha_fin
                    ? new Date(formData.fecha_fin)
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado *</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="pendiente">Pendiente</option>
              <option value="inscripciones_abiertas">Inscripciones abiertas</option>
              <option value="activo">Activo</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "💾 Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// components/modals/ModalAgregarTorneo.tsx
import React, { useState } from "react";
import { CreateTorneoRequest } from "../../types";
import "./ModalAgregarTorneo.css";

interface ModalAgregarTorneoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (datos: CreateTorneoRequest) => Promise<void>;
  isLoading: boolean;
}

export const ModalAgregarTorneo: React.FC<ModalAgregarTorneoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateTorneoRequest>({
    nombre: "",
    tipo: "",
    modalidad: "",
    fechaInicio: "",
    fechaFin: "",
    cantidadDivisiones: undefined,
    cantidadEquipos: undefined,
    estado: "pendiente",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "tipo" && value !== "todos_contra_todos") {
        return {
          ...prev,
          tipo: value,
          cantidadDivisiones: undefined,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });

    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (
      !formData.nombre ||
      !formData.tipo ||
      !formData.modalidad ||
      !formData.fechaInicio ||
      !formData.fechaFin
    ) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (new Date(formData.fechaInicio) >= new Date(formData.fechaFin)) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({
        nombre: "",
        tipo: "",
        modalidad: "",
        fechaInicio: "",
        fechaFin: "",
        cantidadDivisiones: undefined,
        cantidadEquipos: undefined,
        estado: "pendiente",
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el torneo");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Agregar Nuevo Torneo</h2>
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
                <label htmlFor="cantidadDivisiones">
                  Cantidad de Divisiones
                </label>
                <input
                  type="number"
                  id="cantidadDivisiones"
                  name="cantidadDivisiones"
                  value={formData.cantidadDivisiones || ""}
                  onChange={handleChange}
                  placeholder="Ej: 3"
                  min={1}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="cantidadEquipos">Cantidad de Equipos</label>
              <input
                type="number"
                id="cantidadEquipos"
                name="cantidadEquipos"
                value={formData.cantidadEquipos || ""}
                onChange={handleChange}
                placeholder="Ej: 10"
                min={1}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fechaInicio">Fecha de Inicio *</label>
              <input
                type="datetime-local"
                id="fechaInicio"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fechaFin">Fecha de Fin *</label>
              <input
                type="datetime-local"
                id="fechaFin"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
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
              {isLoading ? "Creando..." : "➕ Crear Torneo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

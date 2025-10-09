import React, { useState } from 'react';
import { useTorneos } from '../hooks/useTorneos';
import { ModalAgregarTorneo } from '../components/modals/ModalAgregarTorneo';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { CreateTorneoRequest } from '../types';
import './TorneosPage.css';

export const TorneosPage: React.FC = () => {
  const { 
    torneos, 
    loading, 
    error, 
    refetch, 
    crearTorneo, 
    actualizarTorneo,
    eliminarTorneo,
    isCreating 
  } = useTorneos();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (loading) {
    return <Loading message="Cargando torneos..." />;
  }

  const formatFecha = (fecha: Date | string) => {
    return new Date(fecha).toLocaleDateString("es-ES");
  };

  const handleAgregarTorneo = async (datos: CreateTorneoRequest) => {
    try {
      await crearTorneo(datos);
      setSuccessMessage('Torneo creado exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error al crear torneo:', err);
    }
  };

  const handleEliminarTorneo = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este torneo?')) {
      try {
        await eliminarTorneo(id);
        setSuccessMessage('Torneo eliminado exitosamente');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error('Error al eliminar torneo:', err);
      }
    }
  };

  const handleEditarTorneo = (torneo: typeof torneos[0]) => {
    // Aquí puedes implementar la lógica para editar
    // Podrías abrir otro modal o redirigir a una página de edición
    console.log('Editar torneo:', torneo);
  };

  return (
    <div className="torneos-page">
      <div className="page-header">
        <h1>🏆 Gestión de Torneos</h1>
        <p>Administra todos los torneos registrados en el sistema</p>
      </div>

      {successMessage && (
        <div className="success-message">
          ✓ {successMessage}
        </div>
      )}

      {error && (
        <ErrorMessage message={error} onRetry={refetch} />
      )}

      <div className="torneos-actions">
        <button className="btn btn-primary" onClick={refetch}>
          🔄 Actualizar Lista
        </button>
        <button 
          className="btn btn-success"
          onClick={() => setIsModalOpen(true)}
        >
          ➕ Agregar Torneo
        </button>
      </div>

      <ModalAgregarTorneo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAgregarTorneo}
        isLoading={isCreating}
      />

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
                      <button 
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEditarTorneo(torneo)}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleEliminarTorneo(torneo.id)}
                      >
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
        <div className="no-torneos">
          <p>No hay torneos registrados.</p>
        </div>
      )}
    </div>
  );
};
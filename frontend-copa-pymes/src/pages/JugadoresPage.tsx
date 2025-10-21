import React, { useState } from 'react';
import { useJugadores } from '../hooks/useJugadores';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { usePermissions } from '../hooks/usePermissions';
import { ProtectedAction } from '../components/common/ProtectedAction';
import { ModalAgregarJugador } from '../components/modals/ModalAgregarJugador';
import { Jugador, CreateJugadorRequest, UpdateJugadorRequest, JugadorFormData } from '../types';
import './Page.css';

export const JugadoresPage: React.FC = () => {
  const { jugadores, loading, error, refetch, createJugador, updateJugador, deleteJugador } = useJugadores();
  const { canCreate, canEdit, canDelete } = usePermissions();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJugador, setSelectedJugador] = useState<Jugador | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return <Loading message="Cargando jugadores..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  const formatFecha = (fecha: Date | string) => {
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  const handleOpenModal = (jugador?: Jugador) => {
    setSelectedJugador(jugador || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJugador(null);
  };

  const handleSubmit = async (jugadorData: JugadorFormData) => {
    setIsSubmitting(true);
    try {
      // Convertir fecha de Date|string a Date si es necesario
      const fechaNacimiento = jugadorData.fecha_nacimiento 
        ? (typeof jugadorData.fecha_nacimiento === 'string' 
          ? new Date(jugadorData.fecha_nacimiento) 
          : jugadorData.fecha_nacimiento)
        : undefined;

      if (selectedJugador) {
        // Editar jugador existente
        const updateData: UpdateJugadorRequest = {
          nombre: jugadorData.nombre,
          apellido: jugadorData.apellido,
          email: jugadorData.email,
          documento: jugadorData.documento,
          telefono: jugadorData.telefono,
          fecha_nacimiento: fechaNacimiento,
          posicion: jugadorData.posicion,
          numero_camiseta: jugadorData.numero_camiseta,
          activo: jugadorData.activo,
        };
        
        // Solo incluir password si se proporcionó
        if (jugadorData.password) {
          updateData.password = jugadorData.password;
        }
        
        await updateJugador(selectedJugador.id!, updateData);
      } else {
        // Crear nuevo jugador - password es requerido
        if (!jugadorData.password) {
          alert('La contraseña es requerida para crear un nuevo jugador');
          setIsSubmitting(false);
          return;
        }
        
        const createData: CreateJugadorRequest = {
          email: jugadorData.email,
          password: jugadorData.password,
          nombre: jugadorData.nombre,
          apellido: jugadorData.apellido,
          documento: jugadorData.documento,
          telefono: jugadorData.telefono,
          fecha_nacimiento: fechaNacimiento,
          posicion: jugadorData.posicion,
          numero_camiseta: jugadorData.numero_camiseta,
          activo: jugadorData.activo,
        };
        
        await createJugador(createData);
      }
      await refetch();
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar jugador:', error);
      alert('Error al guardar el jugador. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este jugador?')) {
      try {
        await deleteJugador(id);
        await refetch();
      } catch (error) {
        console.error('Error al eliminar jugador:', error);
      }
    }
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
          <button className="btn btn-success" onClick={() => handleOpenModal()}>
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
                  <th>Documento</th>
                  <th>Email</th>
                  <th>Fecha de Nacimiento</th>
                  <th>Posición</th>
                  <th>Nº Camiseta</th>
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
                    <td className="dni">{jugador.documento || '-'}</td>
                    <td className="email">{jugador.email}</td>
                    <td className="fecha">
                      {jugador.fecha_nacimiento ? formatFecha(jugador.fecha_nacimiento) : '-'}
                    </td>
                    <td>{jugador.posicion || '-'}</td>
                    <td>{jugador.numero_camiseta || '-'}</td>
                    {(canEdit('jugadores') || canDelete('jugadores')) && (
                      <td className="acciones">
                        <ProtectedAction resource="jugadores" action="edit">
                          <button 
                            className="btn-icon btn-edit" 
                            title="Editar"
                            onClick={() => handleOpenModal(jugador)}
                          >
                            ✏️
                          </button>
                        </ProtectedAction>
                        <ProtectedAction resource="jugadores" action="delete">
                          <button 
                            className="btn-icon btn-delete" 
                            title="Eliminar"
                            onClick={() => handleDelete(jugador.id!)}
                          >
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
            <button 
              className="btn btn-primary"
              onClick={() => handleOpenModal()}
            >
              ➕ Agregar Primer Jugador
            </button>
          </div>
        </div>
      )}

      <ModalAgregarJugador
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        jugador={selectedJugador}
      />
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { torneosService } from '../services/torneoService';
import { partidoService } from '../services/partidoService';
import { Torneo, Equipo, Partido } from '../types';
import './TorneoDetallePage.css';
import ModalAgregarEquipoTorneo from '../components/modals/ModalAgregarEquipoTorneo';
import { ModalEditarResultado } from '../components/modals/ModalEditarResultado';
import { usePermissions } from '../hooks/usePermissions';

interface DivisionInfo {
  id?: number;
  nombre?: string;
}

interface EquipoInscripto extends Equipo {
  inscripcionId?: number;
  fechaInscripcion?: Date | string;
  division?: DivisionInfo | null;
}

const TorneoDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEdit } = usePermissions();
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [equipos, setEquipos] = useState<EquipoInscripto[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<Partido | null>(null);
  const [showResultadoModal, setShowResultadoModal] = useState(false);
  const [removiendoInscripcionId, setRemoviendoInscripcionId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchTorneoYEquipos();
    }
  }, [id]);

  const fetchTorneoYEquipos = async () => {
    try {
      setLoading(true);
      setError(null);

      const [torneoRes, equiposRes, partidosRes] = await Promise.all([
        torneosService.getTorneoById(Number(id)),
        torneosService.getEquiposByTorneo(Number(id)),
        partidoService.getPartidosByTorneo(Number(id)),
      ]);

      console.log('📊 Datos recibidos:', { 
        torneo: torneoRes, 
        equipos: equiposRes, 
        partidos: partidosRes 
      });

      if (torneoRes.success && torneoRes.data) {
        setTorneo(torneoRes.data);
      } else {
        setError(torneoRes.message || 'Error al cargar el torneo');
      }

      if (equiposRes.success && equiposRes.data) {
        setEquipos(equiposRes.data);
        console.log('👥 Equipos cargados:', equiposRes.data.length);
      }

      if (partidosRes.success && partidosRes.data) {
        setPartidos(partidosRes.data);
        console.log('⚽ Partidos cargados:', partidosRes.data.length, partidosRes.data);
      } else {
        console.log('⚠️ No se cargaron partidos:', partidosRes);
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarEquipo = async (equipoId: number) => {
    const response = await torneosService.agregarEquipoAlTorneo(Number(id), equipoId);
    if (!response.success) {
      throw new Error(response.message || 'Error al agregar equipo');
    }
    await fetchTorneoYEquipos();
  };

  const handleActualizarResultado = async (golesEquipo1: number, golesEquipo2: number) => {
    if (!partidoSeleccionado) return;
    
    const response = await partidoService.actualizarResultado(
      partidoSeleccionado.id,
      golesEquipo1,
      golesEquipo2
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Error al actualizar resultado');
    }
    
    await fetchTorneoYEquipos();
  };

  const handleDarDeBajaEquipo = async (inscripcionId?: number, nombreEquipo?: string) => {
    if (!inscripcionId) {
      setError('No se pudo identificar la inscripcion del equipo.');
      return;
    }

    const confirmar = window.confirm(
      `¿Dar de baja a ${nombreEquipo || 'este equipo'} del torneo?`
    );
    if (!confirmar) return;

    try {
      setRemoviendoInscripcionId(inscripcionId);
      setError(null);
      const response = await torneosService.darDeBajaEquipoDelTorneo(inscripcionId);
      if (!response.success) {
        throw new Error(response.message || 'No se pudo dar de baja el equipo');
      }
      await fetchTorneoYEquipos();
    } catch (err: any) {
      console.error('Error al dar de baja equipo:', err);
      setError(err.response?.data?.message || err.message || 'Error al dar de baja el equipo');
    } finally {
      setRemoviendoInscripcionId(null);
    }
  };

  const handleClickPartido = (partido: Partido) => {
    if (canEdit('torneos') && partido.equipo1 && partido.equipo2) {
      setPartidoSeleccionado(partido);
      setShowResultadoModal(true);
    }
  };

  // Usar la cantidad de equipos configurada en el torneo (no calcular hitos)
  const cantidadConfigurada = torneo?.cantidad_equipos || 16;
  const torneoCompleto = equipos.length === cantidadConfigurada;

  // Organizar partidos por fase
  const partidosOctavos = partidos.filter(p => p.fase === 'octavos').sort((a, b) => (a.numeroPartido || 0) - (b.numeroPartido || 0));
  const partidosCuartos = partidos.filter(p => p.fase === 'cuartos').sort((a, b) => (a.numeroPartido || 0) - (b.numeroPartido || 0));
  const partidosSemifinal = partidos.filter(p => p.fase === 'semifinal').sort((a, b) => (a.numeroPartido || 0) - (b.numeroPartido || 0));
  const partidoFinal = partidos.find(p => p.fase === 'final');

  if (loading) {
    return <div className="loading-container">Cargando...</div>;
  }

  if (error || !torneo) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || 'Torneo no encontrado'}</p>
        <button onClick={() => navigate('/torneos')} className="btn btn-primary">
          Volver a Torneos
        </button>
      </div>
    );
  }

  const handleGenerarLlave = async (event?: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    if (!torneo || !id) return;

    // Confirmar con el usuario antes de generar la llave
    const confirmar = window.confirm(
      `¿Generar la llave de partidos para el torneo "${torneo.nombre}" con ${equipos.length} equipos? Esta acción creará los enfrentamientos y no podrá revertirse fácilmente.`
    );
    if (!confirmar) return;

    try {
      setLoading(true);
      setError(null);

      // Llamada directa al backend para generar la llave (evita usar un método no existente en torneosService)
      const res = await fetch(`/api/torneos/${id}/generar-llave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await res.json();

      if (!response || !response.success) {
        const msg = response?.message || 'Error al generar la llave del torneo';
        setError(msg);
        return;
      }

      // Recargar datos para obtener los partidos generados
      await fetchTorneoYEquipos();
    } catch (err: any) {
      console.error('Error al generar la llave:', err);
      setError(err?.response?.data?.message || 'Error al generar la llave del torneo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="torneo-detalle-page">
      <div className="page-header">
        <button onClick={() => navigate('/torneos')} className="btn-back">
          ← Volver
        </button>
        <h1>{torneo.nombre}</h1>
      </div>

      <div className="actions-bar">
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
          disabled={equipos.length >= cantidadConfigurada}
        >
          {equipos.length >= cantidadConfigurada ? 'Máximo de equipos alcanzado' : '+ Inscribir Equipo'}
        </button>
        {canEdit('torneos') && torneoCompleto && partidos.length === 0 && (
          <button
            onClick={handleGenerarLlave}
            className="btn btn-success"
          >
            🏆 Generar Llave de Partidos
          </button>
        )}
      </div>

      <div className="torneo-info-card">
        <div className="info-row">
          <span className="info-label">Tipo:</span>
          <span className="info-value">{torneo.tipo}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Modalidad:</span>
          <span className="info-value">{torneo.modalidad}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Fecha Inicio:</span>
          <span className="info-value">
            {new Date(torneo.fecha_inicio).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Fecha Fin:</span>
          <span className="info-value">
            {new Date(torneo.fecha_fin).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Estado:</span>
          <span className={`info-value badge badge-${torneo.estado}`}>{torneo.estado}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Equipos inscritos:</span>
          <span className={`info-value ${torneoCompleto ? 'complete' : 'incomplete'}`}>
            {equipos.length} / {cantidadConfigurada}
            {torneoCompleto ? ' ✓ Completo' : ` (faltan ${cantidadConfigurada - equipos.length} para generar llave)`}
          </span>
        </div>
      </div>

      {!torneoCompleto ? (
        <div className="warning-message">
          ⚠️ Se necesitan {cantidadConfigurada - equipos.length} equipo(s) más para alcanzar {cantidadConfigurada} equipos y generar la llave
        </div>
      ) : (
        <div className="success-message">✅ Llave de torneo lista - {equipos.length} equipos inscritos</div>
      )}

      {torneoCompleto && partidos.length === 0 && (
        <div className="info-message">
          ℹ️ Haz clic en "🏆 Generar Llave de Partidos" para crear los enfrentamientos.
        </div>
      )}
      <div className="equipos-inscritos-card">
        <h2>Equipos inscriptos ({equipos.length})</h2>
        {equipos.length === 0 ? (
          <p className="equipos-empty">Todavia no hay equipos inscriptos en este torneo.</p>
        ) : (
          <div className="equipos-list">
            {equipos.map((equipo) => (
              <div key={equipo.inscripcionId || equipo.id} className="equipo-item">
                <div className="equipo-main">
                  <span className="equipo-nombre">{equipo.nombre}</span>
                  {equipo.sigla && <span className="equipo-sigla">({equipo.sigla})</span>}
                </div>
                <div className="equipo-meta">
                  {equipo.division?.nombre && (
                    <span className="equipo-badge">Division: {equipo.division.nombre}</span>
                  )}
                  {equipo.fechaInscripcion && (
                    <span className="equipo-fecha">
                      Inscripto: {new Date(equipo.fechaInscripcion).toLocaleDateString('es-ES')}
                    </span>
                  )}
                  {canEdit('torneos') && (
                    <button
                      type="button"
                      className="btn-baja-equipo"
                      disabled={!equipo.inscripcionId || removiendoInscripcionId === equipo.inscripcionId}
                      onClick={() => handleDarDeBajaEquipo(equipo.inscripcionId, equipo.nombre)}
                    >
                      {removiendoInscripcionId === equipo.inscripcionId ? 'Dando de baja...' : 'Dar de baja'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {partidos.length > 0 ? (
        <div className="bracket-container">
          <h2 className="bracket-title">Llave del Torneo</h2>

          <div className="bracket-grid">
            {/* Octavos de Final - Solo si existen */}
            {partidosOctavos.length > 0 && (
              <div className="bracket-round">
                <h3 className="round-title">Octavos de Final</h3>
                <div className="matches">
                  {partidosOctavos.map((partido) => (
                    <div 
                      key={partido.id} 
                      className={`match-card ${partido.estado === 'finalizado' ? 'finished' : partido.equipo1 && partido.equipo2 ? 'clickable' : 'future-match'}`}
                      onClick={() => handleClickPartido(partido)}
                      style={{ cursor: canEdit('torneos') && partido.equipo1 && partido.equipo2 ? 'pointer' : 'default' }}
                    >
                      <div className="match-header">
                        Partido {partido.numeroPartido}
                        {partido.estado === 'finalizado' && ' ✅'}
                      </div>
                      <div className="match-teams">
                        <div className={`team ${partido.equipo1 ? (partido.equipoGanador === partido.equipo1.id ? 'winner' : 'filled') : 'empty'}`}>
                          <span className="team-number">1</span>
                          <span className="team-name">
                            {partido.equipo1?.nombre || 'Por definir'}
                          </span>
                          {partido.estado === 'finalizado' && (
                            <span className="team-score">{partido.golesEquipo1}</span>
                          )}
                        </div>
                        <div className="vs-divider">VS</div>
                        <div className={`team ${partido.equipo2 ? (partido.equipoGanador === partido.equipo2.id ? 'winner' : 'filled') : 'empty'}`}>
                          <span className="team-number">2</span>
                          <span className="team-name">
                            {partido.equipo2?.nombre || 'Por definir'}
                          </span>
                          {partido.estado === 'finalizado' && (
                            <span className="team-score">{partido.golesEquipo2}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cuartos de Final - Solo si existen */}
            {partidosCuartos.length > 0 && (
              <div className="bracket-round">
                <h3 className="round-title">Cuartos de Final</h3>
                <div className="matches">
                  {partidosCuartos.map((partido) => (
                    <div 
                      key={partido.id} 
                      className={`match-card ${partido.estado === 'finalizado' ? 'finished' : partido.equipo1 && partido.equipo2 ? 'clickable' : 'future-match'}`}
                      onClick={() => handleClickPartido(partido)}
                      style={{ cursor: canEdit('torneos') && partido.equipo1 && partido.equipo2 ? 'pointer' : 'default' }}
                    >
                      <div className="match-header">
                        Partido {partido.numeroPartido}
                        {partido.estado === 'finalizado' && ' ✅'}
                      </div>
                      <div className="match-teams">
                        <div className={`team ${partido.equipo1 ? (partido.equipoGanador === partido.equipo1.id ? 'winner' : 'filled') : 'empty'}`}>
                          <span className="team-name">
                            {partido.equipo1?.nombre || 'Por definir'}
                          </span>
                          {partido.estado === 'finalizado' && (
                            <span className="team-score">{partido.golesEquipo1}</span>
                          )}
                        </div>
                        <div className="vs-divider">VS</div>
                        <div className={`team ${partido.equipo2 ? (partido.equipoGanador === partido.equipo2.id ? 'winner' : 'filled') : 'empty'}`}>
                          <span className="team-name">
                            {partido.equipo2?.nombre || 'Por definir'}
                          </span>
                          {partido.estado === 'finalizado' && (
                            <span className="team-score">{partido.golesEquipo2}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Semifinal - Mostrar todos los partidos de semifinal */}
            {partidosSemifinal.length > 0 && (
              <div className="bracket-round">
                <h3 className="round-title">Semifinal</h3>
                <div className="matches">
                  {partidosSemifinal.map((partido) => (
                    <div 
                      key={partido.id}
                      className={`match-card ${partido.estado === 'finalizado' ? 'finished' : partido.equipo1 && partido.equipo2 ? 'clickable' : 'future-match'}`}
                      onClick={() => handleClickPartido(partido)}
                      style={{ cursor: canEdit('torneos') && partido.equipo1 && partido.equipo2 ? 'pointer' : 'default' }}
                    >
                      <div className="match-header">
                        Partido {partido.numeroPartido}
                        {partido.estado === 'finalizado' && ' ✅'}
                      </div>
                      <div className="match-teams">
                        <div className={`team ${partido.equipo1 ? (partido.equipoGanador === partido.equipo1.id ? 'winner' : 'filled') : 'empty'}`}>
                          <span className="team-name">
                            {partido.equipo1?.nombre || 'Por definir'}
                          </span>
                          {partido.estado === 'finalizado' && (
                            <span className="team-score">{partido.golesEquipo1}</span>
                          )}
                        </div>
                        <div className="vs-divider">VS</div>
                        <div className={`team ${partido.equipo2 ? (partido.equipoGanador === partido.equipo2.id ? 'winner' : 'filled') : 'empty'}`}>
                          <span className="team-name">
                            {partido.equipo2?.nombre || 'Por definir'}
                          </span>
                          {partido.estado === 'finalizado' && (
                            <span className="team-score">{partido.golesEquipo2}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final */}
            <div className="bracket-round final-round">
              <h3 className="round-title">Final</h3>
              <div className="matches">
                {partidoFinal && (
                  <div 
                    className={`match-card final-match ${partidoFinal.estado === 'finalizado' ? 'finished' : partidoFinal.equipo1 && partidoFinal.equipo2 ? 'clickable' : 'future-match'}`}
                    onClick={() => handleClickPartido(partidoFinal)}
                    style={{ cursor: canEdit('torneos') && partidoFinal.equipo1 && partidoFinal.equipo2 ? 'pointer' : 'default' }}
                  >
                    <div className="match-header">
                      🏆 Final
                      {partidoFinal.estado === 'finalizado' && ' ✅'}
                    </div>
                    <div className="match-teams">
                      <div className={`team ${partidoFinal.equipo1 ? (partidoFinal.equipoGanador === partidoFinal.equipo1.id ? 'winner' : 'filled') : 'empty'}`}>
                        <span className="team-name">
                          {partidoFinal.equipo1?.nombre || 'Por definir'}
                        </span>
                        {partidoFinal.estado === 'finalizado' && (
                          <span className="team-score">{partidoFinal.golesEquipo1}</span>
                        )}
                      </div>
                      <div className="vs-divider">VS</div>
                      <div className={`team ${partidoFinal.equipo2 ? (partidoFinal.equipoGanador === partidoFinal.equipo2.id ? 'winner' : 'filled') : 'empty'}`}>
                        <span className="team-name">
                          {partidoFinal.equipo2?.nombre || 'Por definir'}
                        </span>
                        {partidoFinal.estado === 'finalizado' && (
                          <span className="team-score">{partidoFinal.golesEquipo2}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : equipos.length === 8 ? (
        <div className="info-message">
          ⏳ Generando llave de partidos...
        </div>
      ) : null}

      {showModal && (
        <ModalAgregarEquipoTorneo
          torneoId={Number(id)}
          onClose={() => setShowModal(false)}
          onSubmit={handleAgregarEquipo}
        />
      )}

      {showResultadoModal && partidoSeleccionado && (
        <ModalEditarResultado
          isOpen={showResultadoModal}
          onClose={() => {
            setShowResultadoModal(false);
            setPartidoSeleccionado(null);
          }}
          onSubmit={handleActualizarResultado}
          partido={partidoSeleccionado}
        />
      )}
    </div>
  );
};

export default TorneoDetallePage;


import { Request, Response } from 'express';
import { getORM, checkConnection } from '../shared/db/mikro-orm.config';
import { Partido } from '../models/partido.model';
import { Torneo } from '../models/torneo.model';
import { Equipo } from '../models/equipo.model';
import { Usuario } from '../models/usuario.model';
import { Sede } from '../models/sede.model';

// Reutilizamos la función de reintento
const retryDatabaseOperation = async <T>(operation: () => Promise<T>, maxRetries = 3, delay = 2000): Promise<T> => {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const isConnected = await checkConnection();
      if (!isConnected) throw new Error('No hay conexión a la base de datos');
      return await operation();
    } catch (error: any) {
      console.error(`❌ Error en intento ${i}/${maxRetries}:`, error.message);
      if (i === maxRetries) throw error;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('No se pudo completar la operación después de múltiples intentos');
};

export class PartidoController {

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        return await em.find(Partido, {}, { populate: ['torneo', 'equipo1', 'equipo2', 'sede', 'arbitro'] });
      });

      res.status(200).json({ success: true, data: result, message: 'Partidos obtenidos exitosamente' });
    } catch (error) {
      console.error('Error al obtener partidos:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        return await em.findOne(Partido, { id: parseInt(id) }, { populate: ['torneo', 'equipo1', 'equipo2', 'sede', 'arbitro'] });
      });

      if (!result) {
        res.status(404).json({ success: false, message: 'Partido no encontrado' });
        return;
      }

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Error al obtener partido:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { torneo_id, equipo1_id, equipo2_id, sede_id, arbitro_id, fecha, estado } = req.body;

      if (!torneo_id || !equipo1_id || !equipo2_id) {
        res.status(400).json({ success: false, message: 'Torneo y equipos son obligatorios' });
        return;
      }

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        const torneo = await em.findOneOrFail(Torneo, { id: torneo_id });
        const equipo1 = await em.findOneOrFail(Equipo, { id: equipo1_id });
        const equipo2 = await em.findOneOrFail(Equipo, { id: equipo2_id });

        const partido = new Partido();
        partido.torneo = torneo;
        partido.equipo1 = equipo1;
        partido.equipo2 = equipo2;
        partido.golesEquipo1 = 0;
        partido.golesEquipo2 = 0;
        if (sede_id) {
          const sede = await em.findOne(Sede, { id: sede_id });
          if (sede) partido.sede = sede;
        }
        if (arbitro_id) {
          const arbitro = await em.findOne(Usuario, { id: arbitro_id });
          if (arbitro) partido.arbitro = arbitro;
        }
        if (fecha) partido.fecha = new Date(fecha);
        if (estado) partido.estado = estado;

        await em.persistAndFlush(partido);
        return partido;
      });

      res.status(201).json({ success: true, data: result, message: 'Partido creado exitosamente' });
    } catch (error: any) {
      console.error('Error al crear partido:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { sede_id, arbitro_id, fecha, estado, goles_equipo1, goles_equipo2 } = req.body;

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        const partido = await em.findOneOrFail(Partido, { id: parseInt(id) });

        if (sede_id) {
          const sede = await em.findOne(Sede, { id: sede_id });
          if (sede) partido.sede = sede;
        }
        if (arbitro_id) {
          const arbitro = await em.findOne(Usuario, { id: arbitro_id });
          if (arbitro) partido.arbitro = arbitro;
        }
        if (fecha) partido.fecha = new Date(fecha);
        if (estado) partido.estado = estado;
        if (goles_equipo1 !== undefined) partido.golesEquipo1 = goles_equipo1;
        if (goles_equipo2 !== undefined) partido.golesEquipo2 = goles_equipo2;

        await em.persistAndFlush(partido);
        return partido;
      });

      res.status(200).json({ success: true, data: result, message: 'Partido actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar partido:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        const partido = await em.findOneOrFail(Partido, { id: parseInt(id) });
        await em.removeAndFlush(partido);
      });

      res.status(200).json({ success: true, message: 'Partido eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar partido:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // GET /api/torneos/:id/partidos - Obtener todos los partidos de un torneo
  static async getPartidosByTorneo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        
        const partidos = await em.find(
          Partido,
          { torneo: parseInt(id) },
          { 
            populate: ['equipo1', 'equipo2', 'partidoSiguiente'],
            orderBy: { fase: 'ASC', numeroPartido: 'ASC' }
          }
        );
        
        return partidos;
      });

      res.status(200).json({ 
        success: true, 
        data: result,
        message: 'Partidos del torneo obtenidos exitosamente' 
      });
    } catch (error) {
      console.error('Error al obtener partidos del torneo:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // PUT /api/partidos/:id/resultado - Actualizar resultado del partido
  static async actualizarResultado(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { golesEquipo1, golesEquipo2 } = req.body;

      if (golesEquipo1 === undefined || golesEquipo2 === undefined) {
        res.status(400).json({ 
          success: false, 
          message: 'Se requieren los goles de ambos equipos' 
        });
        return;
      }

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        
        const partido = await em.findOne(
          Partido, 
          { id: parseInt(id) },
          { populate: ['equipo1', 'equipo2', 'partidoSiguiente'] }
        );

        if (!partido) {
          throw new Error('Partido no encontrado');
        }

        // Actualizar resultado
        partido.golesEquipo1 = golesEquipo1;
        partido.golesEquipo2 = golesEquipo2;
        partido.estado = 'finalizado';

        // Determinar ganador
        let ganadorId: number | undefined;
        let equipoGanador: Equipo | undefined;

        if (golesEquipo1 > golesEquipo2) {
          ganadorId = partido.equipo1?.id;
          equipoGanador = partido.equipo1;
        } else if (golesEquipo2 > golesEquipo1) {
          ganadorId = partido.equipo2?.id;
          equipoGanador = partido.equipo2;
        }

        partido.equipoGanador = ganadorId;

        // Si hay ganador y hay partido siguiente, avanzar el equipo
        if (equipoGanador && partido.partidoSiguiente) {
          const siguientePartido = await em.findOne(
            Partido,
            { id: partido.partidoSiguiente.id }
          );

          if (siguientePartido) {
            if (partido.posicionEnSiguiente === 1) {
              siguientePartido.equipo1 = equipoGanador;
            } else if (partido.posicionEnSiguiente === 2) {
              siguientePartido.equipo2 = equipoGanador;
            }
            await em.persistAndFlush(siguientePartido);
          }
        }

        await em.persistAndFlush(partido);
        
        // Recargar con relaciones
        await em.populate(partido, ['equipo1', 'equipo2', 'partidoSiguiente']);
        
        return partido;
      });

      res.status(200).json({ 
        success: true, 
        data: result,
        message: 'Resultado actualizado exitosamente' 
      });
    } catch (error: any) {
      console.error('Error al actualizar resultado:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Error interno del servidor' 
      });
    }
  }
}

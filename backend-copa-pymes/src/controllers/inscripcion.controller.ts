import { Request, Response } from "express";
import { getORM, checkConnection } from "../shared/db/mikro-orm.config";
import { Inscripcion } from "../models/inscripcion.model";
import { Torneo } from "../models/torneo.model";
import { Equipo } from "../models/equipo.model";
import { Partido } from "../models/partido.model";
import { SqlEntityManager } from "@mikro-orm/mysql";

// Función auxiliar para reintentar operaciones con base de datos
const retryDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const isConnected = await checkConnection();
      if (!isConnected) throw new Error("No hay conexión a la base de datos");
      return await operation();
    } catch (error: any) {
      console.error(`❌ Intento ${attempt}/${maxRetries} falló:`, error.message);

      if (attempt === maxRetries) throw error;

      if (
        error.code === "ETIMEDOUT" ||
        error.code === "ECONNRESET" ||
        error.code === "ENOTFOUND" ||
        error.message.includes("connect") ||
        error.message.includes("timeout")
      ) {
        console.log(`⏳ Reintentando en ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 1.5;
        continue;
      }

      throw error;
    }
  }
  throw new Error("No se pudo completar la operación después de múltiples intentos");
};

// Función para generar la llave de partidos (octavos de final)
const generarLlavePartidos = async (em: SqlEntityManager, torneo: Torneo, equipos: Equipo[]) => {
  console.log(`🏆 Generando llave de partidos para torneo ${torneo.nombre}...`);
  
  // Crear partidos de octavos de final (4 partidos)
  const partidosOctavos: Partido[] = [];
  
  for (let i = 0; i < 4; i++) {
    const partido = em.create(Partido, {
      torneo,
      equipo1: equipos[i * 2],
      equipo2: equipos[i * 2 + 1],
      fase: 'octavos',
      numeroPartido: i + 1,
      estado: 'pendiente',
    });
    partidosOctavos.push(partido);
  }

  // Crear partidos de cuartos de final (2 partidos)
  const partidosCuartos: Partido[] = [];
  
  for (let i = 0; i < 2; i++) {
    const partido = em.create(Partido, {
      torneo,
      fase: 'cuartos',
      numeroPartido: i + 1,
      estado: 'pendiente',
    });
    partidosCuartos.push(partido);
  }

  // Crear semifinal (1 partido)
  const partidoSemifinal = em.create(Partido, {
    torneo,
    fase: 'semifinal',
    numeroPartido: 1,
    estado: 'pendiente',
  });

  // Crear final (1 partido)
  const partidoFinal = em.create(Partido, {
    torneo,
    fase: 'final',
    numeroPartido: 1,
    estado: 'pendiente',
  });

  // Establecer relaciones de avance
  // Octavos -> Cuartos
  partidosOctavos[0].partidoSiguiente = partidosCuartos[0];
  partidosOctavos[0].posicionEnSiguiente = 1;
  
  partidosOctavos[1].partidoSiguiente = partidosCuartos[0];
  partidosOctavos[1].posicionEnSiguiente = 2;
  
  partidosOctavos[2].partidoSiguiente = partidosCuartos[1];
  partidosOctavos[2].posicionEnSiguiente = 1;
  
  partidosOctavos[3].partidoSiguiente = partidosCuartos[1];
  partidosOctavos[3].posicionEnSiguiente = 2;

  // Cuartos -> Semifinal
  partidosCuartos[0].partidoSiguiente = partidoSemifinal;
  partidosCuartos[0].posicionEnSiguiente = 1;
  
  partidosCuartos[1].partidoSiguiente = partidoSemifinal;
  partidosCuartos[1].posicionEnSiguiente = 2;

  // Semifinal -> Final
  partidoSemifinal.partidoSiguiente = partidoFinal;

  // Persistir todos los partidos
  await em.persistAndFlush([
    ...partidosOctavos,
    ...partidosCuartos,
    partidoSemifinal,
    partidoFinal,
  ]);

  console.log(`✅ Llave generada: 8 partidos creados (4 octavos + 2 cuartos + 1 semifinal + 1 final)`);
  
  return {
    octavos: partidosOctavos,
    cuartos: partidosCuartos,
    semifinal: partidoSemifinal,
    final: partidoFinal,
  };
};

export class InscripcionController {
  // Crear inscripción (agregar equipo al torneo)
  // Se llama desde POST /api/torneos/:id/equipos
  static async create(req: Request, res: Response) {
    try {
      const torneoId = req.params.id; // Obtener torneoId de params
      const { equipoId } = req.body;

      if (!torneoId || !equipoId) {
        return res.status(400).json({
          success: false,
          message: "equipoId es requerido",
        });
      }

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork() as SqlEntityManager;

        // Verificar que el torneo existe
        const torneo = await em.findOne(Torneo, { id: parseInt(torneoId) });
        if (!torneo) {
          throw new Error("Torneo no encontrado");
        }

        // Verificar que el equipo existe
        const equipo = await em.findOne(Equipo, { id: parseInt(equipoId) });
        if (!equipo) {
          throw new Error("Equipo no encontrado");
        }

        // Contar jugadores del equipo
        const jugadoresCount = await em.count('Jugador', { equipo: parseInt(equipoId) });
        
        if (jugadoresCount < 14) {
          throw new Error(`El equipo debe tener al menos 14 jugadores. Actualmente tiene ${jugadoresCount} jugador(es)`);
        }

        // Verificar que el equipo no esté ya inscrito
        const inscripcionExistente = await em.findOne(Inscripcion, {
          torneo: parseInt(torneoId),
          equipo: parseInt(equipoId),
        });

        if (inscripcionExistente) {
          throw new Error("El equipo ya está inscrito en este torneo");
        }

        // Verificar que no haya más de 8 equipos
        const equiposInscritos = await em.count(Inscripcion, { torneo: parseInt(torneoId) });
        if (equiposInscritos >= 8) {
          throw new Error("El torneo ya tiene el máximo de 8 equipos inscritos");
        }

        // Crear inscripción
        const inscripcion = new Inscripcion();
        inscripcion.torneo = torneo;
        inscripcion.equipo = equipo;
        inscripcion.estado = "aceptada";
        inscripcion.fechaInscripcion = new Date();

        await em.persistAndFlush(inscripcion);
        
        // Si es el 8vo equipo, generar la llave de partidos
        const totalEquipos = equiposInscritos + 1;
        if (totalEquipos === 8) {
          console.log('🎯 Torneo completo con 8 equipos! Generando llave de partidos...');
          
          // Obtener todos los equipos inscritos
          const inscripciones = await em.find(Inscripcion, 
            { torneo: parseInt(torneoId) },
            { populate: ['equipo'] }
          );
          
          const equipos = inscripciones.map(insc => insc.equipo);
          
          // Generar llave
          await generarLlavePartidos(em, torneo, equipos);
        }
        
        // Retornar con equipo populado
        await em.populate(inscripcion, ["equipo", "torneo"]);
        
        return { inscripcion, llaveGenerada: totalEquipos === 8 };
      });

      const mensaje = result.llaveGenerada 
        ? "Equipo agregado exitosamente. ¡Torneo completo! La llave de partidos ha sido generada."
        : "Equipo agregado al torneo exitosamente";

      res.status(201).json({
        success: true,
        data: result.inscripcion,
        llaveGenerada: result.llaveGenerada,
        message: mensaje,
      });
    } catch (error: any) {
      console.error("Error al crear inscripción:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Error al agregar equipo al torneo",
      });
    }
  }

  // Listar inscripciones (opcional por torneo o equipo)
  static async getByTorneoEquipo(req: Request, res: Response) {
    try {
      const { torneoId, equipoId } = req.query;

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork() as SqlEntityManager;

        const filtro: any = {};
        if (torneoId) filtro.torneo = parseInt(torneoId as string);
        if (equipoId) filtro.equipo = parseInt(equipoId as string);

        return await em.find(Inscripcion, filtro, { populate: ["torneo", "equipo"] });
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error al listar inscripciones:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  }

  // Cambiar estado de inscripción
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!["pendiente", "aceptada", "rechazada"].includes(estado)) {
        return res.status(400).json({ success: false, message: "Estado inválido" });
      }

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork() as SqlEntityManager;

        const inscripcion = await em.findOne(Inscripcion, { id: parseInt(id) });
        if (!inscripcion) throw new Error("Inscripción no encontrada");

        inscripcion.estado = estado as "pendiente" | "aceptada" | "rechazada";
        await em.persistAndFlush(inscripcion);
        return inscripcion;
      });

      res.status(200).json({ success: true, data: result, message: "Estado actualizado" });
    } catch (error: any) {
      console.error("Error al cambiar estado:", error);
      if (error.message === "Inscripción no encontrada") {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  }

  // Eliminar inscripción
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork() as SqlEntityManager;

        const inscripcion = await em.findOne(Inscripcion, { id: parseInt(id) });
        if (!inscripcion) throw new Error("Inscripción no encontrada");

        await em.removeAndFlush(inscripcion);
      });

      res.status(200).json({ success: true, message: "Inscripción eliminada" });
    } catch (error: any) {
      console.error("Error al eliminar inscripción:", error);
      if (error.message === "Inscripción no encontrada") {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  }

  // GET /api/torneos/:id/equipos - Obtener equipos inscritos en un torneo
  static async getEquiposByTorneo(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork() as SqlEntityManager;

        const inscripciones = await em.find(
          Inscripcion,
          { torneo: parseInt(id) },
          { populate: ["equipo"] }
        );

        return inscripciones.map((insc) => ({
          ...insc.equipo,
          inscripcionId: insc.id,
          fechaInscripcion: insc.fechaInscripcion,
        }));
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Equipos del torneo obtenidos exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener equipos del torneo:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  // GET /api/torneos/:id/equipos-disponibles - Obtener equipos disponibles para inscribir
  static async getEquiposDisponibles(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork() as SqlEntityManager;

        // Obtener IDs de equipos ya inscritos
        const equiposInscritos = await em.find(Inscripcion, {
          torneo: parseInt(id),
        });
        const idsInscritos = equiposInscritos.map((insc) => insc.equipo.id);

        // Obtener todos los equipos activos
        const equipos = await em.find(Equipo, { estado: true });

        // Filtrar y agregar información de jugadores
        const equiposConJugadores = await Promise.all(
          equipos.map(async (equipo) => {
            const jugadoresCount = await em.count('Jugador', {
              equipo: equipo.id,
            });

            return {
              ...equipo,
              jugadoresCount,
              cumpleRequisito: jugadoresCount >= 14,
              yaInscrito: idsInscritos.includes(equipo.id),
            };
          })
        );

        // Retornar solo los que no están inscritos
        return equiposConJugadores.filter((e) => !e.yaInscrito);
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Equipos disponibles obtenidos exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener equipos disponibles:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}

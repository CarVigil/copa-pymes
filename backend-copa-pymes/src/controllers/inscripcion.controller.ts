import { Request, Response } from "express";
import { getORM, checkConnection } from "../shared/db/mikro-orm.config";
import { Inscripcion } from "../models/inscripcion.model";
import { Torneo } from "../models/torneo.model";
import { Equipo } from "../models/equipo.model";
import { Partido } from "../models/partido.model";
import { Division } from "../models/division.model";
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

// Función para generar la llave de partidos adaptada a la cantidad de equipos
const generarLlavePartidos = async (em: SqlEntityManager, torneo: Torneo, equipos: Equipo[]) => {
  console.log(`🏆 Generando llave de partidos para torneo ${torneo.nombre} con ${equipos.length} equipos...`);
  
  const cantidadEquipos = equipos.length;
  const todosLosPartidos: Partido[] = [];
  
  // Validar que sea potencia de 2
  if (![4, 8, 16].includes(cantidadEquipos)) {
    throw new Error(`El torneo debe tener 4, 8 o 16 equipos. Actualmente tiene ${cantidadEquipos}`);
  }

  // CREAR LA FINAL (siempre existe)
  const partidoFinal = em.create(Partido, {
    torneo,
    fase: 'final',
    numeroPartido: 1,
    estado: 'pendiente',
  });
  todosLosPartidos.push(partidoFinal);

  // CREAR LA SEMIFINAL (siempre existe para 4, 8, 16 equipos)
  const partidosSemifinal: Partido[] = [];
  for (let i = 0; i < 2; i++) {
    const partido = em.create(Partido, {
      torneo,
      fase: 'semifinal',
      numeroPartido: i + 1,
      estado: 'pendiente',
      partidoSiguiente: partidoFinal,
      posicionEnSiguiente: i + 1,
    });
    partidosSemifinal.push(partido);
    todosLosPartidos.push(partido);
  }

  // Si hay 4 equipos, asignarlos directamente a las semifinales
  if (cantidadEquipos === 4) {
    partidosSemifinal[0].equipo1 = equipos[0];
    partidosSemifinal[0].equipo2 = equipos[1];
    partidosSemifinal[1].equipo1 = equipos[2];
    partidosSemifinal[1].equipo2 = equipos[3];
    
    console.log(`✅ Llave generada: 3 partidos (2 semifinales + 1 final) para 4 equipos`);
  }
  // Si hay 8 equipos, crear cuartos de final
  else if (cantidadEquipos === 8) {
    const partidosCuartos: Partido[] = [];
    for (let i = 0; i < 4; i++) {
      const partido = em.create(Partido, {
        torneo,
        equipo1: equipos[i * 2],
        equipo2: equipos[i * 2 + 1],
        fase: 'cuartos',
        numeroPartido: i + 1,
        estado: 'pendiente',
        partidoSiguiente: partidosSemifinal[Math.floor(i / 2)],
        posicionEnSiguiente: (i % 2) + 1,
      });
      partidosCuartos.push(partido);
      todosLosPartidos.push(partido);
    }
    
    console.log(`✅ Llave generada: 7 partidos (4 cuartos + 2 semifinales + 1 final) para 8 equipos`);
  }
  // Si hay 16 equipos, crear octavos de final
  else if (cantidadEquipos === 16) {
    // Crear cuartos de final primero (sin equipos asignados)
    const partidosCuartos: Partido[] = [];
    for (let i = 0; i < 4; i++) {
      const partido = em.create(Partido, {
        torneo,
        fase: 'cuartos',
        numeroPartido: i + 1,
        estado: 'pendiente',
        partidoSiguiente: partidosSemifinal[Math.floor(i / 2)],
        posicionEnSiguiente: (i % 2) + 1,
      });
      partidosCuartos.push(partido);
      todosLosPartidos.push(partido);
    }

    // Crear octavos de final con los equipos
    const partidosOctavos: Partido[] = [];
    for (let i = 0; i < 8; i++) {
      const partido = em.create(Partido, {
        torneo,
        equipo1: equipos[i * 2],
        equipo2: equipos[i * 2 + 1],
        fase: 'octavos',
        numeroPartido: i + 1,
        estado: 'pendiente',
        partidoSiguiente: partidosCuartos[Math.floor(i / 2)],
        posicionEnSiguiente: (i % 2) + 1,
      });
      partidosOctavos.push(partido);
      todosLosPartidos.push(partido);
    }
    
    console.log(`✅ Llave generada: 15 partidos (8 octavos + 4 cuartos + 2 semifinales + 1 final) para 16 equipos`);
  }

  // Persistir todos los partidos
  await em.persistAndFlush(todosLosPartidos);
  
  return todosLosPartidos;
};

export class InscripcionController {
  // Crear inscripción (agregar equipo al torneo)
  // Se llama desde POST /api/torneos/:id/equipos
  static async create(req: Request, res: Response) {
    try {
      const torneoId = req.params.id; // Obtener torneoId de params
      const { equipoId, divisionId } = req.body;

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

        let division: Division | undefined;
        if (torneo.tipo === "todos_contra_todos") {
          if (!divisionId) {
            throw new Error("divisionId es requerido para torneos todos contra todos");
          }

          const divisionEncontrada = await em.findOne(Division, {
            id: parseInt(divisionId),
            torneo: parseInt(torneoId),
          });
          if (!divisionEncontrada) {
            throw new Error("División no encontrada para el torneo");
          }
          division = divisionEncontrada;
        } else if (divisionId) {
          const divisionEncontrada = await em.findOne(Division, {
            id: parseInt(divisionId),
            torneo: parseInt(torneoId),
          });
          if (!divisionEncontrada) {
            throw new Error("División no encontrada para el torneo");
          }
          division = divisionEncontrada;
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

        // Verificar que no haya más de la cantidad configurada
        const equiposInscritos = await em.count(Inscripcion, { torneo: parseInt(torneoId) });
        const cantidadMaxima = torneo.cantidad_equipos || 16;
        
        if (equiposInscritos >= cantidadMaxima) {
          throw new Error(`El torneo ya tiene el máximo de ${cantidadMaxima} equipos inscritos`);
        }

        // Crear inscripción
        const inscripcion = new Inscripcion();
        inscripcion.torneo = torneo;
        inscripcion.equipo = equipo;
        if (division) {
          inscripcion.division = division;
        }
        inscripcion.estado = "aceptada";
        inscripcion.fechaInscripcion = new Date();

        await em.persistAndFlush(inscripcion);
        
        // GENERAR LA LLAVE SOLO cuando se alcance la cantidad configurada en el torneo
        const totalEquipos = equiposInscritos + 1;
        let llaveGenerada = false;
        
        // Verificar que el torneo sea eliminatorio y que se haya alcanzado la cantidad configurada
        if (torneo.tipo === 'eliminatorio' && totalEquipos === cantidadMaxima) {
          console.log(`🎯 Torneo completo con ${totalEquipos} equipos (cantidad configurada)! Generando llave de partidos...`);
          
          // Verificar que la cantidad sea válida para eliminatorias (4, 8 o 16)
          if ([4, 8, 16].includes(totalEquipos)) {
            // Obtener todos los equipos inscritos
            const inscripciones = await em.find(Inscripcion, 
              { torneo: parseInt(torneoId) },
              { populate: ['equipo'] }
            );
            
            const equipos = inscripciones.map(insc => insc.equipo);
            
            // Generar llave
            await generarLlavePartidos(em, torneo, equipos);
            llaveGenerada = true;
          } else {
            console.warn(`⚠️ El torneo tiene ${totalEquipos} equipos pero solo se soportan 4, 8 o 16 para eliminatorias`);
          }
        }
        
        // Retornar con equipo populado
        await em.populate(inscripcion, ["equipo", "torneo", "division"]);
        
        return { inscripcion, llaveGenerada, totalEquipos };
      });

      const mensaje = result.llaveGenerada 
        ? `Equipo agregado exitosamente. ¡Torneo completo con ${result.totalEquipos} equipos! La llave de partidos ha sido generada.`
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

        return await em.find(Inscripcion, filtro, { populate: ["torneo", "equipo", "division"] });
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
          { populate: ["equipo", "division"] }
        );

        return inscripciones.map((insc) => ({
          ...insc.equipo,
          inscripcionId: insc.id,
          fechaInscripcion: insc.fechaInscripcion,
          division: insc.division,
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

  // POST /api/torneos/:id/generar-llave - Generar llave de partidos manualmente
  static async generarLlaveManual(req: Request, res: Response) {
    try {
      const torneoId = req.params.id;

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork() as SqlEntityManager;

        // Verificar que el torneo existe
        const torneo = await em.findOne(Torneo, { id: parseInt(torneoId) });
        if (!torneo) {
          throw new Error("Torneo no encontrado");
        }

        // Verificar que haya exactamente 4, 8 o 16 equipos
        const inscripciones = await em.find(Inscripcion, 
          { torneo: parseInt(torneoId) },
          { populate: ['equipo'] }
        );

        if (![4, 8, 16].includes(inscripciones.length)) {
          throw new Error(`El torneo debe tener 4, 8 o 16 equipos. Actualmente tiene ${inscripciones.length}`);
        }

        // Verificar si ya hay partidos generados - LIMPIARLOS AUTOMÁTICAMENTE
        const partidosExistentes = await em.find(Partido, { torneo: parseInt(torneoId) });
        if (partidosExistentes.length > 0) {
          console.log(`🗑️ Limpiando ${partidosExistentes.length} partidos existentes antes de regenerar...`);
          await em.removeAndFlush(partidosExistentes);
        }

        // Generar la llave
        const equipos = inscripciones.map(insc => insc.equipo);
        const llave = await generarLlavePartidos(em, torneo, equipos);

        return llave;
      });

      res.status(201).json({
        success: true,
        data: result,
        message: "Llave de partidos generada exitosamente",
      });
    } catch (error: any) {
      console.error("Error al generar llave:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
      });
    }
  }

  // POST /api/torneos/:id/regenerar-llave - Limpiar y regenerar llave de partidos
  static async regenerarLlave(req: Request, res: Response) {
    try {
      const torneoId = req.params.id;

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork() as SqlEntityManager;

        // Verificar que el torneo existe
        const torneo = await em.findOne(Torneo, { id: parseInt(torneoId) });
        if (!torneo) {
          throw new Error("Torneo no encontrado");
        }

        // Verificar que haya exactamente 4, 8 o 16 equipos
        const inscripciones = await em.find(Inscripcion, 
          { torneo: parseInt(torneoId) },
          { populate: ['equipo'] }
        );

        if (![4, 8, 16].includes(inscripciones.length)) {
          throw new Error(`El torneo debe tener 4, 8 o 16 equipos. Actualmente tiene ${inscripciones.length}`);
        }

        // LIMPIAR todos los partidos existentes del torneo
        const partidosExistentes = await em.find(Partido, { torneo: parseInt(torneoId) });
        if (partidosExistentes.length > 0) {
          console.log(`🗑️ Eliminando ${partidosExistentes.length} partidos existentes...`);
          await em.removeAndFlush(partidosExistentes);
        }

        // Generar la nueva llave
        const equipos = inscripciones.map(insc => insc.equipo);
        const llave = await generarLlavePartidos(em, torneo, equipos);

        return { partidosGenerados: llave.length, equipos: equipos.length };
      });

      res.status(201).json({
        success: true,
        data: result,
        message: "Llave de partidos regenerada exitosamente",
      });
    } catch (error: any) {
      console.error("Error al regenerar llave:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
      });
    }
  }
}


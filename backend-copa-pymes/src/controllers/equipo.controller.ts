import { Request, Response } from "express";
import { getORM, checkConnection } from "../shared/db/mikro-orm.config";
import { Equipo } from "../models/equipo.model";
import { Jugador } from "../models/usuario.model";

// Función auxiliar para reintentar operaciones con base de datos
const retryDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error("No hay conexión a la base de datos");
      }

      return await operation();
    } catch (error: any) {
      console.error(
        `❌ Intento ${attempt}/${maxRetries} falló:`,
        error.message
      );

      if (attempt === maxRetries) {
        throw error;
      }

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
  throw new Error(
    "No se pudo completar la operación después de múltiples intentos"
  );
};

export class EquipoController {
  // Obtener todos los equipos
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        const equipos = await em.findAll(Equipo);
        return equipos;
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Equipos obtenidos exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener equipos:", error);
      res.status(500).json({
        success: false,
        data: null,
        message:
          "Error interno del servidor. Intenta nuevamente en unos momentos.",
      });
    }
  }

  // Obtener equipo por ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orm = getORM();
      const em = orm.em.fork();

      const equipo = await em.findOne(Equipo, { id: parseInt(id) });

      if (!equipo) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Equipo no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: equipo,
        message: "Equipo obtenido exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener equipo:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Obtener equipos activos
  static async getActivos(req: Request, res: Response): Promise<void> {
    try {
      const orm = getORM();
      const em = orm.em.fork();

      const equipos = await em.find(Equipo, { estado: true });

      res.status(200).json({
        success: true,
        data: equipos,
        message: "Equipos activos obtenidos exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener equipos activos:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Crear nuevo equipo
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, sigla, estado, escudo } = req.body;

      // Validaciones básicas
      if (!nombre || !sigla) {
        res.status(400).json({
          success: false,
          data: null,
          message: "Los campos nombre y sigla son obligatorios",
        });
        return;
      }

      const orm = getORM();
      const em = orm.em.fork();

      // Verificar si ya existe un equipo con el mismo nombre o sigla
      const existingEquipo = await em.findOne(Equipo, {
        $or: [{ nombre }, { sigla }],
      });

      if (existingEquipo) {
        res.status(409).json({
          success: false,
          data: null,
          message: "Ya existe un equipo con ese nombre o sigla",
        });
        return;
      }

      const equipo = new Equipo();
      equipo.nombre = nombre;
      equipo.sigla = sigla;
      equipo.estado = estado !== undefined ? estado : true;
      equipo.escudo = escudo;

      await em.persistAndFlush(equipo);

      res.status(201).json({
        success: true,
        data: equipo,
        message: "Equipo creado exitosamente",
      });
    } catch (error) {
      console.error("Error al crear equipo:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Actualizar equipo
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, sigla, estado, escudo } = req.body;

      const orm = getORM();
      const em = orm.em.fork();

      const equipo = await em.findOne(Equipo, { id: parseInt(id) });

      if (!equipo) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Equipo no encontrado",
        });
        return;
      }

      // Verificar si nombre o sigla ya existen en otro equipo
      if (nombre || sigla) {
        const conditions = [];
        if (nombre && nombre !== equipo.nombre) {
          conditions.push({ nombre });
        }
        if (sigla && sigla !== equipo.sigla) {
          conditions.push({ sigla });
        }

        if (conditions.length > 0) {
          const existingEquipo = await em.findOne(Equipo, {
            $and: [{ id: { $ne: parseInt(id) } }, { $or: conditions }],
          });

          if (existingEquipo) {
            res.status(409).json({
              success: false,
              data: null,
              message: "Ya existe otro equipo con ese nombre o sigla",
            });
            return;
          }
        }
      }

      // Actualizar campos
      if (nombre !== undefined) equipo.nombre = nombre;
      if (sigla !== undefined) equipo.sigla = sigla;
      if (estado !== undefined) equipo.estado = estado;
      if (escudo !== undefined) equipo.escudo = escudo;

      await em.persistAndFlush(equipo);

      res.status(200).json({
        success: true,
        data: equipo,
        message: "Equipo actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar equipo:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Eliminar equipo (soft delete - cambiar estado)
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orm = getORM();
      const em = orm.em.fork();

      const equipo = await em.findOne(Equipo, { id: parseInt(id) });

      if (!equipo) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Equipo no encontrado",
        });
        return;
      }

      // Soft delete - cambiar estado a false
      equipo.estado = false;
      await em.persistAndFlush(equipo);

      res.status(200).json({
        success: true,
        data: equipo,
        message: "Equipo desactivado exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar equipo:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Eliminar equipo permanentemente
  static async deletePermanent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orm = getORM();
      const em = orm.em.fork();

      const equipo = await em.findOne(Equipo, { id: parseInt(id) });

      if (!equipo) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Equipo no encontrado",
        });
        return;
      }

      await em.removeAndFlush(equipo);

      res.status(200).json({
        success: true,
        data: null,
        message: "Equipo eliminado permanentemente",
      });
    } catch (error) {
      console.error("Error al eliminar equipo permanentemente:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Reactivar equipo
  static async reactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orm = getORM();
      const em = orm.em.fork();

      const equipo = await em.findOne(Equipo, { id: parseInt(id) });

      if (!equipo) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Equipo no encontrado",
        });
        return;
      }

      equipo.estado = true;
      await em.persistAndFlush(equipo);

      res.status(200).json({
        success: true,
        data: equipo,
        message: "Equipo reactivado exitosamente",
      });
    } catch (error) {
      console.error("Error al reactivar equipo:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // GET /api/equipos/:id/jugadores - Obtener todos los jugadores de un equipo
  static async getJugadoresDelEquipo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orm = getORM();
      const em = orm.em.fork();
      // Verificar que el equipo existe
      const equipo = await em.findOne(Equipo, { id: Number(id) });
      if (!equipo) {
        return res.status(404).json({ message: "Equipo no encontrado" });
      }

      // Buscar todos los jugadores de este equipo
      const jugadores = await em.find(
        Jugador,
        { equipo: Number(id) },
        {
          populate: ["equipo"],
        }
      );

      return res.status(200).json({
        success: true,
        data: jugadores,
        message: "Jugadores del equipo obtenidos exitosamente",
      });
    } catch (error: any) {
      console.error("Error al obtener jugadores del equipo:", error);
      return res.status(500).json({
        message: "Error al obtener los jugadores del equipo",
        error: error.message,
      });
    }
  }

  // POST /api/equipos/:id/jugadores - Agregar un jugador al equipo
  static async agregarJugadorAlEquipo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { jugadorId } = req.body;
      const orm = getORM();
      const em = orm.em.fork();
      if (!jugadorId) {
        return res
          .status(400)
          .json({ 
            success: false,
            message: "El ID del jugador es requerido" 
          });
      }

      // Verificar que el equipo existe
      const equipo = await em.findOne(Equipo, { id: Number(id) });
      if (!equipo) {
        return res.status(404).json({ 
          success: false,
          message: "Equipo no encontrado" 
        });
      }

      // Verificar que el jugador existe y cargar su equipo actual
      const jugador = await em.findOne(Jugador, { id: Number(jugadorId) }, {
        populate: ['equipo']
      });
      if (!jugador) {
        return res.status(404).json({ 
          success: false,
          message: "Jugador no encontrado" 
        });
      }

      // Verificar si el jugador ya está en este equipo
      if (jugador.equipo?.id === equipo.id) {
        return res.status(400).json({
          success: false,
          message: "El jugador ya pertenece a este equipo",
        });
      }

      // Verificar si el jugador ya pertenece a OTRO equipo
      if (jugador.equipo) {
        return res.status(400).json({
          success: false,
          message: `El jugador ya pertenece al equipo "${jugador.equipo.nombre}". Primero debe ser removido de ese equipo.`,
        });
      }

      // Asignar el jugador al equipo
      jugador.equipo = equipo;
      await em.persistAndFlush(jugador);

      // Devolver el jugador actualizado con el equipo poblado
      await em.populate(jugador, ["equipo"]);

      return res.status(200).json({
        success: true,
        data: jugador,
        message: "Jugador agregado al equipo exitosamente",
      });
    } catch (error: any) {
      console.error("Error al agregar jugador al equipo:", error);
      return res.status(500).json({
        success: false,
        message: "Error al agregar el jugador al equipo",
        error: error.message,
      });
    }
  }

  // DELETE /api/equipos/:id/jugadores/:jugadorId - Quitar un jugador del equipo
  static async quitarJugadorDelEquipo(req: Request, res: Response) {
    try {
      const { id, jugadorId } = req.params;
      const orm = getORM();
      const em = orm.em.fork();
      // Verificar que el equipo existe
      const equipo = await em.findOne(Equipo, { id: Number(id) });
      if (!equipo) {
        return res.status(404).json({ message: "Equipo no encontrado" });
      }

      // Verificar que el jugador existe
      const jugador = await em.findOne(Jugador, { id: Number(jugadorId) });
      if (!jugador) {
        return res.status(404).json({ message: "Jugador no encontrado" });
      }

      // Verificar que el jugador pertenece a este equipo
      if (jugador.equipo?.id !== equipo.id) {
        return res.status(400).json({
          message: "El jugador no pertenece a este equipo",
        });
      }

      // Quitar el jugador del equipo (establecer equipo como null)
      jugador.equipo = undefined;
      await em.persistAndFlush(jugador);

      return res.status(200).json({
        success: true,
        data: jugador,
        message: "Jugador quitado del equipo exitosamente",
      });
    } catch (error: any) {
      console.error("Error al quitar jugador del equipo:", error);
      return res.status(500).json({
        message: "Error al quitar el jugador del equipo",
        error: error.message,
      });
    }
  }

  // GET /api/equipos/jugadores-disponibles - Obtener jugadores sin equipo asignado
  static async getJugadoresDisponibles(req: Request, res: Response) {
    try {
      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        // Buscar jugadores activos sin equipo asignado
        const jugadoresDisponibles = await em.find(Jugador, {
          equipo: null,
          activo: true,
        });

        return jugadoresDisponibles;
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Jugadores disponibles obtenidos exitosamente",
      });
    } catch (error: any) {
      console.error("Error al obtener jugadores disponibles:", error);
      return res.status(500).json({
        success: false,
        message: "Error al obtener los jugadores disponibles",
        error: error.message,
      });
    }
  }
}

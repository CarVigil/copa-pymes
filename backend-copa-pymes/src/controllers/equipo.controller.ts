import { Request, Response } from "express";
import { getORM, checkConnection } from "../shared/db/mikro-orm.config";
import { Equipo } from "../models/equipo.model";

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
            $and: [
              { id: { $ne: parseInt(id) } },
              { $or: conditions }
            ]
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
}
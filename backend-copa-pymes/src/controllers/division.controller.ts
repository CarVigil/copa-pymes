import { Request, Response } from "express";
import { getORM, checkConnection } from "../shared/db/mikro-orm.config";
import { Division } from "../models/division.model";
import { Torneo } from "../models/torneo.model";

// Función auxiliar para reintentar operaciones con base de datos
const retryDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Verificar conexión antes de intentar la operación
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

      // Solo reintentar en errores de conexión/timeout
      if (
        error.code === "ETIMEDOUT" ||
        error.code === "ECONNRESET" ||
        error.code === "ENOTFOUND" ||
        error.message.includes("connect") ||
        error.message.includes("timeout")
      ) {
        console.log(`⏳ Reintentando en ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        // Incrementar el delay para el siguiente intento
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

export class DivisionController {
  // Obtener todos las divisiones
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        const divisiones = await em.findAll(Division, { populate: ["torneo"] });
        return divisiones;
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Divisiones obtenidas exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener divisiones:", error);
      res.status(500).json({
        success: false,
        data: null,
        message:
          "Error interno del servidor. Intenta nuevamente en unos momentos.",
      });
    }
  }

  // Obtener division por ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orm = getORM();
      const em = orm.em.fork();

      const division = await em.findOne(Division, { id: parseInt(id) }, { populate: ["torneo"] });

      if (!division) {
        res.status(404).json({
          success: false,
          data: null,
          message: "División no encontrada",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: division,
        message: "División obtenida exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener división:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Crear nueva division
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, cupo, torneoId } = req.body;

      // Validaciones básicas
      if (!nombre || !cupo || !torneoId) {
        res.status(400).json({
          success: false,
          data: null,
          message: "nombre, cupo y torneoId son obligatorios",
        });
        return;
      }

      const orm = getORM();
      const em = orm.em.fork();

      // Verificar si ya existe una división con el mismo nombre
      const torneo = await em.findOne(Torneo, { id: parseInt(torneoId) });
      if (!torneo) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Torneo no encontrado",
        });
        return;
      }

      const existingDivision = await em.findOne(Division, {
        torneo: parseInt(torneoId),
        $or: [{ nombre }],
      });

      if (existingDivision) {
        res.status(409).json({
          success: false,
          data: null,
          message: "Ya existe una División con ese nombre o ubicación",
        });
        return;
      }

      if (cupo && cupo <= 0) {
        res.status(400).json({
          success: false,
          data: null,
          message: "El cupo debe ser mayor a 0",
        });
        return;
      }

      const division = new Division();
      division.nombre = nombre;
      division.cupo = cupo;
      division.torneo = torneo;

      await em.persistAndFlush(division);

      res.status(201).json({
        success: true,
        data: division,
        message: "División creada exitosamente",
      });
    } catch (error) {
      console.error("Error al crear división:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Actualizar division
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, cupo, torneoId } = req.body;

      const orm = getORM();
      const em = orm.em.fork();

      const division = await em.findOne(Division, { id: parseInt(id) });

      if (!division) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Sede no encontrada",
        });
        return;
      }

      // Verificar si el nombre ya existen en otra division
      if (nombre) {
        const conditions = [];
        if (nombre && nombre !== division.nombre) {
          conditions.push({ nombre });
        }

        if (conditions.length > 0) {
          const torneoFiltro = torneoId !== undefined ? parseInt(torneoId) : division.torneo?.id;
          const existingDivision = await em.findOne(Division, {
            $and: [{ id: { $ne: parseInt(id) } }, { torneo: torneoFiltro }, { $or: conditions }],
          });

          if (existingDivision) {
            res.status(409).json({
              success: false,
              data: null,
              message: "Ya existe otra División con ese nombre o ubicación",
            });
            return;
          }
        }
      }

      // Actualizar campos
      if (nombre) division.nombre = nombre;
      if (cupo) division.cupo = cupo;
      if (torneoId !== undefined) {
        const torneo = await em.findOne(Torneo, { id: parseInt(torneoId) });
        if (!torneo) {
          res.status(404).json({
            success: false,
            data: null,
            message: "Torneo no encontrado",
          });
          return;
        }
        division.torneo = torneo;
      }

      await em.persistAndFlush(division);

      res.status(200).json({
        success: true,
        data: division,
        message: "División actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar division:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Eliminar division
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orm = getORM();
      const em = orm.em.fork();

      const division = await em.findOne(Division, { id: parseInt(id) });

      if (!division) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Sede no encontrado",
        });
        return;
      }

      await em.removeAndFlush(division);

      res.status(200).json({
        success: true,
        data: null,
        message: "Sede eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar division:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }
}

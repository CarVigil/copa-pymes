import { Request, Response } from "express";
import { getORM, checkConnection } from "../shared/db/mikro-orm.config";
import { Sede } from "../models/sede.model";

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

export class SedeController {
  // Obtener todos los sedes
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        const sedes = await em.findAll(Sede);
        return sedes;
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Sedes obtenidas exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener sedes:", error);
      res.status(500).json({
        success: false,
        data: null,
        message:
          "Error interno del servidor. Intenta nuevamente en unos momentos.",
      });
    }
  }

  // Obtener sede por ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orm = getORM();
      const em = orm.em.fork();

      const sede = await em.findOne(Sede, { id: parseInt(id) });

      if (!sede) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Sede no encontrada",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: sede,
        message: "Sede obtenido exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener sede:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Crear nueva sede
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, ubicacion, capacidad } = req.body;

      // Validaciones básicas
      if (!nombre || !ubicacion || !capacidad) {
        res.status(400).json({
          success: false,
          data: null,
          message: "Todos los campos son obligatorios",
        });
        return;
      }

      const orm = getORM();
      const em = orm.em.fork();

      // Verificar si ya existe una sede con el mismo nombre o ubicacion
      const existingSede = await em.findOne(Sede, {
        $or: [{ nombre }, { ubicacion }],
      });

      if (existingSede) {
        res.status(409).json({
          success: false,
          data: null,
          message: "Ya existe una Sede con ese nombre o ubicación",
        });
        return;
      }

      if (capacidad && capacidad <= 0) {
        res.status(400).json({
          success: false,
          data: null,
          message: "La capacidad debe ser mayor a 0",
        });
        return;
      }

      const sede = new Sede();
      sede.nombre = nombre;
      sede.ubicacion = ubicacion;
      sede.capacidad = capacidad;

      await em.persistAndFlush(sede);

      res.status(201).json({
        success: true,
        data: sede,
        message: "Sede creada exitosamente",
      });
    } catch (error) {
      console.error("Error al crear sede:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Actualizar sede
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, ubicacion, capacidad } = req.body;

      const orm = getORM();
      const em = orm.em.fork();

      const sede = await em.findOne(Sede, { id: parseInt(id) });

      if (!sede) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Sede no encontrada",
        });
        return;
      }

      // Verificar si nombre o ubicación ya existen en otra sede
      if (nombre || ubicacion) {
        const conditions = [];
        if (nombre && nombre !== sede.nombre) {
          conditions.push({ nombre });
        }
        if (ubicacion && ubicacion !== sede.ubicacion) {
          conditions.push({ ubicacion });
        }

        if (conditions.length > 0) {
          const existingSede = await em.findOne(Sede, {
            $and: [{ id: { $ne: parseInt(id) } }, { $or: conditions }],
          });

          if (existingSede) {
            res.status(409).json({
              success: false,
              data: null,
              message: "Ya existe otra Sede con ese nombre o ubicación",
            });
            return;
          }
        }
      }

      // Actualizar campos
      if (nombre !== undefined) sede.nombre = nombre;
      if (ubicacion !== undefined) sede.ubicacion = ubicacion;
      if (capacidad !== undefined) sede.capacidad = capacidad;

      await em.persistAndFlush(sede);

      res.status(200).json({
        success: true,
        data: sede,
        message: "Sede actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar sede:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Eliminar sede
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orm = getORM();
      const em = orm.em.fork();

      const sede = await em.findOne(Sede, { id: parseInt(id) });

      if (!sede) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Sede no encontrada",
        });
        return;
      }

      await em.removeAndFlush(sede);

      res.status(200).json({
        success: true,
        data: null,
        message: "Sede eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar sede:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }
}

import { Request, Response } from "express";
import { getORM, checkConnection } from "../shared/db/mikro-orm.config";
import { Premio } from "../models/premio.model";
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

export class PremioController {
  // Obtener todos los premios
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        const premios = await em.findAll(Premio, {
          populate: ['torneo']
        });
        return premios;
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Premios obtenidos exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener premios:", error);
      res.status(500).json({
        success: false,
        data: null,
        message:
          "Error interno del servidor. Intenta nuevamente en unos momentos.",
      });
    }
  }

  // Obtener premio por clave primaria compuesta (fecha_entrega + id_torneo)
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { fecha_entrega, id_torneo } = req.params;
      const orm = getORM();
      const em = orm.em.fork();

      // Validar que vengan ambos parámetros
      if (!fecha_entrega || !id_torneo) {
        res.status(400).json({
          success: false,
          data: null,
          message: "Se requieren fecha_entrega e id_torneo",
        });
        return;
      }

      const premio = await em.findOne(Premio, { 
        fecha_entrega: new Date(fecha_entrega),
        torneo: parseInt(id_torneo)
      }, {
        populate: ['torneo']
      });

      if (!premio) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Premio no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: premio,
        message: "Premio obtenido exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener premio:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Obtener premios por torneo
  static async getByTorneo(req: Request, res: Response): Promise<void> {
    try {
      const { id_torneo } = req.params;
      const orm = getORM();
      const em = orm.em.fork();

      const premios = await em.find(Premio, { 
        torneo: parseInt(id_torneo)
      }, {
        populate: ['torneo']
      });

      res.status(200).json({
        success: true,
        data: premios,
        message: "Premios obtenidos exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener premios:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Crear nuevo premio
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { fecha_entrega, id_torneo, nombre, descripcion, posicion } = req.body;

      // Validaciones básicas
      if (!fecha_entrega || !id_torneo || !nombre || !posicion) {
        res.status(400).json({
          success: false,
          data: null,
          message: "Los campos fecha_entrega, id_torneo, nombre y posicion son obligatorios",
        });
        return;
      }

      const orm = getORM();
      const em = orm.em.fork();

      // Verificar que el torneo existe
      const torneo = await em.findOne(Torneo, { id: parseInt(id_torneo) });
      if (!torneo) {
        res.status(404).json({
          success: false,
          data: null,
          message: "El torneo especificado no existe",
        });
        return;
      }

      // Verificar si ya existe un premio con la misma clave primaria
      const existingPremio = await em.findOne(Premio, {
        fecha_entrega: new Date(fecha_entrega),
        torneo: parseInt(id_torneo)
      });

      if (existingPremio) {
        res.status(409).json({
          success: false,
          data: null,
          message: "Ya existe un premio con esa fecha de entrega para este torneo",
        });
        return;
      }

      const premio = new Premio();
      premio.fecha_entrega = new Date(fecha_entrega);
      premio.torneo = torneo;
      premio.nombre = nombre;
      premio.descripcion = descripcion;
      premio.posicion = posicion;

      await em.persistAndFlush(premio);

      res.status(201).json({
        success: true,
        data: premio,
        message: "Premio creado exitosamente",
      });
    } catch (error) {
      console.error("Error al crear premio:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Actualizar premio
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { fecha_entrega, id_torneo } = req.params;
      const { nombre, descripcion, posicion } = req.body;

      const orm = getORM();
      const em = orm.em.fork();

      // Validar que vengan ambos parámetros
      if (!fecha_entrega || !id_torneo) {
        res.status(400).json({
          success: false,
          data: null,
          message: "Se requieren fecha_entrega e id_torneo",
        });
        return;
      }

      const premio = await em.findOne(Premio, { 
        fecha_entrega: new Date(fecha_entrega),
        torneo: parseInt(id_torneo)
      });

      if (!premio) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Premio no encontrado",
        });
        return;
      }

      // Actualizar campos (no se puede cambiar la clave primaria)
      if (nombre !== undefined) premio.nombre = nombre;
      if (descripcion !== undefined) premio.descripcion = descripcion;
      if (posicion !== undefined) premio.posicion = posicion;

      await em.persistAndFlush(premio);

      res.status(200).json({
        success: true,
        data: premio,
        message: "Premio actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar premio:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Eliminar premio
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { fecha_entrega, id_torneo } = req.params;
      const orm = getORM();
      const em = orm.em.fork();

      // Validar que vengan ambos parámetros
      if (!fecha_entrega || !id_torneo) {
        res.status(400).json({
          success: false,
          data: null,
          message: "Se requieren fecha_entrega e id_torneo",
        });
        return;
      }

      const premio = await em.findOne(Premio, { 
        fecha_entrega: new Date(fecha_entrega),
        torneo: parseInt(id_torneo)
      });

      if (!premio) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Premio no encontrado",
        });
        return;
      }

      await em.removeAndFlush(premio);

      res.status(200).json({
        success: true,
        data: null,
        message: "Premio eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar premio:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }
}
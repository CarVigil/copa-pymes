import { Request, Response } from "express";
import { getORM, checkConnection } from "../shared/db/mikro-orm.config";
import { Inscripcion } from "../models/inscripcion.model";
import { Torneo } from "../models/torneo.model";
import { Equipo } from "../models/equipo.model";
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

export class InscripcionController {
  // Crear inscripción
  static async create(req: Request, res: Response) {
    try {
      const { torneoId, equipoId } = req.body;

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork() as SqlEntityManager;

        const torneo = await em.findOne(Torneo, { id: parseInt(torneoId) });
        const equipo = await em.findOne(Equipo, { id: parseInt(equipoId) });

        if (!torneo || !equipo) {
          throw new Error("Torneo o equipo no encontrado");
        }

        const inscripcion = new Inscripcion();
        inscripcion.torneo = torneo;
        inscripcion.equipo = equipo;
        inscripcion.estado = "pendiente";
        inscripcion.fechaInscripcion = new Date();

        await em.persistAndFlush(inscripcion);
        return inscripcion;
      });

      res.status(201).json({ success: true, data: result, message: "Inscripción creada" });
    } catch (error: any) {
      console.error("Error al crear inscripción:", error);
      if (error.message === "Torneo o equipo no encontrado") {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: "Error interno del servidor" });
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
}

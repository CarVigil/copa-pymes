import { Request, Response } from "express";
import { getORM, checkConnection } from "../shared/db/mikro-orm.config";
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
        throw new Error('No hay conexión a la base de datos');
      }

      return await operation();
    } catch (error: any) {
      console.error(`❌ Intento ${attempt}/${maxRetries} falló:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Solo reintentar en errores de conexión/timeout
      if (error.code === 'ETIMEDOUT' || 
          error.code === 'ECONNRESET' || 
          error.code === 'ENOTFOUND' ||
          error.message.includes('connect') ||
          error.message.includes('timeout')) {
        console.log(`⏳ Reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Incrementar el delay para el siguiente intento
        delay *= 1.5;
        continue;
      }
      
      throw error;
    }
  }
  throw new Error('No se pudo completar la operación después de múltiples intentos');
};

export class TorneoController {
  // Obtener todos los torneos
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        const torneos = await em.findAll(Torneo);
        return torneos;
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Torneos obtenidos exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener torneos:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Obtener torneo por ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        return await em.findOne(Torneo, { id: parseInt(id) });
      });

      if (!result) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Torneo no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        message: "Torneo obtenido exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener torneo:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Crear nuevo torneo
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, tipo, modalidad, fecha_inicio, fecha_fin } = req.body;

      // Validaciones básicas
      if (!nombre || !tipo || !modalidad || !fecha_inicio || !fecha_fin) {
        res.status(400).json({
          success: false,
          data: null,
          message: "Todos los campos son obligatorios",
        });
        return;
      }

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        // Verificar si ya existe un torneo con el mismo nombre
        const existingTorneo = await em.findOne(Torneo, {
          $or: [{ nombre }],
        });

        if (existingTorneo) {
          throw new Error(`Ya existe un torneo con el nombre: ${nombre}`);
        }

        const torneo = new Torneo();
        torneo.nombre = nombre;
        torneo.tipo = tipo;
        torneo.modalidad = modalidad;
        torneo.fecha_inicio = fecha_inicio;
        torneo.fecha_fin = new Date(fecha_fin);

        await em.persistAndFlush(torneo);
        return torneo;
      });

      res.status(201).json({
        success: true,
        data: result,
        message: "Torneo creado exitosamente",
      });
    } catch (error: any) {
      console.error("Error al crear torneo:", error);
      
      if (error.message && error.message.includes("Ya existe un torneo")) {
        res.status(409).json({
          success: false,
          data: null,
          message: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Actualizar torneo
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, tipo, modalidad, fecha_inicio, fecha_fin } = req.body;

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        const torneo = await em.findOne(Torneo, { id: parseInt(id) });

        if (!torneo) {
          throw new Error('Torneo no encontrado');
        }

        // Actualizar campos
        if (nombre) torneo.nombre = nombre;
        if (tipo) torneo.tipo = tipo;
        if (modalidad) torneo.modalidad = modalidad;
        if (fecha_inicio) torneo.fecha_inicio = fecha_inicio;
        if (fecha_fin) torneo.fecha_fin = new Date(fecha_fin);

        await em.persistAndFlush(torneo);
        return torneo;
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Torneo actualizado exitosamente",
      });
    } catch (error: any) {
      console.error("Error al actualizar torneo:", error);
      
      if (error.message === 'Torneo no encontrado') {
        res.status(404).json({
          success: false,
          data: null,
          message: "Torneo no encontrado",
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }

  // Eliminar torneo
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        const torneo = await em.findOne(Torneo, { id: parseInt(id) });

        if (!torneo) {
          throw new Error('Torneo no encontrado');
        }

        await em.removeAndFlush(torneo);
        return torneo;
      });

      res.status(200).json({
        success: true,
        data: null,
        message: "Torneo eliminado exitosamente",
      });
    } catch (error: any) {
      console.error("Error al eliminar torneo:", error);
      
      if (error.message === 'Torneo no encontrado') {
        res.status(404).json({
          success: false,
          data: null,
          message: "Torneo no encontrado",
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }
}

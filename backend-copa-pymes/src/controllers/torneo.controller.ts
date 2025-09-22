import { Request, Response } from "express";
import { getORM } from "../shared/db/mikro-orm.config";
import { Torneo } from "../models/torneo.model";

export class TorneoController {
  // Obtener todos los torneos
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const orm = getORM();
      const em = orm.em.fork();
      const torneos = await em.findAll(Torneo);

      res.status(200).json({
        success: true,
        data: torneos,
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
      const orm = getORM();
      const em = orm.em.fork();

      const torneo = await em.findOne(Torneo, { id: parseInt(id) });

      if (!torneo) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Torneo no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: torneo,
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

      const orm = getORM();
      const em = orm.em.fork();

      // Verificar si ya existe un torneo con el mismo nombre
      const existingTorneo = await em.findOne(Torneo, {
        $or: [{ nombre }],
      });

      if (existingTorneo) {
        res.status(409).json({
          success: false,
          data: null,
          message: "Ya existe un torneo con ese nombre",
        });
        return;
      }

      const torneo = new Torneo();
      torneo.nombre = nombre;
      torneo.tipo = tipo;
      torneo.modalidad = modalidad;
      torneo.fecha_inicio = fecha_inicio;
      torneo.fecha_fin = new Date(fecha_fin);

      await em.persistAndFlush(torneo);

      res.status(201).json({
        success: true,
        data: torneo,
        message: "Torneo creado exitosamente",
      });
    } catch (error) {
      console.error("Error al crear torneo:", error);
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

      const orm = getORM();
      const em = orm.em.fork();

      const torneo = await em.findOne(Torneo, { id: parseInt(id) });

      if (!torneo) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Torneo no encontrado",
        });
        return;
      }

      // Actualizar campos
      if (nombre) torneo.nombre = nombre;
      if (tipo) torneo.tipo = tipo;
      if (modalidad) torneo.modalidad = modalidad;
      if (fecha_inicio) torneo.fecha_inicio = fecha_inicio;
      if (fecha_fin) torneo.fecha_fin = new Date(fecha_fin);

      await em.persistAndFlush(torneo);

      res.status(200).json({
        success: true,
        data: torneo,
        message: "Torneo actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar torneo:", error);
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
      const orm = getORM();
      const em = orm.em.fork();

      const torneo = await em.findOne(Torneo, { id: parseInt(id) });

      if (!torneo) {
        res.status(404).json({
          success: false,
          data: null,
          message: "Torneo no encontrado",
        });
        return;
      }

      await em.removeAndFlush(torneo);

      res.status(200).json({
        success: true,
        data: null,
        message: "Torneo eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar torneo:", error);
      res.status(500).json({
        success: false,
        data: null,
        message: "Error interno del servidor",
      });
    }
  }
}

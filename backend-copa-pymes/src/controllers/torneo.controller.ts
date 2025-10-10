import { Request, Response } from "express";
import { getORM, checkConnection } from "../shared/db/mikro-orm.config";
import { Torneo } from "../models/torneo.model";
import { Equipo } from "../models/equipo.model";
import { Partido } from "../models/partido.model";
import { EntityManager } from "@mikro-orm/mysql";
import { SqlEntityManager } from '@mikro-orm/mysql'; // o el driver que uses


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
      console.error(
        `❌ Intento ${attempt}/${maxRetries} falló:`,
        error.message
      );

      if (attempt === maxRetries) throw error;

      if (
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.message.includes('connect') ||
        error.message.includes('timeout')
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

export class TorneoController {
  constructor(private readonly em: EntityManager) {}
  // Obtener todos los torneos
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        return await em.find(Torneo, {});
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
      const {
        nombre,
        tipo,
        modalidad,
        fechaInicio,
        fechaFin,
        cantidadDivisiones,
        cantidadEquipos,
        estado,
      } = req.body;

      const modalidadesValidas = ["futbol5", "futbol8", "futbol11"];
      const tiposValidos = ["eliminatorio", "todos_contra_todos"];
      const estadosValidos = ["pendiente", "en_progreso", "finalizado"];

      if (!nombre || !tipo || !modalidad || !fechaInicio || !fechaFin || !cantidadEquipos) {
        res.status(400).json({
          success: false,
          data: null,
          message: "Todos los campos obligatorios deben completarse",
        });
        return;
      }

      if (!modalidadesValidas.includes(modalidad)) {
        res.status(400).json({
          success: false,
          data: null,
          message: `Modalidad inválida. Debe ser una de: ${modalidadesValidas.join(
            ", "
          )}`,
        });
        return;
      }

      if (!tiposValidos.includes(tipo)) {
        res.status(400).json({
          success: false,
          data: null,
          message: `Tipo inválido. Debe ser uno de: ${tiposValidos.join(", ")}`,
        });
        return;
      }

      if (estado && !estadosValidos.includes(estado)) {
        res.status(400).json({
          success: false,
          data: null,
          message: `Estado inválido. Debe ser uno de: ${estadosValidos.join(
            ", "
          )}`,
        });
        return;
      }

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        const existingTorneo = await em.findOne(Torneo, { nombre });
        if (existingTorneo) {
          throw new Error(`Ya existe un torneo con el nombre: ${nombre}`);
        }

        const torneo = new Torneo();
        torneo.nombre = nombre;
        torneo.tipo = tipo;
        torneo.modalidad = modalidad;
        torneo.fechaInicio = new Date(fechaInicio);
        torneo.fechaFin = new Date(fechaFin);
        torneo.cantidadDivisiones = cantidadDivisiones || 1;
        torneo.cantidadEquipos = cantidadEquipos || 0;
        torneo.estado = estado || "pendiente";

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

      if (error.message?.includes("Ya existe un torneo")) {
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
      const {
        nombre,
        tipo,
        modalidad,
        fechaInicio,
        fechaFin,
        cantidadDivisiones,
        cantidadEquipos,
        estado,
      } = req.body;

      const modalidadesValidas = ["futbol5", "futbol8", "futbol11"];
      const tiposValidos = ["eliminatorio", "todos_contra_todos"];
      const estadosValidos = ["pendiente", "en_progreso", "finalizado"];

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        const torneo = await em.findOne(Torneo, { id: parseInt(id) });
        if (!torneo) throw new Error("Torneo no encontrado");

        if (nombre) torneo.nombre = nombre;
        if (tipo && tiposValidos.includes(tipo)) torneo.tipo = tipo;
        if (modalidad && modalidadesValidas.includes(modalidad))
          torneo.modalidad = modalidad;
        if (fechaInicio) torneo.fechaInicio = new Date(fechaInicio);
        if (fechaFin) torneo.fechaFin = new Date(fechaFin);
        if (cantidadDivisiones) torneo.cantidadDivisiones = cantidadDivisiones;
        if (cantidadEquipos) torneo.cantidadEquipos = cantidadEquipos;
        if (estado && estadosValidos.includes(estado)) torneo.estado = estado;

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

      if (error.message === "Torneo no encontrado") {
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
        if (!torneo) throw new Error("Torneo no encontrado");

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

      if (error.message === "Torneo no encontrado") {
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

  static async abrirInscripciones(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orm = getORM();
      const em = orm.em.fork();

      const torneo = await em.findOne(Torneo, { id: parseInt(id) });
      if (!torneo) {
        return res
          .status(404)
          .json({ success: false, message: "Torneo no encontrado" });
      }

      torneo.estado = "inscripciones_abiertas";
      await em.persistAndFlush(torneo);

      res
        .status(200)
        .json({
          success: true,
          message: "Inscripciones abiertas",
          data: torneo,
        });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error interno del servidor" });
    }
  }

  // Cerrar inscripciones y generar fixture
  static async cerrarInscripciones(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orm = getORM();
      const em = orm.em.fork();

      const torneo = await em.findOne(
        Torneo,
        { id: parseInt(id) },
        { populate: ["inscripciones.equipo"] }
      );
      if (!torneo) {
        return res
          .status(404)
          .json({ success: false, message: "Torneo no encontrado" });
      }

      torneo.estado = "activo";
      await em.persistAndFlush(torneo);

      // Generar fixture automáticamente
      await TorneoController.generarFixture(torneo, em as SqlEntityManager);

      res
        .status(200)
        .json({
          success: true,
          message: "Inscripciones cerradas y fixture generado",
          data: torneo,
        });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error interno del servidor" });
    }
  }

  // Función para generar fixture
  static async generarFixture(torneo: Torneo, em: SqlEntityManager) {
    const equipos = torneo.inscripciones
      .getItems()
      .filter((i) => i.estado === "aceptada")
      .map((i) => i.equipo);

    if (torneo.tipo === "eliminatorio") {
      // Generar partidos en llave eliminatoria
      for (let i = 0; i < equipos.length; i += 2) {
        if (equipos[i + 1]) {
          const partido = new Partido();
          partido.torneo = torneo;
          partido.equipo1 = equipos[i];
          partido.equipo2 = equipos[i + 1];
          partido.estado = "pendiente";
          await em.persist(partido);
        }
      }
    } else if (torneo.tipo === "todos_contra_todos") {
      // Generar todos contra todos
      for (let i = 0; i < equipos.length; i++) {
        for (let j = i + 1; j < equipos.length; j++) {
          const partido = new Partido();
          partido.torneo = torneo;
          partido.equipo1 = equipos[i];
          partido.equipo2 = equipos[j];
          partido.estado = "pendiente";
          await em.persist(partido);
        }
      }
    }

    await em.flush();
  }
}

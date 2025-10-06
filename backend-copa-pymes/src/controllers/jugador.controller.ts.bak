import { Request, Response } from 'express';
import { getORM, checkConnection } from '../shared/db/mikro-orm.config';
import { Jugador } from '../models/jugador.model';

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

export class JugadorController {
  // Obtener todos los jugadores
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();
        const jugadores = await em.findAll(Jugador);
        return jugadores;
      });
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Jugadores obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener jugadores:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Error interno del servidor. Intenta nuevamente en unos momentos.'
      });
    }
  }

  // Obtener jugador por ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orm = getORM();
      const em = orm.em.fork();
      
      const jugador = await em.findOne(Jugador, { id: parseInt(id) });
      
      if (!jugador) {
        res.status(404).json({
          success: false,
          data: null,
          message: 'Jugador no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: jugador,
        message: 'Jugador obtenido exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener jugador:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Error interno del servidor'
      });
    }
  }

  // Crear nuevo jugador
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, apellido, dni, email, fecha_nacimiento } = req.body;
      
      // Validaciones básicas
      if (!nombre || !apellido || !dni || !email || !fecha_nacimiento) {
        res.status(400).json({
          success: false,
          data: null,
          message: 'Todos los campos son obligatorios'
        });
        return;
      }

      const orm = getORM();
      const em = orm.em.fork();

      // Verificar si ya existe un jugador con el mismo DNI o email
      const existingJugador = await em.findOne(Jugador, {
        $or: [{ dni }, { email }]
      });

      if (existingJugador) {
        res.status(409).json({
          success: false,
          data: null,
          message: 'Ya existe un jugador con ese DNI o email'
        });
        return;
      }

      const jugador = new Jugador();
      jugador.nombre = nombre;
      jugador.apellido = apellido;
      jugador.dni = dni;
      jugador.email = email;
      jugador.fecha_nacimiento = new Date(fecha_nacimiento);

      await em.persistAndFlush(jugador);

      res.status(201).json({
        success: true,
        data: jugador,
        message: 'Jugador creado exitosamente'
      });
    } catch (error) {
      console.error('Error al crear jugador:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar jugador
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, apellido, dni, email, fecha_nacimiento } = req.body;
      
      const orm = getORM();
      const em = orm.em.fork();
      
      const jugador = await em.findOne(Jugador, { id: parseInt(id) });
      
      if (!jugador) {
        res.status(404).json({
          success: false,
          data: null,
          message: 'Jugador no encontrado'
        });
        return;
      }

      // Verificar si DNI o email ya existen en otro jugador
      if (dni || email) {
        const existingJugador = await em.findOne(Jugador, {
          $and: [
            { id: { $ne: parseInt(id) } },
            { $or: [{ dni: dni || jugador.dni }, { email: email || jugador.email }] }
          ]
        });

        if (existingJugador) {
          res.status(409).json({
            success: false,
            data: null,
            message: 'Ya existe otro jugador con ese DNI o email'
          });
          return;
        }
      }

      // Actualizar campos
      if (nombre) jugador.nombre = nombre;
      if (apellido) jugador.apellido = apellido;
      if (dni) jugador.dni = dni;
      if (email) jugador.email = email;
      if (fecha_nacimiento) jugador.fecha_nacimiento = new Date(fecha_nacimiento);

      await em.persistAndFlush(jugador);

      res.status(200).json({
        success: true,
        data: jugador,
        message: 'Jugador actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar jugador:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar jugador
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orm = getORM();
      const em = orm.em.fork();
      
      const jugador = await em.findOne(Jugador, { id: parseInt(id) });
      
      if (!jugador) {
        res.status(404).json({
          success: false,
          data: null,
          message: 'Jugador no encontrado'
        });
        return;
      }

      await em.removeAndFlush(jugador);

      res.status(200).json({
        success: true,
        data: null,
        message: 'Jugador eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar jugador:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: 'Error interno del servidor'
      });
    }
  }
}

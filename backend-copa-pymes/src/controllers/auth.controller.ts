import { Request, Response } from 'express';
import { getORM, checkConnection } from '../shared/db/mikro-orm.config';
import { Usuario, UsuarioRole } from '../models/usuario.model';
import { AuthService } from '../services/authService';
import { LoginRequest, RegisterRequest } from '../types/auth';

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
        throw new Error('No hay conexión a la base de datos');
      }

      return await operation();
    } catch (error: any) {
      console.error(`❌ Intento ${attempt}/${maxRetries} falló:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      if (error.code === 'ETIMEDOUT' || 
          error.code === 'ECONNRESET' || 
          error.code === 'ENOTFOUND' ||
          error.message.includes('connect') ||
          error.message.includes('timeout')) {
        console.log(`⏳ Reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5;
        continue;
      }
      
      throw error;
    }
  }
  throw new Error('No se pudo completar la operación después de múltiples intentos');
};

export class AuthController {
  // Login de usuario
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validaciones básicas
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son obligatorios'
        });
        return;
      }

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        // Buscar usuario por email
        const usuario = await em.findOne(Usuario, { email: email.toLowerCase(), activo: true });

        if (!usuario) {
          throw new Error('Credenciales inválidas');
        }

        // Verificar contraseña
        const isValidPassword = await usuario.verifyPassword(password);
        if (!isValidPassword) {
          throw new Error('Credenciales inválidas');
        }

        // Actualizar último login
        usuario.ultimo_login = new Date();
        await em.persistAndFlush(usuario);

        // Generar token
        const token = AuthService.generateToken({
          id: usuario.id!,
          email: usuario.email,
          role: usuario.role
        });

        return {
          user: {
            id: usuario.id!,
            email: usuario.email,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            role: usuario.role
          },
          token,
          expiresIn: AuthService.getTokenExpirationTime()
        };
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Login exitoso'
      });

    } catch (error: any) {
      console.error('Error en login:', error.message);

      if (error.message === 'Credenciales inválidas') {
        res.status(401).json({
          success: false,
          message: 'Email o contraseña incorrectos'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Registro de usuario (solo admins pueden crear usuarios)
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, nombre, apellido, role }: RegisterRequest = req.body;

      // Validaciones básicas
      if (!email || !password || !nombre || !apellido) {
        res.status(400).json({
          success: false,
          message: 'Todos los campos son obligatorios'
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
        return;
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
        return;
      }

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        // Verificar si el email ya existe
        const existingUser = await em.findOne(Usuario, { email: email.toLowerCase() });
        if (existingUser) {
          throw new Error('El email ya está registrado');
        }

        // Crear nuevo usuario
        const usuario = new Usuario();
        usuario.email = email.toLowerCase();
        usuario.password = password; // Se hasheará automáticamente
        usuario.nombre = nombre;
        usuario.apellido = apellido;
        usuario.role = role === 'admin' ? UsuarioRole.ADMIN : UsuarioRole.JUGADOR;

        await em.persistAndFlush(usuario);

        return {
          id: usuario.id!,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          role: usuario.role
        };
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Usuario registrado exitosamente'
      });

    } catch (error: any) {
      console.error('Error en registro:', error.message);

      if (error.message === 'El email ya está registrado') {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener perfil del usuario autenticado
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        const usuario = await em.findOne(Usuario, { id: req.user!.id });
        if (!usuario) {
          throw new Error('Usuario no encontrado');
        }

        return {
          id: usuario.id!,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          role: usuario.role,
          ultimo_login: usuario.ultimo_login
        };
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Perfil obtenido exitosamente'
      });

    } catch (error: any) {
      console.error('Error obteniendo perfil:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Cambiar contraseña
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva contraseña son obligatorias'
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
        return;
      }

      await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        const usuario = await em.findOne(Usuario, { id: req.user!.id });
        if (!usuario) {
          throw new Error('Usuario no encontrado');
        }

        // Verificar contraseña actual
        const isValidPassword = await usuario.verifyPassword(currentPassword);
        if (!isValidPassword) {
          throw new Error('Contraseña actual incorrecta');
        }

        // Actualizar contraseña
        usuario.password = newPassword;
        await em.persistAndFlush(usuario);

        return true;
      });

      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error: any) {
      console.error('Error cambiando contraseña:', error.message);

      if (error.message === 'Contraseña actual incorrecta') {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Listar usuarios (solo admin)
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const result = await retryDatabaseOperation(async () => {
        const orm = getORM();
        const em = orm.em.fork();

        const usuarios = await em.findAll(Usuario, {
          orderBy: { id: 'DESC' }
        });

        return usuarios.map(usuario => ({
          id: usuario.id!,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          role: usuario.role,
          activo: usuario.activo,
          ultimo_login: usuario.ultimo_login
        }));
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Usuarios obtenidos exitosamente'
      });

    } catch (error: any) {
      console.error('Error obteniendo usuarios:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
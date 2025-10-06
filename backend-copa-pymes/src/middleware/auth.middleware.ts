import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { getORM, checkConnection } from '../shared/db/mikro-orm.config';
import { Usuario, UsuarioRole } from '../models/usuario.model';
import { JWTPayload } from '../types/auth';

// Extender el tipo Request para incluir usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UsuarioRole;
        nombre: string;
        apellido: string;
      };
    }
  }
}

// Middleware para verificar token JWT
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar el token
    const decoded = AuthService.verifyToken(token) as JWTPayload;
    
    // Verificar que el usuario aún existe en la base de datos
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('No hay conexión a la base de datos');
    }

    const orm = getORM();
    const em = orm.em.fork();
    const usuario = await em.findOne(Usuario, { id: decoded.id, activo: true });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }

    // Agregar usuario al request
    req.user = {
      id: usuario.id!,
      email: usuario.email,
      role: usuario.role,
      nombre: usuario.nombre,
      apellido: usuario.apellido
    };

    next();
  } catch (error: any) {
    console.error('Error en autenticación:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar rol de administrador
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (req.user.role !== UsuarioRole.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren privilegios de administrador'
    });
  }

  next();
};

// Middleware para verificar rol de jugador o admin
export const requireJugadorOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (req.user.role !== UsuarioRole.JUGADOR && req.user.role !== UsuarioRole.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado'
    });
  }

  next();
};

// Middleware opcional de autenticación (no falla si no hay token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = AuthService.verifyToken(token) as JWTPayload;
      
      const orm = getORM();
      const em = orm.em.fork();
      const usuario = await em.findOne(Usuario, { id: decoded.id, activo: true });

      if (usuario) {
        req.user = {
          id: usuario.id!,
          email: usuario.email,
          role: usuario.role,
          nombre: usuario.nombre,
          apellido: usuario.apellido
        };
      }
    }
  } catch (error) {
    // Ignorar errores en autenticación opcional
  }
  
  next();
};
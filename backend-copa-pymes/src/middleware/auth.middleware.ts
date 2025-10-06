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
        documento?: string;
        telefono?: string;
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
      apellido: usuario.apellido,
      documento: usuario.documento,
      telefono: usuario.telefono
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
export const requireAdministrador = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (req.user.role !== UsuarioRole.ADMINISTRADOR) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren privilegios de administrador'
    });
  }

  next();
};

// Middleware para verificar permisos de gestión (Administrador o Gestor)
export const requireManagementPermissions = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (req.user.role !== UsuarioRole.ADMINISTRADOR && req.user.role !== UsuarioRole.GESTOR) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren privilegios de gestión'
    });
  }

  next();
};

// Middleware para verificar permisos de carga de resultados (Administrador o Recepcionista)
export const requireResultsPermissions = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (req.user.role !== UsuarioRole.ADMINISTRADOR && req.user.role !== UsuarioRole.RECEPCIONISTA) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren privilegios para cargar resultados'
    });
  }

  next();
};

// Middleware para cualquier usuario autenticado
export const requireAnyRole = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  next();
};

// Middleware para verificar rol específico
export const requireRole = (allowedRoles: UsuarioRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. No tienes permisos para esta acción'
      });
    }

    next();
  };
};

// Mantener compatibilidad con nombres anteriores
export const requireAdmin = requireAdministrador;
export const requireJugadorOrAdmin = requireAnyRole;

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
          apellido: usuario.apellido,
          documento: usuario.documento,
          telefono: usuario.telefono
        };
      }
    }
  } catch (error) {
    // Ignorar errores en autenticación opcional
  }
  
  next();
};
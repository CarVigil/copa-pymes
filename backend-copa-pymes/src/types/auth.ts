import { UsuarioRole } from '../models/usuario.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    user: {
      id: number;
      email: string;
      nombre: string;
      apellido: string;
      role: UsuarioRole;
      documento?: string;
      telefono?: string;
      posicion?: string;
      numero_camiseta?: number;
    };
    token: string;
    expiresIn: string;
  };
  message: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  role?: UsuarioRole;
  documento?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  posicion?: string;
  numero_camiseta?: number;
}

export interface JWTPayload {
  id: number;
  email: string;
  role: UsuarioRole;
  iat?: number;
  exp?: number;
}
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
      role: string;
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
  role?: 'admin' | 'jugador';
}

export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
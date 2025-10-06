export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  role: 'admin' | 'jugador';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    expiresIn: string;
  };
  message: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
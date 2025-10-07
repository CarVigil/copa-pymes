import { apiClient } from './api';
import { LoginRequest, LoginResponse, User, ChangePasswordRequest } from '../types/auth';

class AuthService {
  private readonly TOKEN_KEY = 'copa-pymes-token';
  private readonly USER_KEY = 'copa-pymes-user';

  // Configurar interceptor para agregar token automáticamente
  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Interceptor para agregar token a todas las peticiones
    apiClient.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar errores de autenticación
    apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          // No redirigimos aquí, lo maneja el AuthContext
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      
      if (response.data.success) {
        // Guardar token y usuario en localStorage
        this.setToken(response.data.data.token);
        this.setUser(response.data.data.user);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener perfil');
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      await apiClient.put('/auth/change-password', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  }

  // Verificar si el token está expirado
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}

export const authService = new AuthService();
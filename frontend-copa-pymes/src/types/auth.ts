export type UserRole = 'administrador' | 'gestor' | 'recepcionista' | 'arbitro' | 'jugador';

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  role: UserRole;
  activo: boolean;
  documento?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  
  // Propiedades específicas de Jugador
  posicion?: string;
  numero_camiseta?: number;
  goles_marcados?: number;
  tarjetas_amarillas?: number;
  tarjetas_rojas?: number;
  partidos_jugados?: number;
  disponible?: boolean;
  lesion_actual?: string;
  
  // Propiedades específicas de Administrador
  nivel_acceso?: string;
  permisos_especiales?: string;
  
  // Propiedades específicas de Gestor
  departamento?: string;
  equipos_a_cargo?: string;
  puede_crear_jugadores?: boolean;
  puede_modificar_equipos?: boolean;
  
  // Propiedades específicas de Recepcionista
  turno?: string;
  puede_cargar_asistencia?: boolean;
  puede_cargar_resultados?: boolean;
  puede_crear_partidos?: boolean;
  
  // Propiedades específicas de Árbitro
  categoria?: string;
  numero_licencia?: string;
  partidos_arbitrados?: number;
  disponible_para_arbitrar?: boolean;
  especialidad?: string;
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
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  nombre?: string;
  apellido?: string;
  documento?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  
  // Campos específicos según rol
  posicion?: string;
  numero_camiseta?: number;
  departamento?: string;
  turno?: string;
  categoria?: string;
  numero_licencia?: string;
  especialidad?: string;
}

// Sistema de permisos
export enum Permission {
  // Jugadores
  VIEW_JUGADORES = 'view_jugadores',
  CREATE_JUGADORES = 'create_jugadores',
  EDIT_JUGADORES = 'edit_jugadores',
  DELETE_JUGADORES = 'delete_jugadores',
  
  // Torneos
  VIEW_TORNEOS = 'view_torneos',
  CREATE_TORNEOS = 'create_torneos',
  EDIT_TORNEOS = 'edit_torneos',
  DELETE_TORNEOS = 'delete_torneos',
  
  // Equipos
  VIEW_EQUIPOS = 'view_equipos',
  CREATE_EQUIPOS = 'create_equipos',
  EDIT_EQUIPOS = 'edit_equipos',
  DELETE_EQUIPOS = 'delete_equipos',
  
  // Partidos
  VIEW_PARTIDOS = 'view_partidos',
  CREATE_PARTIDOS = 'create_partidos',
  EDIT_PARTIDOS = 'edit_partidos',
  DELETE_PARTIDOS = 'delete_partidos',
  
  // Resultados
  VIEW_RESULTADOS = 'view_resultados',
  LOAD_RESULTADOS = 'load_resultados',
  
  // Usuarios
  VIEW_USUARIOS = 'view_usuarios',
  CREATE_USUARIOS = 'create_usuarios',
  EDIT_USUARIOS = 'edit_usuarios',
  DELETE_USUARIOS = 'delete_usuarios',
  
  // Sistema
  MANAGE_SYSTEM = 'manage_system',
}

export interface RolePermissions {
  [key: string]: Permission[];
}

// Permisos por rol
export const ROLE_PERMISSIONS: RolePermissions = {
  administrador: [
    // Control total - todos los permisos
    Permission.VIEW_JUGADORES,
    Permission.CREATE_JUGADORES,
    Permission.EDIT_JUGADORES,
    Permission.DELETE_JUGADORES,
    Permission.VIEW_TORNEOS,
    Permission.CREATE_TORNEOS,
    Permission.EDIT_TORNEOS,
    Permission.DELETE_TORNEOS,
    Permission.VIEW_EQUIPOS,
    Permission.CREATE_EQUIPOS,
    Permission.EDIT_EQUIPOS,
    Permission.DELETE_EQUIPOS,
    Permission.VIEW_PARTIDOS,
    Permission.CREATE_PARTIDOS,
    Permission.EDIT_PARTIDOS,
    Permission.DELETE_PARTIDOS,
    Permission.VIEW_RESULTADOS,
    Permission.LOAD_RESULTADOS,
    Permission.VIEW_USUARIOS,
    Permission.CREATE_USUARIOS,
    Permission.EDIT_USUARIOS,
    Permission.DELETE_USUARIOS,
    Permission.MANAGE_SYSTEM,
  ],
  
  gestor: [
    // Maneja torneos y equipos
    Permission.VIEW_JUGADORES,
    Permission.CREATE_JUGADORES,
    Permission.EDIT_JUGADORES,
    Permission.VIEW_TORNEOS,
    Permission.CREATE_TORNEOS,
    Permission.EDIT_TORNEOS,
    Permission.DELETE_TORNEOS,
    Permission.VIEW_EQUIPOS,
    Permission.CREATE_EQUIPOS,
    Permission.EDIT_EQUIPOS,
    Permission.DELETE_EQUIPOS,
    Permission.VIEW_PARTIDOS,
    Permission.CREATE_PARTIDOS,
    Permission.VIEW_RESULTADOS,
  ],
  
  recepcionista: [
    // Carga asistencia y resultados, crea partidos
    Permission.VIEW_JUGADORES,
    Permission.VIEW_TORNEOS,
    Permission.VIEW_EQUIPOS,
    Permission.VIEW_PARTIDOS,
    Permission.CREATE_PARTIDOS,
    Permission.EDIT_PARTIDOS,
    Permission.VIEW_RESULTADOS,
    Permission.LOAD_RESULTADOS,
  ],
  
  arbitro: [
    // Solo carga resultados de partidos
    Permission.VIEW_JUGADORES,
    Permission.VIEW_TORNEOS,
    Permission.VIEW_EQUIPOS,
    Permission.VIEW_PARTIDOS,
    Permission.VIEW_RESULTADOS,
    Permission.LOAD_RESULTADOS,
  ],
  
  jugador: [
    // Solo visualización
    Permission.VIEW_JUGADORES,
    Permission.VIEW_TORNEOS,
    Permission.VIEW_EQUIPOS,
    Permission.VIEW_PARTIDOS,
    Permission.VIEW_RESULTADOS,
  ],
};
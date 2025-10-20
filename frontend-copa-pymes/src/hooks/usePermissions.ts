import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Permission, ROLE_PERMISSIONS } from '../types/auth';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role] || [];
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: Permission[]): boolean => {
    return permissionList.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (permissionList: Permission[]): boolean => {
    return permissionList.every(permission => permissions.includes(permission));
  };

  // Helpers específicos para acciones comunes
  const canView = (resource: 'jugadores' | 'torneos' | 'equipos' | 'partidos' | 'resultados' | 'usuarios'): boolean => {
    return hasPermission(`view_${resource}` as Permission);
  };

  const canCreate = (resource: 'jugadores' | 'torneos' | 'equipos' | 'partidos' | 'usuarios'): boolean => {
    return hasPermission(`create_${resource}` as Permission);
  };

  const canEdit = (resource: 'jugadores' | 'torneos' | 'equipos' | 'partidos' | 'usuarios'): boolean => {
    return hasPermission(`edit_${resource}` as Permission);
  };

  const canDelete = (resource: 'jugadores' | 'torneos' | 'equipos' | 'partidos' | 'usuarios'): boolean => {
    return hasPermission(`delete_${resource}` as Permission);
  };

  const canLoadResults = (): boolean => {
    return hasPermission(Permission.LOAD_RESULTADOS);
  };

  const isAdmin = (): boolean => {
    return user?.role === 'administrador';
  };

  const isGestor = (): boolean => {
    return user?.role === 'gestor';
  };

  const isRecepcionista = (): boolean => {
    return user?.role === 'recepcionista';
  };

  const isArbitro = (): boolean => {
    return user?.role === 'arbitro';
  };

  const isJugador = (): boolean => {
    return user?.role === 'jugador';
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canLoadResults,
    isAdmin,
    isGestor,
    isRecepcionista,
    isArbitro,
    isJugador,
    role: user?.role,
  };
};

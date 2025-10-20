import React, { ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../types/auth';

interface ProtectedActionProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  resource?: 'jugadores' | 'torneos' | 'equipos' | 'partidos' | 'resultados' | 'usuarios';
  action?: 'view' | 'create' | 'edit' | 'delete';
}

/**
 * Componente para proteger acciones basadas en permisos
 * 
 * Uso:
 * <ProtectedAction permission={Permission.CREATE_TORNEOS}>
 *   <button>Crear Torneo</button>
 * </ProtectedAction>
 * 
 * O usando resource y action:
 * <ProtectedAction resource="torneos" action="create">
 *   <button>Crear Torneo</button>
 * </ProtectedAction>
 */
export const ProtectedAction: React.FC<ProtectedActionProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  resource,
  action,
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canView,
    canCreate,
    canEdit,
    canDelete,
  } = usePermissions();

  let hasAccess = false;

  // Si se especifica resource y action
  if (resource && action) {
    switch (action) {
      case 'view':
        hasAccess = canView(resource);
        break;
      case 'create':
        hasAccess = canCreate(resource as any);
        break;
      case 'edit':
        hasAccess = canEdit(resource as any);
        break;
      case 'delete':
        hasAccess = canDelete(resource as any);
        break;
    }
  }
  // Si se especifica un único permiso
  else if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Si se especifican múltiples permisos
  else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }
  // Por defecto, permitir acceso si no se especifica nada
  else {
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

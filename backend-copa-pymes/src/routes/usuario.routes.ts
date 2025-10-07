import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { 
  authenticateToken, 
  requireAdministrador, 
  requireManagementPermissions, 
  requireRole 
} from '../middleware/auth.middleware';
import { UsuarioRole } from '../models/usuario.model';

const router = Router();

// Rutas públicas - ninguna para usuarios

// Rutas protegidas - requieren autenticación
router.use(authenticateToken);

// GET /usuarios - Ver usuarios
// Administradores: ven todos
// Gestores: solo ven jugadores
// Otros roles: no tienen acceso directo
router.get('/', requireRole([UsuarioRole.ADMINISTRADOR, UsuarioRole.GESTOR]), UsuarioController.getAll);

// GET /usuarios/rol/:role - Obtener usuarios por rol específico
// Solo administradores pueden ver usuarios de cualquier rol
router.get('/rol/:role', requireAdministrador, UsuarioController.getByRole);

// GET /usuarios/stats - Estadísticas de usuarios
// Solo administradores
router.get('/stats', requireAdministrador, UsuarioController.getStats);

// GET /usuarios/:id - Ver un usuario específico
// Administradores: cualquier usuario
// Gestores: solo jugadores
// Otros: solo su propio perfil (se maneja en el controlador)
router.get('/:id', UsuarioController.getById);

// POST /usuarios - Crear nuevo usuario
// Administradores: cualquier tipo de usuario
// Gestores: solo jugadores
router.post('/', requireManagementPermissions, UsuarioController.create);

// PUT /usuarios/:id - Actualizar usuario
// Administradores: cualquier usuario
// Gestores: solo jugadores
// Otros: solo su propio perfil (se maneja en el controlador)
router.put('/:id', UsuarioController.update);

// DELETE /usuarios/:id - Eliminar usuario
// Solo administradores
router.delete('/:id', requireAdministrador, UsuarioController.delete);

export { router as usuarioRoutes };
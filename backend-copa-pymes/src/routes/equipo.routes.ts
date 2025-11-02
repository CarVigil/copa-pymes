import { Router } from 'express';
import { EquipoController } from '../controllers/equipo.controller';
import { authenticateToken, requireAdmin, requireJugadorOrAdmin } from '../middleware/auth.middleware';

const router = Router();

// Rutas CRUD básicas
router.get('/', authenticateToken, requireJugadorOrAdmin, EquipoController.getAll);
router.get('/activos', authenticateToken, requireJugadorOrAdmin, EquipoController.getActivos);
router.get('/:id', authenticateToken, requireJugadorOrAdmin, EquipoController.getById);
router.post('/', authenticateToken, requireJugadorOrAdmin, EquipoController.create);
router.put('/:id', authenticateToken, requireJugadorOrAdmin, EquipoController.update);
router.delete('/:id', authenticateToken, requireJugadorOrAdmin, EquipoController.delete);

// Rutas adicionales
router.delete('/:id/permanent', authenticateToken, requireAdmin, EquipoController.deletePermanent);
router.patch('/:id/reactivate', authenticateToken, requireAdmin, EquipoController.reactivate);


// Rutas para gestión de jugadores en equipos
router.get('/:id/jugadores', authenticateToken, requireAdmin, EquipoController.getJugadoresDelEquipo);

router.post(
  '/:id/jugadores', authenticateToken, requireAdmin, EquipoController.agregarJugadorAlEquipo
);

router.delete(
  '/:id/jugadores/:jugadorId', authenticateToken, requireAdmin, EquipoController.quitarJugadorDelEquipo
);

export default router;
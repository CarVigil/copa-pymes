import { Router } from 'express';
import { JugadorController } from '../controllers/jugador.controller';
import { authenticateToken, requireAdmin, requireJugadorOrAdmin } from '../middleware/auth.middleware';

const router = Router();

// Rutas de solo lectura (jugadores y admins pueden ver)
router.get('/', authenticateToken, requireJugadorOrAdmin, JugadorController.getAll);
router.get('/:id', authenticateToken, requireJugadorOrAdmin, JugadorController.getById);

// Rutas de gestión (solo admins)
router.post('/', authenticateToken, requireAdmin, JugadorController.create);
router.put('/:id', authenticateToken, requireAdmin, JugadorController.update);
router.delete('/:id', authenticateToken, requireAdmin, JugadorController.delete);

export default router;

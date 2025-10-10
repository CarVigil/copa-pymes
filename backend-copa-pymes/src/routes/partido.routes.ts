import { Router } from 'express';
import { PartidoController } from '../controllers/partido.controller';
import { authenticateToken, requireAdmin, requireJugadorOrAdmin } from '../middleware/auth.middleware';

const router = Router();

// Lectura (jugadores y admins)
router.get('/', authenticateToken, requireJugadorOrAdmin, PartidoController.getAll);
router.get('/:id', authenticateToken, requireJugadorOrAdmin, PartidoController.getById);

// Gestión (solo admins)
router.post('/', authenticateToken, requireAdmin, PartidoController.create);
router.put('/:id', authenticateToken, requireAdmin, PartidoController.update);
router.delete('/:id', authenticateToken, requireAdmin, PartidoController.delete);

export default router;

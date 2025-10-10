import { Router } from 'express';
import { TorneoController } from '../controllers/torneo.controller';
import { authenticateToken, requireAdmin, requireJugadorOrAdmin } from '../middleware/auth.middleware';

const router = Router();

// Rutas de solo lectura (jugadores y admins pueden ver)
router.get('/', authenticateToken, requireJugadorOrAdmin, TorneoController.getAll);
router.get('/:id', authenticateToken, requireJugadorOrAdmin, TorneoController.getById);

// Rutas de gestión (solo admins)
router.post('/', authenticateToken, requireAdmin, TorneoController.create);
router.put('/:id', authenticateToken, requireAdmin, TorneoController.update);
router.delete('/:id', authenticateToken, requireAdmin, TorneoController.delete);
router.post('/:id/abrir-inscripciones', authenticateToken, requireAdmin, TorneoController.abrirInscripciones);
router.post('/:id/cerrar-inscripciones', authenticateToken, requireAdmin, TorneoController.cerrarInscripciones);

export default router;

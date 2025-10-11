import { Router } from 'express';
import { InscripcionController } from '../controllers/inscripcion.controller';
import { authenticateToken, requireAdmin, requireJugadorOrAdmin } from '../middleware/auth.middleware';

const router = Router();

// Rutas de solo lectura (jugadores y admins pueden ver)
router.get('/ ', authenticateToken, requireJugadorOrAdmin, InscripcionController.getByTorneoEquipo);

// Rutas de gestión (solo admins)
router.post('/', authenticateToken, requireAdmin, InscripcionController.create);
router.put('/:id/estado', authenticateToken, requireAdmin, InscripcionController.update);
router.delete('/:id', authenticateToken, requireAdmin, InscripcionController.delete);


export default router;


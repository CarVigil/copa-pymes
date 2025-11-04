import { Router } from 'express';
import { TorneoController } from '../controllers/torneo.controller';
import { InscripcionController } from '../controllers/inscripcion.controller';
import { PartidoController } from '../controllers/partido.controller';
import { authenticateToken, requireAdmin, requireJugadorOrAdmin } from '../middleware/auth.middleware';

const router = Router();

// Rutas de solo lectura (jugadores y admins pueden ver)
router.get('/', authenticateToken, requireJugadorOrAdmin, TorneoController.getAll);
router.get('/:id', authenticateToken, requireJugadorOrAdmin, TorneoController.getById);
router.get('/:id/equipos', authenticateToken, requireJugadorOrAdmin, InscripcionController.getEquiposByTorneo);
router.get('/:id/equipos-disponibles', authenticateToken, requireAdmin, InscripcionController.getEquiposDisponibles);
router.get('/:id/partidos', authenticateToken, requireJugadorOrAdmin, PartidoController.getPartidosByTorneo);

// Rutas de gestión (solo admins)
router.post('/', authenticateToken, requireAdmin, TorneoController.create);
router.put('/:id', authenticateToken, requireAdmin, TorneoController.update);
router.delete('/:id', authenticateToken, requireAdmin, TorneoController.delete);
router.post('/:id/abrir-inscripciones', authenticateToken, requireAdmin, TorneoController.abrirInscripciones);
router.post('/:id/cerrar-inscripciones', authenticateToken, requireAdmin, TorneoController.cerrarInscripciones);
router.post('/:id/equipos', authenticateToken, requireAdmin, InscripcionController.create);

export default router;

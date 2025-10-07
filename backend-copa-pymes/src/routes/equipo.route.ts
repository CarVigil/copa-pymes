import { Router } from 'express';
import { EquipoController } from '../controllers/equipo.controller';

const router = Router();

// Rutas CRUD básicas
router.get('/equipos', EquipoController.getAll);
router.get('/equipos/activos', EquipoController.getActivos);
router.get('/equipos/:id', EquipoController.getById);
router.post('/equipos', EquipoController.create);
router.put('/equipos/:id', EquipoController.update);
router.delete('/equipos/:id', EquipoController.delete);

// Rutas adicionales
router.delete('/equipos/:id/permanent', EquipoController.deletePermanent);
router.patch('/equipos/:id/reactivate', EquipoController.reactivate);

export default router;
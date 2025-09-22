import { Router } from 'express';
import { TorneoController } from '../controllers/torneo.controller';

const router = Router();

// Rutas para torneos
router.get('/', TorneoController.getAll);
router.get('/:id', TorneoController.getById);
router.post('/', TorneoController.create);
router.put('/:id', TorneoController.update);
router.delete('/:id', TorneoController.delete);

export default router;

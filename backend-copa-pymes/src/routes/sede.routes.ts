import { Router } from 'express';
import { SedeController } from '../controllers/sede.controller';

const router = Router();

// Rutas para jugadores
router.get('/', SedeController.getAll);
router.get('/:id', SedeController.getById);
router.post('/', SedeController.create);
router.put('/:id', SedeController.update);
router.delete('/:id', SedeController.delete);

export default router;

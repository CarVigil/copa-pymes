import { Router } from 'express';
import { JugadorController } from '../controllers/jugador.controller';

const router = Router();

// Rutas para jugadores
router.get('/', JugadorController.getAll);
router.get('/:id', JugadorController.getById);
router.post('/', JugadorController.create);
router.put('/:id', JugadorController.update);
router.delete('/:id', JugadorController.delete);

export default router;

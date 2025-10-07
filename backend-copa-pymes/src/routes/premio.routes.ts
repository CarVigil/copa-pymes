import { Router } from 'express';
import { PremioController } from '../controllers/premio.controller';

const router = Router();

// Rutas para premios
router.get('/premios', PremioController.getAll);
router.get('/premios/:fecha_entrega/:id_torneo', PremioController.getById);
router.get('/premios/torneo/:id_torneo', PremioController.getByTorneo);
router.post('/premios', PremioController.create);
router.put('/premios/:fecha_entrega/:id_torneo', PremioController.update);
router.delete('/premios/:fecha_entrega/:id_torneo', PremioController.delete);

export default router;





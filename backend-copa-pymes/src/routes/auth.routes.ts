import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
router.post('/login', AuthController.login);

router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/change-password', authenticateToken, AuthController.changePassword);
router.post('/register', authenticateToken, requireAdmin, AuthController.register);
router.get('/users', authenticateToken, requireAdmin, AuthController.getUsers);

export default router;
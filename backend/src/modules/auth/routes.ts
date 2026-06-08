import { Router } from 'express';
import { AuthController } from './controller';
import { authenticateJWT, requireRole } from '../../middleware/auth';

const router = Router();
const controller = new AuthController();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', authenticateJWT, controller.me);
router.get('/judges', authenticateJWT, requireRole(['SUPERADMIN', 'ADMIN']), controller.getJudges);

// Admin CRUD routes (SUPERADMIN only)
router.get('/admins', authenticateJWT, requireRole(['SUPERADMIN']), controller.getAdmins);
router.post('/admins', authenticateJWT, requireRole(['SUPERADMIN']), controller.createAdmin);
router.put('/admins/:id', authenticateJWT, requireRole(['SUPERADMIN']), controller.updateAdmin);
router.delete('/admins/:id', authenticateJWT, requireRole(['SUPERADMIN']), controller.deleteAdmin);

export default router;

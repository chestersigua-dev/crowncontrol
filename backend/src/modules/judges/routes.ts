import { Router } from 'express';
import { JudgesController } from './controller';
import { authenticateJWT, requireRole } from '../../middleware/auth';

const router = Router();
const controller = new JudgesController();

// Only admin can list all judges
router.get('/', authenticateJWT, requireRole(['SUPERADMIN', 'ADMIN']), controller.getAll);

// Judges can check their own progress, admins can check anyone's
router.get('/progress', authenticateJWT, controller.getProgress);
router.get('/:id/progress', authenticateJWT, controller.getProgress);

// Mutation endpoints
router.put('/:id', authenticateJWT, controller.update);
router.delete('/:id', authenticateJWT, requireRole(['SUPERADMIN', 'ADMIN']), controller.delete);

export default router;

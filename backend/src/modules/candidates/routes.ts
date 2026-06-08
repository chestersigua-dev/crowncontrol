import { Router } from 'express';
import { CandidatesController } from './controller';
import { authenticateJWT, requireRole } from '../../middleware/auth';

const router = Router();
const controller = new CandidatesController();

// Publicly readable for voting / info
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);

// Admin-only mutations
router.post('/', authenticateJWT, requireRole(['SUPERADMIN', 'ADMIN']), controller.create);
router.put('/:id', authenticateJWT, requireRole(['SUPERADMIN', 'ADMIN']), controller.update);
router.delete('/:id', authenticateJWT, requireRole(['SUPERADMIN', 'ADMIN']), controller.delete);

export default router;

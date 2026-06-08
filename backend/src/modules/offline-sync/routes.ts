import { Router } from 'express';
import { OfflineSyncController } from './controller';
import { authenticateJWT, requireRole } from '../../middleware/auth';

const router = Router();
const controller = new OfflineSyncController();

// Only authenticated judges/admins can sync/process scores
router.use(authenticateJWT, requireRole(['JUDGE', 'ADMIN']));

router.post('/sync', controller.sync);
router.post('/process', controller.process);

export default router;

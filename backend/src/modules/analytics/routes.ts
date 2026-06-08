import { Router } from 'express';
import { AnalyticsController } from './controller';
import { authenticateJWT, requireRole } from '../../middleware/auth';

const router = Router();
const controller = new AnalyticsController();

// Public route (unauthenticated)
router.get('/public/leaderboard', controller.getPublicLeaderboard);

// All analytics routes require ADMIN login
router.use(authenticateJWT, requireRole(['ADMIN']));

router.get('/leaderboard/:sectionId', controller.getLeaderboard);
router.get('/judge-behavior', controller.getJudgeBehavior);
router.post('/snapshots', controller.createSnapshot);
router.get('/snapshots/:sectionId', controller.getSnapshotHistory);

export default router;

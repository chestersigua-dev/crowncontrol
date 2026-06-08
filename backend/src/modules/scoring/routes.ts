import { Router } from 'express';
import { ScoringController } from './controller';
import { authenticateJWT, requireRole } from '../../middleware/auth';

const router = Router();
const controller = new ScoringController();

// Judges submit scores
router.post('/submit', authenticateJWT, requireRole(['JUDGE', 'ADMIN']), controller.submit);

// Read scores (Admins only for overall overview)
router.get('/section/:sectionId', authenticateJWT, requireRole(['ADMIN']), controller.getBySection);

// Retrieve individual judge score for a candidate in a section (for judges to see and modify their evaluation)
router.get('/candidate/:candidateId/section/:sectionId', authenticateJWT, requireRole(['JUDGE', 'ADMIN']), controller.getJudgeScore);

export default router;

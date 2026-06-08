import { Router } from 'express';
import { SettingsController } from './controller';
import { authenticateJWT, requireRole } from '../../middleware/auth';

const router = Router();
const controller = new SettingsController();

// Publicly readable branding config (no auth required)
router.get('/branding', controller.getBranding);

// Active section is readable by authenticated judges/admins
router.get('/active', authenticateJWT, controller.getActive);

// Admin-only setup
router.get('/', authenticateJWT, requireRole(['SUPERADMIN', 'ADMIN']), controller.getSections);
router.post('/sections', authenticateJWT, requireRole(['SUPERADMIN', 'ADMIN']), controller.createSection);
router.put('/sections/:id', authenticateJWT, requireRole(['SUPERADMIN', 'ADMIN']), controller.updateSection);
router.delete('/sections/:id', authenticateJWT, requireRole(['SUPERADMIN', 'ADMIN']), controller.deleteSection);
router.post('/sections/:id/activate', authenticateJWT, requireRole(['SUPERADMIN', 'ADMIN']), controller.activate);

router.post('/criteria', authenticateJWT, requireRole(['SUPERADMIN', 'ADMIN']), controller.createCriteria);
router.delete('/criteria/:id', authenticateJWT, requireRole(['SUPERADMIN', 'ADMIN']), controller.deleteCriteria);

// Admin-only branding update (SUPERADMIN only)
router.post('/branding', authenticateJWT, requireRole(['SUPERADMIN']), controller.updateBranding);

// Admin-only system reset (SUPERADMIN only)
router.post('/reset', authenticateJWT, requireRole(['SUPERADMIN']), controller.resetSystem);

export default router;

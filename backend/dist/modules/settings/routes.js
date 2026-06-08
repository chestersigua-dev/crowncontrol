"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const controller = new controller_1.SettingsController();
// Publicly readable branding config (no auth required)
router.get('/branding', controller.getBranding);
// Active section is readable by authenticated judges/admins
router.get('/active', auth_1.authenticateJWT, controller.getActive);
// Admin-only setup
router.get('/', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN', 'ADMIN']), controller.getSections);
router.post('/sections', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN', 'ADMIN']), controller.createSection);
router.put('/sections/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN', 'ADMIN']), controller.updateSection);
router.delete('/sections/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN', 'ADMIN']), controller.deleteSection);
router.post('/sections/:id/activate', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN', 'ADMIN']), controller.activate);
router.post('/criteria', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN', 'ADMIN']), controller.createCriteria);
router.delete('/criteria/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN', 'ADMIN']), controller.deleteCriteria);
// Admin-only branding update (SUPERADMIN only)
router.post('/branding', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN']), controller.updateBranding);
// Admin-only system reset (SUPERADMIN only)
router.post('/reset', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN']), controller.resetSystem);
exports.default = router;

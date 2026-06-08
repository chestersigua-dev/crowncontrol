"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const controller = new controller_1.AuthController();
router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', auth_1.authenticateJWT, controller.me);
router.get('/judges', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN', 'ADMIN']), controller.getJudges);
// Admin CRUD routes (SUPERADMIN only)
router.get('/admins', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN']), controller.getAdmins);
router.post('/admins', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN']), controller.createAdmin);
router.put('/admins/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN']), controller.updateAdmin);
router.delete('/admins/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN']), controller.deleteAdmin);
exports.default = router;

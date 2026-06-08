"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const controller = new controller_1.JudgesController();
// Only admin can list all judges
router.get('/', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN', 'ADMIN']), controller.getAll);
// Judges can check their own progress, admins can check anyone's
router.get('/progress', auth_1.authenticateJWT, controller.getProgress);
router.get('/:id/progress', auth_1.authenticateJWT, controller.getProgress);
// Mutation endpoints
router.put('/:id', auth_1.authenticateJWT, controller.update);
router.delete('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN', 'ADMIN']), controller.delete);
exports.default = router;

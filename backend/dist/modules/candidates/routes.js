"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const controller = new controller_1.CandidatesController();
// Publicly readable for voting / info
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
// Admin-only mutations
router.post('/', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN', 'ADMIN']), controller.create);
router.put('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN', 'ADMIN']), controller.update);
router.delete('/:id', auth_1.authenticateJWT, (0, auth_1.requireRole)(['SUPERADMIN', 'ADMIN']), controller.delete);
exports.default = router;

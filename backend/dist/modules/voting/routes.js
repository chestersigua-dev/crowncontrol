"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const controller = new controller_1.VotingController();
// Public endpoints (no authentication, but token verified inside service)
router.post('/vote', controller.vote);
router.get('/validate', controller.validateToken);
// Admin-only endpoints
router.post('/qr-session', auth_1.authenticateJWT, (0, auth_1.requireRole)(['ADMIN']), controller.generateQR);
router.get('/sessions', auth_1.authenticateJWT, (0, auth_1.requireRole)(['ADMIN']), controller.getActive);
exports.default = router;

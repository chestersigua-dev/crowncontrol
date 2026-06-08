"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const controller = new controller_1.OfflineSyncController();
// Only authenticated judges/admins can sync/process scores
router.use(auth_1.authenticateJWT, (0, auth_1.requireRole)(['JUDGE', 'ADMIN']));
router.post('/sync', controller.sync);
router.post('/process', controller.process);
exports.default = router;

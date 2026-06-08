"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const controller = new controller_1.AnalyticsController();
// Public route (unauthenticated)
router.get('/public/leaderboard', controller.getPublicLeaderboard);
// All analytics routes require ADMIN login
router.use(auth_1.authenticateJWT, (0, auth_1.requireRole)(['ADMIN']));
router.get('/leaderboard/:sectionId', controller.getLeaderboard);
router.get('/judge-behavior', controller.getJudgeBehavior);
router.post('/snapshots', controller.createSnapshot);
router.get('/snapshots/:sectionId', controller.getSnapshotHistory);
exports.default = router;

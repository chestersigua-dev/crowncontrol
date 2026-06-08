"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const controller = new controller_1.ScoringController();
// Judges submit scores
router.post('/submit', auth_1.authenticateJWT, (0, auth_1.requireRole)(['JUDGE', 'ADMIN']), controller.submit);
// Read scores (Admins only for overall overview)
router.get('/section/:sectionId', auth_1.authenticateJWT, (0, auth_1.requireRole)(['ADMIN']), controller.getBySection);
// Retrieve individual judge score for a candidate in a section (for judges to see and modify their evaluation)
router.get('/candidate/:candidateId/section/:sectionId', auth_1.authenticateJWT, (0, auth_1.requireRole)(['JUDGE', 'ADMIN']), controller.getJudgeScore);
exports.default = router;

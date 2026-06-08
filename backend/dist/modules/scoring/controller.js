"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringController = void 0;
const service_1 = require("./service");
const dto_1 = require("./dto");
class ScoringController {
    service = new service_1.ScoringService();
    submit = async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const error = (0, dto_1.validateSubmitScore)(req.body);
        if (error) {
            return res.status(400).json({ error });
        }
        try {
            const result = await this.service.submitScore(req.user.id, req.body);
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    getBySection = async (req, res) => {
        try {
            const scores = await this.service.getScoresForSection(req.params.sectionId);
            return res.status(200).json(scores);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    getJudgeScore = async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        try {
            const score = await this.service.getJudgeScore(req.user.id, req.params.candidateId, req.params.sectionId);
            return res.status(200).json(score);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
}
exports.ScoringController = ScoringController;

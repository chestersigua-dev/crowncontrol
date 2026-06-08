"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JudgesController = void 0;
const service_1 = require("./service");
const dto_1 = require("./dto");
class JudgesController {
    service = new service_1.JudgesService();
    getAll = async (req, res) => {
        try {
            const judges = await this.service.listJudges();
            return res.status(200).json(judges);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    getProgress = async (req, res) => {
        const judgeId = req.params.id || req.user?.id;
        if (!judgeId) {
            return res.status(400).json({ error: 'Judge ID is required' });
        }
        try {
            const progress = await this.service.getJudgeProgress(judgeId);
            return res.status(200).json(progress);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    update = async (req, res) => {
        const id = req.params.id;
        // Judges can only update themselves, Admins can update any judge
        if (req.user?.role !== 'ADMIN' && req.user?.id !== id) {
            return res.status(430).json({ error: 'Unauthorized profile update' });
        }
        const error = (0, dto_1.validateUpdateJudge)(req.body);
        if (error) {
            return res.status(400).json({ error });
        }
        try {
            const result = await this.service.updateJudge(id, req.body);
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    delete = async (req, res) => {
        try {
            await this.service.deleteJudge(req.params.id);
            return res.status(200).json({ message: 'Judge deleted successfully' });
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
}
exports.JudgesController = JudgesController;

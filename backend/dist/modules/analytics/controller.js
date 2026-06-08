"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const service_1 = require("./service");
class AnalyticsController {
    service = new service_1.AnalyticsService();
    getLeaderboard = async (req, res) => {
        const sectionId = req.params.sectionId;
        if (!sectionId) {
            return res.status(400).json({ error: 'Section ID is required' });
        }
        try {
            const data = await this.service.getLeaderboard(sectionId);
            return res.status(200).json(data);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    getJudgeBehavior = async (req, res) => {
        try {
            const stats = await this.service.getJudgeBehavior();
            return res.status(200).json(stats);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    createSnapshot = async (req, res) => {
        const sectionId = req.body.sectionId;
        if (!sectionId) {
            return res.status(400).json({ error: 'Section ID is required' });
        }
        try {
            const snapshots = await this.service.createSnapshot(sectionId);
            return res.status(201).json({ message: 'Snapshot generated successfully', snapshots });
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    getSnapshotHistory = async (req, res) => {
        const sectionId = req.params.sectionId;
        try {
            const history = await this.service.getSnapshotHistory(sectionId);
            return res.status(200).json(history);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    getPublicLeaderboard = async (req, res) => {
        try {
            const data = await this.service.getPublicLeaderboard();
            if (!data) {
                return res.status(404).json({ error: 'No active pageant section found' });
            }
            return res.status(200).json(data);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
}
exports.AnalyticsController = AnalyticsController;

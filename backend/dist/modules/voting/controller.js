"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotingController = void 0;
const service_1 = require("./service");
const dto_1 = require("./dto");
class VotingController {
    service = new service_1.VotingService();
    generateQR = async (req, res) => {
        try {
            const qrData = await this.service.generateVotingQR();
            return res.status(200).json(qrData);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    validateToken = async (req, res) => {
        const token = req.query.token;
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }
        try {
            const result = await this.service.validateToken(token);
            if (!result.isValid) {
                return res.status(400).json({ error: result.reason });
            }
            return res.status(200).json({ valid: true, session: result.session });
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    vote = async (req, res) => {
        const error = (0, dto_1.validateVote)(req.body);
        if (error) {
            return res.status(400).json({ error });
        }
        try {
            const vote = await this.service.submitVote(req.body);
            return res.status(201).json({ message: 'Vote recorded successfully', vote });
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    getActive = async (req, res) => {
        try {
            const sessions = await this.service.getActiveSessions();
            return res.status(200).json(sessions);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
}
exports.VotingController = VotingController;

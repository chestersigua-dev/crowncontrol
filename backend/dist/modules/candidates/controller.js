"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidatesController = void 0;
const service_1 = require("./service");
const dto_1 = require("./dto");
class CandidatesController {
    service = new service_1.CandidatesService();
    getAll = async (req, res) => {
        try {
            const candidates = await this.service.listCandidates();
            return res.status(200).json(candidates);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    getOne = async (req, res) => {
        try {
            const candidate = await this.service.getCandidate(req.params.id);
            return res.status(200).json(candidate);
        }
        catch (err) {
            return res.status(404).json({ error: err.message });
        }
    };
    create = async (req, res) => {
        const error = (0, dto_1.validateCandidate)(req.body);
        if (error) {
            return res.status(400).json({ error });
        }
        try {
            const candidate = await this.service.createCandidate(req.body);
            return res.status(201).json(candidate);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    update = async (req, res) => {
        try {
            const candidate = await this.service.updateCandidate(req.params.id, req.body);
            return res.status(200).json(candidate);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    delete = async (req, res) => {
        try {
            await this.service.deleteCandidate(req.params.id);
            return res.status(200).json({ message: 'Candidate deleted successfully' });
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
}
exports.CandidatesController = CandidatesController;

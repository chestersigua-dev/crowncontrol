"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidatesService = void 0;
const repository_1 = require("./repository");
class CandidatesService {
    repository = new repository_1.CandidatesRepository();
    async listCandidates() {
        return this.repository.getAll();
    }
    async getCandidate(id) {
        const candidate = await this.repository.getById(id);
        if (!candidate) {
            throw new Error('Candidate not found');
        }
        return candidate;
    }
    async createCandidate(data) {
        const existing = await this.repository.getByNumber(data.number);
        if (existing) {
            throw new Error(`Candidate with number ${data.number} already exists`);
        }
        return this.repository.create(data);
    }
    async updateCandidate(id, data) {
        const candidate = await this.repository.getById(id);
        if (!candidate) {
            throw new Error('Candidate not found');
        }
        if (data.number !== undefined && data.number !== candidate.number) {
            const existing = await this.repository.getByNumber(data.number);
            if (existing) {
                throw new Error(`Candidate with number ${data.number} already exists`);
            }
        }
        return this.repository.update(id, data);
    }
    async deleteCandidate(id) {
        const candidate = await this.repository.getById(id);
        if (!candidate) {
            throw new Error('Candidate not found');
        }
        return this.repository.delete(id);
    }
}
exports.CandidatesService = CandidatesService;

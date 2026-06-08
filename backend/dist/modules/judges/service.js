"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JudgesService = void 0;
const repository_1 = require("./repository");
class JudgesService {
    repository = new repository_1.JudgesRepository();
    async listJudges() {
        return this.repository.getJudgesList();
    }
    async getJudgeProgress(judgeId) {
        const scores = await this.repository.getJudgeProgress(judgeId);
        // Structure scoring progress map: candidateId -> sectionId -> score
        const progressMap = {};
        for (const score of scores) {
            if (!progressMap[score.candidateId]) {
                progressMap[score.candidateId] = {};
            }
            progressMap[score.candidateId][score.pageantSectionId] = score.computedScore;
        }
        return progressMap;
    }
    async updateJudge(id, data) {
        return this.repository.updateProfile(id, data);
    }
    async deleteJudge(id) {
        return this.repository.deleteJudge(id);
    }
}
exports.JudgesService = JudgesService;

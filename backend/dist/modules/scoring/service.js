"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringService = void 0;
const repository_1 = require("./repository");
const socket_1 = require("../../config/socket");
class ScoringService {
    repository = new repository_1.ScoringRepository();
    async submitScore(judgeId, data) {
        const criteriaList = await this.repository.getCriteriaMap(data.pageantSectionId);
        if (criteriaList.length === 0) {
            throw new Error('No criteria found for this pageant section');
        }
        // Verify all criteria of this section are provided
        const criteriaIds = criteriaList.map(c => c.id);
        const submittedIds = data.scores.map(s => s.criteriaId);
        const missingIds = criteriaIds.filter(id => !submittedIds.includes(id));
        if (missingIds.length > 0) {
            throw new Error(`Missing scores for criteria IDs: ${missingIds.join(', ')}`);
        }
        // Calculate computed score
        // computedScore = Sum( (points / maxPoints) * criteriaWeight ) * 100
        let computedScore = 0;
        let totalWeight = 0;
        for (const criteria of criteriaList) {
            const submission = data.scores.find(s => s.criteriaId === criteria.id);
            if (!submission)
                continue;
            if (submission.points > criteria.maxPoints) {
                throw new Error(`Points for criteria ${criteria.name} exceeds max limit of ${criteria.maxPoints}`);
            }
            // We sum up the weighted points
            const normalizedScore = (submission.points / criteria.maxPoints) * criteria.weight;
            computedScore += normalizedScore;
            totalWeight += criteria.weight;
        }
        // Adjust in case weights do not equal 1.0 (though they should)
        if (totalWeight > 0) {
            computedScore = (computedScore / totalWeight) * 100;
        }
        else {
            computedScore = 0;
        }
        // Round to 2 decimal places
        computedScore = Math.round(computedScore * 100) / 100;
        const saved = await this.repository.saveScore(judgeId, data, computedScore);
        // Broadcast live scoring update
        (0, socket_1.broadcastScoreUpdate)({
            type: 'score:update',
            judgeId,
            judgeName: saved.judge.name,
            candidateId: saved.candidateId,
            candidateNumber: saved.candidate.number,
            candidateName: `${saved.candidate.firstName} ${saved.candidate.lastName}`,
            sectionId: saved.pageantSectionId,
            sectionName: saved.section.name,
            computedScore: saved.computedScore
        });
        return saved;
    }
    async getScoresForSection(sectionId) {
        return this.repository.getScoresBySection(sectionId);
    }
    async getJudgeScore(judgeId, candidateId, sectionId) {
        return this.repository.getScore(judgeId, candidateId, sectionId);
    }
}
exports.ScoringService = ScoringService;

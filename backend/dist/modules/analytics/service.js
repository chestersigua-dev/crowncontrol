"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const repository_1 = require("./repository");
class AnalyticsService {
    repository = new repository_1.AnalyticsRepository();
    async getLeaderboard(sectionId) {
        const scores = await this.repository.getScoresBySection(sectionId);
        // Group scores by candidate
        const candidateScores = {};
        for (const score of scores) {
            if (!candidateScores[score.candidateId]) {
                candidateScores[score.candidateId] = {
                    candidateNumber: score.candidate.number,
                    candidateName: `${score.candidate.firstName} ${score.candidate.lastName}`,
                    avatarUrl: score.candidate.avatarUrl,
                    scores: []
                };
            }
            candidateScores[score.candidateId].scores.push(score.computedScore);
        }
        // Map to entries with averages
        const entries = Object.keys(candidateScores).map(candidateId => {
            const item = candidateScores[candidateId];
            const sum = item.scores.reduce((a, b) => a + b, 0);
            const avg = item.scores.length > 0 ? sum / item.scores.length : 0;
            return {
                candidateId,
                candidateNumber: item.candidateNumber,
                candidateName: item.candidateName,
                avatarUrl: item.avatarUrl,
                averageScore: Math.round(avg * 100) / 100,
                judgeCount: item.scores.length,
                rank: 0 // Will assign below
            };
        });
        // Sort by average score descending
        entries.sort((a, b) => b.averageScore - a.averageScore);
        // Assign ranks
        entries.forEach((entry, idx) => {
            entry.rank = idx + 1;
        });
        return entries;
    }
    async getJudgeBehavior() {
        const scores = await this.repository.getJudgeScoringStats();
        // Group scores by judge
        const judgeStats = {};
        for (const score of scores) {
            if (!judgeStats[score.judgeId]) {
                judgeStats[score.judgeId] = {
                    judgeName: score.judge.name,
                    isChairman: score.judge.isChairman,
                    scores: []
                };
            }
            judgeStats[score.judgeId].scores.push(score.computedScore);
        }
        return Object.keys(judgeStats).map(judgeId => {
            const item = judgeStats[judgeId];
            const sum = item.scores.reduce((a, b) => a + b, 0);
            const avg = item.scores.length > 0 ? sum / item.scores.length : 0;
            return {
                judgeId,
                judgeName: item.judgeName,
                isChairman: item.isChairman,
                averageScoreGiven: Math.round(avg * 100) / 100,
                totalCandidatesScored: item.scores.length
            };
        });
    }
    async createSnapshot(sectionId) {
        const leaderboard = await this.getLeaderboard(sectionId);
        const savedSnapshots = [];
        for (const entry of leaderboard) {
            const snap = await this.repository.saveSnapshot(entry.candidateId, sectionId, entry.averageScore, entry.rank);
            savedSnapshots.push(snap);
        }
        return savedSnapshots;
    }
    async getSnapshotHistory(sectionId) {
        return this.repository.getSnapshots(sectionId);
    }
    async getPublicLeaderboard() {
        const enabledSetting = await database_1.prisma.systemSetting.findUnique({
            where: { key: 'public_rankings_enabled' }
        });
        const isEnabled = enabledSetting ? enabledSetting.value === 'true' : true;
        if (!isEnabled) {
            throw new Error('Public live rankings board is currently disabled by the event administrator.');
        }
        const activeSection = await database_1.prisma.pageantSection.findFirst({
            where: { isActive: true }
        });
        if (!activeSection) {
            return null;
        }
        const leaderboard = await this.getLeaderboard(activeSection.id);
        return {
            sectionName: activeSection.name,
            leaderboard
        };
    }
}
exports.AnalyticsService = AnalyticsService;
// Import prisma reference
const database_1 = require("../../config/database");

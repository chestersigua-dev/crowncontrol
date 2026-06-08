"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringRepository = void 0;
const database_1 = require("../../config/database");
class ScoringRepository {
    async getCriteriaMap(pageantSectionId) {
        return database_1.prisma.criteria.findMany({
            where: { pageantSectionId }
        });
    }
    async getScore(judgeId, candidateId, pageantSectionId) {
        return database_1.prisma.score.findUnique({
            where: {
                judgeId_candidateId_pageantSectionId: {
                    judgeId,
                    candidateId,
                    pageantSectionId
                }
            },
            include: {
                details: true
            }
        });
    }
    async saveScore(judgeId, data, computedScore) {
        return database_1.prisma.$transaction(async (tx) => {
            // Check if score exists
            const existing = await tx.score.findUnique({
                where: {
                    judgeId_candidateId_pageantSectionId: {
                        judgeId,
                        candidateId: data.candidateId,
                        pageantSectionId: data.pageantSectionId
                    }
                }
            });
            if (existing) {
                // Delete details
                await tx.scoreDetail.deleteMany({
                    where: { scoreId: existing.id }
                });
                // Update score
                const updated = await tx.score.update({
                    where: { id: existing.id },
                    data: {
                        computedScore,
                        isSyncedFromOffline: data.isSyncedFromOffline || false,
                        details: {
                            create: data.scores.map(s => ({
                                criteriaId: s.criteriaId,
                                points: s.points
                            }))
                        }
                    },
                    include: {
                        details: true,
                        candidate: true,
                        section: true,
                        judge: {
                            select: { name: true }
                        }
                    }
                });
                return updated;
            }
            else {
                // Create new
                const created = await tx.score.create({
                    data: {
                        judgeId,
                        candidateId: data.candidateId,
                        pageantSectionId: data.pageantSectionId,
                        computedScore,
                        isSyncedFromOffline: data.isSyncedFromOffline || false,
                        details: {
                            create: data.scores.map(s => ({
                                criteriaId: s.criteriaId,
                                points: s.points
                            }))
                        }
                    },
                    include: {
                        details: true,
                        candidate: true,
                        section: true,
                        judge: {
                            select: { name: true }
                        }
                    }
                });
                return created;
            }
        });
    }
    async getScoresBySection(pageantSectionId) {
        return database_1.prisma.score.findMany({
            where: { pageantSectionId },
            include: {
                candidate: true,
                judge: { select: { name: true } }
            }
        });
    }
}
exports.ScoringRepository = ScoringRepository;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRepository = void 0;
const database_1 = require("../../config/database");
class AnalyticsRepository {
    async getScoresBySection(sectionId) {
        return database_1.prisma.score.findMany({
            where: { pageantSectionId: sectionId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        number: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true
                    }
                }
            }
        });
    }
    async getJudgeScoringStats() {
        return database_1.prisma.score.findMany({
            include: {
                judge: {
                    select: {
                        id: true,
                        name: true,
                        isChairman: true
                    }
                }
            }
        });
    }
    async saveSnapshot(candidateId, sectionId, totalScore, rankPosition) {
        return database_1.prisma.scoreAnalyticsSnapshot.create({
            data: {
                candidateId,
                sectionId,
                totalScore,
                rankPosition
            }
        });
    }
    async getSnapshots(sectionId) {
        return database_1.prisma.scoreAnalyticsSnapshot.findMany({
            where: { sectionId },
            include: {
                candidate: {
                    select: {
                        firstName: true,
                        lastName: true,
                        number: true
                    }
                }
            },
            orderBy: { computedAt: 'desc' }
        });
    }
}
exports.AnalyticsRepository = AnalyticsRepository;

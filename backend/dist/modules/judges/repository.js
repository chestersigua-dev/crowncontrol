"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JudgesRepository = void 0;
const database_1 = require("../../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class JudgesRepository {
    async getJudgesList() {
        return database_1.prisma.user.findMany({
            where: { role: 'JUDGE' },
            select: {
                id: true,
                username: true,
                name: true,
                isChairman: true,
                createdAt: true,
                _count: {
                    select: { scores: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }
    async getJudgeProgress(judgeId) {
        const scores = await database_1.prisma.score.findMany({
            where: { judgeId },
            select: {
                candidateId: true,
                pageantSectionId: true,
                computedScore: true
            }
        });
        return scores;
    }
    async updateProfile(id, data) {
        const updatePayload = {};
        if (data.name)
            updatePayload.name = data.name;
        if (data.password) {
            updatePayload.password = await bcryptjs_1.default.hash(data.password, 10);
        }
        return database_1.prisma.user.update({
            where: { id },
            data: updatePayload,
            select: {
                id: true,
                username: true,
                name: true,
                role: true
            }
        });
    }
    async deleteJudge(id) {
        return database_1.prisma.user.delete({
            where: { id },
        });
    }
}
exports.JudgesRepository = JudgesRepository;

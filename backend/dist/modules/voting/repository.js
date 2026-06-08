"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotingRepository = void 0;
const database_1 = require("../../config/database");
class VotingRepository {
    async createQRSession(token, expiresAt) {
        return database_1.prisma.qRVoteSession.create({
            data: {
                qrCodeToken: token,
                expiresAt,
            },
        });
    }
    async getSessionByToken(token) {
        return database_1.prisma.qRVoteSession.findUnique({
            where: { qrCodeToken: token },
        });
    }
    async deactivateSession(id) {
        return database_1.prisma.qRVoteSession.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async checkDeviceVotedToday(deviceId) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        return database_1.prisma.audienceVote.findFirst({
            where: {
                deviceId,
                voteDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });
    }
    async castVote(candidateId, deviceId) {
        return database_1.prisma.audienceVote.create({
            data: {
                candidateId,
                deviceId,
            },
            include: {
                candidate: true,
            },
        });
    }
    async getActiveSessions() {
        return database_1.prisma.qRVoteSession.findMany({
            where: {
                isActive: true,
                expiresAt: { gte: new Date() }
            },
            orderBy: { expiresAt: 'desc' }
        });
    }
}
exports.VotingRepository = VotingRepository;

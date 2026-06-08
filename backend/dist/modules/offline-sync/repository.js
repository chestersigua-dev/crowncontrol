"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineSyncRepository = void 0;
const database_1 = require("../../config/database");
class OfflineSyncRepository {
    async saveOfflineScore(judgeId, payload) {
        return database_1.prisma.offlineScoreQueue.create({
            data: {
                judgeId,
                payload: JSON.stringify(payload),
            },
        });
    }
    async getUnsynced() {
        return database_1.prisma.offlineScoreQueue.findMany({
            where: { synced: false },
            orderBy: { createdAt: 'asc' },
        });
    }
    async markSynced(id) {
        return database_1.prisma.offlineScoreQueue.update({
            where: { id },
            data: { synced: true },
        });
    }
}
exports.OfflineSyncRepository = OfflineSyncRepository;

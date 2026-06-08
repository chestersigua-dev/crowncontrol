import { prisma } from '../../config/database';

export class OfflineSyncRepository {
  async saveOfflineScore(judgeId: string, payload: any) {
    return prisma.offlineScoreQueue.create({
      data: {
        judgeId,
        payload: JSON.stringify(payload),
      },
    });
  }

  async getUnsynced() {
    return prisma.offlineScoreQueue.findMany({
      where: { synced: false },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markSynced(id: string) {
    return prisma.offlineScoreQueue.update({
      where: { id },
      data: { synced: true },
    });
  }
}

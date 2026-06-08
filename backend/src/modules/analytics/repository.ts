import { prisma } from '../../config/database';

export class AnalyticsRepository {
  async getScoresBySection(sectionId: string) {
    return prisma.score.findMany({
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
    return prisma.score.findMany({
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

  async saveSnapshot(candidateId: string, sectionId: string, totalScore: number, rankPosition: number) {
    return prisma.scoreAnalyticsSnapshot.create({
      data: {
        candidateId,
        sectionId,
        totalScore,
        rankPosition
      }
    });
  }

  async getSnapshots(sectionId: string) {
    return prisma.scoreAnalyticsSnapshot.findMany({
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

import { prisma } from '../../config/database';
import { SubmitScoreDTO } from './dto';

export class ScoringRepository {
  async getCriteriaMap(pageantSectionId: string) {
    return prisma.criteria.findMany({
      where: { pageantSectionId }
    });
  }

  async getScore(judgeId: string, candidateId: string, pageantSectionId: string) {
    return prisma.score.findUnique({
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

  async saveScore(
    judgeId: string,
    data: SubmitScoreDTO,
    computedScore: number
  ) {
    return prisma.$transaction(async (tx) => {
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
      } else {
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

  async getScoresBySection(pageantSectionId: string) {
    return prisma.score.findMany({
      where: { pageantSectionId },
      include: {
        candidate: true,
        judge: { select: { name: true } }
      }
    });
  }
}

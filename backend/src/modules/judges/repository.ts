import { prisma } from '../../config/database';
import bcrypt from 'bcryptjs';
import { UpdateJudgeProfileDTO } from './dto';

export class JudgesRepository {
  async getJudgesList() {
    return prisma.user.findMany({
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

  async getJudgeProgress(judgeId: string) {
    const scores = await prisma.score.findMany({
      where: { judgeId },
      select: {
        candidateId: true,
        pageantSectionId: true,
        computedScore: true
      }
    });
    return scores;
  }

  async updateProfile(id: string, data: UpdateJudgeProfileDTO) {
    const updatePayload: any = {};
    if (data.name) updatePayload.name = data.name;
    if (data.password) {
      updatePayload.password = await bcrypt.hash(data.password, 10);
    }

    return prisma.user.update({
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

  async deleteJudge(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

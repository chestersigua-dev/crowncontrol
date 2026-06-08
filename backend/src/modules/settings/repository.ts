import { prisma } from '../../config/database';
import { CreateSectionDTO, CreateCriteriaDTO } from './dto';
import bcrypt from 'bcryptjs';

export class SettingsRepository {
  async getAllSections() {
    return prisma.pageantSection.findMany({
      include: { criteria: true },
      orderBy: { name: 'asc' },
    });
  }

  async getSectionById(id: string) {
    return prisma.pageantSection.findUnique({
      where: { id },
      include: { criteria: true },
    });
  }

  async getActiveSection() {
    return prisma.pageantSection.findFirst({
      where: { isActive: true },
      include: { criteria: true }
    });
  }

  async createSection(data: CreateSectionDTO) {
    return prisma.pageantSection.create({
      data,
    });
  }

  async updateSection(id: string, data: Partial<CreateSectionDTO>) {
    return prisma.pageantSection.update({
      where: { id },
      data,
    });
  }

  async deleteSection(id: string) {
    return prisma.pageantSection.delete({
      where: { id },
    });
  }

  async setActiveSection(id: string) {
    return prisma.$transaction(async (tx) => {
      // Deactivate all sections
      await tx.pageantSection.updateMany({
        data: { isActive: false },
      });
      // Activate the specific one
      return tx.pageantSection.update({
        where: { id },
        data: { isActive: true },
        include: { criteria: true }
      });
    });
  }

  async createCriteria(data: CreateCriteriaDTO) {
    return prisma.criteria.create({
      data,
    });
  }

  async deleteCriteria(id: string) {
    return prisma.criteria.delete({
      where: { id },
    });
  }

  async getSetting(key: string) {
    return prisma.systemSetting.findUnique({
      where: { key }
    });
  }

  async upsertSetting(key: string, value: string) {
    return prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  async resetSystemData() {
    return prisma.$transaction(async (tx) => {
      // 1. Delete all tables in proper order (foreign keys first)
      await tx.scoreDetail.deleteMany({});
      await tx.score.deleteMany({});
      await tx.audienceVote.deleteMany({});
      await tx.offlineScoreQueue.deleteMany({});
      await tx.scoreAnalyticsSnapshot.deleteMany({});
      await tx.qRVoteSession.deleteMany({});
      await tx.criteria.deleteMany({});
      await tx.pageantSection.deleteMany({});
      await tx.candidate.deleteMany({});
      await tx.user.deleteMany({});
      await tx.systemSetting.deleteMany({});

      // 2. Re-seed default admin and judges with completely fresh generated IDs
      const adminPassword = await bcrypt.hash('admin123', 10);
      const judgePassword = await bcrypt.hash('judge123', 10);

      await tx.user.create({
        data: { username: 'admin', password: adminPassword, name: 'Lead Administrator', role: 'SUPERADMIN', isChairman: false }
      });

      await tx.user.create({
        data: { username: 'admin2', password: adminPassword, name: 'Assistant Administrator', role: 'ADMIN', isChairman: false }
      });

      await tx.user.createMany({
        data: [
          { username: 'judge1', password: judgePassword, name: 'Judge Arthur', role: 'JUDGE', isChairman: true },
          { username: 'judge2', password: judgePassword, name: 'Judge Beatrice', role: 'JUDGE', isChairman: false },
          { username: 'judge3', password: judgePassword, name: 'Judge Charles', role: 'JUDGE', isChairman: false },
        ]
      });

      // 3. Re-seed candidates
      await tx.candidate.createMany({
        data: [
          { number: 1, firstName: 'Sophia', lastName: 'Loren', bio: 'Passionate about environmental sustainability and marine biology.', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
          { number: 2, firstName: 'Isabella', lastName: 'Rossellini', bio: 'Aspiring pediatric physician advocating for health accessibility.', avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=200' },
          { number: 3, firstName: 'Gabriela', lastName: 'Sabatini', bio: 'Professional tennis coach teaching sports to underprivileged youth.', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
          { number: 4, firstName: 'Vivien', lastName: 'Leigh', bio: 'Theatre arts graduate and classical piano instructor.', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
          { number: 5, firstName: 'Audrey', lastName: 'Hepburn', bio: 'UNICEF humanitarian ambassador and creative writer.', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200' },
        ]
      });

      // 4. Re-seed Pageant Sections & Criteria
      const swimwear = await tx.pageantSection.create({
        data: {
          name: 'Swimwear Competition',
          weight: 0.3,
          description: 'Evaluating physical fitness, poise, and confidence on stage.',
          isActive: true,
        }
      });

      await tx.criteria.createMany({
        data: [
          { name: 'Physical Fitness & Tone', maxPoints: 50, weight: 0.5, pageantSectionId: swimwear.id },
          { name: 'Poise & Confidence', maxPoints: 50, weight: 0.5, pageantSectionId: swimwear.id },
        ]
      });

      const eveningGown = await tx.pageantSection.create({
        data: {
          name: 'Evening Gown',
          weight: 0.4,
          description: 'Evaluating elegance, gown choice, and stage presence.',
          isActive: false,
        }
      });

      await tx.criteria.createMany({
        data: [
          { name: 'Elegance & Style', maxPoints: 100, weight: 0.4, pageantSectionId: eveningGown.id },
          { name: 'Stage Presence & Grace', maxPoints: 100, weight: 0.6, pageantSectionId: eveningGown.id },
        ]
      });

      const interview = await tx.pageantSection.create({
        data: {
          name: 'Interview Segment',
          weight: 0.3,
          description: 'Evaluating speaking clarity, intelligence, and personality.',
          isActive: false,
        }
      });

      await tx.criteria.createMany({
        data: [
          { name: 'Articulation & Speech', maxPoints: 10, weight: 0.5, pageantSectionId: interview.id },
          { name: 'Intellect & Substance', maxPoints: 10, weight: 0.5, pageantSectionId: interview.id },
        ]
      });
    });
  }
}

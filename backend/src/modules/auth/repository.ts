import { prisma } from '../../config/database';
import { RegisterDTO } from './dto';

export class AuthRepository {
  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isChairman: true,
        createdAt: true,
      },
    });
  }

  async createUser(data: RegisterDTO) {
    return prisma.$transaction(async (tx) => {
      if (data.isChairman) {
        await tx.user.updateMany({
          where: { isChairman: true },
          data: { isChairman: false },
        });
      }
      return tx.user.create({
        data: {
          username: data.username,
          password: data.password || '',
          name: data.name,
          role: data.role || 'JUDGE',
          isChairman: data.isChairman || false,
        },
      });
    });
  }

  async getAllJudges() {
    return prisma.user.findMany({
      where: { role: 'JUDGE' },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isChairman: true,
      },
    });
  }

  async getAllAdmins() {
    return prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPERADMIN']
        }
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });
  }

  async updateAdmin(id: string, data: { role?: string; name?: string }) {
    const updateData: any = {};
    if (data.role) updateData.role = data.role;
    if (data.name) updateData.name = data.name;
    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        role: true
      }
    });
  }

  async deleteAdmin(id: string) {
    return prisma.user.delete({
      where: { id }
    });
  }
}

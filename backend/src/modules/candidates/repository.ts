import { prisma } from '../../config/database';
import { CreateCandidateDTO } from './dto';

export class CandidatesRepository {
  async getAll() {
    return prisma.candidate.findMany({
      orderBy: { number: 'asc' },
    });
  }

  async getById(id: string) {
    return prisma.candidate.findUnique({
      where: { id },
    });
  }

  async getByNumber(number: number) {
    return prisma.candidate.findUnique({
      where: { number },
    });
  }

  async create(data: CreateCandidateDTO) {
    return prisma.candidate.create({
      data,
    });
  }

  async update(id: string, data: Partial<CreateCandidateDTO>) {
    return prisma.candidate.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.candidate.delete({
      where: { id },
    });
  }
}

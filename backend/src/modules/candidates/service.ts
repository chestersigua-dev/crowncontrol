import { CandidatesRepository } from './repository';
import { CreateCandidateDTO } from './dto';

export class CandidatesService {
  private repository = new CandidatesRepository();

  async listCandidates() {
    return this.repository.getAll();
  }

  async getCandidate(id: string) {
    const candidate = await this.repository.getById(id);
    if (!candidate) {
      throw new Error('Candidate not found');
    }
    return candidate;
  }

  async createCandidate(data: CreateCandidateDTO) {
    const existing = await this.repository.getByNumber(data.number);
    if (existing) {
      throw new Error(`Candidate with number ${data.number} already exists`);
    }
    return this.repository.create(data);
  }

  async updateCandidate(id: string, data: Partial<CreateCandidateDTO>) {
    const candidate = await this.repository.getById(id);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    if (data.number !== undefined && data.number !== candidate.number) {
      const existing = await this.repository.getByNumber(data.number);
      if (existing) {
        throw new Error(`Candidate with number ${data.number} already exists`);
      }
    }

    return this.repository.update(id, data);
  }

  async deleteCandidate(id: string) {
    const candidate = await this.repository.getById(id);
    if (!candidate) {
      throw new Error('Candidate not found');
    }
    return this.repository.delete(id);
  }
}

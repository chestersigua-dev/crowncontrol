import { JudgesRepository } from './repository';
import { UpdateJudgeProfileDTO } from './dto';

export class JudgesService {
  private repository = new JudgesRepository();

  async listJudges() {
    return this.repository.getJudgesList();
  }

  async getJudgeProgress(judgeId: string) {
    const scores = await this.repository.getJudgeProgress(judgeId);
    
    // Structure scoring progress map: candidateId -> sectionId -> score
    const progressMap: Record<string, Record<string, number>> = {};
    for (const score of scores) {
      if (!progressMap[score.candidateId]) {
        progressMap[score.candidateId] = {};
      }
      progressMap[score.candidateId][score.pageantSectionId] = score.computedScore;
    }
    
    return progressMap;
  }

  async updateJudge(id: string, data: UpdateJudgeProfileDTO) {
    return this.repository.updateProfile(id, data);
  }

  async deleteJudge(id: string) {
    return this.repository.deleteJudge(id);
  }
}

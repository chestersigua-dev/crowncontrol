import { AnalyticsRepository } from './repository';
import { LeaderboardEntry, JudgeBehaviorEntry, VotingTrendEntry } from './dto';

export class AnalyticsService {
  private repository = new AnalyticsRepository();

  async getLeaderboard(sectionId: string): Promise<LeaderboardEntry[]> {
    const scores = await this.repository.getScoresBySection(sectionId);
    
    // Group scores by candidate
    const candidateScores: Record<string, {
      candidateNumber: number;
      candidateName: string;
      avatarUrl: string | null;
      scores: number[];
    }> = {};

    for (const score of scores) {
      if (!candidateScores[score.candidateId]) {
        candidateScores[score.candidateId] = {
          candidateNumber: score.candidate.number,
          candidateName: `${score.candidate.firstName} ${score.candidate.lastName}`,
          avatarUrl: score.candidate.avatarUrl,
          scores: []
        };
      }
      candidateScores[score.candidateId].scores.push(score.computedScore);
    }

    // Map to entries with averages
    const entries: LeaderboardEntry[] = Object.keys(candidateScores).map(candidateId => {
      const item = candidateScores[candidateId];
      const sum = item.scores.reduce((a, b) => a + b, 0);
      const avg = item.scores.length > 0 ? sum / item.scores.length : 0;
      return {
        candidateId,
        candidateNumber: item.candidateNumber,
        candidateName: item.candidateName,
        avatarUrl: item.avatarUrl,
        averageScore: Math.round(avg * 100) / 100,
        judgeCount: item.scores.length,
        rank: 0 // Will assign below
      };
    });

    // Sort by average score descending
    entries.sort((a, b) => b.averageScore - a.averageScore);

    // Assign ranks
    entries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    return entries;
  }



  async getJudgeBehavior(): Promise<JudgeBehaviorEntry[]> {
    const scores = await this.repository.getJudgeScoringStats();
    
    // Group scores by judge
    const judgeStats: Record<string, {
      judgeName: string;
      isChairman: boolean;
      scores: number[];
    }> = {};

    for (const score of scores) {
      if (!judgeStats[score.judgeId]) {
        judgeStats[score.judgeId] = {
          judgeName: score.judge.name,
          isChairman: score.judge.isChairman,
          scores: []
        };
      }
      judgeStats[score.judgeId].scores.push(score.computedScore);
    }

    return Object.keys(judgeStats).map(judgeId => {
      const item = judgeStats[judgeId];
      const sum = item.scores.reduce((a, b) => a + b, 0);
      const avg = item.scores.length > 0 ? sum / item.scores.length : 0;
      return {
        judgeId,
        judgeName: item.judgeName,
        isChairman: item.isChairman,
        averageScoreGiven: Math.round(avg * 100) / 100,
        totalCandidatesScored: item.scores.length
      };
    });
  }

  async createSnapshot(sectionId: string) {
    const leaderboard = await this.getLeaderboard(sectionId);
    
    const savedSnapshots = [];
    for (const entry of leaderboard) {
      const snap = await this.repository.saveSnapshot(
        entry.candidateId,
        sectionId,
        entry.averageScore,
        entry.rank
      );
      savedSnapshots.push(snap);
    }

    return savedSnapshots;
  }

  async getSnapshotHistory(sectionId: string) {
    return this.repository.getSnapshots(sectionId);
  }

  async getPublicLeaderboard() {
    const enabledSetting = await prisma.systemSetting.findUnique({
      where: { key: 'public_rankings_enabled' }
    });
    const isEnabled = enabledSetting ? enabledSetting.value === 'true' : true;
    if (!isEnabled) {
      throw new Error('Public live rankings board is currently disabled by the event administrator.');
    }

    const activeSection = await prisma.pageantSection.findFirst({
      where: { isActive: true }
    });
    if (!activeSection) {
      return null;
    }
    const leaderboard = await this.getLeaderboard(activeSection.id);
    return {
      sectionName: activeSection.name,
      leaderboard
    };
  }
}
// Import prisma reference
import { prisma } from '../../config/database';

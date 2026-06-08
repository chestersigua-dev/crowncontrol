export interface LeaderboardEntry {
  candidateId: string;
  candidateNumber: number;
  candidateName: string;
  avatarUrl: string | null;
  averageScore: number;
  judgeCount: number;
  rank: number;
}

export interface JudgeBehaviorEntry {
  judgeId: string;
  judgeName: string;
  isChairman?: boolean;
  averageScoreGiven: number;
  totalCandidatesScored: number;
}

export interface VotingTrendEntry {
  hour: string; // e.g. "2026-06-08 12:00"
  count: number;
}

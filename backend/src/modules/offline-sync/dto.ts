import { SubmitScoreDTO } from '../scoring/dto';

export interface SyncBatchDTO {
  scores: SubmitScoreDTO[];
}

export function validateSyncBatch(body: any): string | null {
  if (!body.scores || !Array.isArray(body.scores)) {
    return 'Scores array is required for batch sync';
  }
  return null;
}

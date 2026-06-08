import { OfflineSyncRepository } from './repository';
import { ScoringService } from '../scoring/service';
import { SubmitScoreDTO } from '../scoring/dto';

export class OfflineSyncService {
  private repository = new OfflineSyncRepository();
  private scoringService = new ScoringService();

  async syncBatch(judgeId: string, scores: SubmitScoreDTO[]) {
    // 1. Queue all incoming payloads first to guarantee durability
    const queuedItems = [];
    for (const score of scores) {
      // Inject sync flag
      score.isSyncedFromOffline = true;
      const queueItem = await this.repository.saveOfflineScore(judgeId, score);
      queuedItems.push(queueItem);
    }

    // 2. Process all unsynced items in order
    return this.processQueue();
  }

  async processQueue() {
    const queue = await this.repository.getUnsynced();
    const results = {
      successCount: 0,
      failedCount: 0,
      errors: [] as string[],
    };

    for (const item of queue) {
      try {
        const payload = JSON.parse(item.payload) as SubmitScoreDTO;
        
        // Pass payload through standard scoring service pipeline
        await this.scoringService.submitScore(item.judgeId, payload);
        
        // Mark as synced
        await this.repository.markSynced(item.id);
        results.successCount++;
      } catch (err: any) {
        results.failedCount++;
        results.errors.push(`Queue Item ${item.id} failed: ${err.message}`);
        console.error(`Offline sync failed for queue item ${item.id}:`, err);
      }
    }

    return results;
  }
}

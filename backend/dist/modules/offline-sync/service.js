"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineSyncService = void 0;
const repository_1 = require("./repository");
const service_1 = require("../scoring/service");
class OfflineSyncService {
    repository = new repository_1.OfflineSyncRepository();
    scoringService = new service_1.ScoringService();
    async syncBatch(judgeId, scores) {
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
            errors: [],
        };
        for (const item of queue) {
            try {
                const payload = JSON.parse(item.payload);
                // Pass payload through standard scoring service pipeline
                await this.scoringService.submitScore(item.judgeId, payload);
                // Mark as synced
                await this.repository.markSynced(item.id);
                results.successCount++;
            }
            catch (err) {
                results.failedCount++;
                results.errors.push(`Queue Item ${item.id} failed: ${err.message}`);
                console.error(`Offline sync failed for queue item ${item.id}:`, err);
            }
        }
        return results;
    }
}
exports.OfflineSyncService = OfflineSyncService;

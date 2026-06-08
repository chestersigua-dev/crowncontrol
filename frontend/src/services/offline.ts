import api from './api';

export interface OfflineScore {
  candidateId: string;
  pageantSectionId: string;
  scores: {
    criteriaId: string;
    points: number;
  }[];
}

export const saveScoreOffline = (score: OfflineScore) => {
  const queue: OfflineScore[] = JSON.parse(localStorage.getItem('scoreQueue') || '[]');
  
  // Replace if existing for same candidate and section to prevent multiple duplicate syncs
  const existingIdx = queue.findIndex(
    item => item.candidateId === score.candidateId && item.pageantSectionId === score.pageantSectionId
  );

  if (existingIdx !== -1) {
    queue[existingIdx] = score;
  } else {
    queue.push(score);
  }

  localStorage.setItem('scoreQueue', JSON.stringify(queue));
  
  // Custom event to notify components that queue updated
  window.dispatchEvent(new Event('scoreQueueUpdated'));
};

export const getOfflineQueue = (): OfflineScore[] => {
  return JSON.parse(localStorage.getItem('scoreQueue') || '[]');
};

export const syncScores = async (): Promise<{ successCount: number; failedCount: number } | null> => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return null;

  try {
    console.log(`Syncing ${queue.length} queued offline scores...`);
    const response = await api.post('/offline-sync/sync', { scores: queue });
    
    // Clear queue on successful sync
    localStorage.removeItem('scoreQueue');
    window.dispatchEvent(new Event('scoreQueueUpdated'));
    console.log('Offline score queue synced successfully!');
    
    return {
      successCount: response.successCount || 0,
      failedCount: response.failedCount || 0
    };
  } catch (error) {
    console.error('Failed to sync offline scores:', error);
    throw error;
  }
};

// Automatic listener when internet returns
window.addEventListener('online', () => {
  console.log('Network online detected. Triggering auto-sync...');
  syncScores().catch(err => console.error('Auto-sync failed:', err));
});

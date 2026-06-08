import { Response } from 'express';
import { OfflineSyncService } from './service';
import { validateSyncBatch } from './dto';
import { AuthRequest } from '../../middleware/auth';

export class OfflineSyncController {
  private service = new OfflineSyncService();

  sync = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const error = validateSyncBatch(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    try {
      const result = await this.service.syncBatch(req.user.id, req.body.scores);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  process = async (req: AuthRequest, res: Response) => {
    try {
      const result = await this.service.processQueue();
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };
}

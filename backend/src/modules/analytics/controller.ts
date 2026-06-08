import { Request, Response } from 'express';
import { AnalyticsService } from './service';

export class AnalyticsController {
  private service = new AnalyticsService();

  getLeaderboard = async (req: Request, res: Response) => {
    const sectionId = req.params.sectionId;
    if (!sectionId) {
      return res.status(400).json({ error: 'Section ID is required' });
    }

    try {
      const data = await this.service.getLeaderboard(sectionId);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };



  getJudgeBehavior = async (req: Request, res: Response) => {
    try {
      const stats = await this.service.getJudgeBehavior();
      return res.status(200).json(stats);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };



  createSnapshot = async (req: Request, res: Response) => {
    const sectionId = req.body.sectionId;
    if (!sectionId) {
      return res.status(400).json({ error: 'Section ID is required' });
    }

    try {
      const snapshots = await this.service.createSnapshot(sectionId);
      return res.status(201).json({ message: 'Snapshot generated successfully', snapshots });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  getSnapshotHistory = async (req: Request, res: Response) => {
    const sectionId = req.params.sectionId;
    try {
      const history = await this.service.getSnapshotHistory(sectionId);
      return res.status(200).json(history);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  getPublicLeaderboard = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getPublicLeaderboard();
      if (!data) {
        return res.status(404).json({ error: 'No active pageant section found' });
      }
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };
}

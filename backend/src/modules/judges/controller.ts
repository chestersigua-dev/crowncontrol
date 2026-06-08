import { Response } from 'express';
import { JudgesService } from './service';
import { validateUpdateJudge } from './dto';
import { AuthRequest } from '../../middleware/auth';

export class JudgesController {
  private service = new JudgesService();

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const judges = await this.service.listJudges();
      return res.status(200).json(judges);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  getProgress = async (req: AuthRequest, res: Response) => {
    const judgeId = req.params.id || req.user?.id;
    if (!judgeId) {
      return res.status(400).json({ error: 'Judge ID is required' });
    }

    try {
      const progress = await this.service.getJudgeProgress(judgeId);
      return res.status(200).json(progress);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    
    // Judges can only update themselves, Admins can update any judge
    if (req.user?.role !== 'ADMIN' && req.user?.id !== id) {
      return res.status(430).json({ error: 'Unauthorized profile update' });
    }

    const error = validateUpdateJudge(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    try {
      const result = await this.service.updateJudge(id, req.body);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try {
      await this.service.deleteJudge(req.params.id);
      return res.status(200).json({ message: 'Judge deleted successfully' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };
}

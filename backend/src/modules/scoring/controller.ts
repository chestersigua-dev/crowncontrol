import { Response } from 'express';
import { ScoringService } from './service';
import { validateSubmitScore } from './dto';
import { AuthRequest } from '../../middleware/auth';

export class ScoringController {
  private service = new ScoringService();

  submit = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const error = validateSubmitScore(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    try {
      const result = await this.service.submitScore(req.user.id, req.body);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  getBySection = async (req: AuthRequest, res: Response) => {
    try {
      const scores = await this.service.getScoresForSection(req.params.sectionId);
      return res.status(200).json(scores);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  getJudgeScore = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const score = await this.service.getJudgeScore(
        req.user.id,
        req.params.candidateId,
        req.params.sectionId
      );
      return res.status(200).json(score);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };
}

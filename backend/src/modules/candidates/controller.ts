import { Request, Response } from 'express';
import { CandidatesService } from './service';
import { validateCandidate } from './dto';

export class CandidatesController {
  private service = new CandidatesService();

  getAll = async (req: Request, res: Response) => {
    try {
      const candidates = await this.service.listCandidates();
      return res.status(200).json(candidates);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  getOne = async (req: Request, res: Response) => {
    try {
      const candidate = await this.service.getCandidate(req.params.id);
      return res.status(200).json(candidate);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  };

  create = async (req: Request, res: Response) => {
    const error = validateCandidate(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    try {
      const candidate = await this.service.createCandidate(req.body);
      return res.status(201).json(candidate);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const candidate = await this.service.updateCandidate(req.params.id, req.body);
      return res.status(200).json(candidate);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.service.deleteCandidate(req.params.id);
      return res.status(200).json({ message: 'Candidate deleted successfully' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };
}

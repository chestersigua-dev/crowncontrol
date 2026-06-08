import { Request, Response } from 'express';
import { AuthService } from './service';
import { validateRegister, validateLogin } from './dto';
import { AuthRequest } from '../../middleware/auth';

export class AuthController {
  private service = new AuthService();

  register = async (req: Request, res: Response) => {
    const error = validateRegister(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    try {
      const result = await this.service.register(req.body);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  login = async (req: Request, res: Response) => {
    const error = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    try {
      const result = await this.service.login(req.body);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  me = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const profile = await this.service.getMe(req.user.id);
      return res.status(200).json(profile);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  getJudges = async (req: Request, res: Response) => {
    try {
      const judges = await this.service.getJudges();
      return res.status(200).json(judges);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  getAdmins = async (req: Request, res: Response) => {
    try {
      const admins = await this.service.getAdmins();
      return res.status(200).json(admins);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  createAdmin = async (req: Request, res: Response) => {
    const { username, password, name, role } = req.body;
    if (!username || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields (username, password, name, role) are required' });
    }
    if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
      return res.status(400).json({ error: 'Role must be either ADMIN or SUPERADMIN' });
    }

    try {
      const result = await this.service.register({ username, password, name, role });
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  updateAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role, name } = req.body;
    if (role && role !== 'ADMIN' && role !== 'SUPERADMIN') {
      return res.status(400).json({ error: 'Role must be either ADMIN or SUPERADMIN' });
    }
    
    try {
      const result = await this.service.updateAdmin(id, { role, name });
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  deleteAdmin = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    if (req.user?.id === id) {
      return res.status(400).json({ error: 'Superadmin cannot delete their own account' });
    }
    try {
      await this.service.deleteAdmin(id);
      return res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };
}

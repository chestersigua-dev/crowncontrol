import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './repository';
import { RegisterDTO, LoginDTO } from './dto';

const JWT_SECRET = process.env.JWT_SECRET || 'pageant_jwt_super_secret_key_12345';

export class AuthService {
  private repository = new AuthRepository();

  async register(data: RegisterDTO) {
    const existing = await this.repository.findByUsername(data.username);
    if (existing) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password || '', 10);
    const user = await this.repository.createUser({
      ...data,
      password: hashedPassword,
    });

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      isChairman: user.isChairman,
    };
  }

  async login(data: LoginDTO) {
    const user = await this.repository.findByUsername(data.username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password || '', user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        isChairman: user.isChairman,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        isChairman: user.isChairman,
      },
    };
  }

  async getMe(id: string) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getJudges() {
    return this.repository.getAllJudges();
  }

  async getAdmins() {
    return this.repository.getAllAdmins();
  }

  async updateAdmin(id: string, data: { role?: string; name?: string }) {
    return this.repository.updateAdmin(id, data);
  }

  async deleteAdmin(id: string) {
    return this.repository.deleteAdmin(id);
  }
}

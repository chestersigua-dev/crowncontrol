"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const repository_1 = require("./repository");
const JWT_SECRET = process.env.JWT_SECRET || 'pageant_jwt_super_secret_key_12345';
class AuthService {
    repository = new repository_1.AuthRepository();
    async register(data) {
        const existing = await this.repository.findByUsername(data.username);
        if (existing) {
            throw new Error('Username already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password || '', 10);
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
    async login(data) {
        const user = await this.repository.findByUsername(data.username);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await bcryptjs_1.default.compare(data.password || '', user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
            isChairman: user.isChairman,
        }, JWT_SECRET, { expiresIn: '24h' });
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
    async getMe(id) {
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
    async updateAdmin(id, data) {
        return this.repository.updateAdmin(id, data);
    }
    async deleteAdmin(id) {
        return this.repository.deleteAdmin(id);
    }
}
exports.AuthService = AuthService;

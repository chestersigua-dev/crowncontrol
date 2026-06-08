"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const service_1 = require("./service");
const dto_1 = require("./dto");
class AuthController {
    service = new service_1.AuthService();
    register = async (req, res) => {
        const error = (0, dto_1.validateRegister)(req.body);
        if (error) {
            return res.status(400).json({ error });
        }
        try {
            const result = await this.service.register(req.body);
            return res.status(201).json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    login = async (req, res) => {
        const error = (0, dto_1.validateLogin)(req.body);
        if (error) {
            return res.status(400).json({ error });
        }
        try {
            const result = await this.service.login(req.body);
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    me = async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        try {
            const profile = await this.service.getMe(req.user.id);
            return res.status(200).json(profile);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    getJudges = async (req, res) => {
        try {
            const judges = await this.service.getJudges();
            return res.status(200).json(judges);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    getAdmins = async (req, res) => {
        try {
            const admins = await this.service.getAdmins();
            return res.status(200).json(admins);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    createAdmin = async (req, res) => {
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
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    updateAdmin = async (req, res) => {
        const { id } = req.params;
        const { role, name } = req.body;
        if (role && role !== 'ADMIN' && role !== 'SUPERADMIN') {
            return res.status(400).json({ error: 'Role must be either ADMIN or SUPERADMIN' });
        }
        try {
            const result = await this.service.updateAdmin(id, { role, name });
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    deleteAdmin = async (req, res) => {
        const { id } = req.params;
        if (req.user?.id === id) {
            return res.status(400).json({ error: 'Superadmin cannot delete their own account' });
        }
        try {
            await this.service.deleteAdmin(id);
            return res.status(200).json({ message: 'Admin deleted successfully' });
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
}
exports.AuthController = AuthController;

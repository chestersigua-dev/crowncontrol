"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'pageant_jwt_super_secret_key_12345';
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token' });
            }
            req.user = decoded;
            next();
        });
    }
    else {
        res.status(401).json({ error: 'Authorization token required' });
    }
};
exports.authenticateJWT = authenticateJWT;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(430).json({ error: `Forbidden: requires one of roles [${roles.join(', ')}]` });
        }
        next();
    };
};
exports.requireRole = requireRole;

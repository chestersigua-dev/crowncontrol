"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotingService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const crypto_1 = __importDefault(require("crypto"));
const repository_1 = require("./repository");
const socket_1 = require("../../config/socket");
class VotingService {
    repository = new repository_1.VotingRepository();
    async generateVotingQR() {
        const token = crypto_1.default.randomBytes(16).toString('hex');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const url = `${frontendUrl}/vote?token=${token}`;
        const qrImage = await qrcode_1.default.toDataURL(url);
        // Save session in DB (valid for 1 hour)
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
        const session = await this.repository.createQRSession(token, expiresAt);
        return {
            qrImage,
            token,
            expiresAt: session.expiresAt
        };
    }
    async validateToken(token) {
        const session = await this.repository.getSessionByToken(token);
        if (!session) {
            return { isValid: false, reason: 'Invalid session token' };
        }
        if (!session.isActive) {
            return { isValid: false, reason: 'This voting session has ended' };
        }
        if (new Date() > session.expiresAt) {
            return { isValid: false, reason: 'This voting session has expired' };
        }
        return { isValid: true, session };
    }
    async submitVote(data) {
        // 1. Verify token validity
        const validation = await this.validateToken(data.token);
        if (!validation.isValid) {
            throw new Error(validation.reason);
        }
        // 2. Verify device daily vote limits
        const hasVoted = await this.repository.checkDeviceVotedToday(data.deviceId);
        if (hasVoted) {
            throw new Error('This device has already cast a vote today');
        }
        // 3. Cast vote
        const vote = await this.repository.castVote(data.candidateId, data.deviceId);
        // 4. Broadcast live vote count to websocket listeners
        (0, socket_1.broadcastVoteLive)({
            type: 'vote:new',
            candidateId: vote.candidateId,
            candidateName: `${vote.candidate.firstName} ${vote.candidate.lastName}`,
            candidateNumber: vote.candidate.number
        });
        return vote;
    }
    async getActiveSessions() {
        return this.repository.getActiveSessions();
    }
}
exports.VotingService = VotingService;

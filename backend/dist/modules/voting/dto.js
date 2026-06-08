"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVote = validateVote;
function validateVote(body) {
    if (!body.candidateId || typeof body.candidateId !== 'string') {
        return 'Candidate ID is required';
    }
    if (!body.token || typeof body.token !== 'string') {
        return 'Session token is required';
    }
    if (!body.deviceId || typeof body.deviceId !== 'string' || body.deviceId.trim().length < 8) {
        return 'Valid Device ID is required';
    }
    return null;
}

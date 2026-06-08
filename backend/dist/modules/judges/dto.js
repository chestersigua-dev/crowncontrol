"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateJudge = validateUpdateJudge;
function validateUpdateJudge(body) {
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
        return 'Name cannot be empty';
    }
    if (body.password !== undefined && (typeof body.password !== 'string' || body.password.length < 6)) {
        return 'Password must be at least 6 characters long';
    }
    return null;
}

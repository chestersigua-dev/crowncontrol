"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCandidate = validateCandidate;
function validateCandidate(body) {
    if (body.number === undefined || typeof body.number !== 'number') {
        return 'Candidate number must be a valid number';
    }
    if (!body.firstName || typeof body.firstName !== 'string' || body.firstName.trim().length === 0) {
        return 'First name is required';
    }
    if (!body.lastName || typeof body.lastName !== 'string' || body.lastName.trim().length === 0) {
        return 'Last name is required';
    }
    return null;
}

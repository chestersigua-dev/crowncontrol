"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSubmitScore = validateSubmitScore;
function validateSubmitScore(body) {
    if (!body.candidateId || typeof body.candidateId !== 'string') {
        return 'Candidate ID is required';
    }
    if (!body.pageantSectionId || typeof body.pageantSectionId !== 'string') {
        return 'Pageant Section ID is required';
    }
    if (!body.scores || !Array.isArray(body.scores) || body.scores.length === 0) {
        return 'Scores array must contain at least one criteria score';
    }
    for (const item of body.scores) {
        if (!item.criteriaId || typeof item.criteriaId !== 'string') {
            return 'Each score detail must contain a valid criteriaId';
        }
        if (item.points === undefined || typeof item.points !== 'number' || item.points < 0) {
            return 'Each score points must be a number greater than or equal to 0';
        }
    }
    return null;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSection = validateSection;
exports.validateCriteria = validateCriteria;
function validateSection(body) {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
        return 'Section name is required';
    }
    if (body.weight === undefined || typeof body.weight !== 'number' || body.weight < 0 || body.weight > 1) {
        return 'Section weight must be a number between 0 and 1';
    }
    return null;
}
function validateCriteria(body) {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
        return 'Criteria name is required';
    }
    if (body.maxPoints === undefined || typeof body.maxPoints !== 'number' || body.maxPoints <= 0) {
        return 'maxPoints must be a positive number';
    }
    if (body.weight === undefined || typeof body.weight !== 'number' || body.weight < 0 || body.weight > 1) {
        return 'Criteria weight must be a number between 0 and 1';
    }
    if (!body.pageantSectionId || typeof body.pageantSectionId !== 'string') {
        return 'pageantSectionId is required';
    }
    return null;
}

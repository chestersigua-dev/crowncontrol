"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSyncBatch = validateSyncBatch;
function validateSyncBatch(body) {
    if (!body.scores || !Array.isArray(body.scores)) {
        return 'Scores array is required for batch sync';
    }
    return null;
}

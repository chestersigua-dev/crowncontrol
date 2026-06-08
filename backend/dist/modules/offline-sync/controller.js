"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineSyncController = void 0;
const service_1 = require("./service");
const dto_1 = require("./dto");
class OfflineSyncController {
    service = new service_1.OfflineSyncService();
    sync = async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const error = (0, dto_1.validateSyncBatch)(req.body);
        if (error) {
            return res.status(400).json({ error });
        }
        try {
            const result = await this.service.syncBatch(req.user.id, req.body.scores);
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    process = async (req, res) => {
        try {
            const result = await this.service.processQueue();
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
}
exports.OfflineSyncController = OfflineSyncController;

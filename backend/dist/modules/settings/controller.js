"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const service_1 = require("./service");
const dto_1 = require("./dto");
class SettingsController {
    service = new service_1.SettingsService();
    getSections = async (req, res) => {
        try {
            const sections = await this.service.getSections();
            return res.status(200).json(sections);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    getActive = async (req, res) => {
        try {
            const active = await this.service.getActiveSection();
            return res.status(200).json(active);
        }
        catch (err) {
            return res.status(404).json({ error: err.message });
        }
    };
    createSection = async (req, res) => {
        const error = (0, dto_1.validateSection)(req.body);
        if (error) {
            return res.status(400).json({ error });
        }
        try {
            const section = await this.service.createSection(req.body);
            return res.status(201).json(section);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    updateSection = async (req, res) => {
        try {
            const section = await this.service.updateSection(req.params.id, req.body);
            return res.status(200).json(section);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    deleteSection = async (req, res) => {
        try {
            await this.service.deleteSection(req.params.id);
            return res.status(200).json({ message: 'Section deleted successfully' });
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    activate = async (req, res) => {
        try {
            const activated = await this.service.activateSection(req.params.id);
            return res.status(200).json({ message: 'Section activated successfully', activated });
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    createCriteria = async (req, res) => {
        const error = (0, dto_1.validateCriteria)(req.body);
        if (error) {
            return res.status(400).json({ error });
        }
        try {
            const criteria = await this.service.addCriteria(req.body);
            return res.status(201).json(criteria);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    deleteCriteria = async (req, res) => {
        try {
            await this.service.removeCriteria(req.params.id);
            return res.status(200).json({ message: 'Criteria deleted successfully' });
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    getBranding = async (req, res) => {
        try {
            const branding = await this.service.getBranding();
            return res.status(200).json(branding);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    updateBranding = async (req, res) => {
        const { title, logo, publicRankingsEnabled } = req.body;
        if (!title || !logo) {
            return res.status(400).json({ error: 'Title and logo are required' });
        }
        try {
            const result = await this.service.updateBranding(title, logo, publicRankingsEnabled !== false);
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
    resetSystem = async (req, res) => {
        try {
            await this.service.resetSystem();
            return res.status(200).json({ message: 'System reset completed successfully. All candidate, judge, criteria, category, and scoring data has been cleared.' });
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    };
}
exports.SettingsController = SettingsController;

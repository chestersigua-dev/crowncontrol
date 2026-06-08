"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Load env
dotenv_1.default.config();
const socket_1 = require("./config/socket");
const database_1 = require("./config/database");
// Import Routes
const routes_1 = __importDefault(require("./modules/auth/routes"));
const routes_2 = __importDefault(require("./modules/candidates/routes"));
const routes_3 = __importDefault(require("./modules/judges/routes"));
const routes_4 = __importDefault(require("./modules/scoring/routes"));
const routes_5 = __importDefault(require("./modules/analytics/routes"));
const routes_6 = __importDefault(require("./modules/offline-sync/routes"));
const routes_7 = __importDefault(require("./modules/settings/routes"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Initialize Socket.io
(0, socket_1.initSocket)(server);
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', routes_1.default);
app.use('/api/candidates', routes_2.default);
app.use('/api/judges', routes_3.default);
app.use('/api/scoring', routes_4.default);
app.use('/api/analytics', routes_5.default);
app.use('/api/offline-sync', routes_6.default);
app.use('/api/settings', routes_7.default);
// Fallback Route
app.use('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date() });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Express Error Handler:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});
// Database Seeder
async function seedDatabase() {
    console.log('Checking database seed state...');
    try {
        // 1. Seed Superadmin
        const superadminCount = await database_1.prisma.user.count({ where: { role: 'SUPERADMIN' } });
        if (superadminCount === 0) {
            console.log('Seeding default super-administrator...');
            const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
            await database_1.prisma.user.create({
                data: { username: 'admin', password: adminPassword, name: 'Lead Administrator', role: 'SUPERADMIN', isChairman: false }
            });
            console.log('Seeded super-administrator (admin/admin123).');
        }
        // 1b. Seed Regular Admin
        const adminCount = await database_1.prisma.user.count({ where: { role: 'ADMIN' } });
        if (adminCount === 0) {
            console.log('Seeding default assistant administrator...');
            const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
            await database_1.prisma.user.create({
                data: { username: 'admin2', password: adminPassword, name: 'Assistant Administrator', role: 'ADMIN', isChairman: false }
            });
            console.log('Seeded assistant administrator (admin2/admin123).');
        }
        // 2. Seed Judges
        const judgeCount = await database_1.prisma.user.count({ where: { role: 'JUDGE' } });
        if (judgeCount === 0) {
            console.log('Seeding default judge profiles...');
            const judgePassword = await bcryptjs_1.default.hash('judge123', 10);
            await database_1.prisma.user.createMany({
                data: [
                    { username: 'judge1', password: judgePassword, name: 'Judge Arthur', role: 'JUDGE', isChairman: true },
                    { username: 'judge2', password: judgePassword, name: 'Judge Beatrice', role: 'JUDGE', isChairman: false },
                    { username: 'judge3', password: judgePassword, name: 'Judge Charles', role: 'JUDGE', isChairman: false },
                ]
            });
            console.log('Seeded judges (judge1/judge123 [Chairman], judge2/judge123, judge3/judge123).');
        }
        // 2. Seed Candidates
        const candidateCount = await database_1.prisma.candidate.count();
        if (candidateCount === 0) {
            console.log('Seeding candidate entries...');
            await database_1.prisma.candidate.createMany({
                data: [
                    { number: 1, firstName: 'Sophia', lastName: 'Loren', bio: 'Passionate about environmental sustainability and marine biology.', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
                    { number: 2, firstName: 'Isabella', lastName: 'Rossellini', bio: 'Aspiring pediatric physician advocating for health accessibility.', avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=200' },
                    { number: 3, firstName: 'Gabriela', lastName: 'Sabatini', bio: 'Professional tennis coach teaching sports to underprivileged youth.', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
                    { number: 4, firstName: 'Vivien', lastName: 'Leigh', bio: 'Theatre arts graduate and classical piano instructor.', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
                    { number: 5, firstName: 'Audrey', lastName: 'Hepburn', bio: 'UNICEF humanitarian ambassador and creative writer.', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200' },
                ]
            });
            console.log('Seeded 5 candidates.');
        }
        // 3. Seed Pageant Sections & Criteria
        const sectionCount = await database_1.prisma.pageantSection.count();
        if (sectionCount === 0) {
            console.log('Seeding pageant categories...');
            const swimwear = await database_1.prisma.pageantSection.create({
                data: {
                    name: 'Swimwear Competition',
                    weight: 0.3,
                    description: 'Evaluating physical fitness, poise, and confidence on stage.',
                    isActive: true, // Default active section
                }
            });
            await database_1.prisma.criteria.createMany({
                data: [
                    { name: 'Physical Fitness & Tone', maxPoints: 50, weight: 0.5, pageantSectionId: swimwear.id },
                    { name: 'Poise & Confidence', maxPoints: 50, weight: 0.5, pageantSectionId: swimwear.id },
                ]
            });
            const eveningGown = await database_1.prisma.pageantSection.create({
                data: {
                    name: 'Evening Gown',
                    weight: 0.4,
                    description: 'Evaluating elegance, gown choice, and stage presence.',
                    isActive: false,
                }
            });
            await database_1.prisma.criteria.createMany({
                data: [
                    { name: 'Elegance & Style', maxPoints: 100, weight: 0.4, pageantSectionId: eveningGown.id },
                    { name: 'Stage Presence & Grace', maxPoints: 100, weight: 0.6, pageantSectionId: eveningGown.id },
                ]
            });
            const interview = await database_1.prisma.pageantSection.create({
                data: {
                    name: 'Interview Segment',
                    weight: 0.3,
                    description: 'Evaluating speaking clarity, intelligence, and personality.',
                    isActive: false,
                }
            });
            await database_1.prisma.criteria.createMany({
                data: [
                    { name: 'Articulation & Speech', maxPoints: 10, weight: 0.5, pageantSectionId: interview.id },
                    { name: 'Intellect & Substance', maxPoints: 10, weight: 0.5, pageantSectionId: interview.id },
                ]
            });
            console.log('Seeded sections (Swimwear, Evening Gown, Interview) with respective criteria.');
        }
        console.log('Database verification and seeding complete.');
    }
    catch (err) {
        console.error('Seeding database error:', err);
    }
}
// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await seedDatabase();
});

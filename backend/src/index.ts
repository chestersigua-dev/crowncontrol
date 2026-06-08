import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load env
dotenv.config();

import { initSocket } from './config/socket';
import { prisma } from './config/database';

// Import Routes
import authRoutes from './modules/auth/routes';
import candidateRoutes from './modules/candidates/routes';
import judgeRoutes from './modules/judges/routes';
import scoringRoutes from './modules/scoring/routes';
import analyticsRoutes from './modules/analytics/routes';
import offlineSyncRoutes from './modules/offline-sync/routes';
import settingsRoutes from './modules/settings/routes';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/judges', judgeRoutes);
app.use('/api/scoring', scoringRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/offline-sync', offlineSyncRoutes);
app.use('/api/settings', settingsRoutes);

// Fallback Route
app.use('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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
    const superadminCount = await prisma.user.count({ where: { role: 'SUPERADMIN' } });
    if (superadminCount === 0) {
      console.log('Seeding default super-administrator...');
      const adminPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: { username: 'admin', password: adminPassword, name: 'Lead Administrator', role: 'SUPERADMIN', isChairman: false }
      });
      console.log('Seeded super-administrator (admin/admin123).');
    }

    // 1b. Seed Regular Admin
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount === 0) {
      console.log('Seeding default assistant administrator...');
      const adminPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: { username: 'admin2', password: adminPassword, name: 'Assistant Administrator', role: 'ADMIN', isChairman: false }
      });
      console.log('Seeded assistant administrator (admin2/admin123).');
    }

    // 2. Seed Judges
    const judgeCount = await prisma.user.count({ where: { role: 'JUDGE' } });
    if (judgeCount === 0) {
      console.log('Seeding default judge profiles...');
      const judgePassword = await bcrypt.hash('judge123', 10);
      await prisma.user.createMany({
        data: [
          { username: 'judge1', password: judgePassword, name: 'Judge Arthur', role: 'JUDGE', isChairman: true },
          { username: 'judge2', password: judgePassword, name: 'Judge Beatrice', role: 'JUDGE', isChairman: false },
          { username: 'judge3', password: judgePassword, name: 'Judge Charles', role: 'JUDGE', isChairman: false },
        ]
      });
      console.log('Seeded judges (judge1/judge123 [Chairman], judge2/judge123, judge3/judge123).');
    }

    // 2. Seed Candidates
    const candidateCount = await prisma.candidate.count();
    if (candidateCount === 0) {
      console.log('Seeding candidate entries...');
      await prisma.candidate.createMany({
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
    const sectionCount = await prisma.pageantSection.count();
    if (sectionCount === 0) {
      console.log('Seeding pageant categories...');
      
      const swimwear = await prisma.pageantSection.create({
        data: {
          name: 'Swimwear Competition',
          weight: 0.3,
          description: 'Evaluating physical fitness, poise, and confidence on stage.',
          isActive: true, // Default active section
        }
      });

      await prisma.criteria.createMany({
        data: [
          { name: 'Physical Fitness & Tone', maxPoints: 50, weight: 0.5, pageantSectionId: swimwear.id },
          { name: 'Poise & Confidence', maxPoints: 50, weight: 0.5, pageantSectionId: swimwear.id },
        ]
      });

      const eveningGown = await prisma.pageantSection.create({
        data: {
          name: 'Evening Gown',
          weight: 0.4,
          description: 'Evaluating elegance, gown choice, and stage presence.',
          isActive: false,
        }
      });

      await prisma.criteria.createMany({
        data: [
          { name: 'Elegance & Style', maxPoints: 100, weight: 0.4, pageantSectionId: eveningGown.id },
          { name: 'Stage Presence & Grace', maxPoints: 100, weight: 0.6, pageantSectionId: eveningGown.id },
        ]
      });

      const interview = await prisma.pageantSection.create({
        data: {
          name: 'Interview Segment',
          weight: 0.3,
          description: 'Evaluating speaking clarity, intelligence, and personality.',
          isActive: false,
        }
      });

      await prisma.criteria.createMany({
        data: [
          { name: 'Articulation & Speech', maxPoints: 10, weight: 0.5, pageantSectionId: interview.id },
          { name: 'Intellect & Substance', maxPoints: 10, weight: 0.5, pageantSectionId: interview.id },
        ]
      });

      console.log('Seeded sections (Swimwear, Evening Gown, Interview) with respective criteria.');
    }
    console.log('Database verification and seeding complete.');
  } catch (err) {
    console.error('Seeding database error:', err);
  }
}

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedDatabase();
});

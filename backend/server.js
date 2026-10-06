import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import skillRoutes from './routes/skills.routes.js';
import internshipRoutes from './routes/internships.routes.js';
import applicationRoutes from './routes/applications.routes.js';
import portfolioRoutes from './routes/portfolio.routes.js';
import programRoutes from './routes/programs.routes.js';
import collaborationRoutes from './routes/collaborations.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(compression());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('/uploads', express.static('uploads'));

// Serve the built frontend (production) from ../frontend/dist
const frontendDist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist, { maxAge: '7d' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.get('/', (req, res) => {
  res.json({ message: 'SkillBridge API - SIH26044' });
});

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
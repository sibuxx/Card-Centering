import express from 'express';
import cors from 'cors';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getDb } from './database.js';
import gradingRoutes from './routes/grading.js';
import authRoutes from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

mkdirSync(join(__dirname, '..', 'data'), { recursive: true });
mkdirSync(join(__dirname, '..', 'uploads'), { recursive: true });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

app.use('/api', gradingRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize DB then start server
getDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Card Centering API running on http://localhost:${PORT}`);
  });
});

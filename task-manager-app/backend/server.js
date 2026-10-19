import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Connected to MongoDB successfully!');
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB error:', err.message);
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT} (Offline Mode)`));
  });
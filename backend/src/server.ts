import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import inboxRoutes from './routes/inboxRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.use(cors());
    app.use(express.json());

    app.use('/api/projects', projectRoutes);
    app.use('/api/tasks', taskRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/inbox', inboxRoutes);
    app.use('/api/upload', uploadRoutes);

    app.get('/', (req, res) => {
        res.send('PM AI Agent Backend is running!');
    });

    app.listen(PORT, () => {
        console.log(`🚀 Main Backend listening on port ${PORT}`);
    });
};

startServer();

export default app;


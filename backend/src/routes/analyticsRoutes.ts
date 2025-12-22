import express from 'express';
import Project, { type IProject } from '../models/Project.js';
import Task, { type ITask } from '../models/Task.js';
import { calculateProjectAnalytics, type AnalyticsResult } from '../services/analyticsService.js';

const router = express.Router();

// GET analytics for a specific project
router.get('/:projectId', async (req, res) => {
    const { projectId } = req.params;

    try {
        const projectData: IProject | null = await Project.findById(projectId);
        if (!projectData) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const tasksData: ITask[] = await Task.find({ project: projectId }).populate('dependsOn', 'status');
        const analytics: AnalyticsResult = calculateProjectAnalytics(projectData, tasksData);

        res.json({
            projectId,
            projectName: projectData.name,
            analytics
        });

    } catch (error: any) {
        console.error("Analytics Route Error:", error);
        res.status(500).json({ message: "Failed to generate analytics", error: error.message });
    }
});

export default router;

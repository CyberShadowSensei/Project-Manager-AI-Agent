import express from 'express';
import Project, { type IProject } from '../models/Project.js';
import Task, { type ITask } from '../models/Task.js';
import { calculateProjectAnalytics, type AnalyticsResult } from '../services/analyticsService.js';

const router = express.Router();

// GET analytics for a specific project or global
router.get('/:projectId', async (req, res) => {
    const { projectId } = req.params;
    const { team } = req.query;

    try {
        let tasksQuery: any = {};
        let projectData: IProject | null = null;
        let projectName = 'Global View';

        if (projectId !== 'global' && projectId !== 'undefined') {
             projectData = await Project.findById(projectId);
             if (!projectData) {
                 return res.status(404).json({ message: 'Project not found' });
             }
             tasksQuery.project = projectId;
             projectName = projectData.name;
        }

        if (team) {
            tasksQuery.team = team;
        }

        const tasksData: ITask[] = await Task.find(tasksQuery).populate('dependsOn', 'status');
        
        // If global, we create a dummy project object for the calculator or adjust the calculator
        // The calculator only uses project object to pass it through? 
        // Checking analyticsService.ts: calculateProjectAnalytics(project: IProject, tasks: ITask[])
        // It seems it doesn't use project properties for calculation, only for context maybe?
        // Let's check the service again. It uses project for nothing?
        // Ah, checked read_file output: calculateProjectAnalytics takes (project, tasks) but DOES NOT USE project inside!
        // So we can pass a dummy or null.
        
        const analytics: AnalyticsResult = calculateProjectAnalytics(projectData as any, tasksData);

        res.json({
            projectId: projectId === 'global' ? null : projectId,
            projectName,
            analytics
        });

    } catch (error: any) {
        console.error("Analytics Route Error:", error);
        res.status(500).json({ message: "Failed to generate analytics", error: error.message });
    }
});

export default router;

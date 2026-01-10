import { type IProject } from '../models/Project.js';
import { type ITask } from '../models/Task.js';

export interface AnalyticsResult {
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
    healthScore: number; // New field: 0-100
    statusBreakdown: {
        todo: number;
        inProgress: number;
        done: number;
    };
    priorityBreakdown: {
        low: number;
        medium: number;
        high: number;
    };
    overdueCount: number;
    blockedCount: number;
}

export const calculateProjectAnalytics = (project: IProject, tasks: ITask[]): AnalyticsResult => {
    const totalTasks = tasks.length;
    if (totalTasks === 0) {
        return {
            totalTasks: 0,
            completedTasks: 0,
            completionPercentage: 0,
            healthScore: 100, // Empty project is "healthy"
            statusBreakdown: { todo: 0, inProgress: 0, done: 0 },
            priorityBreakdown: { low: 0, medium: 0, high: 0 },
            overdueCount: 0,
            blockedCount: 0
        };
    }

    const today = new Date();
    const stats: AnalyticsResult = {
        totalTasks,
        completedTasks: 0,
        completionPercentage: 0,
        healthScore: 100,
        statusBreakdown: { todo: 0, inProgress: 0, done: 0 },
        priorityBreakdown: { low: 0, medium: 0, high: 0 },
        overdueCount: 0,
        blockedCount: 0
    };

    tasks.forEach(task => {
        // Status Breakdown
        const status = (task.status || 'To Do').toLowerCase().replace(/\s+/g, '');
        if (status === 'todo') stats.statusBreakdown.todo++;
        else if (status === 'inprogress') stats.statusBreakdown.inProgress++;
        else if (status === 'done') {
            stats.statusBreakdown.done++;
            stats.completedTasks++;
        }

        // Priority Breakdown
        const priority = (task.priority || 'Medium').toLowerCase() as keyof typeof stats.priorityBreakdown;
        if (stats.priorityBreakdown[priority] !== undefined) {
            stats.priorityBreakdown[priority]++;
        }

        // Overdue Check
        if (task.status !== 'Done' && new Date(task.dueDate) < today) {
            stats.overdueCount++;
        }

        // Blocked Check
        if (task.dependsOn) {
            const dependencyTask = tasks.find(t => t._id.toString() === task.dependsOn?.toString());
            if (dependencyTask && dependencyTask.status !== 'Done') {
                stats.blockedCount++;
            }
        }
    });

    stats.completionPercentage = Math.round((stats.completedTasks / totalTasks) * 100);

    // --- HEALTH SCORE CALCULATION ---
    // Start at 100
    let score = 100;
    
    // Deduct 15 points per overdue task (max 45)
    score -= Math.min(stats.overdueCount * 15, 45);
    
    // Deduct 10 points per blocked task (max 30)
    score -= Math.min(stats.blockedCount * 10, 30);
    
    // Bonus for progress: add 0.2 * completion percentage
    score += (stats.completionPercentage * 0.1);

    // Final clamp
    stats.healthScore = Math.max(0, Math.min(100, Math.round(score)));

    return stats;
};

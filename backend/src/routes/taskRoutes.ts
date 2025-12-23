import express from 'express';
import Task, { type ITask } from '../models/Task.js';
import Project from '../models/Project.js'; // Assuming Project might be needed for validation
import { Types } from 'mongoose'; // Import Types for ObjectId

const router = express.Router();

// GET all tasks (optionally filter by project ID)
router.get('/', async (req, res) => {
    try {
        let query: any = {};
        if (req.query.projectId) {
            query.project = req.query.projectId;
        }

        const tasks: ITask[] = await Task.find(query)
            .populate('dependsOn', 'name status') // Populate dependency name & status
            .sort({ dueDate: 1 }); // Sort by due date (soonest first)
        
        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE a new task
router.post('/', async (req, res) => {
    try {
        const taskData: Partial<ITask> = { ...req.body };

        // Validate project ID ONLY if provided
        if (taskData.project && !Types.ObjectId.isValid(taskData.project)) {
             return res.status(400).json({ message: 'Invalid Project ID' });
        }
        
        if (taskData.project) {
            const projectExists = await Project.findById(taskData.project);
            if (!projectExists) {
                return res.status(404).json({ message: 'Project not found' });
            }
        }

        // Validate dependsOn ID if provided
        if (taskData.dependsOn && !Types.ObjectId.isValid(taskData.dependsOn)) {
            return res.status(400).json({ message: 'Invalid DependsOn Task ID' });
        }
        if (taskData.dependsOn) {
            const dependsOnTaskExists = await Task.findById(taskData.dependsOn);
            if (!dependsOnTaskExists) {
                return res.status(404).json({ message: 'DependsOn Task not found' });
            }
        }
        
        const newTask: ITask = new Task(taskData);
        const savedTask: ITask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// GET a single task by ID
router.get('/:id', async (req, res) => {
    try {
        const task: ITask | null = await Task.findById(req.params.id).populate('dependsOn', 'name status');
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE a task by ID
router.patch('/:id', async (req, res) => {
    try {
        // Validate dependsOn ID if provided in update
        if (req.body.dependsOn && !Types.ObjectId.isValid(req.body.dependsOn)) {
            return res.status(400).json({ message: 'Invalid DependsOn Task ID in update' });
        }
        if (req.body.dependsOn) {
            const dependsOnTaskExists = await Task.findById(req.body.dependsOn);
            if (!dependsOnTaskExists) {
                return res.status(404).json({ message: 'DependsOn Task not found in update' });
            }
        }

        const updatedTask: ITask | null = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('dependsOn', 'name status');
        
        if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
        res.json(updatedTask);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE a task by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedTask: ITask | null = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

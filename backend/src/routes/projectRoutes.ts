import express from 'express';
import Project, { type IProject } from '../models/Project.js';
import Task, { type ITask } from '../models/Task.js'; // Assuming Task is needed for validation or cascading deletes

const router = express.Router();

// GET all projects
router.get('/', async (req, res) => {
    try {
        const projects: IProject[] = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE a new project
router.post('/', async (req, res) => {
    try {
        const projectData: Partial<IProject> = { ...req.body };
        const newProject: IProject = new Project(projectData);
        const savedProject: IProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// GET a single project by ID
router.get('/:id', async (req, res) => {
    try {
        const project: IProject | null = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE a project by ID (e.g., name, dates)
router.patch('/:id', async (req, res) => {
    try {
        const updatedProject: IProject | null = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return the updated document, run schema validators
        );
        if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
        res.json(updatedProject);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE a project by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedProject: IProject | null = await Project.findByIdAndDelete(req.params.id);
        if (!deletedProject) return res.status(404).json({ message: 'Project not found' });

        // Optional: Delete all associated tasks
        await Task.deleteMany({ project: req.params.id });

        res.json({ message: 'Project and associated tasks deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});


export default router;

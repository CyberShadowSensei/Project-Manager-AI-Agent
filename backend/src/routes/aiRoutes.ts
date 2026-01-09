import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { createRequire } from 'module';
import { type IProject } from '../models/Project.js';
import { type ITask } from '../models/Task.js';
import { analyzeProject, chatOverProject, extractTasksFromText, type AnalyzeInput } from '../services/ai/analyzeProject.js'; // Person C's logic
import Project from '../models/Project.js'; // Mongoose model for fetching
import Task from '../models/Task.js'; // Mongoose model for fetching
import ChatMessage from '../models/ChatMessage.js'; // Chat History Model

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST AI Analysis for a project
router.post('/analyze/:projectId', async (req, res) => {
    const { projectId } = req.params;

    try {
        // Fetch project and tasks from our main database
        const projectData: IProject | null = await Project.findById(projectId);
        if (!projectData) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const tasksData: ITask[] = await Task.find({ project: projectId });

        // Transform our Mongoose objects into the expected interface for analyzeProject
        const aiInput: AnalyzeInput = {
            project: {
                id: projectData._id.toString(),
                name: projectData.name,
            },
            tasks: tasksData.map(t => ({
                id: t._id.toString(),
                title: t.name,
                status: t.status.toLowerCase().replace(' ', '_') as any, // e.g., "To Do" -> "to_do"
                priority: t.priority,
                dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
                assignee: t.owner,
                dependencies: t.dependsOn ? [t.dependsOn.toString()] : undefined,
            })),
        };

        // Call Person C's AI logic
        const analysis = await analyzeProject(aiInput);
        res.json(analysis);

    } catch (error: any) {
        console.error("AI Analyze Route Error:", error);
        res.status(500).json({ message: "Failed to generate AI analysis", error: error.message });
    }
});

// POST AI Chat for a project
router.post('/chat/:projectId', async (req, res) => {
    const { projectId } = req.params;
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ message: "Question is required for AI chat." });
    }

    try {
        const projectData: IProject | null = await Project.findById(projectId);
        if (!projectData) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const tasksData: ITask[] = await Task.find({ project: projectId });

        // Fetch recent chat history (last 10 messages)
        const rawHistory = await ChatMessage.find({ project: projectId })
            .sort({ createdAt: -1 })
            .limit(10);
        
        const history = rawHistory.reverse().map(m => ({
            role: m.role,
            content: m.content
        }));

        // Call Person C's AI chat logic
        const answer = await chatOverProject(
            { 
                id: projectData._id.toString(), 
                name: projectData.name,
                context: projectData.context 
            },
            tasksData.map(t => ({
                id: t._id.toString(),
                title: t.name,
                status: t.status.toLowerCase().replace(' ', '_') as any,
                priority: t.priority,
                dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
                assignee: t.owner,
                dependencies: t.dependsOn ? [t.dependsOn.toString()] : undefined,
            })),
            question,
            history
        );

        // Save the conversation turn
        await ChatMessage.create({
            project: projectId,
            role: 'user',
            content: question
        });

        await ChatMessage.create({
            project: projectId,
            role: 'assistant',
            content: answer
        });
        
        res.json({ answer });

    } catch (error: any) {
        console.error("AI Chat Route Error:", error);
        res.status(500).json({ message: "Failed to get AI chat response", error: error.message });
    }
});

// POST God Mode: Doc-to-Tasks (Raw Text)
router.post('/doc-to-tasks', async (req, res) => {
    const { document } = req.body;

    if (!document) {
        return res.status(400).json({ message: "Document text is required." });
    }

    try {
        const result = await extractTasksFromText(document);
        res.json(result);
    } catch (error: any) {
        console.error("Doc-to-Tasks Route Error:", error);
        res.status(500).json({ message: "Failed to extract tasks from document", error: error.message });
    }
});

// POST God Mode: Doc-to-Tasks (File Upload)
router.post('/extract-from-file', upload.single('file'), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        let extractedText = '';

        if (file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(file.path);
            const data = await pdf(dataBuffer);
            extractedText = data.text;
        } else {
            // Assume text/plain, markdown, etc.
            extractedText = fs.readFileSync(file.path, 'utf8');
        }

        // Clean up temp file
        fs.unlinkSync(file.path);

        const result = await extractTasksFromText(extractedText);
        res.json(result);

    } catch (error: any) {
        // Try to clean up file if it exists
        if (file && file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        console.error("Extract-from-file Route Error:", error);
        res.status(500).json({ message: "Failed to process file and extract tasks", error: error.message });
    }
});

export default router;

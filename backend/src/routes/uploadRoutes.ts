import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import Project from '../models/Project.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temporary storage

// POST /api/upload/:projectId
router.post('/:projectId', upload.single('file'), async (req, res) => {
    const { projectId } = req.params;
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
        } else if (file.mimetype === 'text/plain' || file.mimetype === 'text/markdown') {
            extractedText = fs.readFileSync(file.path, 'utf8');
        } else {
            // For other types, just note the filename for now
            extractedText = `[File uploaded: ${file.originalname}]`;
        }

        // Clean up temp file
        fs.unlinkSync(file.path);

        // Update Project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Append to context
        project.context = (project.context || '') + `

--- Document: ${file.originalname} ---
${extractedText}`;
        
        // Add to assets list
        project.assets = project.assets || [];
        project.assets.push({
            name: file.originalname,
            type: file.mimetype,
            size: file.size,
            uploadedAt: new Date()
        });

        await project.save();

        res.json({ message: 'File processed and context updated', assets: project.assets });

    } catch (error: any) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Failed to process file', error: error.message });
    }
});

export default router;

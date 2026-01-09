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

// DELETE /api/upload/:projectId/:assetId
router.delete('/:projectId/:assetId', async (req, res) => {
    const { projectId, assetId } = req.params;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Find the asset to get its name for context removal
        const asset = project.assets?.find(a => a._id?.toString() === assetId);
        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        // Remove from assets array
        project.assets = project.assets?.filter(a => a._id?.toString() !== assetId);

        // Remove from context using robust Regex
        if (project.context) {
            // Helper to escape regex special characters in filename
            const escapeRegExp = (string: string) => {
                return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            };

            const safeName = escapeRegExp(asset.name);
            // Regex explanation:
            // 1. (\\n|\\r\\n)* : Optional leading newlines
            // 2. --- Document: ${safeName} --- : The header
            // 3. [\\s\\S]*? : Non-greedy match of ANY character (including newlines)
            // 4. (?=(\\n|\\r\\n)*--- Document: |$) : Lookahead for the start of the next document OR end of string
            const regex = new RegExp(`(\\n|\\r\\n)*--- Document: ${safeName} ---[\\s\\S]*?(?=(\\n|\\r\\n)*--- Document: |$)`, 'g');
            
            project.context = project.context.replace(regex, '').trim();
        }

        await project.save();
        res.json({ message: 'Asset deleted and context updated', assets: project.assets });

    } catch (error: any) {
        console.error('Delete Asset Error:', error);
        res.status(500).json({ message: 'Failed to delete asset', error: error.message });
    }
});

export default router;

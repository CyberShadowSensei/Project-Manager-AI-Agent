import express from 'express';
import { WebClient } from "@slack/web-api";
import 'dotenv/config';
import { logActivity } from '../services/auditService.js';
import Project from '../models/Project.js';

const router = express.Router();
const token = process.env.SLACK_BOT_TOKEN;
const channel = process.env.SLACK_INBOX_CHANNEL;

router.post('/slack/alert', async (req, res) => {
    const { message, project, riskLevel } = req.body;

    if (!token || !channel) {
        return res.status(400).json({ message: 'Slack is not configured.' });
    }

    const client = new WebClient(token);

    try {
        await client.chat.postMessage({
            channel: channel,
            text: `⚠️ *PROJECT RISK ALERT: ${project}*`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `🚨 *CRITICAL ALERT: ${project}*\n*Status:* ${riskLevel} Risk Detected\n\n${message}`
                    }
                },
                {
                    type: "divider"
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: "📢 Sent via PM AI Agent Command Center"
                        }
                    ]
                }
            ]
        });

        // Log to audit
        const projectDoc = await Project.findOne({ name: project });
        if (projectDoc) {
            await logActivity(projectDoc._id.toString(), 'Emergency Alert', `Project status shared to Slack with ${riskLevel} risk level.`);
        }

        res.json({ message: 'Slack alert sent successfully!' });
    } catch (error: any) {
        console.error('Slack Alert Error:', error);
        res.status(500).json({ message: 'Failed to send Slack alert', error: error.message });
    }
});

// POST /slack/command - Handle incoming slash commands like /ai-status
router.post('/slack/command', async (req, res) => {
    const { text, user_name } = req.body; // text is the argument after the command

    try {
        // Simple heuristic: search for project by name based on command text
        // If text is empty, take the first project
        let project;
        if (text) {
            project = await Project.findOne({ name: new RegExp(text, 'i') });
        } else {
            project = await Project.findOne().sort({ updatedAt: -1 });
        }

        if (!project) {
            return res.json({
                response_type: "ephemeral",
                text: "❌ Project not found. Please specify a valid project name (e.g., `/ai-status Odyssey`)."
            });
        }

        // We can't easily run full AI analysis in a synchronous Slack response (3s limit)
        // But we can return the cached health score or a summary
        res.json({
            response_type: "in_channel",
            text: `📊 *System Intelligence Report for ${project.name}*`,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: `Project Health: ${project.name}`,
                        emoji: true
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `Greetings @${user_name}, here is the current status of *${project.name}* based on my last analysis.`
                    }
                },
                {
                    type: "divider"
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*Risk Level:*\nHigh` // Hardcoded or fetch from state
                        },
                        {
                            type: "mrkdwn",
                            text: `*Active Tasks:*\n${project.context?.length ? 'Context Active' : 'No Context'}`
                        }
                    ]
                },
                {
                    type: "actions",
                    elements: [
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "View Dashboard",
                                emoji: true
                            },
                            url: "https://project-manager-ai-agent-green.vercel.app/dashboard",
                            action_id: "button-action"
                        }
                    ]
                }
            ]
        });

        await logActivity(project._id.toString(), 'Slack Command', `User ${user_name} requested project status via Slack.`);

    } catch (error: any) {
        console.error('Slack Command Error:', error);
        res.json({ text: "Sorry, I encountered an error retrieving that project report." });
    }
});

export default router;

import express from 'express';
import { WebClient } from "@slack/web-api";
import 'dotenv/config';

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

        res.json({ message: 'Slack alert sent successfully!' });
    } catch (error: any) {
        console.error('Slack Alert Error:', error);
        res.status(500).json({ message: 'Failed to send Slack alert', error: error.message });
    }
});

export default router;

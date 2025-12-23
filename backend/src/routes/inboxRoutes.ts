import express, { Request, Response } from "express";
import { fetchInboxMessages, isSlackConfigured } from "../services/slack.js";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    let items = await fetchInboxMessages(20);
    const connected = isSlackConfigured && items.length >= 0; // If configured, we assume connected even if empty (but fetchInbox returns [] on error/missing)
    // Wait, fetchInboxMessages returns [] if missing env vars.
    // If isSlackConfigured is true, it tries to fetch.
    
    // Fallback to mock data if Slack returns nothing (or isn't configured)
    if (!items || items.length === 0) {
        // If configured but empty, maybe we shouldn't fallback? 
        // But for this hybrid approach, if empty, we might want to show *something* or just show empty state.
        // Let's stick to the fallback ONLY if !isSlackConfigured.
        
        if (!isSlackConfigured) {
            const mockMessages = [
                {
                    id: '1',
                    user: 'Sarah (Design Team)', // Mapped to 'user' to match Slack schema
                    topic: 'Final Logo Variations',
                    tag: 'Design',
                    text: 'Hey! I’ve just pushed the final logo variations for the "Odyssey" project.',
                    team: 'Design',
                    ts: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                },
                {
                    id: '2',
                    user: 'Mike (Marketing)',
                    topic: 'Q3 Campaign Brief',
                    tag: 'Marketing',
                    text: 'Here is the brief for the upcoming Q3 marketing campaign.',
                    team: 'Marketing',
                    ts: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                },
                {
                    id: '3',
                    user: 'SlackBot (Demo)',
                    topic: 'Integration Ready',
                    tag: 'System',
                    text: 'Slack integration is active! Configure .env to see real messages.',
                    team: 'System',
                    ts: new Date().toISOString(),
                }
            ];
            items = mockMessages;
        }
    }

    // Filter logic (reusing the mock filter logic roughly)
    if (req.query.searchQuery) {
        const searchQuery = (req.query.searchQuery as string).toLowerCase();
        items = items.filter(
            (m: any) =>
                (m.user || '').toLowerCase().includes(searchQuery) ||
                (m.text || '').toLowerCase().includes(searchQuery)
        );
    }

    res.json({ items, connected: isSlackConfigured });
  } catch (err) {
    console.error("Slack inbox error", err);
    res.status(500).json({ message: "Failed to load inbox" });
  }
});

// Fallback for mocked messages if Slack fails or isn't configured
router.get('/messages', (req, res) => {
    // Mock data for inbox messages (Person A's original logic, kept as fallback/demo)
    const mockMessages = [
        {
            _id: '1',
            name: 'Sarah (Design Team)',
            topic: 'Final Logo Variations',
            tag: 'Design',
            preview: 'Hey! I’ve just pushed the final logo variations for the "Odyssey" project.',
            team: 'Design',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
            _id: '2',
            name: 'Mike (Marketing)',
            topic: 'Q3 Campaign Brief',
            tag: 'Marketing',
            preview: 'Here is the brief for the upcoming Q3 marketing campaign.',
            team: 'Marketing',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
    ];

    let filtered = [...mockMessages];
    if (req.query.searchQuery) {
        const searchQuery = (req.query.searchQuery as string).toLowerCase();
        filtered = filtered.filter(
            (m) =>
                m.name.toLowerCase().includes(searchQuery) ||
                m.topic.toLowerCase().includes(searchQuery) ||
                m.preview.toLowerCase().includes(searchQuery)
        );
    }
    res.json(filtered);
});

export default router;

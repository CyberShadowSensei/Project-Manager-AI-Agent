import { WebClient } from "@slack/web-api";

const token = process.env.SLACK_BOT_TOKEN;
const channel = process.env.SLACK_INBOX_CHANNEL;

export const isSlackConfigured = !!(token && channel);

if (!token) {
  console.warn("SLACK_BOT_TOKEN is not set in .env");
}

const slackClient = new WebClient(token);

export async function fetchInboxMessages(limit = 20) {
  if (!isSlackConfigured) {
    console.warn("Slack env vars missing");
    return [];
  }

  try {
    const res = await slackClient.conversations.history({
      channel: channel!, // asserted by isSlackConfigured
      limit,
    });

    const messages = (res.messages || []).filter(
      (m: any) => !m.subtype && m.text
    );

    return messages.map((m: any) => ({
      id: m.ts,
      user: m.user, // Note: This is a user ID, typically you'd fetch user info to get a name
      text: m.text,
      ts: m.ts,
    }));
  } catch (error: any) {
    if (error.code === 'slack_webapi_platform_error' && error.data?.error === 'channel_not_found') {
        console.warn(`[Slack] Channel ${channel} not found or Bot not invited. Falling back to Demo Mode.`);
    } else {
        console.error("Error fetching Slack history:", error.message || error);
    }
    return [];
  }
}

# PM AI Agent - Smarter Project Management

An AI-powered project management assistant designed to streamline planning, task tracking, and team coordination. This agent summarizes status, predicts risks via ML, supports natural language commands, and integrates with Slack.

![Status](https://img.shields.io/badge/Status-Feature%20Complete-green)
![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20LangChain-blue)

## 🚀 Features

### 🧠 AI Intelligence ("God Mode")
*   **Context-Aware Chat:** Upload PRDs, meeting notes, or specs to the "AI Hub". The agent uses RAG (Retrieval-Augmented Generation) to answer questions based on your specific documents.
*   **Risk Prediction:** Automatically analyzes task dependencies and deadlines to flag "High Risk" items.
*   **Smart Summaries:** Generates daily stand-up updates and project status reports on demand.

### 📋 Task & Team Management
*   **Global & Project Views:** Manage tasks across the entire organization or drill down into specific projects.
*   **Team Workflows:** Filter tasks by teams (Marketing, Development, Design, Product, Operations).
*   **Visual Dashboard:** Real-time charts for Status Overview, Completion Rate, and Risk Distribution.

### 🔌 Integrations
*   **Smart Slack Inbox:**
    *   **Real Connection:** Add your Slack Bot Token to see live messages.
    *   **Demo Mode:** If unconfigured, the system gracefully shows high-fidelity mock data for demonstration purposes.

---

## 🛠️ Tech Stack

*   **Frontend:** React (v19), Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons.
*   **Backend:** Node.js, Express, MongoDB (Mongoose).
*   **AI Engine:** LangChain.js (Groq Llama-3-8b primary, OpenAI GPT-4o fallback).

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/pm-ai-agent.git
cd pm-ai-agent
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pm_ai
GROQ_API_KEY=your_groq_key
OPENAI_API_KEY=your_openai_key_optional

# Optional: Real Slack Integration
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_INBOX_CHANNEL=C12345678
```
Start the backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Start the frontend:
```bash
npm run dev
```

---

## 🧪 Usage Guide

1.  **Create Tasks:** Use the "Add Task" button. You don't need a project; tasks can be global.
2.  **Upload Context:** Go to **AI Hub** (sidebar) and drop a PDF/Text file (e.g., a PRD).
3.  **Chat with AI:** Click the 💬 icon or use the inline chat in AI Hub. Ask: *"What are the risks in the uploaded PRD?"*
4.  **Check Inbox:** Go to the dashboard. You will see "Demo Mode" messages unless you configured Slack.

---

## 🤝 Team
*   **Divya Adhikari:** Frontend UI/UX & React Components.
*   **Shriyukt Gupta:** Backend API, Database Architecture & DevOps.
*   **Shubhanshi Negi:** AI Logic, Prompt Engineering & LangChain Integration.

---

## 📜 License
MIT
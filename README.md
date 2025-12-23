# PM AI Agent - Smarter Project Management

An AI-powered project management assistant designed to streamline planning, task tracking, and team coordination. This agent summarizes status, predicts risks via ML, supports natural language commands, and integrates with Slack.

![Status](https://img.shields.io/badge/Status-Feature%20Complete-green)
![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20LangChain-blue)

## 📌 Project Context (Hackathon Challenge)

**Background:**
Project Managers often struggle to keep track of deliverables, dependencies, and progress across distributed teams. An AI-powered PM Agent can assist in planning, task tracking, and team coordination using intelligent automation.

**Our Mission:**
Create an AI agent that satisfies the following core objectives:
*   Summarize project status, generate daily stand-up updates, and track deadlines.
*   Integrate with platforms like Jira, Trello, and Slack.
*   Predict risks or delays using ML models.
*   Enable natural language commands for quick queries and reporting.

---

## 🚀 Key Features Implemented

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

## 🏗️ Architecture

The application follows a modular full-stack architecture for scalability and clear separation of concerns:

```mermaid
graph TD
    User["User (Browser)"] -->|HTTP/JSON| Frontend["React + Vite Frontend"]
    Frontend -->|REST API| Backend["Node.js + Express Backend"]
    Backend -->|Mongoose| DB[("MongoDB Atlas")]
    Backend -->|LangChain| AIService["AI Service Layer"]
    AIService -->|Primary| Groq["Groq Llama-3"]
    AIService -->|Fallback| OpenAI["OpenAI GPT-4o"]
```

### 💡 Why LangChain.js?
We chose **LangChain.js** as the backbone of our AI service for three key reasons:
1.  **Provider Agnostic:** It allows us to seamlessly switch between **Groq** (for speed) and **OpenAI** (for fallback reliability) without rewriting core logic.
2.  **Structured Output:** Its output parsers help enforce strict JSON schemas, preventing the common "hallucination" errors where AI returns invalid data.
3.  **Prompt Management:** It simplifies chaining prompts and context, which is essential for our "God Mode" document analysis.

---

## 🛠️ Tech Stack

*   **Frontend:** React (v19), Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons, @tailwindcss/typography.
*   **Backend:** Node.js, Express, MongoDB (Mongoose).
*   **AI Engine:** LangChain.js (Groq Llama-3-8b primary, OpenAI GPT-4o fallback).
*   **Tools:** PDF-Parse, Multer, @slack/web-api.

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/CyberShadowSensei/Project-Manager-AI-Agent.git
cd Project-Manager-AI-Agent
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

## 🔮 Future Goals

*   **Advanced Workspace Management:** Implementation of multi-tenant environments for different teams.
*   **Granular Activity Logging:** Comprehensive audit trails for project and task modifications.
*   **Jira/Trello Integration:** Expand the "Smart Inbox" concept to include bi-directional sync with Jira boards.

---

## 🤝 Team
*   **Divya Adhikari:** Frontend UI/UX & React Components.
*   **Shriyukt Gupta:** Backend API, Database Architecture & DevOps.
*   **Shubhanshi Negi:** AI Logic, Prompt Engineering & LangChain Integration.

---

## 📜 License
MIT
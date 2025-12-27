# PM AI Agent - Smarter Project Management (Team: The NPCs)

An AI-powered project management assistant designed to streamline planning, task tracking, and team coordination. This agent summarizes status, predicts risks via machine learning, supports natural language commands, and integrates with Slack.

![Status](https://img.shields.io/badge/Status-Feature%20Complete-green)
![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20LangChain-blue)

## 🔗 Project Links
*   **Deployment URL:** [https://project-manager-ai-agent-green.vercel.app/](https://project-manager-ai-agent-green.vercel.app/)
*   **Demo Video:** [https://drive.google.com/file/d/1nsPLL1ZEoowwnFAY_cf-_Gup_zPI39Y7/view?usp=drivesdk]

## 📌 Problem Statement: PM AI Agent – Smarter Project Management

**Background:**
Project Managers often struggle to keep track of deliverables, dependencies, and progress across distributed teams. An AI-powered PM Agent can assist in planning, task tracking, and team coordination using intelligent automation.

**Our Task:**
*   Create an AI agent that can summarize project status, generate daily stand-up updates, and track deadlines.
*   Integrate with platforms like Jira, Trello, and Slack.
*   Predict risks or delays using ML models.
*   Enable natural language commands for quick queries and reporting.

---

## 🚀 Key Features Implemented

### 🧠 AI Intelligence
*   **Context-Aware Chat:** Upload PRDs, meeting notes, or specifications to the "AI Hub". The agent uses RAG (Retrieval-Augmented Generation) to answer questions based on your specific documents.
*   **Chat Memory Buffer:** Remembers the last 10 interactions for natural, conversational follow-up questions.
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
    AIService -->|Primary| Groq1["Groq Llama-3 (Primary)"]
    AIService -->|Fallback| Groq2["Groq (Secondary Model)"]
```

### 💡 Why LangChain.js?
We started with standard LangChain but pivoted to **LangChain.js** to unify our stack. This switch allowed us to keep our entire codebase in **TypeScript**, eliminating the need for a Python microservice and ensuring end-to-end type safety between our backend and AI logic. It integrates natively with Node.js's event loop, allowing us to handle concurrent AI requests and real-time data efficiently.

### 🛡️ Groq-on-Groq Fallback Strategy
We intentionally avoided OpenAI for fallback. Our context-aware prompts are heavily fine-tuned for **Groq's Llama-3 models**. To ensure consistency, our fallback mechanism switches to a **different high-performance model within the Groq ecosystem**, guaranteeing that the AI's tone, formatting, and instruction-following remain stable even during primary model constraints. Sticking to a single service provider prevents the "prompt drift" that occurs when moving between different providers (e.g., Llama to GPT).

---

## 🛠️ Tech Stack

*   **Frontend:** React (v19), Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons, @tailwindcss/typography.
*   **Backend:** Node.js, Express, MongoDB (Mongoose).
*   **AI Engine:** LangChain.js (Groq Llama-3-8b primary + Groq fallback).
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
MONGODB_URI=mongodb+srv://your_connection_string
GROQ_API_KEY=your_primary_groq_key
GROQ_FALLBACK_KEY=your_secondary_groq_key

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

## 🤝 Team: The NPCs
*   **Divya Adhikari:** Frontend UI/UX & React Components.
*   **Shriyukt Gupta:** Backend API, Database Architecture & DevOps.
*   **Shubhanshi Negi:** AI Logic, Prompt Engineering & LangChain Integration.

---

## 📜 License
MIT

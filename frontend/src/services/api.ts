import axios from 'axios';

// The backend URL will be picked up from the .env file in the frontend directory
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// --- INTERFACES (matching backend models) ---

export interface Project {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  description?: string;
  image?: string;
}

export interface Task {
  _id: string;
  project: string;
  name: string;
  owner: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  description?: string;
  dependsOn?: {
    _id: string;
    name: string;
    status: string;
  } | null;
}

export interface Analytics {
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
    statusBreakdown: {
        todo: number;
        inProgress: number;
        done: number;
    };
    priorityBreakdown: {
        low: number;
        medium: number;
        high: number;
    };
    overdueCount: number;
    blockedCount: number;
}

export interface AIInsights {
  summary: string;
  riskLevel: "Low" | "Medium" | "High";
  deadlines: {
    overdue: { id: string; title: string }[];
    dueSoon: { id: string; title: string }[];
    onTrack: { id: string; title: string }[];
  };
  standupUpdate: string;
  suggestedActions: {
    taskId: string | null;
    action: string;
    reason: string;
  }[];
}


// --- API FUNCTIONS ---

export const projectService = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (data: Omit<Project, '_id' | 'createdAt'>) => api.post<Project>('/projects', data),
  update: (id: string, data: Partial<Omit<Project, '_id' | 'createdAt'>>) => api.patch<Project>(`/projects/${id}`, data),
  remove: (id: string) => api.delete(`/projects/${id}`),
};

export const taskService = {
  getByProject: (projectId: string) => api.get<Task[]>(`/tasks?projectId=${projectId}`),
  create: (data: Omit<Task, '_id' | 'createdAt' | 'dependsOn'> & { dependsOn?: string }) => api.post<Task>('/tasks', data),
  update: (id: string, data: Partial<Omit<Task, '_id' | 'createdAt'>>) => api.patch<Task>(`/tasks/${id}`, data),
  remove: (id: string) => api.delete(`/tasks/${id}`),
};

export const analyticsService = {
  getProjectAnalytics: (projectId: string) => api.get<{ analytics: Analytics }>(`/analytics/${projectId}`),
};

export const aiService = {
  getInsights: (projectId: string) => api.post<AIInsights>(`/ai/analyze/${projectId}`),
  chatWithAI: (projectId: string, question: string) => api.post<{ answer: string }>(`/ai/chat/${projectId}`, { question }),
};

export default api;
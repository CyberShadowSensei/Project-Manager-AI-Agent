import axios from 'axios';

// The backend URL will be picked up from the .env file in the frontend directory
const API_BASE_URL = import.meta.env.VITE_API_URL;

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
  context?: string;
  assets?: {
    _id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
  }[];
}

export interface Task {
  _id: string;
  project?: string;
  name: string;
  owner: string;
  team?: 'Marketing' | 'Development' | 'Design' | 'Product' | 'Operations';
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  description?: string;
  dependsOn?: { // For fetched tasks, it's populated
    _id: string;
    name: string;
    status: string;
  } | null;
}

// For creating/updating tasks, dependsOn is just the ID string
export interface TaskUpdateData extends Omit<Task, '_id' | 'createdAt' | 'dependsOn'> {
  dependsOn?: string | null;
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

// Unified Inbox Message Interface
export interface InboxMessage {
  _id?: string;
  id?: string; // Slack uses 'id' or 'ts'
  name?: string;
  user?: string; // Slack uses 'user'
  topic?: string;
  tag?: string;
  preview?: string;
  text?: string; // Slack uses 'text'
  team?: string;
  timestamp?: string;
  ts?: string; // Slack timestamp
}


// --- API FUNCTIONS ---

export const projectService = {
  getAll: () => api.get<Project[]>('/api/projects'),
  getById: (id: string) => api.get<Project>(`/api/projects/${id}`),
  create: (data: Omit<Project, '_id' | 'createdAt'>) => api.post<Project>('/api/projects', data),
  update: (id: string, data: Partial<Omit<Project, '_id' | 'createdAt'>>) => api.patch<Project>(`/api/projects/${id}`, data),
  remove: (id: string) => api.delete(`/api/projects/${id}`),
  uploadFile: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ message: string; assets: { _id: string; name: string; type: string; size: number; uploadedAt: string; }[] }>(`/api/upload/${projectId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const taskService = {
  getByProject: (projectId?: string, searchQuery?: string) => {
    return api.get<Task[]>(`/api/tasks`, { params: { projectId, searchQuery } });
  },
  create: (data: TaskUpdateData) => api.post<Task>('/api/tasks', data),
  update: (id: string, data: Partial<TaskUpdateData>) => api.patch<Task>(`/api/tasks/${id}`, data),
  remove: (id: string) => api.delete(`/api/tasks/${id}`),
};

export const analyticsService = {
  getProjectAnalytics: (projectId?: string, team?: string | null) => {
    const id = projectId || 'global';
    return api.get<{ analytics: Analytics }>(`/api/analytics/${id}`, { params: { team } });
  },
};

export const aiService = {
  getInsights: (projectId: string) => api.post<AIInsights>(`/api/ai/analyze/${projectId}`),
  chatWithAI: (projectId: string, question: string) => api.post<{ answer: string }>(`/api/ai/chat/${projectId}`, { question }),
};

export const inboxService = {
  // Tries to get messages. If Slack is set up, it hits /inbox (root).
  // If not, it falls back to mock data handled by the backend.
  getMessages: (searchQuery?: string) => {
    return api.get<{ items: InboxMessage[], connected: boolean }>('/api/inbox', {
      params: { searchQuery },
    });
  },
};

export default api;

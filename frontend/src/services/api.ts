import axios from 'axios';

// The backend URL will be picked up from the .env file in the frontend directory
const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// --- INTERFACES (Strictly matching backend/src/models) ---

export interface Project {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  description?: string;
  context?: string;
  assets?: {
    _id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
  }[];
  // image is not in backend model, but might be virtual/future
  image?: string;
}

export interface Task {
  _id: string;
  project?: string;
  name: string;
  owner: string;
  team: 'Marketing' | 'Development' | 'Design' | 'Product' | 'Operations';
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  description?: string;
  createdAt?: string;
  dependsOn?: { 
    _id: string;
    name: string;
    status: string;
  } | null;
}

// For creating/updating tasks, dependsOn is just the ID string
export interface TaskUpdateData {
  project?: string;
  name: string;
  owner: string;
  team: 'Marketing' | 'Development' | 'Design' | 'Product' | 'Operations';
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  description?: string;
  dependsOn?: string | null | undefined;
}

export interface Analytics {
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
    healthScore: number;
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

// --- HELPER ---

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// --- API FUNCTIONS ---

export const projectService = {
  getAll: () => api.get<Project[]>('/api/projects'),
  getById: (id: string) => api.get<Project>(`/api/projects/${id}`),
  create: (data: Omit<Project, '_id' | 'createdAt' | 'context' | 'assets'>) => api.post<Project>('/api/projects', data),
  update: (id: string, data: Partial<Omit<Project, '_id' | 'createdAt'>>) => api.patch<Project>(`/api/projects/${id}`, data),
  remove: (id: string) => api.delete(`/api/projects/${id}`),
  getAuditLogs: (id: string) => api.get<any[]>(`/api/projects/${id}/audit`),
  uploadFile: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ message: string; assets: { _id: string; name: string; type: string; size: number; uploadedAt: string; }[] }>(`/api/upload/${projectId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: (projectId: string, assetId: string) => api.delete(`/api/upload/${projectId}/${assetId}`),
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
  getInsights: (projectId: string, forceRefresh = false) => 
    api.post<AIInsights>(`/api/ai/analyze/${projectId}${forceRefresh ? '?force=true' : ''}`),
  chatWithAI: (projectId: string, question: string) => api.post<{ answer: string }>(`/api/ai/chat/${projectId}`, { question }),
  
  // Async Job Endpoints
  extractTasks: (document: string) => api.post<{ message: string; jobId: string }>('/api/ai/doc-to-tasks', { document }),
  extractTasksFromFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ message: string; jobId: string }>('/api/ai/extract-from-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getJobStatus: (jobId: string) => api.get<{ status: 'pending' | 'processing' | 'completed' | 'failed'; result?: any; error?: string }>(`/api/ai/jobs/${jobId}`),
};

export const inboxService = {
  getMessages: (searchQuery?: string) => {
    return api.get<{ items: InboxMessage[], connected: boolean }>('/api/inbox', {
      params: { searchQuery },
    });
  },
};

export const integrationService = {
  sendSlackAlert: (data: { message: string; projectId: string; riskLevel: string }) => 
    api.post('/api/integrations/slack/alert', data),
};

export default api;
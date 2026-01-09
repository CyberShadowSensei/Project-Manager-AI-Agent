import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
/* eslint-disable react-refresh/only-export-components */
import { projectService } from '../services/api';
import type { Project } from '../services/api';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  loadingProjects: boolean;
  refreshProjects: () => Promise<void>;
  taskRefreshTrigger: number;
  triggerTaskRefresh: () => void;
  riskLevel: 'Low' | 'Medium' | 'High' | 'none';
  refreshRisk: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [taskRefreshTrigger, setTaskRefreshTrigger] = useState(0);
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High' | 'none'>('none');

  const refreshRisk = useCallback(async () => {
    if (!currentProject) {
      setRiskLevel('none');
      return;
    }
    try {
      const { aiService } = await import('../services/api');
      const response = await aiService.getInsights(currentProject._id);
      setRiskLevel(response.data.riskLevel || 'Low');
    } catch (err) {
      console.error("Failed to fetch risk level", err);
    }
  }, [currentProject]);

  useEffect(() => {
    if (currentProject) {
      refreshRisk();
    }
  }, [currentProject, taskRefreshTrigger, refreshRisk]);

  const refreshProjects = useCallback(async () => {
    try {
      setLoadingProjects(true);
      const response = await projectService.getAll();
      const projectsArray = response.data || [];
      setProjects(projectsArray);
      
      // If no project is currently selected, default to the first one
      if (!currentProject && projectsArray.length > 0) {
        setCurrentProject(projectsArray[0]);
      } else if (projectsArray.length === 0) {
        setCurrentProject(null);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
      setCurrentProject(null);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const triggerTaskRefresh = () => {
    setTaskRefreshTrigger(prev => prev + 1);
  };

  const addProject = (project: Project) => {
    setProjects(prev => [project, ...prev]);
    setCurrentProject(project);
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    try {
      const response = await projectService.update(id, data);
      setProjects(prev => prev.map(p => p._id === id ? response.data : p));
      if (currentProject?._id === id) {
        setCurrentProject(response.data);
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectService.remove(id);
      setProjects(prev => prev.filter(p => p._id !== id));
      if (currentProject?._id === id) {
        setCurrentProject(projects.length > 1 ? projects[0] : null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  return (
    <ProjectContext.Provider value={{ projects, currentProject, setCurrentProject, addProject, updateProject, deleteProject, loadingProjects, refreshProjects, taskRefreshTrigger, triggerTaskRefresh, riskLevel, refreshRisk }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
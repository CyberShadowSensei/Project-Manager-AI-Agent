import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
/* eslint-disable react-refresh/only-export-components */
import { projectService } from '../services/api';
import type { Project } from '../services/api';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  loadingProjects: boolean;
  refreshProjects: () => Promise<void>;
  taskRefreshTrigger: number;
  triggerTaskRefresh: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [taskRefreshTrigger, setTaskRefreshTrigger] = useState(0);

  const refreshProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await projectService.getAll();
      setProjects(response.data);
      
      // If no project is currently selected, default to the first one
      if (response.data.length > 0 && currentProject === null) {
        setCurrentProject(response.data[0]);
      } else if (response.data.length === 0) {
        setCurrentProject(null);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
      setCurrentProject(null);
    } finally {
      setLoadingProjects(false);
    }
  };

  const triggerTaskRefresh = () => {
    setTaskRefreshTrigger(prev => prev + 1);
  };

  const addProject = (project: Project) => {
    setProjects(prev => [project, ...prev]);
    setCurrentProject(project);
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, currentProject, setCurrentProject, addProject, loadingProjects, refreshProjects, taskRefreshTrigger, triggerTaskRefresh }}>
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
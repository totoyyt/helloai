import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [entries, setEntries] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [projectsData, tasksData, activeData] = await Promise.all([
        api.getProjects(),
        api.getTasks(),
        api.getActiveTimer()
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
      setActiveEntry(activeData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createProject = async (name, color) => {
    const project = await api.createProject(name, color);
    setProjects([...projects, project]);
    return project;
  };

  const updateProject = async (id, data) => {
    const updated = await api.updateProject(id, data);
    setProjects(projects.map(p => p.id === id ? updated : p));
    return updated;
  };

  const deleteProject = async (id) => {
    await api.deleteProject(id);
    setProjects(projects.filter(p => p.id !== id));
    setTasks(tasks.filter(t => t.projectId !== id));
  };

  const createTask = async (projectId, name) => {
    const task = await api.createTask(projectId, name);
    setTasks([...tasks, task]);
    return task;
  };

  const updateTask = async (id, data) => {
    const updated = await api.updateTask(id, data);
    setTasks(tasks.map(t => t.id === id ? updated : t));
    return updated;
  };

  const deleteTask = async (id) => {
    await api.deleteTask(id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const startTimer = async (projectId, taskId) => {
    const entry = await api.startTimer(projectId, taskId);
    setActiveEntry(entry);
    return entry;
  };

  const stopTimer = async () => {
    const entry = await api.stopTimer();
    if (entry && !entry.error) {
      setEntries([...entries, entry]);
      setActiveEntry(null);
    }
    return entry;
  };

  const loadEntries = async (date) => {
    const data = await api.getEntries(date);
    setEntries(data);
  };

  const deleteEntry = async (id) => {
    await api.deleteEntry(id);
    setEntries(entries.filter(e => e.id !== id));
  };

  const value = {
    projects,
    tasks,
    entries,
    activeEntry,
    loading,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    startTimer,
    stopTimer,
    loadEntries,
    deleteEntry,
    refreshData: loadData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

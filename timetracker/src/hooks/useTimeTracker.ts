import { useState, useEffect, useCallback } from 'react';
import type { AppState, Project, Task, TimeEntry } from '../types';
import {
  loadState,
  saveState,
  createProject,
  createTask,
  createTimeEntry,
  stopTimeEntry,
} from '../utils/storage';

export function useTimeTracker() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addProject = useCallback((name: string, color: string) => {
    const project = createProject(name, color);
    setState((prev) => ({
      ...prev,
      projects: [...prev.projects, project],
    }));
    return project;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Pick<Project, 'name' | 'color' | 'archived'>>) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
      tasks: prev.tasks.filter((t) => t.projectId !== id),
      timeEntries: prev.timeEntries.map((e) =>
        e.projectId === id ? { ...e, projectId: null, taskId: null } : e
      ),
    }));
  }, []);

  const addTask = useCallback((name: string, projectId: string) => {
    const task = createTask(name, projectId);
    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, task],
    }));
    return task;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Pick<Task, 'name' | 'archived'>>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
      timeEntries: prev.timeEntries.map((e) =>
        e.taskId === id ? { ...e, taskId: null } : e
      ),
    }));
  }, []);

  const startTimer = useCallback((description: string, projectId: string | null, taskId: string | null) => {
    setState((prev) => {
      let updatedEntries = prev.timeEntries;
      if (prev.runningEntryId) {
        updatedEntries = updatedEntries.map((e) =>
          e.id === prev.runningEntryId ? stopTimeEntry(e) : e
        );
      }
      const entry = createTimeEntry(description, projectId, taskId);
      return {
        ...prev,
        timeEntries: [...updatedEntries, entry],
        runningEntryId: entry.id,
      };
    });
  }, []);

  const stopTimer = useCallback(() => {
    setState((prev) => {
      if (!prev.runningEntryId) return prev;
      return {
        ...prev,
        timeEntries: prev.timeEntries.map((e) =>
          e.id === prev.runningEntryId ? stopTimeEntry(e) : e
        ),
        runningEntryId: null,
      };
    });
  }, []);

  const updateTimeEntry = useCallback((id: string, updates: Partial<Pick<TimeEntry, 'description' | 'projectId' | 'taskId' | 'startTime' | 'endTime'>>) => {
    setState((prev) => ({
      ...prev,
      timeEntries: prev.timeEntries.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  }, []);

  const deleteTimeEntry = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      timeEntries: prev.timeEntries.filter((e) => e.id !== id),
      runningEntryId: prev.runningEntryId === id ? null : prev.runningEntryId,
    }));
  }, []);

  const getRunningEntry = useCallback((): TimeEntry | null => {
    if (!state.runningEntryId) return null;
    return state.timeEntries.find((e) => e.id === state.runningEntryId) || null;
  }, [state.runningEntryId, state.timeEntries]);

  const getProjectById = useCallback((id: string | null): Project | null => {
    if (!id) return null;
    return state.projects.find((p) => p.id === id) || null;
  }, [state.projects]);

  const getTaskById = useCallback((id: string | null): Task | null => {
    if (!id) return null;
    return state.tasks.find((t) => t.id === id) || null;
  }, [state.tasks]);

  const getTasksForProject = useCallback((projectId: string): Task[] => {
    return state.tasks.filter((t) => t.projectId === projectId && !t.archived);
  }, [state.tasks]);

  return {
    projects: state.projects.filter((p) => !p.archived),
    allProjects: state.projects,
    tasks: state.tasks.filter((t) => !t.archived),
    allTasks: state.tasks,
    timeEntries: state.timeEntries,
    runningEntryId: state.runningEntryId,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    startTimer,
    stopTimer,
    updateTimeEntry,
    deleteTimeEntry,
    getRunningEntry,
    getProjectById,
    getTaskById,
    getTasksForProject,
  };
}

import type { AppState, Project, Task, TimeEntry } from '../types';

const STORAGE_KEY = 'timetracker_data';

const defaultState: AppState = {
  projects: [],
  tasks: [],
  timeEntries: [],
  runningEntryId: null,
};

export function loadState(): AppState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return defaultState;
    return JSON.parse(data) as AppState;
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createProject(name: string, color: string): Project {
  return {
    id: generateId(),
    name,
    color,
    createdAt: new Date().toISOString(),
    archived: false,
  };
}

export function createTask(name: string, projectId: string): Task {
  return {
    id: generateId(),
    name,
    projectId,
    createdAt: new Date().toISOString(),
    archived: false,
  };
}

export function createTimeEntry(
  description: string,
  projectId: string | null,
  taskId: string | null
): TimeEntry {
  return {
    id: generateId(),
    description,
    projectId,
    taskId,
    startTime: new Date().toISOString(),
    endTime: null,
    createdAt: new Date().toISOString(),
  };
}

export function stopTimeEntry(entry: TimeEntry): TimeEntry {
  return {
    ...entry,
    endTime: new Date().toISOString(),
  };
}

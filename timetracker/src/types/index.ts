export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  archived: boolean;
}

export interface Task {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  archived: boolean;
}

export interface TimeEntry {
  id: string;
  description: string;
  projectId: string | null;
  taskId: string | null;
  startTime: string;
  endTime: string | null;
  createdAt: string;
}

export interface AppState {
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  runningEntryId: string | null;
}

export type ViewType = 'timer' | 'daily' | 'weekly' | 'monthly' | 'projects';

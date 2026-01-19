import { useState, useEffect } from 'react';
import type { Project, Task, TimeEntry } from '../types';

interface TimerProps {
  projects: Project[];
  runningEntry: TimeEntry | null;
  recentEntries: TimeEntry[];
  onStart: (description: string, projectId: string | null, taskId: string | null) => void;
  onStop: () => void;
  getTasksForProject: (projectId: string) => Task[];
  getProjectById: (id: string | null) => Project | null;
  getTaskById: (id: string | null) => Task | null;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export const Timer = ({
  projects,
  runningEntry,
  recentEntries,
  onStart,
  onStop,
  getTasksForProject,
  getProjectById,
  getTaskById,
}: TimerProps) => {
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (runningEntry) {
      const startTime = new Date(runningEntry.startTime).getTime();
      setElapsedTime(Date.now() - startTime);
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [runningEntry]);

  const handleStart = () => {
    onStart(description, selectedProjectId || null, selectedTaskId || null);
    setDescription('');
    setSelectedProjectId('');
    setSelectedTaskId('');
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    setSelectedProjectId(projectId);
    setSelectedTaskId('');
  };

  const filteredTasks = selectedProjectId ? getTasksForProject(selectedProjectId) : [];

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-[8px_8px_0px_0px_rgba(24,24,27,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]">
      <div className="flex flex-col gap-6">
        <div className="relative overflow-hidden bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 p-8 flex flex-col items-center justify-center min-h-[200px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-zinc-100 dark:bg-zinc-800">
            {runningEntry && (
              <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out_infinite]" />
            )}
          </div>
          
          <div className="font-mono text-7xl md:text-8xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50 tabular-nums">
            {formatDuration(elapsedTime)}
          </div>
          
          {runningEntry && (
            <div className="mt-4 flex flex-col items-center gap-2 animate-fade-in">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">
                Recording
              </span>
              <div className="text-zinc-600 dark:text-zinc-400 text-center max-w-md truncate font-medium">
                {runningEntry.description || 'No description'}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                {getProjectById(runningEntry.projectId)?.name && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getProjectById(runningEntry.projectId)?.color }} />
                    {getProjectById(runningEntry.projectId)?.name}
                  </span>
                )}
                {getTaskById(runningEntry.taskId)?.name && (
                  <>
                    <span>/</span>
                    <span>{getTaskById(runningEntry.taskId)?.name}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {!runningEntry ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-12">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you working on?"
                className="w-full h-14 px-4 bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none transition-colors text-lg placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            
            <div className="md:col-span-5">
              <select
                value={selectedProjectId}
                onChange={handleProjectChange}
                className="w-full h-14 px-4 bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none transition-colors appearance-none cursor-pointer text-zinc-900 dark:text-zinc-100"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5">
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                disabled={!selectedProjectId}
                className="w-full h-14 px-4 bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 dark:text-zinc-100"
              >
                <option value="">Select Task</option>
                {filteredTasks.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleStart}
                className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 active:translate-y-1 active:shadow-none text-white font-bold uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_rgba(6,95,70,1)] border-2 border-emerald-600"
              >
                Start
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onStop}
            className="w-full h-20 bg-rose-500 hover:bg-rose-400 active:translate-y-1 active:shadow-none text-white text-xl font-bold uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(159,18,57,1)] border-2 border-rose-600 flex items-center justify-center gap-3"
          >
            <div className="w-4 h-4 bg-white" />
            Stop Timer
          </button>
        )}

        {!runningEntry && recentEntries.length > 0 && (
          <div className="mt-4 pt-6 border-t-2 border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
              Quick Continue
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentEntries.slice(0, 5).map((entry) => {
                const project = getProjectById(entry.projectId);
                return (
                  <button
                    key={entry.id}
                    onClick={() => onStart(entry.description, entry.projectId, entry.taskId)}
                    className="group flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all text-left max-w-xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                      <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-zinc-400 dark:border-l-zinc-600 border-b-[5px] border-b-transparent ml-1 group-hover:border-l-emerald-600 dark:group-hover:border-l-emerald-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate w-full block">
                        {entry.description || 'No description'}
                      </span>
                      {project && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.color }} />
                          {project.name}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

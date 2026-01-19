import { useState, useMemo, useEffect } from 'react';
import type { TimeEntry, Project, Task } from '../types';

interface DailyLogProps {
  entries: TimeEntry[];
  projects: Project[];
  onUpdateEntry: (id: string, updates: Partial<Pick<TimeEntry, 'description' | 'projectId' | 'taskId' | 'startTime' | 'endTime'>>) => void;
  onDeleteEntry: (id: string) => void;
  getProjectById: (id: string | null) => Project | null;
  getTaskById: (id: string | null) => Task | null;
  getTasksForProject: (projectId: string) => Task[];
}

export default function DailyLog({
  entries,
  projects,
  onUpdateEntry,
  onDeleteEntry,
  getProjectById,
  getTaskById,
  getTasksForProject
}: DailyLogProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  function getStartOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  
  function getEndOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }
  
  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  
  function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
  
  function getEntryDuration(entry: TimeEntry): number {
    const start = new Date(entry.startTime).getTime();
    const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now();
    return end - start;
  }

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const dailyEntries = useMemo(() => {
    const start = getStartOfDay(selectedDate);
    const end = getEndOfDay(selectedDate);
    
    return entries.filter(entry => {
      const entryTime = new Date(entry.startTime);
      return entryTime >= start && entryTime <= end;
    }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [entries, selectedDate]);

  const totalDuration = useMemo(() => {
    return dailyEntries.reduce((acc, entry) => acc + getEntryDuration(entry), 0);
  }, [dailyEntries]);

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
            <button 
              onClick={handlePrevDay} 
              className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              aria-label="Previous day"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button 
              onClick={handleToday} 
              className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Today
            </button>
            <button 
              onClick={handleNextDay} 
              className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              aria-label="Next day"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        <div className="flex items-baseline space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total</span>
          <span className="text-xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {formatDuration(totalDuration)}
          </span>
        </div>
      </div>

      <div className="space-y-3 max-w-4xl mx-auto w-full pb-10">
        {dailyEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <p className="text-lg font-medium">No activity recorded</p>
            <p className="text-sm opacity-70">Start a timer to see entries here</p>
          </div>
        ) : (
          dailyEntries.map(entry => {
            const project = getProjectById(entry.projectId);
            const task = getTaskById(entry.taskId);
            const isEditing = editingEntryId === entry.id;

            if (isEditing) {
              return (
                <EditEntryForm 
                  key={entry.id} 
                  entry={entry} 
                  projects={projects}
                  getTasksForProject={getTasksForProject}
                  onSave={(updates) => {
                    onUpdateEntry(entry.id, updates);
                    setEditingEntryId(null);
                  }} 
                  onCancel={() => setEditingEntryId(null)} 
                />
              );
            }

            return (
              <div 
                key={entry.id} 
                className="group relative flex items-center bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-200"
              >
                <div 
                  className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full" 
                  style={{ backgroundColor: project?.color || '#e5e7eb' }}
                />

                <div className="flex flex-col sm:flex-row sm:items-center w-full pl-4 gap-4">
                  
                  <div className="flex flex-col w-32 shrink-0">
                    <div className="flex items-center space-x-1.5 font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                      <span>{formatTime(new Date(entry.startTime))}</span>
                      <span className="text-gray-400">-</span>
                      <span>{entry.endTime ? formatTime(new Date(entry.endTime)) : 'Now'}</span>
                    </div>
                    <div className={`text-xs font-semibold mt-0.5 flex items-center ${!entry.endTime ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {formatDuration(getEntryDuration(entry))}
                      {!entry.endTime && (
                        <span className="ml-1.5 relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                      {entry.description || <span className="text-gray-400 italic">No description</span>}
                    </div>
                    <div className="flex items-center mt-1.5 gap-2 flex-wrap">
                      {project ? (
                        <div 
                          className="flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{ 
                            backgroundColor: `${project.color}20`, 
                            color: project.color 
                          }}
                        >
                          {project.name}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No Project</span>
                      )}
                      
                      {task && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                           <span className="text-gray-300 dark:text-gray-600 mx-1">/</span>
                           {task.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingEntryId(entry.id)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      title="Edit entry"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this entry?')) {
                          onDeleteEntry(entry.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete entry"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

interface EditEntryFormProps {
  entry: TimeEntry;
  projects: Project[];
  getTasksForProject: (pid: string) => Task[];
  onSave: (updates: Partial<TimeEntry>) => void;
  onCancel: () => void;
}

function EditEntryForm({ entry, projects, getTasksForProject, onSave, onCancel }: EditEntryFormProps) {
  const [description, setDescription] = useState(entry.description);
  const [projectId, setProjectId] = useState(entry.projectId || '');
  const [taskId, setTaskId] = useState(entry.taskId || '');
  
  const toTimeInput = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toTimeString().slice(0, 5);
  };

  const [startTimeStr, setStartTimeStr] = useState(toTimeInput(entry.startTime));
  const [endTimeStr, setEndTimeStr] = useState(entry.endTime ? toTimeInput(entry.endTime) : '');

  const availableTasks = useMemo(() => {
    return projectId ? getTasksForProject(projectId) : [];
  }, [projectId, getTasksForProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const originalStart = new Date(entry.startTime);
    const [startH, startM] = startTimeStr.split(':').map(Number);
    originalStart.setHours(startH, startM);

    let finalEndTime = null;
    if (endTimeStr && entry.endTime) {
       const originalEnd = new Date(entry.endTime);
       const [endH, endM] = endTimeStr.split(':').map(Number);
       originalEnd.setHours(endH, endM);
       finalEndTime = originalEnd.toISOString();
    } else if (endTimeStr && !entry.endTime) {
       const newEnd = new Date(entry.startTime);
       const [endH, endM] = endTimeStr.split(':').map(Number);
       newEnd.setHours(endH, endM);
       finalEndTime = newEnd.toISOString();
    } else if (!endTimeStr && entry.endTime) {
       finalEndTime = null; 
    }

    onSave({
      description,
      projectId: projectId || null,
      taskId: taskId || null,
      startTime: originalStart.toISOString(),
      endTime: finalEndTime
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 border-indigo-500/50 space-y-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
          <input 
            type="text" 
            value={description} 
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="What are you working on?"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Project</label>
            <select 
              value={projectId} 
              onChange={e => { setProjectId(e.target.value); setTaskId(''); }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">No Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Task</label>
            <select 
              value={taskId} 
              onChange={e => setTaskId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
              disabled={!projectId}
            >
              <option value="">No Task</option>
              {availableTasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
           <div>
             <label className="block text-xs font-semibold text-gray-500 mb-1">Start</label>
             <input 
              type="time" 
              value={startTimeStr}
              onChange={e => setStartTimeStr(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
           </div>
           
           {entry.endTime && (
             <div>
               <label className="block text-xs font-semibold text-gray-500 mb-1">End</label>
               <input 
                type="time" 
                value={endTimeStr}
                onChange={e => setEndTimeStr(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
             </div>
           )}

           <div className="flex-1"></div>
           
           <button 
             type="button" 
             onClick={onCancel} 
             className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
           <button 
             type="submit" 
             className="px-6 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm shadow-indigo-200 dark:shadow-none transition-colors"
            >
              Save Changes
            </button>
        </div>
      </div>
    </form>
  );
}

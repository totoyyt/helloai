import { useState, useMemo } from 'react';
import type { TimeEntry, Project, Task } from '../types';

interface SummaryProps {
  entries: TimeEntry[];
  projects: Project[];
  tasks: Task[];
  getProjectById: (id: string | null) => Project | null;
  getTaskById: (id: string | null) => Task | null;
}

type ViewType = 'daily' | 'weekly' | 'monthly';

function getStartOfDay(date: Date): Date {
  const d = new Date(date); d.setHours(0, 0, 0, 0); return d;
}
function getEndOfDay(date: Date): Date {
  const d = new Date(date); d.setHours(23, 59, 59, 999); return d;
}
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1;
  d.setDate(d.getDate() - day + mondayOffset);
  d.setHours(0, 0, 0, 0);
  return d;
}
function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}
function getStartOfMonth(date: Date): Date {
  const d = new Date(date); d.setDate(1); d.setHours(0, 0, 0, 0); return d;
}
function getEndOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}
function getEntryDuration(entry: TimeEntry): number {
  const start = new Date(entry.startTime).getTime();
  const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now();
  return end - start;
}
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
function formatDateRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}`;
}

export const Summary = ({
  entries,
  getProjectById,
  getTaskById,
}: SummaryProps) => {
  const [viewType, setViewType] = useState<ViewType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const periodDates = useMemo(() => {
    let start: Date, end: Date;
    switch (viewType) {
      case 'weekly':
        start = getStartOfWeek(selectedDate);
        end = getEndOfWeek(selectedDate);
        break;
      case 'monthly':
        start = getStartOfMonth(selectedDate);
        end = getEndOfMonth(selectedDate);
        break;
      case 'daily':
      default:
        start = getStartOfDay(selectedDate);
        end = getEndOfDay(selectedDate);
        break;
    }
    return { start, end };
  }, [viewType, selectedDate]);

  const filteredEntries = useMemo(() => {
    const { start, end } = periodDates;
    return entries.filter(entry => {
      const entryStart = new Date(entry.startTime);
      return entryStart >= start && entryStart <= end;
    });
  }, [entries, periodDates]);

  const stats = useMemo(() => {
    const totalDuration = filteredEntries.reduce((acc, entry) => acc + getEntryDuration(entry), 0);
    
    const byProject: Record<string, { duration: number; tasks: Record<string, number> }> = {};

    filteredEntries.forEach(entry => {
      const duration = getEntryDuration(entry);
      const projectId = entry.projectId || 'unassigned';
      const taskId = entry.taskId || 'unassigned';

      if (!byProject[projectId]) {
        byProject[projectId] = { duration: 0, tasks: {} };
      }
      
      byProject[projectId].duration += duration;
      
      if (!byProject[projectId].tasks[taskId]) {
        byProject[projectId].tasks[taskId] = 0;
      }
      byProject[projectId].tasks[taskId] += duration;
    });

    const projectList = Object.entries(byProject)
      .map(([id, data]) => ({
        id,
        duration: data.duration,
        tasks: Object.entries(data.tasks).map(([tid, tDuration]) => ({
          id: tid,
          duration: tDuration
        })).sort((a, b) => b.duration - a.duration)
      }))
      .sort((a, b) => b.duration - a.duration);

    return { totalDuration, projectList };
  }, [filteredEntries]);

  const handlePrev = () => {
    const newDate = new Date(selectedDate);
    if (viewType === 'daily') newDate.setDate(newDate.getDate() - 1);
    else if (viewType === 'weekly') newDate.setDate(newDate.getDate() - 7);
    else if (viewType === 'monthly') newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (viewType === 'daily') newDate.setDate(newDate.getDate() + 1);
    else if (viewType === 'weekly') newDate.setDate(newDate.getDate() + 7);
    else if (viewType === 'monthly') newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
          {(['daily', 'weekly', 'monthly'] as ViewType[]).map((type) => (
            <button
              key={type}
              onClick={() => setViewType(type)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                viewType === type
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handlePrev} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 min-w-[140px] text-center">
            {viewType === 'daily' && selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
            {viewType === 'weekly' && formatDateRange(periodDates.start, periodDates.end)}
            {viewType === 'monthly' && selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={handleNext} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <div className="text-center py-6">
        <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Total Time</h2>
        <div className="text-4xl font-bold text-gray-900 dark:text-white">
          {formatDuration(stats.totalDuration)}
        </div>
      </div>

      <div className="space-y-4">
        {stats.projectList.length === 0 ? (
          <div className="text-center text-gray-400 py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            No activity recorded for this period
          </div>
        ) : (
          stats.projectList.map((projData) => {
            const project = projData.id === 'unassigned' ? null : getProjectById(projData.id);
            const projectName = project ? project.name : 'No Project';
            const projectColor = project ? project.color : '#94a3b8';
            const percentage = stats.totalDuration > 0 ? (projData.duration / stats.totalDuration) * 100 : 0;

            return (
              <div key={projData.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: projectColor }}></div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{projectName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-gray-900 dark:text-white">{formatDuration(projData.duration)}</span>
                    <span className="text-xs text-gray-500 font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%`, backgroundColor: projectColor }}
                  />
                </div>

                <div className="space-y-2 pl-5 border-l-2 border-gray-100 dark:border-gray-700">
                  {projData.tasks.map((taskData) => {
                    const task = taskData.id === 'unassigned' ? null : getTaskById(taskData.id);
                    const taskName = task ? task.name : (taskData.id === 'unassigned' && projData.id === 'unassigned' ? 'Uncategorized' : 'No Task');
                    const taskPercentage = (taskData.duration / projData.duration) * 100;

                    return (
                      <div key={taskData.id} className="flex justify-between items-center text-sm group">
                        <span className="text-gray-600 dark:text-gray-300 truncate pr-4">{taskName}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className="h-full rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400 transition-colors"
                              style={{ width: `${taskPercentage}%` }}
                            />
                          </div>
                          <span className="font-mono text-gray-500 dark:text-gray-400 w-16 text-right">
                            {formatDuration(taskData.duration)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

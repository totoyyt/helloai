import { useState, useMemo } from 'react';
import { useTimeTracker } from './hooks/useTimeTracker';
import { Timer } from './components/Timer';
import { ProjectManager } from './components/ProjectManager';
import DailyLog from './components/DailyLog';
import { Summary } from './components/Summary';
import type { ViewType } from './types';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('timer');
  const tracker = useTimeTracker();

  const runningEntry = tracker.getRunningEntry();
  
  const recentEntries = useMemo(() => {
    return tracker.timeEntries
      .filter(e => e.endTime !== null)
      .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime())
      .slice(0, 5);
  }, [tracker.timeEntries]);

  const navItems: { view: ViewType; label: string }[] = [
    { view: 'timer', label: 'Timer' },
    { view: 'daily', label: 'Daily Log' },
    { view: 'weekly', label: 'Summary' },
    { view: 'projects', label: 'Projects' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold tracking-tight">TimeTracker</h1>
            {runningEntry && (
              <div className="flex items-center gap-2 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-32">
                  {runningEntry.description || 'Tracking...'}
                </span>
              </div>
            )}
          </div>
          <nav className="flex gap-1 -mb-px">
            {navItems.map(({ view, label }) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  currentView === view
                    ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {currentView === 'timer' && (
          <Timer
            projects={tracker.projects}
            runningEntry={runningEntry}
            recentEntries={recentEntries}
            onStart={tracker.startTimer}
            onStop={tracker.stopTimer}
            getTasksForProject={tracker.getTasksForProject}
            getProjectById={tracker.getProjectById}
            getTaskById={tracker.getTaskById}
          />
        )}

        {currentView === 'daily' && (
          <DailyLog
            entries={tracker.timeEntries}
            projects={tracker.projects}
            onUpdateEntry={tracker.updateTimeEntry}
            onDeleteEntry={tracker.deleteTimeEntry}
            getProjectById={tracker.getProjectById}
            getTaskById={tracker.getTaskById}
            getTasksForProject={tracker.getTasksForProject}
          />
        )}

        {(currentView === 'weekly' || currentView === 'monthly') && (
          <Summary
            entries={tracker.timeEntries}
            projects={tracker.projects}
            tasks={tracker.tasks}
            getProjectById={tracker.getProjectById}
            getTaskById={tracker.getTaskById}
          />
        )}

        {currentView === 'projects' && (
          <ProjectManager
            projects={tracker.projects}
            tasks={tracker.tasks}
            onAddProject={tracker.addProject}
            onUpdateProject={tracker.updateProject}
            onDeleteProject={tracker.deleteProject}
            onAddTask={tracker.addTask}
            onUpdateTask={tracker.updateTask}
            onDeleteTask={tracker.deleteTask}
            getTasksForProject={tracker.getTasksForProject}
          />
        )}
      </main>
    </div>
  );
}

export default App;

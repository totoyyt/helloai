import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Square, Plus } from 'lucide-react';

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function Timer() {
  const { projects, tasks, activeEntry, startTimer, stopTimer, refreshData } = useApp();
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (activeEntry) {
      setIsRunning(true);
      const startTime = new Date(activeEntry.startTime).getTime();
      
      const updateElapsed = () => {
        const now = Date.now();
        setElapsed(Math.floor((now - startTime) / 1000));
      };
      
      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    } else {
      setIsRunning(false);
      setElapsed(0);
    }
  }, [activeEntry]);

  useEffect(() => {
    if (activeEntry) {
      setSelectedProject(activeEntry.projectId);
      setSelectedTask(activeEntry.taskId || '');
    }
  }, [activeEntry]);

  const handleStart = async () => {
    if (!selectedProject) {
      alert('Please select a project');
      return;
    }
    await startTimer(selectedProject, selectedTask || null);
  };

  const handleStop = async () => {
    await stopTimer();
    refreshData();
  };

  const projectTasks = tasks.filter(t => t.projectId === selectedProject);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-center mb-8">
        <div className="text-6xl font-mono font-bold text-gray-900 mb-4">
          {formatDuration(elapsed)}
        </div>
        {activeEntry && (
          <p className="text-sm text-gray-500">
            Timer running...
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              setSelectedTask('');
            }}
            disabled={isRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          >
            <option value="">Select a project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task (optional)
          </label>
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            disabled={isRunning || !selectedProject}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          >
            <option value="">No task selected</option>
            {projectTasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={!selectedProject}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Play size={20} />
              Start Timer
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square size={20} />
              Stop Timer
            </button>
          )}
        </div>
      </div>

      {projects.length === 0 && (
        <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
          <p className="text-sm">
            No projects yet. Go to Settings to create your first project.
          </p>
        </div>
      )}
    </div>
  );
}

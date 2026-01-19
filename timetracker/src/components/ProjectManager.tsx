import { useState } from 'react';
import type { Project, Task } from '../types';

interface ProjectManagerProps {
  projects: Project[];
  tasks: Task[];
  onAddProject: (name: string, color: string) => void;
  onUpdateProject: (id: string, updates: { name?: string; color?: string }) => void;
  onDeleteProject: (id: string) => void;
  onAddTask: (name: string, projectId: string) => void;
  onUpdateTask: (id: string, updates: { name?: string }) => void;
  onDeleteTask: (id: string) => void;
  getTasksForProject: (projectId: string) => Task[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];

export const ProjectManager = ({
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  getTasksForProject,
}: ProjectManagerProps) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(COLORS[0]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectColor, setEditProjectColor] = useState('');
  const [newTaskNames, setNewTaskNames] = useState<Record<string, string>>({});
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTaskName, setEditTaskName] = useState('');

  const toggleExpand = (projectId: string) => {
    const next = new Set(expandedProjects);
    if (next.has(projectId)) {
      next.delete(projectId);
    } else {
      next.add(projectId);
    }
    setExpandedProjects(next);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onAddProject(newProjectName, newProjectColor);
    setNewProjectName('');
    setNewProjectColor(COLORS[0]);
    setIsAddingProject(false);
  };

  const startEditProject = (project: Project) => {
    setEditingProject(project.id);
    setEditProjectName(project.name);
    setEditProjectColor(project.color);
  };

  const saveEditProject = (id: string) => {
    if (!editProjectName.trim()) return;
    onUpdateProject(id, { name: editProjectName, color: editProjectColor });
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will remain but become unassigned.')) {
      onDeleteProject(id);
    }
  };

  const handleCreateTask = (e: React.FormEvent, projectId: string) => {
    e.preventDefault();
    const name = newTaskNames[projectId];
    if (!name?.trim()) return;
    onAddTask(name, projectId);
    setNewTaskNames({ ...newTaskNames, [projectId]: '' });
  };

  const startEditTask = (task: Task) => {
    setEditingTask(task.id);
    setEditTaskName(task.name);
  };

  const saveEditTask = (id: string) => {
    if (!editTaskName.trim()) return;
    onUpdateTask(id, { name: editTaskName });
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Delete this task?')) {
      onDeleteTask(id);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 font-sans">
      <header className="flex justify-between items-center mb-8 border-b-2 border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold tracking-tight uppercase text-slate-900 dark:text-white">
          Projects <span className="text-slate-400 dark:text-slate-600 ml-2 text-lg font-normal">/ Manager</span>
        </h2>
        <button
          onClick={() => setIsAddingProject(!isAddingProject)}
          className={`px-4 py-2 text-sm font-semibold tracking-wide uppercase transition-all duration-200 
            ${isAddingProject 
              ? 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700' 
              : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200'
            }`}
        >
          {isAddingProject ? 'Cancel' : '+ New Project'}
        </button>
      </header>

      {isAddingProject && (
        <form onSubmit={handleCreateProject} className="mb-8 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Project Name</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g. Q4 Marketing Campaign"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Color Code</label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewProjectColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ${newProjectColor === c ? 'ring-slate-900 dark:ring-white scale-110' : 'ring-transparent'}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={!newProjectName.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold uppercase tracking-widest text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600">
            <p className="uppercase tracking-widest text-sm font-medium">No projects found</p>
          </div>
        ) : (
          projects.map((project) => {
            const isExpanded = expandedProjects.has(project.id);
            const isEditing = editingProject === project.id;
            const projectTasks = getTasksForProject(project.id);

            if (isEditing) {
              return (
                <div key={project.id} className="p-4 bg-white dark:bg-slate-800 border-l-4 border-indigo-500 shadow-lg">
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      value={editProjectName}
                      onChange={(e) => setEditProjectName(e.target.value)}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:border-indigo-500 outline-none w-full font-medium"
                    />
                    <div className="flex gap-2">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setEditProjectColor(c)}
                          className={`w-6 h-6 rounded-full ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-800 ${editProjectColor === c ? 'ring-slate-900 dark:ring-white' : 'ring-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                      <button onClick={() => setEditingProject(null)} className="px-3 py-1 text-xs uppercase font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
                      <button onClick={() => saveEditProject(project.id)} className="px-3 py-1 text-xs uppercase font-bold bg-indigo-600 text-white hover:bg-indigo-700">Save Changes</button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={project.id} className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md">
                <div className="flex items-center p-4 gap-4">
                  <button 
                    onClick={() => toggleExpand(project.id)}
                    className="flex items-center justify-center w-6 h-6 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                  </button>
                  
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                  
                  <h3 className="flex-grow font-semibold text-lg text-slate-800 dark:text-slate-100 truncate cursor-pointer select-none" onClick={() => toggleExpand(project.id)}>
                    {project.name}
                    <span className="ml-3 text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      {projectTasks.length}
                    </span>
                  </h3>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                    <button 
                      onClick={() => startEditProject(project)}
                      className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors"
                      aria-label="Edit project"
                    >
                      ✎
                    </button>
                    <button 
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      aria-label="Delete project"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="p-4 pl-14">
                      <div className="space-y-1 mb-4">
                        {projectTasks.length === 0 ? (
                          <p className="text-sm text-slate-400 italic py-2">No tasks yet.</p>
                        ) : (
                          projectTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3 py-2 px-3 hover:bg-white dark:hover:bg-slate-800 rounded group/task border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                              {editingTask === task.id ? (
                                <div className="flex-grow flex gap-2">
                                  <input
                                    autoFocus
                                    className="flex-grow bg-white dark:bg-slate-900 border border-indigo-500 px-2 py-1 text-sm outline-none"
                                    value={editTaskName}
                                    onChange={(e) => setEditTaskName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && saveEditTask(task.id)}
                                  />
                                  <button onClick={() => saveEditTask(task.id)} className="text-xs font-bold text-indigo-600 uppercase">Save</button>
                                </div>
                              ) : (
                                <>
                                  <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                  <span className="flex-grow text-sm text-slate-700 dark:text-slate-300">{task.name}</span>
                                  <div className="flex gap-1 opacity-0 group-hover/task:opacity-100 transition-opacity">
                                    <button onClick={() => startEditTask(task)} className="text-xs text-slate-400 hover:text-indigo-500 px-2">Edit</button>
                                    <button onClick={() => handleDeleteTask(task.id)} className="text-xs text-slate-400 hover:text-red-500 px-2">Delete</button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <form onSubmit={(e) => handleCreateTask(e, project.id)} className="flex gap-2 items-center mt-2">
                        <input
                          type="text"
                          value={newTaskNames[project.id] || ''}
                          onChange={(e) => setNewTaskNames({ ...newTaskNames, [project.id]: e.target.value })}
                          placeholder="Add a new task..."
                          className="flex-grow bg-transparent border-b border-slate-300 dark:border-slate-600 py-2 px-1 text-sm focus:border-indigo-500 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                        <button
                          type="submit"
                          disabled={!newTaskNames[project.id]?.trim()}
                          className="px-3 py-2 text-xs font-bold uppercase bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all disabled:opacity-50"
                        >
                          Add
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

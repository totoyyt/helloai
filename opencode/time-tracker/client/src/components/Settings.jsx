import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Edit2, Download, Upload, Save, X } from 'lucide-react';
import * as api from '../services/api';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
];

export default function Settings() {
  const { projects, tasks, createProject, updateProject, deleteProject, createTask, updateTask, deleteTask } = useApp();
  const [activeSection, setActiveSection] = useState('projects');
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const [newProject, setNewProject] = useState({ name: '', color: PROJECT_COLORS[0] });
  const [newTask, setNewTask] = useState({ projectId: '', name: '' });

  const handleAddProject = async () => {
    if (!newProject.name.trim()) return;
    await createProject(newProject.name.trim(), newProject.color);
    setNewProject({ name: '', color: PROJECT_COLORS[0] });
    setShowAddProject(false);
  };

  const handleAddTask = async () => {
    if (!newTask.projectId || !newTask.name.trim()) return;
    await createTask(newTask.projectId, newTask.name.trim());
    setNewTask({ projectId: '', name: '' });
    setShowAddTask(false);
  };

  const handleExport = (format) => {
    api.exportData(format);
  };

  const sections = [
    { id: 'projects', label: 'Projects' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'export', label: 'Export' },
  ];

  const projectTasks = (projectId) => tasks.filter(t => t.projectId === projectId);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex border-b">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeSection === section.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeSection === 'projects' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Your Projects</h3>
              <button
                onClick={() => setShowAddProject(true)}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <Plus size={16} />
                Add Project
              </button>
            </div>

            {showAddProject && (
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Project name"
                    className="flex-1 px-3 py-2 border rounded-lg"
                    autoFocus
                  />
                  <input
                    type="color"
                    value={newProject.color}
                    onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
                    className="w-10 h-10 border rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddProject}
                    disabled={!newProject.name.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowAddProject(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: project.color }}
                    />
                    {editingProject === project.id ? (
                      <input
                        type="text"
                        defaultValue={project.name}
                        onBlur={(e) => {
                          updateProject(project.id, { name: e.target.value });
                          setEditingProject(null);
                        }}
                        className="px-2 py-1 border rounded"
                        autoFocus
                      />
                    ) : (
                      <span>{project.name}</span>
                    )}
                    <span className="text-sm text-gray-500">
                      {projectTasks(project.id).length} tasks
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingProject(project.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {projects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No projects yet. Create your first project to get started.
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'tasks' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Your Tasks</h3>
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <Plus size={16} />
                Add Task
              </button>
            </div>

            {showAddTask && (
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="space-y-3 mb-3">
                  <select
                    value={newTask.projectId}
                    onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                    placeholder="Task name"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTask}
                    disabled={!newTask.projectId || !newTask.name.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowAddTask(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {projects.map(project => {
                const projectTasksList = projectTasks(project.id);
                if (projectTasksList.length === 0) return null;
                
                return (
                  <div key={project.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <div className="space-y-1 ml-5">
                      {projectTasksList.map(task => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          {editingTask === task.id ? (
                            <input
                              type="text"
                              defaultValue={task.name}
                              onBlur={(e) => {
                                updateTask(task.id, { name: e.target.value });
                                setEditingTask(null);
                              }}
                              className="px-2 py-1 border rounded flex-1"
                              autoFocus
                            />
                          ) : (
                            <span className="text-sm">{task.name}</span>
                          )}
                          <div className="flex items-center gap-2 ml-2">
                            <button
                              onClick={() => setEditingTask(task.id)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {projects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Create a project first, then add tasks to it.
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'export' && (
          <div>
            <h3 className="font-semibold mb-4">Export Your Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download your time tracking data for backup or analysis.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('json')}
                className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Download size={20} className="text-gray-400" />
                  <div>
                    <div className="font-medium">Export as JSON</div>
                    <div className="text-sm text-gray-500">Complete data backup</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Download size={20} className="text-gray-400" />
                  <div>
                    <div className="font-medium">Export as CSV</div>
                    <div className="text-sm text-gray-500">Open in spreadsheet apps</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

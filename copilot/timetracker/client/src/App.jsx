import { useState, useEffect } from 'react';
import { fetchData, saveData } from './api';
import './App.css';

function App() {
  const [data, setData] = useState({ projects: [], tasks: [], timeEntries: [] });
  const [loading, setLoading] = useState(true);
  const [newTaskName, setNewTaskName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Initial Load
  useEffect(() => {
    loadData();
    // Set up an interval to refresh the "Active" timer UI every minute
    const interval = setInterval(() => {
        // Just trigger a re-render to update relative time if needed
        setData(d => ({ ...d })); 
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const serverData = await fetchData();
      setData(serverData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncData = async (newData) => {
    setData(newData);
    await saveData(newData);
  };

  // --- Actions ---

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const newProject = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
    };
    syncData({
      ...data,
      projects: [...data.projects, newProject]
    });
    setNewProjectName('');
  };

  const addTask = () => {
    if (!newTaskName.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      name: newTaskName.trim(),
      projectId: selectedProjectId || null
    };
    syncData({
      ...data,
      tasks: [...data.tasks, newTask]
    });
    setNewTaskName('');
  };

  const deleteProject = (id) => {
      // Also disassociate tasks
      const updatedTasks = data.tasks.map(t => t.projectId === id ? { ...t, projectId: null } : t);
      // Remove project
      const updatedProjects = data.projects.filter(p => p.id !== id);
      syncData({ ...data, projects: updatedProjects, tasks: updatedTasks });
  };

  const deleteTask = (id) => {
      // Remove task and its entries? Or keep entries? Prompt says "delete projects and tasks".
      // We should probably keep entries for historical data but the prompt says "today".
      // Let's just remove the task definition.
      const updatedTasks = data.tasks.filter(t => t.id !== id);
      syncData({ ...data, tasks: updatedTasks });
  };

  // --- Timer Logic ---

  const getActiveEntry = () => {
    return data.timeEntries.find(e => e.endTime === null);
  };

  const startTask = (taskId) => {
    const now = Date.now();
    let entries = [...data.timeEntries];
    
    // Stop current active task
    const activeIndex = entries.findIndex(e => e.endTime === null);
    if (activeIndex !== -1) {
        entries[activeIndex] = { ...entries[activeIndex], endTime: now };
    }

    // Start new
    entries.push({
        id: Date.now().toString(),
        taskId,
        startTime: now,
        endTime: null
    });

    syncData({ ...data, timeEntries: entries });
  };

  const stopTimer = () => {
    const now = Date.now();
    let entries = [...data.timeEntries];
    const activeIndex = entries.findIndex(e => e.endTime === null);
    if (activeIndex !== -1) {
        entries[activeIndex] = { ...entries[activeIndex], endTime: now };
        syncData({ ...data, timeEntries: entries });
    }
  };

  // --- Calculations ---

  const getDuration = (entry) => {
      const end = entry.endTime || Date.now();
      return end - entry.startTime;
  };

  const formatTime = (ms) => {
      const totalMinutes = Math.floor(ms / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h ${minutes}m`;
  };

  // Filter entries for TODAY only
  const getTodayEntries = () => {
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      return data.timeEntries.filter(e => e.startTime >= startOfDay.getTime());
  };

  // Totals
  const calculateTotals = () => {
      const todayEntries = getTodayEntries();
      
      const taskTotals = {}; // { taskId: ms }
      const projectTotals = {}; // { projectId: ms } (only for tasks with projects)
      const taskInProjectTotals = {}; // { projectId: { taskId: ms } }

      todayEntries.forEach(entry => {
          const dur = getDuration(entry);
          const task = data.tasks.find(t => t.id === entry.taskId);
          if (!task) return;

          // Task Total
          taskTotals[task.id] = (taskTotals[task.id] || 0) + dur;

          // Project Total
          if (task.projectId) {
              projectTotals[task.projectId] = (projectTotals[task.projectId] || 0) + dur;
              
              if (!taskInProjectTotals[task.projectId]) {
                  taskInProjectTotals[task.projectId] = {};
              }
              taskInProjectTotals[task.projectId][task.id] = (taskInProjectTotals[task.projectId][task.id] || 0) + dur;
          }
      });

      return { taskTotals, projectTotals, taskInProjectTotals };
  };

  const activeEntry = getActiveEntry();
  const activeTask = activeEntry ? data.tasks.find(t => t.id === activeEntry.taskId) : null;
  const { taskTotals, projectTotals, taskInProjectTotals } = calculateTotals();

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="header">
        <h1>Time Tracker</h1>
        <div style={{color: '#888'}}>{new Date().toLocaleDateString()}</div>
      </div>

      {/* Active Timer Bar */}
      <div className="active-task-bar">
          <div>
            <h3>Current Task</h3>
            {activeTask ? (
                <div style={{fontSize: '1.2em', color: '#646cff'}}>
                    {activeTask.name} 
                    <span style={{fontSize:'0.8em', marginLeft:'10px', color: '#aaa'}}>
                        (Running for {formatTime(getDuration(activeEntry))})
                    </span>
                </div>
            ) : (
                <div style={{color:'#888'}}>No active task</div>
            )}
          </div>
          <div>
             {activeEntry ? (
                 <>
                    <button onClick={stopTimer} style={{marginRight: '10px'}}>Stop / Pause</button>
                    {/* Resume is effectively just clicking the task again in the list, but we could add a button here if needed. 
                        Prompt says: "Pause/resume/end". "Pause" stops it. "Resume" starts it again. */}
                 </>
             ) : (
                 <div style={{fontStyle:'italic', color:'#666'}}>Select a task below to start</div>
             )}
          </div>
      </div>

      {/* Left Column: Manage & Select */}
      <div className="left-col">
        
        {/* Project Management */}
        <div className="card">
            <h3>Projects</h3>
            <div style={{display:'flex', marginBottom:'10px'}}>
                <input 
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    placeholder="New Project Name"
                />
                <button onClick={addProject}>Add</button>
            </div>
            {data.projects.map(p => (
                <div key={p.id} style={{display:'flex', justifyContent:'space-between', padding:'4px 0'}}>
                    <span>{p.name}</span>
                    <button className="danger-btn" onClick={() => deleteProject(p.id)} style={{padding:'2px 6px', fontSize:'0.8em'}}>x</button>
                </div>
            ))}
        </div>

        {/* Task Management & Selection */}
        <div className="card">
            <h3>Tasks</h3>
            <div style={{display:'flex', marginBottom:'10px'}}>
                <input 
                    value={newTaskName}
                    onChange={e => setNewTaskName(e.target.value)}
                    placeholder="New Task Name"
                />
                <select 
                    value={selectedProjectId} 
                    onChange={e => setSelectedProjectId(e.target.value)}
                    style={{maxWidth:'120px'}}
                >
                    <option value="">No Project</option>
                    {data.projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <button onClick={addTask}>Add</button>
            </div>

            <ul className="task-list">
                {data.tasks.map(task => {
                    const isActive = activeTask && activeTask.id === task.id;
                    const project = data.projects.find(p => p.id === task.projectId);
                    return (
                        <li 
                            key={task.id} 
                            className={`task-item ${isActive ? 'active' : ''}`}
                            onClick={() => startTask(task.id)}
                            title="Click to start timer"
                        >
                            <div>
                                <div style={{fontWeight:'bold'}}>{task.name}</div>
                                {project && <div style={{fontSize:'0.8rem', color:'#888'}}>{project.name}</div>}
                            </div>
                            <div style={{display:'flex', alignItems:'center'}}>
                                {isActive && <span style={{marginRight:'10px', color:'#646cff'}}>Running...</span>}
                                { /* Stop propagation for delete button */ }
                                <button 
                                    className="danger-btn"
                                    onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                    style={{padding:'2px 6px', fontSize:'0.8em'}}
                                >x</button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>

      </div>

      {/* Right Column: Totals */}
      <div className="right-col">
          
        <div className="card">
            <h3>Totals by Project</h3>
            <div className="stats-grid">
                {data.projects.map(p => {
                    const total = projectTotals[p.id] || 0;
                    return (
                        <div key={p.id} className="stat-row">
                            <strong>{p.name}</strong>
                            <span>{formatTime(total)}</span>
                        </div>
                    );
                })}
                {/* Tasks without project? */}
            </div>
        </div>

        <div className="card">
            <h3>Totals by Task</h3>
            <div className="stats-grid">
                {data.tasks.map(t => {
                    const total = taskTotals[t.id] || 0;
                    if (total === 0) return null; // Hide tasks with no time? Or show 0h 0m? Prompt wants totals.
                    return (
                        <div key={t.id} className="stat-row">
                            <span>{t.name}</span>
                            <span>{formatTime(total)}</span>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="card">
            <h3>Project Breakdown</h3>
            {data.projects.map(p => {
                 const pTasks = taskInProjectTotals[p.id];
                 if (!pTasks) return null;
                 return (
                     <div key={p.id} style={{marginBottom:'15px'}}>
                         <div style={{color:'#aaa', borderBottom:'1px solid #444', marginBottom:'5px'}}>{p.name}</div>
                         {Object.entries(pTasks).map(([taskId, dur]) => {
                             const t = data.tasks.find(x => x.id === taskId);
                             return (
                                 <div key={taskId} style={{display:'flex', justifyContent:'space-between', paddingLeft:'10px', fontSize:'0.9em'}}>
                                     <span>{t?.name}</span>
                                     <span>{formatTime(dur)}</span>
                                 </div>
                             );
                         })}
                     </div>
                 );
            })}
        </div>

      </div>
    </div>
  );
}

export default App;

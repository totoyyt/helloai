import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/store.json');

const router = express.Router();

async function readStore() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { projects: [], tasks: [], timeEntries: [], settings: { activeEntryId: null } };
  }
}

async function writeStore(store) {
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2));
}

router.get('/projects', async (req, res) => {
  const store = await readStore();
  res.json(store.projects);
});

router.post('/projects', async (req, res) => {
  const store = await readStore();
  const project = {
    id: uuidv4(),
    name: req.body.name,
    color: req.body.color || '#6366f1',
    createdAt: new Date().toISOString()
  };
  store.projects.push(project);
  await writeStore(store);
  res.json(project);
});

router.put('/projects/:id', async (req, res) => {
  const store = await readStore();
  const index = store.projects.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    store.projects[index] = { ...store.projects[index], ...req.body };
    await writeStore(store);
    res.json(store.projects[index]);
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

router.delete('/projects/:id', async (req, res) => {
  const store = await readStore();
  store.projects = store.projects.filter(p => p.id !== req.params.id);
  store.tasks = store.tasks.filter(t => t.projectId !== req.params.id);
  store.timeEntries = store.timeEntries.filter(e => e.projectId !== req.params.id);
  await writeStore(store);
  res.json({ success: true });
});

router.get('/tasks', async (req, res) => {
  const store = await readStore();
  res.json(store.tasks);
});

router.post('/tasks', async (req, res) => {
  const store = await readStore();
  const task = {
    id: uuidv4(),
    projectId: req.body.projectId,
    name: req.body.name,
    createdAt: new Date().toISOString()
  };
  store.tasks.push(task);
  await writeStore(store);
  res.json(task);
});

router.put('/tasks/:id', async (req, res) => {
  const store = await readStore();
  const index = store.tasks.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    store.tasks[index] = { ...store.tasks[index], ...req.body };
    await writeStore(store);
    res.json(store.tasks[index]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  const store = await readStore();
  store.tasks = store.tasks.filter(t => t.id !== req.params.id);
  store.timeEntries = store.timeEntries.filter(e => e.taskId !== req.params.id);
  await writeStore(store);
  res.json({ success: true });
});

router.get('/entries', async (req, res) => {
  const store = await readStore();
  let entries = store.timeEntries;
  
  if (req.query.date) {
    const targetDate = new Date(req.query.date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    entries = entries.filter(e => {
      const entryDate = new Date(e.startTime);
      return entryDate >= targetDate && entryDate < nextDate;
    });
  }
  
  if (req.query.startDate && req.query.endDate) {
    const start = new Date(req.query.startDate);
    const end = new Date(req.query.endDate);
    end.setDate(end.getDate() + 1);
    
    entries = entries.filter(e => {
      const entryDate = new Date(e.startTime);
      return entryDate >= start && entryDate < end;
    });
  }
  
  res.json(entries);
});

router.post('/entries', async (req, res) => {
  const store = await readStore();
  const entry = {
    id: uuidv4(),
    projectId: req.body.projectId,
    taskId: req.body.taskId || null,
    startTime: req.body.startTime,
    endTime: req.body.endTime || null,
    notes: req.body.notes || '',
    createdAt: new Date().toISOString()
  };
  
  if (entry.endTime) {
    entry.duration = Math.round((new Date(entry.endTime) - new Date(entry.startTime)) / 1000);
  }
  
  store.timeEntries.push(entry);
  await writeStore(store);
  res.json(entry);
});

router.put('/entries/:id', async (req, res) => {
  const store = await readStore();
  const index = store.timeEntries.findIndex(e => e.id === req.params.id);
  if (index !== -1) {
    const updated = { ...store.timeEntries[index], ...req.body };
    
    if (updated.startTime && updated.endTime) {
      updated.duration = Math.round((new Date(updated.endTime) - new Date(updated.startTime)) / 1000);
    }
    
    store.timeEntries[index] = updated;
    await writeStore(store);
    res.json(updated);
  } else {
    res.status(404).json({ error: 'Entry not found' });
  }
});

router.delete('/entries/:id', async (req, res) => {
  const store = await readStore();
  store.timeEntries = store.timeEntries.filter(e => e.id !== req.params.id);
  await writeStore(store);
  res.json({ success: true });
});

router.post('/timer/start', async (req, res) => {
  const store = await readStore();
  
  if (store.settings.activeEntryId) {
    const activeEntry = store.timeEntries.find(e => e.id === store.settings.activeEntryId);
    if (activeEntry && !activeEntry.endTime) {
      activeEntry.endTime = new Date().toISOString();
      activeEntry.duration = Math.round((new Date(activeEntry.endTime) - new Date(activeEntry.startTime)) / 1000);
    }
  }
  
  const entry = {
    id: uuidv4(),
    projectId: req.body.projectId,
    taskId: req.body.taskId || null,
    startTime: new Date().toISOString(),
    endTime: null,
    notes: req.body.notes || '',
    createdAt: new Date().toISOString()
  };
  
  store.timeEntries.push(entry);
  store.settings.activeEntryId = entry.id;
  await writeStore(store);
  res.json(entry);
});

router.post('/timer/stop', async (req, res) => {
  const store = await readStore();
  const activeId = store.settings.activeEntryId;
  
  if (activeId) {
    const index = store.timeEntries.findIndex(e => e.id === activeId);
    if (index !== -1) {
      const now = new Date().toISOString();
      store.timeEntries[index].endTime = now;
      store.timeEntries[index].duration = Math.round((new Date(now) - new Date(store.timeEntries[index].startTime)) / 1000);
      store.settings.activeEntryId = null;
      await writeStore(store);
      res.json(store.timeEntries[index]);
    } else {
      store.settings.activeEntryId = null;
      await writeStore(store);
      res.json({ error: 'Entry not found' });
    }
  } else {
    res.json({ error: 'No active timer' });
  }
});

router.get('/timer/active', async (req, res) => {
  const store = await readStore();
  const activeId = store.settings.activeEntryId;
  
  if (activeId) {
    const entry = store.timeEntries.find(e => e.id === activeId);
    if (entry && !entry.endTime) {
      res.json(entry);
    } else {
      res.json(null);
    }
  } else {
    res.json(null);
  }
});

router.get('/export/:format', async (req, res) => {
  const store = await readStore();
  const format = req.params.format;
  
  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="time-tracker-export.json"');
    res.json(store);
  } else if (format === 'csv') {
    let csv = 'Project,Task,Start Time,End Time,Duration (seconds),Duration (hours),Notes\n';
    
    for (const entry of store.timeEntries) {
      const project = store.projects.find(p => p.id === entry.projectId);
      const task = store.tasks.find(t => t.id === entry.taskId);
      const projectName = project ? `"${project.name.replace(/"/g, '""')}"` : '';
      const taskName = task ? `"${task.name.replace(/"/g, '""')}"` : '';
      const notes = entry.notes ? `"${entry.notes.replace(/"/g, '""')}"` : '';
      const durationHours = entry.duration ? (entry.duration / 3600).toFixed(2) : '';
      
      csv += `${projectName},${taskName},${entry.startTime},${entry.endTime || ''},${entry.duration || ''},${durationHours},${notes}\n`;
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="time-tracker-export.csv"');
    res.send(csv);
  } else {
    res.status(400).json({ error: 'Invalid format' });
  }
});

router.get('/stats/daily', async (req, res) => {
  const store = await readStore();
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  
  const entries = store.timeEntries.filter(e => {
    const entryDate = new Date(e.startTime);
    return entryDate >= date && entryDate < nextDate && e.endTime;
  });
  
  const stats = {};
  for (const entry of entries) {
    const projectId = entry.projectId;
    if (!stats[projectId]) {
      stats[projectId] = { duration: 0, entries: 0 };
    }
    stats[projectId].duration += entry.duration || 0;
    stats[projectId].entries += 1;
  }
  
  const result = Object.entries(stats).map(([projectId, data]) => {
    const project = store.projects.find(p => p.id === projectId);
    return {
      projectId,
      projectName: project?.name || 'Unknown',
      projectColor: project?.color || '#6366f1',
      ...data,
      durationHours: (data.duration / 3600).toFixed(2)
    };
  });
  
  res.json(result);
});

export default router;

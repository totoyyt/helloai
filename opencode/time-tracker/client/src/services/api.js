const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

export async function getProjects() {
  return request('/projects');
}

export async function createProject(name, color) {
  return request('/projects', {
    method: 'POST',
    body: JSON.stringify({ name, color }),
  });
}

export async function updateProject(id, data) {
  return request(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id) {
  return request(`/projects/${id}`, {
    method: 'DELETE',
  });
}

export async function getTasks() {
  return request('/tasks');
}

export async function createTask(projectId, name) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify({ projectId, name }),
  });
}

export async function updateTask(id, data) {
  return request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTask(id) {
  return request(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

export async function getEntries(date) {
  const params = date ? `?date=${date}` : '';
  return request(`/entries${params}`);
}

export async function getEntriesRange(startDate, endDate) {
  return request(`/entries?startDate=${startDate}&endDate=${endDate}`);
}

export async function createEntry(data) {
  return request('/entries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEntry(id, data) {
  return request(`/entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEntry(id) {
  return request(`/entries/${id}`, {
    method: 'DELETE',
  });
}

export async function startTimer(projectId, taskId) {
  return request('/timer/start', {
    method: 'POST',
    body: JSON.stringify({ projectId, taskId }),
  });
}

export async function stopTimer() {
  return request('/timer/stop', {
    method: 'POST',
  });
}

export async function getActiveTimer() {
  return request('/timer/active');
}

export async function exportData(format) {
  const response = await fetch(`${API_BASE}/export/${format}`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `time-tracker-export.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function getDailyStats(date) {
  return request(`/stats/daily?date=${date}`);
}

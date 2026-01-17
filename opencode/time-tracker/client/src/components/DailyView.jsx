import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
}

function formatTime(dateString) {
  return format(new Date(dateString), 'HH:mm');
}

export default function DailyView() {
  const { projects, tasks, entries, loadEntries, deleteEntry, loading } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadEntries(format(selectedDate, 'yyyy-MM-dd'));
  }, [selectedDate]);

  const groupedEntries = entries.reduce((acc, entry) => {
    const projectId = entry.projectId;
    if (!acc[projectId]) {
      acc[projectId] = [];
    }
    acc[projectId].push(entry);
    return acc;
  }, {});

  const dailyTotal = entries.reduce((sum, e) => sum + (e.duration || 0), 0);

  const projectTotals = Object.entries(groupedEntries).map(([projectId, entries]) => {
    const project = projects.find(p => p.id === projectId);
    const total = entries.reduce((sum, e) => sum + (e.duration || 0), 0);
    return { project, entries, total };
  });

  const navigateDate = (direction) => {
    setSelectedDate(addDays(selectedDate, direction));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => navigateDate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        <button
          onClick={() => navigateDate(1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="p-4 border-b bg-gray-50">
        <div className="text-sm text-gray-500">Total time</div>
        <div className="text-2xl font-bold">{formatDuration(dailyTotal)}</div>
      </div>

      {projectTotals.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No time entries for this day
        </div>
      ) : (
        <div className="divide-y">
          {projectTotals.map(({ project, entries, total }) => (
            <div key={project?.id || 'unknown'}>
              <div
                className="flex items-center justify-between p-4"
                style={{ borderLeft: `4px solid ${project?.color || '#6366f1'}` }}
              >
                <div>
                  <div className="font-medium">{project?.name || 'Unknown Project'}</div>
                  <div className="text-sm text-gray-500">
                    {entries.length} entry{entries.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatDuration(total)}</div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 pb-4">
                {entries.map(entry => {
                  const task = tasks.find(t => t.id === entry.taskId);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between py-2 text-sm border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">
                          {formatTime(entry.startTime)}
                          {entry.endTime && ` - ${formatTime(entry.endTime)}`}
                        </span>
                        {task && (
                          <span className="text-gray-700">{task.name}</span>
                        )}
                        {entry.notes && (
                          <span className="text-gray-500 italic">{entry.notes}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">
                          {formatDuration(entry.duration || 0)}
                        </span>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

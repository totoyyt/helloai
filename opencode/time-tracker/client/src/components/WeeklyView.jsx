import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../services/api';

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
}

export default function WeeklyView() {
  const { projects, entries } = useApp();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekData, setWeekData] = useState({});

  useEffect(() => {
    loadWeekData();
  }, [weekStart, entries]);

  const loadWeekData = async () => {
    const data = {};
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const stats = await api.getDailyStats(dateStr);
      data[dateStr] = stats;
    }
    setWeekData(data);
  };

  const navigateWeek = (direction) => {
    setWeekStart(addDays(weekStart, direction * 7));
  };

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    days.push({
      date,
      dateStr: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE'),
      dayNum: format(date, 'd'),
      isToday: isSameDay(date, new Date())
    });
  }

  const getDayTotal = (dateStr) => {
    const stats = weekData[dateStr] || [];
    return stats.reduce((sum, s) => sum + (s.duration || 0), 0);
  };

  const getProjectTime = (dateStr, projectId) => {
    const stats = weekData[dateStr] || [];
    const stat = stats.find(s => s.projectId === projectId);
    return stat ? stat.duration : 0;
  };

  const weeklyTotal = days.reduce((sum, day) => sum + getDayTotal(day.dateStr), 0);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => navigateWeek(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">
          Week of {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </h2>
        <button
          onClick={() => navigateWeek(1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="p-4 border-b bg-gray-50">
        <div className="text-sm text-gray-500">Weekly total</div>
        <div className="text-2xl font-bold">{formatDuration(weeklyTotal)}</div>
      </div>

      <div className="grid grid-cols-7 divide-x">
        {days.map(day => {
          const dayTotal = getDayTotal(day.dateStr);
          const isToday = day.isToday;
          
          return (
            <div key={day.dateStr} className="min-h-[400px]">
              <div
                className={`p-2 text-center border-b ${
                  isToday ? 'bg-indigo-50' : 'bg-gray-50'
                }`}
              >
                <div className="text-sm text-gray-500">{day.dayName}</div>
                <div className={`text-lg font-semibold ${isToday ? 'text-indigo-600' : ''}`}>
                  {day.dayNum}
                </div>
              </div>

              <div className="p-2">
                <div className="text-xs font-medium text-gray-600 mb-2">
                  {formatDuration(dayTotal)}
                </div>

                {projects.map(project => {
                  const time = getProjectTime(day.dateStr, project.id);
                  if (time === 0) return null;
                  
                  return (
                    <div
                      key={project.id}
                      className="text-xs p-1 mb-1 rounded"
                      style={{ backgroundColor: project.color + '20', color: project.color }}
                    >
                      {formatDuration(time)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

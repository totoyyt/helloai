import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, subDays, startOfDay } from 'date-fns';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as api from '../services/api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
}

export default function Reports() {
  const { projects } = useApp();
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    loadReports();
  }, [timeRange]);

  const loadReports = async () => {
    const endDate = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'today':
        startDate = startOfDay(new Date());
        break;
      case 'week':
        startDate = subDays(endDate, 7);
        break;
      case 'month':
        startDate = subDays(endDate, 30);
        break;
      default:
        startDate = subDays(endDate, 7);
    }

    const entries = await api.getEntriesRange(
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd')
    );

    const projectTotals = {};
    entries.forEach(entry => {
      if (!projectTotals[entry.projectId]) {
        projectTotals[entry.projectId] = 0;
      }
      projectTotals[entry.projectId] += entry.duration || 0;
    });

    const pieChartData = Object.entries(projectTotals).map(([projectId, duration]) => {
      const project = projects.find(p => p.id === projectId);
      return {
        name: project?.name || 'Unknown',
        value: duration,
        color: project?.color || '#6366f1'
      };
    });

    const dailyTotals = {};
    for (let i = 0; i <= 6; i++) {
      const date = subDays(endDate, 6 - i);
      dailyTotals[format(date, 'MMM d')] = 0;
    }

    entries.forEach(entry => {
      const dateKey = format(new Date(entry.startTime), 'MMM d');
      if (dailyTotals.hasOwnProperty(dateKey)) {
        dailyTotals[dateKey] += entry.duration || 0;
      }
    });

    const barChartData = Object.entries(dailyTotals).map(([date, duration]) => ({
      date,
      hours: (duration / 3600).toFixed(2)
    }));

    setPieData(pieChartData);
    setBarData(barChartData);
  };

  const totalHours = pieData.reduce((sum, d) => sum + d.value, 0) / 3600;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Time Distribution by Project</h2>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg mb-4"
        >
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>

        <div className="text-2xl font-bold mb-4">
          Total: {totalHours.toFixed(1)} hours
        </div>

        {pieData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatDuration(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data for this period
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">Daily Totals</h2>

        {barData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${value} hours`}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data for this period
          </div>
        )}
      </div>
    </div>
  );
}

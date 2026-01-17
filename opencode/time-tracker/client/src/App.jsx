import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Timer from './components/Timer';
import DailyView from './components/DailyView';
import WeeklyView from './components/WeeklyView';
import Reports from './components/Reports';
import Settings from './components/Settings';
import { Clock, Calendar, BarChart2, Settings as SettingsIcon } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('timer');

  const tabs = [
    { id: 'timer', label: 'Timer', icon: Clock },
    { id: 'daily', label: 'Daily', icon: Calendar },
    { id: 'weekly', label: 'Weekly', icon: BarChart2 },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Time Tracker</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'timer' && <Timer />}
        {activeTab === 'daily' && <DailyView />}
        {activeTab === 'weekly' && <WeeklyView />}
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'settings' && <Settings />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-around">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-3 px-6 ${
                  activeTab === tab.id
                    ? 'text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="pb-20"></div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

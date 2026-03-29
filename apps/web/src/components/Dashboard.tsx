import React from 'react';
import { Sidebar } from './Sidebar';
import { StatCard } from './StatCard';
import { ActionBuilder } from './ActionBuilder';
import { PairingModal } from './PairingModal';
import { MousePointer2, Clock, Zap, Activity } from 'lucide-react';


export function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of your Knock signals and activities.</p>
          </div>
          <PairingModal />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Taps Today" value="84" icon={Activity} trend="+12%" />
          <StatCard title="Most Used Action" value="Spotify" icon={MousePointer2} />
          <StatCard title="Uptime" value="14h 23m" icon={Clock} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">Tap Frequency</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
              <span className="text-gray-400 text-sm font-medium">Chart Placeholder (Recharts)</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">Recent Activity</h3>
            <div className="flex-1 space-y-5">
              {[
                { time: '2 mins ago', action: 'Open Spotify', type: 'Double Tap' },
                { time: '45 mins ago', action: 'Toggle Mute', type: 'Single Tap' },
                { time: '2 hours ago', action: 'Next Track', type: 'Swipe Right' },
                { time: '4 hours ago', action: 'Lock Screen', type: 'Triple Tap' },
                { time: '5 hours ago', action: 'Open Notion', type: 'Double Tap' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{activity.type} detected</p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.action} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ActionBuilder />
      </main>
    </div>
  );
}

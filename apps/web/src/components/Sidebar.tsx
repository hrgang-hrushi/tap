import React from 'react';
import { Home, Zap, Settings, Laptop2, Users } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold font-sans tracking-tight text-gray-900">Knock</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {[
          { name: 'Dashboard', icon: Home, current: true },
          { name: 'Actions', icon: Zap, current: false },
          { name: 'Profiles', icon: Users, current: false },
          { name: 'Devices', icon: Laptop2, current: false },
        ].map((item) => (
          <a
            key={item.name}
            href="#"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
              item.current 
                ? 'bg-primary-50 text-primary-900 font-semibold' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
            }`}
          >
            <item.icon className={`w-5 h-5 ${item.current ? 'text-primary-600' : 'text-gray-400'}`} />
            <span>{item.name}</span>
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 mb-4">
        <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all font-medium">
          <Settings className="w-5 h-5 text-gray-400" />
          <span>Settings</span>
        </a>
      </div>
    </div>
  );
}

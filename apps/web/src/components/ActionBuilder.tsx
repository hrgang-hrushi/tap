import React, { useState } from 'react';
import { Plus, X, Search, Zap, Layers, Keyboard, MousePointer2, Play } from 'lucide-react';

export function ActionBuilder() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[600px] border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create Knock Action</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Step 1: Pattern */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">1</span>
              <h3 className="font-semibold text-gray-900 text-lg">Choose Trigger Pattern</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 pl-9">
              {['Single Tap', 'Double Tap', 'Triple Tap'].map((tap, i) => (
                <button key={tap} className={`p-4 rounded-xl border-2 text-left transition-all ${i === 1 ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'}`}>
                  <div className="flex space-x-1 mb-2">
                    {Array(i + 1).fill(0).map((_, j) => (
                      <div key={j} className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-primary-500' : 'bg-gray-400'}`} />
                    ))}
                  </div>
                  <span className={`font-medium ${i === 1 ? 'text-primary-900' : 'text-gray-700'}`}>{tap}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Action */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-sm font-bold">2</span>
              <h3 className="font-semibold text-gray-900 text-lg">Select Action</h3>
            </div>
            
            <div className="pl-9 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search actions (e.g., 'Open Spotify', 'Mute')" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'System Command', icon: Layers },
                  { name: 'Keyboard Shortcut', icon: Keyboard },
                  { name: 'App Control', icon: MousePointer2 },
                  { name: 'Media Playback', icon: Play },
                ].map((category) => (
                  <button key={category.name} className="flex items-center space-x-3 p-3 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all text-left">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <category.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-700">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-3">
          <button onClick={() => setIsOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button className="px-5 py-2.5 rounded-xl font-medium bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all flex items-center space-x-2">
            <span>Save Action</span>
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Shield, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import { io } from 'socket.io-client';
import { Dashboard } from './Dashboard';

const socket = io('http://localhost:3000');

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [calibrationScore, setCalibrationScore] = useState(0);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('permissions_status', (data) => {
      console.log('Web: Received permissions_status', data);
      if (data.isTrusted) {
        setPermissionsGranted(true);
      }
    });
    
    socket.on('knock_event', (data) => {
      console.log('Web: Received knock_event', data);
      // Register the Z-axis intensity sent natively from the MacBook
      const intensity = Math.round(data.intensity);
      if (intensity > 0) {
        setCalibrationScore(intensity);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('permissions_status');
      socket.off('knock_event');
    }
  }, []);

  // If already onboarded, render standard dashboard
  if (hasCompleted) return <Dashboard />;

  const handleRequestPermissions = () => {
    console.log('Web: Sending trigger_permissions_request');
    socket.emit('trigger_permissions_request');
  };

  const simulateTap = () => {
    // Fallback for non-mac machines missing the WebKit accelerometer node
    const intensity = Math.floor(Math.random() * 50) + 50;
    setCalibrationScore(intensity);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 selection:bg-primary-500 selection:text-white">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          <div className="flex justify-end mb-4">
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{isConnected ? 'API Connected' : 'API Disconnected'}</span>
            </div>
          </div>
          {step === 0 && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome to Knock</h2>
              <p className="text-gray-500 text-sm">Turn your physical desk taps into powerful automated macOS workflows.</p>
              <button 
                onClick={() => setStep(1)}
                className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 transition-all active:scale-95"
              >
                Get Started
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">System Permissions</h3>
                  <p className="text-sm text-gray-500 mt-1">Enable Accessibility to allow Knock to run automated scripts.</p>
                </div>
              </div>

              <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-4">Click below to open System Preferences and authorize the Knock daemon.</p>
                <div className="flex justify-between items-center">
                  <button 
                    onClick={handleRequestPermissions} 
                    className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                  >
                    Request Access
                  </button>
                  {permissionsGranted && <CheckCircle2 className="w-6 h-6 text-green-500 animate-in zoom-in" />}
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!permissionsGranted}
                className={`w-full font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${permissionsGranted ? 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95 shadow-sm shadow-primary-500/20' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Calibrate Sensitivity</h2>
              <p className="text-gray-500 text-sm">Tap your desk strongly a few times to set your baseline accelerometer sensitivity.</p>
              
              <div className="h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300">
                <div className="absolute inset-x-0 bottom-0 bg-primary-100 transition-all duration-300 ease-out" style={{ height: `${calibrationScore}%` }} />
                <span className="relative z-10 text-3xl font-black text-gray-300 transition-colors duration-300">
                  {calibrationScore > 0 ? `${calibrationScore} G` : 'Listening...'}
                </span>
              </div>

              <div className="flex justify-center mt-6">
                <button onClick={simulateTap} className="text-sm text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-all">
                  Simulate Mac Tap Event
                </button>
              </div>

              <button 
                onClick={() => setHasCompleted(true)}
                disabled={calibrationScore === 0}
                className={`w-full font-semibold py-3 rounded-xl transition-all ${calibrationScore > 0 ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                Finish Setup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

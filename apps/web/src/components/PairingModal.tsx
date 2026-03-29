import React, { useState } from 'react';
import { QrCode, Smartphone, X, CheckCircle2 } from 'lucide-react';

export function PairingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
        <span className="text-sm font-medium text-gray-700">Pair Device</span>
        <Smartphone className="w-4 h-4 text-gray-400 ml-1" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100">
        <div className="px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Connect Device</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center text-center space-y-6">
          {step === 1 ? (
            <>
              <div className="p-4 bg-primary-50 rounded-2xl w-48 h-48 flex items-center justify-center border border-primary-100">
                <QrCode className="w-32 h-32 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan with Knock App</h3>
                <p className="text-sm text-gray-500 max-w-[250px] mx-auto">
                  Open the Knock clone app on your iPhone or Mac and scan this QR code to connect.
                </p>
              </div>
              <button 
                onClick={() => setStep(2)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Simulate Connection
              </button>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Device Connected!</h3>
                <p className="text-sm text-gray-500">
                  Your "iPhone 14 Pro" is now synced and ready for taps.
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors mt-4"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

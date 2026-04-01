import { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Zap, CheckCircle2, ChevronRight, Mic, MicOff, Volume2 } from 'lucide-react';
import { Dashboard } from './Dashboard';

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [calibrationScore, setCalibrationScore] = useState(0);
  const [liveLevel, setLiveLevel] = useState(0);
  const [knockCount, setKnockCount] = useState(0);
  const [threshold, setThreshold] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastKnockTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startListening = useCallback((stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.3;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const analyze = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate overall volume level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const normalizedLevel = Math.min(100, (average / 128) * 100);
      setLiveLevel(Math.round(normalizedLevel));

      // Detect knock: sudden spike above threshold
      const now = Date.now();
      if (normalizedLevel > threshold && now - lastKnockTimeRef.current > 300) {
        lastKnockTimeRef.current = now;
        const intensity = Math.min(100, Math.round(normalizedLevel));
        setCalibrationScore(intensity);
        setKnockCount(prev => prev + 1);
      }

      rafRef.current = requestAnimationFrame(analyze);
    };

    rafRef.current = requestAnimationFrame(analyze);
  }, [threshold]);

  const handleRequestPermissions = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionsGranted(true);
      startListening(stream);
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings and try again.');
      } else if (e.name === 'NotFoundError') {
        setError('No microphone found on this device.');
      } else {
        setError(`Failed to access microphone: ${e.message || 'Unknown error'}`);
      }
      console.error('Microphone access error:', err);
    }
  };

  const handleContinueToCalibration = () => {
    if (!permissionsGranted || !streamRef.current) return;
    setStep(2);
  };

  // If already onboarded, render standard dashboard
  if (hasCompleted) return <Dashboard />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 selection:bg-primary-500 selection:text-white">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
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
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">Microphone Access</h3>
                  <p className="text-sm text-gray-500 mt-1">Knock uses your microphone to detect physical desk taps.</p>
                </div>
              </div>

              <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-4">
                  {permissionsGranted
                    ? 'Microphone access granted and listening for taps.'
                    : 'Click below to grant microphone access so Knock can detect your desk taps.'}
                </p>
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleRequestPermissions}
                    disabled={permissionsGranted}
                    className={`px-4 py-2 border rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-2 ${
                      permissionsGranted
                        ? 'border-green-200 bg-green-50 text-green-700 cursor-default'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {permissionsGranted ? (
                      <>
                        <Mic className="w-4 h-4" />
                        Listening
                      </>
                    ) : (
                      <>
                        <MicOff className="w-4 h-4" />
                        Request Access
                      </>
                    )}
                  </button>
                  {permissionsGranted && <CheckCircle2 className="w-6 h-6 text-green-500 animate-in zoom-in" />}
                </div>

                {permissionsGranted && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Volume2 className="w-4 h-4" />
                      <span>Live level: {liveLevel}%</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 transition-all duration-75"
                        style={{ width: `${liveLevel}%` }}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              <button
                onClick={handleContinueToCalibration}
                disabled={!permissionsGranted}
                className={`w-full font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${
                  permissionsGranted
                    ? 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95 shadow-sm shadow-primary-500/20'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Calibrate Sensitivity</h2>
              <p className="text-gray-500 text-sm">Tap your desk to calibrate. The detector will pick up real knocks and ignore background noise.</p>

              <div className="h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300">
                <div
                  className="absolute inset-x-0 bottom-0 bg-primary-100 transition-all duration-75 ease-out"
                  style={{ height: `${liveLevel}%` }}
                />
                <span className={`relative z-10 text-3xl font-black transition-colors duration-300 ${
                  liveLevel > threshold ? 'text-primary-600' : 'text-gray-300'
                }`}>
                  {knockCount > 0 ? `${calibrationScore}%` : 'Tap your desk...'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600 px-1">
                  <span>Knocks detected: <strong className="text-gray-900">{knockCount}</strong></span>
                  <span>Threshold: <strong className="text-gray-900">{threshold}%</strong></span>
                </div>
                <div className="px-1">
                  <label className="text-xs text-gray-500 mb-1 block text-left">Sensitivity threshold</label>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={threshold}
                    onChange={e => setThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>More sensitive</span>
                    <span>Less sensitive</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setKnockCount(0); setCalibrationScore(0); }}
                  className="flex-1 px-4 py-3 border border-gray-200 bg-white rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                >
                  Reset
                </button>
                <button
                  onClick={() => setHasCompleted(true)}
                  disabled={knockCount < 1}
                  className={`flex-1 font-semibold py-3 rounded-xl transition-all ${
                    knockCount > 0
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20 active:scale-95'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Finish Setup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

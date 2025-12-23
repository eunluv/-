import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Trophy, Zap, Volume1 } from 'lucide-react';
import { TimerStatus } from './types';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [initialTime, setInitialTime] = useState(60);
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.IDLE);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);

  const timerRef = useRef<any>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        setStatus(TimerStatus.FINISHED);
        if (soundEnabled) audioService.playAlarm(volume);
        return 0;
      }
      if (soundEnabled) {
        audioService.playTick(volume, prev <= 11);
      }
      return prev - 1;
    });
  }, [soundEnabled, volume]);

  useEffect(() => {
    if (status === TimerStatus.RUNNING) {
      timerRef.current = setInterval(handleTick, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, handleTick]);

  const toggleTimer = () => {
    if (status === TimerStatus.IDLE || status === TimerStatus.PAUSED) {
      audioService.playTick(0, false).catch(() => {});
    }
    
    if (status === TimerStatus.RUNNING) {
      setStatus(TimerStatus.PAUSED);
    } else {
      setStatus(TimerStatus.RUNNING);
    }
  };

  const resetTimer = () => {
    setStatus(TimerStatus.IDLE);
    setTimeLeft(initialTime);
  };

  const setPreset = (seconds: number) => {
    setInitialTime(seconds);
    setTimeLeft(seconds);
    setStatus(TimerStatus.IDLE);
    setShowSettings(false);
  };

  const isLastTen = timeLeft <= 10 && status === TimerStatus.RUNNING;
  const progress = (timeLeft / initialTime) * 100;

  // Adjusted colors to Tailwind v2 defaults (Gray instead of Slate, Blue instead of Sky)
  const textColor = isLastTen ? 'text-white' : 'text-gray-900';
  const progressColor = isLastTen ? 'bg-white' : 'bg-blue-600';

  return (
    <div className={`min-h-screen flex flex-col items-center transition-all duration-700 pb-20 ${
      isLastTen 
        ? 'bg-red-600 animate-pulse-red' 
        : status === TimerStatus.FINISHED 
          ? 'bg-yellow-400' 
          : 'bg-gradient-to-br from-blue-100 via-white to-yellow-50'
    }`}>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-white opacity-50 rounded-full filter blur-3xl transform -translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-100 opacity-40 rounded-full filter blur-3xl transform translate-x-1/4 translate-y-1/4"></div>
      </div>

      <main className="relative z-10 w-full max-w-5xl px-4 text-center mt-20">
        <div className="fixed top-0 left-0 w-full h-4 bg-gray-200 z-50">
          <div 
            className={`h-full transition-all duration-1000 ease-linear shadow-sm ${progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-col items-center space-y-4 mb-6">
          <div className="flex items-center space-x-2 px-6 py-2 rounded-full bg-white bg-opacity-60 border border-white shadow-sm">
             <Zap size={18} className={status === TimerStatus.RUNNING ? 'text-orange-500 animate-spin-slow' : 'text-gray-400'} />
             <span className="text-gray-800 text-sm font-bold uppercase tracking-widest">
               {status === TimerStatus.RUNNING ? 'CHALLENGE ACTIVE' : status}
             </span>
          </div>
          {status === TimerStatus.FINISHED && (
            <div className="animate-bounce bg-white text-red-600 px-10 py-4 rounded-3xl font-black text-4xl shadow-2xl flex items-center space-x-4 border-4 border-red-50">
              <Trophy size={48} /> TIME'S UP!
            </div>
          )}
        </div>

        <div className={`timer-font font-black select-none transition-all duration-200 ${
          isLastTen ? 'scale-110' : ''
        } ${textColor} text-7xl md:text-9xl lg:text-[280px] leading-none tracking-tighter py-8`}>
          {formatTime(timeLeft)}
        </div>

        <div className="mt-4 p-8 bg-white bg-opacity-40 rounded-3xl border border-white shadow-xl inline-flex flex-col items-center space-y-8">
          <div className="flex items-center space-x-6 md:space-x-12">
            <button 
              onClick={resetTimer}
              className="p-6 rounded-2xl bg-white bg-opacity-60 hover:bg-white text-gray-900 transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Reset"
            >
              <RotateCcw size={36} />
            </button>

            <button 
              onClick={toggleTimer}
              className={`w-32 h-32 rounded-3xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl ${
                status === TimerStatus.RUNNING 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {status === TimerStatus.RUNNING 
                ? <Pause size={64} fill="currentColor" /> 
                : <Play size={64} fill="currentColor" className="ml-2" />}
            </button>

            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-6 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 shadow-sm ${
                showSettings ? 'bg-orange-400 border-orange-300 text-orange-900' : 'bg-white bg-opacity-60 border-white text-gray-900 hover:bg-white'
              }`}
            >
              <Settings size={36} />
            </button>
          </div>

          <div className="flex items-center space-x-5 w-full max-w-xs px-6 py-3 bg-white bg-opacity-40 rounded-full border border-white">
            <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`transition-colors ${soundEnabled ? 'text-gray-900' : 'text-red-500'}`}
            >
                {soundEnabled ? (volume > 0.5 ? <Volume2 size={24} /> : <Volume1 size={24} />) : <VolumeX size={24} />}
            </button>
            <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (!soundEnabled) setSoundEnabled(true);
                }}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {showSettings && (
          <div className="mt-12 p-8 md:p-12 bg-white bg-opacity-80 rounded-3xl border border-white shadow-2xl max-w-4xl mx-auto mb-10">
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-10">Choose Duration</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[10, 30, 60, 180, 300, 600].map((s) => (
                <button
                  key={s}
                  onClick={() => setPreset(s)}
                  className={`py-6 px-4 rounded-2xl font-black text-2xl transition-all border-4 ${
                    initialTime === s 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg scale-105' 
                      : 'bg-white border-gray-100 text-gray-800 hover:border-blue-200'
                  }`}
                >
                  {s < 60 ? `${s}s` : `${s / 60}m`}
                </button>
              ))}
            </div>
            
            <div className="mt-12 pt-10 border-t border-gray-100">
               <label className="block text-gray-400 text-[10px] font-black tracking-widest mb-6 uppercase">Manual Seconds</label>
               <input 
                type="number" 
                value={initialTime}
                onChange={(e) => setPreset(parseInt(e.target.value) || 0)}
                className="w-full max-w-xs bg-gray-50 border-4 border-gray-100 rounded-2xl py-5 px-8 text-center text-4xl font-black text-gray-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                placeholder="000"
               />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
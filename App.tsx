
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
      audioService.playTick(0, false); // Trigger context resume
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

  return (
    <div className={`min-h-screen flex flex-col items-center transition-all duration-700 pb-20 ${
      isLastTen 
        ? 'bg-red-500 animate-pulse-red' 
        : status === TimerStatus.FINISHED 
          ? 'bg-yellow-400' 
          : 'bg-gradient-to-tr from-sky-300 via-white to-orange-100'
    }`}>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-5xl px-4 text-center mt-20">
        <div className="fixed top-0 left-0 w-full h-4 bg-black/5 z-50">
          <div 
            className={`h-full transition-all duration-1000 ease-linear shadow-sm ${
              isLastTen ? 'bg-white' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/60 backdrop-blur-lg border border-white shadow-sm">
             <Zap size={18} className={status === TimerStatus.RUNNING ? 'text-orange-500 animate-spin-slow' : 'text-slate-400'} />
             <span className="text-slate-800 text-sm font-black uppercase tracking-[0.2em]">
               {status === TimerStatus.RUNNING ? 'CHALLENGE ACTIVE' : status}
             </span>
          </div>
          {status === TimerStatus.FINISHED && (
            <div className="animate-bounce bg-white text-red-600 px-10 py-4 rounded-3xl font-black text-4xl shadow-2xl flex items-center gap-4 border-4 border-red-100">
              <Trophy size={48} /> TIME'S UP!
            </div>
          )}
        </div>

        <div className={`timer-font font-black select-none transition-all duration-200 ${
          isLastTen ? 'text-white scale-110' : 'text-slate-900'
        } text-[22vw] md:text-[320px] leading-none tracking-tight py-4`}>
          {formatTime(timeLeft)}
        </div>

        <div className="mt-4 p-8 bg-white/40 backdrop-blur-2xl rounded-[60px] border border-white/60 shadow-xl inline-flex flex-col items-center gap-8 ring-1 ring-black/5">
          <div className="flex items-center gap-6 md:gap-12">
            <button 
              onClick={resetTimer}
              className="p-6 rounded-[30px] bg-white/60 hover:bg-white text-slate-900 transition-all hover:rotate-[-45deg] hover:scale-105 active:scale-90 shadow-sm"
              title="Reset"
            >
              <RotateCcw size={36} />
            </button>

            <button 
              onClick={toggleTimer}
              className={`w-36 h-36 rounded-[50px] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl ${
                status === TimerStatus.RUNNING 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {status === TimerStatus.RUNNING 
                ? <Pause size={72} fill="currentColor" /> 
                : <Play size={72} fill="currentColor" className="ml-2" />}
            </button>

            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-6 rounded-[30px] border-2 transition-all hover:scale-105 active:scale-90 shadow-sm ${
                showSettings ? 'bg-orange-400 border-orange-300 text-orange-950' : 'bg-white/60 border-white text-slate-900 hover:bg-white'
              }`}
            >
              <Settings size={36} />
            </button>
          </div>

          <div className="flex items-center gap-5 w-full max-w-[320px] px-6 py-2 bg-white/40 rounded-full border border-white">
            <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1 transition-colors ${soundEnabled ? 'text-slate-900' : 'text-red-500'}`}
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
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {showSettings && (
          <div className="mt-12 p-10 md:p-14 bg-white/80 backdrop-blur-3xl rounded-[60px] border border-white shadow-2xl animate-in fade-in zoom-in-95 duration-300 max-w-4xl mx-auto mb-10">
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.5em] mb-10">Choose Duration</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[10, 30, 60, 180, 300, 600].map((s) => (
                <button
                  key={s}
                  onClick={() => setPreset(s)}
                  className={`py-8 px-4 rounded-[40px] font-black text-3xl transition-all border-4 ${
                    initialTime === s 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-xl scale-105' 
                      : 'bg-white border-slate-100 text-slate-800 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}
                >
                  {s < 60 ? `${s}s` : `${s / 60}m`}
                </button>
              ))}
            </div>
            
            <div className="mt-14 pt-10 border-t border-slate-100">
               <label className="block text-slate-400 text-[10px] font-black tracking-widest mb-6 uppercase">Manual Input (Seconds)</label>
               <input 
                type="number" 
                value={initialTime}
                onChange={(e) => setPreset(parseInt(e.target.value) || 0)}
                className="w-full max-w-[300px] bg-slate-50 border-4 border-slate-100 rounded-3xl py-6 px-10 text-center text-5xl font-black text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
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


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Trophy, Zap, Volume1, Type } from 'lucide-react';
import { TimerStatus } from './types';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [initialTime, setInitialTime] = useState(60);
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.IDLE);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(280); // Default font size in px for desktop

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

      <main className="relative z-10 w-full max-w-5xl px-4 text-center mt-12">
        <div className="fixed top-0 left-0 w-full h-4 bg-gray-200 z-50">
          <div 
            className={`h-full transition-all duration-1000 ease-linear shadow-sm ${progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Header - Fixed height container to prevent shifting */}
        <div className="flex flex-col items-center justify-center h-24 mb-4">
          {status === TimerStatus.FINISHED ? (
            <div className="animate-bounce bg-white text-red-600 px-10 py-3 rounded-full font-black text-2xl md:text-4xl shadow-2xl flex items-center space-x-4 border-4 border-red-50">
              <Trophy size={40} /> <span>TIME'S UP!</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-6 py-2 rounded-full bg-white bg-opacity-60 border border-white shadow-sm">
               <Zap size={18} className={status === TimerStatus.RUNNING ? 'text-orange-500 animate-spin-slow' : 'text-gray-400'} />
               <span className="text-gray-800 text-sm font-bold uppercase tracking-widest">
                 {status === TimerStatus.RUNNING ? 'CHALLENGE ACTIVE' : status}
               </span>
            </div>
          )}
        </div>

        {/* Timer Display */}
        <div 
          className={`timer-font font-black select-none transition-all duration-200 leading-none tracking-tighter ${textColor}`}
          style={{ 
            fontSize: `min(calc(${fontSize}px * 0.8), 25vw)`,
            height: '1.1em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {formatTime(timeLeft)}
        </div>

        {/* Main Controls */}
        <div className="mt-8 p-6 bg-white bg-opacity-40 rounded-3xl border border-white shadow-xl inline-flex flex-col items-center space-y-6">
          <div className="flex items-center space-x-6 md:space-x-10">
            <button 
              onClick={resetTimer}
              className="p-4 rounded-xl bg-white bg-opacity-60 hover:bg-white text-gray-900 transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Reset"
            >
              <RotateCcw size={28} />
            </button>

            <button 
              onClick={toggleTimer}
              className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl ${
                status === TimerStatus.RUNNING 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {status === TimerStatus.RUNNING 
                ? <Pause size={48} fill="currentColor" /> 
                : <Play size={48} fill="currentColor" className="ml-1" />}
            </button>

            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 shadow-sm ${
                showSettings ? 'bg-orange-400 border-orange-300 text-orange-900' : 'bg-white bg-opacity-60 border-white text-gray-900 hover:bg-white'
              }`}
            >
              <Settings size={28} />
            </button>
          </div>

          <div className="flex items-center space-x-4 w-full max-w-xs px-5 py-2 bg-white bg-opacity-40 rounded-full border border-white">
            <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`transition-colors ${soundEnabled ? 'text-gray-900' : 'text-red-500'}`}
            >
                {soundEnabled ? (volume > 0.5 ? <Volume2 size={20} /> : <Volume1 size={20} />) : <VolumeX size={20} />}
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

        {/* Settings View */}
        {showSettings && (
          <div className="mt-8 p-8 md:p-10 bg-white bg-opacity-90 rounded-3xl border border-white shadow-2xl max-w-4xl mx-auto mb-10 text-left">
            <div className="grid md:grid-cols-2 gap-10">
              
              {/* Presets Column */}
              <div>
                <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-6">Presets</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[10, 30, 60, 180, 300, 600].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPreset(s)}
                      className={`py-4 rounded-xl font-bold text-xl transition-all border-2 ${
                        initialTime === s 
                          ? 'bg-blue-600 border-blue-400 text-white shadow-md' 
                          : 'bg-white border-gray-100 text-gray-800 hover:border-blue-200'
                      }`}
                    >
                      {s < 60 ? `${s}s` : `${s / 60}m`}
                    </button>
                  ))}
                </div>
                
                <div className="mt-8">
                  <label className="block text-gray-400 text-[10px] font-black tracking-widest mb-3 uppercase">Manual Seconds</label>
                  <input 
                    type="number" 
                    value={initialTime}
                    onChange={(e) => setPreset(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-6 text-center text-2xl font-black text-gray-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              {/* View Customization Column */}
              <div className="flex flex-col space-y-8">
                <div>
                  <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-6 flex items-center space-x-2">
                    <Type size={14} /> <span>Timer Size</span>
                  </h3>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="range" 
                      min="100" 
                      max="600" 
                      step="1" 
                      value={fontSize} 
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-gray-900 font-bold w-12 text-right">{fontSize}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 italic">* Automatically scales for mobile screens</p>
                </div>
                
                <button 
                  onClick={() => setShowSettings(false)}
                  className="mt-auto w-full py-4 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  Close Settings
                </button>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

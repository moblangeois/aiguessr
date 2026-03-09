import { useState, useEffect, useCallback } from 'react';

export function Timer({ duration, isPaused, onTimeUp, onTick }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
    onTick?.(duration);
  }, [duration]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev <= 1 ? 0 : prev - 1;
        onTick?.(newTime);
        if (newTime === 0) {
          clearInterval(interval);
          onTimeUp?.();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft, onTimeUp, onTick]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const percentage = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 30;
  const isCritical = timeLeft <= 10;

  return (
    <div className="flex items-center gap-4">
      {/* Barre de progression circulaire stylisee */}
      <div className="relative">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
          {/* Cercle de fond */}
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            className="stroke-slate-200"
            strokeWidth="3"
          />
          {/* Cercle de progression */}
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            className={`transition-all duration-1000 ${
              isCritical ? 'stroke-red-500' : isLow ? 'stroke-amber-500' : 'stroke-emerald-500'
            }`}
            strokeWidth="3"
            strokeDasharray={`${percentage} 100`}
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Temps affiche */}
      <div className={`font-mono text-3xl font-black transition-all duration-300 ${
        isCritical ? 'text-red-500 animate-pulse scale-110' : isLow ? 'text-amber-500' : 'text-emerald-600'
      }`}>
        {formatTime(timeLeft)}
      </div>
    </div>
  );
}

export default Timer;

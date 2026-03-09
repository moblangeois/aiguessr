import { createContext, useContext, useState, useEffect } from 'react';

const AppTimeContext = createContext(null);

export function AppTimeProvider({ children }) {
  const [appStartTime] = useState(Date.now());

  return (
    <AppTimeContext.Provider value={appStartTime}>
      {children}
    </AppTimeContext.Provider>
  );
}

export function useAppStartTime() {
  const context = useContext(AppTimeContext);
  if (context === null) {
    throw new Error('useAppStartTime must be used within an AppTimeProvider');
  }
  return context;
}

// Hook pour compteur temps réel
export function useRealtimeCounter(rate, enabled = true) {
  const appStartTime = useAppStartTime();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled || !rate) return;

    const interval = setInterval(() => {
      const elapsedSeconds = (Date.now() - appStartTime) / 1000;
      setCount(Math.floor(elapsedSeconds * rate));
    }, 50);

    return () => clearInterval(interval);
  }, [rate, appStartTime, enabled]);

  return count;
}

export default AppTimeContext;

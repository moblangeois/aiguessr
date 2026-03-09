import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRealtimeCounter } from '../contexts/AppTimeContext';

// Formate un nombre avec séparateurs de milliers
function formatNumber(num) {
  return new Intl.NumberFormat('fr-FR').format(Math.floor(num));
}

// Compteur animé standard (de 0 à value)
export function AnimatedCounter({
  value,
  duration = 2000,
  prefix = "",
  suffix = "",
  className = "",
  onComplete
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * value);

      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, onComplete]);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      {prefix}{formatNumber(displayValue)}{suffix}
    </motion.span>
  );
}

// Compteur temps réel (cumule depuis le début de l'app)
export function RealtimeCounter({
  rate,
  unit = "",
  label = "",
  className = ""
}) {
  const count = useRealtimeCounter(rate, true);

  return (
    <div className={`text-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-6xl font-black text-text-primary tabular-nums"
      >
        {formatNumber(count)}
        {unit && <span className="text-3xl ml-2 text-accent">{unit}</span>}
      </motion.div>
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-text-secondary text-lg mt-2"
        >
          {label}
        </motion.p>
      )}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-text-muted text-sm mt-1"
      >
        depuis le début de l'atelier
      </motion.p>
    </div>
  );
}

// Compteur de pourcentage avec barre circulaire
export function PercentageCounter({
  value,
  duration = 2000,
  label = "",
  size = 120,
  className = ""
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const circumference = 2 * Math.PI * (size / 2 - 8);

  useEffect(() => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const strokeDashoffset = circumference - (displayValue / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center ${className}`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Cercle de fond */}
        <svg className="absolute inset-0 -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            fill="none"
            stroke="rgba(16, 185, 129, 0.2)"
            strokeWidth="8"
          />
          {/* Cercle animé */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            fill="none"
            stroke="url(#percentGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: duration / 1000, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="percentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
        {/* Valeur au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black text-text-primary">{displayValue}%</span>
        </div>
      </div>
      {label && (
        <p className="text-text-secondary text-center mt-3 text-sm max-w-[200px]">
          {label}
        </p>
      )}
    </motion.div>
  );
}

// Compteur multiplicateur (×100)
export function MultiplierCounter({
  value,
  duration = 2000,
  label = "",
  className = ""
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center ${className}`}
    >
      <div className="text-5xl font-black">
        <span className="text-warm">×</span>
        <span className="text-text-primary">{displayValue}</span>
      </div>
      {label && (
        <p className="text-text-secondary text-sm mt-2 max-w-[200px]">
          {label}
        </p>
      )}
    </motion.div>
  );
}

export default AnimatedCounter;

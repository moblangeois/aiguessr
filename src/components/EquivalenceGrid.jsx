import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EQUIVALENCES, getEquivalenceLabel, getEquivalenceColor, getEquivalenceIconType } from '../data/equivalences';
import { getIconComponent } from './Icons';

// ==================== GRILLE STYLE "YOUR LIFE IN WEEKS" ====================
// Une grille qui se remplit progressivement pour créer un impact visuel fort

export function EquivalenceGrid({
  type,
  count,
  className = "",
  showLabel = true,
  animated = true,
  columns = null,
  maxItems = 500
}) {
  const equivalence = EQUIVALENCES[type];
  const [revealedCount, setRevealedCount] = useState(animated ? 0 : count);

  const displayCount = Math.min(count, maxItems);
  const hasMore = count > maxItems;

  // Animation de remplissage progressif
  useEffect(() => {
    if (!animated) {
      setRevealedCount(displayCount);
      return;
    }

    setRevealedCount(0);

    const totalDuration = Math.min(4000, Math.max(1500, displayCount * 30));
    const interval = totalDuration / displayCount;

    let current = 0;
    const timer = setInterval(() => {
      current += Math.ceil(displayCount / 50);
      if (current >= displayCount) {
        setRevealedCount(displayCount);
        clearInterval(timer);
      } else {
        setRevealedCount(current);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [displayCount, animated]);

  if (!equivalence) {
    console.warn(`Equivalence type "${type}" not found`);
    return null;
  }

  // Calcul du nombre de colonnes optimal
  const cols = columns || Math.min(25, Math.max(5, Math.ceil(Math.sqrt(displayCount * 1.5))));

  // Taille des icônes adaptative
  const getIconSize = () => {
    if (displayCount <= 20) return 'w-8 h-8';
    if (displayCount <= 50) return 'w-6 h-6';
    if (displayCount <= 100) return 'w-5 h-5';
    if (displayCount <= 200) return 'w-4 h-4';
    if (displayCount <= 500) return 'w-3 h-3';
    return 'w-2 h-2';
  };

  const label = getEquivalenceLabel(type, count);
  const color = getEquivalenceColor(type);
  const IconComponent = getIconComponent(equivalence.iconType);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${className}`}
    >
      {/* Grille d'icônes */}
      <div
        className="grid gap-1 mx-auto justify-center"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: `${cols * 2.5}rem`
        }}
      >
        {Array.from({ length: displayCount }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0.1, scale: 0.5 }}
            animate={{
              opacity: index < revealedCount ? 1 : 0.1,
              scale: index < revealedCount ? 1 : 0.5
            }}
            transition={{
              duration: 0.15,
              ease: "easeOut"
            }}
            className="flex items-center justify-center"
            style={{
              color: index < revealedCount ? color : '#374151'
            }}
          >
            <IconComponent className={getIconSize()} />
          </motion.div>
        ))}
      </div>

      {/* Indicateur +X si dépassement */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-2 text-warm font-bold"
        >
          +{(count - maxItems).toLocaleString('fr-FR')} de plus...
        </motion.div>
      )}

      {/* Label avec compteur animé */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-4"
        >
          <span className="text-text-secondary">= </span>
          <motion.span
            className="font-black text-2xl text-text-primary"
            key={revealedCount}
          >
            {(animated ? Math.min(revealedCount, count) : count).toLocaleString('fr-FR')}
          </motion.span>
          <span className="text-text-secondary ml-2">{label}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// ==================== BARRE DE POURCENTAGE AVEC ICÔNES ====================

export function PercentageBar({
  percentage,
  iconType = "child",
  label = "",
  sublabel = "",
  totalCount = 100,
  className = ""
}) {
  const [revealed, setRevealed] = useState(0);
  const filledCount = Math.round((percentage / 100) * totalCount);
  const IconComponent = getIconComponent(iconType);
  const color = getEquivalenceColor(iconType) || "#f59e0b";

  useEffect(() => {
    setRevealed(0);
    const timer = setInterval(() => {
      setRevealed(prev => {
        if (prev >= filledCount) {
          clearInterval(timer);
          return filledCount;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [filledCount]);

  const currentPercent = Math.round((revealed / totalCount) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className}`}
    >
      {/* Pourcentage géant */}
      <div className="text-center mb-4">
        <motion.span
          className="text-6xl font-black text-text-primary"
          key={currentPercent}
        >
          {currentPercent}
        </motion.span>
        <span className="text-4xl font-bold text-warm">%</span>
      </div>

      {/* Grille d'icônes */}
      <div className="flex flex-wrap justify-center gap-1 max-w-md mx-auto">
        {Array.from({ length: totalCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.15 }}
            animate={{
              opacity: i < revealed ? 1 : 0.15,
              scale: i < revealed ? 1 : 0.8
            }}
            style={{ color: i < revealed ? color : '#374151' }}
            className="w-4 h-4"
          >
            <IconComponent className="w-full h-full" />
          </motion.div>
        ))}
      </div>

      {/* Labels */}
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-text-secondary mt-4 text-lg"
        >
          {label}
        </motion.p>
      )}
      {sublabel && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-text-muted text-sm"
        >
          {sublabel}
        </motion.p>
      )}
    </motion.div>
  );
}

// ==================== COMPARAISON RATIO ====================

export function RatioComparison({
  smallValue,
  smallLabel,
  smallIconType,
  bigValue,
  bigLabel,
  bigIconType,
  ratio,
  className = ""
}) {
  const [showBig, setShowBig] = useState(false);
  const SmallIcon = getIconComponent(smallIconType);
  const BigIcon = getIconComponent(bigIconType);

  useEffect(() => {
    const timer = setTimeout(() => setShowBig(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center justify-center gap-8 ${className}`}
    >
      {/* Petit élément */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 mx-auto text-accent">
          <SmallIcon className="w-full h-full" />
        </div>
        <p className="text-text-primary font-bold mt-2">{smallLabel}</p>
        <p className="text-accent">{smallValue}</p>
      </motion.div>

      {/* Flèche et ratio */}
      <AnimatePresence>
        {showBig && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <svg className="w-8 h-8 text-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-5xl font-black text-warm mx-4"
            >
              x{ratio}
            </motion.span>
            <svg className="w-8 h-8 text-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grand élément */}
      <AnimatePresence>
        {showBig && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto text-danger">
              <BigIcon className="w-full h-full" />
            </div>
            <p className="text-text-primary font-bold mt-2">{bigLabel}</p>
            <p className="text-danger font-bold">{bigValue}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ==================== ACCUMULATION VISUELLE ====================

export function AccumulationStack({
  count,
  iconType,
  label,
  perRow = 10,
  className = ""
}) {
  const [revealed, setRevealed] = useState(0);
  const maxDisplay = Math.min(count, 200);
  const IconComponent = getIconComponent(iconType);
  const color = getEquivalenceColor(iconType);

  useEffect(() => {
    setRevealed(0);
    let current = 0;
    const interval = setInterval(() => {
      current += Math.ceil(maxDisplay / 40);
      if (current >= maxDisplay) {
        setRevealed(maxDisplay);
        clearInterval(interval);
      } else {
        setRevealed(current);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [maxDisplay]);

  const rows = Math.ceil(maxDisplay / perRow);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${className}`}
    >
      {/* Stack d'icônes en rangées */}
      <div className="flex flex-col items-center gap-0">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-0">
            {Array.from({ length: Math.min(perRow, maxDisplay - rowIdx * perRow) }).map((_, colIdx) => {
              const idx = rowIdx * perRow + colIdx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{
                    opacity: idx < revealed ? 1 : 0.1,
                    y: 0
                  }}
                  style={{ color: idx < revealed ? color : '#374151' }}
                  className="w-6 h-6"
                >
                  <IconComponent className="w-full h-full" />
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Compteur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-4"
      >
        <span className="text-3xl font-black text-text-primary">
          {count.toLocaleString('fr-FR')}
        </span>
        <span className="text-text-secondary ml-2">{label}</span>
      </motion.div>
    </motion.div>
  );
}

// ==================== SURFACE COMPARISON ====================

export function SurfaceComparison({
  valueKm2,
  equivalenceType = "football_field",
  className = ""
}) {
  const equivalence = EQUIVALENCES[equivalenceType];
  if (!equivalence) return null;

  const count = Math.round(valueKm2 / equivalence.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center ${className}`}
    >
      {/* Valeur principale */}
      <div className="text-5xl font-black text-text-primary mb-2">
        {valueKm2.toLocaleString('fr-FR')} km²
      </div>

      {/* Équivalence */}
      <div className="text-text-secondary mb-6">
        = {count.toLocaleString('fr-FR')} {getEquivalenceLabel(equivalenceType, count)}
      </div>

      {/* Grille visuelle */}
      <EquivalenceGrid type={equivalenceType} count={Math.min(count, 200)} />
    </motion.div>
  );
}

// ==================== SINGLE STAT CARD ====================

export function StatCard({
  value,
  unit = "",
  label,
  iconType,
  equivalence = null,
  delay = 0,
  className = ""
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const IconComponent = getIconComponent(iconType);
  const color = getEquivalenceColor(iconType);

  useEffect(() => {
    const duration = 2000;
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

    const timeout = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 }}
      className={`bg-surface-1/80 backdrop-blur-sm border border-border rounded-xl p-6 ${className}`}
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12" style={{ color }}>
          <IconComponent className="w-full h-full" />
        </div>
        <div>
          <div className="text-3xl font-black text-text-primary">
            {displayValue.toLocaleString('fr-FR')}
            {unit && <span className="text-lg text-accent ml-1">{unit}</span>}
          </div>
        </div>
      </div>
      <p className="text-text-secondary">{label}</p>

      {equivalence && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (delay + 1500) / 1000 }}
          className="mt-3 pt-3 border-t border-border text-sm text-text-muted"
        >
          = {equivalence}
        </motion.div>
      )}
    </motion.div>
  );
}

export default EquivalenceGrid;

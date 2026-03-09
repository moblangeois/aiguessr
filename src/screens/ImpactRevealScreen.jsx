import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStartTime, useRealtimeCounter } from '../contexts/AppTimeContext';
import {
  EquivalenceGrid,
  PercentageBar,
  RatioComparison,
  AccumulationStack,
  StatCard
} from '../components/EquivalenceGrid';
import { RealtimeCounter, AnimatedCounter, PercentageCounter, MultiplierCounter } from '../components/AnimatedCounter';
import { getIconComponent, IconWarning } from '../components/Icons';
import { EQUIVALENCES, getEquivalenceLabel } from '../data/equivalences';
import { useTranslation } from '../i18n/I18nContext';

// Auto-advance interval in ms
const AUTO_ADVANCE_MS = 4000;

// Slide transition variants
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export function ImpactRevealScreen({
  question,
  questionIndex,
  totalQuestions,
  onContinue
}) {
  const { t, tContent } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const autoAdvanceRef = useRef(null);
  const appStartTime = useAppStartTime();

  const impact = question?.impact;
  const stats = impact?.stats || [];
  const realtime = impact?.realtime;
  const explanation = tContent(question, 'explanation');

  // Localize stat fields
  const localizeObj = (obj) => {
    if (!obj) return obj;
    const result = { ...obj };
    for (const field of ['label', 'sublabel', 'unit', 'comparison', 'per', 'smallLabel', 'bigLabel']) {
      const localized = tContent(obj, field);
      if (localized) result[field] = localized;
    }
    return result;
  };

  // Build the slide list: [realtime?, ...stats, explanation?]
  const slides = [];
  if (realtime) slides.push({ type: 'realtime', data: localizeObj(realtime) });
  stats.forEach((stat, i) => slides.push({ type: 'stat', data: localizeObj(stat), index: i }));
  if (explanation) slides.push({ type: 'explanation', data: explanation });

  const totalSlides = slides.length;
  const isLastSlide = activeSlide === totalSlides - 1;

  // Navigate to a specific slide
  const goToSlide = useCallback((index) => {
    if (index < 0 || index >= totalSlides) return;
    setDirection(index > activeSlide ? 1 : -1);
    setActiveSlide(index);
  }, [activeSlide, totalSlides]);

  const goNext = useCallback(() => {
    if (activeSlide < totalSlides - 1) {
      setDirection(1);
      setActiveSlide(prev => prev + 1);
    }
  }, [activeSlide, totalSlides]);

  const goPrev = useCallback(() => {
    if (activeSlide > 0) {
      setDirection(-1);
      setActiveSlide(prev => prev - 1);
    }
  }, [activeSlide]);

  // Auto-advance
  useEffect(() => {
    if (isPaused || isLastSlide || totalSlides <= 1) {
      clearInterval(autoAdvanceRef.current);
      return;
    }

    autoAdvanceRef.current = setInterval(() => {
      setDirection(1);
      setActiveSlide(prev => {
        if (prev >= totalSlides - 1) {
          clearInterval(autoAdvanceRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(autoAdvanceRef.current);
  }, [isPaused, isLastSlide, totalSlides, activeSlide]);

  // Pause auto-advance on user interaction
  const handleUserNav = useCallback((fn) => {
    setIsPaused(true);
    fn();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleUserNav(goNext);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleUserNav(goPrev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, handleUserNav]);

  // If no impact data, render nothing
  if (!impact || (!stats.length && !realtime)) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-surface-0 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-shrink-0 bg-surface-1 border-b border-border p-4 sm:p-6"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-danger text-text-inverse px-5 py-2 rounded-xl font-black text-xl shadow-lg"
            >
              {t('impact.title')}
            </motion.div>
            <span className="text-text-muted text-lg">
              {t('impact.questionProgress', { current: questionIndex + 1, total: totalQuestions })}
            </span>
          </div>
          <div className="text-right">
            <p className="text-accent font-bold">{tContent(question?.target, 'name')}</p>
          </div>
        </div>
      </motion.div>

      {/* Carousel body */}
      <div
        className="flex-1 relative overflow-hidden"
        onClick={() => handleUserNav(goNext)}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 flex items-center justify-center p-6 sm:p-10"
          >
            <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <SlideContent
                slide={slides[activeSlide]}
                appStartTime={appStartTime}
                t={t}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next buttons */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handleUserNav(goPrev); }}
              disabled={activeSlide === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-2/80 backdrop-blur text-text-primary flex items-center justify-center transition-opacity disabled:opacity-20 hover:bg-surface-3 cursor-pointer"
              aria-label={t('common.previous')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleUserNav(goNext); }}
              disabled={isLastSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-2/80 backdrop-blur text-text-primary flex items-center justify-center transition-opacity disabled:opacity-20 hover:bg-surface-3 cursor-pointer"
              aria-label={t('common.next')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Footer: dots + continue */}
      <div className="flex-shrink-0 bg-surface-1 border-t border-border px-4 py-4 sm:py-5">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-3">
          {/* Navigation dots */}
          {totalSlides > 1 && (
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleUserNav(() => goToSlide(i))}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeSlide
                      ? 'w-6 h-2.5 bg-accent'
                      : 'w-2.5 h-2.5 bg-surface-3 hover:bg-text-muted'
                  }`}
                  aria-label={t('impact.slideOf', { current: i + 1, total: totalSlides })}
                />
              ))}
            </div>
          )}

          {/* Continue button on last slide */}
          <AnimatePresence>
            {isLastSlide && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onContinue}
                className="px-10 py-3 bg-accent hover:bg-accent-hover text-text-inverse font-black text-lg rounded-xl transition-colors duration-200 shadow-lg cursor-pointer"
              >
                {t('impact.continue')}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ==================== SLIDE CONTENT DISPATCHER ====================

function SlideContent({ slide, appStartTime, t }) {
  if (!slide) return null;

  switch (slide.type) {
    case 'realtime':
      return <RealtimeSlide realtime={slide.data} appStartTime={appStartTime} t={t} />;
    case 'stat':
      return <StatSlide stat={slide.data} />;
    case 'explanation':
      return <ExplanationSlide text={slide.data} t={t} />;
    default:
      return null;
  }
}

// ==================== SLIDE TYPES ====================

function RealtimeSlide({ realtime, appStartTime, t }) {
  const count = useRealtimeCounter(realtime.rate, true);
  const IconComponent = getIconComponent(realtime.iconType || 'water');

  return (
    <div className="text-center">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-danger text-lg sm:text-xl mb-6"
      >
        {t('impact.sinceStart')}
      </motion.p>

      <div className="flex items-center justify-center gap-6 sm:gap-8">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-16 h-16 sm:w-20 sm:h-20 text-danger"
        >
          <IconComponent className="w-full h-full" />
        </motion.div>

        <div>
          <motion.div className="text-5xl sm:text-6xl md:text-7xl font-black text-warm tabular-nums">
            {count.toLocaleString('fr-FR')}
          </motion.div>
          <div className="text-xl sm:text-2xl text-danger font-bold mt-1">
            {realtime.unit}
          </div>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-text-secondary mt-6 text-base sm:text-lg"
      >
        {realtime.label}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-text-muted text-sm mt-1"
      >
        {t('impact.atRate', {
          rate: realtime.rate.toLocaleString('fr-FR'),
          unit: realtime.unit,
          per: realtime.per || t('time.perSecond')
        })}
      </motion.p>
    </div>
  );
}

function ExplanationSlide({ text, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 sm:p-8 bg-warm-light border border-warm-muted rounded-2xl"
    >
      <div className="flex items-start gap-4">
        <div className="w-7 h-7 text-warm flex-shrink-0 mt-0.5">
          <IconWarning className="w-full h-full" />
        </div>
        <div>
          <h4 className="font-bold text-warm text-lg mb-3">{t('impact.didYouKnow')}</h4>
          <p className="text-text-primary leading-relaxed text-base sm:text-lg">{text}</p>
        </div>
      </div>
    </motion.div>
  );
}

function StatSlide({ stat }) {
  const IconComponent = getIconComponent(stat.iconType || 'warning');

  switch (stat.type) {
    case 'percentage':
      return (
        <div className="flex items-center justify-center min-h-[300px]">
          <PercentageBar
            percentage={stat.value}
            iconType={stat.iconType || 'child'}
            label={stat.label}
            sublabel={stat.sublabel}
          />
        </div>
      );

    case 'multiplier':
      return (
        <div className="text-center flex flex-col items-center justify-center min-h-[300px]">
          <MultiplierCounter value={stat.value} label={stat.label} />
          {stat.comparison && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-text-muted mt-4 text-sm"
            >
              {stat.comparison}
            </motion.p>
          )}
        </div>
      );

    case 'ratio':
      return (
        <div className="flex items-center justify-center min-h-[300px]">
          <RatioComparison
            smallValue={stat.smallValue}
            smallLabel={stat.smallLabel}
            smallIconType={stat.smallIconType}
            bigValue={stat.bigValue}
            bigLabel={stat.bigLabel}
            bigIconType={stat.bigIconType}
            ratio={stat.ratio}
          />
        </div>
      );

    case 'count':
    case 'surface':
    case 'weight':
    case 'volume':
      return (
        <div className="text-center flex flex-col items-center justify-center min-h-[300px]">
          {/* Main value */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16" style={{ color: stat.color || 'var(--accent)' }}>
              <IconComponent className="w-full h-full" />
            </div>
            <div>
              <AnimatedCounter
                value={stat.value}
                suffix={stat.unit ? ` ${stat.unit}` : ''}
                className="text-4xl sm:text-5xl font-black text-warm"
              />
            </div>
          </div>

          {/* Label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-text-primary text-base sm:text-lg mb-6"
          >
            {stat.label}
          </motion.p>

          {/* Visual equivalence */}
          {stat.equivalence && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <EquivalenceGrid
                type={stat.equivalence.type}
                count={stat.equivalence.count}
                maxItems={200}
              />
            </motion.div>
          )}
        </div>
      );

    case 'grid':
      return (
        <div className="text-center flex flex-col items-center justify-center min-h-[300px]">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-text-primary text-base sm:text-lg mb-6"
          >
            {stat.label}
          </motion.p>
          <EquivalenceGrid
            type={stat.gridType}
            count={stat.count}
            maxItems={stat.maxItems || 200}
          />
        </div>
      );

    case 'accumulation':
      return (
        <div className="flex items-center justify-center min-h-[300px]">
          <AccumulationStack
            count={stat.count}
            iconType={stat.iconType}
            label={stat.label}
            perRow={stat.perRow || 10}
          />
        </div>
      );

    default:
      return (
        <div className="text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12" style={{ color: stat.color || 'var(--accent)' }}>
              <IconComponent className="w-full h-full" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-warm">
              {typeof stat.value === 'number'
                ? stat.value.toLocaleString('fr-FR')
                : stat.value
              }
              {stat.unit && (
                <span className="text-xl text-accent ml-2">{stat.unit}</span>
              )}
            </div>
          </div>
          <p className="text-text-primary">{stat.label}</p>
        </div>
      );
  }
}

export default ImpactRevealScreen;

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeCounter } from '../contexts/AppTimeContext';
import {
  EquivalenceGrid,
  RatioComparison,
  AccumulationStack
} from '../components/EquivalenceGrid';
import { AnimatedCounter, MultiplierCounter } from '../components/AnimatedCounter';
import { MapLeaflet } from '../components/MapLeaflet';
import { categories } from '../data/questions';
import { formatCoordinates } from '../utils/distance';
import { useTranslation } from '../i18n/I18nContext';

// Auto-advance interval in ms
const AUTO_ADVANCE_MS = 4000;

// Slide transition variants
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
  }),
};

/* Fiche d'impact, en relevé de terrain : l'étiquette du site reste fixe à gauche,
   les chiffres défilent à droite, la source est en note de bas de fiche. */
export function ImpactRevealScreen({
  question,
  questionIndex,
  totalQuestions,
  onContinue
}) {
  const { t, tContent, locale } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const autoAdvanceRef = useRef(null);

  const impact = question?.impact;
  const stats = impact?.stats || [];
  const realtime = impact?.realtime;
  const explanation = tContent(question, 'explanation');
  const source = tContent(question, 'source');
  const category = question ? categories[question.category] : null;

  // Étiquette du site : « Mine de Mutanda, RDC » → titre + région
  const [siteTitle, ...siteRest] = (tContent(question?.target, 'name') || '').split(', ');
  const siteRegion = siteRest.join(', ');
  const targetLat = question?.target?.lat;
  const targetLng = question?.target?.lng;
  const locatorTarget = useMemo(
    () => (targetLat != null ? { lat: targetLat, lng: targetLng } : null),
    [targetLat, targetLng]
  );

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
  const slide = slides[activeSlide];
  const showSourceCall = !!source && slide && slide.type !== 'explanation';

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
    <div className="h-screen flex flex-col bg-surface-0 paper-grain overflow-hidden">
      {/* En-tête de fiche */}
      <header className="flex-shrink-0 flex items-center gap-5 px-6 py-3.5 border-b border-text-primary font-mono text-xs uppercase tracking-wider text-text-secondary">
        <span className="text-text-primary font-semibold">{t('impact.sheet')}</span>
        {category && (
          <span className="flex items-center gap-2" style={{ color: category.color }}>
            <span className="w-2 h-2 rotate-45" style={{ backgroundColor: category.color }} />
            {t('categories.' + question.category)}
          </span>
        )}
        <span>{t('impact.questionProgress', { current: questionIndex + 1, total: totalQuestions })}</span>
        {totalSlides > 1 && (
          <span className="ml-auto flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => handleUserNav(() => goToSlide(i))}
                className={`h-[3px] w-6 cursor-pointer transition-colors ${i === activeSlide ? 'bg-text-primary' : 'bg-surface-3 hover:bg-text-muted'}`}
                aria-label={t('impact.slideOf', { current: i + 1, total: totalSlides })}
              />
            ))}
            <b className="text-text-primary ml-2 tabular-nums">{activeSlide + 1}/{totalSlides}</b>
          </span>
        )}
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[320px_1fr]">
        {/* Étiquette du site, fixe */}
        <aside className="hidden lg:flex flex-col border-r border-text-primary bg-surface-1 px-6 pt-6 pb-5 min-h-0">
          {category && (
            <div className="font-mono text-[11px] font-semibold uppercase tracking-widest" style={{ color: category.color }}>
              {t('categories.' + question.category)}
            </div>
          )}
          <h2 className="text-[30px] font-semibold leading-tight mt-2">{siteTitle}</h2>
          {siteRegion && <p className="font-serif italic text-lg text-text-secondary">{siteRegion}</p>}
          {locatorTarget && (
            <p className="font-mono text-[13px] mt-3">{formatCoordinates(locatorTarget.lat, locatorTarget.lng)}</p>
          )}
          {locatorTarget && (
            <div className="relative flex-1 min-h-[140px] mt-4 border border-text-primary">
              <MapLeaflet target={locatorTarget} targetZoom={4} interactive={false} height="100%" />
            </div>
          )}
        </aside>

        {/* Chiffres */}
        <main
          className="relative min-h-0 overflow-hidden contour-lines bg-no-repeat"
          style={{ backgroundPosition: 'right -60px bottom -80px' }}
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
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 flex items-center px-8 sm:px-14 py-8"
            >
              <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                <SlideContent slide={slide} t={t} locale={locale} sourceCall={showSourceCall} />
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Pied de fiche : source et navigation */}
      <footer className="flex-shrink-0 flex items-center gap-4 px-6 py-3 border-t border-text-primary">
        <p className="flex-1 font-mono text-[13px] text-text-primary min-w-0">
          {source && (
            <>
              <sup className="text-text-secondary mr-1">1</sup>
              {t('impact.sourceLabel')} {source}
            </>
          )}
        </p>
        {totalSlides > 1 && (
          <button
            onClick={() => handleUserNav(goPrev)}
            disabled={activeSlide === 0}
            className="px-4 py-2.5 font-semibold border border-text-primary hover:bg-surface-2 disabled:opacity-30 disabled:cursor-default cursor-pointer"
          >
            ← {t('common.previous')}
          </button>
        )}
        {isLastSlide ? (
          <button
            onClick={onContinue}
            className="px-6 py-2.5 font-semibold bg-accent hover:bg-accent-hover text-text-inverse cursor-pointer"
          >
            {t('impact.continue')} →
          </button>
        ) : (
          <button
            onClick={() => handleUserNav(goNext)}
            className="px-6 py-2.5 font-semibold bg-accent hover:bg-accent-hover text-text-inverse cursor-pointer"
          >
            {t('common.next')} →
          </button>
        )}
      </footer>
    </div>
  );
}

// ==================== SLIDE CONTENT DISPATCHER ====================

function SlideContent({ slide, t, locale, sourceCall }) {
  if (!slide) return null;

  switch (slide.type) {
    case 'realtime':
      return <RealtimeSlide realtime={slide.data} t={t} locale={locale} sourceCall={sourceCall} />;
    case 'stat':
      return <StatSlide stat={slide.data} locale={locale} sourceCall={sourceCall} />;
    case 'explanation':
      return <ExplanationSlide text={slide.data} t={t} />;
    default:
      return null;
  }
}

// ==================== ÉLÉMENTS DE FICHE ====================

// Grand chiffre à empattements, unité en mono, appel de note vers la source
function BigFigure({ children, unit, sourceCall }) {
  return (
    <div className="flex items-start font-serif font-extrabold text-accent leading-[0.85] tracking-[-0.035em] text-7xl sm:text-8xl xl:text-[9.5rem] tabular-nums">
      <span>{children}</span>
      {unit && <span className="font-mono font-medium text-2xl xl:text-3xl text-text-primary tracking-normal mt-3 ml-3">{unit}</span>}
      {sourceCall && <sup className="font-mono font-medium text-lg xl:text-xl text-text-secondary tracking-normal ml-1.5 mt-1">1</sup>}
    </div>
  );
}

function FigureLabel({ children }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="font-serif text-2xl xl:text-[30px] leading-snug mt-4 max-w-[26ch]"
    >
      {children}
    </motion.p>
  );
}

function FigureAside({ children, delay = 1.4 }) {
  if (!children) return null;
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="font-mono text-sm text-text-secondary mt-5"
    >
      <span className="text-accent">→ </span>{children}
    </motion.p>
  );
}

// Carotte de sondage : 50 segments, la part en rouille, le reste hachuré
function CoreSample({ percentage, locale }) {
  const SEGMENTS = 50;
  const filled = Math.round((Math.min(100, Math.max(0, percentage)) / 100) * SEGMENTS);
  const fmt = (n) => n.toLocaleString(locale, { maximumFractionDigits: 1 });
  return (
    <div className="mt-7 max-w-[640px]">
      <div className="grid gap-[2px] h-9" style={{ gridTemplateColumns: `repeat(${SEGMENTS}, minmax(0, 1fr))` }}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <motion.i
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.018 }}
            className={i < filled ? 'bg-accent' : 'border border-text-muted'}
            style={i < filled ? undefined : { backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 3px, color-mix(in srgb, var(--text-secondary) 30%, transparent) 3px 4px)' }}
          />
        ))}
      </div>
      <div className="flex justify-between font-mono text-xs text-text-secondary mt-2">
        <span><b className="text-text-primary">{fmt(percentage)} %</b></span>
        <span><b className="text-text-primary">{fmt(100 - percentage)} %</b></span>
      </div>
    </div>
  );
}

// Règle graduée qui se remplit pendant que le compteur monte
function Ruler({ duration = 2 }) {
  return (
    <div className="mt-7 max-w-[640px]">
      <div
        className="relative h-9 border-x border-text-primary"
        style={{
          background: 'linear-gradient(var(--text-primary), var(--text-primary)) bottom / 100% 1px no-repeat, repeating-linear-gradient(90deg, var(--text-primary) 0 1px, transparent 1px 10%) bottom / 100% 10px no-repeat'
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration, ease: [0.2, 0.7, 0.2, 1] }}
          className="absolute left-0 bottom-0 h-[18px] bg-accent"
        />
      </div>
    </div>
  );
}

// ==================== SLIDE TYPES ====================

function RealtimeSlide({ realtime, t, locale, sourceCall }) {
  const count = useRealtimeCounter(realtime.rate, true);

  return (
    <div>
      <div className="font-mono text-xs uppercase tracking-widest text-danger mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
        {t('impact.sinceStart')}
      </div>
      <BigFigure unit={realtime.unit} sourceCall={sourceCall}>
        {count.toLocaleString(locale)}
      </BigFigure>
      <FigureLabel>{realtime.label}</FigureLabel>
      <FigureAside delay={1}>
        {t('impact.atRate', {
          rate: realtime.rate.toLocaleString(locale),
          unit: realtime.unit,
          per: realtime.per || t('time.perSecond')
        })}
      </FigureAside>
    </div>
  );
}

function ExplanationSlide({ text, t }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="font-mono text-xs font-semibold uppercase tracking-widest text-accent mb-4">{t('impact.didYouKnow')}</div>
      <p className="font-serif text-2xl xl:text-[32px] leading-snug max-w-[34ch]">{text}</p>
    </motion.div>
  );
}

function StatSlide({ stat, locale, sourceCall }) {
  switch (stat.type) {
    case 'percentage':
      return (
        <div>
          <BigFigure unit="%" sourceCall={sourceCall}>
            <AnimatedCounter value={stat.value} duration={1600} />
          </BigFigure>
          <FigureLabel>{stat.label}</FigureLabel>
          <CoreSample percentage={stat.value} locale={locale} />
          <FigureAside>{stat.sublabel}</FigureAside>
        </div>
      );

    case 'count':
    case 'surface':
    case 'weight':
    case 'volume':
      return (
        <div>
          <BigFigure unit={stat.unit} sourceCall={sourceCall}>
            <AnimatedCounter value={stat.value} duration={2000} />
          </BigFigure>
          <FigureLabel>{stat.label}</FigureLabel>
          {stat.equivalence ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-6"
            >
              <EquivalenceGrid
                type={stat.equivalence.type}
                count={stat.equivalence.count}
                maxItems={200}
              />
            </motion.div>
          ) : (
            <Ruler />
          )}
          <FigureAside delay={2}>{stat.sublabel}</FigureAside>
        </div>
      );

    case 'multiplier':
      return (
        <div>
          <MultiplierCounter value={stat.value} label={stat.label} />
          <FigureAside delay={1.5}>{stat.comparison}</FigureAside>
        </div>
      );

    case 'ratio':
      return (
        <RatioComparison
          smallValue={stat.smallValue}
          smallLabel={stat.smallLabel}
          smallIconType={stat.smallIconType}
          bigValue={stat.bigValue}
          bigLabel={stat.bigLabel}
          bigIconType={stat.bigIconType}
          ratio={stat.ratio}
        />
      );

    case 'grid':
      return (
        <div>
          <FigureLabel>{stat.label}</FigureLabel>
          <div className="mt-6">
            <EquivalenceGrid
              type={stat.gridType}
              count={stat.count}
              maxItems={stat.maxItems || 200}
            />
          </div>
        </div>
      );

    case 'accumulation':
      return (
        <AccumulationStack
          count={stat.count}
          iconType={stat.iconType}
          label={stat.label}
          perRow={stat.perRow || 10}
        />
      );

    default:
      return (
        <div>
          <BigFigure unit={stat.unit} sourceCall={sourceCall}>
            {typeof stat.value === 'number' ? stat.value.toLocaleString(locale) : stat.value}
          </BigFigure>
          <FigureLabel>{stat.label}</FigureLabel>
        </div>
      );
  }
}

export default ImpactRevealScreen;

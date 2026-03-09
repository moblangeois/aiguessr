import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n/I18nContext';

/* ──────────────────────────────────────────────
   Item definitions (id + construct + i18n key)
   ────────────────────────────────────────────── */

const CORE_ITEMS = [
  { id: 'mat1', construct: 'materiality', i18nKey: 'locate' },
  { id: 'mat2', construct: 'materiality', i18nKey: 'name' },
  { id: 'mat3', construct: 'materiality', i18nKey: 'consequences' },
  { id: 'imp1', construct: 'impacts',     i18nKey: 'supply' },
  { id: 'imp2', construct: 'impacts',     i18nKey: 'geopolitical' },
  { id: 'eff1', construct: 'efficacy',    i18nKey: 'question' },
  { id: 'eff2', construct: 'efficacy',    i18nKey: 'inform' },
];

const SATISFACTION_ITEMS = [
  { id: 'sat1', construct: 'satisfaction', i18nKey: 'gameUseful' },
  { id: 'sat2', construct: 'satisfaction', i18nKey: 'wouldRecommend' },
  { id: 'sat3', construct: 'satisfaction', i18nKey: 'engagement' },
];

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */

/** Split an array into chunks of `size` */
function chunk(arr, size) {
  const pages = [];
  for (let i = 0; i < arr.length; i += size) {
    pages.push(arr.slice(i, i + size));
  }
  return pages;
}

/* ──────────────────────────────────────────────
   LikertItem — single Likert scale row
   ────────────────────────────────────────────── */

function LikertItem({ label, value, onChange, t }) {
  const options = [1, 2, 3, 4, 5];

  return (
    <div className="rounded-2xl bg-surface-1 border border-border-subtle p-5">
      <p className="text-text-primary text-sm font-medium mb-4 leading-relaxed">
        {label}
      </p>
      <div className="flex gap-2 justify-center">
        {options.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all text-xs min-w-[56px] cursor-pointer ${
              value === v
                ? 'bg-accent text-text-inverse shadow-lg scale-105'
                : 'bg-surface-2 text-text-muted hover:bg-surface-3 border border-border-subtle'
            }`}
          >
            <span className="font-bold text-base">{v}</span>
            <span className="leading-tight">
              {t(`questionnaire.likert${v}`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   ProgressBar
   ────────────────────────────────────────────── */

function ProgressBar({ current, total }) {
  const pct = ((current + 1) / total) * 100;

  return (
    <div className="w-full">
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Step animation variants
   ────────────────────────────────────────────── */

const stepVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 120 : -120,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir) => ({
    x: dir > 0 ? -120 : 120,
    opacity: 0,
  }),
};

/* ──────────────────────────────────────────────
   QuestionnaireScreen  (wizard / stepper)
   ────────────────────────────────────────────── */

export function QuestionnaireScreen({ phase, onSubmit }) {
  const { t } = useTranslation();
  const isPre = phase === 'pre';

  /* --- build item list & pages ------------------------------------ */
  const allItems = useMemo(
    () => (isPre ? CORE_ITEMS : [...CORE_ITEMS, ...SATISFACTION_ITEMS]),
    [isPre],
  );

  // Pre: 7 items  -> pages of 2 -> 4 pages (2+2+2+1)
  // Post: 10 items -> pages of 2 -> 5 pages (2+2+2+2+2)
  // Post also gets an extra "open question" page at the end
  const likertPages = useMemo(() => chunk(allItems, 2), [allItems]);
  const totalPages = isPre ? likertPages.length : likertPages.length + 1;

  /* --- state ------------------------------------------------------ */
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [responses, setResponses] = useState({});
  const [openResponse, setOpenResponse] = useState('');

  const isLastStep = step === totalPages - 1;
  const isOpenQuestionStep = !isPre && step === likertPages.length;

  /* --- handlers --------------------------------------------------- */
  const handleChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const goNext = () => {
    if (isLastStep) return;
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goPrev = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    onSubmit({
      phase,
      timestamp: new Date().toISOString(),
      responses,
      ...(isPre ? {} : { openResponse }),
    });
  };

  /* --- can advance? ----------------------------------------------- */
  const currentPageItems = isOpenQuestionStep ? [] : (likertPages[step] || []);
  const currentPageComplete = currentPageItems.every(
    (item) => responses[item.id] != null,
  );
  const allAnswered = allItems.every((item) => responses[item.id] != null);
  const canSubmit = isPre ? allAnswered : allAnswered; // open question is optional

  /* --- render ----------------------------------------------------- */
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface-0">
      {/* ── Header ── */}
      <div className="shrink-0 px-6 pt-6 pb-4 space-y-3">
        {/* Phase badge + title */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-warm-light text-warm rounded-full text-sm font-bold mb-2">
            {isPre
              ? t('questionnaire.prePhase')
              : t('questionnaire.postPhase')}
          </span>
          <h2 className="text-2xl font-black text-text-primary">
            {isPre
              ? t('questionnaire.preSurveyTitle')
              : t('questionnaire.postSurveyTitle')}
          </h2>
          <p className="text-text-muted text-sm mt-1">
            {isPre
              ? t('questionnaire.rateLevel')
              : t('questionnaire.rateLevelAndFeedback')}
          </p>
        </div>

        {/* Progress bar + step label */}
        <ProgressBar current={step} total={totalPages} />
        <p className="text-text-muted text-xs text-center">
          {t('questionnaire.stepOf', {
            current: step + 1,
            total: totalPages,
          })}
        </p>
      </div>

      {/* ── Divider ── */}
      <div className="shrink-0 h-px bg-border mx-6" />

      {/* ── Step content (animated) ── */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-6 py-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full max-w-xl space-y-4"
          >
            {isOpenQuestionStep ? (
              /* ── Open question page (post only) ── */
              <div className="rounded-2xl bg-surface-1 border border-border-subtle p-5 space-y-3">
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider">
                  {t('questionnaire.openQuestion')}
                </h3>
                <p className="text-text-primary text-sm font-medium leading-relaxed">
                  {t('questionnaire.openQuestionLabel')}
                </p>
                <textarea
                  value={openResponse}
                  onChange={(e) => setOpenResponse(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-surface-2 border-2 border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
                  placeholder={t('questionnaire.openQuestionPlaceholder')}
                />
              </div>
            ) : (
              /* ── Likert items for current page ── */
              currentPageItems.map((item) => {
                // Determine construct label for the first item of each construct group on this page
                const constructKey = `questionnaire.constructs.${item.construct}`;
                const isFirstOfConstruct =
                  currentPageItems.indexOf(item) === 0 ||
                  currentPageItems[currentPageItems.indexOf(item) - 1]
                    ?.construct !== item.construct;

                return (
                  <div key={item.id}>
                    {isFirstOfConstruct && (
                      <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                        {t(constructKey)}
                      </h3>
                    )}
                    <LikertItem
                      label={t(`questionnaire.items.${item.i18nKey}`)}
                      value={responses[item.id]}
                      onChange={(v) => handleChange(item.id, v)}
                      t={t}
                    />
                  </div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Footer: navigation + progress count ── */}
      <div className="shrink-0 px-6 pb-6 pt-2 space-y-3">
        <div className="flex gap-3">
          {/* Previous */}
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 0}
            className={`flex-1 py-3 font-bold text-base rounded-xl transition-all border ${
              step === 0
                ? 'border-border-subtle text-text-muted cursor-not-allowed'
                : 'border-border text-text-primary hover:bg-surface-2 active:scale-[0.98]'
            }`}
          >
            {t('common.previous')}
          </button>

          {/* Next / Submit */}
          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex-1 py-3 font-black text-base rounded-xl transition-all ${
                canSubmit
                  ? 'bg-accent hover:bg-accent-hover text-text-inverse shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-surface-2 text-text-muted cursor-not-allowed shadow-none'
              }`}
            >
              {isPre
                ? t('questionnaire.startGame')
                : t('questionnaire.finish')}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!currentPageComplete}
              className={`flex-1 py-3 font-bold text-base rounded-xl transition-all ${
                currentPageComplete
                  ? 'bg-accent hover:bg-accent-hover text-text-inverse shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-surface-2 text-text-muted cursor-not-allowed shadow-none'
              }`}
            >
              {t('common.next')}
            </button>
          )}
        </div>

        {/* Progress count */}
        <p className="text-center text-text-muted text-xs">
          {allAnswered
            ? t('questionnaire.progress', {
                count: Object.keys(responses).length,
                total: allItems.length,
              })
            : `${t('questionnaire.progress', {
                count: Object.keys(responses).length,
                total: allItems.length,
              })} ${t('questionnaire.answerAll')}`}
        </p>
      </div>
    </div>
  );
}

export default QuestionnaireScreen;

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameGlobe, GROUP_COLORS } from '../components/Globe3D';
import { Timer } from '../components/Timer';
import { categories } from '../data/questions';
import { QuestionProgressDots } from '../components/ProgressBar';
import { useTranslation } from '../i18n/I18nContext';

export function ResearchScreen({
  question,
  questionIndex,
  totalQuestions,
  timerDuration,
  isPaused,
  onTogglePause,
  onTimeUp,
  onShowRecap,
  onGoToAnswers,
  onSkipToFinal,
  currentHintLevel = 0,
  onUseHint = null,
  groups,
  questions,
  answers,
  onTimerTick
}) {
  const { t, tContent } = useTranslation();
  const [showQuestion, setShowQuestion] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [showHistorical, setShowHistorical] = useState(true);

  useEffect(() => {
    setShowQuestion(false);
    const timer = setTimeout(() => setShowQuestion(true), 100);
    return () => clearTimeout(timer);
  }, [questionIndex]);

  const category = question ? categories[question.category] : null;

  // Nombre de questions restantes
  const questionsRemaining = totalQuestions - questionIndex - 1;

  // Calculer les marqueurs historiques (questions précédentes)
  const historicalMarkers = useMemo(() => {
    const markers = [];
    if (!questions || !answers || !groups) return markers;

    questions.slice(0, questionIndex).forEach((q, qIdx) => {
      const qAnswers = answers[q.id];
      if (qAnswers) {
        Object.entries(qAnswers).forEach(([groupName, data]) => {
          const groupIdx = groups.indexOf(groupName);
          markers.push({
            lat: data.lat,
            lng: data.lng,
            groupName,
            questionId: q.id,
            questionIndex: qIdx + 1,
            questionName: tContent(q.target, 'name') || `Question ${qIdx + 1}`,
            distance: data.distance,
            color: GROUP_COLORS[groupIdx >= 0 ? groupIdx : 0],
            category: q.category
          });
        });
      }
    });
    return markers;
  }, [questions, questionIndex, answers, groups]);

  return (
    <div className="h-screen flex flex-col bg-surface-0">
      {/* Header compact */}
      <div className="flex-shrink-0 bg-surface-1 border-b border-border px-4 py-3 shadow-sm">
        <div className="max-w-full mx-auto">
          <div className="flex items-center justify-between mb-2">
            {/* Gauche: Question, catégorie, dots */}
            <div className="flex items-center gap-3">
              <div className="bg-accent text-text-primary px-4 py-1.5 rounded-xl font-black text-base md:text-lg shadow-lg">
                Q{questionIndex + 1}/{totalQuestions}
              </div>
              {category && (
                <div
                  className="px-3 py-1.5 rounded-xl text-text-primary font-medium flex items-center gap-2 text-sm md:text-base"
                  style={{ backgroundColor: category.color + '40', borderColor: category.color, borderWidth: 2 }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {t('categories.' + question.category)}
                </div>
              )}
              <QuestionProgressDots
                current={questionIndex}
                total={totalQuestions}
                answers={answers}
              />
            </div>

            {/* Droite: Timer et actions */}
            <div className="flex items-center gap-3">
              <Timer
                duration={timerDuration}
                isPaused={isPaused}
                onTimeUp={onTimeUp}
                onTick={onTimerTick}
              />

              <button
                onClick={onTogglePause}
                className="w-11 h-11 bg-surface-2 hover:bg-surface-2/80 text-text-secondary rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg border border-border"
                title={isPaused ? t('common.resume') : t('common.pause')}
              >
                {isPaused ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Question avec animation — grande taille pour projection */}
          <div className={`transition-all duration-500 ${showQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-xl md:text-2xl lg:text-3xl text-text-primary font-bold leading-relaxed">
              {tContent(question, 'question')}
            </h2>
          </div>
        </div>
      </div>

      {/* Contenu principal — globe pleine largeur */}
      <div className="flex-1 relative">
        <GameGlobe
          clickDisabled={true}
          center={[20, 0]}
          zoom={2}
          historicalMarkers={historicalMarkers}
          showHistorical={showHistorical}
          showSearch={true}
          preserveView={true}
        />

        {/* Badge "Phase de recherche" — petit, en haut */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-accent/80 backdrop-blur-sm text-text-primary px-4 py-1.5 rounded-lg shadow-lg font-medium text-sm md:text-base">
          {t('research.phaseTitle')}
        </div>

        {/* Overlay pause */}
        {isPaused && (
          <div className="absolute inset-0 bg-surface-0/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center bg-surface-1/80 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-border">
              <p className="text-4xl text-text-primary font-black mb-6">{t('common.pause').toUpperCase()}</p>
              <button
                onClick={onTogglePause}
                className="px-10 py-4 bg-accent hover:bg-accent/80 text-text-primary font-bold text-lg rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
              >
                {t('common.resume')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-surface-1 border-t border-border p-4 shadow-lg">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setShowSkipConfirm(true)}
            className="px-6 py-3 bg-surface-2 hover:bg-danger/10 text-text-muted hover:text-danger font-medium rounded-xl transition-all duration-200 border border-border hover:border-danger/30 text-base"
          >
            {t('research.endGame')}
          </button>
          <button
            onClick={onGoToAnswers}
            className="px-12 py-4 bg-warm hover:bg-warm/80 text-text-primary font-black text-lg rounded-xl transition-all duration-200 hover:scale-105 shadow-xl shadow-warm/30"
          >
            {t('research.goToAnswers')}
          </button>
        </div>
      </div>

      {/* Modal de confirmation pour skip */}
      <AnimatePresence>
        {showSkipConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-surface-0/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface-1/80 backdrop-blur-sm rounded-3xl w-full max-w-md shadow-2xl border border-danger/30 p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-text-primary mb-2">{t('research.endGameTitle')}</h3>
                <p className="text-text-secondary mb-6 text-base">
                  {t('research.endGameMessage', { count: questionsRemaining + 1 })}
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowSkipConfirm(false)}
                    className="flex-1 px-6 py-3 bg-surface-2 hover:bg-surface-2/80 text-text-secondary font-bold rounded-xl transition-all border border-border"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={() => {
                      setShowSkipConfirm(false);
                      onSkipToFinal();
                    }}
                    className="flex-1 px-6 py-3 bg-danger hover:bg-danger/80 text-text-primary font-bold rounded-xl transition-all"
                  >
                    {t('common.end')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ResearchScreen;

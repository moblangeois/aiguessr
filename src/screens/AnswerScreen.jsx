import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameGlobe, GROUP_COLORS } from '../components/Globe3D';
import { categories } from '../data/questions';
import { useTranslation } from '../i18n/I18nContext';

// Fonction pour formater le temps
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AnswerScreen({
  question,
  questionIndex,
  totalQuestions,
  currentGroup,
  remainingGroups,
  groupIndex,
  totalGroups,
  onSubmitAnswer,
  onNextGroup,
  onShowRecap,
  onSkipToFinal,
  groups,
  scores,
  timeRemaining = 0,
  groupOrder = []
}) {
  const { t, tContent } = useTranslation();
  const [marker, setMarker] = useState(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentGroup]);

  const handleMapClick = (lat, lng) => {
    setMarker({ lat, lng });
  };

  const handleValidate = () => {
    if (marker) {
      onSubmitAnswer(currentGroup, marker.lat, marker.lng);
    }
    setMarker(null);
    onNextGroup();
  };

  const handleSkip = () => {
    setMarker(null);
    onNextGroup();
  };

  const handleCancelMarker = () => {
    setMarker(null);
  };

  const markers = marker
    ? [{ lat: marker.lat, lng: marker.lng, groupName: currentGroup, color: GROUP_COLORS[groupIndex] }]
    : [];

  const category = question ? categories[question.category] : null;

  // Nombre de questions restantes
  const questionsRemaining = totalQuestions - questionIndex - 1;

  // Progression des groupes pour cette question
  const groupsProgress = groupIndex + 1;

  return (
    <div className="h-screen flex flex-col bg-surface-0 overflow-hidden">
      {/* Header compact */}
      <div className={`flex-shrink-0 bg-surface-1 border-b border-border px-4 py-3 shadow-sm transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-[-20px]' : 'opacity-100 translate-y-0'}`}>
        <div className="flex items-center justify-between">
          {/* Left: Question number + Category + Team progress */}
          <div className="flex items-center gap-3">
            <div className="bg-accent text-text-inverse px-4 py-2 rounded-lg font-bold text-xl md:text-2xl">
              Q{questionIndex + 1}/{totalQuestions}
            </div>
            {category && (
              <div
                className="px-3 py-1.5 rounded-lg text-text-inverse font-medium text-base flex items-center gap-2"
                style={{ backgroundColor: category.color + '40', borderColor: category.color, borderWidth: 2 }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {tContent(category, 'name')}
              </div>
            )}
            <div className="bg-surface-2 px-3 py-1.5 rounded-lg">
              <span className="text-accent font-medium text-base">
                {t('answer.teamProgress', { current: groupsProgress, total: totalGroups })}
              </span>
            </div>
          </div>

          {/* Center: Current group name (large) */}
          <div className={`flex items-center gap-3 transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            <span className="text-text-muted text-lg">{t('answer.yourTurn')}</span>
            <span
              className="px-6 py-2 rounded-xl text-text-inverse font-bold text-2xl md:text-3xl shadow-lg animate-pulse"
              style={{ backgroundColor: GROUP_COLORS[groupIndex] }}
            >
              {currentGroup}
            </span>
            {/* Next groups inline */}
            {remainingGroups.length > 0 && (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-text-muted text-sm">{t('answer.next')}</span>
                <div className="flex gap-1.5">
                  {remainingGroups.map((group) => {
                    const realIdx = groups?.indexOf(group) ?? 0;
                    return (
                      <span
                        key={group}
                        className="px-2.5 py-1 rounded-lg text-text-inverse text-sm flex items-center gap-1.5"
                        style={{ backgroundColor: GROUP_COLORS[realIdx] + '90' }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: GROUP_COLORS[realIdx] }}
                        />
                        {group}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Timer */}
          <div className="flex items-center gap-3">
            {timeRemaining > 0 && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
                timeRemaining <= 10
                  ? 'bg-danger-light text-danger border-2 border-danger/30 animate-pulse'
                  : timeRemaining <= 30
                  ? 'bg-warm-light text-warm border-2 border-warm/30'
                  : 'bg-accent-light text-accent border-2 border-accent/30'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question text bar */}
      <div className="flex-shrink-0 bg-surface-1/80 border-b border-border px-6 py-3">
        <div className="text-text-secondary font-medium text-xl md:text-2xl text-center leading-relaxed">
          {tContent(question, 'question')}
        </div>
      </div>

      {/* Main content: full-width map with overlays */}
      <div className="flex-1 relative overflow-hidden">
        <GameGlobe
          markers={markers}
          onMapClick={handleMapClick}
          center={[20, 0]}
          zoom={2}
          showSearch={true}
          preserveView={true}
        />

        {/* Map instruction overlay (top center) */}
        {marker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-accent text-text-inverse px-6 py-3 rounded-xl shadow-2xl font-medium text-lg animate-bounce z-10"
          >
            {t('answer.markerPlaced')}
          </motion.div>
        )}
        {!marker && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-warm/90 backdrop-blur-sm text-text-inverse px-6 py-3 rounded-xl shadow-2xl font-medium text-lg z-10">
            {t('answer.clickToPlace')}
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-surface-1 border-t border-border p-4 shadow-lg">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setShowSkipConfirm(true)}
            className="px-5 py-3 bg-surface-2 hover:bg-danger-light text-text-muted hover:text-danger font-medium rounded-xl transition-all duration-200 border border-border hover:border-danger/30"
          >
            {t('answer.endGame')}
          </button>

          {marker && (
            <button
              onClick={handleCancelMarker}
              className="px-6 py-3 bg-surface-2 hover:bg-surface-3 text-text-secondary font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg border border-border"
            >
              {t('answer.cancelMarker')}
            </button>
          )}

          <button
            onClick={handleValidate}
            disabled={!marker}
            className={`px-10 py-4 font-bold text-lg rounded-xl transition-all duration-200 shadow-lg ${
              marker
                ? 'bg-accent hover:bg-accent-hover text-text-inverse hover:scale-105'
                : 'bg-surface-2 text-text-muted cursor-not-allowed opacity-50'
            }`}
          >
            {t('answer.submitAnswer')}
          </button>

          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-warm hover:bg-warm-hover text-text-inverse font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            {t('answer.skipTeam')}
          </button>
        </div>
      </div>

      {/* Modal de confirmation pour terminer */}
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
              className="bg-surface-1 backdrop-blur-sm rounded-3xl w-full max-w-md shadow-2xl border border-danger/30 p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-danger-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-text-primary mb-2">{t('answer.endGameTitle')}</h3>
                <p className="text-text-muted mb-6">
                  {t('answer.endGameQuestionsLeft', { questions: questionsRemaining + 1 })}
                  {' '}{t('answer.endGameTeamsLeft', { teams: remainingGroups.length + 1 })}
                  <br /><br />
                  {t('answer.endGameSkip')}
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowSkipConfirm(false)}
                    className="flex-1 px-6 py-3 bg-surface-2 hover:bg-surface-3 text-text-secondary font-bold rounded-xl transition-all border border-border"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={() => {
                      setShowSkipConfirm(false);
                      onSkipToFinal();
                    }}
                    className="flex-1 px-6 py-3 bg-danger hover:bg-danger/80 text-text-inverse font-bold rounded-xl transition-all"
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

export default AnswerScreen;

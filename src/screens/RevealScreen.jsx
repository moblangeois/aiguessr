import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameGlobe, GROUP_COLORS } from '../components/Globe3D';
import { useTranslation } from '../i18n/I18nContext';

export function RevealScreen({
  question,
  questionIndex,
  totalQuestions,
  results,
  groups,
  onShowRecap,
  onShowRanking,
  onNextQuestion,
  isLastQuestion
}) {
  const { t, tContent } = useTranslation();
  const [revealedCount, setRevealedCount] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showWinner, setShowWinner] = useState(false);

  // Animation de revelation progressive
  useEffect(() => {
    setRevealedCount(0);
    setShowExplanation(false);
    setShowWinner(false);

    const timer = setInterval(() => {
      setRevealedCount(prev => {
        if (prev >= results.length) {
          clearInterval(timer);
          setTimeout(() => setShowExplanation(true), 500);
          setTimeout(() => setShowWinner(true), 800);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [results.length]);

  const markers = useMemo(() => {
    return results.slice(0, revealedCount).map((result, index) => {
      const groupIdx = groups.indexOf(result.groupName);
      return {
        lat: result.lat,
        lng: result.lng,
        groupName: result.groupName,
        distance: result.distance,
        points: result.points,
        color: GROUP_COLORS[groupIdx >= 0 ? groupIdx : index]
      };
    });
  }, [results, groups, revealedCount]);

  // Trier les resultats par distance (meilleur en premier)
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => a.distance - b.distance);
  }, [results]);

  // Trier par distance decroissante pour révéler du pire au meilleur
  const sortedResultsReverse = useMemo(() => {
    return [...results].sort((a, b) => b.distance - a.distance);
  }, [results]);

  return (
    <div className="h-screen flex flex-col bg-surface-0 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-shrink-0 bg-surface-1 border-b border-border px-6 py-3 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="bg-warm text-text-inverse px-5 py-2 rounded-xl font-black text-xl shadow-lg shadow-warm/30"
            >
              {t('reveal.title')}
            </motion.div>
            <span className="text-text-muted text-lg">
              {t('reveal.questionProgress', { current: questionIndex + 1, total: totalQuestions })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Carte pleine largeur avec overlays */}
      <div className="flex-1 relative overflow-hidden">
        <GameGlobe
          markers={markers}
          targetZone={question?.target}
          showTarget={true}
          showDistanceLines={true}
          clickDisabled={true}
          center={[question?.target?.lat || 20, question?.target?.lng || 0]}
          zoom={4}
          showSearch={true}
          preserveView={false}
          showLegend={false}
        />

        {/* Badge zone cible - top center */}
        <motion.div
          initial={{ y: -20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-accent text-text-inverse px-6 py-3 rounded-xl shadow-2xl shadow-accent/40 font-bold text-lg z-10"
        >
          {tContent(question?.target, 'name')}
        </motion.div>

        {/* Panel des résultats - overlay à droite */}
        <div className="absolute top-4 right-4 w-72 max-h-[calc(100%-2rem)] overflow-y-auto overflow-x-hidden z-10">
          {/* Barre de progression */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-0/85 backdrop-blur-md rounded-xl border border-border shadow-xl p-3 mb-2"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(revealedCount / results.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-accent to-warm rounded-full"
                />
              </div>
              <span className="text-accent text-sm font-medium whitespace-nowrap">
                {t('reveal.progressCount', { revealed: revealedCount, total: results.length })}
              </span>
            </div>
          </motion.div>

          {/* Résultats par groupe */}
          <div className="space-y-2">
            <AnimatePresence>
              {sortedResultsReverse.slice(0, revealedCount).map((result, displayIndex) => {
                const groupIdx = groups.indexOf(result.groupName);
                const actualRank = sortedResults.findIndex(r => r.groupName === result.groupName) + 1;
                const isFirst = actualRank === 1;
                const isLast = displayIndex === revealedCount - 1;

                return (
                  <motion.div
                    key={result.groupName}
                    initial={{ x: 50, opacity: 0, scale: 0.8 }}
                    animate={{
                      x: 0,
                      opacity: 1,
                      scale: isLast ? 1.02 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                    className={`rounded-xl p-3 backdrop-blur-md shadow-lg ${
                      isFirst
                        ? 'bg-warm/15 border-2 border-warm/50 shadow-warm/20'
                        : isLast
                          ? 'bg-surface-0/85 border-2 border-accent/30'
                          : 'bg-surface-0/85 border border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1, type: "spring" }}
                          className={`text-xl font-black ${isFirst ? 'text-warm' : 'text-accent'}`}
                        >
                          #{actualRank}
                        </motion.span>
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-lg flex-shrink-0"
                          style={{ backgroundColor: GROUP_COLORS[groupIdx >= 0 ? groupIdx : displayIndex] }}
                        />
                        <span className="text-text-primary font-bold text-lg">{result.groupName}</span>
                        {isFirst && (
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring" }}
                          >
                            🏆
                          </motion.span>
                        )}
                      </div>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.15, type: "spring" }}
                        className={`font-black text-lg ${isFirst ? 'text-warm' : 'text-accent'}`}
                      >
                        +{result.points} {t('common.pts')}
                      </motion.span>
                    </div>
                    <div className="text-text-muted mt-1 flex items-center gap-2 text-base">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{t('reveal.fromTarget', { distance: result.distance })}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {results.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-surface-0/85 backdrop-blur-md rounded-xl border border-border p-4"
              >
                <p className="text-text-muted text-center text-lg">
                  {t('reveal.noAnswers')}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Indicateur du gagnant de la question - bottom center */}
        <AnimatePresence>
          {showWinner && sortedResults.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface-0/80 backdrop-blur-sm border border-border text-text-secondary px-6 py-3 rounded-xl shadow-lg z-10"
            >
              <div className="flex items-center gap-3 text-base">
                <span className="text-warm font-medium">{t('reveal.bestAnswer')}</span>
                <span className="font-bold text-text-primary text-lg">{sortedResults[0].groupName}</span>
                <span className="text-accent font-bold text-lg">+{sortedResults[0].points} {t('common.pts')}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer avec explication + boutons */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex-shrink-0 bg-surface-1 border-t border-border px-6 py-3 shadow-lg"
      >
        <div className="flex items-center gap-6">
          {/* Explication "Le saviez-vous ?" */}
          <div className="flex-1 min-w-0">
            <AnimatePresence>
              {tContent(question, 'explanation') && showExplanation && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 150 }}
                  className="flex items-start gap-3 bg-warm/10 border border-warm/30 rounded-xl px-4 py-3"
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">💡</span>
                  <div className="min-w-0">
                    <span className="font-bold text-warm text-base">{t('reveal.didYouKnow')}</span>
                    <p className="text-text-secondary text-sm leading-relaxed mt-0.5 line-clamp-2">{tContent(question, 'explanation')}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShowRanking}
              className="px-6 py-3 bg-surface-2 hover:bg-surface-2/80 text-text-secondary font-bold rounded-xl transition-colors duration-200 shadow-lg border border-border"
            >
              {t('reveal.viewRankings')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNextQuestion}
              className="px-8 py-3 bg-accent hover:bg-accent/90 text-text-inverse font-black text-lg rounded-xl transition-colors duration-200 shadow-xl shadow-accent/30"
            >
              {isLastQuestion ? t('reveal.viewFinalResults') : t('reveal.nextQuestion')}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default RevealScreen;

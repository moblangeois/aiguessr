import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameGlobe } from '../components/Globe3D';
import { getTeamColor } from '../data/teamColors';
import { useTranslation } from '../i18n/I18nContext';
import { categories } from '../data/questions';

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
  const { t, tContent, locale } = useTranslation();
  const category = question ? categories[question.category] : null;
  const formatKm = (km) => Number(km).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 0 });
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
        color: getTeamColor(groupIdx >= 0 ? groupIdx : index)
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
      {/* En-tête : catégorie, progression et question posée */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-shrink-0 bg-surface-0 border-b border-border pl-6 pr-48 py-3 shadow-sm"
      >
        <div className="flex items-center gap-4 text-base">
          <span className="font-bold text-warm">{t('reveal.title')}</span>
          {category && (
            <span className="flex items-center gap-2 font-semibold text-text-secondary">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
              {t('categories.' + question.category)}
            </span>
          )}
          <span className="text-text-secondary font-semibold tabular-nums">
            {t('reveal.questionProgress', { current: questionIndex + 1, total: totalQuestions })}
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-text-primary leading-tight">
          {tContent(question, 'question')}
        </h1>
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

        {/* Badge lieu réel - top center */}
        <motion.div
          initial={{ y: -20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-surface-0 rounded-xl shadow-2xl border border-border pl-4 pr-6 py-2.5 z-10 flex items-center gap-3"
          style={{ borderLeft: `6px solid ${category?.color || 'var(--accent)'}` }}
        >
          <svg className="w-7 h-7 flex-shrink-0 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" strokeWidth={2} />
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
            <path strokeLinecap="round" strokeWidth={2} d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" />
          </svg>
          <div>
            <div className="text-xs font-semibold text-text-secondary leading-none mb-1">{t('reveal.correctLocation')}</div>
            <div className="text-2xl font-extrabold text-text-primary leading-none">{tContent(question?.target, 'name')}</div>
          </div>
        </motion.div>

        {/* Panneau des résultats - overlay à droite */}
        <div className="absolute top-4 right-4 w-[26rem] max-h-[calc(100%-2rem)] overflow-y-auto overflow-x-hidden z-10">
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-0/95 backdrop-blur-md rounded-2xl border border-border shadow-xl p-4"
          >
            {/* Titre + progression */}
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-bold text-text-primary">{t('reveal.results')}</h2>
              <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${results.length ? (revealedCount / results.length) * 100 : 0}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
              <span className="text-text-secondary text-sm font-semibold tabular-nums whitespace-nowrap">
                {t('reveal.progressCount', { revealed: Math.min(revealedCount, results.length), total: results.length })}
              </span>
            </div>

            {/* Résultats par équipe, du plus loin au plus proche */}
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
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                        isFirst
                          ? 'bg-warm-light border-2 border-warm'
                          : isLast
                            ? 'bg-surface-0 border-2 border-accent/40'
                            : 'bg-surface-0 border border-border'
                      }`}
                    >
                      <span className={`w-8 text-center text-2xl font-black tabular-nums ${isFirst ? 'text-warm-hover' : 'text-text-secondary'}`}>
                        {actualRank}
                      </span>
                      <span
                        className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-white shadow"
                        style={{ backgroundColor: getTeamColor(groupIdx >= 0 ? groupIdx : displayIndex) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-primary font-bold text-lg leading-tight truncate">{result.groupName}</span>
                          {isFirst && (
                            <svg className="w-5 h-5 flex-shrink-0 text-warm-hover" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M7 3h10v2h3a1 1 0 011 1v2a5 5 0 01-4.6 5A5.5 5.5 0 0113 15.9V18h3v3H8v-3h3v-2.1A5.5 5.5 0 017.6 13 5 5 0 013 8V6a1 1 0 011-1h3V3zm10 4v3.8A3 3 0 0019 8V7h-2zM5 7v1a3 3 0 002 2.8V7H5z" />
                            </svg>
                          )}
                        </div>
                        <div className="text-text-secondary text-base leading-tight tabular-nums">
                          {t('reveal.fromTarget', { distance: formatKm(result.distance) })}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-2xl font-black tabular-nums ${isFirst ? 'text-warm-hover' : 'text-text-primary'}`}>
                          +{result.points}
                        </span>
                        <span className="ml-1 text-sm font-semibold text-text-secondary">{t('common.pts')}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {results.length === 0 && (
                <p className="text-text-secondary text-center text-lg py-2">
                  {t('reveal.noAnswers')}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Indicateur du gagnant de la question - bottom center */}
        <AnimatePresence>
          {showWinner && sortedResults.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface-0/95 backdrop-blur-sm border border-border text-text-secondary px-6 py-3 rounded-xl shadow-lg z-10"
            >
              <div className="flex items-center gap-3 text-base">
                <span className="text-text-secondary font-semibold">{t('reveal.bestAnswer')}</span>
                <span className="font-bold text-text-primary text-lg">{sortedResults[0].groupName}</span>
                <span className="text-warm-hover font-bold text-lg tabular-nums">+{sortedResults[0].points} {t('common.pts')}</span>
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
        className="flex-shrink-0 bg-surface-0 border-t border-border px-6 py-3 shadow-lg"
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
                  className="flex items-start gap-3 bg-warm-light/60 border border-warm/40 rounded-xl px-4 py-3"
                >
                  <svg className="w-6 h-6 flex-shrink-0 mt-0.5 text-warm-hover" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.6.5 1.1 1.2 1.1 2V16h5v-.2c0-.8.5-1.5 1.1-2A6 6 0 0012 3z" />
                  </svg>
                  <div className="min-w-0">
                    <span className="font-bold text-warm-hover text-base">{t('reveal.didYouKnow')}</span>
                    <p className="text-text-primary text-base leading-snug mt-0.5 line-clamp-3">{tContent(question, 'explanation')}</p>
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
              className="px-6 py-3 bg-surface-0 hover:bg-surface-2 text-text-primary font-semibold text-lg rounded-xl transition-colors duration-200 border-2 border-border"
            >
              {t('reveal.viewRankings')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNextQuestion}
              className="px-8 py-3 bg-accent hover:bg-accent-hover text-white font-bold text-lg rounded-xl transition-colors duration-200 shadow-md"
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

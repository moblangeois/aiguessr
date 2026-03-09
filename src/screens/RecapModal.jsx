import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameGlobe, GROUP_COLORS } from '../components/Globe3D';
import { useTranslation } from '../i18n/I18nContext';

export function RecapModal({
  isOpen,
  onClose,
  questions,
  answers,
  groups,
  scores,
  currentQuestionIndex
}) {
  const { t } = useTranslation();

  // Creer les marqueurs de toutes les reponses
  const markers = useMemo(() => {
    const allMarkers = [];

    // Uniquement les questions deja repondues
    const answeredQuestions = questions.slice(0, currentQuestionIndex + 1);

    answeredQuestions.forEach(q => {
      const questionAnswers = answers[q.id];
      if (!questionAnswers) return;

      Object.entries(questionAnswers).forEach(([groupName, data]) => {
        const groupIdx = groups.indexOf(groupName);
        allMarkers.push({
          lat: data.lat,
          lng: data.lng,
          groupName: groupName,
          questionId: q.id,
          color: GROUP_COLORS[groupIdx >= 0 ? groupIdx : 0]
        });
      });
    });

    return allMarkers;
  }, [questions, answers, groups, currentQuestionIndex]);

  const ranking = Object.entries(scores)
    .map(([name, points]) => ({ name, points }))
    .sort((a, b) => b.points - a.points);

  const answeredCount = Object.keys(answers).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-surface-0/95 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-surface-1 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-surface-2 px-8 py-5">
              <h2 className="text-2xl font-black text-text-primary">
                {t('recap.title')}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-surface-1 hover:bg-accent rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenu */}
            <div className="flex h-[75vh]">
              {/* Carte */}
              <div className="flex-1 relative">
                <GameGlobe
                  markers={markers}
                  clickDisabled={true}
                  center={[20, 0]}
                  zoom={2}
                  preserveView={false}
                />

                {/* Badge progression */}
                <div className="absolute top-4 left-4 bg-accent text-text-primary px-4 py-2 rounded-xl font-bold shadow-lg">
                  {t('recap.progress', { answered: answeredCount, total: questions.length })}
                </div>
              </div>

              {/* Panel lateral */}
              <div className="w-80 bg-surface-1 border-l border-border p-6 overflow-y-auto">
                {/* Classement provisoire */}
                <h3 className="text-lg font-bold text-text-primary mb-4">
                  {t('recap.currentRankings')}
                </h3>

                <div className="space-y-3 mb-6">
                  {ranking.map((team, index) => {
                    const groupIdx = groups.indexOf(team.name);
                    const isFirst = index === 0;

                    return (
                      <motion.div
                        key={team.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          isFirst ? 'bg-warm/20 border border-warm/50' : 'bg-surface-2/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-xl font-black ${isFirst ? 'text-warm' : 'text-accent'}`}>
                            #{index + 1}
                          </span>
                          <span
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: GROUP_COLORS[groupIdx >= 0 ? groupIdx : index] }}
                          />
                          <span className="text-text-primary font-medium">{team.name}</span>
                        </div>
                        <span className={`font-bold ${isFirst ? 'text-warm' : 'text-accent'}`}>
                          {team.points} {t('common.pts')}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent my-6" />

                {/* Legende des groupes */}
                <h3 className="text-sm font-bold text-accent uppercase tracking-wide mb-4">
                  {t('recap.legend')}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {groups.map((group, index) => (
                    <div
                      key={group}
                      className="flex items-center gap-2 bg-surface-2/40 px-3 py-2 rounded-lg"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: GROUP_COLORS[index] }}
                      />
                      <span className="text-text-muted text-sm truncate">{group}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RecapModal;

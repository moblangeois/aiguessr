import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GameGlobe, GROUP_COLORS } from '../components/Globe3D';
import { useTranslation } from '../i18n/I18nContext';
import { categories, questions as allQuestionsBank } from '../data/questions';

export function BilanMapScreen({
  questions: playedQuestions,
  answers,
  groups,
  onBack
}) {
  const { t, tContent } = useTranslation();
  const [selectedCategories, setSelectedCategories] = useState(Object.keys(categories));
  const [showPropositions, setShowPropositions] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  // Questions à afficher : jouées ou toutes
  const questions = showAllQuestions ? allQuestionsBank : playedQuestions;

  const handleToggleCategory = (cat) => {
    setSelectedCategories(prev => {
      if (prev.includes(cat)) {
        return prev.filter(c => c !== cat);
      }
      return [...prev, cat];
    });
  };

  const handleSelectAll = () => {
    const allKeys = Object.keys(categories);
    if (selectedCategories.length === allKeys.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(allKeys);
    }
  };

  // Filtrer les questions par categorie selectionnee
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => selectedCategories.includes(q.category));
  }, [questions, selectedCategories]);

  // Creer les marqueurs des cibles avec couleur de catégorie
  const targetMarkers = useMemo(() => {
    return filteredQuestions.map(q => ({
      lat: q.target.lat,
      lng: q.target.lng,
      groupName: tContent(q.target, 'name'),
      color: categories[q.category]?.color || '#10b981',
      category: q.category,
      questionId: q.id
    }));
  }, [filteredQuestions]);

  // Creer les marqueurs des propositions des groupes (uniquement si questions jouées)
  const propositionMarkers = useMemo(() => {
    if (!showPropositions || showAllQuestions) return [];

    const markers = [];
    filteredQuestions.forEach(q => {
      const questionAnswers = answers[q.id];
      if (!questionAnswers) return;

      Object.entries(questionAnswers).forEach(([groupName, data]) => {
        const groupIdx = groups.indexOf(groupName);
        markers.push({
          lat: data.lat,
          lng: data.lng,
          groupName: groupName,
          distance: data.distance,
          points: data.points,
          color: GROUP_COLORS[groupIdx >= 0 ? groupIdx : 0] + '80',
          questionId: q.id
        });
      });
    });

    return markers;
  }, [filteredQuestions, answers, groups, showPropositions, showAllQuestions]);

  const allMarkers = [...targetMarkers, ...propositionMarkers];

  const allCategoryKeys = Object.keys(categories);
  const allSelected = selectedCategories.length === allCategoryKeys.length;

  return (
    <div className="h-screen flex flex-col bg-surface-0 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-shrink-0 bg-surface-1 border-b border-border px-6 py-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-text-primary">
              {t('bilan.title')}
            </h1>
            <p className="text-text-muted text-sm mt-0.5">{t('bilan.subtitle')}</p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-text-inverse font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            {t('bilan.backToRankings')}
          </button>
        </div>
      </motion.div>

      {/* Barre de filtres horizontale */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex-shrink-0 bg-surface-1/80 backdrop-blur-sm border-b border-border px-6 py-2.5"
      >
        <div className="flex items-center gap-4 flex-wrap">
          {/* Bouton "Tout" */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSelectAll}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              allSelected
                ? 'bg-accent text-text-inverse shadow-md shadow-accent/30'
                : 'bg-surface-2 text-text-muted border border-border'
            }`}
          >
            {t('bilan.filterAll')}
          </motion.button>

          {/* Chips de catégorie */}
          {Object.entries(categories).map(([key, cat]) => {
            const isSelected = selectedCategories.includes(key);
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggleCategory(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isSelected
                    ? 'bg-surface-2 border-2 shadow-sm'
                    : 'bg-surface-2/50 border-2 border-transparent opacity-50'
                }`}
                style={{ borderColor: isSelected ? cat.color : 'transparent' }}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-text-primary">{tContent(cat, 'name')}</span>
              </motion.button>
            );
          })}

          {/* Séparateur */}
          <div className="w-px h-6 bg-border" />

          {/* Toggle toutes les questions */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`w-10 h-5 rounded-full transition-all flex-shrink-0 ${showAllQuestions ? 'bg-warm' : 'bg-surface-3'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-lg transform transition-all mt-0.5 ${showAllQuestions ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
            </div>
            <input
              type="checkbox"
              checked={showAllQuestions}
              onChange={(e) => setShowAllQuestions(e.target.checked)}
              className="hidden"
            />
            <span className="text-text-primary font-medium text-sm">
              {t('bilan.allQuestions')}
            </span>
          </label>

          {/* Toggle réponses des équipes */}
          <label className={`flex items-center gap-2 cursor-pointer ${showAllQuestions ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className={`w-10 h-5 rounded-full transition-all flex-shrink-0 ${showPropositions && !showAllQuestions ? 'bg-accent' : 'bg-surface-3'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-lg transform transition-all mt-0.5 ${showPropositions && !showAllQuestions ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
            </div>
            <input
              type="checkbox"
              checked={showPropositions && !showAllQuestions}
              onChange={(e) => setShowPropositions(e.target.checked)}
              className="hidden"
              disabled={showAllQuestions}
            />
            <span className="text-text-primary font-medium text-sm">
              {t('bilan.showTeamAnswers')}
            </span>
          </label>

          {/* Légende groupes en ligne */}
          {showPropositions && !showAllQuestions && groups.length > 0 && (
            <>
              <div className="w-px h-6 bg-border" />
              {groups.map((group, index) => (
                <div
                  key={group}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: GROUP_COLORS[index] }}
                  />
                  <span className="text-text-secondary text-sm">{group}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </motion.div>

      {/* Carte pleine largeur */}
      <div className="flex-1 relative overflow-hidden">
        <GameGlobe
          markers={allMarkers}
          clickDisabled={true}
          center={[20, 0]}
          zoom={2}
          showSearch={true}
          preserveView={false}
          showCategoryLegend={true}
          categoryData={categories}
        />

        {/* Badge info - nombre de lieux */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-4 left-4 bg-surface-1/80 backdrop-blur-sm text-text-primary px-4 py-2 rounded-xl shadow-lg border border-border z-10"
        >
          <span className="font-bold text-accent text-lg">{filteredQuestions.length}</span>{' '}
          <span className="text-base">{t('bilan.locationsLabel')}</span>
        </motion.div>
      </div>
    </div>
  );
}

export default BilanMapScreen;

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GROUP_COLORS } from '../components/Globe3D';
import { categories } from '../data/questions';
import { useTranslation } from '../i18n/I18nContext';

// Fonction de geocodage via Nominatim
async function geocodeLocation(query) {
  if (!query.trim()) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=fr`
    );
    const results = await response.json();

    if (results.length > 0) {
      const result = results[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Erreur geocodage:', error);
    return null;
  }
}

export function BlindAnswerScreen({
  question,
  questionIndex,
  totalQuestions,
  groups,
  scores,
  onSubmitAllAnswers,
  onShowRecap,
  onSkipToFinal
}) {
  const { t, tContent } = useTranslation();

  // Etat pour chaque groupe : { input, status, coords, displayName }
  const [groupInputs, setGroupInputs] = useState(
    Object.fromEntries(groups.map(g => [g, { input: '', status: 'empty', coords: null, displayName: '' }]))
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const category = question ? categories[question.category] : null;

  // Mise a jour de l'input d'un groupe
  const handleInputChange = (groupName, value) => {
    setGroupInputs(prev => ({
      ...prev,
      [groupName]: { ...prev[groupName], input: value, status: value.trim() ? 'pending' : 'empty', coords: null }
    }));
  };

  // Geocoder un seul groupe
  const handleGeocodeSingle = useCallback(async (groupName) => {
    const input = groupInputs[groupName]?.input;
    if (!input?.trim()) return;

    setGroupInputs(prev => ({
      ...prev,
      [groupName]: { ...prev[groupName], status: 'geocoding' }
    }));

    const result = await geocodeLocation(input);

    setGroupInputs(prev => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        status: result ? 'found' : 'not_found',
        coords: result ? { lat: result.lat, lng: result.lng } : null,
        displayName: result?.displayName || ''
      }
    }));
  }, [groupInputs]);

  // Geocoder tous les groupes
  const handleGeocodeAll = useCallback(async () => {
    setIsGeocoding(true);

    const promises = groups.map(async (groupName) => {
      const input = groupInputs[groupName]?.input;
      if (!input?.trim()) {
        return [groupName, { status: 'empty', coords: null }];
      }

      setGroupInputs(prev => ({
        ...prev,
        [groupName]: { ...prev[groupName], status: 'geocoding' }
      }));

      const result = await geocodeLocation(input);
      return [groupName, {
        status: result ? 'found' : 'not_found',
        coords: result ? { lat: result.lat, lng: result.lng } : null,
        displayName: result?.displayName || ''
      }];
    });

    const results = await Promise.all(promises);

    setGroupInputs(prev => {
      const updated = { ...prev };
      results.forEach(([groupName, data]) => {
        updated[groupName] = { ...updated[groupName], ...data };
      });
      return updated;
    });

    setIsGeocoding(false);
  }, [groups, groupInputs]);

  // Soumettre toutes les reponses
  const handleSubmitAll = useCallback(() => {
    const answers = {};
    groups.forEach(groupName => {
      const data = groupInputs[groupName];
      if (data?.coords) {
        answers[groupName] = data.coords;
      }
    });
    onSubmitAllAnswers(answers);
  }, [groups, groupInputs, onSubmitAllAnswers]);

  // Compter les statuts
  const statusCounts = {
    found: groups.filter(g => groupInputs[g]?.status === 'found').length,
    not_found: groups.filter(g => groupInputs[g]?.status === 'not_found').length,
    pending: groups.filter(g => groupInputs[g]?.status === 'pending').length,
    empty: groups.filter(g => groupInputs[g]?.status === 'empty').length
  };

  const canSubmit = statusCounts.found > 0;

  // Classement provisoire (inline)
  const ranking = Object.entries(scores || {})
    .map(([name, points]) => ({ name, points }))
    .sort((a, b) => b.points - a.points);

  // Grid columns based on group count
  const gridCols = groups.length <= 2 ? 'grid-cols-1 sm:grid-cols-2'
    : groups.length <= 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="h-screen flex flex-col bg-surface-0 overflow-hidden">
      {/* Header compact */}
      <div className="flex-shrink-0 bg-surface-1 border-b border-border px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left: Question + Category + Mode */}
          <div className="flex items-center gap-3">
            <div className="bg-accent text-text-inverse px-4 py-2 rounded-lg font-bold text-xl md:text-2xl">
              Q{questionIndex + 1}/{totalQuestions}
            </div>
            {category && (
              <div
                className="px-3 py-1.5 rounded-lg text-text-inverse font-medium text-base flex items-center gap-2"
                style={{ backgroundColor: category.color + '40', borderColor: category.color, borderWidth: 2 }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                {tContent(category, 'name')}
              </div>
            )}
            <div className="bg-warm/10 text-warm px-3 py-1.5 rounded-lg font-medium text-base border border-warm/30">
              {t('blindAnswer.classroomMode')}
            </div>
          </div>

          {/* Center: inline scores */}
          <div className="flex items-center gap-2">
            {ranking.map((team, index) => {
              const gIdx = groups.indexOf(team.name);
              return (
                <div key={team.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2/60">
                  <span className={`font-bold text-sm ${index === 0 ? 'text-warm' : 'text-accent'}`}>
                    #{index + 1}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: GROUP_COLORS[gIdx] }}
                  />
                  <span className="text-text-secondary text-sm font-medium truncate max-w-[60px]">
                    {team.name}
                  </span>
                  <span className={`font-bold text-sm ${index === 0 ? 'text-warm' : 'text-accent'}`}>
                    {team.points}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: Recap */}
          <button
            onClick={onShowRecap}
            className="px-5 py-2.5 bg-surface-2 hover:bg-surface-3 text-text-secondary font-medium rounded-xl transition-all duration-200 hover:scale-105 shadow-lg border border-border"
          >
            {t('blindAnswer.recap')}
          </button>
        </div>
      </div>

      {/* Question text bar */}
      <div className="flex-shrink-0 bg-surface-1/80 border-b border-border px-6 py-3">
        <div className="text-text-secondary font-medium text-xl md:text-2xl text-center leading-relaxed">
          {tContent(question, 'question')}
        </div>
      </div>

      {/* Main content: grid of group inputs */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Instructions */}
          <div className="text-center mb-4">
            <h2 className="text-lg md:text-xl font-bold text-text-primary mb-1">
              {t('blindAnswer.enterAnswers')}
            </h2>
            <p className="text-sm md:text-base text-text-muted">
              {t('blindAnswer.enterLocation')}
            </p>
          </div>

          {/* Group inputs grid */}
          <div className={`grid ${gridCols} gap-4`}>
            {groups.map((groupName, index) => {
              const data = groupInputs[groupName] || {};
              const statusIcon = {
                empty: '\u23F3',
                pending: '\uD83D\uDCDD',
                geocoding: '\uD83D\uDD04',
                found: '\u2705',
                not_found: '\u274C'
              }[data.status] || '\u23F3';

              const statusColor = {
                empty: 'bg-surface-2/40 border-border',
                pending: 'bg-accent/10 border-accent/30',
                geocoding: 'bg-warm/10 border-warm/30',
                found: 'bg-green-900/20 border-green-500/30',
                not_found: 'bg-red-900/20 border-red-500/30'
              }[data.status] || 'bg-surface-2/40 border-border';

              return (
                <motion.div
                  key={groupName}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border-2 ${statusColor} transition-all`}
                >
                  {/* Group header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full shadow"
                      style={{ backgroundColor: GROUP_COLORS[index] }}
                    />
                    <span className="font-bold text-text-secondary text-base md:text-lg">{groupName}</span>
                    <span className="text-lg">{statusIcon}</span>
                    {data.status === 'geocoding' && (
                      <span className="text-sm text-warm animate-pulse">{t('blindAnswer.searching')}</span>
                    )}
                  </div>

                  {/* Input + verify button */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={data.input || ''}
                      onChange={(e) => handleInputChange(groupName, e.target.value)}
                      onBlur={() => data.input?.trim() && handleGeocodeSingle(groupName)}
                      placeholder={t('blindAnswer.locationPlaceholder')}
                      className="flex-1 px-4 py-2.5 bg-surface-0 border border-border rounded-xl text-text-primary text-base placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    />
                    <button
                      onClick={() => handleGeocodeSingle(groupName)}
                      disabled={!data.input?.trim() || data.status === 'geocoding'}
                      className="px-4 py-2.5 bg-surface-2 hover:bg-surface-3 text-text-secondary rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-border"
                    >
                      {t('blindAnswer.verify')}
                    </button>
                  </div>

                  {/* Status badge */}
                  {data.displayName && data.status === 'found' && (
                    <div className="mt-2 text-sm text-green-400 truncate">
                      {'\u2192'} {data.displayName}
                    </div>
                  )}
                  {data.status === 'not_found' && (
                    <div className="mt-2 text-sm text-red-400">
                      {t('blindAnswer.notFound')}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Status summary */}
          <div className="mt-4 p-3 bg-surface-2/40 rounded-xl">
            <div className="flex items-center justify-center gap-6 text-sm md:text-base">
              <span className="text-green-400">{'\u2705'} {t('blindAnswer.found', { count: statusCounts.found })}</span>
              <span className="text-red-400">{'\u274C'} {t('blindAnswer.notFoundCount', { count: statusCounts.not_found })}</span>
              <span className="text-text-muted">{'\u23F3'} {t('blindAnswer.pending', { count: statusCounts.empty + statusCounts.pending })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-surface-1 border-t border-border p-4 shadow-lg">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setShowSkipConfirm(true)}
            className="px-5 py-3 bg-surface-2 hover:bg-red-900/30 text-text-muted hover:text-red-400 font-medium rounded-xl transition-all border border-border hover:border-red-500/30"
          >
            {t('common.end')}
          </button>

          <button
            onClick={handleGeocodeAll}
            disabled={isGeocoding || statusCounts.pending === 0}
            className="px-6 py-3 bg-warm hover:bg-warm-hover text-text-inverse font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeocoding ? t('blindAnswer.verifying') : t('blindAnswer.verifyAll')}
          </button>

          <button
            onClick={handleSubmitAll}
            disabled={!canSubmit}
            className={`px-10 py-4 font-bold text-lg rounded-xl transition-all shadow-lg ${
              canSubmit
                ? 'bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-text-inverse hover:scale-105'
                : 'bg-surface-2 text-text-muted cursor-not-allowed opacity-50'
            }`}
          >
            {t('blindAnswer.submitAnswers', { count: statusCounts.found })}
          </button>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showSkipConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-surface-0/80 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-surface-1 backdrop-blur-sm rounded-3xl w-full max-w-md shadow-2xl border border-red-500/30 p-8"
          >
            <h3 className="text-2xl font-black text-text-primary mb-4">{t('blindAnswer.endGameTitle')}</h3>
            <p className="text-text-muted mb-6">
              {t('blindAnswer.endGameMessage')}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="flex-1 px-6 py-3 bg-surface-2 hover:bg-surface-3 text-text-secondary font-bold rounded-xl border border-border"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  setShowSkipConfirm(false);
                  onSkipToFinal();
                }}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-text-inverse font-bold rounded-xl"
              >
                {t('common.end')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default BlindAnswerScreen;

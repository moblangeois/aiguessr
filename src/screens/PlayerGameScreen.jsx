import { useState, useMemo } from 'react';
import { MapLeaflet } from '../components/MapLeaflet';
import { categories } from '../data/questions';
import { GROUP_COLORS } from '../components/Map';
import { useTranslation } from '../i18n/I18nContext';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PlayerGameScreen({ gameState, groupName, onSubmitAnswer, onDisconnect }) {
  const { t, tContent } = useTranslation();
  const [marker, setMarker] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Reset quand la question change
  const questionId = gameState?.currentQuestion?.id;
  const [lastQuestionId, setLastQuestionId] = useState(null);
  if (questionId !== lastQuestionId) {
    setLastQuestionId(questionId);
    setMarker(null);
    setSubmitted(false);
    setIsSubmitting(false);
  }

  const hasAnswered = gameState?.hasAnswered || submitted;
  const phase = gameState?.phase || 'lobby';
  const question = gameState?.currentQuestion;
  const category = question ? categories[question.category] : null;
  const timeRemaining = gameState?.timeRemaining || 0;
  const scores = gameState?.scores || {};

  // Classement
  const ranking = useMemo(() => {
    return Object.entries(scores)
      .map(([name, points]) => ({ name, points }))
      .sort((a, b) => b.points - a.points);
  }, [scores]);

  const myRank = ranking.findIndex(r => r.name === groupName) + 1;
  const myScore = scores[groupName] || 0;

  // Couleur de l'équipe : même index que sur l'écran présentateur (ordre de connexion)
  const teamIndex = (gameState?.groups || []).findIndex(g => g.name === groupName);
  const teamColor = teamIndex >= 0 ? GROUP_COLORS[teamIndex % GROUP_COLORS.length] : '#0D9488';

  const handleMapClick = (lat, lng) => {
    if (hasAnswered) return;
    setMarker({ lat, lng });
  };

  const handleSubmit = async () => {
    if (!marker || isSubmitting || hasAnswered) return;
    setIsSubmitting(true);
    const result = await onSubmitAnswer(marker.lat, marker.lng);
    if (result?.success) {
      setSubmitted(true);
    }
    setIsSubmitting(false);
  };

  // Phase lobby : en attente
  if (phase === 'lobby') {
    return (
      <div className="h-screen bg-surface-0 flex items-center justify-center p-4">
        <div className="bg-surface-1 backdrop-blur-sm rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center border border-border">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-warm mb-4">
            AIGuessr
          </h1>
          <div className="text-accent font-bold text-lg mb-2">{groupName}</div>
          <div className="animate-pulse text-text-muted">{t('player.waitingForStart')}</div>
          <div className="mt-6 text-text-muted text-sm">
            {t('player.teamsConnected', { count: gameState?.groups?.length || 0 })}
          </div>
        </div>
      </div>
    );
  }

  // Phase final : classement
  if (phase === 'final') {
    return (
      <div className="h-screen bg-surface-0 flex items-center justify-center p-4">
        <div className="bg-surface-1 backdrop-blur-sm rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center border border-border">
          <h2 className="text-2xl font-black text-text-primary mb-4">{t('player.gameOver')}</h2>
          <div className="space-y-2 mb-6">
            {ranking.map((team, i) => (
              <div
                key={team.name}
                className={`flex items-center justify-between px-4 py-2 rounded-xl ${
                  team.name === groupName
                    ? 'bg-accent/10 border-2 border-accent/50'
                    : i === 0 ? 'bg-warm/10 border border-warm/30' : 'bg-surface-3/40'
                }`}
              >
                <span className="font-bold text-accent">#{i + 1}</span>
                <span className="font-medium text-text-secondary">{team.name}</span>
                <span className="font-bold text-accent">{team.points} {t('common.pts')}</span>
              </div>
            ))}
          </div>
          <div className="text-text-muted text-sm">{t('player.thankYou')}</div>
        </div>
      </div>
    );
  }

  // Phase reveal / impact : affichage passif
  if (phase === 'reveal' || phase === 'impact') {
    return (
      <div className="h-screen bg-surface-0 flex items-center justify-center p-4">
        <div className="bg-surface-1 backdrop-blur-sm rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center border border-border">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {t('player.waitingForReveal')}
          </h2>
          <p className="text-text-muted mb-4">{t('player.waitingForQuestion')}</p>
          <div className="bg-accent/10 rounded-xl p-4 border border-accent/30">
            <div className="text-accent font-bold">{groupName}</div>
            <div className="text-2xl font-black text-warm">{myScore} {t('common.pts')}</div>
            <div className="text-text-muted text-sm">{t('player.yourRank')} #{myRank}</div>
          </div>
        </div>
      </div>
    );
  }

  // Phase research ou answer : carte interactive avec question + timer
  const timerDuration = gameState?.timerDuration || 0;
  const timeRatio = timerDuration > 0 ? Math.max(0, Math.min(1, timeRemaining / timerDuration)) : 0;
  const timerTone = timeRemaining <= 10 ? 'danger' : timeRemaining <= 30 ? 'warm' : 'accent';
  const timerText = { danger: 'text-danger', warm: 'text-warm', accent: 'text-text-primary' }[timerTone];
  const timerBar = { danger: 'bg-danger', warm: 'bg-warm', accent: 'bg-accent' }[timerTone];

  if (phase === 'research' || phase === 'answer') return (
    <div className="h-screen flex flex-col bg-surface-0">
      {/* En-tête : catégorie, progression, question, équipe, minuteur */}
      <div className="flex-shrink-0 bg-surface-0 px-4 pt-3 pb-3 border-b border-border shadow-sm">
        <div className="flex items-center justify-between gap-3 text-sm">
          {category && (
            <span className="flex items-center gap-2 font-semibold text-text-secondary min-w-0">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
              <span className="truncate">{t('categories.' + question.category)}</span>
            </span>
          )}
          <span className="font-semibold text-text-secondary tabular-nums whitespace-nowrap">
            {t('reveal.questionProgress', {
              current: (gameState?.currentQuestionIndex || 0) + 1,
              total: gameState?.totalQuestions || 0
            })}
          </span>
        </div>

        <p className="mt-2 text-[17px] font-semibold text-text-primary leading-snug">
          {tContent(question, 'question')}
        </p>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-2 ring-white shadow" style={{ backgroundColor: teamColor }} />
            <span className="font-bold text-text-primary truncate">{groupName}</span>
            <span className="text-text-secondary font-semibold tabular-nums whitespace-nowrap">{myScore} {t('common.pts')}</span>
          </div>
          <div className="text-right flex-shrink-0" aria-live="polite">
            <div className="text-[11px] font-semibold text-text-secondary leading-none mb-1">{t('player.timeLeft')}</div>
            <div className={`text-3xl font-extrabold tabular-nums leading-none ${timerText}`}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        {timerDuration > 0 && (
          <div className="mt-2.5 h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${timerBar}`}
              style={{ width: `${timeRatio * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Carte */}
      <div className="flex-1 relative">
        {hasAnswered ? (
          <div className="h-full flex items-center justify-center bg-accent/10">
            <div className="text-center">
              <svg className="w-14 h-14 mx-auto mb-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7.5 12.5l3 3 6-6.5" />
              </svg>
              <div className="text-accent font-bold text-lg">{t('player.answerSubmitted')}</div>
              <div className="text-text-secondary text-sm mt-1">{t('player.waitingForReveal')}</div>
            </div>
          </div>
        ) : (
          <>
            <MapLeaflet
              marker={marker}
              onMapClick={handleMapClick}
              height="100%"
              markerColor={teamColor}
            />
            <div
              className={`absolute top-3 left-1/2 -translate-x-1/2 w-[calc(100%-5.5rem)] max-w-xs text-center px-3 py-2 rounded-xl text-sm font-semibold shadow-lg z-[1000] pointer-events-none ${
                marker
                  ? 'bg-surface-0/95 text-text-primary border border-border'
                  : 'bg-text-primary/90 text-surface-0'
              }`}
            >
              {marker ? t('player.markerPlaced') : t('player.tapToPlace')}
            </div>
          </>
        )}
      </div>

      {/* Pied : actions */}
      {!hasAnswered && (
        <div className="flex-shrink-0 bg-surface-0 border-t border-border px-4 pt-3 pb-4 shadow-lg">
          <div className="flex gap-3">
            {marker && (
              <button
                onClick={() => setMarker(null)}
                className="px-5 py-3.5 bg-surface-0 hover:bg-surface-2 text-text-secondary font-semibold rounded-xl border-2 border-border focus-visible:outline-2 focus-visible:outline-accent"
              >
                {t('player.clearMarker')}
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!marker || isSubmitting}
              className={`flex-1 py-3.5 font-bold text-lg rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                marker && !isSubmitting
                  ? 'bg-accent hover:bg-accent-hover text-white shadow-md'
                  : 'bg-surface-2 text-text-muted cursor-not-allowed'
              }`}
            >
              {isSubmitting ? '...' : t('player.submitAnswer')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerGameScreen;

import { useState, useMemo } from 'react';
import { MapLeaflet } from '../components/MapLeaflet';
import { categories } from '../data/questions';
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
  if (phase === 'research' || phase === 'answer') return (
    <div className="h-screen flex flex-col bg-surface-0">
      {/* Header compact */}
      <div className="flex-shrink-0 bg-surface-1 backdrop-blur-sm p-3 shadow-sm border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <div className="bg-accent text-text-primary px-2 py-1 rounded-lg font-bold text-xs">
            Q{(gameState?.currentQuestionIndex || 0) + 1}/{gameState?.totalQuestions || 0}
          </div>
          <div className={`px-2 py-1 rounded-lg font-mono font-bold text-xs ${
            timeRemaining <= 10 ? 'bg-danger/30 text-danger' :
            timeRemaining <= 30 ? 'bg-warm/30 text-warm' :
            'bg-accent/30 text-accent'
          }`}>
            {formatTime(timeRemaining)}
          </div>
          <div className="text-text-secondary font-bold text-xs">{myScore} {t('common.pts')}</div>
        </div>
        <div className="text-text-secondary text-xs font-medium leading-tight">{tContent(question, 'question')}</div>
      </div>

      {/* Carte */}
      <div className="flex-1 relative">
        {hasAnswered ? (
          <div className="h-full flex items-center justify-center bg-accent/10">
            <div className="text-center">
              <div className="text-5xl mb-3">✅</div>
              <div className="text-accent font-bold text-lg">{t('player.answerSubmitted')}</div>
              <div className="text-text-muted text-sm mt-1">{t('player.waitingForReveal')}</div>
            </div>
          </div>
        ) : (
          <>
            <MapLeaflet
              marker={marker}
              onMapClick={handleMapClick}
              height="100%"
            />
            {!marker && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-warm/90 text-text-primary px-4 py-2 rounded-xl text-sm font-medium shadow-lg z-[1000]">
                {t('player.placeYourAnswer')}
              </div>
            )}
            {marker && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-accent/90 text-text-primary px-4 py-2 rounded-xl text-sm font-medium shadow-lg z-[1000]">
                {t('player.placeYourAnswer')}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer : boutons */}
      {!hasAnswered && (
        <div className="flex-shrink-0 bg-surface-1 border-t border-border p-3 shadow-lg">
          <div className="flex gap-3">
            {marker && (
              <button
                onClick={() => setMarker(null)}
                className="flex-1 py-3 bg-surface-3 hover:bg-surface-2 text-text-secondary font-bold rounded-xl border border-border"
              >
                {t('common.cancel')}
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!marker || isSubmitting}
              className={`flex-1 py-3 font-bold text-lg rounded-xl transition-all shadow-lg ${
                marker && !isSubmitting
                  ? 'bg-accent hover:bg-accent/80 text-text-primary'
                  : 'bg-surface-3 text-text-muted cursor-not-allowed'
              }`}
            >
              {isSubmitting ? '...' : t('common.submit')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerGameScreen;

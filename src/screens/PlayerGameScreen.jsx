import { useState, useMemo } from 'react';
import { MapLeaflet } from '../components/MapLeaflet';
import { categories } from '../data/questions';
import { getTeamColor } from '../data/teamColors';
import { calculateDistance, formatCoordinates } from '../utils/distance';
import { useTranslation } from '../i18n/I18nContext';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/* Écran du téléphone, en relevé de terrain : attente, pose du point, point enregistré,
   résultat de la manche, classement final. La couleur d'équipe tient le bandeau du haut. */
export function PlayerGameScreen({ gameState, groupName, onSubmitAnswer }) {
  const { t, tContent, locale } = useTranslation();
  const [marker, setMarker] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const scores = gameState?.scores || {};
  const myScore = scores[groupName] || 0;

  // Reset quand la question change ; on garde le score de départ pour afficher les points de la manche
  const questionId = gameState?.currentQuestion?.id;
  const [lastQuestionId, setLastQuestionId] = useState(null);
  const [roundStartScore, setRoundStartScore] = useState(0);
  if (questionId !== lastQuestionId) {
    setLastQuestionId(questionId);
    setRoundStartScore(myScore);
    setMarker(null);
    setSubmitted(false);
    setIsSubmitting(false);
  }

  const hasAnswered = gameState?.hasAnswered || submitted;
  const phase = gameState?.phase || 'lobby';
  const question = gameState?.currentQuestion;
  const category = question ? categories[question.category] : null;
  const timeRemaining = gameState?.timeRemaining || 0;
  const timerDuration = gameState?.timerDuration || 0;
  const reveal = gameState?.reveal || null;

  // Classement
  const ranking = useMemo(() => {
    return Object.entries(scores)
      .map(([name, points]) => ({ name, points }))
      .sort((a, b) => b.points - a.points);
  }, [scores]);
  const myRank = ranking.findIndex(r => r.name === groupName) + 1;

  // Couleur de l'équipe : même index que sur l'écran présentateur (ordre de connexion)
  const teamIndex = (gameState?.groups || []).findIndex(g => g.name === groupName);
  const teamColor = teamIndex >= 0 ? getTeamColor(teamIndex) : getTeamColor(0);

  // Point de l'équipe : celui posé ici, ou celui que le serveur a gardé (reconnexion)
  const myPoint = marker || reveal?.myAnswer || null;
  // Objets stables pour la carte (chaque état reçu du serveur est un nouvel objet)
  const targetLat = reveal?.target?.lat;
  const targetLng = reveal?.target?.lng;
  const answerLat = reveal?.myAnswer?.lat;
  const answerLng = reveal?.myAnswer?.lng;
  const target = useMemo(
    () => (targetLat != null ? { lat: targetLat, lng: targetLng } : null),
    [targetLat, targetLng]
  );
  const resultPoint = useMemo(
    () => (answerLat != null ? { lat: answerLat, lng: answerLng } : null),
    [answerLat, answerLng]
  );

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

  const teamBand = <div className="h-1.5 flex-shrink-0" style={{ backgroundColor: teamColor }} />;
  const teamDot = <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: teamColor }} />;
  const progressLabel = t('reveal.questionProgress', {
    current: (gameState?.currentQuestionIndex || 0) + 1,
    total: gameState?.totalQuestions || 0
  });

  // ─── Attente du lancement ───
  if (phase === 'lobby') {
    return (
      <div className="h-[100dvh] flex flex-col bg-surface-0 paper-grain">
        {teamBand}
        <div className="flex-1 flex flex-col justify-center px-7 contour-lines">
          <h1 className="text-5xl font-extrabold leading-none tracking-tight">
            AI<em className="font-normal italic text-accent">Guessr</em>
          </h1>
          <p className="font-serif italic text-lg text-text-secondary mt-2 mb-7">{t('player.tagline')}</p>
          <div className="border border-text-primary bg-surface-0 px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">{t('player.yourTeam')}</div>
            <div className="font-serif font-semibold text-2xl flex items-center gap-3 mt-0.5">
              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: teamColor }} />
              {groupName}
            </div>
          </div>
          <div className="mt-4 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            {/* L'état reçu à la connexion précède parfois l'ajout de sa propre équipe */}
            {t('player.lobbyStatus', { count: Math.max(gameState?.groups?.length || 0, gameState?.totalGroups || 0, 1) })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Classement final ───
  if (phase === 'final') {
    return (
      <div className="h-[100dvh] flex flex-col bg-surface-0 paper-grain">
        {teamBand}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">{t('player.finalRank')}</div>
          <h2 className="text-4xl font-extrabold mt-1">{t('player.gameOver')}</h2>
          <div className="mt-6 border-t border-text-primary">
            {ranking.map((team, i) => (
              <div
                key={team.name}
                className={`flex items-center gap-3 py-3 border-b border-border ${team.name === groupName ? 'font-semibold' : ''}`}
              >
                <span className="font-mono w-6 text-text-secondary">{i + 1}</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getTeamColor((gameState?.groups || []).findIndex(g => g.name === team.name)) }} />
                <span className="flex-1 truncate">{team.name}</span>
                <span className={`font-mono tabular-nums ${i === 0 ? 'text-accent' : ''}`}>{team.points.toLocaleString(locale)} {t('common.pts')}</span>
              </div>
            ))}
          </div>
          <p className="font-serif italic text-text-secondary mt-6">{t('player.thankYou')}</p>
        </div>
      </div>
    );
  }

  // ─── Résultat de la manche (révélation et chiffres d'impact) ───
  if (phase === 'reveal' || phase === 'impact') {
    const km = target && resultPoint
      ? calculateDistance(resultPoint.lat, resultPoint.lng, target.lat, target.lng)
      : null;
    const roundPoints = Math.max(0, myScore - roundStartScore);
    return (
      <div className="h-[100dvh] flex flex-col bg-surface-0 paper-grain">
        {teamBand}
        <div className="flex justify-between items-baseline px-4 pt-4 font-mono text-[11px] text-text-secondary">
          <span className="flex items-center gap-2 font-sans text-[13px] font-semibold text-text-primary">{teamDot}{groupName}</span>
          <span>{progressLabel}</span>
        </div>

        <div className="px-5 pt-3">
          {km != null ? (
            <>
              <div className="font-mono text-[10.5px] uppercase tracking-widest text-text-secondary">{t('player.yourPointIs')}</div>
              <div className="font-serif font-extrabold text-accent leading-none tracking-tight text-[64px]">
                {km.toLocaleString(locale)}<span className="font-mono font-medium text-lg text-text-primary ml-1.5">km</span>
              </div>
              <div className="font-serif italic text-base mt-1">
                {t('player.fromSite', { name: tContent(reveal.target, 'name') })}
              </div>
            </>
          ) : (
            <>
              <div className="font-serif font-semibold text-2xl leading-tight">{t('player.noPoint')}</div>
              {reveal?.target && (
                <div className="font-serif italic text-base mt-1">
                  {t('player.actualSite', { name: tContent(reveal.target, 'name') })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="relative flex-1 min-h-[180px] mt-4 border-y border-text-primary">
          {target ? (
            <MapLeaflet marker={resultPoint} target={target} markerColor={teamColor} height="100%" />
          ) : (
            <div className="h-full flex items-center justify-center text-text-secondary text-sm px-6 text-center">
              {t('player.waitingForReveal')}
            </div>
          )}
        </div>

        <div className="px-5 pt-2 pb-6 text-[15px]">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-text-secondary">{t('player.thisRound')}</span>
            <b className="font-mono font-semibold text-accent">+{roundPoints.toLocaleString(locale)} {t('common.pts')}</b>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-text-secondary">{t('player.total')}</span>
            <b className="font-mono font-semibold">{myScore.toLocaleString(locale)} {t('common.pts')}</b>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-text-secondary">{t('player.yourRank')}</span>
            <b className="font-mono font-semibold">{t('player.rankOf', { rank: myRank || '–', total: ranking.length || gameState?.groups?.length || 0 })}</b>
          </div>
        </div>
      </div>
    );
  }

  // ─── Pose du point (phases research et answer) ───
  const timeRatio = timerDuration > 0 ? Math.max(0, Math.min(1, timeRemaining / timerDuration)) : 0;
  const urgent = timeRemaining <= 10;

  if (phase === 'research' || phase === 'answer') return (
    <div className="h-[100dvh] flex flex-col bg-surface-0 paper-grain">
      {teamBand}
      {/* En-tête : équipe, progression, phase, minuteur, question */}
      <div className="flex-shrink-0 px-4 pt-3.5 pb-3">
        <div className="flex justify-between items-baseline font-mono text-[11px] text-text-secondary">
          <span className="flex items-center gap-2 font-sans text-[13px] font-semibold text-text-primary min-w-0">
            {teamDot}<span className="truncate">{groupName}</span>
            <span className="font-mono font-normal text-text-secondary whitespace-nowrap">· {myScore.toLocaleString(locale)} {t('common.pts')}</span>
          </span>
          <span className="whitespace-nowrap">{progressLabel}</span>
        </div>

        <div className="flex justify-between items-end mt-3">
          {category && (
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-widest flex items-center gap-2" style={{ color: category.color }}>
              <span className="w-2 h-2 rotate-45" style={{ backgroundColor: category.color }} />
              {t('categories.' + question.category)}
            </span>
          )}
          <span className={`font-mono font-semibold text-3xl leading-none tabular-nums ${urgent ? 'text-danger' : 'text-text-primary'}`} aria-live="polite">
            <small className="text-[10px] font-normal uppercase tracking-wider text-text-secondary mr-1.5 align-[4px]">{t('player.remaining')}</small>
            {formatTime(timeRemaining)}
          </span>
        </div>

        {/* Minuteur en règle graduée */}
        {timerDuration > 0 && (
          <div className="relative h-[3px] bg-surface-3 mt-2">
            <div
              className={`absolute inset-y-0 left-0 transition-[width] duration-1000 ease-linear ${urgent ? 'bg-danger' : 'bg-text-primary'}`}
              style={{ width: `${timeRatio * 100}%` }}
            />
            <div className="absolute -inset-y-[3px] inset-x-0 opacity-50" style={{ background: 'repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px), var(--text-secondary) calc(10% - 1px) 10%)' }} />
          </div>
        )}

        <p className="font-serif font-semibold text-[21px] leading-snug mt-3">
          {tContent(question, 'question')}
        </p>
      </div>

      {/* Carte */}
      <div className="flex-1 relative border-y border-text-primary">
        <MapLeaflet
          marker={myPoint}
          onMapClick={handleMapClick}
          height="100%"
          markerColor={teamColor}
        />
        {hasAnswered && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-surface-0/35 pointer-events-none">
            <div className="-rotate-6 border-[2.5px] border-accent text-accent bg-surface-0/95 px-4 py-2.5 text-center font-mono font-semibold uppercase tracking-wider text-[13px] leading-relaxed">
              {t('player.pointRecorded')}
              {myPoint && (
                <b className="block font-serif font-extrabold normal-case tracking-normal text-[22px] text-accent">
                  {formatCoordinates(myPoint.lat, myPoint.lng)}
                </b>
              )}
              {gameState?.totalGroups > 0 && t('player.answeredOf', { count: gameState.answeredCount || 1, total: gameState.totalGroups })}
            </div>
          </div>
        )}
      </div>

      {/* Pied : coordonnées du point et validation */}
      <div className="flex-shrink-0 px-3.5 pt-3 pb-5">
        {hasAnswered ? (
          <p className="text-sm text-text-secondary flex gap-2 items-start">
            <svg className="w-[18px] h-[18px] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
            {t('player.watchScreen')}
          </p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2.5 min-h-[38px]">
              {marker ? (
                <>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">{t('player.yourPoint')}</div>
                    <div className="font-mono font-semibold text-[15px]">{formatCoordinates(marker.lat, marker.lng)}</div>
                  </div>
                  <button
                    onClick={() => setMarker(null)}
                    className="px-3.5 py-2 text-sm font-semibold border border-text-primary hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {t('player.clearMarker')}
                  </button>
                </>
              ) : (
                <span className="text-sm text-text-secondary">{t('player.tapHint')}</span>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!marker || isSubmitting}
              className={`w-full py-4 font-semibold text-[17px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                marker && !isSubmitting
                  ? 'bg-accent hover:bg-accent-hover text-text-inverse'
                  : 'bg-surface-2 text-text-muted border border-dashed border-text-muted cursor-not-allowed'
              }`}
            >
              {isSubmitting ? '…' : t('player.confirmPoint')}
            </button>
          </>
        )}
      </div>
    </div>
  );

  return null;
}

export default PlayerGameScreen;

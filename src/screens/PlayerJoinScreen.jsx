import { useState } from 'react';
import { useTranslation } from '../i18n/I18nContext';

export function PlayerJoinScreen({ initialCode, onJoin, error: externalError, questionnaireMode }) {
  const { t } = useTranslation();
  const [code, setCode] = useState(initialCode || '');
  const [groupName, setGroupName] = useState('');
  const [memberCount, setMemberCount] = useState(questionnaireMode ? 1 : 4);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || !groupName.trim()) return;

    setIsJoining(true);
    setError(null);

    const result = await onJoin(code.trim(), groupName.trim(), questionnaireMode ? 1 : memberCount);
    if (!result.success) {
      setError(result.error || t('player.unableToJoin'));
    }
    setIsJoining(false);
  };

  const displayError = error || externalError;

  return (
    <div className="h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="bg-surface-1 backdrop-blur-sm rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-border">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-400 mb-2">
            {t('config.title')}
          </h1>
          <p className="text-accent text-sm">{t('player.joinSession')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Session code */}
          <div>
            <label className="block text-text-secondary font-semibold mb-1 text-sm">
              {t('player.sessionCode')}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t('player.sessionCodePlaceholder')}
              maxLength={4}
              className="w-full px-4 py-3 bg-surface-3 border-2 border-border rounded-xl text-text-primary text-center text-2xl font-mono font-bold tracking-[0.3em] placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent uppercase"
              autoFocus
            />
          </div>

          {/* Player / team name */}
          <div>
            <label className="block text-text-secondary font-semibold mb-1 text-sm">
              {questionnaireMode ? t('player.yourName') : t('player.teamName')}
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={questionnaireMode ? t('player.namePlaceholderSolo') : t('player.namePlaceholderTeam')}
              className="w-full px-4 py-3 bg-surface-3 border-2 border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          {/* Member count (hidden in questionnaire mode) */}
          {!questionnaireMode && (
            <div>
              <label className="block text-text-secondary font-semibold mb-1 text-sm">
                {t('player.teamMembers')}
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
                  className="w-10 h-10 bg-surface-2 hover:bg-surface-3 text-text-secondary rounded-xl font-bold text-lg border border-border"
                >
                  -
                </button>
                <span className="text-2xl font-black text-text-primary w-8 text-center">{memberCount}</span>
                <button
                  type="button"
                  onClick={() => setMemberCount(Math.min(10, memberCount + 1))}
                  className="w-10 h-10 bg-surface-2 hover:bg-surface-3 text-text-secondary rounded-xl font-bold text-lg border border-border"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {displayError && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-xl p-3 text-center">
              {displayError}
            </div>
          )}

          <button
            type="submit"
            disabled={!code.trim() || !groupName.trim() || isJoining}
            className="w-full py-3 bg-accent hover:brightness-110 text-text-primary font-bold text-lg rounded-xl transition-all shadow-lg shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? t('player.connecting') : t('player.join')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PlayerJoinScreen;

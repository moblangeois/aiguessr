import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { GROUP_COLORS } from '../components/Map';
import { categories, getTotalQuestionCount, getQuestionCountByCategory } from '../data/questions';
import { useTranslation } from '../i18n/I18nContext';

const MODES = ['projection', 'classroom', 'multiplayer', 'research'];

const MODE_ICONS = {
  projection: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  classroom: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  multiplayer: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  research: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
};

export function ConfigScreen({ onStart, multiplayer }) {
  const { t } = useTranslation();

  const [selectedMode, setSelectedMode] = useState(null);
  const [groupCount, setGroupCount] = useState(4);
  const [groupNames, setGroupNames] = useState(['', '', '', '']);
  const [duration, setDuration] = useState(30);
  const [sessionCreating, setSessionCreating] = useState(false);

  const totalQuestions = useMemo(() => getTotalQuestionCount(), []);
  const questionsByCategory = useMemo(() => getQuestionCountByCategory(), []);

  const [categoryAllocation, setCategoryAllocation] = useState(() => {
    const catKeys = Object.keys(categories);
    const perCat = Math.floor(8 / catKeys.length);
    const remainder = 8 % catKeys.length;
    const alloc = {};
    catKeys.forEach((cat, i) => {
      alloc[cat] = Math.min(perCat + (i < remainder ? 1 : 0), getQuestionCountByCategory()[cat] || 0);
    });
    return alloc;
  });

  const questionCount = useMemo(
    () => Object.values(categoryAllocation).reduce((a, b) => a + b, 0),
    [categoryAllocation]
  );

  // Sync questionnaireMode to server when in research mode
  useEffect(() => {
    if (selectedMode === 'research' && multiplayer?.sessionCode && multiplayer?.setQuestionnaireMode) {
      multiplayer.setQuestionnaireMode(true);
    }
  }, [selectedMode, multiplayer?.sessionCode]);

  const handleGroupCountChange = (delta) => {
    const newCount = Math.max(2, Math.min(8, groupCount + delta));
    setGroupCount(newCount);
    if (newCount > groupNames.length) {
      setGroupNames([...groupNames, ...Array(newCount - groupNames.length).fill('')]);
    } else {
      setGroupNames(groupNames.slice(0, newCount));
    }
  };

  const handleCategoryChange = (cat, delta) => {
    setCategoryAllocation(prev => {
      const max = questionsByCategory[cat] || 0;
      const newVal = Math.max(0, Math.min(max, (prev[cat] || 0) + delta));
      return { ...prev, [cat]: newVal };
    });
  };

  const handleNameChange = (index, value) => {
    const newNames = [...groupNames];
    newNames[index] = value;
    setGroupNames(newNames);
  };

  const handleCreateSession = useCallback(async () => {
    if (!multiplayer) return;
    setSessionCreating(true);
    const questionnaireMode = selectedMode === 'research';
    await multiplayer.createSession({ questionnaireMode });
    setSessionCreating(false);
  }, [multiplayer, selectedMode]);

  const handleStart = () => {
    if (questionCount < 2) {
      alert(t('config.minQuestions'));
      return;
    }

    const isClassroom = selectedMode === 'classroom';
    const isMultiplayer = selectedMode === 'multiplayer' || selectedMode === 'research';
    const isQuestionnaire = selectedMode === 'research';

    if (isMultiplayer) {
      const remoteGroupNames = multiplayer?.connectedGroups?.map(g => g.name) || [];
      if (remoteGroupNames.length < 1) {
        alert(isQuestionnaire ? t('config.minParticipants') : t('config.minTeamsConnected'));
        return;
      }
      const allNames = isQuestionnaire
        ? remoteGroupNames
        : [...new Set([...groupNames.filter(n => n.trim() !== ''), ...remoteGroupNames])];
      onStart(allNames, duration, categoryAllocation, false, true, isQuestionnaire);
    } else {
      const validNames = groupNames.filter(n => n.trim() !== '');
      if (validNames.length < 2) {
        alert(t('config.minTeams'));
        return;
      }
      onStart(groupNames, duration, categoryAllocation, isClassroom, false, false);
    }
  };

  const joinUrl = multiplayer?.sessionCode
    ? `${window.location.origin}/join/${multiplayer.sessionCode}`
    : null;

  const durationOptions = [
    { value: 15, label: '15s' },
    { value: 30, label: '30s' },
    { value: 60, label: '1 min' },
    { value: 120, label: '2 min' }
  ];

  const needsTeamConfig = selectedMode === 'projection' || selectedMode === 'classroom';
  const needsMultiplayer = selectedMode === 'multiplayer' || selectedMode === 'research';

  return (
    <div className="h-screen bg-surface-0 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-surface-1 backdrop-blur-sm rounded-3xl p-8 w-full max-w-4xl shadow-2xl border border-border max-h-[calc(100vh-3rem)] overflow-y-auto">

        {/* Title */}
        <div className="text-center mb-6">
          <h1
            className="text-5xl font-black bg-clip-text text-transparent mb-2"
            style={{ backgroundImage: 'linear-gradient(to right, var(--accent), var(--warm))' }}
          >
            {t('config.title')}
          </h1>
          <p className="text-accent text-lg">
            {t('config.subtitle')}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedMode ? (
            /* =================== STEP 1: MODE SELECTION =================== */
            <motion.div
              key="mode-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-center text-text-secondary font-semibold text-lg mb-4">
                {t('config.chooseMode')}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-2">
                {MODES.map((mode) => {
                  const isDisabled = (mode === 'multiplayer' || mode === 'research') && !multiplayer;
                  return (
                    <button
                      key={mode}
                      onClick={() => !isDisabled && setSelectedMode(mode)}
                      disabled={isDisabled}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 group ${
                        isDisabled
                          ? 'border-border bg-surface-2/30 opacity-40 cursor-not-allowed'
                          : 'border-border bg-surface-2/50 hover:border-accent hover:bg-accent/5 hover:scale-[1.02] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                          isDisabled ? 'bg-surface-3 text-text-muted' : 'bg-accent/10 text-accent group-hover:bg-accent/20'
                        }`}>
                          {MODE_ICONS[mode]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-text-primary font-bold text-lg mb-1">
                            {t(`config.mode_${mode}`)}
                          </h3>
                          <p className="text-text-muted text-sm leading-relaxed">
                            {t(`config.mode_${mode}_desc`)}
                          </p>
                        </div>
                      </div>
                      {isDisabled && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-surface-1 text-text-muted text-xs px-3 py-1 rounded-lg border border-border">
                            {t('config.serverRequired')}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* =================== STEP 2: CONFIGURATION =================== */
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Back button + mode badge */}
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => setSelectedMode(null)}
                  className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">{t('common.back')}</span>
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-xl">
                  <span className="text-accent">{MODE_ICONS[selectedMode]}</span>
                  <span className="text-accent font-bold text-sm">{t(`config.mode_${selectedMode}`)}</span>
                </div>
              </div>

              {/* Multiplayer: session creation */}
              {needsMultiplayer && multiplayer && (
                <div className="mb-5">
                  {!multiplayer.sessionCode ? (
                    <button
                      onClick={handleCreateSession}
                      disabled={sessionCreating}
                      className="w-full py-3.5 bg-accent hover:bg-accent-hover text-text-inverse font-bold rounded-xl transition-all shadow-lg shadow-accent/30 disabled:opacity-50 text-lg"
                    >
                      {sessionCreating ? t('config.creating') : t('config.createSession')}
                    </button>
                  ) : (
                    <div className="bg-surface-2 border-2 border-accent/30 rounded-2xl p-4">
                      <div className="flex gap-5 items-start">
                        <div className="flex-shrink-0 bg-white p-3 rounded-xl shadow-md">
                          <QRCodeSVG value={joinUrl} size={120} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-accent font-bold text-sm mb-1">{t('config.sessionCode')}</div>
                          <div className="text-4xl font-black text-text-primary tracking-[0.2em] mb-2">
                            {multiplayer.sessionCode}
                          </div>
                          <div className="text-text-muted text-xs mb-2 break-all">{joinUrl}</div>
                          <div className="text-accent font-bold text-sm mb-1">
                            {selectedMode === 'research' ? t('config.participants') : t('config.connectedTeams')} ({multiplayer.connectedGroups.length})
                          </div>
                          {multiplayer.connectedGroups.length === 0 ? (
                            <div className="text-text-muted text-sm animate-pulse">
                              {t('config.waitingForPlayers')}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {multiplayer.connectedGroups.map((g) => (
                                <span
                                  key={g.name}
                                  className={`px-2 py-1 rounded-lg text-sm font-medium ${
                                    g.connected
                                      ? 'bg-accent-light text-accent border border-accent/30'
                                      : 'bg-surface-3 text-text-muted border border-border'
                                  }`}
                                >
                                  {g.name}{selectedMode !== 'research' && ` (${g.memberCount})`}
                                  {!g.connected && ` (${t('config.offline')})`}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Configuration sections */}
              <div className="space-y-5 mb-5">

                {/* Teams (only for projection/classroom) */}
                {needsTeamConfig && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-secondary font-semibold mb-2 text-lg">
                        {t("config.numberOfTeams")}
                      </label>
                      <div className="flex items-center justify-center gap-6">
                        <button onClick={() => handleGroupCountChange(-1)} className="w-10 h-10 bg-surface-3 hover:bg-surface-2 text-text-secondary rounded-xl font-bold text-xl transition-all shadow-lg active:scale-95 border border-border">-</button>
                        <span className="text-3xl font-black text-text-primary w-12 text-center">{groupCount}</span>
                        <button onClick={() => handleGroupCountChange(1)} className="w-10 h-10 bg-surface-3 hover:bg-surface-2 text-text-secondary rounded-xl font-bold text-xl transition-all shadow-lg active:scale-95 border border-border">+</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-text-secondary font-semibold mb-2 text-lg">{t("config.teamNames")}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {groupNames.map((name, index) => (
                          <div key={index} className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: GROUP_COLORS[index] }} />
                            <input type="text" value={name} onChange={(e) => handleNameChange(index, e.target.value)} placeholder={t("config.teamPlaceholder", { index: index + 1 })} className="w-full pl-8 pr-3 py-2 bg-surface-2 border-2 border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all text-sm" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode tips */}
                {selectedMode === "classroom" && (<div className="p-3 bg-warm-light border border-warm/30 rounded-xl text-sm text-warm"><strong>{t("config.classroomTip")}</strong></div>)}
                {selectedMode === "research" && (<div className="p-3 bg-accent/5 border border-accent/20 rounded-xl text-sm text-accent"><strong>{t("config.researchTip")}</strong></div>)}
                {selectedMode === "multiplayer" && !multiplayer?.sessionCode && (<div className="text-text-muted text-sm italic text-center py-4">{t("config.createSessionFirst")}</div>)}

                {/* Questions per category */}
                <div>
                  <label className="block text-text-secondary font-semibold mb-2 text-lg">
                    {t('config.questionsPerCategory')}
                    <span className="ml-2 text-accent font-black">{questionCount}</span>
                    <span className="text-text-muted font-normal text-sm ml-1">/ {totalQuestions}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(categories).map(([key, cat]) => {
                      const max = questionsByCategory[key] || 0;
                      const current = categoryAllocation[key] || 0;
                      return (
                        <div key={key} className="flex items-center gap-2 bg-surface-2 rounded-xl p-2 border border-border/50">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-text-secondary font-medium text-sm flex-1 truncate">{t('categories.' + key)}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCategoryChange(key, -1)}
                              disabled={current <= 0}
                              className="w-7 h-7 bg-surface-3 hover:bg-surface-2 text-text-secondary rounded-lg font-bold text-sm transition-all border border-border disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <span className="text-base font-black text-text-primary w-5 text-center">{current}</span>
                            <button
                              onClick={() => handleCategoryChange(key, 1)}
                              disabled={current >= max}
                              className="w-7 h-7 bg-surface-3 hover:bg-surface-2 text-text-secondary rounded-lg font-bold text-sm transition-all border border-border disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                            <span className="text-text-muted text-xs w-7">/{max}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {questionCount < 2 && (
                    <p className="text-danger text-sm mt-2">{t('config.minQuestions')}</p>
                  )}
                </div>

                {/* Research time */}
                <div>
                  <label className="block text-text-secondary font-semibold mb-2 text-lg">
                    {t('config.researchTime')}
                  </label>
                  <div className="flex gap-2">
                    {durationOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDuration(opt.value)}
                        className={`flex-1 py-2 rounded-xl font-bold transition-all duration-200 text-sm ${
                          duration === opt.value
                            ? 'bg-accent text-text-inverse shadow-lg shadow-accent/30'
                            : 'bg-surface-2 text-text-muted hover:bg-surface-3 border border-border'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start button */}
              <button
                onClick={handleStart}
                className="w-full py-3.5 bg-accent hover:bg-accent-hover text-text-inverse font-black text-xl rounded-xl transition-all duration-200 shadow-xl shadow-accent/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('config.startGame')}
              </button>

              <p className="text-center text-text-muted text-sm mt-3">
                {t('config.estimatedDuration', { minutes: Math.round(questionCount * (duration / 60 + 1.5)) })}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ConfigScreen;

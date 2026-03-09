import { useMemo, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { GROUP_COLORS } from '../components/Map';
import { categories } from '../data/questions';
import { exportGameToJSON, downloadJSON } from '../utils/jsonExporter';
import { generatePDF, downloadPDF } from '../utils/pdfGenerator';
import { useTranslation } from '../i18n/I18nContext';

// Animated counter component
function AnimatedCounter({ value, duration = 2000 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(easeOut * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

// ─── Tab: Podium ──────────────────────────────────────────────────────────────
function PodiumTab({ ranking, groups, podiumStep, t }) {
  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 items-center">
      {/* Podium visualization */}
      {ranking.length >= 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="flex items-end justify-center gap-4 h-72">
            {/* 2nd place */}
            {ranking[1] && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={podiumStep >= 2 ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <span
                  className="w-6 h-6 rounded-full shadow-lg mb-2"
                  style={{ backgroundColor: GROUP_COLORS[groups.indexOf(ranking[1].name)] }}
                />
                <div className="text-text-primary font-bold text-base mb-1">{ranking[1].name}</div>
                <div className="text-accent font-bold text-lg mb-2">
                  {podiumStep >= 2 && <AnimatedCounter value={ranking[1].points} duration={800} />} {t('common.pts')}
                </div>
                <div className="w-28 bg-gradient-to-t from-accent to-accent-hover rounded-t-lg flex items-end justify-center h-32 shadow-lg">
                  <span className="text-text-inverse/70 font-black text-3xl mb-3">2</span>
                </div>
              </motion.div>
            )}

            {/* 1st place */}
            {ranking[0] && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={podiumStep >= 3 ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <span
                  className="w-8 h-8 rounded-full shadow-lg mb-2 ring-2 ring-warm/50"
                  style={{ backgroundColor: GROUP_COLORS[groups.indexOf(ranking[0].name)] }}
                />
                <div className="text-text-primary font-black text-xl mb-1">{ranking[0].name}</div>
                <div className="text-warm font-black text-2xl mb-2">
                  {podiumStep >= 3 && <AnimatedCounter value={ranking[0].points} duration={1000} />} {t('common.pts')}
                </div>
                <div className="w-32 bg-gradient-to-t from-warm to-warm-hover rounded-t-lg flex items-end justify-center h-44 shadow-lg">
                  <span className="text-text-inverse/70 font-black text-4xl mb-3">1</span>
                </div>
              </motion.div>
            )}

            {/* 3rd place */}
            {ranking[2] && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={podiumStep >= 1 ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <span
                  className="w-5 h-5 rounded-full shadow-lg mb-2"
                  style={{ backgroundColor: GROUP_COLORS[groups.indexOf(ranking[2].name)] }}
                />
                <div className="text-text-primary font-bold text-sm mb-1">{ranking[2].name}</div>
                <div className="text-accent font-bold text-base mb-2">
                  {podiumStep >= 1 && <AnimatedCounter value={ranking[2].points} duration={600} />} {t('common.pts')}
                </div>
                <div className="w-24 bg-gradient-to-t from-accent-muted to-accent rounded-t-lg flex items-end justify-center h-24 shadow-lg">
                  <span className="text-text-inverse/70 font-black text-2xl mb-3">3</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Full ranking list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex-1 min-h-0"
      >
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wide mb-3">
          {t('final.fullRanking')}
        </h3>
        <div className="space-y-2">
          {ranking.map((team, index) => {
            const groupIdx = groups.indexOf(team.name);
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            return (
              <motion.div
                key={team.name}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  isFirst
                    ? 'bg-warm-light border border-warm/50'
                    : isSecond || isThird
                    ? 'bg-accent-light border border-accent/30'
                    : 'bg-surface-1 border border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-black ${
                    isFirst ? 'text-warm' :
                    isSecond || isThird ? 'text-accent' :
                    'text-text-muted'
                  }`}>
                    #{index + 1}
                  </span>
                  <span
                    className="w-4 h-4 rounded-full shadow"
                    style={{ backgroundColor: GROUP_COLORS[groupIdx >= 0 ? groupIdx : index] }}
                  />
                  <span className="text-text-primary font-bold">{team.name}</span>
                </div>
                <span className={`font-black text-lg ${
                  isFirst ? 'text-warm' : 'text-accent'
                }`}>
                  {team.points} {t('common.pts')}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Tab: Stats ───────────────────────────────────────────────────────────────
function StatsTab({ categoryStats, questions, answers, groups, t, tContent }) {
  // Compute best/worst group per category
  const categoryGroupStats = useMemo(() => {
    const result = {};
    const categoryKeys = Object.keys(categories);

    categoryKeys.forEach(cat => {
      const groupDistances = {};
      groups.forEach(g => { groupDistances[g] = { total: 0, count: 0 }; });

      questions.forEach(q => {
        if (q.category !== cat) return;
        const questionAnswers = answers[q.id];
        if (!questionAnswers) return;

        Object.entries(questionAnswers).forEach(([groupName, data]) => {
          if (groupDistances[groupName]) {
            groupDistances[groupName].total += data.distance;
            groupDistances[groupName].count++;
          }
        });
      });

      const withAvg = Object.entries(groupDistances)
        .filter(([, d]) => d.count > 0)
        .map(([name, d]) => ({ name, avg: Math.round(d.total / d.count) }))
        .sort((a, b) => a.avg - b.avg);

      result[cat] = {
        best: withAvg[0] || null,
        worst: withAvg[withAvg.length - 1] || null
      };
    });

    return result;
  }, [questions, answers, groups]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 min-h-0"
    >
      <h3 className="text-sm font-bold text-text-muted uppercase tracking-wide mb-4">
        {t('final.performanceByCategory')}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(categories).map(([key, cat]) => {
          const stats = categoryStats[key];
          const groupInfo = categoryGroupStats[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-surface-1 rounded-xl p-4 border border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-text-primary font-bold">{tContent(cat, 'name')}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="bg-surface-2 rounded-lg p-2">
                  <div className="text-text-muted text-xs">{t('common.questions')}</div>
                  <div className="text-text-primary font-bold">{stats.questionsCount}</div>
                </div>
                <div className="bg-surface-2 rounded-lg p-2">
                  <div className="text-text-muted text-xs">{t('final.avgDistance')}</div>
                  <div className="text-text-primary font-bold">{stats.averageDistance} {t('common.km')}</div>
                </div>
              </div>

              {/* Best / worst group */}
              <div className="flex gap-2 text-xs">
                {groupInfo?.best && (
                  <div className="flex-1 bg-accent-light rounded-lg p-2">
                    <div className="text-text-muted">{t('final.bestGroup')}</div>
                    <div className="text-accent font-bold truncate">{groupInfo.best.name}</div>
                    <div className="text-text-secondary">{groupInfo.best.avg} {t('common.km')}</div>
                  </div>
                )}
                {groupInfo?.worst && groupInfo.worst.name !== groupInfo.best?.name && (
                  <div className="flex-1 bg-warm-light rounded-lg p-2">
                    <div className="text-text-muted">{t('final.worstGroup')}</div>
                    <div className="text-warm font-bold truncate">{groupInfo.worst.name}</div>
                    <div className="text-text-secondary">{groupInfo.worst.avg} {t('common.km')}</div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Tab: Details ─────────────────────────────────────────────────────────────
function DetailsTab({ questionDetails, answers, groups, t, tContent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col min-h-0"
    >
      <h3 className="text-sm font-bold text-text-muted uppercase tracking-wide mb-3 flex-shrink-0">
        {t('final.questionDetails')}
      </h3>

      {/* Scrollable list -- ONLY scrollable area on this screen */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {questionDetails.map(({ question, best }, index) => {
          const questionAnswers = answers[question.id] || {};

          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="bg-surface-1 rounded-xl p-4 border border-border"
            >
              {/* Question header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-surface-2 text-accent font-mono text-xs px-2 py-1 rounded-lg">
                  Q{index + 1}
                </span>
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: question.color }}
                />
                <span className="text-text-primary font-medium text-sm truncate">
                  {tContent(question.target, 'name') || t('common.question')}
                </span>
              </div>

              {/* Correct location */}
              {tContent(question.target, 'name') && (
                <div className="text-xs text-text-muted mb-2">
                  {t('final.correctLocation')}: <span className="text-text-secondary">{tContent(question.target, 'name')}</span>
                </div>
              )}

              {/* Per-group results */}
              <div className="space-y-1">
                {Object.entries(questionAnswers)
                  .sort((a, b) => a[1].distance - b[1].distance)
                  .map(([groupName, data]) => {
                    const groupIdx = groups.indexOf(groupName);
                    return (
                      <div key={groupName} className="flex items-center justify-between text-xs bg-surface-2 rounded-lg px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: GROUP_COLORS[groupIdx >= 0 ? groupIdx : 0] }}
                          />
                          <span className="text-text-secondary font-medium">{groupName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-text-muted">{data.distance} {t('common.km')}</span>
                          <span className="text-accent font-bold">{data.points} {t('common.pts')}</span>
                        </div>
                      </div>
                    );
                  })}
                {Object.keys(questionAnswers).length === 0 && (
                  <div className="text-xs text-text-muted italic">{t('common.noAnswer')}</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Main FinalScreen ─────────────────────────────────────────────────────────
export function FinalScreen({
  ranking,
  questions,
  answers,
  groups,
  scores,
  timerDuration,
  onShowBilan,
  onNewGame,
  questionnaireMode,
  questionnaireResponses
}) {
  const { t, tContent } = useTranslation();

  const [activeTab, setActiveTab] = useState('podium');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showPodium, setShowPodium] = useState(false);
  const [podiumStep, setPodiumStep] = useState(0);

  // Confetti + podium animation on mount (only for Podium tab)
  useEffect(() => {
    setTimeout(() => setShowPodium(true), 300);
    setTimeout(() => setPodiumStep(1), 800);
    setTimeout(() => setPodiumStep(2), 1400);
    setTimeout(() => setPodiumStep(3), 2000);

    const confettiTimer = setTimeout(() => {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#10b981', '#f59e0b', '#fbbf24', '#8b5cf6']
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#10b981', '#f59e0b', '#fbbf24', '#8b5cf6']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }, 2000);

    return () => clearTimeout(confettiTimer);
  }, []);

  // Question details (best per question)
  const questionDetails = useMemo(() => {
    return questions.map(q => {
      const questionAnswers = answers[q.id];
      if (!questionAnswers) {
        return { question: q, best: null };
      }

      const results = Object.entries(questionAnswers)
        .map(([groupName, data]) => ({ groupName, ...data }))
        .sort((a, b) => a.distance - b.distance);

      return {
        question: q,
        best: results[0] || null
      };
    });
  }, [questions, answers]);

  // Category statistics
  const categoryStats = useMemo(() => {
    const stats = {};
    const categoryKeys = Object.keys(categories);

    categoryKeys.forEach(cat => {
      stats[cat] = {
        questionsCount: 0,
        answersCount: 0,
        totalDistance: 0,
        averageDistance: 0
      };
    });

    questions.forEach(q => {
      if (stats[q.category]) {
        stats[q.category].questionsCount++;
      }
    });

    Object.entries(answers).forEach(([questionId, questionAnswers]) => {
      const question = questions.find(q => q.id === questionId);
      if (!question || !stats[question.category]) return;

      Object.values(questionAnswers).forEach(data => {
        stats[question.category].answersCount++;
        stats[question.category].totalDistance += data.distance;
      });
    });

    categoryKeys.forEach(cat => {
      if (stats[cat].answersCount > 0) {
        stats[cat].averageDistance = Math.round(stats[cat].totalDistance / stats[cat].answersCount);
      }
    });

    return stats;
  }, [questions, answers]);

  // Export JSON
  const handleExportJSON = useCallback(() => {
    const gameData = {
      groups,
      scores,
      questions,
      answers,
      timerDuration,
      questionnaireResponses
    };
    const exportData = exportGameToJSON(gameData);
    const filename = `aiguessr-${new Date().toISOString().split('T')[0]}.json`;
    downloadJSON(exportData, filename);
    setExportStatus({ type: 'success', message: t('final.downloadJSON') + ' OK' });
    setTimeout(() => setExportStatus(null), 3000);
  }, [groups, scores, questions, answers, timerDuration, questionnaireResponses, t]);

  // Export PDF
  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const gameData = { groups, scores, questions, answers };
      const doc = await generatePDF(gameData);
      const filename = `aiguessr-bilan-${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(doc, filename);
      setExportStatus({ type: 'success', message: t('final.downloadPDF') + ' OK' });
    } catch (error) {
      console.error('PDF export error:', error);
      setExportStatus({ type: 'error', message: t('common.error') });
    }
    setIsExporting(false);
    setTimeout(() => setExportStatus(null), 3000);
  }, [groups, scores, questions, answers, t]);



  const tabs = [
    { id: 'podium', label: t('final.tabPodium') },
    { id: 'stats', label: t('final.tabStats') },
    { id: 'details', label: t('final.tabDetails') }
  ];

  return (
    <div className="h-screen flex flex-col bg-surface-0 overflow-hidden">
      {/* ── Header ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-shrink-0 px-6 pt-5 pb-3 text-center"
      >
        <h1 className="text-3xl font-black text-text-primary mb-1">
          {t('final.title')}
        </h1>
        <p className="text-text-muted text-sm">
          {t('final.subtitle')}
        </p>
      </motion.div>

      {/* ── Tab bar ──────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6">
        <div className="flex border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-bold transition-all relative ${
                activeTab === tab.id
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="final-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────────── */}
      <div className="flex-1 min-h-0 px-6 py-4 flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'podium' && showPodium && (
            <motion.div
              key="podium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <PodiumTab ranking={ranking} groups={groups} podiumStep={podiumStep} t={t} />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <StatsTab
                categoryStats={categoryStats}
                questions={questions}
                answers={answers}
                groups={groups}
                t={t}
                tContent={tContent}
              />
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <DetailsTab
                questionDetails={questionDetails}
                answers={answers}
                groups={groups}
                t={t}
                tContent={tContent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Actions bar ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.5 }}
        className="flex-shrink-0 px-6 py-4 border-t border-border bg-surface-0"
      >
        <div className="flex flex-wrap justify-center gap-3">
          {questionnaireMode && questionnaireResponses?.length > 0 && (
            <span className="px-3 py-2 bg-warm-light text-warm font-bold text-xs rounded-xl border border-warm/30">
              {t('final.postSurveys', { count: questionnaireResponses.filter(r => r.phase === 'post').length })}
            </span>
          )}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-5 py-3 bg-warm hover:bg-warm-hover text-text-inverse font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            {t('final.export')}
          </button>
          <button
            onClick={onShowBilan}
            className="px-5 py-3 bg-surface-2 hover:bg-surface-3 text-text-secondary font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow border border-border"
          >
            {t('final.viewOverviewMap')}
          </button>
          <button
            onClick={onNewGame}
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-text-inverse font-black rounded-xl transition-all duration-200 hover:scale-105 shadow-xl"
          >
            {t('final.newGame')}
          </button>
        </div>
      </motion.div>

      {/* ── Export status toast ───────────────────────────────── */}
      <AnimatePresence>
        {exportStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl font-medium z-50 ${
              exportStatus.type === 'success' ? 'bg-accent text-text-inverse' :
              exportStatus.type === 'error' ? 'bg-red-600 text-white' :
              'bg-warm text-text-inverse'
            }`}
          >
            {exportStatus.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Export modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-surface-0/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface-1 rounded-2xl w-full max-w-md shadow-2xl border border-border p-6"
            >
              <h3 className="text-xl font-black text-text-primary mb-5">{t('final.exportResults')}</h3>

              <div className="space-y-3">
                <button
                  onClick={handleExportJSON}
                  disabled={isExporting}
                  className="w-full px-5 py-3 bg-surface-2 hover:bg-surface-3 text-text-secondary font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] border border-border text-left"
                >
                  <div className="font-bold">{t('final.downloadJSON')}</div>
                  <div className="text-text-muted text-sm">{t('final.jsonDesc')}</div>
                </button>

                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="w-full px-5 py-3 bg-surface-2 hover:bg-surface-3 text-text-secondary font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] border border-border text-left"
                >
                  <div className="font-bold">{t('final.downloadPDF')}</div>
                  <div className="text-text-muted text-sm">{t('final.pdfDesc')}</div>
                </button>
              </div>

              <button
                onClick={() => setShowExportModal(false)}
                className="w-full mt-5 px-5 py-3 bg-surface-2 hover:bg-surface-3 text-text-muted font-bold rounded-xl transition-all border border-border"
              >
                {t('common.close')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FinalScreen;

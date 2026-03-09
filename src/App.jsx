import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameState } from './hooks/useGameState';
import { useMultiplayerSession } from './hooks/useMultiplayerSession';
import { AppTimeProvider } from './contexts/AppTimeContext';
import { MapProvider } from './contexts/MapContext';
import { ConfigScreen } from './screens/ConfigScreen';
import { QuestionIntroScreen } from './screens/QuestionIntroScreen';
import { ResearchScreen } from './screens/ResearchScreen';
import { AnswerScreen } from './screens/AnswerScreen';
import { BlindAnswerScreen } from './screens/BlindAnswerScreen';
import { RevealScreen } from './screens/RevealScreen';
import { ImpactRevealScreen } from './screens/ImpactRevealScreen';
import { FinalScreen } from './screens/FinalScreen';
import { BilanMapScreen } from './screens/BilanMapScreen';
import { RecapModal } from './screens/RecapModal';
import { TopBar } from './components/ui/TopBar';
import { PlayerJoinScreen } from './screens/PlayerJoinScreen';
import { PlayerGameScreen } from './screens/PlayerGameScreen';
import { QuestionnaireScreen } from './screens/QuestionnaireScreen';

// Détecter si on est sur la route /join/:code
function getJoinCode() {
  const match = window.location.pathname.match(/^\/join\/([A-Za-z0-9]+)/);
  return match ? match[1].toUpperCase() : null;
}

function App() {
  const joinCode = getJoinCode();

  // Si on est sur /join, afficher l'interface joueur
  if (joinCode) {
    return <PlayerApp initialCode={joinCode} />;
  }

  return <HostApp />;
}

// ============================================
// App joueur (mobile)
// ============================================
function PlayerApp({ initialCode }) {
  const multiplayer = useMultiplayerSession();
  const [joined, setJoined] = useState(false);
  const [validating, setValidating] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [sessionQuestionnaireMode, setSessionQuestionnaireMode] = useState(false);
  const [preQuestionnaireDone, setPreQuestionnaireDone] = useState(false);
  const [postQuestionnaireDone, setPostQuestionnaireDone] = useState(false);

  // Vérifier que le code de session existe avant d'afficher quoi que ce soit
  useEffect(() => {
    async function checkSession() {
      try {
        const serverUrl = import.meta.env.DEV
          ? `http://${window.location.hostname}:3001`
          : '';
        const res = await fetch(`${serverUrl}/api/session/${initialCode}`);
        if (res.ok) {
          const data = await res.json();
          setSessionValid(true);
          setSessionQuestionnaireMode(!!data.questionnaireMode);
        } else {
          setSessionValid(false);
        }
      } catch {
        setSessionValid(false);
      }
      setValidating(false);
    }
    checkSession();
  }, [initialCode]);

  const handleJoin = useCallback(async (code, groupName, memberCount) => {
    const result = await multiplayer.joinSession(code, groupName, memberCount);
    if (result.success) {
      setJoined(true);
    }
    return result;
  }, [multiplayer]);

  const handlePreQuestionnaireSubmit = useCallback(async (data) => {
    await multiplayer.submitQuestionnaire({
      ...data,
      groupName: multiplayer.groupName
    });
    setPreQuestionnaireDone(true);
  }, [multiplayer]);

  const handlePostQuestionnaireSubmit = useCallback(async (data) => {
    await multiplayer.submitQuestionnaire({
      ...data,
      groupName: multiplayer.groupName
    });
    setPostQuestionnaireDone(true);
  }, [multiplayer]);

  if (validating) {
    return (
      <div className="h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-text-muted animate-pulse">...</div>
      </div>
    );
  }

  if (!sessionValid) {
    return (
      <div className="h-screen bg-surface-0 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-7xl font-black text-text-muted mb-2">404</h1>
          <p className="text-text-secondary text-sm">This page does not exist.</p>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <PlayerJoinScreen
        initialCode={initialCode}
        onJoin={handleJoin}
        error={multiplayer.error}
        questionnaireMode={sessionQuestionnaireMode}
      />
    );
  }

  // Questionnaire mode from server state or join response
  const qMode = sessionQuestionnaireMode || multiplayer.questionnaireMode || multiplayer.gameState?.questionnaireMode;

  // Pré-questionnaire : après join, avant de voir le lobby
  if (qMode && !preQuestionnaireDone) {
    return (
      <QuestionnaireScreen
        phase="pre"
        onSubmit={handlePreQuestionnaireSubmit}
      />
    );
  }

  // Post-questionnaire : quand la phase est 'final' et pas encore rempli
  const phase = multiplayer.gameState?.phase;
  if (qMode && phase === 'final' && !postQuestionnaireDone) {
    return (
      <QuestionnaireScreen
        phase="post"
        onSubmit={handlePostQuestionnaireSubmit}
      />
    );
  }

  return (
    <PlayerGameScreen
      gameState={multiplayer.gameState}
      groupName={multiplayer.groupName}
      onSubmitAnswer={multiplayer.submitAnswer}
      onDisconnect={multiplayer.disconnect}
    />
  );
}

// ============================================
// App présentateur (écran principal)
// ============================================
function HostApp() {
  const multiplayer = useMultiplayerSession();

  const {
    // Etat
    currentScreen,
    groups,
    timerDuration,
    questions,
    currentQuestionIndex,
    currentGroupIndex,
    isPaused,
    showRecap,
    answers,
    scores,

    // Question actuelle
    currentQuestion,
    currentGroup,
    remainingGroups,

    // Actions
    startGame,
    startTimer,
    goToAnswerPhase,
    submitAnswer,
    submitAllAnswers,
    nextGroup,
    nextQuestion,
    continueFromImpact,
    goToFinal,
    skipToFinal,
    goToBilan,
    resetGame,
    togglePause,
    toggleRecap,
    setCurrentScreen,

    // Helpers
    getRanking,
    getCurrentQuestionResults,
    getCurrentHintLevel,
    totalQuestions,
    groupOrder,

    // Indices
    useHint,

    // Questionnaire
    questionnaireMode,
    questionnaireResponses,
    addQuestionnaireResponse,

    // Timer
    timeRemaining,
    setTimeRemaining,

    // Constantes
    SCREENS
  } = useGameState();

  // Synchroniser le timer avec le serveur WebSocket si session active (toutes les 2s)
  const lastSyncedTimer = useRef(-1);
  useEffect(() => {
    if (!multiplayer.sessionCode || !multiplayer.isHost) return;
    // Sync toutes les 2 secondes ou quand le timer atteint 0
    if (timeRemaining === 0 || Math.abs(lastSyncedTimer.current - timeRemaining) >= 2) {
      lastSyncedTimer.current = timeRemaining;
      multiplayer.syncTimer(timeRemaining);
    }
  }, [timeRemaining, multiplayer.sessionCode, multiplayer.isHost]);

  // Synchroniser les changements de phase avec WebSocket
  useEffect(() => {
    if (!multiplayer.sessionCode || !multiplayer.isHost) return;

    const phaseMap = {
      [SCREENS.RESEARCH]: 'research',
      [SCREENS.ANSWER]: 'answer',
      [SCREENS.BLIND_ANSWER]: 'answer',
      [SCREENS.REVEAL]: 'reveal',
      [SCREENS.IMPACT_REVEAL]: 'impact',
      [SCREENS.FINAL]: 'final',
      [SCREENS.QUESTION_INTRO]: 'research'
    };

    const phase = phaseMap[currentScreen];
    if (phase) {
      multiplayer.changePhase(phase, currentQuestionIndex);
    }
  }, [currentScreen, currentQuestionIndex, multiplayer.sessionCode, multiplayer.isHost]);

  // Synchroniser les scores avec WebSocket
  useEffect(() => {
    if (multiplayer.sessionCode && multiplayer.isHost) {
      multiplayer.syncScores(scores, answers);
    }
  }, [scores, answers, multiplayer.sessionCode, multiplayer.isHost]);

  // Écouter les réponses des joueurs distants
  useEffect(() => {
    if (!multiplayer.sessionCode || !multiplayer.isHost) return;

    multiplayer.onAnswerReceived((data) => {
      // Calculer et enregistrer la réponse du joueur distant
      submitAnswer(data.groupName, data.lat, data.lng);
    });
  }, [multiplayer.sessionCode, multiplayer.isHost, submitAnswer]);

  // Écouter les réponses questionnaire des joueurs
  useEffect(() => {
    if (!multiplayer.sessionCode || !multiplayer.isHost) return;
    multiplayer.onQuestionnaireReceived((response) => {
      addQuestionnaireResponse(response);
    });
  }, [multiplayer.sessionCode, multiplayer.isHost, addQuestionnaireResponse]);

  // Wrapper pour startGame : aussi notifier le serveur WebSocket et sync questionnaire mode
  const handleStartGame = useCallback((groupNames, duration, questionCount, isClassroomMode, isMultiplayer, isQuestionnaireMode) => {
    if (isQuestionnaireMode && multiplayer.sessionCode) {
      multiplayer.setQuestionnaireMode(isQuestionnaireMode);
    }
    const result = startGame(groupNames, duration, questionCount, isClassroomMode, isMultiplayer, isQuestionnaireMode);
    return result;
  }, [startGame, multiplayer]);

  // Notifier WebSocket quand le jeu démarre (après que les questions soient set)
  useEffect(() => {
    if (multiplayer.sessionCode && multiplayer.isHost && questions.length > 0 && currentScreen === SCREENS.QUESTION_INTRO && currentQuestionIndex === 0) {
      multiplayer.startGame(questions, timerDuration);
    }
  }, [questions, currentScreen, currentQuestionIndex, multiplayer.sessionCode, multiplayer.isHost, timerDuration]);

  const renderScreen = () => {
    let screen;
    let key;

    switch (currentScreen) {
      case SCREENS.CONFIG:
        key = 'config';
        screen = (
          <ConfigScreen
            onStart={handleStartGame}
            multiplayer={multiplayer}
          />
        );
        break;

      case SCREENS.QUESTION_INTRO:
        key = `question-intro-${currentQuestionIndex}`;
        screen = (
          <QuestionIntroScreen
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            onStart={startTimer}
            answers={answers}
          />
        );
        break;

      case SCREENS.RESEARCH:
        key = `research-${currentQuestionIndex}`;
        screen = (
          <ResearchScreen
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            timerDuration={timerDuration}
            isPaused={isPaused}
            onTogglePause={togglePause}
            onTimeUp={goToAnswerPhase}
            onShowRecap={toggleRecap}
            onGoToAnswers={goToAnswerPhase}
            onSkipToFinal={skipToFinal}
            currentHintLevel={getCurrentHintLevel()}
            onUseHint={useHint}
            groups={groups}
            scores={scores}
            questions={questions}
            answers={answers}
            onTimerTick={setTimeRemaining}
          />
        );
        break;

      case SCREENS.ANSWER:
        key = `answer-${currentQuestionIndex}`;
        screen = (
          <AnswerScreen
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            currentGroup={currentGroup}
            remainingGroups={remainingGroups}
            groupIndex={groupOrder[currentGroupIndex] ?? currentGroupIndex}
            totalGroups={groups.length}
            onSubmitAnswer={submitAnswer}
            onNextGroup={nextGroup}
            onShowRecap={toggleRecap}
            onSkipToFinal={skipToFinal}
            groups={groups}
            scores={scores}
            timeRemaining={timeRemaining}
            groupOrder={groupOrder}
          />
        );
        break;

      case SCREENS.BLIND_ANSWER:
        key = `blind-answer-${currentQuestionIndex}`;
        screen = (
          <BlindAnswerScreen
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            groups={groups}
            scores={scores}
            onSubmitAllAnswers={submitAllAnswers}
            onShowRecap={toggleRecap}
            onSkipToFinal={skipToFinal}
          />
        );
        break;

      case SCREENS.REVEAL:
        key = `reveal-${currentQuestionIndex}`;
        screen = (
          <RevealScreen
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            results={getCurrentQuestionResults()}
            groups={groups}
            onShowRecap={toggleRecap}
            onShowRanking={goToFinal}
            onNextQuestion={nextQuestion}
            isLastQuestion={currentQuestionIndex >= totalQuestions - 1}
          />
        );
        break;

      case SCREENS.IMPACT_REVEAL:
        key = `impact-reveal-${currentQuestionIndex}`;
        screen = (
          <ImpactRevealScreen
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            onContinue={continueFromImpact}
          />
        );
        break;

      case SCREENS.FINAL:
        key = 'final';
        screen = (
          <FinalScreen
            ranking={getRanking()}
            questions={questions}
            answers={answers}
            groups={groups}
            scores={scores}
            timerDuration={timerDuration}
            onShowBilan={goToBilan}
            onNewGame={resetGame}
            questionnaireMode={questionnaireMode}
            questionnaireResponses={questionnaireResponses}
          />
        );
        break;

      case SCREENS.BILAN:
        key = 'bilan';
        screen = (
          <BilanMapScreen
            questions={questions}
            answers={answers}
            groups={groups}
            onBack={() => setCurrentScreen(SCREENS.FINAL)}
          />
        );
        break;

      default:
        key = 'config-default';
        screen = <ConfigScreen onStart={handleStartGame} multiplayer={multiplayer} />;
    }

    return (
      <motion.div
        key={key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="h-screen"
      >
        {screen}
      </motion.div>
    );
  };

  return (
    <AppTimeProvider>
      <MapProvider>
        <TopBar />

        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>

        <RecapModal
          isOpen={showRecap}
          onClose={toggleRecap}
          questions={questions}
          answers={answers}
          groups={groups}
          scores={scores}
          currentQuestionIndex={currentQuestionIndex}
        />
      </MapProvider>
    </AppTimeProvider>
  );
}

export default App;

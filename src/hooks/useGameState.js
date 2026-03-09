import { useState, useCallback } from 'react';
import { sampleQuestions } from '../data/questions';
import { calculateDistance, calculatePoints } from '../utils/distance';

const SCREENS = {
  CONFIG: 'config',
  QUESTION_INTRO: 'question_intro',
  RESEARCH: 'research',
  ANSWER: 'answer',
  BLIND_ANSWER: 'blind_answer',
  REVEAL: 'reveal',
  IMPACT_REVEAL: 'impact_reveal',
  FINAL: 'final',
  BILAN: 'bilan'
};

// Fisher-Yates shuffle
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useGameState() {
  // Configuration
  const [groups, setGroups] = useState([]);
  const [timerDuration, setTimerDuration] = useState(180); // 3 minutes par defaut
  const [questions, setQuestions] = useState([]);
  const [classroomMode, setClassroomMode] = useState(false);
  const [multiplayerMode, setMultiplayerMode] = useState(false);
  const [questionnaireMode, setQuestionnaireMode] = useState(false);
  const [questionnaireResponses, setQuestionnaireResponses] = useState([]); // Réponses collectées des joueurs

  // Etat du jeu
  const [currentScreen, setCurrentScreen] = useState(SCREENS.CONFIG);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [groupOrder, setGroupOrder] = useState([]); // Indices shuffles pour l'ordre de passage
  const [isPaused, setIsPaused] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); // Temps restant en secondes

  // Reponses et scores
  const [answers, setAnswers] = useState({}); // { questionId: { groupName: { lat, lng, distance, points } } }
  const [scores, setScores] = useState({}); // { groupName: totalPoints }
  const [usedHints, setUsedHints] = useState({}); // { questionId: maxHintLevel (1 or 2) }

  // Initialiser la partie
  const startGame = useCallback((groupNames, duration, questionCount = 8, isClassroomMode = false, isMultiplayer = false, isQuestionnaireMode = false) => {
    const validGroups = groupNames.filter(name => name.trim() !== '');
    if (validGroups.length < 1) return false;

    setGroups(validGroups);
    setTimerDuration(duration);
    setClassroomMode(isClassroomMode);
    setMultiplayerMode(isMultiplayer);
    setQuestionnaireMode(isQuestionnaireMode);
    // Ne pas reset questionnaireResponses : les réponses pré-jeu sont déjà reçues
    setQuestions(sampleQuestions(questionCount));
    setCurrentQuestionIndex(0);
    setCurrentGroupIndex(0);
    setGroupOrder(shuffleArray(validGroups.map((_, i) => i)));
    setAnswers({});
    setScores(Object.fromEntries(validGroups.map(g => [g, 0])));
    setUsedHints({});
    setCurrentScreen(SCREENS.QUESTION_INTRO);
    setIsPaused(true);

    return true;
  }, []);

  // Lancer le chronometre (depuis QuestionIntroScreen)
  const startTimer = useCallback(() => {
    setCurrentScreen(SCREENS.RESEARCH);
    setIsPaused(false);
  }, []);

  // Passer a la phase de reponse (shuffle l'ordre des groupes)
  const goToAnswerPhase = useCallback(() => {
    if (multiplayerMode) {
      // En mode multiplayer, les réponses arrivent via WebSocket pendant la recherche
      // On passe directement au reveal
      setCurrentScreen(SCREENS.REVEAL);
      return;
    }
    setCurrentGroupIndex(0);
    setGroupOrder(shuffleArray(groups.map((_, i) => i)));
    setCurrentScreen(classroomMode ? SCREENS.BLIND_ANSWER : SCREENS.ANSWER);
  }, [classroomMode, multiplayerMode, groups]);

  // Utiliser un indice
  const useHint = useCallback((level) => {
    const question = questions[currentQuestionIndex];
    if (!question) return;

    setUsedHints(prev => ({
      ...prev,
      [question.id]: Math.max(prev[question.id] || 0, level)
    }));
  }, [questions, currentQuestionIndex]);

  // Obtenir l'indice actuel pour une question
  const getCurrentHintLevel = useCallback(() => {
    const question = questions[currentQuestionIndex];
    if (!question) return 0;
    return usedHints[question.id] || 0;
  }, [questions, currentQuestionIndex, usedHints]);

  // Soumettre une reponse
  const submitAnswer = useCallback((groupName, lat, lng) => {
    const question = questions[currentQuestionIndex];
    if (!question) return;

    const distance = calculateDistance(lat, lng, question.target.lat, question.target.lng);
    let points = calculatePoints(distance, question.target.radius * 4);

    // Appliquer la penalite d'indice
    const hintLevel = usedHints[question.id] || 0;
    if (hintLevel > 0 && question.hints && question.hints[hintLevel - 1]) {
      const penalty = question.hints[hintLevel - 1].penalty || 0;
      points = Math.round(points * (1 - penalty));
    }

    setAnswers(prev => ({
      ...prev,
      [question.id]: {
        ...prev[question.id],
        [groupName]: { lat, lng, distance, points, hintUsed: hintLevel }
      }
    }));

    setScores(prev => ({
      ...prev,
      [groupName]: prev[groupName] + points
    }));
  }, [questions, currentQuestionIndex, usedHints]);

  // Passer au groupe suivant ou a la revelation
  const nextGroup = useCallback(() => {
    if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
    } else {
      setCurrentScreen(SCREENS.REVEAL);
    }
  }, [currentGroupIndex, groups.length]);

  // Soumettre toutes les reponses d'un coup (mode classe)
  const submitAllAnswers = useCallback((groupAnswers) => {
    const question = questions[currentQuestionIndex];
    if (!question) return;

    const hintLevel = usedHints[question.id] || 0;

    Object.entries(groupAnswers).forEach(([groupName, coords]) => {
      if (!coords) return; // Groupe sans réponse

      const distance = calculateDistance(coords.lat, coords.lng, question.target.lat, question.target.lng);
      let points = calculatePoints(distance, question.target.radius * 4);

      // Appliquer la penalite d'indice
      if (hintLevel > 0 && question.hints && question.hints[hintLevel - 1]) {
        const penalty = question.hints[hintLevel - 1].penalty || 0;
        points = Math.round(points * (1 - penalty));
      }

      setAnswers(prev => ({
        ...prev,
        [question.id]: {
          ...prev[question.id],
          [groupName]: { lat: coords.lat, lng: coords.lng, distance, points, hintUsed: hintLevel }
        }
      }));

      setScores(prev => ({
        ...prev,
        [groupName]: prev[groupName] + points
      }));
    });

    setCurrentScreen(SCREENS.REVEAL);
  }, [questions, currentQuestionIndex, usedHints]);

  // Aller à l'écran d'impact (si la question en a un)
  const goToImpactReveal = useCallback(() => {
    const question = questions[currentQuestionIndex];
    if (question?.impact) {
      setCurrentScreen(SCREENS.IMPACT_REVEAL);
    } else {
      // Pas d'impact, passer directement à la question suivante ou final
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentGroupIndex(0);
        setGroupOrder(shuffleArray(groups.map((_, i) => i)));
        setCurrentScreen(SCREENS.QUESTION_INTRO);
        setIsPaused(true);
      } else {
        setCurrentScreen(SCREENS.FINAL);
      }
    }
  }, [questions, currentQuestionIndex, groups]);

  // Continuer après l'écran d'impact
  const continueFromImpact = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentGroupIndex(0);
      setGroupOrder(shuffleArray(groups.map((_, i) => i)));
      setCurrentScreen(SCREENS.QUESTION_INTRO);
      setIsPaused(true);
    } else {
      setCurrentScreen(SCREENS.FINAL);
    }
  }, [currentQuestionIndex, questions.length, groups]);

  // Passer a la question suivante (depuis RevealScreen - va vers impact si présent)
  const nextQuestion = useCallback(() => {
    goToImpactReveal();
  }, [goToImpactReveal]);

  // Aller au classement final
  const goToFinal = useCallback(() => {
    setCurrentScreen(SCREENS.FINAL);
  }, []);

  // Passer directement aux resultats finaux (skip les questions restantes)
  const skipToFinal = useCallback(() => {
    setCurrentScreen(SCREENS.FINAL);
  }, []);

  // Aller a la carte bilan
  const goToBilan = useCallback(() => {
    setCurrentScreen(SCREENS.BILAN);
  }, []);

  // Ajouter une réponse de questionnaire (reçue d'un joueur via WebSocket)
  const addQuestionnaireResponse = useCallback((response) => {
    setQuestionnaireResponses(prev => [...prev, response]);
  }, []);

  // Nouvelle partie
  const resetGame = useCallback(() => {
    setCurrentScreen(SCREENS.CONFIG);
    setGroups([]);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setCurrentGroupIndex(0);
    setGroupOrder([]);
    setMultiplayerMode(false);
    setAnswers({});
    setScores({});
    setUsedHints({});
    setIsPaused(false);
    setShowRecap(false);
  }, []);

  // Toggle pause
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Toggle recap
  const toggleRecap = useCallback(() => {
    setShowRecap(prev => !prev);
  }, []);

  // Obtenir le classement trie
  const getRanking = useCallback(() => {
    return Object.entries(scores)
      .map(([name, points]) => ({ name, points }))
      .sort((a, b) => b.points - a.points);
  }, [scores]);

  // Obtenir les resultats de la question actuelle
  const getCurrentQuestionResults = useCallback(() => {
    const question = questions[currentQuestionIndex];
    if (!question || !answers[question.id]) return [];

    return Object.entries(answers[question.id])
      .map(([groupName, data]) => ({
        groupName,
        ...data
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [questions, currentQuestionIndex, answers]);

  return {
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
    usedHints,
    timeRemaining,
    setTimeRemaining,
    classroomMode,

    // Question actuelle
    currentQuestion: questions[currentQuestionIndex] || null,
    currentGroup: groups[groupOrder[currentGroupIndex]] ?? groups[currentGroupIndex] ?? null,
    remainingGroups: groupOrder.slice(currentGroupIndex + 1).map(i => groups[i]),
    groupOrder,
    multiplayerMode,
    questionnaireMode,
    questionnaireResponses,

    // Actions
    startGame,
    startTimer,
    goToAnswerPhase,
    submitAnswer,
    submitAllAnswers,
    nextGroup,
    nextQuestion,
    goToImpactReveal,
    continueFromImpact,
    goToFinal,
    skipToFinal,
    goToBilan,
    resetGame,
    togglePause,
    toggleRecap,
    setCurrentScreen,
    useHint,
    addQuestionnaireResponse,

    // Helpers
    getRanking,
    getCurrentQuestionResults,
    getCurrentHintLevel,
    totalQuestions: questions.length,

    // Constantes
    SCREENS
  };
}

export default useGameState;

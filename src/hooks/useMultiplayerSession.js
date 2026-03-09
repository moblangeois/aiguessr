import { useState, useCallback, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Déterminer l'URL du serveur socket.io
function getServerUrl() {
  // En dev, se connecter directement au serveur Express (port 3001)
  // Le proxy Vite pour WebSocket est peu fiable
  if (import.meta.env.DEV) {
    return `http://${window.location.hostname}:3001`;
  }
  // En production, même origine (socket.io passe par le même port)
  return window.location.origin;
}

export function useMultiplayerSession() {
  const socketRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  // Dériver connected pour la rétro-compatibilité
  const connected = connectionStatus === 'connected';
  const [sessionCode, setSessionCode] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [groupName, setGroupName] = useState(null);
  const [connectedGroups, setConnectedGroups] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  const [questionnaireMode, setQuestionnaireMode] = useState(false);

  // Callbacks enregistrables par le composant parent
  const onAnswerReceivedRef = useRef(null);
  const onGameStateHostRef = useRef(null);
  const onQuestionnaireReceivedRef = useRef(null);

  // Connexion socket
  const connect = useCallback(() => {
    // Fix #6: éviter la création de sockets dupliqués
    if (socketRef.current) return;

    const socket = io(getServerUrl(), {
      // Fix #2: polling d'abord pour compatibilité firewall, reconnexion illimitée
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Fix #1 & #3: auto-rejoin + suivi du statut de connexion
    socket.on('connect', () => {
      setConnectionStatus('connected');
      setError(null);

      // Auto-rejoin après reconnexion
      const saved = sessionStorage.getItem('aiguessr-session');
      if (saved) {
        try {
          const { code, groupName: savedGroupName, isHost: savedIsHost } = JSON.parse(saved);
          socket.emit('rejoin-session', { code, groupName: savedGroupName, isHost: savedIsHost }, (result) => {
            if (result.success) {
              if (savedIsHost) {
                setSessionCode(code);
                setIsHost(true);
              } else {
                setSessionCode(code);
                setGroupName(savedGroupName);
              }
              if (result.gameState) {
                setGameState(result.gameState);
              }
              console.log('Auto-rejoined session', code);
            } else {
              // Session expirée, nettoyer le storage
              sessionStorage.removeItem('aiguessr-session');
              console.log('Session expired, could not rejoin');
            }
          });
        } catch (e) {
          sessionStorage.removeItem('aiguessr-session');
        }
      }
    });

    // Fix #3: suivi détaillé du statut de connexion
    socket.on('disconnect', () => {
      setConnectionStatus('reconnecting');
    });

    socket.on('reconnect_attempt', (attempt) => {
      setConnectionStatus('reconnecting');
      console.log(`Reconnection attempt ${attempt}`);
    });

    socket.on('reconnect_failed', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('reconnect', () => {
      setConnectionStatus('connected');
    });

    socket.on('connect_error', (err) => {
      setError('Impossible de se connecter au serveur');
      console.error('Socket connection error:', err);
    });

    socket.on('groups-updated', ({ groups }) => {
      setConnectedGroups(groups);
    });

    socket.on('game-state', (state) => {
      setGameState(state);
    });

    socket.on('game-state-host', (state) => {
      onGameStateHostRef.current?.(state);
    });

    socket.on('game-started', (data) => {
      setGameState(prev => prev ? { ...prev, phase: 'research' } : prev);
    });

    socket.on('answer-received', (data) => {
      onAnswerReceivedRef.current?.(data);
    });

    socket.on('timer-sync', ({ timeRemaining }) => {
      setGameState(prev => prev ? { ...prev, timeRemaining } : prev);
    });

    socket.on('scores-updated', ({ scores }) => {
      setGameState(prev => prev ? { ...prev, scores } : prev);
    });

    socket.on('questionnaire-mode-changed', ({ enabled }) => {
      setQuestionnaireMode(enabled);
    });

    socket.on('questionnaire-received', (response) => {
      onQuestionnaireReceivedRef.current?.(response);
    });

    // Fix #5: nettoyer sessionStorage quand la session expire
    socket.on('session-expired', () => {
      sessionStorage.removeItem('aiguessr-session');
      setError('La session a expiré');
      setSessionCode(null);
      setGameState(null);
    });

    socketRef.current = socket;
  }, []);

  // Déconnexion propre
  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnectionStatus('disconnected');
    setSessionCode(null);
    setIsHost(false);
    setGroupName(null);
    setConnectedGroups([]);
    setGameState(null);
  }, []);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // HOST: Créer une session
  const createSession = useCallback((options = {}) => {
    return new Promise((resolve) => {
      if (!socketRef.current) {
        connect();
      }

      // Fix #7: remplacer le polling par un listener événementiel
      if (socketRef.current?.connected) {
        doCreate();
      } else {
        const onConnect = () => {
          socketRef.current.off('connect', onConnect);
          doCreate();
        };
        socketRef.current.on('connect', onConnect);
        setTimeout(() => {
          socketRef.current?.off('connect', onConnect);
          resolve({ success: false, error: 'Timeout de connexion' });
        }, 10000);
      }

      function doCreate() {
        socketRef.current.emit('create-session', { questionnaireMode: !!options.questionnaireMode }, (result) => {
          if (result.success) {
            setSessionCode(result.code);
            setIsHost(true);
            // Fix #4: sauvegarder les données de session host
            sessionStorage.setItem('aiguessr-session', JSON.stringify({
              code: result.code,
              isHost: true
            }));
          }
          resolve(result);
        });
      }
    });
  }, [connect]);

  // JOUEUR: Rejoindre une session
  const joinSession = useCallback((code, name, memberCount) => {
    return new Promise((resolve) => {
      if (!socketRef.current) {
        connect();
      }

      // Fix #7: remplacer le polling par un listener événementiel
      if (socketRef.current?.connected) {
        doJoin();
      } else {
        const onConnect = () => {
          socketRef.current.off('connect', onConnect);
          doJoin();
        };
        socketRef.current.on('connect', onConnect);
        setTimeout(() => {
          socketRef.current?.off('connect', onConnect);
          resolve({ success: false, error: 'Timeout de connexion' });
        }, 10000);
      }

      function doJoin() {
        socketRef.current.emit('join-session', { code, groupName: name, memberCount }, (result) => {
          if (result.success) {
            setSessionCode(code.toUpperCase());
            setGroupName(name);
            setIsHost(false);
            if (result.questionnaireMode) setQuestionnaireMode(true);
            sessionStorage.setItem('aiguessr-session', JSON.stringify({
              code: code.toUpperCase(),
              groupName: name,
              isHost: false
            }));
          }
          resolve(result);
        });
      }
    });
  }, [connect]);

  // HOST: Configurer le mode questionnaire
  const setQuestionnaireModeFn = useCallback((enabled) => {
    setQuestionnaireMode(enabled);
    socketRef.current?.emit('set-questionnaire-mode', { enabled });
  }, []);

  // HOST: Démarrer le jeu
  const startGame = useCallback((questions, timerDuration) => {
    socketRef.current?.emit('start-game', { questions, timerDuration, questionnaireMode });
  }, [questionnaireMode]);

  // HOST: Changer de phase
  const changePhase = useCallback((phase, questionIndex) => {
    socketRef.current?.emit('change-phase', { phase, questionIndex });
  }, []);

  // HOST: Mettre à jour le timer
  const syncTimer = useCallback((timeRemaining) => {
    socketRef.current?.emit('timer-update', { timeRemaining });
  }, []);

  // JOUEUR: Soumettre une réponse
  const submitAnswer = useCallback((lat, lng) => {
    return new Promise((resolve) => {
      socketRef.current?.emit('submit-answer', { lat, lng }, (result) => {
        if (result?.success) {
          setGameState(prev => prev ? { ...prev, hasAnswered: true } : prev);
        }
        resolve(result);
      });
    });
  }, []);

  // HOST: Synchroniser les scores
  const syncScores = useCallback((scores, answers) => {
    socketRef.current?.emit('sync-scores', { scores, answers });
  }, []);

  // JOUEUR: Soumettre un questionnaire
  const submitQuestionnaire = useCallback((data) => {
    return new Promise((resolve) => {
      socketRef.current?.emit('submit-questionnaire', data, (result) => {
        resolve(result);
      });
    });
  }, []);

  // Enregistrer les callbacks
  const onAnswerReceived = useCallback((cb) => {
    onAnswerReceivedRef.current = cb;
  }, []);

  const onGameStateHost = useCallback((cb) => {
    onGameStateHostRef.current = cb;
  }, []);

  const onQuestionnaireReceived = useCallback((cb) => {
    onQuestionnaireReceivedRef.current = cb;
  }, []);

  // Tentative de reconnexion automatique
  const tryReconnect = useCallback(() => {
    const saved = sessionStorage.getItem('aiguessr-session');
    if (!saved) return null;

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }, []);

  return {
    // État
    connected,
    connectionStatus,
    sessionCode,
    isHost,
    groupName,
    connectedGroups,
    gameState,
    error,
    questionnaireMode,

    // Actions
    connect,
    disconnect,
    createSession,
    joinSession,
    startGame,
    changePhase,
    syncTimer,
    submitAnswer,
    syncScores,
    submitQuestionnaire,
    setQuestionnaireMode: setQuestionnaireModeFn,
    tryReconnect,

    // Callbacks
    onAnswerReceived,
    onGameStateHost,
    onQuestionnaireReceived
  };
}

export default useMultiplayerSession;

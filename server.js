import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Limites de sessions et groupes
const MAX_SESSIONS = 100;
const MAX_GROUPS_PER_SESSION = 50;

// Configuration Seafile UCA - via Repo-Token API
const SEAFILE_URL = process.env.SEAFILE_URL || 'https://drive.uca.fr';
const SEAFILE_REPO_TOKEN = process.env.SEAFILE_REPO_TOKEN || '';

// Middleware CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from dist folder
app.use(express.static(join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'aiguessr' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload PDF vers Seafile
app.post('/api/upload-pdf', async (req, res) => {
  try {
    const { pdfBase64, filename } = req.body;

    console.log('Upload PDF request received');
    console.log('   Filename:', filename);

    if (!pdfBase64) {
      return res.status(400).json({ error: 'PDF data is required' });
    }

    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const finalFilename = filename || `aiguessr-rapport-${Date.now()}.pdf`;

    console.log('   PDF buffer size:', pdfBuffer.length, 'bytes');

    // Etape 1: Obtenir l'URL d'upload via repo-token API
    console.log('   Getting upload link from Seafile (via-repo-token)...');
    const uploadLinkRes = await fetch(
      `${SEAFILE_URL}/api/v2.1/via-repo-token/upload-link/?path=/`,
      {
        headers: {
          'Authorization': `Token ${SEAFILE_REPO_TOKEN}`
        }
      }
    );

    console.log('   Upload link response status:', uploadLinkRes.status);

    if (!uploadLinkRes.ok) {
      const err = await uploadLinkRes.text();
      console.error('   Upload link error:', err);
      throw new Error(`Failed to get upload link: ${uploadLinkRes.status} - ${err}`);
    }

    // Seafile retourne l'URL directement comme string (pas JSON)
    const uploadLink = (await uploadLinkRes.text()).replace(/"/g, '').trim();
    console.log('   Upload link:', uploadLink);

    // Etape 2: Uploader le fichier
    console.log('   Uploading file to Seafile...');
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    const bodyParts = [
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="file"; filename="${finalFilename}"\r\n`,
      `Content-Type: application/pdf\r\n\r\n`,
    ];
    const parentDirPart = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="parent_dir"\r\n\r\n/\r\n--${boundary}--\r\n`;

    const bodyStart = Buffer.from(bodyParts.join(''));
    const bodyEnd = Buffer.from(parentDirPart);
    const fullBody = Buffer.concat([bodyStart, pdfBuffer, bodyEnd]);

    const uploadRes = await fetch(uploadLink, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${SEAFILE_REPO_TOKEN}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: fullBody
    });

    console.log('   Upload response status:', uploadRes.status);

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error('   Upload error:', err);
      throw new Error(`Failed to upload file: ${uploadRes.status} - ${err}`);
    }

    const uploadResult = await uploadRes.text();
    console.log('   Upload result:', uploadResult);

    // Etape 3: Obtenir le lien de telechargement via repo-token API
    console.log('   Getting download link...');
    const downloadLinkRes = await fetch(
      `${SEAFILE_URL}/api/v2.1/via-repo-token/download-link/?path=/${encodeURIComponent(finalFilename)}`,
      {
        headers: {
          'Authorization': `Token ${SEAFILE_REPO_TOKEN}`
        }
      }
    );

    console.log('   Download link response status:', downloadLinkRes.status);

    if (!downloadLinkRes.ok) {
      const err = await downloadLinkRes.text();
      console.error('   Download link error:', err);
      throw new Error(`Failed to get download link: ${downloadLinkRes.status} - ${err}`);
    }

    // Seafile retourne l'URL directement comme string (pas JSON)
    const downloadLink = (await downloadLinkRes.text()).replace(/"/g, '').trim();
    console.log('PDF uploaded successfully:', downloadLink);

    res.json({
      success: true,
      link: downloadLink,
      filename: finalFilename,
      expires: 'Permanent'
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ error: 'Failed to upload PDF', details: error.message });
  }
});

// Upload JSON vers Seafile
app.post('/api/upload-json', async (req, res) => {
  try {
    const { jsonData, filename } = req.body;

    console.log('Upload JSON request received');
    console.log('   Filename:', filename);

    if (!jsonData) {
      return res.status(400).json({ error: 'JSON data is required' });
    }

    const jsonString = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData, null, 2);
    const jsonBuffer = Buffer.from(jsonString, 'utf-8');
    const finalFilename = filename || `aiguessr-donnees-${Date.now()}.json`;

    console.log('   JSON buffer size:', jsonBuffer.length, 'bytes');

    // Etape 1: Obtenir l'URL d'upload via repo-token API
    console.log('   Getting upload link from Seafile (via-repo-token)...');
    const uploadLinkRes = await fetch(
      `${SEAFILE_URL}/api/v2.1/via-repo-token/upload-link/?path=/`,
      {
        headers: {
          'Authorization': `Token ${SEAFILE_REPO_TOKEN}`
        }
      }
    );

    console.log('   Upload link response status:', uploadLinkRes.status);

    if (!uploadLinkRes.ok) {
      const err = await uploadLinkRes.text();
      console.error('   Upload link error:', err);
      throw new Error(`Failed to get upload link: ${uploadLinkRes.status} - ${err}`);
    }

    // Seafile retourne l'URL directement comme string (pas JSON)
    const uploadLink = (await uploadLinkRes.text()).replace(/"/g, '').trim();
    console.log('   Upload link:', uploadLink);

    // Etape 2: Uploader le fichier
    console.log('   Uploading file to Seafile...');
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    const bodyParts = [
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="file"; filename="${finalFilename}"\r\n`,
      `Content-Type: application/json\r\n\r\n`,
    ];
    const parentDirPart = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="parent_dir"\r\n\r\n/\r\n--${boundary}--\r\n`;

    const bodyStart = Buffer.from(bodyParts.join(''));
    const bodyEnd = Buffer.from(parentDirPart);
    const fullBody = Buffer.concat([bodyStart, jsonBuffer, bodyEnd]);

    const uploadRes = await fetch(uploadLink, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${SEAFILE_REPO_TOKEN}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: fullBody
    });

    console.log('   Upload response status:', uploadRes.status);

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error('   Upload error:', err);
      throw new Error(`Failed to upload file: ${uploadRes.status} - ${err}`);
    }

    const uploadResult = await uploadRes.text();
    console.log('   Upload result:', uploadResult);

    // Etape 3: Obtenir le lien de telechargement via repo-token API
    console.log('   Getting download link...');
    const downloadLinkRes = await fetch(
      `${SEAFILE_URL}/api/v2.1/via-repo-token/download-link/?path=/${encodeURIComponent(finalFilename)}`,
      {
        headers: {
          'Authorization': `Token ${SEAFILE_REPO_TOKEN}`
        }
      }
    );

    console.log('   Download link response status:', downloadLinkRes.status);

    if (!downloadLinkRes.ok) {
      const err = await downloadLinkRes.text();
      console.error('   Download link error:', err);
      throw new Error(`Failed to get download link: ${downloadLinkRes.status} - ${err}`);
    }

    // Seafile retourne l'URL directement comme string (pas JSON)
    const downloadLink = (await downloadLinkRes.text()).replace(/"/g, '').trim();
    console.log('JSON uploaded successfully:', downloadLink);

    res.json({
      success: true,
      link: downloadLink,
      filename: finalFilename,
      expires: 'Permanent'
    });

  } catch (error) {
    console.error('JSON upload error:', error);
    res.status(500).json({ error: 'Failed to upload JSON', details: error.message });
  }
});

// Vérifier si un code de session existe (avant auth)
app.get('/api/session/:code', (req, res) => {
  const code = req.params.code?.toUpperCase();
  const session = sessions.get(code);
  if (session) {
    res.json({ valid: true, phase: session.phase, groupCount: session.groups.length, questionnaireMode: session.questionnaireMode });
  } else {
    res.status(404).json({ valid: false });
  }
});

// Route /join/:code - ne servir le SPA que si la session existe
app.get('/join/:code', (req, res) => {
  const code = req.params.code?.toUpperCase();
  if (sessions.has(code)) {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  } else {
    res.status(404).end();
  }
});

// SPA fallback - serve index.html for all other routes
app.get('/{*splat}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// ============================================
// WebSocket - Sessions multiplayer
// ============================================

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e6, // 1 MB max par message
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
  }
});

// Sessions en mémoire : Map<code, SessionState>
const sessions = new Map();

// Timers de déconnexion en attente (pour éviter de marquer un groupe déconnecté trop vite)
const disconnectTimers = new Map(); // key: `${code}:${groupName}`, value: setTimeout id

// Générer un code de session court (4 chars alphanumériques)
function generateSessionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans I/O/0/1 pour éviter confusion
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  } while (sessions.has(code));
  return code;
}

// Cleanup des sessions inactives (30 min sans host)
setInterval(() => {
  const now = Date.now();
  for (const [code, session] of sessions) {
    if (now - session.lastActivity > 30 * 60 * 1000 && !session.hostSocketId) {
      console.log(`Session ${code} expired (inactive for 30 min without host)`);
      io.to(`session:${code}`).emit('session-expired');
      sessions.delete(code);
    }
  }
}, 60 * 1000);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Gestion des erreurs socket
  socket.on('error', (err) => {
    console.error(`Socket error for ${socket.id}:`, err.message);
  });

  // Host crée une session
  socket.on('create-session', (data, callback) => {
    // Support both (callback) and ({questionnaireMode}, callback) signatures
    if (typeof data === 'function') {
      callback = data;
      data = {};
    }

    // Vérifier la limite de sessions actives
    if (sessions.size >= MAX_SESSIONS) {
      return callback({ success: false, error: `Limite de ${MAX_SESSIONS} sessions actives atteinte` });
    }

    const code = generateSessionCode();
    const session = {
      code,
      hostSocketId: socket.id,
      groups: [], // { name, memberCount, socketId, connected }
      phase: 'lobby', // lobby | research | answer | reveal | impact | final
      currentQuestionIndex: 0,
      questions: [],
      answers: {}, // { questionId: { groupName: { lat, lng } } }
      scores: {},
      timerDuration: 180,
      timeRemaining: 0,
      currentQuestion: null,
      totalQuestions: 0,
      questionnaireMode: !!data?.questionnaireMode,
      questionnaireResponses: [], // { groupName, phase, timestamp, responses, openResponse? }
      lastActivity: Date.now()
    };
    sessions.set(code, session);
    socket.join(`session:${code}`);
    socket.join(`host:${code}`);
    socket.data.sessionCode = code;
    socket.data.isHost = true;
    console.log(`Session ${code} created by ${socket.id}`);
    callback({ success: true, code });
  });

  // Groupe rejoint une session
  socket.on('join-session', ({ code, groupName, memberCount }, callback) => {
    const normalizedCode = code?.toUpperCase();
    const session = sessions.get(normalizedCode);
    if (!session) {
      return callback({ success: false, error: 'Session introuvable' });
    }
    if (session.phase !== 'lobby') {
      // Permettre la reconnexion si le groupe existe déjà
      const existing = session.groups.find(g => g.name === groupName);
      if (existing) {
        // Annuler un éventuel timer de déconnexion en cours
        const timerKey = `${normalizedCode}:${groupName}`;
        if (disconnectTimers.has(timerKey)) {
          clearTimeout(disconnectTimers.get(timerKey));
          disconnectTimers.delete(timerKey);
        }

        existing.socketId = socket.id;
        existing.connected = true;
        socket.join(`session:${normalizedCode}`);
        socket.join(`group:${normalizedCode}:${groupName}`);
        socket.data.sessionCode = normalizedCode;
        socket.data.groupName = groupName;
        socket.data.isHost = false;
        session.lastActivity = Date.now();
        // Envoyer l'état actuel au joueur reconnecté
        callback({ success: true, reconnected: true });
        socket.emit('game-state', buildPlayerState(session, groupName));
        return;
      }
      return callback({ success: false, error: 'La partie a déjà commencé' });
    }
    if (session.groups.find(g => g.name === groupName)) {
      return callback({ success: false, error: 'Ce nom de groupe est déjà pris' });
    }

    // Vérifier la limite de groupes par session
    if (session.groups.length >= MAX_GROUPS_PER_SESSION) {
      return callback({ success: false, error: `Limite de ${MAX_GROUPS_PER_SESSION} groupes par session atteinte` });
    }

    session.groups.push({
      name: groupName,
      memberCount: memberCount || 1,
      socketId: socket.id,
      connected: true
    });
    session.scores[groupName] = 0;

    socket.join(`session:${normalizedCode}`);
    socket.join(`group:${normalizedCode}:${groupName}`);
    socket.data.sessionCode = normalizedCode;
    socket.data.groupName = groupName;
    socket.data.isHost = false;
    session.lastActivity = Date.now();

    callback({ success: true, questionnaireMode: session.questionnaireMode });

    // Notifier le host et tous les joueurs
    io.to(`session:${normalizedCode}`).emit('groups-updated', {
      groups: session.groups.map(g => ({ name: g.name, memberCount: g.memberCount, connected: g.connected }))
    });
  });

  // Rejoin après reconnexion Socket.io (auto-reconnect)
  socket.on('rejoin-session', ({ code, groupName, isHost }, callback) => {
    const normalizedCode = code?.toUpperCase();
    const session = sessions.get(normalizedCode);
    if (!session) return callback({ success: false, error: 'Session expired' });

    if (isHost) {
      session.hostSocketId = socket.id;
      socket.data.sessionCode = normalizedCode;
      socket.data.isHost = true;
      socket.join(`session:${normalizedCode}`);
      socket.join(`host:${normalizedCode}`);
      session.lastActivity = Date.now();
      callback({ success: true, gameState: { phase: session.phase, questionIndex: session.currentQuestionIndex } });
      return;
    }

    const group = session.groups.find(g => g.name === groupName);
    if (!group) return callback({ success: false, error: 'Group not found' });

    // Annuler un éventuel timer de déconnexion en cours
    const timerKey = `${normalizedCode}:${groupName}`;
    if (disconnectTimers.has(timerKey)) {
      clearTimeout(disconnectTimers.get(timerKey));
      disconnectTimers.delete(timerKey);
    }

    group.socketId = socket.id;
    group.connected = true;
    socket.data.sessionCode = normalizedCode;
    socket.data.groupName = groupName;
    socket.join(`session:${normalizedCode}`);
    socket.join(`group:${normalizedCode}:${groupName}`);
    session.lastActivity = Date.now();

    // Send current game state
    const playerState = buildPlayerState(session, groupName);
    callback({ success: true, gameState: playerState });

    // Notifier les autres que le groupe est reconnecté
    io.to(`session:${normalizedCode}`).emit('groups-updated', {
      groups: session.groups.map(g => ({ name: g.name, memberCount: g.memberCount, connected: g.connected }))
    });
  });

  // Host configure le mode questionnaire
  socket.on('set-questionnaire-mode', ({ enabled }) => {
    const session = sessions.get(socket.data.sessionCode);
    if (!session || !socket.data.isHost) return;
    session.questionnaireMode = enabled;
    session.lastActivity = Date.now();
    // Notifier tous les joueurs
    socket.to(`session:${session.code}`).emit('questionnaire-mode-changed', { enabled });
  });

  // Host démarre la partie
  socket.on('start-game', ({ questions, timerDuration, questionnaireMode }) => {
    const session = sessions.get(socket.data.sessionCode);
    if (!session || !socket.data.isHost) return;

    session.questions = questions;
    session.totalQuestions = questions.length;
    session.timerDuration = timerDuration;
    if (questionnaireMode !== undefined) session.questionnaireMode = questionnaireMode;
    session.currentQuestionIndex = 0;
    session.phase = 'research';
    session.currentQuestion = questions[0];
    session.lastActivity = Date.now();

    io.to(`session:${session.code}`).emit('game-started', {
      totalQuestions: questions.length,
      timerDuration
    });

    // Envoyer la première question
    broadcastPhase(session);
  });

  // Host change de phase
  socket.on('change-phase', ({ phase, questionIndex }) => {
    const session = sessions.get(socket.data.sessionCode);
    if (!session || !socket.data.isHost) return;

    session.phase = phase;
    if (questionIndex !== undefined) {
      session.currentQuestionIndex = questionIndex;
      session.currentQuestion = session.questions[questionIndex] || null;
    }
    session.lastActivity = Date.now();

    broadcastPhase(session);
  });

  // Host met à jour le timer
  socket.on('timer-update', ({ timeRemaining }) => {
    const session = sessions.get(socket.data.sessionCode);
    if (!session || !socket.data.isHost) return;
    session.timeRemaining = timeRemaining;
    session.lastActivity = Date.now();
    // Broadcast aux joueurs uniquement (pas au host)
    socket.to(`session:${session.code}`).emit('timer-sync', { timeRemaining });
  });

  // Joueur soumet une réponse
  socket.on('submit-answer', ({ lat, lng }, callback) => {
    const session = sessions.get(socket.data.sessionCode);
    if (!session || socket.data.isHost) return callback?.({ success: false });

    const groupName = socket.data.groupName;
    const question = session.currentQuestion;
    if (!question) return callback?.({ success: false });

    // Stocker la réponse brute (le calcul de score se fait côté host)
    if (!session.answers[question.id]) {
      session.answers[question.id] = {};
    }
    session.answers[question.id][groupName] = { lat, lng };
    session.lastActivity = Date.now();

    callback?.({ success: true });

    // Notifier le host de la nouvelle réponse
    io.to(`session:${session.code}`).emit('answer-received', {
      groupName,
      questionId: question.id,
      lat,
      lng,
      answeredCount: Object.keys(session.answers[question.id]).length,
      totalGroups: session.groups.length
    });
  });

  // Host synchronise les scores (après calcul côté client)
  socket.on('sync-scores', ({ scores, answers }) => {
    const session = sessions.get(socket.data.sessionCode);
    if (!session || !socket.data.isHost) return;

    session.scores = scores;
    if (answers) session.answers = answers;
    session.lastActivity = Date.now();

    // Envoyer les scores à tous les joueurs
    socket.to(`session:${session.code}`).emit('scores-updated', { scores });
  });

  // Joueur soumet un questionnaire (pré ou post)
  socket.on('submit-questionnaire', (data, callback) => {
    const session = sessions.get(socket.data.sessionCode);
    if (!session) return callback?.({ success: false });

    const groupName = socket.data.groupName || data.groupName;
    const response = {
      groupName,
      phase: data.phase, // 'pre' ou 'post'
      timestamp: new Date().toISOString(),
      responses: data.responses,
      openResponse: data.openResponse || null
    };
    session.questionnaireResponses.push(response);
    session.lastActivity = Date.now();

    callback?.({ success: true });

    // Notifier le host via room
    io.to(`host:${session.code}`).emit('questionnaire-received', response);
  });

  // Joueur demande l'état actuel (reconnexion)
  socket.on('request-state', (callback) => {
    const session = sessions.get(socket.data.sessionCode);
    if (!session) return callback?.({ success: false });
    const groupName = socket.data.groupName;
    callback?.({ success: true, state: buildPlayerState(session, groupName) });
  });

  // Déconnexion
  socket.on('disconnect', () => {
    const code = socket.data.sessionCode;
    if (!code) return;

    const session = sessions.get(code);
    if (!session) return;

    if (socket.data.isHost) {
      session.hostSocketId = null;
      // Le host quitte la room automatiquement (Socket.io gère le leave on disconnect)
      console.log(`Host disconnected from session ${code}`);
    } else {
      const groupName = socket.data.groupName;
      const group = session.groups.find(g => g.name === groupName);
      if (group) {
        // Attendre quelques secondes avant de marquer comme déconnecté
        // (en cas de reconnexion rapide / changement de réseau)
        const timerKey = `${code}:${groupName}`;
        if (disconnectTimers.has(timerKey)) {
          clearTimeout(disconnectTimers.get(timerKey));
        }
        disconnectTimers.set(timerKey, setTimeout(() => {
          disconnectTimers.delete(timerKey);
          // Re-vérifier que le groupe n'a pas été reconnecté entre-temps
          const currentSession = sessions.get(code);
          if (!currentSession) return;
          const currentGroup = currentSession.groups.find(g => g.name === groupName);
          if (currentGroup && currentGroup.socketId === socket.id) {
            // Le socket ID n'a pas changé, donc pas de reconnexion
            currentGroup.connected = false;
            io.to(`session:${code}`).emit('groups-updated', {
              groups: currentSession.groups.map(g => ({ name: g.name, memberCount: g.memberCount, connected: g.connected }))
            });
          }
        }, 5000)); // 5 secondes de grâce
      }
    }

    session.lastActivity = Date.now();
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Construire l'état envoyé aux joueurs
function buildPlayerState(session, groupName) {
  return {
    phase: session.phase,
    currentQuestionIndex: session.currentQuestionIndex,
    totalQuestions: session.totalQuestions,
    currentQuestion: session.currentQuestion ? {
      id: session.currentQuestion.id,
      question: session.currentQuestion.question,
      category: session.currentQuestion.category
    } : null,
    timeRemaining: session.timeRemaining,
    timerDuration: session.timerDuration,
    scores: session.scores,
    myScore: session.scores[groupName] || 0,
    hasAnswered: session.currentQuestion
      ? !!(session.answers[session.currentQuestion.id]?.[groupName])
      : false,
    groups: session.groups.map(g => ({ name: g.name, connected: g.connected })),
    questionnaireMode: session.questionnaireMode
  };
}

// Broadcast l'état de la phase à tous les joueurs (via rooms)
function broadcastPhase(session) {
  // Envoyer à chaque groupe son état personnalisé
  for (const group of session.groups) {
    const playerState = buildPlayerState(session, group.name);
    io.to(`group:${session.code}:${group.name}`).emit('game-state', playerState);
  }
  // Aussi notifier le host via room
  io.to(`host:${session.code}`).emit('game-state-host', {
    phase: session.phase,
    currentQuestionIndex: session.currentQuestionIndex,
    answers: session.answers
  });
}

// Démarrer le serveur avec HTTP (nécessaire pour socket.io)
httpServer.listen(PORT, () => {
  console.log(`Serveur AIGuessr demarre sur http://localhost:${PORT}`);
  console.log(`Health check: GET /api/health`);
  console.log(`Upload PDF: POST /api/upload-pdf`);
  console.log(`Upload JSON: POST /api/upload-json`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});

// Gestion des erreurs du serveur
httpServer.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Empêcher le processus de se terminer
function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down server gracefully...`);
  io.close();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  // Force exit after 10s if connections hang
  setTimeout(() => process.exit(1), 10000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

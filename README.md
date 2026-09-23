# AIGuessr

**A GeoGuessr-inspired serious game to discover the material footprint of AI**

AIGuessr is a multiplayer web application for educational workshops. Players locate on a world map the places where AI resources are extracted, components are manufactured, data centers operate, and electronic waste ends up. The game covers the full lifecycle of AI infrastructure, from cobalt mines in the DRC to e-waste dumps in Ghana.

Built with React 19, Vite, Tailwind CSS 4, Leaflet, react-globe.gl, and Socket.IO for real-time multiplayer.

---

## Features

- **21 sourced questions** across 4 categories: extraction, production, data centers, e-waste
- **Real-time multiplayer** via WebSocket: one presenter screen plus student devices via QR code
- **3D globe visualization** with react-globe.gl for question introductions
- **Jigsaw classroom mode**: team members each specialize in one category, then guide their team on the questions of that category
- **Pre/post questionnaire mode** for research data collection (Likert scales)
- **Hint system** with score penalties (-20% / -40%)
- **PDF & JSON export** of game results with pedagogical content
- **Cloud upload** to Seafile for instant sharing via QR code
- **Fully responsive**: presenter view (desktop) and player view (mobile)

---

## Quick Start

```bash
# Clone
git clone https://github.com/moblangeois/aiguessr.git
cd aiguessr

# Install
npm install

# Run (frontend + backend)
npm start
```

The app runs on `http://localhost:5173` (frontend) and `http://localhost:3001` (backend).

### Production build

```bash
npm run build
PORT=3001 node server.js
```

---

## How It Works

### Game Flow

```
CONFIG → QUESTION INTRO → RESEARCH → ANSWER → REVEAL → IMPACT → [NEXT QUESTION] → FINAL → BILAN MAP
```

1. **Config**: set number of teams, timer duration, question count, multiplayer/questionnaire mode
2. **Question Intro**: 3D globe zooms to the region of interest
3. **Research**: teams discuss and research (configurable timer with pause)
4. **Answer**: each team places a marker on the map
5. **Reveal**: target zone shown, distances calculated, points awarded (0 to 1000 per question, exponential decay)
6. **Impact**: key environmental and social data about the location
7. **Final**: podium, per-category stats, full export
8. **Bilan Map**: overview of all answers across all questions

### Multiplayer

The presenter opens the app on a projector. Students scan a QR code to join on their phones. The server synchronizes game state, timer, and answers in real time via Socket.IO.

### Questionnaire Mode

When enabled, players fill a 6-item Likert questionnaire before the game (pre-test) and a 9-item questionnaire after (post-test). Responses are collected server-side and exported with game data for research on learning outcomes.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Framer Motion, Leaflet, react-globe.gl |
| Backend | Express 5, Socket.IO 4 |
| Export | jsPDF, QRCode, Canvas Confetti |
| Geospatial | Turf.js (Haversine distance) |

---

## Project Structure

```
aiguessr/
├── src/
│   ├── App.jsx                   # Root, routes to HostApp or PlayerApp
│   ├── screens/
│   │   ├── ConfigScreen.jsx      # Game setup + QR code generation
│   │   ├── QuestionIntroScreen.jsx  # 3D globe intro
│   │   ├── ResearchScreen.jsx    # Research phase with timer + hints
│   │   ├── AnswerScreen.jsx      # Map marker placement (sequential)
│   │   ├── BlindAnswerScreen.jsx # Map marker placement (simultaneous)
│   │   ├── RevealScreen.jsx      # Target reveal + scoring
│   │   ├── ImpactRevealScreen.jsx # Environmental impact data
│   │   ├── FinalScreen.jsx       # Results + export
│   │   ├── BilanMapScreen.jsx    # All-questions overview map
│   │   ├── PlayerJoinScreen.jsx  # Mobile join screen
│   │   ├── PlayerGameScreen.jsx  # Mobile game view
│   │   └── QuestionnaireScreen.jsx # Pre/post Likert questionnaire
│   ├── components/               # Timer, ScoreBoard, Map, etc.
│   ├── data/
│   │   ├── questions.js          # 21 questions with targets + hints
│   │   └── pedagogicalContent.js # Educational content for PDF export
│   ├── hooks/                    # useGameState, useMultiplayerSession, etc.
│   └── utils/                    # PDF generator, JSON exporter, distance calc
├── server.js                     # Express + Socket.IO server
├── docs/expert-sheets/           # Category expert sheets (jigsaw mode)
├── LICENSE                       # MIT
└── .env.example                  # Environment variables template
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `SEAFILE_URL` | `https://drive.uca.fr` | Seafile instance URL (optional) |
| `SEAFILE_REPO_TOKEN` | (none) | Seafile repo token for cloud upload (optional) |

The Seafile integration is optional. Without it, PDF and JSON exports still work locally via browser download.

---

## Pedagogical Design

AIGuessr was built as a research instrument to study how serious games can develop **AI materiality awareness** among management students. It draws on:

- **Experiential learning** (Kolb, 1984): learning by doing rather than by lecture
- **Jigsaw classroom** (Aronson, 1978): teams specialize, then cross-teach
- **Design Science Research** (Hevner et al., 2004): iterative design and evaluation cycles

### Question Categories

| Category | Color | Topics |
|----------|-------|--------|
| Extraction | Red | Cobalt, lithium, copper, rare earths, tantalum, silicon, gallium... |
| Production | Orange | Semiconductors (TSMC), assembly (Foxconn), AI chip design |
| Data Centers | Blue | Hyperscale facilities, energy & water consumption |
| E-Waste | Green | Agbogbloshie (Ghana), Guiyu (China), informal recycling |

---

## Citation

If you use AIGuessr in your research or teaching, please cite:

> Blangeois, M. (2026). AIGuessr: A GeoGuessr-inspired serious game for AI materiality awareness. Université Clermont Auvergne.

---

## License

MIT. See [LICENSE](LICENSE).

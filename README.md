# QuizGuard — Secure Online Quiz & Focus Monitoring Platform

A modern, high-performance, real-time assessment and focus monitoring platform developed with React, Vite, Tailwind CSS, Supabase BaaS, and client-side browser proctoring.

The platform is designed to provide secure, distraction-free examination environments alongside an AI-powered quiz generator, multi-format document parser, custom quiz creator studio, real-time multiplayer arena, and comprehensive performance analytics.

---

## Project Overview

**QuizGuard** is an all-in-one assessment engine built for modern online testing, competitive multiplayer quiz battles, and proctored technical evaluations. It combines automated browser focus monitoring with intuitive quiz authoring tools and instant AI question generation.

The platform offers both standalone offline-capable local assessments with `localStorage` persistence and live room multiplayer contests powered by Supabase real-time channels and PeerJS fallback synchronization.

---

## Main Pages & Sections

The application consists of the following primary routes and modules:

- **Navbar**: Sticky glassmorphic navigation header with route highlighting, live attempt indicators, and quick action buttons.
- **Home (Landing Page)**: Hero section with animated badges, feature breakdown cards, platform metrics, and quick test entry points.
- **Dashboard**: Personal assessment hub displaying key performance metrics, completion rates, category radar distributions, and recent test logs.
- **Quizzes (Categories)**: Curated category catalog (JavaScript, React Architecture, HTML5/CSS3, General Knowledge, Aptitude & Logic, Cloud Computing, Computer Science) with difficulty filters, question counts, and duration badges.
- **AI Quiz Generator**: Intelligent quiz creation module powered by Google Gemini API / Hugging Face models with custom prompt prompts, difficulty levels, target question counts, and instant preview.
- **Quiz Studio (Create & Edit)**: Advanced quiz builder with manual question authoring, multi-format document importing (.PDF, .DOCX, .TXT, .JSON), bulk import, JSON schema validation, and immediate draft testing.
- **Live Arena (Multiplayer Contest)**: Real-time multiplayer lobby supporting up to 50 participants with room creation, PIN-based joining, host controls, synchronized countdowns, live leaderboard rankings, and Supabase / WebRTC connections.
- **Join Quiz**: Dedicated PIN entry screen for quick access to hosted private and public contest rooms.
- **Instructions**: Pre-test briefing screen detailing proctoring rules, navigation tips, scoring criteria, and hardware permission checks.
- **Quiz Test (Active Exam)**: Secure exam environment featuring question navigator matrix, countdown timer, marked-for-review flags, and fullscreen enforcement.
- **Submit Modal**: Confirmation modal showing answered, unanswered, and marked-for-review counts before final submission.
- **Result Scorecard**: Comprehensive post-exam analysis with animated score counters, grade badges, percentage gauge, time breakdown, and confetti celebrations.
- **Review**: Question-by-question post-exam audit displaying selected options, correct answers, detailed explanations, and review filtering (All, Correct, Incorrect, Skipped).
- **History**: Historical exam archive with searchable records, category filters, average scores, attempt deletion, and CSV export.
- **Analytics**: Deep-dive statistical dashboard tracking score progression over time, accuracy by category, time efficiency, and mastery levels.
- **Terminated Notice**: Security termination screen triggered upon repeated proctoring violations (tab switches, mouse excursions, or unauthorized exit).
- **About**: Architectural documentation, mission statement, privacy safeguards, and feature showcase.
- **Footer**: Brand links, social anchors, system status indicators, and legal notices.

---

## Key Features

### 1. Real-Time Proctoring & Focus Monitoring
- **Mouse Boundary Check**: Tracks cursor containment within the active test container. Warns users with an immediate 2-second grace countdown before triggering test invalidation.
- **Tab Switching Detection**: Utilizes HTML5 `visibilitychange` and window `blur` events to track window focus loss. Issues persistent warnings and auto-terminates upon repeat infractions.
- **Fullscreen Mode Enforcement**: Integrates with the browser Fullscreen API, detects escape/exit events, logs violations, and displays re-entry modals.
- **Mobile Responsive Adaptation**: Automatically adjusts pointer-based boundary monitoring on touch devices so mobile candidates are not unfairly penalized.

### 2. AI Quiz Generator
- **Multi-Model Support**: Direct integration with Gemini 1.5 Flash / Pro and Hugging Face inference models.
- **Custom Topic & Syllabus Input**: Generates structured MCQ questions with options, correct answer indexes, and deep conceptual explanations from any prompt or subject.
- **Adaptive Difficulty**: Allows selecting between Beginner, Intermediate, Advanced, and Mixed difficulty levels.

### 3. Document Parser & Importer
- **Format Support**: Ingests files in `.pdf` (via `pdfjs-dist`), `.docx` (via `jszip` document extraction), `.txt`, and structured `.json`.
- **Intelligent Normalizer**: Automatically detects question prompts, choices (A/B/C/D), correct keys, and explanations from unformatted text.
- **Instant Edit & Play**: Preview, refine, edit, and launch imported quizzes in a single click.

### 4. Multiplayer Contest Arena
- **Real-Time Live Rooms**: Powered by Supabase Realtime Channels with seamless WebRTC / PeerJS fallback.
- **Host Controls**: Host room creation, PIN sharing, participant kick/mute controls, and synchronized test start triggers.
- **Server-Authoritative Timing**: Prevents client-side clock tampering during live contests.
- **Live Dynamic Leaderboard**: Instant score calculations factoring in speed, streak bonuses, and accuracy.

### 5. Exam Experience & Navigation
- **Question Matrix Navigator**: Color-coded palette for Current, Answered, Unanswered, and Marked-for-Review questions.
- **Uninterrupted Countdown Timer**: Accurate timer with visual urgency states (green → amber → pulsing red) and auto-submit on `00:00`.
- **Review & Explanations**: Detailed reasoning for every question to support continuous learning.

---

## Design System & Aesthetics

QuizGuard is built with an executive-grade dark aesthetic:

- **Palette**: Deep Obsidian (`#000000`, `#09090b`, `#18181b`) base with silver borders (`border-white/10`), crisp white typography, and status-driven neon accents (Emerald, Amber, Rose, Cyan).
- **Glassmorphism**: Backdrop blur filters (`backdrop-blur-2xl`) with translucent panels (`bg-zinc-950/80`).
- **Typography**: Inter (UI), Instrument Serif (Display headings), and JetBrains Mono (Code/Timers).
- **Micro-Animations**: Powered by `framer-motion` for fluid state transitions, card hover glows, and animated score counters.

---

## Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Core Framework** | React 18.3, Vite 5.4 |
| **Routing** | React Router DOM v6.26 |
| **Styling & Design** | Tailwind CSS 3.4, PostCSS, Autoprefixer |
| **Icons & UI** | Lucide React, clsx, tailwind-merge |
| **Animation & Motion** | Framer Motion 11.3, Canvas Confetti |
| **Smooth Scrolling** | Lenis v1.1 |
| **Document Processing** | PDF.js (`pdfjs-dist`), JSZip |
| **Multiplayer & Realtime** | Supabase JS Client (`@supabase/supabase-js`), PeerJS |
| **State & Persistence** | React Context API (`QuizContext`), Browser `localStorage` |

---

## Project Structure

```
Quiz-Guard/
│
├── public/
│   ├── favicon.svg              # Brand shield vector favicon
│   ├── logo.svg                 # Vector brand mark
│   └── site.webmanifest         # PWA and desktop taskbar manifest
│
├── src/
│   ├── main.jsx                 # Application entry point
│   ├── App.jsx                  # Root router configuration & Lenis wrapper
│   ├── index.css                # Global design system tokens & Tailwind imports
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.jsx        # Status & category badge component
│   │   │   ├── Button.jsx       # Interactive button with variants & states
│   │   │   ├── Card.jsx         # Glassmorphic container card
│   │   │   ├── CountUpNumber.jsx# Animated numerical count-up
│   │   │   ├── ErrorBoundary.jsx# React error boundary component
│   │   │   ├── Footer.jsx       # Global footer with links and branding
│   │   │   ├── Modal.jsx        # Accessible dialog wrapper
│   │   │   ├── Navbar.jsx       # Brand navigation bar with route indicators
│   │   │   ├── ProgressBar.jsx  # Animated test completion bar
│   │   │   └── Toast.jsx        # Toast notification system
│   │   │
│   │   ├── quiz/
│   │   │   ├── FocusMonitor.jsx # Proctoring tracker (tab/mouse/fullscreen)
│   │   │   ├── FullscreenButton.jsx # Fullscreen trigger & state toggle
│   │   │   ├── MobileNotice.jsx # Mobile proctoring fallback banner
│   │   │   ├── QuestionCard.jsx # Active question card with options
│   │   │   ├── QuestionNavigator.jsx # Question status palette matrix
│   │   │   ├── QuizCard.jsx     # Category & quiz selection card
│   │   │   ├── QuizOption.jsx   # Selectable MCQ answer option
│   │   │   ├── QuizTimer.jsx    # Live countdown timer with status indicators
│   │   │   ├── StatCard.jsx     # Metric card for dashboard & results
│   │   │   ├── SubmitModal.jsx  # Pre-submission confirmation summary
│   │   │   └── WarningModal.jsx # Proctoring focus violation alert modal
│   │   │
│   │   └── ui/
│   │       └── skiper40.jsx     # UI motion background & visual effects
│   │
│   ├── context/
│   │   └── QuizContext.jsx      # Global state (quiz sessions, timer, attempts, proctoring)
│   │
│   ├── data/
│   │   └── quizzes.js           # 50+ built-in questions across 7 core categories
│   │
│   ├── pages/
│   │   ├── About.jsx            # Platform information & proctoring architecture
│   │   ├── AiQuizGenerator.jsx  # AI-driven question generation module
│   │   ├── Analytics.jsx        # Historical analysis & performance metrics
│   │   ├── Categories.jsx       # Category browsing & quiz catalog
│   │   ├── ContestLobby.jsx     # Real-time multiplayer lobby & live arena
│   │   ├── CreateQuiz.jsx       # Quiz creator studio with document importer
│   │   ├── Dashboard.jsx        # User overview, quick stats & history
│   │   ├── History.jsx          # Past attempt logs & CSV export
│   │   ├── Home.jsx             # Landing page with hero & feature highlights
│   │   ├── Instructions.jsx     # Pre-test proctoring rules & guidelines
│   │   ├── JoinQuiz.jsx         # PIN entry screen for multiplayer rooms
│   │   ├── NotFound.jsx         # 404 error page
│   │   ├── QuizTest.jsx         # Live examination interface
│   │   ├── Result.jsx           # Scorecard, performance stats & grade badge
│   │   ├── Review.jsx           # Post-exam question audit & explanations
│   │   └── Terminated.jsx       # Test termination screen for infractions
│   │
│   └── utils/
│       ├── aiQuizGenerator.js   # Gemini API and AI prompt pipeline
│       ├── documentParsers.js   # PDF, DOCX, TXT parser utilities
│       ├── quizNormalizer.js    # Schema validation & text normalization
│       ├── quizUtils.js         # Scoring algorithms, grading, & time formatters
│       └── storage.js           # LocalStorage wrapper for attempts & quizzes
│
├── index.html                   # HTML template with Google Fonts & metadata
├── package.json                 # Project dependencies & scripts
├── vite.config.js               # Vite bundler configuration
├── tailwind.config.js           # Tailwind theme configuration
├── vercel.json                  # Vercel SPA routing deployment rules
└── README.md                    # Project documentation
```

---

## Installation & Setup

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **npm** or **yarn** / **pnpm**

### Step-by-Step Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Donboscop/Quiz-Guard.git
   ```

2. **Navigate into the project directory**:
   ```bash
   cd Quiz-Guard
   ```

3. **Install project dependencies**:
   ```bash
   npm install
   ```

4. **Configure Environment Variables** *(Optional for AI & Live Rooms)*:
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Build & Deployment

To create an optimized production build:

```bash
npm run build
```

To preview the production bundle locally:

```bash
npm run preview
```

### Vercel / Netlify Deployment
The project includes a preconfigured [`vercel.json`](file:///d:/Project/sample/Quizzz/vercel.json) for Single Page Application (SPA) rewrite handling:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Security & Proctoring Notice

> **Note**: QuizGuard's focus monitoring runs client-side inside the browser using standard web APIs (`Visibility API`, `Fullscreen API`, `PointerEvents`). While highly effective for preventing casual distractions and tab-switching during assessments, it is intended as a proctoring demonstration and assessment companion.

---

## License & Author

Developed with care by [Donbosco](https://github.com/Donboscop).

Copyright © 2026 **QuizGuard**. All rights reserved.

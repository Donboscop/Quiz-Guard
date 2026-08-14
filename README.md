# QuizGuard — Online Quiz & Focus Monitoring Platform

**QuizGuard** is a modern, high-performance, frontend-only EdTech quiz platform featuring real-time browser-based proctoring and focus monitoring. Designed with a clean SaaS aesthetic, QuizGuard ensures a distraction-free testing environment with mouse boundary tracking, tab-switch detection, fullscreen enforcement, and instant score analytics.

---

## Key Features

- **Real-Time Proctoring & Focus Monitoring**:
  - **Mouse Boundary Check**: Detects when the cursor leaves the active test container with a 2-second grace period before test termination.
  - **Tab Switching Detection**: Tracks window focus using the HTML5 `visibilitychange` API. Issues warnings and auto-terminates on repeat violations.
  - **Fullscreen Mode Enforcement**: Integrated with the browser Fullscreen API. Logs exit events and requests re-entry.
  - **Mobile Responsive Fallback**: Automatically relaxes pointer-based boundary monitoring on touch devices so mobile users aren't unfairly penalized.
- **7 Comprehensive Categories & 50+ Questions**:
  - JavaScript (ES6+, Closures, Async), React Architecture, HTML5 & CSS3, General Knowledge, Aptitude & Logic, Cloud Computing (AWS/DevOps), Computer Science (DSA/OS/SQL).
- **Test Controls & Question Navigator Matrix**:
  - Uninterrupted countdown timer with auto-submit on `00:00`.
  - Question status indicators: Current, Answered, Unanswered, and Marked for Review.
- **Analytics & History**:
  - Animated result scorecards (Score, Percentage, Correct, Wrong, Unanswered, Time Taken, Grade badge).
  - Detailed answer review with status badges (✓ Correct / ✕ Incorrect / — Unanswered) and explanations.
  - Attempt history persisted locally via `localStorage`.

---

## Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Custom Design System Tokens
- **Icons**: Lucide React
- **Animations**: Motion for React (`framer-motion`)
- **Smooth Scroll**: Lenis (`lenis`)
- **State**: React Context (`QuizContext`) + `localStorage` persistence

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation & Run

1. Clone or navigate to the repository directory:
   ```bash
   cd Quizzz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## Proctoring Disclaimer

> **Note**: QuizGuard's focus monitoring is a browser-based demonstration feature. Since all logic runs on the client side, it should not be considered a replacement for server-side examination security.

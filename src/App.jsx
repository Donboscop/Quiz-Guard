import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { QuizProvider } from './context/QuizContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { Home } from './pages/Home';
import { Categories } from './pages/Categories';
import { Instructions } from './pages/Instructions';
import { QuizTest } from './pages/QuizTest';
import { Terminated } from './pages/Terminated';
import { Result } from './pages/Result';
import { Review } from './pages/Review';
import { History } from './pages/History';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';
import { CreateQuiz } from './pages/CreateQuiz';
import { ContestLobby } from './pages/ContestLobby';

// Helper component for Lenis smooth scroll & scroll-to-top on route change
function ScrollAndLenisManager() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    // Disable Lenis during active live test to ensure max input responsiveness
    const isTestRoute = location.pathname.includes('/test');
    if (isTestRoute) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [location.pathname]);

  return null;
}

export function App() {
  return (
    <ErrorBoundary>
      <QuizProvider>
        <BrowserRouter>
          <ScrollAndLenisManager />
          <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/quiz/:id/instructions" element={<Instructions />} />
                <Route path="/quiz/:id/test" element={<QuizTest />} />
                <Route path="/quiz/:id/terminated" element={<Terminated />} />
                <Route path="/quiz/:id/result" element={<Result />} />
                <Route path="/quiz/:id/review" element={<Review />} />
                <Route path="/history" element={<History />} />
                <Route path="/about" element={<About />} />
                <Route path="/create" element={<CreateQuiz />} />
                <Route path="/edit/new" element={<CreateQuiz />} />
                <Route path="/quiz/edit/new" element={<CreateQuiz />} />
                <Route path="/edit/:id" element={<CreateQuiz />} />
                <Route path="/quiz/:id/edit" element={<CreateQuiz />} />
                <Route path="/quiz/edit/:id" element={<CreateQuiz />} />
                <Route path="/contest" element={<ContestLobby />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </QuizProvider>
    </ErrorBoundary>
  );
}

export default App;

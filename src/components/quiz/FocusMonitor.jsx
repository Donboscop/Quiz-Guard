import React, { useEffect, useState, useRef } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';

export const FocusMonitor = ({ quizContainerRef, isActive = true }) => {
  const { sessionStatus, terminateQuiz, issueFocusWarning } = useQuiz();
  
  // Boundary monitoring state
  const [isMouseOutside, setIsMouseOutside] = useState(false);
  const [graceCountdown, setGraceCountdown] = useState(2);
  const [isMobile, setIsMobile] = useState(false);

  const graceTimerRef = useRef(null);

  // Check if device is touch or small viewport (mobile fallback)
  useEffect(() => {
    const checkMobile = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouch || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 1. MOUSE BOUNDARY MONITORING
  useEffect(() => {
    if (!isActive || sessionStatus !== 'in-progress' || isMobile) return;

    const handleMouseMove = (e) => {
      if (!quizContainerRef.current) return;
      const rect = quizContainerRef.current.getBoundingClientRect();
      const { clientX, clientY } = e;

      // Check if mouse cursor is within bounding box of quiz container
      const isOutside = (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      );

      if (isOutside) {
        if (!isMouseOutside) {
          setIsMouseOutside(true);
        }
      } else {
        if (isMouseOutside) {
          setIsMouseOutside(false);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive, sessionStatus, isMobile, isMouseOutside, quizContainerRef]);

  // 2. GRACE PERIOD COUNTDOWN TIMER (2...1...0) FOR BOUNDARY EXIT
  useEffect(() => {
    if (isMouseOutside && sessionStatus === 'in-progress') {
      setGraceCountdown(2);
      
      graceTimerRef.current = setInterval(() => {
        setGraceCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(graceTimerRef.current);
            // Count expired: TERMINATE TEST!
            terminateQuiz("Mouse cursor exited the designated test boundary area for longer than 2 seconds.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Returned inside boundary before 0 -> clear timer
      if (graceTimerRef.current) {
        clearInterval(graceTimerRef.current);
      }
      setGraceCountdown(2);
    }

    return () => {
      if (graceTimerRef.current) clearInterval(graceTimerRef.current);
    };
  }, [isMouseOutside, sessionStatus, terminateQuiz]);

  // 3. TAB SWITCHING / VISIBILITY CHANGE MONITORING
  useEffect(() => {
    if (!isActive || sessionStatus !== 'in-progress') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        issueFocusWarning(
          "Tab Switch / Window Defocus Detected",
          "Navigating away from the active quiz tab violates test proctoring rules. Repeated violations will immediately terminate your attempt."
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, sessionStatus, issueFocusWarning]);

  if (!isActive || sessionStatus !== 'in-progress') return null;

  return (
    <>
      {/* Mouse Exit Boundary Banner Overlay */}
      <AnimatePresence>
        {isMouseOutside && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
          >
            <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-950/95 border-2 border-rose-500 shadow-danger-glow backdrop-blur-xl text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 animate-bounce">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-rose-200">
                    Focus Lost! Cursor Outside Test Area
                  </h4>
                  <p className="text-xs text-rose-300">
                    Return your mouse cursor inside the test area immediately!
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center px-4 py-1.5 bg-rose-900/80 rounded-xl border border-rose-500/40">
                <span className="text-[10px] uppercase font-bold text-rose-300">Terminating in</span>
                <span className="font-mono font-black text-2xl text-white">{graceCountdown}s</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

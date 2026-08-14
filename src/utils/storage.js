// Centralized localStorage Manager for QuizGuard

const ATTEMPTS_KEY = 'quizguard_attempt_history_v1';
const ACTIVE_SESSION_KEY = 'quizguard_active_session_v1';

// Helper to check if localStorage is available
const isStorageAvailable = () => {
  try {
    const testKey = '__quizguard_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Save a completed or terminated quiz attempt
 * @param {Object} attempt 
 */
export const saveAttempt = (attempt) => {
  if (!isStorageAvailable()) {
    console.warn('localStorage is unavailable. Attempt will not persist across browser restarts.');
    return attempt;
  }

  try {
    const existing = getAttempts();
    const formattedAttempt = {
      id: attempt.id || `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      quizId: attempt.quizId,
      quizTitle: attempt.quizTitle,
      category: attempt.category,
      difficulty: attempt.difficulty,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      correctCount: attempt.correctCount,
      wrongCount: attempt.wrongCount,
      unansweredCount: attempt.unansweredCount,
      percentage: attempt.percentage,
      status: attempt.status || 'Completed', // 'Completed' | 'Terminated' | 'Time Expired'
      reason: attempt.reason || null,
      focusWarnings: attempt.focusWarnings || 0,
      timeTakenSeconds: attempt.timeTakenSeconds || 0,
      answers: attempt.answers || {},
      completedAt: new Date().toISOString()
    };

    const updated = [formattedAttempt, ...existing];
    window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(updated));
    return formattedAttempt;
  } catch (error) {
    console.error('Error saving quiz attempt to localStorage:', error);
    return attempt;
  }
};

/**
 * Get all attempts from storage
 */
export const getAttempts = () => {
  if (!isStorageAvailable()) return [];
  try {
    const data = window.localStorage.getItem(ATTEMPTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading attempt history:', error);
    return [];
  }
};

/**
 * Find an attempt by ID
 */
export const getAttemptById = (attemptId) => {
  const attempts = getAttempts();
  return attempts.find(a => a.id === attemptId) || null;
};

/**
 * Save in-progress quiz session (for page refresh restoration)
 */
export const saveCurrentQuizState = (sessionData) => {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Error saving active session state:', error);
  }
};

/**
 * Get active in-progress session
 */
export const getCurrentQuizState = () => {
  if (!isStorageAvailable()) return null;
  try {
    const data = window.localStorage.getItem(ACTIVE_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading active session state:', error);
    return null;
  }
};

/**
 * Clear active session on finish / terminate
 */
export const clearCurrentQuizState = () => {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (error) {
    console.error('Error clearing active session state:', error);
  }
};

/**
 * Clear all attempts history
 */
export const clearAllAttempts = () => {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.removeItem(ATTEMPTS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
};

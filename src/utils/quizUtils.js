// Utility functions for quiz logic, scoring, and formatting

/**
 * Formats seconds into MM:SS format
 * @param {number} totalSeconds 
 */
export const formatTime = (totalSeconds) => {
  if (totalSeconds < 0 || isNaN(totalSeconds)) return "00:00";
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Converts option index to letter (0 -> A, 1 -> B, 2 -> C, 3 -> D, 4 -> E, 5 -> F, etc.)
 */
export const getOptionLetter = (index) => {
  if (typeof index !== 'number' || index < 0) return String(index || '');
  return String.fromCharCode(65 + index);
};

/**
 * Checks if a question requires selecting multiple options
 */
export const isMultiAnswerQuestion = (question) => {
  if (!question) return false;
  if (Array.isArray(question.answer) && question.answer.length > 1) return true;
  if (question.multiple === true || question.type === 'multiple') return true;
  if (typeof question.question === 'string' && /select\s+(two|three|four|multiple|all)/i.test(question.question)) {
    return true;
  }
  return false;
};

/**
 * Returns sorted array of correct option indices for a question
 */
export const getCorrectAnswers = (question) => {
  if (!question) return [];
  if (Array.isArray(question.answer)) {
    return [...question.answer].map(n => Number(n)).filter(n => !isNaN(n)).sort((a, b) => a - b);
  }
  if (question.answer !== undefined && question.answer !== null && question.answer !== '') {
    return [Number(question.answer)];
  }
  return [];
};

/**
 * Returns sorted array of user selected option indices
 */
export const getUserAnswers = (userSelected) => {
  if (Array.isArray(userSelected)) {
    return [...userSelected].map(n => Number(n)).filter(n => !isNaN(n)).sort((a, b) => a - b);
  }
  if (userSelected !== undefined && userSelected !== null && userSelected !== '') {
    return [Number(userSelected)];
  }
  return [];
};

/**
 * Checks if a question has been answered by user
 */
export const isQuestionAnswered = (question, userSelected) => {
  const userArr = getUserAnswers(userSelected);
  return userArr.length > 0;
};

/**
 * Checks if user's selected options match correct answer exactly
 */
export const isQuestionCorrect = (question, userSelected) => {
  if (!isQuestionAnswered(question, userSelected)) return false;
  const correctArr = getCorrectAnswers(question);
  const userArr = getUserAnswers(userSelected);
  if (correctArr.length !== userArr.length) return false;
  return correctArr.every((val, idx) => val === userArr[idx]);
};

/**
 * Calculates quiz score metrics
 * @param {Array} questions 
 * @param {Object} userAnswers - map of questionId -> optionIndex or array of optionIndices
 * @param {number} totalDurationMins 
 * @param {number} remainingSeconds 
 */
export const calculateResults = (questions = [], userAnswers = {}, totalDurationMins = 10, remainingSeconds = 0) => {
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  questions.forEach((q) => {
    const selectedOption = userAnswers[q.id];
    if (!isQuestionAnswered(q, selectedOption)) {
      unansweredCount++;
    } else if (isQuestionCorrect(q, selectedOption)) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const totalQuestions = questions.length;
  const score = correctCount;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const totalDurationSeconds = totalDurationMins * 60;
  const timeTakenSeconds = Math.max(0, totalDurationSeconds - remainingSeconds);

  let grade = "Pass";
  let gradeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  if (percentage >= 90) {
    grade = "Mastery (A+)";
    gradeColor = "text-indigo-400 bg-indigo-500/10 border-indigo-500/30";
  } else if (percentage >= 75) {
    grade = "Proficient (A)";
    gradeColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
  } else if (percentage >= 50) {
    grade = "Satisfactory (B)";
    gradeColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
  } else {
    grade = "Needs Improvement (F)";
    gradeColor = "text-rose-400 bg-rose-500/10 border-rose-500/30";
  }

  return {
    score,
    totalQuestions,
    correctCount,
    wrongCount,
    unansweredCount,
    percentage,
    timeTakenSeconds,
    grade,
    gradeColor
  };
};

export const getQuestionTimelineGap = (quiz) => {
  if (!quiz) return 60; // Default 60 seconds
  if (quiz.timePerQuestion && typeof quiz.timePerQuestion === 'number' && quiz.timePerQuestion > 0) {
    return quiz.timePerQuestion;
  }
  const durationSec = (quiz.duration || 10) * 60;
  const qCount = quiz.questions?.length || 1;
  return Math.max(10, Math.round(durationSec / qCount));
};

/**
 * Format ISO date string into readable local format
 */
export const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch (e) {
    return isoString;
  }
};



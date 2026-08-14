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
 * Calculates quiz score metrics
 * @param {Array} questions 
 * @param {Object} userAnswers - map of questionId -> optionIndex
 * @param {number} totalDurationMins 
 * @param {number} remainingSeconds 
 */
export const calculateResults = (questions = [], userAnswers = {}, totalDurationMins = 10, remainingSeconds = 0) => {
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  questions.forEach((q) => {
    const selectedOption = userAnswers[q.id];
    if (selectedOption === undefined || selectedOption === null) {
      unansweredCount++;
    } else if (selectedOption === q.answer) {
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

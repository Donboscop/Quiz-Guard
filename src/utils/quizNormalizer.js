// Central Universal Quiz Normalizer for QuizGuard
// Converts any source (Manual, AI, PPTX, PDF, Text, JSON) into the canonical QuizGuard Schema

import { CATEGORIES } from '../data/quizzes';

/**
 * Validate a raw quiz object from any importer
 * @param {any} raw 
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateQuizSchema = (raw) => {
  const errors = [];

  if (!raw || typeof raw !== 'object') {
    return { isValid: false, errors: ['Invalid quiz object format. Expected a JSON object.'] };
  }

  if (!raw.title || typeof raw.title !== 'string' || !raw.title.trim()) {
    errors.push('Quiz title is required.');
  }

  if (!raw.questions || !Array.isArray(raw.questions) || raw.questions.length === 0) {
    errors.push('Quiz must contain at least one question in a "questions" array.');
  } else {
    raw.questions.forEach((q, idx) => {
      const qNum = idx + 1;
      if (!q || typeof q !== 'object') {
        errors.push(`Question #${qNum} is not a valid object.`);
        return;
      }
      if (!q.question || typeof q.question !== 'string' || !q.question.trim()) {
        errors.push(`Question #${qNum} is missing the question prompt.`);
      }
      if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`Question #${qNum} must have at least 2 answer options.`);
      } else {
        const hasEmptyOption = q.options.some(opt => typeof opt !== 'string' || !opt.trim());
        if (hasEmptyOption) {
          errors.push(`Question #${qNum} contains blank option choices.`);
        }
      }

      // Check answer index
      if (q.answer === undefined && q.correctAnswer === undefined && q.correct_option === undefined) {
        errors.push(`Question #${qNum} must specify the correct answer.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Shuffles options while preserving the correct answer mapping
 * @param {string[]} optionsArr 
 * @param {number} answerIndex 
 * @returns {{ options: string[], answer: number }}
 */
export const shuffleQuestionOptions = (optionsArr, answerIndex = 0) => {
  if (!Array.isArray(optionsArr) || optionsArr.length <= 1) {
    return { options: optionsArr || [], answer: answerIndex || 0 };
  }

  const validAnswerIndex = (answerIndex >= 0 && answerIndex < optionsArr.length) ? answerIndex : 0;
  
  // Check if last item is "All of the above" or "None of the above"
  const lastItem = String(optionsArr[optionsArr.length - 1] || '').trim().toLowerCase();
  const keepLastFixed = lastItem === 'none of the above' || lastItem === 'all of the above';

  if (keepLastFixed && optionsArr.length > 2) {
    const regularItems = optionsArr.slice(0, -1).map((opt, i) => ({ opt, isCorrect: i === validAnswerIndex }));
    const lastIsCorrect = validAnswerIndex === optionsArr.length - 1;

    for (let i = regularItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [regularItems[i], regularItems[j]] = [regularItems[j], regularItems[i]];
    }

    const shuffled = regularItems.map(item => item.opt);
    shuffled.push(optionsArr[optionsArr.length - 1]);
    
    const newAnswer = lastIsCorrect ? shuffled.length - 1 : regularItems.findIndex(item => item.isCorrect);

    return {
      options: shuffled,
      answer: newAnswer !== -1 ? newAnswer : 0
    };
  }

  // Standard full Fisher-Yates shuffle
  const items = optionsArr.map((opt, i) => ({ opt, isCorrect: i === validAnswerIndex }));
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return {
    options: items.map(item => item.opt),
    answer: items.findIndex(item => item.isCorrect) >= 0 ? items.findIndex(item => item.isCorrect) : 0
  };
};

/**
 * Normalize any input into the canonical QuizGuard Quiz structure
 * @param {Object} rawInput 
 * @param {Object} [options] 
 * @returns {Object} Canonical QuizGuard Quiz
 */
export const normalizeQuiz = (rawInput, options = {}) => {
  if (!rawInput || typeof rawInput !== 'object') {
    throw new Error('Invalid input provided to quiz normalizer');
  }

  const raw = { ...rawInput };
  const targetId = raw.id && String(raw.id).startsWith('custom_') 
    ? String(raw.id) 
    : `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Find or default category
  let categoryId = raw.categoryId || raw.category_id;
  let categoryName = raw.category || raw.categoryName;

  if (categoryId) {
    const matched = CATEGORIES.find(c => c.id.toLowerCase() === String(categoryId).toLowerCase());
    if (matched) {
      categoryId = matched.id;
      categoryName = matched.name;
    }
  } else if (categoryName) {
    const matched = CATEGORIES.find(c => c.name.toLowerCase() === String(categoryName).toLowerCase());
    if (matched) {
      categoryId = matched.id;
      categoryName = matched.name;
    } else {
      categoryId = 'cs';
    }
  } else {
    categoryId = 'cs';
    categoryName = 'Computer Science';
  }

  const title = (raw.title || raw.quizTitle || 'Custom Assessment').trim();
  const description = (raw.description || raw.summary || `Assessment on ${title}`).trim();
  const difficulty = ['Easy', 'Medium', 'Hard'].includes(raw.difficulty) ? raw.difficulty : 'Medium';
  const duration = Number(raw.duration) > 0 ? Number(raw.duration) : Math.max(5, (raw.questions?.length || 5) * 2);
  const timePerQuestion = Number(raw.timePerQuestion) > 0 ? Number(raw.timePerQuestion) : 60;

  // Normalize questions array
  const rawQuestions = Array.isArray(raw.questions) ? raw.questions : [];
  const normalizedQuestions = rawQuestions.map((q, idx) => {
    // Determine options
    let optionsArr = Array.isArray(q.options) 
      ? q.options.map(opt => String(opt).trim()) 
      : ['Option A', 'Option B', 'Option C', 'Option D'];

    // Ensure at least 4 options if standard MCQ
    if (optionsArr.length === 2 && optionsArr.every(o => ['true', 'false', 'yes', 'no'].includes(o.toLowerCase()))) {
      // True/False question is allowed as-is
    } else if (optionsArr.length === 2) {
      optionsArr = [...optionsArr, 'None of the above', 'All of the above'];
    } else if (optionsArr.length === 3) {
      optionsArr = [...optionsArr, 'None of the above'];
    }

    // Determine correct answer index (support 0-indexed, 1-indexed, letter 'A'/'B'/'C'/'D', or exact string match)
    let answerIndex = 0;
    const rawAnswer = q.answer !== undefined ? q.answer : (q.correctAnswer !== undefined ? q.correctAnswer : q.correct_option);

    if (typeof rawAnswer === 'number') {
      if (rawAnswer >= 0 && rawAnswer < optionsArr.length) {
        answerIndex = rawAnswer;
      } else if (rawAnswer >= 1 && rawAnswer <= optionsArr.length) {
        // 1-indexed conversion
        answerIndex = rawAnswer - 1;
      }
    } else if (typeof rawAnswer === 'string') {
      const upper = rawAnswer.trim().toUpperCase();
      const letterIndex = ['A', 'B', 'C', 'D', 'E', 'F'].indexOf(upper);
      if (letterIndex !== -1 && letterIndex < optionsArr.length) {
        answerIndex = letterIndex;
      } else {
        // Search if rawAnswer matches any option text directly
        const matchIdx = optionsArr.findIndex(opt => opt.toLowerCase() === rawAnswer.trim().toLowerCase());
        if (matchIdx !== -1) {
          answerIndex = matchIdx;
        }
      }
    }

    // Shuffle options to prevent positional bias (unless shuffleOptions is explicitly set to false)
    let finalOptions = optionsArr;
    let finalAnswer = answerIndex;
    if (options.shuffleOptions !== false) {
      const shuffled = shuffleQuestionOptions(optionsArr, answerIndex);
      finalOptions = shuffled.options;
      finalAnswer = shuffled.answer;
    }

    return {
      id: q.id ? Number(q.id) || (Date.now() + idx) : (Date.now() + idx),
      question: String(q.question || `Question ${idx + 1}`).trim(),
      options: finalOptions,
      answer: finalAnswer,
      explanation: String(q.explanation || 'Verified correct answer.').trim(),
      sourceSlide: q.sourceSlide || q.source_slide || undefined,
      sourcePage: q.sourcePage || q.source_page || undefined,
      sourceNote: q.sourceNote || q.source_note || undefined,
      codeSnippet: q.codeSnippet || q.code || undefined
    };
  });

  return {
    id: targetId,
    title,
    description,
    categoryId,
    category: categoryName || 'General',
    difficulty,
    duration,
    timePerQuestion,
    totalQuestions: normalizedQuestions.length,
    questions: normalizedQuestions,
    isCustom: true,
    isAiGenerated: Boolean(raw.isAiGenerated || options.sourceType === 'ai' || options.sourceType === 'pptx' || options.sourceType === 'pdf' || options.sourceType === 'text'),
    sourceType: options.sourceType || raw.sourceType || 'manual',
    aiModel: raw.aiModel || (options.sourceType !== 'manual' ? 'QuizGuard AI Engine' : undefined),
    createdAt: raw.createdAt || new Date().toISOString(),
    publishedAt: raw.publishedAt || new Date().toISOString()
  };
};

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { CATEGORIES, getQuizById, saveCustomQuiz, deleteCustomQuiz } from '../data/quizzes';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { PlusCircle, Trash2, Save, ArrowLeft, AlertCircle, HelpCircle, Check, Sparkles, Code, FileText, Copy, CheckCheck, Edit3, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOptionLetter } from '../utils/quizUtils';

export const CreateQuiz = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id && id !== 'new');

  // Creation mode state: 'manual' | 'json'
  const [creationMode, setCreationMode] = useState('manual');
  
  // JSON console state
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [copied, setCopied] = useState(false);

  // General quiz metadata state (manual mode)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(CATEGORIES[0]?.id || 'js');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState(10); // in minutes
  const [timePerQuestion, setTimePerQuestion] = useState(60); // in seconds per question timeline gap

  // Questions list state (manual mode)
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      question: '',
      options: ['', ''], // Starts with 2 options
      answer: 0, // Index of correct answer
      explanation: ''
    }
  ]);
  
  const [errors, setErrors] = useState({});

  // Effect to load existing quiz data when in editing mode
  useEffect(() => {
    if (isEditing) {
      const existingQuiz = getQuizById(id);
      if (existingQuiz) {
        setTitle(existingQuiz.title || '');
        setDescription(existingQuiz.description || '');
        setCategoryId(existingQuiz.categoryId || CATEGORIES[0].id);
        setDifficulty(existingQuiz.difficulty || 'Medium');
        setDuration(existingQuiz.duration || 10);
        setTimePerQuestion(existingQuiz.timePerQuestion || 60);
        if (Array.isArray(existingQuiz.questions) && existingQuiz.questions.length > 0) {
          setQuestions(existingQuiz.questions);
        }
        // Set jsonText prefilled
        const templateObj = {
          title: existingQuiz.title,
          description: existingQuiz.description,
          categoryId: existingQuiz.categoryId,
          difficulty: existingQuiz.difficulty,
          duration: existingQuiz.duration,
          timePerQuestion: existingQuiz.timePerQuestion || 60,
          questions: existingQuiz.questions
        };
        setJsonText(JSON.stringify(templateObj, null, 2));
      }
    }
  }, [id, isEditing]);

  const sampleJsonTemplate = `{
  "title": "Node.js Event Loop Masterclass",
  "description": "Test your knowledge of the event loop phases, microtasks, timers, and process.nextTick().",
  "categoryId": "cs",
  "difficulty": "Hard",
  "duration": 15,
  "timePerQuestion": 60,
  "questions": [
    {
      "question": "Which phase of the Node.js event loop executes callbacks scheduled by setTimeout()?",
      "options": [
        "Timers Phase",
        "Pending Callbacks Phase",
        "Poll Phase",
        "Check Phase"
      ],
      "answer": 0,
      "explanation": "The Timers phase executes callbacks scheduled by setTimeout() and setInterval()."
    }
  ]
}`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleJsonTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add a new blank question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now() + Math.random(),
        question: '',
        options: ['', ''],
        answer: 0,
        explanation: ''
      }
    ]);
  };

  // Remove a question
  const handleRemoveQuestion = (qIndex) => {
    if (questions.length <= 1) {
      alert("A quiz must have at least 1 question.");
      return;
    }
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  // Update question text
  const handleQuestionTextChange = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].question = value;
    setQuestions(updated);
  };

  // Update explanation text
  const handleExplanationChange = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].explanation = value;
    setQuestions(updated);
  };

  // Add an option to a question
  const handleAddOption = (qIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options.length >= 6) {
      alert("Maximum 6 options allowed per question.");
      return;
    }
    updated[qIndex].options.push('');
    setQuestions(updated);
  };

  // Remove an option from a question
  const handleRemoveOption = (qIndex, optIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options.length <= 2) {
      alert("A question must have at least 2 options.");
      return;
    }
    
    // Adjust correct answer index if it gets deleted or shifted
    if (updated[qIndex].answer === optIndex) {
      updated[qIndex].answer = 0; // Default to first if correct one removed
    } else if (updated[qIndex].answer > optIndex) {
      updated[qIndex].answer -= 1; // Shift down
    }
    
    updated[qIndex].options = updated[qIndex].options.filter((_, idx) => idx !== optIndex);
    setQuestions(updated);
  };

  // Update option text
  const handleOptionTextChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  // Choose the correct answer option index
  const handleSelectCorrectAnswer = (qIndex, optIndex) => {
    const updated = [...questions];
    const currentAns = updated[qIndex].answer;
    if (Array.isArray(currentAns)) {
      let arr = [...currentAns];
      if (arr.includes(optIndex)) {
        if (arr.length > 1) {
          arr = arr.filter(i => i !== optIndex);
        }
      } else {
        arr.push(optIndex);
      }
      arr.sort((a, b) => a - b);
      updated[qIndex].answer = arr;
    } else {
      updated[qIndex].answer = optIndex;
    }
    setQuestions(updated);
  };

  // Toggle single vs multi-select mode for a question
  const handleToggleMultipleChoice = (qIndex) => {
    const updated = [...questions];
    const currentAns = updated[qIndex].answer;
    if (Array.isArray(currentAns)) {
      // Switch to single answer mode
      updated[qIndex].answer = currentAns[0] !== undefined ? currentAns[0] : 0;
    } else {
      // Switch to multi answer mode
      updated[qIndex].answer = [currentAns !== undefined ? currentAns : 0];
    }
    setQuestions(updated);
  };

  // Helper to resolve category from ID, name, or alias flexibly
  const resolveCategory = (input) => {
    if (!input || typeof input !== 'string') return CATEGORIES[0];
    const rawTrimmed = input.trim();
    const cleaned = rawTrimmed.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Exact or case-insensitive ID match
    const byId = CATEGORIES.find(c => c.id.toLowerCase() === rawTrimmed.toLowerCase());
    if (byId) return byId;

    // 2. Name match (exact or cleaned)
    const byName = CATEGORIES.find(c => {
      const cNameCleaned = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return c.name.toLowerCase() === rawTrimmed.toLowerCase() || (cleaned && cNameCleaned === cleaned);
    });
    if (byName) return byName;

    // 3. Known Aliases
    const ALIAS_MAP = {
      js: 'js', javascript: 'js', node: 'js', nodejs: 'js', es6: 'js', express: 'js', typescript: 'js', ts: 'js',
      react: 'react', reactjs: 'react', jsx: 'react', frontendreact: 'react',
      web: 'web', html: 'web', css: 'web', htmlcss: 'web', html5: 'web', css3: 'web', frontend: 'web', webdev: 'web',
      gk: 'gk', generalknowledge: 'gk', general: 'gk', world: 'gk', trivia: 'gk',
      aptitude: 'aptitude', logic: 'aptitude', reasoning: 'aptitude', math: 'aptitude', aptitudelogic: 'aptitude',
      cloud: 'cloud', aws: 'cloud', azure: 'cloud', gcp: 'cloud', devops: 'cloud', serverless: 'cloud', cloudcomputing: 'cloud',
      cs: 'cs', computerscience: 'cs', dsa: 'cs', algo: 'cs', programming: 'cs', database: 'cs', dbms: 'cs'
    };

    if (ALIAS_MAP[cleaned]) {
      const matched = CATEGORIES.find(c => c.id === ALIAS_MAP[cleaned]);
      if (matched) return matched;
    }

    // 4. Substring match
    const partial = CATEGORIES.find(c => 
      cleaned && (cleaned.includes(c.id.toLowerCase()) || c.name.toLowerCase().includes(cleaned))
    );
    if (partial) return partial;

    // Fallback safely to Computer Science (or first category)
    return CATEGORIES.find(c => c.id === 'cs') || CATEGORIES[0];
  };

  // Handle JSON submission
  const handleJsonSubmit = (e) => {
    e.preventDefault();
    setJsonError(null);

    try {
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (syntaxErr) {
        throw new Error(`JSON Formatting Error: ${syntaxErr.message}. Please verify quotes and commas.`);
      }

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error("Invalid JSON structure. Root element must be an object { ... }.");
      }

      // 1. Validate & Normalize Metadata
      if (!parsed.title || typeof parsed.title !== 'string' || !parsed.title.trim()) {
        throw new Error("Invalid or missing 'title' (non-empty string required).");
      }

      const matchedCat = resolveCategory(parsed.categoryId);

      let normalizedDifficulty = 'Medium';
      if (parsed.difficulty && typeof parsed.difficulty === 'string') {
        const d = parsed.difficulty.trim().toLowerCase();
        if (d === 'easy') normalizedDifficulty = 'Easy';
        else if (d === 'hard') normalizedDifficulty = 'Hard';
        else if (d === 'medium') normalizedDifficulty = 'Medium';
      }

      let normalizedDuration = 10;
      if (typeof parsed.duration === 'number' && parsed.duration > 0) {
        normalizedDuration = Math.round(parsed.duration);
      } else if (parsed.duration && !isNaN(parseInt(parsed.duration, 10))) {
        const parsedDur = parseInt(parsed.duration, 10);
        if (parsedDur > 0) normalizedDuration = parsedDur;
      }

      const normalizedDescription = (parsed.description && typeof parsed.description === 'string' && parsed.description.trim())
        ? parsed.description.trim()
        : `Assessment for ${parsed.title.trim()} in ${matchedCat.name}.`;

      if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error("Invalid or missing 'questions'. Must be a non-empty array of question objects.");
      }

      // 2. Validate & Format Questions
      const formattedQuestions = parsed.questions.map((q, idx) => {
        if (!q || typeof q !== 'object') {
          throw new Error(`Question ${idx + 1}: Must be an object.`);
        }
        if (!q.question || typeof q.question !== 'string' || !q.question.trim()) {
          throw new Error(`Question ${idx + 1}: Invalid or missing 'question' statement.`);
        }

        let opts = [];
        if (Array.isArray(q.options)) {
          opts = q.options.map(o => (typeof o === 'string' ? o.trim() : String(o).trim())).filter(Boolean);
        }
        if (opts.length < 2) {
          throw new Error(`Question ${idx + 1}: 'options' must contain at least 2 valid string options.`);
        }

        let answerIndex = 0;
        if (Array.isArray(q.answer)) {
          const parsedArr = q.answer
            .map(n => Number(n))
            .filter(n => !isNaN(n) && n >= 0 && n < opts.length);
          answerIndex = Array.from(new Set(parsedArr)).sort((a, b) => a - b);
          if (answerIndex.length === 0) answerIndex = 0;
        } else if (typeof q.answer === 'number' && q.answer >= 0 && q.answer < opts.length) {
          answerIndex = Math.floor(q.answer);
        } else if (typeof q.answer === 'string') {
          const parsedIdx = parseInt(q.answer.trim(), 10);
          if (!isNaN(parsedIdx) && parsedIdx >= 0 && parsedIdx < opts.length) {
            answerIndex = parsedIdx;
          } else {
            const matchedOptIdx = opts.findIndex(opt => opt.toLowerCase() === q.answer.trim().toLowerCase());
            if (matchedOptIdx !== -1) {
              answerIndex = matchedOptIdx;
            }
          }
        }

        return {
          id: 2000 + idx,
          question: q.question.trim(),
          options: opts,
          answer: answerIndex,
          explanation: (q.explanation && typeof q.explanation === 'string' && q.explanation.trim()) 
            ? q.explanation.trim() 
            : "Correct answer verified."
        };
      });

      let normalizedTimePerQuestion = 60;
      if (typeof parsed.timePerQuestion === 'number' && parsed.timePerQuestion > 0) {
        normalizedTimePerQuestion = Math.round(parsed.timePerQuestion);
      } else {
        normalizedTimePerQuestion = Math.max(10, Math.round((normalizedDuration * 60) / formattedQuestions.length));
      }

      // 3. Construct and Save Quiz
      const targetId = isEditing ? id : `custom-${Date.now()}`;
      const newQuiz = {
        id: targetId,
        categoryId: matchedCat.id,
        category: matchedCat.name,
        title: parsed.title.trim(),
        description: normalizedDescription,
        difficulty: normalizedDifficulty,
        duration: normalizedDuration,
        timePerQuestion: normalizedTimePerQuestion,
        totalQuestions: formattedQuestions.length,
        questions: formattedQuestions
      };

      saveCustomQuiz(newQuiz);

      alert(`Success! ${isEditing ? 'Updated' : 'Imported'} "${newQuiz.title}" under category "${matchedCat.name}" with ${newQuiz.totalQuestions} questions.`);
      navigate('/categories');

    } catch (err) {
      setJsonError(err.message || "Invalid JSON syntax.");
    }
  };

  // Delete quiz handler
  const handleDeleteQuiz = () => {
    if (!isEditing || !id) return;
    if (window.confirm(`Are you sure you want to delete "${title || 'this quiz'}"? This action cannot be undone.`)) {
      deleteCustomQuiz(id);
      alert("Quiz deleted successfully.");
      navigate('/categories');
    }
  };

  // Validate manual form and submit
  const handleManualSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    // 1. Validate metadata
    if (!title.trim()) newErrors.title = "Quiz title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (duration <= 0) newErrors.duration = "Duration must be greater than 0.";

    // 2. Validate questions
    const questionErrors = [];
    questions.forEach((q, qIdx) => {
      const qErr = {};
      if (!q.question.trim()) {
        qErr.question = "Question text is required.";
      }
      
      const optionErrs = [];
      q.options.forEach((opt, optIdx) => {
        if (!opt.trim()) {
          optionErrs[optIdx] = `Option ${optIdx + 1} cannot be blank.`;
        }
      });
      
      if (optionErrs.length > 0) {
        qErr.options = optionErrs;
      }
      
      if (Object.keys(qErr).length > 0) {
        questionErrors[qIdx] = qErr;
      }
    });

    if (questionErrors.length > 0) {
      newErrors.questions = questionErrors;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please correct all highlighted errors before submitting.");
      return;
    }

    // 3. Assemble and save the quiz
    const categoryObj = CATEGORIES.find(c => c.id === categoryId);
    const categoryName = categoryObj ? categoryObj.name : 'General';
    const targetId = isEditing ? id : `custom-${Date.now()}`;

    const formattedQuestions = questions.map((q, idx) => ({
      id: 1000 + idx, // Simple ID spacing
      question: q.question.trim(),
      options: q.options.map(o => o.trim()),
      answer: q.answer,
      explanation: q.explanation.trim() || "Correct answer verified."
    }));

    const parsedDur = parseInt(duration, 10);
    const parsedTimePerQ = parseInt(timePerQuestion, 10) || Math.max(10, Math.round((parsedDur * 60) / formattedQuestions.length));

    const newQuiz = {
      id: targetId,
      categoryId,
      category: categoryName,
      title: title.trim(),
      description: description.trim(),
      difficulty,
      duration: parsedDur,
      timePerQuestion: parsedTimePerQ,
      totalQuestions: formattedQuestions.length,
      questions: formattedQuestions
    };

    try {
      saveCustomQuiz(newQuiz);
      
      alert(`Success! Quiz "${title}" ${isEditing ? 'updated' : 'created'} successfully.`);
      navigate('/categories');
    } catch (err) {
      console.error(err);
      alert("Failed to save quiz. LocalStorage might be full.");
    }
  };


  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Breadcrumb */}
      <Link to="/categories" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Categories
      </Link>

      {/* Header Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-semibold">
            {isEditing ? <Edit3 className="w-4 h-4 text-brand-400" /> : <Sparkles className="w-4 h-4 text-brand-400" />}
            <span>{isEditing ? 'Quiz Editor Engine' : 'Interactive Quiz Builder'}</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
            {isEditing ? `Edit Quiz: ${title || 'Loading...'}` : 'Create Custom Quiz'}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            {isEditing
              ? 'Update metadata, add or remove questions, edit answer options, or modify the JSON schema directly.'
              : 'Create custom assessments either by typing questions in the form, or by pasting a JSON configuration block (perfect for importing hundreds of questions instantly).'}
          </p>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleDeleteQuiz}
            className="self-start md:self-center px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Delete Quiz</span>
          </button>
        )}
      </div>


      {/* TOGGLE SELECTOR MODE */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800/80 max-w-md">
        <button
          type="button"
          onClick={() => setCreationMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold transition-all focus:outline-none ${
            creationMode === 'manual'
              ? 'bg-brand-600 text-white shadow-glow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Form Builder
        </button>
        <button
          type="button"
          onClick={() => setCreationMode('json')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold transition-all focus:outline-none ${
            creationMode === 'json'
              ? 'bg-brand-600 text-white shadow-glow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" />
          JSON Console Import
        </button>
      </div>

      {/* MODE 1: MANUAL BUILDER FORM */}
      {creationMode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-10">
          
          {/* SECTION 1: QUIZ INFO CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-2xl rounded-full pointer-events-none" />
            
            <h3 className="font-display font-bold text-lg text-white border-b border-slate-800 pb-3">
              1. Quiz Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Title */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quiz Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master React Portals & Suspense"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors(prev => ({ ...prev, title: null }));
                  }}
                  className={`w-full px-4 py-3 rounded-2xl bg-slate-950/80 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    errors.title ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500'
                  }`}
                />
                {errors.title && <span className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.title}</span>}
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief summary of what this quiz covers..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors(prev => ({ ...prev, description: null }));
                  }}
                  className={`w-full px-4 py-3 rounded-2xl bg-slate-950/80 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all resize-none ${
                    errors.description ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500'
                  }`}
                />
                {errors.description && <span className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.description}</span>}
              </div>

              {/* Category selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty, Duration & Per-Question Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Limit (mins)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value);
                      if (errors.duration) setErrors(prev => ({ ...prev, duration: null }));
                    }}
                    className={`w-full px-4 py-3 rounded-2xl bg-slate-950/80 border text-sm text-white focus:outline-none focus:ring-1 transition-all ${
                      errors.duration ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Time Gap / Quest (sec)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={timePerQuestion}
                    onChange={(e) => setTimePerQuestion(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: DYNAMIC QUESTIONS BUILDER */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-lg text-white">
                2. Questions & Answer Key
              </h3>
              <Badge variant="brand" size="md">
                {questions.length} {questions.length === 1 ? 'Question' : 'Questions'} Added
              </Badge>
            </div>

            <div className="space-y-8">
              <AnimatePresence initial={false}>
                {questions.map((q, qIdx) => {
                  const qErrObj = errors.questions?.[qIdx] || {};
                  
                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 relative group shadow-lg"
                    >
                      {/* Header bar of question card */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 font-mono font-bold flex items-center justify-center text-sm shadow-glow-sm">
                            {qIdx + 1}
                          </span>
                          <h4 className="font-display font-bold text-sm sm:text-base text-white">
                            Question Block
                          </h4>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleMultipleChoice(qIdx)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              Array.isArray(q.answer)
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-glow-sm'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                            title="Toggle between single answer and multi-select mode"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                            <span>{Array.isArray(q.answer) ? 'Multi-Select (Select Multiple)' : 'Single Choice'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 transition-all opacity-80 group-hover:opacity-100"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Question text input */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Statement</label>
                        <input
                          type="text"
                          placeholder="What is the output of... / Which statement is true?"
                          value={q.question}
                          onChange={(e) => {
                            handleQuestionTextChange(qIdx, e.target.value);
                            if (errors.questions) setErrors(prev => ({ ...prev, questions: null }));
                          }}
                          className={`w-full px-4 py-3 rounded-2xl bg-slate-950/80 border text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all ${
                            qErrObj.question ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700/80 focus:border-brand-500 focus:ring-brand-500'
                          }`}
                        />
                        {qErrObj.question && <span className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{qErrObj.question}</span>}
                      </div>

                      {/* Options list container */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Options & Correct Answer</label>
                          <span className="text-[10px] text-slate-400 italic">
                            {Array.isArray(q.answer) ? 'Click checkmarks to toggle multiple correct answers' : 'Click checkmark to set as correct answer'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3.5">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = Array.isArray(q.answer) ? q.answer.includes(optIdx) : q.answer === optIdx;
                            const optErr = qErrObj.options?.[optIdx];
                            const letter = getOptionLetter(optIdx);
                            
                            return (
                              <div key={optIdx} className="flex items-center gap-3">
                                
                                {/* Set Correct Checkbox Badge */}
                                <button
                                  type="button"
                                  onClick={() => handleSelectCorrectAnswer(qIdx, optIdx)}
                                  className={`w-10 h-10 border flex items-center justify-center transition-all ${
                                    Array.isArray(q.answer) ? 'rounded-xl' : 'rounded-xl'
                                  } ${
                                    isCorrect
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-glow-sm'
                                      : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
                                  }`}
                                  title={isCorrect ? "Correct Answer Designated" : "Mark as Correct Answer"}
                                >
                                  <Check className={`w-5 h-5 ${isCorrect ? 'scale-110 stroke-[3]' : 'opacity-30'}`} />
                                </button>

                                {/* Option Input field */}
                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    placeholder={`Option ${letter}...`}
                                    value={opt}
                                    onChange={(e) => {
                                      handleOptionTextChange(qIdx, optIdx, e.target.value);
                                      if (errors.questions) setErrors(prev => ({ ...prev, questions: null }));
                                    }}
                                    className={`w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-950/80 border text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-1 transition-all ${
                                      optErr ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500'
                                    }`}
                                  />
                                  
                                  {q.options.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveOption(qIdx, optIdx)}
                                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-rose-400 transition-colors"
                                      title="Delete Option"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>

                              </div>
                            );
                          })}
                        </div>

                        {/* Add Option Trigger button */}
                        {q.options.length < 6 && (
                          <button
                            type="button"
                            onClick={() => handleAddOption(qIdx)}
                            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 pt-1.5 focus:outline-none"
                          >
                            <PlusCircle className="w-4 h-4" />
                            Add Option ({q.options.length}/6)
                          </button>
                        )}
                      </div>

                      {/* Explanation field */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-slate-400" />
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Answer Explanation (Optional)</label>
                        </div>
                        <input
                          type="text"
                          placeholder="Provide details explaining why this option is correct..."
                          value={q.explanation}
                          onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        />
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Add Question Card Button */}
              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full py-5 rounded-3xl border-2 border-dashed border-slate-800 hover:border-brand-500/40 bg-slate-900/40 hover:bg-slate-900/60 text-slate-400 hover:text-brand-300 font-semibold text-sm transition-all flex items-center justify-center gap-2 focus:outline-none"
              >
                <PlusCircle className="w-5 h-5" />
                Add Another Question
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON ROW */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-800/80">
            <Link to="/categories">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            
            <Button
              type="submit"
              variant="primary"
              icon={Save}
            >
              Create & Publish Quiz
            </Button>
          </div>

        </form>
      )}

      {/* MODE 2: JSON IMPORT CONSOLE */}
      {creationMode === 'json' && (
        <form onSubmit={handleJsonSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: JSON Code Console Editor */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-display font-bold text-sm sm:text-base text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-brand-400" />
                    Paste JSON Schema
                  </h3>
                  <Badge variant="brand" size="sm">JSON Parser v1.0</Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Raw JSON Block</label>
                  <textarea
                    rows="15"
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder={`{\n  "title": "My Custom Exam",\n  ...\n}`}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 text-slate-300 font-mono text-xs border border-slate-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-slate-700"
                  />
                </div>

                {/* Validation Error Message Box */}
                {jsonError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-semibold block mb-0.5">Validation Error</strong>
                      {jsonError}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Right 1 Col: Guidelines & Copy Template */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 blur-2xl rounded-full pointer-events-none" />
                
                <h3 className="font-display font-bold text-sm sm:text-base text-white">
                  JSON Schema Template
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Use this blueprint template to shape your questions. Copy the format and replace the text with your own assessment details.
                </p>

                {/* Interactive template visual */}
                <div className="relative rounded-2xl bg-slate-950 p-3 border border-slate-800 max-h-[220px] overflow-y-auto">
                  <pre className="text-[10px] font-mono text-slate-500 select-all leading-relaxed">
                    {sampleJsonTemplate}
                  </pre>
                  
                  <button
                    type="button"
                    onClick={handleCopyTemplate}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all flex items-center gap-1 text-[10px] font-semibold"
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Key Attributes</h4>
                  <ul className="text-[10px] text-slate-400 space-y-2 pl-4 list-disc leading-relaxed">
                    <li><strong className="text-slate-200">categoryId:</strong> Accepts category ID (<code className="text-brand-400 font-bold bg-slate-950 px-1 py-0.5 rounded">cs</code>, <code className="text-brand-400 font-bold bg-slate-950 px-1 py-0.5 rounded">cloud</code>, <code className="text-brand-400 font-bold bg-slate-950 px-1 py-0.5 rounded">js</code>, <code className="text-brand-400 font-bold bg-slate-950 px-1 py-0.5 rounded">react</code>, <code className="text-brand-400 font-bold bg-slate-950 px-1 py-0.5 rounded">web</code>, <code className="text-brand-400 font-bold bg-slate-950 px-1 py-0.5 rounded">gk</code>, <code className="text-brand-400 font-bold bg-slate-950 px-1 py-0.5 rounded">aptitude</code>), category names (e.g., <code className="text-slate-300">"Cloud Computing"</code>, <code className="text-slate-300">"Computer Science"</code>), or tech keywords (<code className="text-slate-300">"AWS"</code>, <code className="text-slate-300">"Node"</code>). Auto-normalizes case and spacing.</li>
                    <li><strong className="text-slate-200">difficulty:</strong> Accepts <code className="text-slate-300">"Easy"</code>, <code className="text-slate-300">"Medium"</code>, or <code className="text-slate-300">"Hard"</code> (case-insensitive, defaults to Medium).</li>
                    <li><strong className="text-slate-200">answer:</strong> 0-indexed index of correct option (e.g. <code className="text-emerald-400">0</code> for 1st option) or matching option text string.</li>
                  </ul>
                </div>

              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800/80">
            <Link to="/categories">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              disabled={!jsonText.trim()}
            >
              Import & Publish Quiz
            </Button>
          </div>

        </form>
      )}

    </div>
  );
};

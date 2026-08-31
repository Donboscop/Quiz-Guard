import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { CATEGORIES, getQuizById, saveCustomQuiz } from '../data/quizzes';
import { normalizeQuiz, validateQuizSchema } from '../utils/quizNormalizer';
import { parsePptxFile, parsePdfFile, parseRawText } from '../utils/documentParsers';
import { generateAiQuiz, generateQuizFromPptx, generateQuizFromPdf, generateQuizFromText } from '../utils/aiQuizGenerator';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { 
  Sparkles, FileText, Upload, PlusCircle, Trash2, Copy, Save, ArrowLeft, ArrowRight,
  AlertCircle, CheckCircle2, RefreshCw, FileUp, HelpCircle, Code, Eye, Layers, BookOpen,
  Check, MoveUp, MoveDown, Edit3, Shield, Users, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOptionLetter } from '../utils/quizUtils';

export const CreateQuiz = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id && id !== 'new');

  const pptxInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const jsonInputRef = useRef(null);

  // Stages: 'select-mode' | 'input' | 'review' | 'published'
  const [stage, setStage] = useState(isEditing ? 'review' : 'select-mode');
  // Creation modes: 'manual' | 'ai' | 'pptx' | 'pdf' | 'text' | 'json'
  const [creationMode, setCreationMode] = useState('manual');

  // Loading & error states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // Common Quiz metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('cs');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState(10); // minutes
  const [timePerQuestion, setTimePerQuestion] = useState(60); // seconds
  const [questionCount, setQuestionCount] = useState(5);
  const [language, setLanguage] = useState('English');

  // Mode 2: AI Topic
  const [aiTopic, setAiTopic] = useState('');

  // Mode 3: PPTX File
  const [pptxFile, setPptxFile] = useState(null);
  const [parsedPptx, setParsedPptx] = useState(null);

  // Mode 4: PDF File
  const [pdfFile, setPdfFile] = useState(null);
  const [parsedPdf, setParsedPdf] = useState(null);

  // Mode 5: Pasted Text
  const [rawText, setRawText] = useState('');

  // Mode 6: JSON
  const [jsonText, setJsonText] = useState('');

  // Normalized Questions Array for the Unified Review/Editor Stage
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      question: '',
      options: ['', '', '', ''],
      answer: 0,
      explanation: '',
      codeSnippet: ''
    }
  ]);

  // Editing Question Index in Review stage (for modal/inline editing)
  const [activeEditingIndex, setActiveEditingIndex] = useState(null);
  const [publishedQuizId, setPublishedQuizId] = useState(null);

  // Load existing quiz if editing
  useEffect(() => {
    if (isEditing) {
      const existingQuiz = getQuizById(id);
      if (existingQuiz) {
        setTitle(existingQuiz.title || '');
        setDescription(existingQuiz.description || '');
        setCategoryId(existingQuiz.categoryId || 'cs');
        setDifficulty(existingQuiz.difficulty || 'Medium');
        setDuration(existingQuiz.duration || 10);
        setTimePerQuestion(existingQuiz.timePerQuestion || 60);
        if (Array.isArray(existingQuiz.questions) && existingQuiz.questions.length > 0) {
          setQuestions(existingQuiz.questions);
        }
        setStage('review');
      }
    }
  }, [id, isEditing]);

  // Mode Selection handler
  const handleSelectMode = (mode) => {
    setCreationMode(mode);
    setErrorMessage(null);
    setValidationErrors([]);
    if (mode === 'manual') {
      setStage('review');
    } else {
      setStage('input');
    }
  };

  // PPTX File Upload Handler
  const handlePptxUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setProcessingMessage('Extracting slides and speaker notes from presentation...');
    setErrorMessage(null);

    try {
      const parsed = await parsePptxFile(file);
      setPptxFile(file);
      setParsedPptx(parsed);
      setTitle(parsed.title || 'PowerPoint Presentation Assessment');
      setIsProcessing(false);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to parse PowerPoint file');
      setIsProcessing(false);
    }
  };

  // PDF File Upload Handler
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setProcessingMessage('Extracting text and structure from PDF pages...');
    setErrorMessage(null);

    try {
      const parsed = await parsePdfFile(file);
      setPdfFile(file);
      setParsedPdf(parsed);
      setTitle(parsed.title || 'PDF Document Assessment');
      setIsProcessing(false);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to parse PDF file');
      setIsProcessing(false);
    }
  };

  // JSON File Upload Handler
  const handleJsonUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target?.result || '');
    };
    reader.readAsText(file);
  };

  // Trigger Generator / Importer -> Move to Review Stage
  const handleGenerateOrImport = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setValidationErrors([]);

    try {
      let normalized = null;

      if (creationMode === 'ai') {
        if (!aiTopic.trim()) throw new Error('Please enter a quiz topic or subject.');
        setProcessingMessage(`Generating verified ${difficulty} questions for "${aiTopic}"...`);
        normalized = await generateAiQuiz(aiTopic, difficulty, questionCount, language);
      } else if (creationMode === 'pptx') {
        if (!parsedPptx) throw new Error('Please upload a valid .pptx presentation first.');
        setProcessingMessage(`Formulating questions from ${parsedPptx.totalSlides} presentation slides...`);
        normalized = await generateQuizFromPptx(parsedPptx, { questionCount, difficulty, language });
      } else if (creationMode === 'pdf') {
        if (!parsedPdf) throw new Error('Please upload a valid .pdf document first.');
        setProcessingMessage(`Formulating questions from ${parsedPdf.totalPages} document pages...`);
        normalized = await generateQuizFromPdf(parsedPdf, { questionCount, difficulty, language });
      } else if (creationMode === 'text') {
        if (!rawText.trim()) throw new Error('Please paste your study notes or textbook content.');
        setProcessingMessage('Analyzing text and synthesizing assessment questions...');
        const parsed = parseRawText(rawText, title);
        normalized = await generateQuizFromText(parsed, { questionCount, difficulty, language });
      } else if (creationMode === 'json') {
        if (!jsonText.trim()) throw new Error('Please paste or upload a JSON object.');
        let parsedJson;
        try {
          parsedJson = JSON.parse(jsonText);
        } catch (e) {
          throw new Error('Invalid JSON syntax. Please check for missing commas or quotes.');
        }

        const val = validateQuizSchema(parsedJson);
        if (!val.isValid) {
          setValidationErrors(val.errors);
          throw new Error('JSON structure validation failed.');
        }

        normalized = normalizeQuiz(parsedJson, { sourceType: 'json' });
      }

      if (normalized) {
        setTitle(normalized.title);
        setDescription(normalized.description);
        setCategoryId(normalized.categoryId);
        setDifficulty(normalized.difficulty);
        setDuration(normalized.duration);
        setTimePerQuestion(normalized.timePerQuestion || 60);
        setQuestions(normalized.questions);
        setStage('review');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred during generation.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Question CRUD in Review stage
  const handleUpdateQuestion = (idx, updated) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, ...updated } : q));
  };

  const handleDeleteQuestion = (idx) => {
    if (questions.length <= 1) {
      alert('Quiz must have at least one question.');
      return;
    }
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDuplicateQuestion = (idx) => {
    const target = questions[idx];
    const duplicate = {
      ...target,
      id: Date.now() + Math.floor(Math.random() * 1000),
      question: `${target.question} (Copy)`
    };
    setQuestions(prev => [
      ...prev.slice(0, idx + 1),
      duplicate,
      ...prev.slice(idx + 1)
    ]);
  };

  const handleAddQuestion = () => {
    const newQ = {
      id: Date.now(),
      question: '',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 0,
      explanation: ''
    };
    setQuestions(prev => [...prev, newQ]);
    setActiveEditingIndex(questions.length);
  };

  const handleMoveQuestion = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const nextList = [...questions];
    const [moved] = nextList.splice(idx, 1);
    nextList.splice(targetIdx, 0, moved);
    setQuestions(nextList);
  };

  // Publish Quiz
  const handlePublishQuiz = () => {
    // Validate required fields
    if (!title.trim()) {
      alert('Please enter a quiz title.');
      return;
    }
    if (questions.length === 0) {
      alert('Please add at least one question.');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        alert(`Question #${i + 1} has an empty question prompt.`);
        return;
      }
      const hasEmptyOpt = q.options.some(opt => !String(opt).trim());
      if (hasEmptyOpt) {
        alert(`Question #${i + 1} contains empty options.`);
        return;
      }
    }

    const quizObj = normalizeQuiz({
      id: isEditing ? id : undefined,
      title: title.trim(),
      description: description.trim() || `Assessment on ${title}`,
      categoryId,
      difficulty,
      duration: Number(duration) || 10,
      timePerQuestion: Number(timePerQuestion) || 60,
      questions
    }, { sourceType: creationMode });

    const savedId = saveCustomQuiz(quizObj);
    if (savedId) {
      setPublishedQuizId(savedId);
      setStage('published');
    } else {
      alert('Failed to save quiz. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-8 border-b border-white/[0.08] mb-8">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" icon={ArrowLeft}>
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {isEditing ? 'Edit Assessment' : 'Quiz Studio'}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Build high-integrity assessments with AI generation, document extraction, and manual authoring.
              </p>
            </div>
          </div>

          {stage === 'review' && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStage('select-mode')}>
                Change Importer
              </Button>
              <Button variant="liquid" size="sm" icon={Check} onClick={handlePublishQuiz}>
                Publish Assessment
              </Button>
            </div>
          )}
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{errorMessage}</p>
              {validationErrors.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-red-300 list-disc list-inside">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 1: SELECT CREATION METHOD */}
        {/* ------------------------------------------------------------- */}
        {stage === 'select-mode' && (
          <div className="space-y-8">
            <div className="text-center max-w-lg mx-auto mb-10">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                Step 1: Choose Creation Method
              </span>
              <h2 className="text-2xl font-semibold text-white mt-3">
                How would you like to create your quiz?
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                All creation methods automatically normalize into QuizGuard's verified assessment engine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Option 1: Manual Builder */}
              <div 
                onClick={() => handleSelectMode('manual')}
                className="vesper-card p-6 cursor-pointer flex flex-col justify-between group hover:border-amber-500/40 hover:bg-amber-950/10 transition-all"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base text-white group-hover:text-amber-200 transition-colors">Manual Visual Studio</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    Build multiple-choice questions from scratch with rich options, code blocks, and custom explanations.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-medium text-amber-400 group-hover:text-amber-300">
                  <span>Author manually</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 2: AI Topic Generator */}
              <div 
                onClick={() => handleSelectMode('ai')}
                className="vesper-card p-6 cursor-pointer flex flex-col justify-between group hover:border-purple-500/40 hover:bg-purple-950/10 transition-all"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base text-white group-hover:text-purple-200 transition-colors">AI Topic Synthesis</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    Generate instant, curriculum-aligned questions on any subject with configurable difficulty and language.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-medium text-purple-400 group-hover:text-purple-300">
                  <span>Prompt AI</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 3: Import PPT/PPTX */}
              <div 
                onClick={() => handleSelectMode('pptx')}
                className="vesper-card p-6 cursor-pointer flex flex-col justify-between group hover:border-indigo-500/40 hover:bg-indigo-950/10 transition-all"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base text-white group-hover:text-indigo-200 transition-colors">PowerPoint (.pptx)</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    Extract slides and speaker notes directly from your slide decks with verifiable slide source citations.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-medium text-indigo-400 group-hover:text-indigo-300">
                  <span>Import slides</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 4: Import PDF */}
              <div 
                onClick={() => handleSelectMode('pdf')}
                className="vesper-card p-6 cursor-pointer flex flex-col justify-between group hover:border-sky-500/40 hover:bg-sky-950/10 transition-all"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4 text-sky-400 group-hover:scale-110 group-hover:bg-sky-500/20 transition-all">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base text-white group-hover:text-sky-200 transition-colors">PDF Document (.pdf)</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    Upload textbooks or research papers. Formulates questions with page-by-page factual citations.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-medium text-sky-400 group-hover:text-sky-300">
                  <span>Extract PDF</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 5: Paste Study Text */}
              <div 
                onClick={() => handleSelectMode('text')}
                className="vesper-card p-6 cursor-pointer flex flex-col justify-between group hover:border-emerald-500/40 hover:bg-emerald-950/10 transition-all"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base text-white group-hover:text-emerald-200 transition-colors">Paste Lecture Notes</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    Paste unstructured raw lecture notes, article transcripts, or textbook chapters to generate assessments.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-medium text-emerald-400 group-hover:text-emerald-300">
                  <span>Paste text</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 6: Import JSON */}
              <div 
                onClick={() => handleSelectMode('json')}
                className="vesper-card p-6 cursor-pointer flex flex-col justify-between group hover:border-rose-500/40 hover:bg-rose-950/10 transition-all"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base text-white group-hover:text-rose-200 transition-colors">Import JSON File</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    Paste or drag-and-drop structured JSON quiz definitions with instant schema validation.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-medium text-rose-400 group-hover:text-rose-300">
                  <span>Import JSON</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 2: INPUT CONFIGURATION FOR CHOSEN METHOD */}
        {/* ------------------------------------------------------------- */}
        {stage === 'input' && (
          <div className="vesper-panel p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStage('select-mode')} icon={ArrowLeft}>
                  Back
                </Button>
                <h2 className="text-lg font-semibold capitalize text-white">
                  {creationMode === 'ai' && 'AI Topic Generation'}
                  {creationMode === 'pptx' && 'PowerPoint (.pptx) Importer'}
                  {creationMode === 'pdf' && 'PDF Document Importer'}
                  {creationMode === 'text' && 'Study Notes Text Importer'}
                  {creationMode === 'json' && 'JSON Schema Importer'}
                </h2>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                Normalized Importer
              </span>
            </div>

            {/* AI Mode Form */}
            {creationMode === 'ai' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Quiz Topic or Exam Subject <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g. AWS Cloud Architecture, React Performance Optimization, Organic Chemistry..."
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
            )}

            {/* PPTX Mode Form */}
            {creationMode === 'pptx' && (
              <div className="space-y-4">
                <div
                  onClick={() => pptxInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.name.endsWith('.pptx')) {
                      handlePptxUpload({ target: { files: [file] } });
                    }
                  }}
                  className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-400/70 rounded-2xl p-8 text-center bg-zinc-950/80 hover:bg-indigo-950/10 transition-all cursor-pointer group"
                >
                  <input
                    ref={pptxInputRef}
                    type="file"
                    accept=".pptx"
                    onChange={handlePptxUpload}
                    className="hidden"
                    id="pptx-input"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">
                    Upload PowerPoint (.pptx) Presentation
                  </p>
                  <p className="text-xs text-zinc-400 mb-4 max-w-sm mx-auto">
                    Client-side extraction reads slide texts and speaker notes without external server storage.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      pptxInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 cursor-pointer"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>{pptxFile ? `Selected: ${pptxFile.name}` : 'Browse .pptx File'}</span>
                  </button>
                </div>

                {parsedPptx && (
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Extracted: {parsedPptx.totalSlides} Slides
                      </span>
                      <span className="text-zinc-400 font-mono">{pptxFile?.name}</span>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-2 text-xs text-zinc-400">
                      {parsedPptx.slides.map((s) => (
                        <div key={s.slideNumber} className="truncate">
                          <span className="text-indigo-300 font-mono">Slide {s.slideNumber}:</span> {s.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PDF Mode Form */}
            {creationMode === 'pdf' && (
              <div className="space-y-4">
                <div
                  onClick={() => pdfInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.name.endsWith('.pdf')) {
                      handlePdfUpload({ target: { files: [file] } });
                    }
                  }}
                  className="border-2 border-dashed border-sky-500/30 hover:border-sky-400/70 rounded-2xl p-8 text-center bg-zinc-950/80 hover:bg-sky-950/10 transition-all cursor-pointer group"
                >
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    id="pdf-input"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-3 text-sky-400 group-hover:scale-110 group-hover:bg-sky-500/20 transition-all">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">
                    Upload PDF Document (.pdf)
                  </p>
                  <p className="text-xs text-zinc-400 mb-4 max-w-sm mx-auto">
                    Extracts pages and paragraphs to generate grounded questions with page citations.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      pdfInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-sky-500/25 transition-all hover:scale-105 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{pdfFile ? `Selected: ${pdfFile.name}` : 'Browse .pdf File'}</span>
                  </button>
                </div>

                {parsedPdf && (
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-sky-500/30 text-xs flex items-center justify-between">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Extracted: {parsedPdf.totalPages} Pages
                    </span>
                    <span className="text-zinc-400 font-mono">{pdfFile?.name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Text Paste Mode Form */}
            {creationMode === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Quiz Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Distributed Systems Chapter 4 Assessment"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Study Notes / Lecture Transcript <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste lecture notes, study material, or textbook content here..."
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            )}

            {/* JSON Mode Form */}
            {creationMode === 'json' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300">
                    Paste JSON or Upload File
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={jsonInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleJsonUpload}
                      className="hidden"
                      id="json-file-input"
                    />
                    <button
                      type="button"
                      onClick={() => jsonInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload .json</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setJsonText(JSON.stringify({
                        title: "Cloud Architecture Fundamentals",
                        category: "Cloud Computing",
                        difficulty: "Medium",
                        duration: 15,
                        questions: [
                          {
                            question: "What is Infrastructure as a Service (IaaS)?",
                            options: [
                              "Virtualized computing resources over the internet",
                              "Managed software applications without server setup",
                              "Platform for deploying app source code",
                              "Database-only hosting model"
                            ],
                            answer: 0,
                            explanation: "IaaS provides on-demand virtualized computing resources such as VMs, storage, and networking."
                          }
                        ]
                      }, null, 2))}
                      className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Load Sample
                    </button>
                  </div>
                </div>
                <textarea
                  rows={10}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder='{"title": "...", "questions": [{"question": "...", "options": [...], "answer": 0}]}'
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50"
                />
              </div>
            )}

            {/* Common Generation Settings (For AI, PPTX, PDF, Text) */}
            {creationMode !== 'json' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Question Count</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button variant="ghost" size="md" onClick={() => setStage('select-mode')}>
                Cancel
              </Button>
              <Button 
                variant="gradient" 
                size="md" 
                disabled={isProcessing}
                onClick={handleGenerateOrImport}
                icon={isProcessing ? RefreshCw : Sparkles}
              >
                {isProcessing ? (processingMessage || 'Synthesizing...') : 'Synthesize Assessment & Review'}
              </Button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 3: UNIFIED QUIZ REVIEW & VISUAL EDITOR */}
        {/* ------------------------------------------------------------- */}
        {stage === 'review' && (
          <div className="space-y-8">
            
            {/* Meta Card */}
            <div className="vesper-panel p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="font-semibold text-sm text-white">Assessment Metadata</h3>
                <span className="text-xs text-zinc-400 font-mono">{questions.length} Questions</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Quiz Title"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of this assessment"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Exam Duration (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base text-white">Questions Review & Editor</h3>
                  <p className="text-xs text-zinc-400">Review, edit, delete, or reorder questions before publishing.</p>
                </div>
                <Button variant="secondary" size="sm" icon={PlusCircle} onClick={handleAddQuestion}>
                  Add Question
                </Button>
              </div>

              {questions.map((q, idx) => (
                <div key={q.id || idx} className="vesper-card p-6 space-y-4">
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono font-bold text-white">
                        {idx + 1}
                      </span>
                      {q.sourceSlide && (
                        <Badge variant="metal" size="sm">Source: {q.sourceSlide}</Badge>
                      )}
                      {q.sourcePage && (
                        <Badge variant="metal" size="sm">Source: {q.sourcePage}</Badge>
                      )}
                      {q.sourceNote && (
                        <Badge variant="metal" size="sm">Source: {q.sourceNote}</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveQuestion(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20"
                        title="Move Up"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveQuestion(idx, 1)}
                        disabled={idx === questions.length - 1}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20"
                        title="Move Down"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateQuestion(idx)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                        title="Duplicate Question"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(idx)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Prompt Field */}
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Question Prompt</label>
                    <textarea
                      rows={2}
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(idx, { question: e.target.value })}
                      placeholder="Type question prompt..."
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>

                  {/* Options Matrix */}
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-2">
                      Answer Choices (Click radio to mark correct answer)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.answer === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleUpdateQuestion(idx, { answer: optIdx })}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isCorrect 
                                ? 'bg-white/10 border-white text-white shadow-sm' 
                                : 'bg-zinc-950/60 border-white/[0.08] text-zinc-300 hover:border-white/20'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
                              isCorrect ? 'bg-white text-black' : 'bg-white/5 text-zinc-400'
                            }`}>
                              {getOptionLetter(optIdx)}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[optIdx] = e.target.value;
                                handleUpdateQuestion(idx, { options: newOpts });
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-transparent text-xs text-white w-full focus:outline-none"
                              placeholder={`Option ${getOptionLetter(optIdx)}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation Field */}
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Explanation</label>
                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => handleUpdateQuestion(idx, { explanation: e.target.value })}
                      placeholder="Rationale for the correct answer..."
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-6 border-t border-white/[0.08]">
                <Button variant="secondary" size="md" icon={PlusCircle} onClick={handleAddQuestion}>
                  Add Question
                </Button>
                <Button variant="emerald" size="lg" icon={Check} onClick={handlePublishQuiz}>
                  Publish Assessment
                </Button>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 4: PUBLISHED SUCCESS */}
        {/* ------------------------------------------------------------- */}
        {stage === 'published' && (
          <div className="vesper-panel p-8 text-center max-w-lg mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">Assessment Published!</h2>
              <p className="text-xs text-zinc-400 mt-1">
                "{title}" is now live and ready for practice mode or live multiplayer hosting.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Link to={`/contest?quizId=${publishedQuizId}`}>
                <Button variant="gradient" size="md" className="w-full" icon={Users}>
                  Host Live Arena Session
                </Button>
              </Link>

              <Link to={`/quiz/${publishedQuizId}/instructions`}>
                <Button variant="emerald" size="md" className="w-full" icon={Play}>
                  Start Practice Test
                </Button>
              </Link>

              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="w-full">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

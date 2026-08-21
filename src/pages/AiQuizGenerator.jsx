import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, Zap, ArrowRight, CheckCircle2, Play, Edit3, Key, Settings2, Sliders, AlertCircle, HelpCircle, Layers, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { generateAiQuiz } from '../utils/aiQuizGenerator';
import { CATEGORIES } from '../data/quizzes';

const PRESET_TOPICS = [
  { label: "Docker & Containers", topic: "Docker & Containerization", icon: "🐳" },
  { label: "TypeScript Mastery", topic: "TypeScript & Static Types", icon: "🟦" },
  { label: "Python Data Science", topic: "Python Data Science", icon: "🐍" },
  { label: "AI & Neural Networks", topic: "AI & Machine Learning", icon: "🤖" },
  { label: "DevOps & CI/CD", topic: "DevOps & Kubernetes", icon: "⚙️" },
  { label: "React 19 & Architecture", topic: "React 19 & State Management", icon: "⚛️" },
  { label: "Cybersecurity & Cryptography", topic: "Cybersecurity & Cryptography", icon: "🔐" },
  { label: "SQL & Relational DBs", topic: "SQL & Database Indexing", icon: "🗄️" },
];

export const AiQuizGenerator = () => {
  const navigate = useNavigate();

  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  
  // Optional API Key settings
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState('groq'); // 'groq' | 'mock' | 'openai'

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressState, setProgressState] = useState({ step: 0, total: 5, message: '' });
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [error, setError] = useState(null);

  const handleSelectPreset = (presetTopic) => {
    setTopic(presetTopic);
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a topic or choose a preset topic.");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratedQuiz(null);

    try {
      const quiz = await generateAiQuiz({
        topic: topic.trim(),
        difficulty,
        questionCount: Number(questionCount),
        apiKey,
        apiProvider,
        onProgress: (p) => setProgressState(p)
      });

      setGeneratedQuiz(quiz);
    } catch (err) {
      console.error(err);
      setError("Failed to generate AI quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-slate-900 to-indigo-950 border border-brand-500/20 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
            QuizGuard AI Engine
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
            Instant <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400">AI Quiz Generator</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Type any topic or skill you want to test. Our AI engine builds a fully structured, proctored quiz package complete with scenario questions, options, answer keys, and explanations in seconds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Generator Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
            
            {/* Topic Input */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-200">
                Quiz Topic / Subject <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Docker Containers, React Hooks, World History, Cybersecurity..."
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium text-base"
                />
                {topic && (
                  <button
                    onClick={() => setTopic('')}
                    className="absolute right-3 top-3.5 text-xs text-slate-500 hover:text-slate-300 bg-slate-800 px-2 py-1 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Quick Topic Chips */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Popular Quick Topics:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_TOPICS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPreset(preset.topic)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      topic === preset.topic
                        ? 'bg-brand-600/30 text-brand-300 border-brand-500 shadow-glow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Config Sliders & Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
              {/* Question Count */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Number of Questions
                </label>
                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                  {[3, 5, 10, 15].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        questionCount === num
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-brand-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            {/* Optional AI Key Settings Toggle */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowApiSettings(!showApiSettings)}
                className="flex items-center justify-between w-full text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-brand-400" />
                  Optional External AI Key Settings (OpenAI / Gemini)
                </span>
                <span>{showApiSettings ? '▲ Hide' : '▼ Configure'}</span>
              </button>

              {showApiSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <p className="text-xs text-slate-400">
                    QuizGuard generates quizzes automatically offline using built-in domain engines. You can optionally supply your own API key to query live LLM APIs.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Provider</label>
                      <select
                        value={apiProvider}
                        onChange={(e) => setApiProvider(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                      >
                        <option value="groq">⚡ Groq Cloud (LLaMA-3.3-70B - Fastest)</option>
                        <option value="mock">Built-in Engine (Offline Zero-Config)</option>
                        <option value="openai">OpenAI (GPT-3.5/GPT-4)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">API Key</label>
                      <input
                        type="password"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold text-base shadow-glow-md transition-all active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Cpu className="w-5 h-5 animate-spin text-brand-300" />
                  <span>Generating AI Quiz...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>Generate AI Quiz Now</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Output & Visualizer Column */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 flex flex-col justify-center items-center text-center space-y-6 backdrop-blur-xl shadow-xl min-h-[400px]"
              >
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-brand-500/10 border border-brand-500/30">
                  <div className="absolute inset-0 rounded-full border-2 border-brand-500/30 border-t-brand-400 animate-spin" />
                  <Cpu className="w-10 h-10 text-brand-400 animate-pulse" />
                </div>

                <div className="space-y-2 max-w-sm">
                  <h3 className="text-xl font-bold text-white">Synthesizing AI Test Package</h3>
                  <p className="text-xs text-brand-300 font-mono animate-pulse">
                    {progressState.message || 'Building questions and answer keys...'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-xs space-y-1">
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <motion.div
                      className="h-full bg-gradient-to-r from-brand-500 to-indigo-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${(progressState.step / progressState.total) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Step {progressState.step} of {progressState.total}
                  </span>
                </div>
              </motion.div>
            ) : generatedQuiz ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 border border-brand-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="brand">AI GENERATED</Badge>
                      <Badge variant="secondary">{generatedQuiz.difficulty}</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-white">{generatedQuiz.title}</h3>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {generatedQuiz.description}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <div>
                    <span className="block text-[10px] text-slate-400">Questions</span>
                    <span className="text-sm font-bold text-white">{generatedQuiz.questions.length} Qs</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Time Limit</span>
                    <span className="text-sm font-bold text-white">{generatedQuiz.duration} mins</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Proctoring</span>
                    <span className="text-sm font-bold text-emerald-400">Active</span>
                  </div>
                </div>

                {/* Sample Questions Accordion Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Question Preview:</span>
                  <div className="max-h-52 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                    {generatedQuiz.questions.map((q, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                        <span className="font-semibold text-brand-300">Q{idx + 1}: {q.question}</span>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
                          {q.options.slice(0, 4).map((opt, oIdx) => (
                            <div key={oIdx} className={`px-2 py-1 rounded ${oIdx === q.answer ? 'bg-emerald-500/10 text-emerald-300 font-medium border border-emerald-500/30' : 'bg-slate-900 text-slate-400'}`}>
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="space-y-2.5 pt-2">
                  <Link
                    to={`/quiz/${generatedQuiz.id}/instructions`}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-glow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start Proctored Test Now</span>
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/quiz/${generatedQuiz.id}/edit`}
                      className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit in Quiz Editor</span>
                    </Link>

                    <Link
                      to="/categories"
                      className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>View All Quizzes</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 flex flex-col justify-center items-center text-center space-y-4 backdrop-blur-xl min-h-[400px]">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-brand-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Ready to Generate</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Enter a topic on the left or select a quick topic chip to synthesize your personalized proctored test.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, Play, Edit3, AlertCircle, RefreshCw, Layers, Users, BookOpen } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { generateAiQuiz } from '../utils/aiQuizGenerator';
import { saveCustomQuiz } from '../data/quizzes';

const PRESET_TOPICS = [
  { label: "Docker & Containers", topic: "Docker & Container Architecture" },
  { label: "TypeScript Mastery", topic: "TypeScript Generics & Static Typing" },
  { label: "Python Data Science", topic: "Python NumPy, Pandas & Data Analysis" },
  { label: "AI & Neural Networks", topic: "Neural Networks & Deep Learning Principles" },
  { label: "AWS Cloud & DevOps", topic: "AWS Solutions Architecture & CI/CD Pipelines" },
  { label: "React 19 Architecture", topic: "React 19 Server Components & Hooks" },
  { label: "Cybersecurity & OAuth", topic: "Cybersecurity, Cryptography & OAuth 2.0" },
  { label: "SQL Query Optimization", topic: "PostgreSQL Query Indexing & Optimization" },
];

export const AiQuizGenerator = () => {
  const navigate = useNavigate();

  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [language, setLanguage] = useState('English');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [error, setError] = useState(null);

  const handleSelectPreset = (presetTopic) => {
    setTopic(presetTopic);
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a topic or select a curated preset.");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratedQuiz(null);

    try {
      const quiz = await generateAiQuiz(topic.trim(), difficulty, Number(questionCount), language);
      saveCustomQuiz(quiz);
      setGeneratedQuiz(quiz);
    } catch (err) {
      console.error(err);
      setError("Failed to generate AI quiz. Please verify topic and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="vesper-panel p-8 sm:p-10 relative overflow-hidden border-white/20">
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              AI Synthesis Pipeline
            </span>

            <h1 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight">
              AI Assessment Synthesis
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
              Type any topic or learning objective. Our AI engine builds a fully structured, proctored assessment complete with multiple choice options, correct answer keys, and pedagogical explanations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Generator Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="vesper-panel p-6 sm:p-8 space-y-6">
              
              {error && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    What topic or skill do you want to assess? <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. AWS VPC Peering, Kubernetes Pod Lifecycles, React 19 Hooks..."
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/40 font-medium"
                  />
                </div>

                {/* Preset Pills */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
                    Or select a curated topic
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TOPICS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset.topic)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          topic === preset.topic
                            ? 'bg-white text-black font-semibold'
                            : 'bg-zinc-950 text-zinc-400 hover:text-white border border-white/[0.08]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Configuration Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Questions</label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                      <option value={20}>20 Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Difficulty</label>
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
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="liquid"
                    size="lg"
                    className="w-full"
                    disabled={isGenerating}
                    icon={isGenerating ? RefreshCw : Sparkles}
                  >
                    {isGenerating ? 'Synthesizing Verified Assessment...' : 'Generate Assessment with AI'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Result / Preview Column */}
          <div className="lg:col-span-5 space-y-6">
            {generatedQuiz ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="vesper-panel p-6 space-y-6 border-white/30"
              >
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Assessment Generated & Saved</span>
                </div>

                <div>
                  <Badge variant="metal" size="sm">{generatedQuiz.category}</Badge>
                  <h3 className="text-lg font-semibold text-white mt-2">{generatedQuiz.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{generatedQuiz.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-400 p-3 rounded-xl bg-zinc-950 border border-white/[0.06]">
                  <div>Questions: <span className="text-white">{generatedQuiz.questions?.length}</span></div>
                  <div>Duration: <span className="text-white">{generatedQuiz.duration}m</span></div>
                  <div>Difficulty: <span className="text-white">{generatedQuiz.difficulty}</span></div>
                  <div>Proctored: <span className="text-emerald-400">Yes</span></div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link to={`/contest?quizId=${generatedQuiz.id}`}>
                    <Button variant="liquid" size="md" className="w-full" icon={Users}>
                      Host Live Arena Session
                    </Button>
                  </Link>

                  <Link to={`/quiz/${generatedQuiz.id}/instructions`}>
                    <Button variant="secondary" size="md" className="w-full" icon={Play}>
                      Take Practice Exam
                    </Button>
                  </Link>

                  <Link to={`/edit/${generatedQuiz.id}`}>
                    <Button variant="ghost" size="sm" className="w-full" icon={Edit3}>
                      Edit in Quiz Studio
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="vesper-panel p-8 text-center space-y-4 flex flex-col justify-center h-full min-h-[320px]">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Live AI Preview</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                    Your generated assessment structure, questions, and instant action buttons will appear here upon synthesis.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

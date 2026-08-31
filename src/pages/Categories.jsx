import React, { useState } from 'react';
import { CATEGORIES, getQuizzesList } from '../data/quizzes';
import { QuizCard } from '../components/quiz/QuizCard';
import { Search, Filter, BookOpen, Sparkles, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';

export const Categories = () => {
  const [quizzes, setQuizzes] = useState(() => getQuizzesList());
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuizDeleted = (deletedId) => {
    setQuizzes(prev => prev.filter(q => q.id !== deletedId));
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesCat = selectedCat === 'all' || quiz.categoryId === selectedCat;
    const matchesDiff = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (quiz.category && quiz.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesDiff && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              Assessment Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-2">
              Explore Quizzes & Exams
            </h1>
            <p className="text-xs text-zinc-400 max-w-xl">
              Choose from technical engineering assessments, cloud architecture, or logical reasoning tests equipped with real-time focus proctoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/create">
              <Button variant="liquid" size="sm" icon={PlusCircle}>
                Create Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="vesper-panel p-6 space-y-6">
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by topic, keyword, or technology (e.g. React, ES6, AWS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-white/40 transition-all font-medium"
            />
          </div>

          {/* Category Pill Filters */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 justify-center">
              <button
                onClick={() => setSelectedCat('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCat === 'all'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                All Categories ({quizzes.length})
              </button>
              {CATEGORIES.map(cat => {
                const count = quizzes.filter(q => q.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCat === cat.id
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs text-zinc-400">Difficulty Filter:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {['all', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-white/15 text-white border border-white/30'
                      : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300 border border-white/[0.06]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        {filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <QuizCard quiz={quiz} onDelete={handleQuizDeleted} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="vesper-panel p-12 text-center space-y-4">
            <Sparkles className="w-8 h-8 text-zinc-600 mx-auto" />
            <h3 className="font-semibold text-lg text-white">No Quizzes Found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search query or category filters, or create a new assessment in the Quiz Studio.
            </p>
            <div className="pt-2">
              <Link to="/create">
                <Button variant="liquid" size="sm" icon={PlusCircle}>
                  Create New Quiz
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

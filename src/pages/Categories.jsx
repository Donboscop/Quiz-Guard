import React, { useState } from 'react';
import { CATEGORIES, getQuizzesList } from '../data/quizzes';
import { QuizCard } from '../components/quiz/QuizCard';
import { Search, Filter, BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Categories = () => {
  const quizzes = getQuizzesList();
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesCat = selectedCat === 'all' || quiz.categoryId === selectedCat;
    const matchesDiff = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          quiz.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesDiff && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Banner */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-semibold">
          <BookOpen className="w-4 h-4" />
          <span>Interactive Quiz Catalogue</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
          Explore Quiz Categories
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Choose from technical engineering assessments, general awareness, or logical reasoning tests equipped with real-time focus proctoring.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
        
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by topic, keyword, or technology (e.g. React, ES6, AWS)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block text-center sm:text-left">
            Categories
          </label>
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCat === 'all'
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCat === cat.id
                      ? 'bg-brand-600 text-white shadow-glow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-semibold text-slate-300">Difficulty Filter:</span>
          </div>
          <div className="flex items-center gap-2">
            {['all', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <QuizCard quiz={quiz} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <Sparkles className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-display font-bold text-xl text-white">No Quizzes Found</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or category filters to find available assessments.
          </p>
        </div>
      )}
    </div>
  );
};

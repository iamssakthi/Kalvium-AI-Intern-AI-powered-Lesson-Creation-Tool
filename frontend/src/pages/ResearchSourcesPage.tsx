import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from '../motion';
import { Globe, Book, Video, Search, Layers, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { ResearchSource, LessonListItem } from '../types';
import { SourceCard } from '../components/SourceCard';
import { AnimatedPage } from '../components/AnimatedPage';
import { containerVariants, itemVariants } from '../animations/variants';

export const ResearchSourcesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonIdFromUrl = searchParams.get('lessonId');

  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessonIdFromUrl || '');
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'website' | 'book' | 'youtube'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch available lessons for dropdown
  useEffect(() => {
    api.getLessons().then((data) => {
      setLessons(data);
      if (!selectedLessonId && data.length > 0) {
        setSelectedLessonId(data[0].id);
        setSearchParams({ lessonId: data[0].id });
      }
    });
  }, []);

  // Fetch sources when selectedLessonId changes
  useEffect(() => {
    if (!selectedLessonId) return;
    setLoading(true);
    api.getLessonSources(selectedLessonId)
      .then(setSources)
      .catch((err) => console.error('Failed to load sources:', err))
      .finally(() => setLoading(false));
  }, [selectedLessonId]);

  const handleLessonChange = (newId: string) => {
    setSelectedLessonId(newId);
    setSearchParams({ lessonId: newId });
  };

  const filteredSources = sources.filter((s) => {
    const matchesType = filterType === 'all' || s.source_type === filterType;
    const matchesSearch = searchQuery === '' ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.snippet && s.snippet.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const websiteCount = sources.filter((s) => s.source_type === 'website').length;
  const bookCount = sources.filter((s) => s.source_type === 'book').length;
  const youtubeCount = sources.filter((s) => s.source_type === 'youtube').length;

  return (
    <AnimatedPage className="space-y-6">
      {/* Top Controls Bar */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold uppercase tracking-wider">Multi-Source Intelligence</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Research Evidence Library</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Verified materials retrieved from Tavily Web Search, Google Books API, and YouTube Data API v3
          </p>
        </div>

        {/* Lesson Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-700 shrink-0 uppercase tracking-wider">Active Lesson:</label>
          <select
            value={selectedLessonId}
            onChange={(e) => handleLessonChange(e.target.value)}
            className="input-field text-xs font-bold px-3 py-2 rounded-xl max-w-xs truncate cursor-pointer"
          >
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Filter Tabs and Search Bar */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              filterType === 'all'
                ? 'btn-primary-gradient text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Sources ({sources.length})</span>
          </button>

          <button
            onClick={() => setFilterType('website')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              filterType === 'website'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Websites ({websiteCount})</span>
          </button>

          <button
            onClick={() => setFilterType('book')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              filterType === 'book'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Book className="w-3.5 h-3.5" />
            <span>Books ({bookCount})</span>
          </button>

          <button
            onClick={() => setFilterType('youtube')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              filterType === 'youtube'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>YouTube ({youtubeCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search retrieved sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full text-xs pl-9 pr-3 py-2 rounded-xl"
          />
        </div>
      </motion.div>

      {/* Grid of Sources */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium tracking-wide">Retrieving evidence library...</p>
        </div>
      ) : filteredSources.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-3xl"
        >
          <Globe className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No sources found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Select a lesson with completed research or generate a new lesson to view authoritative web, book, and video evidence.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="btn-primary-gradient text-xs font-bold px-4 py-2 rounded-xl cursor-pointer text-white shadow-xs"
          >
            Create New Lesson
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredSources.map((source) => (
            <motion.div key={source.id} variants={itemVariants}>
              <SourceCard source={source} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatedPage>
  );
};

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from '../motion';
import {
  Search,
  Filter,
  BookOpen,
  Edit3,
  Download,
  Trash2,
  PlusCircle,
  LayoutGrid,
  List,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { LessonListItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { DurationIndicator } from '../components/DurationIndicator';
import { AnimatedPage } from '../components/AnimatedPage';
import { containerVariants, itemVariants } from '../animations/variants';

export const LessonLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const data = await api.getLessons(search, statusFilter);
      setLessons(data);
    } catch (err) {
      console.error('Failed to load lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [search, statusFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete '${title}'?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteLesson(id);
      await fetchLessons();
    } catch (err) {
      console.error('Failed to delete lesson:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AnimatedPage className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold uppercase tracking-wider">Curriculum Repository</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Lesson Library</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Manage persisted lessons, view audit badges, reopen drafts, and export documents
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/create')}
          className="btn-primary-gradient flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs text-white"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Lesson</span>
        </motion.button>
      </motion.div>

      {/* Search, Filters, and View Switcher */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search lessons by title or objective..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full text-xs pl-9 pr-3 py-2 rounded-xl"
          />
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* Grid / List Mode */}
          <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Grid or List of Lesson Cards */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading saved lessons...</p>
        </div>
      ) : lessons.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-3xl"
        >
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No lessons found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search criteria or create your first curriculum module.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="btn-primary-gradient text-xs font-bold px-4 py-2 rounded-xl cursor-pointer text-white shadow-xs"
          >
            Create New Lesson
          </button>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {lessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              variants={itemVariants}
              whileHover={{ y: -3, scale: 1.01 }}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-indigo-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <StatusBadge status={lesson.status} type="lesson" />
                  <DurationIndicator minutes={lesson.estimated_duration_minutes} compact />
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1.5">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {lesson.learning_objective}
                </p>

                {/* QC Audit Status Badges */}
                <div className="flex items-center flex-wrap gap-2 pt-2.5 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500 font-bold">QC:</span>
                  {lesson.factual_qc_status && (
                    <StatusBadge status={lesson.factual_qc_status} type="qc" />
                  )}
                  {lesson.instructional_qc_status && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                      Pedagogy: {lesson.instructional_qc_status}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => navigate(`/editor?lessonId=${lesson.id}`)}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => navigate(`/sources?lessonId=${lesson.id}`)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    Sources ({lesson.source_count})
                  </button>
                  <button
                    onClick={() => navigate(`/qc?lessonId=${lesson.id}`)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    QC
                  </button>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => navigate(`/export?lessonId=${lesson.id}`)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Export Center"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id, lesson.title)}
                    disabled={deletingId === lesson.id}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Lesson"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* List View */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-xs"
        >
          {lessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              variants={itemVariants}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{lesson.title}</h4>
                  <StatusBadge status={lesson.status} type="lesson" />
                </div>
                <p className="text-xs text-slate-600 truncate mt-0.5">{lesson.learning_objective}</p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <DurationIndicator minutes={lesson.estimated_duration_minutes} compact />
                <button
                  onClick={() => navigate(`/editor?lessonId=${lesson.id}`)}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                >
                  Edit Lesson
                </button>
                <button
                  onClick={() => navigate(`/export?lessonId=${lesson.id}`)}
                  className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatedPage>
  );
};

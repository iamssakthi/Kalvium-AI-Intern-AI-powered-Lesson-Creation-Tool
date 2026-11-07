import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from '../motion';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { DurationIndicator } from '../components/DurationIndicator';
import { AnimatedPage } from '../components/AnimatedPage';
import { containerVariants, itemVariants } from '../animations/variants';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch((err) => console.error('Failed to load stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium tracking-wide">Loading platform metrics...</p>
        </div>
      </div>
    );
  }

  const hasLessons = (stats?.total_lessons || 0) > 0;

  return (
    <AnimatedPage className="space-y-6">
      {/* Hero Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-white p-6 md:p-8 border border-indigo-100 shadow-xs"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>Platform Overview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              AI Lesson Creation <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">& Research Engine</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
              Autonomous curriculum synthesis backed by Tavily web research, YouTube tutorials, Google Books, and dual independent Quality Control audits under a strict 45-minute limit.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/create')}
            className="btn-primary-gradient flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-bold shrink-0 self-start md:self-auto cursor-pointer shadow-sm text-white"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Lesson</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* Total Lessons */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Lessons</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.total_lessons || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Curriculum modules generated</p>
        </motion.div>

        {/* Completed */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{stats?.completed_lessons || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Instructor reviewed & approved</p>
        </motion.div>

        {/* Avg Factual Accuracy */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Factual Accuracy</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600">
            {stats?.average_factual_score ? `${stats.average_factual_score}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Layer 1 verification score</p>
        </motion.div>

        {/* Avg Instructional Quality */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pedagogical Score</span>
            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600 border border-pink-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-pink-600">
            {stats?.average_pedagogical_score ? `${stats.average_pedagogical_score}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Layer 2 instructional score</p>
        </motion.div>
      </motion.div>

      {/* Main Content Grid: Recent Lessons & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Lessons */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recently Generated Lessons</h3>
              <p className="text-xs text-slate-500 mt-0.5">Track live status, durations, and quick actions</p>
            </div>
            <button
              onClick={() => navigate('/library')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!hasLessons ? (
            <div className="text-center py-12 border border-dashed border-slate-300 rounded-xl bg-slate-50">
              <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No lessons created yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Enter a lesson title and learning objective to trigger automated research and dual QC audits.
              </p>
              <button
                onClick={() => navigate('/create')}
                className="btn-primary-gradient text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow-xs"
              >
                Create First Lesson
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.recent_lessons.map((lesson) => (
                <motion.div
                  key={lesson.id}
                  whileHover={{ scale: 1.008, x: 2 }}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-indigo-50/40 transition-all shadow-xs"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {lesson.title}
                      </h4>
                      <StatusBadge status={lesson.status} type="lesson" />
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-1">
                      {lesson.learning_objective}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <DurationIndicator minutes={lesson.estimated_duration_minutes} compact />
                    <button
                      onClick={() => navigate(`/editor?lessonId=${lesson.id}`)}
                      className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Open
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Col: Activity Log */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Curriculum Activity Log</h3>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-1">
            {!stats?.recent_activities || stats.recent_activities.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">
                No recent version edits or applied recommendations recorded.
              </p>
            ) : (
              stats.recent_activities.map((act) => (
                <div key={act.id} className="text-xs border-l-2 border-indigo-500 bg-slate-50 p-2.5 rounded-r-xl border-y border-r border-slate-200/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-bold text-indigo-900 truncate max-w-[140px]">
                      {act.lesson_title}
                    </span>
                    <span className="bg-indigo-100 px-1.5 py-0.2 rounded text-[10px] text-indigo-700 font-bold">v{act.version_number}</span>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {act.change_description}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

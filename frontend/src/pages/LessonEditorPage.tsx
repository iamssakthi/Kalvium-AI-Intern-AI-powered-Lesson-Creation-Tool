import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from '../motion';
import {
  Save,
  Clock,
  Sparkles,
  Eye,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  ShieldCheck,
  ChevronRight,
  History,
  BookOpen,
  Layers,
  Lightbulb,
  FileText,
  Code,
  Globe,
  Zap,
  HelpCircle,
  Flag,
  Link as LinkIcon,
  Columns,
  Check,
  Filter,
  CheckCheck,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { LessonDetail, LessonSection, QCRecommendation } from '../types';
import { DurationIndicator } from '../components/DurationIndicator';
import { StatusBadge } from '../components/StatusBadge';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { RichDocumentEditor } from '../components/RichDocumentEditor';
import { AnimatedPage } from '../components/AnimatedPage';
import { itemVariants } from '../animations/variants';

export const LessonEditorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonId = searchParams.get('lessonId');

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [sections, setSections] = useState<LessonSection[]>([]);
  const [recommendations, setRecommendations] = useState<QCRecommendation[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  
  // View Modes: 'visual', 'edit', 'split', 'preview'
  const [viewMode, setViewMode] = useState<'visual' | 'edit' | 'split' | 'preview'>('visual');
  const [qcFilter, setQcFilter] = useState<'ALL' | 'FACTUAL' | 'INSTRUCTIONAL'>('ALL');

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [applyingRecId, setApplyingRecId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch lesson data
  const loadLesson = async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      const [lData, rData] = await Promise.all([
        api.getLesson(lessonId),
        api.getRecommendations(lessonId),
      ]);
      setLesson(lData);
      setSections(lData.sections || []);
      setRecommendations(rData);
      if (lData.sections && lData.sections.length > 0 && !activeSectionId) {
        setActiveSectionId(lData.sections[0].id);
      }
      setHasUnsavedChanges(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load lesson details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  // Compute live duration
  const currentTotalDuration = sections.reduce((acc, s) => acc + (Number(s.estimated_minutes) || 0), 0);

  const handleSectionContentChange = (id: string, newContent: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content: newContent } : s))
    );
    setHasUnsavedChanges(true);
  };

  const handleSectionTitleChange = (id: string, newTitle: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
    setHasUnsavedChanges(true);
  };

  const handleSectionMinutesChange = (id: string, newMinutes: number) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estimated_minutes: Math.max(0, newMinutes) } : s))
    );
    setHasUnsavedChanges(true);
  };

  // Save changes to backend
  const handleSave = async () => {
    if (!lesson) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await api.updateLesson(lesson.id, {
        title: lesson.title,
        learning_objective: lesson.learning_objective,
        estimated_duration_minutes: currentTotalDuration,
        sections: sections.map((s, index) => ({
          id: s.id,
          lesson_id: s.lesson_id,
          title: s.title,
          content: s.content,
          estimated_minutes: Math.max(0, Number(s.estimated_minutes) || 0),
          section_type: s.section_type,
          order_index: index,
        })),
        change_description: 'Instructor updated lesson content and section timings',
      });
      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.message || 'Failed to save revisions.');
    } finally {
      setIsSaving(false);
    }
  };

  // Apply a specific recommendation directly into section text
  const handleApplyRec = async (rec: QCRecommendation) => {
    setApplyingRecId(rec.id);
    try {
      await api.applyRecommendation(rec.id);

      // Intelligently find matching section and insert fix
      const targetSec = sections.find(
        (s) =>
          s.title.toLowerCase().includes(rec.section_name.toLowerCase()) ||
          rec.section_name.toLowerCase().includes(s.title.toLowerCase())
      ) || sections[0];

      if (targetSec) {
        let updatedContent = targetSec.content;
        if (rec.original_text && updatedContent.includes(rec.original_text)) {
          updatedContent = updatedContent.replace(rec.original_text, rec.recommended_fix);
        } else {
          updatedContent += `\n\n> **[Applied QC Fix - ${rec.qc_type.toUpperCase()}]:** ${rec.recommended_fix}`;
        }

        setSections((prev) =>
          prev.map((s) => (s.id === targetSec.id ? { ...s, content: updatedContent } : s))
        );
        setActiveSectionId(targetSec.id);
        setHasUnsavedChanges(true);
      }

      setRecommendations((prev) =>
        prev.map((r) => (r.id === rec.id ? { ...r, status: 'APPLIED' } : r))
      );
    } catch (err: any) {
      setErrorMessage('Failed to apply recommendation.');
    } finally {
      setApplyingRecId(null);
    }
  };

  // Batch apply all pending fixes
  const handleApplyAllPending = async () => {
    const pending = recommendations.filter((r) => r.status === 'PENDING');
    for (const rec of pending) {
      await handleApplyRec(rec);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
        <div className="text-center">
          <h4 className="text-sm font-bold text-slate-900">Loading Lesson Studio</h4>
          <p className="text-xs text-slate-500 mt-1">Synchronizing curriculum structure and AI audit reports...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-3xl max-w-lg mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-500">
          <Edit3 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900">No Lesson Selected</h4>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
          Select an existing curriculum from your Lesson Library or create a new topic to begin editing.
        </p>
        <button
          onClick={() => navigate('/library')}
          className="btn-primary-gradient px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
        >
          Browse Lesson Library
        </button>
      </div>
    );
  }

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const pendingRecs = recommendations.filter((r) => r.status === 'PENDING');
  const filteredRecs = pendingRecs.filter((r) => {
    if (qcFilter === 'ALL') return true;
    return r.qc_type.toUpperCase() === qcFilter;
  });

  return (
    <AnimatedPage className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. Executive Top Header */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span>Curriculum Studio</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-indigo-600 font-bold">{lesson.target_level || 'Higher Ed'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{sections.length} Standard Sections</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => {
                  setLesson({ ...lesson, title: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="text-xl sm:text-2xl font-black text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white px-2 py-1 rounded-xl border border-transparent hover:border-slate-200 focus:border-indigo-500 w-full tracking-tight transition-all"
                title="Click to edit lesson title"
              />
            </div>

            <p className="text-xs text-slate-600 px-2 mt-1 leading-relaxed flex items-center space-x-1.5">
              <span className="font-bold text-indigo-700 shrink-0">Objective:</span>
              <span className="truncate">{lesson.learning_objective}</span>
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
            {/* View Mode Segmented Controls */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('visual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  viewMode === 'visual'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visual</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  viewMode === 'edit'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Source</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Full Lesson</span>
              </button>
            </div>

            {/* Save Button with Dirty Indicator */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-xs cursor-pointer ${
                hasUnsavedChanges
                  ? 'btn-primary-gradient'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : hasUnsavedChanges ? (
                <span className="w-2 h-2 rounded-full bg-pink-300 animate-pulse" />
              ) : (
                <Save className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
            </motion.button>

            {/* Export Center Redirect */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/export?lessonId=${lesson.id}`)}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Download Lesson & QC PDFs"
            >
              <Download className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Notifications */}
        {saveSuccess && (
          <div className="flex items-center space-x-2 p-3 mt-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Revisions committed to SQLite database & snapshot logged in Version History.</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center space-x-2 p-3 mt-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </motion.div>

      {/* 2. Cockpit Curriculum Pacing Telemetry */}
      <DurationIndicator minutes={currentTotalDuration} maxMinutes={45} />

      {/* 3. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Interactive Curriculum Outline (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between px-2.5 py-1 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Curriculum Outline
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              {sections.length} Units
            </span>
          </div>

          <div className="space-y-1">
            {sections.map((section, idx) => {
              const isSelected = section.id === activeSectionId;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate">{section.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 font-medium">
                    {section.estimated_minutes}m
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: Professional Studio Editor / Split / Preview (6 cols or full) */}
        <div className={`overflow-hidden ${
          pendingRecs.length === 0 ? 'lg:col-span-9' : 'lg:col-span-6'
        }`}>
          {viewMode === 'preview' ? (
            /* Full Document Preview */
            <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="border-b border-slate-200 pb-5">
                <span className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider text-indigo-600 font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Student Curriculum Master</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">{lesson.title}</h2>
                <div className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-indigo-700 block mb-1">Primary Learning Objective:</span>
                  <p>{lesson.learning_objective}</p>
                </div>
              </div>

              {sections.map((s, idx) => (
                <div key={s.id} className="space-y-3 pb-8 border-b border-slate-100 last:border-none">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2.5">
                      <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-2.5 py-0.5 rounded-lg font-mono">
                        Unit {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span>{s.title}</span>
                    </h3>
                    <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      {s.estimated_minutes} mins
                    </span>
                  </div>
                  <div className="pt-2">
                    <MarkdownRenderer content={s.content} />
                  </div>
                </div>
              ))}
            </div>
          ) : activeSection ? (
            /* Rich Interactive Document Studio */
            <RichDocumentEditor
              content={activeSection.content}
              onChange={(newContent) => handleSectionContentChange(activeSection.id, newContent)}
              sectionTitle={activeSection.title}
              onTitleChange={(newTitle) => handleSectionTitleChange(activeSection.id, newTitle)}
              estimatedMinutes={activeSection.estimated_minutes}
              onMinutesChange={(newMinutes) => handleSectionMinutesChange(activeSection.id, newMinutes)}
              viewMode={viewMode}
              onViewModeChange={(m) => setViewMode(m)}
            />
          ) : null}
        </div>

        {/* Right Column: AI Quality Auditor Drawer (3 cols) */}
        {pendingRecs.length > 0 && (
          <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">AI Quality Auditor</h4>
                  <span className="text-[10px] text-slate-500 font-medium">Dual QC Engine</span>
                </div>
              </div>
              <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                {pendingRecs.length}
              </span>
            </div>

            {/* Filter Chips & Bulk Action */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                <button
                  onClick={() => setQcFilter('ALL')}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                    qcFilter === 'ALL' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  All ({pendingRecs.length})
                </button>
                <button
                  onClick={() => setQcFilter('FACTUAL')}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                    qcFilter === 'FACTUAL' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Factual
                </button>
                <button
                  onClick={() => setQcFilter('INSTRUCTIONAL')}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                    qcFilter === 'INSTRUCTIONAL' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Instruction
                </button>
              </div>

              {pendingRecs.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleApplyAllPending}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Apply All {pendingRecs.length} Fixes</span>
                </motion.button>
              )}
            </div>

            {/* List of Pending Audit Cards */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredRecs.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 truncate max-w-[150px]">
                      {rec.section_name}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                      {rec.qc_type}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-relaxed line-clamp-3">
                    {rec.issue_text}
                  </p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-end">
                    <button
                      onClick={() => handleApplyRec(rec)}
                      disabled={applyingRecId === rec.id}
                      className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 rounded-lg transition-all cursor-pointer"
                    >
                      {applyingRecId === rec.id ? 'Applying...' : 'Apply Correction'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

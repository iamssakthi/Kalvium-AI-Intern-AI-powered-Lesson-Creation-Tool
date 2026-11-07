import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from '../motion';
import {
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import {
  LessonListItem,
  FactualQCReport,
  InstructionalQCReport,
  QCRecommendation
} from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { QCRecommendationCard } from '../components/QCRecommendationCard';
import { AnimatedPage } from '../components/AnimatedPage';
import { itemVariants } from '../animations/variants';

export const QualityControlPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonIdFromUrl = searchParams.get('lessonId');

  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessonIdFromUrl || '');
  const [activeTab, setActiveTab] = useState<'factual' | 'instructional'>('factual');

  const [factualReport, setFactualReport] = useState<FactualQCReport | null>(null);
  const [instructionalReport, setInstructionalReport] = useState<InstructionalQCReport | null>(null);
  const [recommendations, setRecommendations] = useState<QCRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [rerunning, setRerunning] = useState(false);

  // Load lesson choices
  useEffect(() => {
    api.getLessons().then((data) => {
      setLessons(data);
      if (!selectedLessonId && data.length > 0) {
        setSelectedLessonId(data[0].id);
        setSearchParams({ lessonId: data[0].id });
      }
    });
  }, []);

  // Fetch QC data
  const loadQCData = async () => {
    if (!selectedLessonId) return;
    setLoading(true);
    try {
      const [qcRes, recsRes] = await Promise.all([
        api.getQCReports(selectedLessonId),
        api.getRecommendations(selectedLessonId),
      ]);
      setFactualReport(qcRes.factual_qc);
      setInstructionalReport(qcRes.instructional_qc);
      setRecommendations(recsRes);
    } catch (err) {
      console.error('Failed to load QC data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQCData();
  }, [selectedLessonId]);

  const handleLessonChange = (newId: string) => {
    setSelectedLessonId(newId);
    setSearchParams({ lessonId: newId });
  };

  const handleRerunQC = async (type: 'factual' | 'instructional') => {
    if (!selectedLessonId || rerunning) return;
    setRerunning(true);
    try {
      if (type === 'factual') {
        await api.rerunFactualQC(selectedLessonId);
      } else {
        await api.rerunInstructionalQC(selectedLessonId);
      }
      await loadQCData();
    } catch (err) {
      console.error('Failed to re-run QC:', err);
    } finally {
      setRerunning(false);
    }
  };

  const handleApplyRec = async (recId: string, customFix?: string) => {
    await api.applyRecommendation(recId, customFix);
    await loadQCData();
  };

  const handleRejectRec = async (recId: string) => {
    await api.rejectRecommendation(recId);
    await loadQCData();
  };

  const activeRecs = recommendations.filter((r) => r.qc_type === activeTab);

  return (
    <AnimatedPage className="space-y-6">
      {/* Top Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold uppercase tracking-wider">Independent Dual Audit Deck</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quality Control Center</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Two independent audit engines: Research &amp; Factual Accuracy (Layer 1) and Instructional Quality (Layer 2)
          </p>
        </div>

        {/* Lesson Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-700 shrink-0 uppercase tracking-wider">Lesson:</label>
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

      {/* QC System Tabs */}
      <motion.div variants={itemVariants} className="flex items-center space-x-3 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('factual')}
          className={`pb-3.5 px-3 text-xs sm:text-sm font-bold transition-all relative flex items-center space-x-2 cursor-pointer ${
            activeTab === 'factual'
              ? 'text-indigo-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Layer 1: Factual Accuracy Audit</span>
          {factualReport && (
            <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.2 rounded-full font-bold">
              {factualReport.accuracy_score}%
            </span>
          )}
          {activeTab === 'factual' && (
            <motion.div
              layoutId="qc-tab-active"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('instructional')}
          className={`pb-3.5 px-3 text-xs sm:text-sm font-bold transition-all relative flex items-center space-x-2 cursor-pointer ${
            activeTab === 'instructional'
              ? 'text-indigo-900'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-pink-600" />
          <span>Layer 2: Instructional Quality Audit</span>
          {instructionalReport && (
            <span className="text-[11px] bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.2 rounded-full font-bold">
              {instructionalReport.pedagogical_score}%
            </span>
          )}
          {activeTab === 'instructional' && (
            <motion.div
              layoutId="qc-tab-active"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600"
            />
          )}
        </button>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Auditing lesson quality...</p>
          </div>
        ) : activeTab === 'factual' ? (
          /* LAYER 1: FACTUAL ACCURACY */
          <motion.div
            key="factual"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {factualReport ? (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
                {/* Score & Actions Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-black text-blue-600">
                      {factualReport.accuracy_score}%
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-slate-900">Factual Accuracy Assessment</h3>
                        <StatusBadge status={factualReport.overall_status} type="qc" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Ref: {factualReport.audit_id}</p>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRerunQC('factual')}
                    disabled={rerunning}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${rerunning ? 'animate-spin' : ''}`} />
                    <span>{rerunning ? 'Auditing...' : 'Re-run Factual QC'}</span>
                  </motion.button>
                </div>

                {/* Executive Summary */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Executive Verification Summary:</h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    {factualReport.summary}
                  </p>
                </div>

                {/* Verification Scope Notice */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-2.5 text-xs text-amber-900 font-medium">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="text-amber-950 font-bold">Verification Scope:</strong> Technical factual claims are cross-referenced directly against retrieved Tavily Web and Google Books documentation.
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-xs text-slate-500">No factual QC report recorded for this lesson.</p>
              </div>
            )}

            {/* Factual Recommendations List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Factual Issues &amp; Verified Fixes ({activeRecs.length})
                </h3>
                <span className="text-xs text-slate-500">Instructors can inspect, modify, and apply fixes</span>
              </div>

              {activeRecs.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-800">Zero Factual Issues Pending</h4>
                  <p className="text-[11px] text-slate-500 mt-1">All factual statements comply with research evidence.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeRecs.map((rec) => (
                    <QCRecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      onApply={handleApplyRec}
                      onReject={handleRejectRec}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* LAYER 2: INSTRUCTIONAL QUALITY */
          <motion.div
            key="instructional"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {instructionalReport ? (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
                {/* Score & Actions Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-black text-pink-600">
                      {instructionalReport.pedagogical_score}%
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-slate-900">Instructional Quality Assessment</h3>
                        <StatusBadge status={instructionalReport.overall_status} type="qc" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Ref: {instructionalReport.audit_id}</p>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRerunQC('instructional')}
                    disabled={rerunning}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${rerunning ? 'animate-spin' : ''}`} />
                    <span>{rerunning ? 'Auditing...' : 'Re-run Instructional QC'}</span>
                  </motion.button>
                </div>

                {/* Rubric Breakdown Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Clarity</span>
                    <span className="text-xs font-bold text-slate-900 capitalize">{instructionalReport.clarity_assessment}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Structure</span>
                    <span className="text-xs font-bold text-slate-900 capitalize">{instructionalReport.structure_assessment}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Example Quality</span>
                    <span className="text-xs font-bold text-slate-900 capitalize">{instructionalReport.example_quality}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Activity Quality</span>
                    <span className="text-xs font-bold text-slate-900 capitalize">{instructionalReport.activity_quality}</span>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Pedagogical Evaluation:</h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    {instructionalReport.summary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-xs text-slate-500">No instructional QC report recorded for this lesson.</p>
              </div>
            )}

            {/* Instructional Recommendations List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Instructional Scaffolding &amp; Fixes ({activeRecs.length})
                </h3>
                <span className="text-xs text-slate-500">Refine explanations, exercises, and time pacing</span>
              </div>

              {activeRecs.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-800">Zero Instructional Issues Pending</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Curriculum structure meets educational standards.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeRecs.map((rec) => (
                    <QCRecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      onApply={handleApplyRec}
                      onReject={handleRejectRec}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

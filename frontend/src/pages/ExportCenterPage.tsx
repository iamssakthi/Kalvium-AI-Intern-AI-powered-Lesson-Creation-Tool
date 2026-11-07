import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from '../motion';
import {
  Download,
  FileText,
  ShieldCheck,
  BookOpen,
  Code,
  Eye,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { LessonListItem } from '../types';
import { AnimatedPage } from '../components/AnimatedPage';
import { containerVariants, itemVariants } from '../animations/variants';

export const ExportCenterPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonIdFromUrl = searchParams.get('lessonId');

  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessonIdFromUrl || '');
  const [previewData, setPreviewData] = useState<any>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'overview' | 'json'>('overview');
  const [loading, setLoading] = useState(false);

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

  // Fetch preview data
  useEffect(() => {
    if (!selectedLessonId) return;
    setLoading(true);
    api.getLessonPreview(selectedLessonId)
      .then(setPreviewData)
      .catch((err) => console.error('Failed to load preview:', err))
      .finally(() => setLoading(false));
  }, [selectedLessonId]);

  const handleLessonChange = (newId: string) => {
    setSelectedLessonId(newId);
    setSearchParams({ lessonId: newId });
  };

  const lessonPdfUrl = selectedLessonId ? api.getLessonPdfUrl(selectedLessonId) : '';
  const factualQcPdfUrl = selectedLessonId ? api.getFactualQcPdfUrl(selectedLessonId) : '';
  const instructionalQcPdfUrl = selectedLessonId ? api.getInstructionalQcPdfUrl(selectedLessonId) : '';
  const jsonExportUrl = selectedLessonId ? api.getJsonExportUrl(selectedLessonId) : '';

  return (
    <AnimatedPage className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold uppercase tracking-wider">Document Publishing Suite</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Export &amp; Compliance Center</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Download publication-ready ReportLab PDFs and structured JSON packages for higher education deployment
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

      {/* 4 Primary Export Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* 1. Complete Lesson Curriculum PDF */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200/90 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-indigo-300 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-[10px] font-bold uppercase text-indigo-700 tracking-wider">ReportLab PDF</span>
            <h4 className="text-sm font-bold text-slate-900 mt-1">Lesson Curriculum</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Complete 10-unit lecture plan, learning objectives, citations, and delivery times.
            </p>
          </div>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            href={lessonPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="mt-4 btn-primary-gradient py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer text-white"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </motion.a>
        </motion.div>

        {/* 2. Factual QC Report PDF */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200/90 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-blue-300 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider">Layer 1 Audit</span>
            <h4 className="text-sm font-bold text-slate-900 mt-1">Factual Verification</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Research evidence cross-referencing, claim accuracy checks, and verified corrections.
            </p>
          </div>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            href={factualQcPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report</span>
          </motion.a>
        </motion.div>

        {/* 3. Instructional Quality PDF */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200/90 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-pink-300 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-700 border border-pink-200 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-pink-600" />
            </div>
            <span className="text-[10px] font-bold uppercase text-pink-700 tracking-wider">Layer 2 Audit</span>
            <h4 className="text-sm font-bold text-slate-900 mt-1">Pedagogical Evaluation</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Scaffolding, clarity, activity quality, and 45-minute pacing rubric compliance.
            </p>
          </div>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            href={instructionalQcPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="mt-4 bg-pink-600 hover:bg-pink-700 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report</span>
          </motion.a>
        </motion.div>

        {/* 4. Complete JSON Metadata Package */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200/90 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-300 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-3">
              <Code className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Raw Package</span>
            <h4 className="text-sm font-bold text-slate-900 mt-1">Structured JSON Data</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Machine-readable payload with full citations, section timings, and audit metadata.
            </p>
          </div>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            href={jsonExportUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Document Inspector & Preview Pane */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Live Document Preview &amp; Verification</h3>
          </div>

          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActivePreviewTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePreviewTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Curriculum Overview
            </button>
            <button
              onClick={() => setActivePreviewTab('json')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePreviewTab === 'json'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              JSON Inspector
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading document preview...</p>
          </div>
        ) : activePreviewTab === 'overview' && previewData ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="text-lg font-bold text-slate-900">{previewData.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-indigo-900">Objective:</span> {previewData.learning_objective}
              </p>
              <div className="flex items-center space-x-3 text-xs text-slate-500 pt-1 font-medium">
                <span>Duration: <strong className="text-indigo-800 font-bold">{previewData.estimated_duration_minutes} mins</strong></span>
                <span>•</span>
                <span>Level: <strong className="text-slate-800 font-bold">{previewData.target_level}</strong></span>
                <span>•</span>
                <span>Units: <strong className="text-slate-800 font-bold">{previewData.sections?.length || 0}</strong></span>
              </div>
            </div>

            {/* Quick Section Outline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {previewData.sections?.map((s: any, idx: number) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-xs">
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">U{idx + 1}</span>
                    <span className="text-slate-800 font-medium truncate">{s.title}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-bold shrink-0">{s.estimated_minutes}m</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 max-h-[400px] overflow-y-auto">
            <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
              {JSON.stringify(previewData, null, 2)}
            </pre>
          </div>
        )}
      </motion.div>
    </AnimatedPage>
  );
};

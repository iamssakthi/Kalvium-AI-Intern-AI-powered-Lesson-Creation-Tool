import React, { useState, useEffect } from 'react';
import { motion } from '../motion';
import { CheckCircle2, Loader2, Circle, ShieldCheck, Sparkles, Globe, Book, Video, Clock } from 'lucide-react';

interface LoadingStagesProps {
  currentStage: number; // 0 to 9
  isError?: boolean;
}

const STAGES = [
  { id: 1, title: 'Validating Input', desc: 'Checking title, objective, and level parameters', icon: CheckCircle2 },
  { id: 2, title: 'Researching Authoritative Websites', desc: 'Querying Tavily for RFCs, documentation, & portals', icon: Globe },
  { id: 3, title: 'Researching Academic Books', desc: 'Searching Google Books API for textbooks and literature', icon: Book },
  { id: 4, title: 'Discovering Educational Videos', desc: 'Retrieving YouTube video tutorials and visual explanations', icon: Video },
  { id: 5, title: 'Synthesizing & Deduplicating Evidence', desc: 'Ranking citations and organizing source material', icon: Sparkles },
  { id: 6, title: 'Generating Lesson & Enforcing 45-Min Constraint', desc: 'AI structuring 10 pedagogical units with strict timing', icon: Sparkles },
  { id: 7, title: 'Running QC Layer 1: Factual Accuracy', desc: 'AI cross-referencing claims against 5 research sources', icon: ShieldCheck },
  { id: 8, title: 'Running QC Layer 2: Instructional Quality', desc: 'AI evaluating pedagogical scaffolding & writing recommendations', icon: ShieldCheck },
  { id: 9, title: 'Saving & Indexing Lesson', desc: 'Storing snapshot to database and preparing interactive editor', icon: CheckCircle2 },
];

export const LoadingStages: React.FC<LoadingStagesProps> = ({ currentStage, isError = false }) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min(Math.round((currentStage / 9) * 100), 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl max-w-xl mx-auto"
    >
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-md shadow-indigo-500/20">
          <Sparkles className="w-7 h-7 animate-pulse text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900">
          Generating Grounded Educational Lesson
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          Executing multi-source research pipeline and independent dual QC evaluations
        </p>

        {/* Live Elapsed Telemetry */}
        <div className="mt-4 flex items-center justify-center space-x-3 text-xs">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-700 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
            <span>Elapsed: <strong className="text-slate-900 font-bold">{secondsElapsed}s</strong> / ~35s expected</span>
          </div>
          <span className="text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
            {progressPercent}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-2 mt-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {STAGES.map((stage) => {
          const isCompleted = currentStage > stage.id;
          const isCurrent = currentStage === stage.id;
          const isPending = currentStage < stage.id;

          return (
            <motion.div
              key={stage.id}
              className={`flex items-start space-x-3 p-2.5 sm:p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-indigo-50/90 border-indigo-200 shadow-xs'
                  : isCompleted
                  ? 'bg-emerald-50/50 border-emerald-200/80'
                  : 'bg-slate-50/60 border-slate-200/60'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold ${
                    isCurrent ? 'text-indigo-950' : isCompleted ? 'text-slate-900' : 'text-slate-500'
                  }`}>
                    {stage.title}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-200 px-1.5 py-0.2 rounded font-bold animate-pulse">
                      In Progress
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
                      Done
                    </span>
                  )}
                </div>
                <p className={`text-[11px] mt-0.5 leading-normal truncate ${
                  isCurrent ? 'text-indigo-800' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {stage.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-[11px] text-indigo-950 leading-relaxed font-medium">
        <strong>Why does this take ~35 seconds?</strong> The pipeline performs real web retrieval via Tavily, prompts the OpenRouter LLM to structure a strict 45-minute curriculum, and then conducts 2 independent LLM quality control audits (Factual Verification + Instructional Evaluation).
      </div>
    </motion.div>
  );
};

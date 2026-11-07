import React, { useState } from 'react';
import { motion } from '../motion';
import { Check, X, Edit2, CheckCircle2 } from 'lucide-react';
import { QCRecommendation } from '../types';
import { StatusBadge } from './StatusBadge';

interface QCRecommendationCardProps {
  recommendation: QCRecommendation;
  onApply: (id: string, customFix?: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export const QCRecommendationCard: React.FC<QCRecommendationCardProps> = ({
  recommendation,
  onApply,
  onReject,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFix, setEditedFix] = useState(recommendation.recommended_fix);
  const [isApplying, setIsApplying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply(recommendation.id, editedFix !== recommendation.recommended_fix ? editedFix : undefined);
      setIsEditing(false);
    } finally {
      setIsApplying(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await onReject(recommendation.id);
    } finally {
      setIsRejecting(false);
    }
  };

  const isApplied = recommendation.status === 'APPLIED';
  const isRejected = recommendation.status === 'REJECTED';

  return (
    <motion.div
      layout
      className={`border rounded-2xl p-5 transition-all shadow-xs ${
        isApplied
          ? 'bg-emerald-50/70 border-emerald-200'
          : isRejected
          ? 'bg-slate-50 border-slate-200 opacity-60'
          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-2">
          <StatusBadge status={recommendation.severity} type="severity" />
          <span className="text-xs font-bold text-slate-900">
            {recommendation.section_name}
          </span>
          <span className="text-[11px] text-indigo-700 font-bold uppercase">
            ({recommendation.qc_type} QC)
          </span>
        </div>

        {isApplied ? (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Applied</span>
          </span>
        ) : isRejected ? (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <X className="w-3.5 h-3.5" />
            <span>Dismissed</span>
          </span>
        ) : null}
      </div>

      {/* Issue Description */}
      <div className="mt-3 text-xs text-slate-700 leading-relaxed">
        <strong className="text-slate-900 font-bold">Issue Detected:</strong> {recommendation.issue_text}
      </div>

      {/* Original vs Recommended Fix */}
      <div className="mt-3 space-y-2">
        {recommendation.original_text && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs">
            <span className="font-bold text-rose-800 block mb-1 text-[11px] uppercase tracking-wider">Original Passage:</span>
            <p className="text-rose-900 font-mono text-[11px] leading-relaxed line-through">
              {recommendation.original_text}
            </p>
          </div>
        )}

        {isEditing ? (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
            <span className="font-bold text-indigo-900 block text-[11px] uppercase tracking-wider">Customize Recommendation Before Applying:</span>
            <textarea
              rows={3}
              value={editedFix}
              onChange={(e) => setEditedFix(e.target.value)}
              className="input-field w-full text-xs p-2.5 rounded-lg font-mono text-slate-900 bg-white border border-slate-200"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                {isApplying ? 'Applying...' : 'Apply Customized Fix'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
            <span className="font-bold text-emerald-900 block mb-1 text-[11px] uppercase tracking-wider">Verified Correction:</span>
            <p className="text-emerald-950 font-mono text-[11px] leading-relaxed font-semibold">
              {recommendation.recommended_fix}
            </p>
          </div>
        )}
      </div>

      {/* Actions (if still pending) */}
      {!isApplied && !isRejected && !isEditing && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 font-semibold cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            <span>Customize Fix</span>
          </button>

          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleReject}
              disabled={isRejecting}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer font-medium"
            >
              Dismiss
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleApply}
              disabled={isApplying}
              className="btn-primary-gradient px-3.5 py-1.5 text-xs font-bold text-white rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isApplying ? 'Applying Fix...' : 'Apply Correction'}</span>
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

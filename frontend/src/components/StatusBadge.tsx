import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'qc' | 'lesson' | 'severity';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'qc' }) => {
  const norm = status?.toUpperCase() || 'UNKNOWN';

  if (type === 'qc') {
    if (norm === 'PASS') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-xs">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>PASS</span>
        </span>
      );
    }
    if (norm === 'NEEDS IMPROVEMENT') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 border border-amber-300 text-amber-800 shadow-xs">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>NEEDS IMPROVEMENT</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 border border-rose-300 text-rose-800 shadow-xs">
        <XCircle className="w-3 h-3 text-rose-600" />
        <span>CRITICAL</span>
      </span>
    );
  }

  if (type === 'lesson') {
    if (norm === 'COMPLETED') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-xs">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Completed</span>
        </span>
      );
    }
    if (norm === 'IN_REVIEW') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-xs">
          <Clock className="w-3 h-3 text-indigo-600" />
          <span>In Review</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 border border-slate-300 text-slate-700 shadow-xs">
        <Clock className="w-3 h-3 text-slate-500" />
        <span>Draft</span>
      </span>
    );
  }

  // Severity badges
  if (norm === 'LOW') {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 border border-sky-200 text-sky-800">
        <ShieldAlert className="w-3 h-3 text-sky-600" />
        <span>LOW</span>
      </span>
    );
  }
  if (norm === 'MEDIUM') {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 border border-amber-300 text-amber-800">
        <ShieldAlert className="w-3 h-3 text-amber-600" />
        <span>MEDIUM</span>
      </span>
    );
  }
  if (norm === 'HIGH') {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-orange-50 border border-orange-300 text-orange-800">
        <ShieldAlert className="w-3 h-3 text-orange-600" />
        <span>HIGH</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 border border-rose-300 text-rose-800">
      <ShieldAlert className="w-3 h-3 text-rose-600" />
      <span>{norm}</span>
    </span>
  );
};

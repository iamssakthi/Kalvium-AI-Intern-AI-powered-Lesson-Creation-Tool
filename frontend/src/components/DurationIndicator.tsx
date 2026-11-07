import React from 'react';
import { Clock, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface DurationIndicatorProps {
  minutes: number;
  maxMinutes?: number;
  compact?: boolean;
}

export const DurationIndicator: React.FC<DurationIndicatorProps> = ({
  minutes,
  maxMinutes = 45,
  compact = false
}) => {
  const percentage = Math.min(100, Math.round((minutes / maxMinutes) * 100));
  const isOver = minutes > maxMinutes;
  const isExact = minutes === maxMinutes;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs transition-all ${
          isOver
            ? 'bg-rose-50 border border-rose-300 text-rose-800'
            : isExact
            ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
            : 'bg-indigo-50 border border-indigo-200 text-indigo-800'
        }`}
      >
        <Clock className={`w-3 h-3 ${isOver ? 'text-rose-600' : isExact ? 'text-emerald-600' : 'text-indigo-600'}`} />
        <span>{minutes} / {maxMinutes}m</span>
      </span>
    );
  }

  return (
    <div className="rounded-2xl p-4 sm:p-5 relative overflow-hidden bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/60 border border-indigo-100 shadow-xs">
      {/* Decorative ambient subtle lights */}
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl pointer-events-none bg-indigo-200/40" />
      <div className="absolute right-40 -bottom-10 w-32 h-32 rounded-full blur-3xl pointer-events-none bg-emerald-100/50" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-100 border border-indigo-200 text-indigo-700">
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-slate-900 tracking-tight">Curriculum Pacing Telemetry</h4>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800">
                  Strict 45-Min Standard
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Calibrated for single-session higher education delivery &amp; optimal cognitive retention.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <div
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs ${
                isOver
                  ? 'bg-rose-50 border border-rose-300 text-rose-800'
                  : isExact
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                  : 'bg-amber-50 border border-amber-300 text-amber-800'
              }`}
            >
              {isExact ? (
                <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Optimal Pacing (100%)</span></>
              ) : isOver ? (
                <><AlertCircle className="w-3.5 h-3.5 text-rose-600" /><span>+{minutes - maxMinutes}m Over Limit</span></>
              ) : (
                <><Zap className="w-3.5 h-3.5 text-amber-600" /><span>{maxMinutes - minutes}m Headroom</span></>
              )}
            </div>
            <div className="text-right pl-2 border-l border-slate-200">
              <div className="text-lg font-black tracking-tight text-slate-900 leading-none">
                {minutes} <span className="text-xs font-medium text-slate-400">/ {maxMinutes} min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5 mt-3">
          <div className="w-full rounded-full h-2.5 p-0.5 overflow-hidden bg-slate-200 border border-slate-300/60">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${percentage}%`,
                background: isOver
                  ? 'linear-gradient(90deg, #f97316, #e11d48)'
                  : isExact
                  ? 'linear-gradient(90deg, #6366f1, #10b981)'
                  : 'linear-gradient(90deg, #6366f1, #06b6d4)',
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold px-1 text-slate-500">
            <span>0m</span>
            <span className="hidden sm:inline">15m (Foundations)</span>
            <span className="hidden sm:inline">30m (Core Depth)</span>
            <span className="font-bold text-slate-700">45m (Cap)</span>
          </div>
        </div>

        {isOver && (
          <div className="flex items-center space-x-2 mt-3 p-2.5 rounded-xl text-xs bg-rose-50 border border-rose-200 text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span><strong>Pacing Alert:</strong> Total lecture duration exceeds 45 minutes. Please scale back section allocations.</span>
          </div>
        )}
      </div>
    </div>
  );
};

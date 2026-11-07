import React, { useEffect, useState } from 'react';
import { Sparkles, BookOpen, ExternalLink, Zap } from 'lucide-react';
import { motion } from '../motion';
import { apiClient } from '../services/api';

export const Navbar: React.FC = () => {
  const [health, setHealth] = useState<{
    status: string;
    gemini_configured: boolean;
    ai_configured?: boolean;
    ai_provider?: string;
  } | null>(null);

  useEffect(() => {
    apiClient.get('/api/health')
      .then(res => setHealth(res.data))
      .catch(() => setHealth({ status: 'offline', gemini_configured: false }));
  }, []);

  const isOnline = health?.status === 'healthy';
  const aiLabel = health?.ai_provider && health.ai_provider !== 'Benchmark'
    ? `${health.ai_provider} Live`
    : (health?.gemini_configured ? 'AI Live' : 'Benchmark Mode');

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-3">
        <motion.div
          whileHover={{ rotate: 12, scale: 1.06 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">AI Lesson Platform</h1>
            <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Kalvium AI Research
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            Research Orchestration & Dual QC Engine
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Backend status indicator */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs shadow-2xs">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 pulse-beacon' : 'bg-rose-500'}`} />
          <span className="text-slate-700 font-semibold">
            API: {isOnline ? 'Online' : 'Offline'}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-indigo-600 font-semibold flex items-center space-x-1">
            <Zap className="w-3 h-3 text-indigo-500" />
            <span>{aiLabel}</span>
          </span>
        </div>

        <motion.a
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-2xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline">Swagger API</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </motion.a>
      </div>
    </header>
  );
};

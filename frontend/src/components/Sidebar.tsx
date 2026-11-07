import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from '../motion';
import {
  LayoutDashboard,
  PlusCircle,
  BookOpenCheck,
  Search,
  ShieldCheck,
  Edit3,
  Download,
  Clock
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const activeLessonId = searchParams.get('lessonId');
  const lessonQuery = activeLessonId ? `?lessonId=${activeLessonId}` : '';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Create Lesson', path: '/create', icon: PlusCircle },
    { name: 'Lesson Library', path: '/library', icon: BookOpenCheck },
    { name: 'Research Sources', path: `/sources${lessonQuery}`, icon: Search },
    { name: 'QC Center', path: `/qc${lessonQuery}`, icon: ShieldCheck },
    { name: 'Lesson Editor', path: `/editor${lessonQuery}`, icon: Edit3 },
    { name: 'Export Center', path: `/export${lessonQuery}`, icon: Download },
  ];

  return (
    <aside className="w-56 md:w-60 bg-white/85 backdrop-blur-xl text-slate-700 flex flex-col shrink-0 border-r border-slate-200/90 z-20">
      <div className="px-5 py-4 border-b border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Workspace Navigation
        </span>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path.split('?')[0];

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`relative flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50/90 border border-indigo-200/70 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="truncate">{item.name}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-2xs" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* 45-Minute Delivery Constraint Pacing Badge */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50/50">
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-1.5 text-indigo-700 text-xs font-bold mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Max 45-Min Constraint</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Every curriculum module is strictly audited against 45-minute delivery standards.
          </p>
        </div>
      </div>
    </aside>
  );
};

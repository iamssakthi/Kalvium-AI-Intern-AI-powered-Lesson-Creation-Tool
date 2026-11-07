import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from './motion';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { CreateLessonPage } from './pages/CreateLessonPage';
import { LessonLibraryPage } from './pages/LessonLibraryPage';
import { ResearchSourcesPage } from './pages/ResearchSourcesPage';
import { QualityControlPage } from './pages/QualityControlPage';
import { LessonEditorPage } from './pages/LessonEditorPage';
import { ExportCenterPage } from './pages/ExportCenterPage';

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 font-sans relative selection:bg-indigo-600 selection:text-white">
      {/* SaaS Ambient Glows */}
      <div className="ambient-glow-purple" />
      <div className="ambient-glow-pink" />
      <div className="ambient-glow-cyan" />

      {/* Global Top Navigation */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/create" element={<CreateLessonPage />} />
                <Route path="/library" element={<LessonLibraryPage />} />
                <Route path="/sources" element={<ResearchSourcesPage />} />
                <Route path="/qc" element={<QualityControlPage />} />
                <Route path="/editor" element={<LessonEditorPage />} />
                <Route path="/export" element={<ExportCenterPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;

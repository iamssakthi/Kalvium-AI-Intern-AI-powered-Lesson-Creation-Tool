import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from '../motion';
import { Sparkles, AlertCircle, BookmarkCheck, Globe, Book, Video, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { LoadingStages } from '../components/LoadingStages';
import { AnimatedPage } from '../components/AnimatedPage';
import { itemVariants } from '../animations/variants';

export const CreateLessonPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [learningObjective, setLearningObjective] = useState('');
  const [targetLevel, setTargetLevel] = useState('Beginner');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [instructorInstructions, setInstructorInstructions] = useState('');

  // Generation & Progress State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill Test Scenarios from Section 16
  const loadScenario1 = () => {
    setTitle('HTTP Requests and Responses');
    setLearningObjective('Explain GET and POST methods and distinguish between 2xx, 4xx, and 5xx response status categories.');
    setTargetLevel('Beginner Web Developers');
    setDifficulty('Intermediate');
    setInstructorInstructions('Focus on real-world REST API design and browser Developer Tools network inspection.');
    setErrorMessage(null);
  };

  const loadScenario2 = () => {
    setTitle('Introduction to Machine Learning and Supervised Learning');
    setLearningObjective('Understand the fundamentals of machine learning, distinguish between supervised and unsupervised learning, and explain classification and regression using practical examples.');
    setTargetLevel('Undergraduate Data Science Students');
    setDifficulty('Intermediate');
    setInstructorInstructions('Provide concise Python Scikit-Learn code snippets demonstrating classification and regression.');
    setErrorMessage(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !learningObjective.trim()) {
      setErrorMessage('Both Lesson Title and Learning Objective are mandatory.');
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    setCurrentStage(1);

    // Realistic progression across multi-source research and dual LLM evaluations (~35s total)
    const timer1 = setTimeout(() => setCurrentStage(2), 1200);   // Researching Websites (Tavily)
    const timer2 = setTimeout(() => setCurrentStage(3), 2800);   // Researching Books
    const timer3 = setTimeout(() => setCurrentStage(4), 4200);   // Video Discovery
    const timer4 = setTimeout(() => setCurrentStage(5), 5500);   // Synthesizing Evidence
    const timer5 = setTimeout(() => setCurrentStage(6), 7000);   // LLM Pass 1: 10-Unit Lesson Generation
    const timer6 = setTimeout(() => setCurrentStage(7), 20000);  // LLM Pass 2: Factual Accuracy QC Audit
    const timer7 = setTimeout(() => setCurrentStage(8), 30000);  // LLM Pass 3: Instructional Quality QC Audit

    try {
      const response = await api.generateLesson({
        title,
        learning_objective: learningObjective,
        target_level: targetLevel,
        difficulty,
        instructor_instructions: instructorInstructions,
      });

      // Clear pending timer steps
      [timer1, timer2, timer3, timer4, timer5, timer6, timer7].forEach(clearTimeout);

      // Support either standard wrapper or direct object
      const lessonId = response.data?.lesson_id || (response as any).lesson_id;
      setCurrentStage(9); // Ready & Saving Stage

      setTimeout(() => {
        if (lessonId) {
          navigate(`/editor?lessonId=${lessonId}`);
        } else {
          navigate('/dashboard');
        }
      }, 900);
    } catch (err: any) {
      [timer1, timer2, timer3, timer4, timer5, timer6, timer7].forEach(clearTimeout);
      setErrorMessage(err.response?.data?.error || err.message || 'Generation failed. Please try again.');
      setIsGenerating(false);
      setCurrentStage(0);
    }
  };

  if (isGenerating) {
    return (
      <div className="py-8 sm:py-12">
        <LoadingStages currentStage={currentStage} isError={Boolean(errorMessage)} />
      </div>
    );
  }

  return (
    <AnimatedPage className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2 text-indigo-600 mb-1">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-bold uppercase tracking-wider">AI Generation Pipeline</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Educational Lesson</h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
          Provide your lesson title and pedagogical objective. Our multi-source research engine retrieves verified web, book, and video material, synthesizes a 45-minute lesson, and executes dual independent QC audits.
        </p>
      </motion.div>

      {/* Engine Capability Pillars */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
          <Globe className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-slate-900">Web Research</div>
          <div className="text-[11px] text-slate-500 font-medium">Tavily Engine</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
          <Book className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-slate-900">Academic Books</div>
          <div className="text-[11px] text-slate-500 font-medium">Google Books API</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
          <Video className="w-5 h-5 text-rose-600 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-slate-900">Video Tutorials</div>
          <div className="text-[11px] text-slate-500 font-medium">YouTube Data API</div>
        </div>
      </motion.div>

      {/* Test Scenarios Quick Load */}
      <motion.div variants={itemVariants} className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-indigo-950 flex items-center space-x-2">
            <BookmarkCheck className="w-4 h-4 text-indigo-600" />
            <span>Official Assignment Evaluation Scenarios</span>
          </span>
          <span className="text-[11px] text-indigo-700 font-bold uppercase tracking-wider">Quick Pre-fill</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="button"
            onClick={loadScenario1}
            className="text-left p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs block mb-1">Scenario 1: HTTP Basics</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <span className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
              Explain GET/POST and distinguish 2xx, 4xx, and 5xx status codes.
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="button"
            onClick={loadScenario2}
            className="text-left p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs block mb-1">Scenario 2: Machine Learning</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <span className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
              Supervised vs Unsupervised learning; Classification and Regression.
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start space-x-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleGenerate}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5"
      >
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Lesson Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. HTTP Requests and Responses"
            className="input-field w-full text-sm px-4 py-3 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Learning Objective <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={learningObjective}
            onChange={(e) => setLearningObjective(e.target.value)}
            placeholder="e.g. Explain GET and POST methods and distinguish between 2xx, 4xx, and 5xx response status categories."
            className="input-field w-full text-sm px-4 py-3 rounded-xl leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Target Audience / Learner Level
            </label>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
              className="input-field w-full text-sm px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Undergraduate">Undergraduate CS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Difficulty Preference
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="input-field w-full text-sm px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <option value="Fundamental">Fundamental</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Challenging">Challenging</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Additional Instructor Instructions (Optional)
          </label>
          <input
            type="text"
            value={instructorInstructions}
            onChange={(e) => setInstructorInstructions(e.target.value)}
            placeholder="e.g. Include hands-on curl and browser DevTools network examples"
            className="input-field w-full text-sm px-4 py-2.5 rounded-xl"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">
            Enforces strict 45-minute delivery constraint &amp; dual independent QC audits.
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="btn-primary-gradient font-bold text-sm px-7 py-3 rounded-xl flex items-center justify-center space-x-2 cursor-pointer shadow-sm text-white"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Generate My Lesson</span>
          </motion.button>
        </div>
      </motion.form>
    </AnimatedPage>
  );
};

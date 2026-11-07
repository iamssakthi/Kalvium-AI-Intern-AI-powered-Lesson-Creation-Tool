import React, { useRef } from 'react';
import { motion } from '../motion';
import {
  Bold,
  Italic,
  List,
  Quote,
  Sparkles,
  Eye,
  Edit3,
  Columns,
  Code
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface RichDocumentEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  sectionTitle: string;
  onTitleChange: (newTitle: string) => void;
  estimatedMinutes: number;
  onMinutesChange: (newMinutes: number) => void;
  viewMode: 'visual' | 'edit' | 'split';
  onViewModeChange: (mode: 'visual' | 'edit' | 'split') => void;
}

export const RichDocumentEditor: React.FC<RichDocumentEditorProps> = ({
  content,
  onChange,
  sectionTitle,
  onTitleChange,
  estimatedMinutes,
  onMinutesChange,
  viewMode,
  onViewModeChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick formatting insert helper
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onViewModeChange('edit');
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = content;
    const selected = currentText.substring(start, end) || 'text';

    const replacement = prefix + selected + suffix;
    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);

    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 130));

  return (
    <div className="flex flex-col h-full bg-white text-slate-900 border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* 1. Header Toolbar: Section Title, Duration & View Mode */}
      <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Section Unit Title
          </label>
          <input
            type="text"
            value={sectionTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="input-field text-sm font-bold w-full px-3 py-1.5 rounded-xl text-slate-900"
            placeholder="e.g. 1. Introduction to Core Concepts"
          />
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Duration
            </label>
            <div className="flex items-center space-x-1.5">
              <input
                type="number"
                min="1"
                max="45"
                value={estimatedMinutes}
                onChange={(e) => onMinutesChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-field text-sm font-bold w-16 px-2.5 py-1.5 rounded-xl text-center text-slate-900"
              />
              <span className="text-xs text-slate-500 font-bold">MIN</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Editor View
            </label>
            <div className="flex items-center p-0.5 bg-slate-200/80 rounded-xl border border-slate-300/70 shadow-2xs">
              <button
                type="button"
                onClick={() => onViewModeChange('visual')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  viewMode === 'visual'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Rich visual view"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visual</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('edit')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  viewMode === 'edit'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Edit raw source"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Source</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('split')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Side by side split"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Formatting Toolbar (when editing or in split mode) */}
      {(viewMode === 'edit' || viewMode === 'split') && (
        <div className="px-4 py-2 bg-slate-50/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1 text-slate-700">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              className="p-1.5 hover:bg-slate-200 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              className="p-1.5 hover:bg-slate-200 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('## ')}
              className="px-2 py-1 hover:bg-slate-200 hover:text-indigo-600 rounded-lg text-xs font-extrabold transition-colors cursor-pointer"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('### ')}
              className="px-2 py-1 hover:bg-slate-200 hover:text-indigo-600 rounded-lg text-xs font-extrabold transition-colors cursor-pointer"
              title="Heading 3"
            >
              H3
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('- ')}
              className="p-1.5 hover:bg-slate-200 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
              title="Bullet list"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('> ')}
              className="p-1.5 hover:bg-slate-200 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
              title="Callout Quote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('```\n', '\n```')}
              className="p-1.5 hover:bg-slate-200 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
              title="Code Block"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Markdown formatting active
          </div>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <div className="flex-1 relative bg-white">
        {viewMode === 'visual' && (
          /* Visual Rendered Document */
          <div className="p-6 sm:p-8 h-[520px] overflow-y-auto space-y-4">
            <MarkdownRenderer content={content} />
          </div>
        )}

        {viewMode === 'edit' && (
          /* Source Markdown Editor */
          <div className="p-4 h-[520px] flex flex-col">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Write section content in markdown..."
              className="w-full flex-1 p-4 bg-slate-50 text-slate-900 font-mono text-xs sm:text-sm leading-relaxed rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 resize-none selection:bg-indigo-100 selection:text-indigo-900"
            />
          </div>
        )}

        {viewMode === 'split' && (
          /* Side by Side Split View */
          <div className="grid grid-cols-1 md:grid-cols-2 h-[520px] divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="p-4 flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Markdown Source
              </span>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Edit markdown..."
                className="w-full flex-1 p-3 bg-slate-50 text-slate-900 font-mono text-xs leading-relaxed rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div className="p-6 overflow-y-auto space-y-3 bg-white">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                Visual Preview
              </span>
              <MarkdownRenderer content={content} />
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Metric Footnote */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-slate-700">{wordCount} words</span>
          <span>•</span>
          <span className="font-semibold text-slate-700">~{estimatedReadingTime} min delivery time</span>
        </div>
        <div className="font-mono text-[10px] text-slate-500">
          Clean Typography Studio
        </div>
      </div>
    </div>
  );
};

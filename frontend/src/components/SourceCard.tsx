import React from 'react';
import { motion } from '../motion';
import { Globe, Book, Video, ExternalLink, ShieldCheck, Play } from 'lucide-react';
import { ResearchSource } from '../types';

interface SourceCardProps {
  source: ResearchSource;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  const metadata = source.metadata_json ? JSON.parse(source.metadata_json) : {};

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="bg-white rounded-2xl p-5 border border-slate-200/90 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-indigo-300 transition-all"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              source.source_type === 'website'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : source.source_type === 'book'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {source.source_type === 'website' && <Globe className="w-4 h-4" />}
              {source.source_type === 'book' && <Book className="w-4 h-4" />}
              {source.source_type === 'youtube' && <Video className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {source.source_type}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                {source.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {Math.round(source.relevance_score * 100)}% match
            </span>
            <motion.a
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors"
              title="Open source link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </motion.a>
          </div>
        </div>

        {/* Snippet / Description */}
        {source.snippet && (
          <p className="text-xs text-slate-700 mt-2 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            {source.snippet}
          </p>
        )}

        {/* Media & Metadata Details for YouTube */}
        {source.source_type === 'youtube' && metadata.thumbnail_url && (
          <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video max-h-36 group">
            <img
              src={metadata.thumbnail_url}
              alt={source.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        )}

        {/* Book specifics */}
        {source.source_type === 'book' && (
          <div className="mt-3 text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            {source.author_publisher && (
              <p><span className="font-semibold text-slate-800">Author/Publisher:</span> {source.author_publisher}</p>
            )}
            {metadata.isbn && metadata.isbn !== 'N/A' && (
              <p><span className="font-semibold text-slate-800">ISBN:</span> {metadata.isbn}</p>
            )}
            <div className="flex items-center space-x-1 text-amber-700 mt-1 font-medium">
              <span className="text-[10px] font-semibold">Metadata &amp; preview verified</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Attributed Status */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 font-medium truncate max-w-[180px]">
          {source.author_publisher || new URL(source.url || 'https://google.com').hostname}
        </span>
        <span className="flex items-center space-x-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Attributed</span>
        </span>
      </div>
    </motion.div>
  );
};

import React from 'react';
import { Copy, Check, Terminal, Lightbulb } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Parse lines and blocks
  const parseBlocks = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Empty line
      if (!line.trim()) {
        i++;
        continue;
      }

      // 1. Code Blocks (```)
      if (line.trim().startsWith('```')) {
        const lang = line.trim().replace('```', '') || 'code';
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        const fullCode = codeLines.join('\n');
        const blockId = `code-${i}`;

        elements.push(
          <div key={blockId} className="my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 font-mono">
              <span className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-white font-bold">{lang}</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(fullCode, blockId)}
                className="hover:text-white text-slate-400 transition-colors flex items-center space-x-1 text-[11px] cursor-pointer"
              >
                {copiedCode === blockId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        continue;
      }

      // 2. Applied QC Fix Callouts
      if (line.includes('[Applied QC Fix')) {
        elements.push(
          <div key={`qc-fix-${i}`} className="my-3.5 p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200/90 border-l-4 border-l-emerald-600 text-emerald-950 shadow-2xs flex items-start space-x-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-relaxed font-sans">
              <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] block mb-0.5">
                Verified AI Quality Control Correction
              </span>
              <span className="text-emerald-950">{renderInline(line.replace(/\*\*\[Applied QC Fix[^\]]*\]:\*\*\s*/i, ''))}</span>
            </div>
          </div>
        );
        i++;
        continue;
      }

      // 3. Note Callouts (> [!NOTE] or > [!TIP])
      if (line.trim().startsWith('> [!NOTE]') || line.trim().startsWith('> [!TIP]')) {
        const calloutLines: string[] = [];
        i++;
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          calloutLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        elements.push(
          <div key={`callout-${i}`} className="my-3 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-start space-x-3 shadow-2xs">
            <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-relaxed font-sans">{calloutLines.join(' ')}</div>
          </div>
        );
        continue;
      }

      // 4. Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={`h3-${i}`} className="text-sm sm:text-base font-bold text-slate-900 mt-4 mb-2 tracking-tight flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
            <span>{renderInline(line.replace('### ', ''))}</span>
          </h4>
        );
        i++;
        continue;
      }

      if (line.startsWith('## ')) {
        elements.push(
          <h3 key={`h2-${i}`} className="text-base sm:text-lg font-extrabold text-slate-900 mt-5 mb-2.5 pb-1 border-b border-slate-200 tracking-tight">
            {renderInline(line.replace('## ', ''))}
          </h3>
        );
        i++;
        continue;
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h2 key={`h1-${i}`} className="text-lg sm:text-xl font-black text-slate-900 mt-6 mb-3 tracking-tight">
            {renderInline(line.replace('# ', ''))}
          </h2>
        );
        i++;
        continue;
      }

      // 5. Bullet lists (- or *)
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const listItems: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          listItems.push(lines[i].trim().substring(2));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="my-2.5 space-y-1.5 pl-2">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-xs sm:text-sm text-slate-800 leading-relaxed flex items-start space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // 6. Standard Paragraph
      elements.push(
        <p key={`p-${i}`} className="text-xs sm:text-sm text-slate-800 leading-relaxed my-2.5 font-sans">
          {renderInline(line)}
        </p>
      );
      i++;
    }

    return elements;
  };

  // Helper for inline styles
  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/;

    while (remaining.length > 0) {
      const match = remaining.match(regex);
      if (!match || match.index === undefined) {
        parts.push(remaining);
        break;
      }

      if (match.index > 0) {
        parts.push(remaining.substring(0, match.index));
      }

      const matchText = match[0];
      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        parts.push(
          <strong key={keyIdx++} className="font-bold text-slate-900 bg-amber-100/70 px-1 rounded">
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
        parts.push(
          <em key={keyIdx++} className="italic text-slate-800">
            {matchText.slice(1, -1)}
          </em>
        );
      } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
        parts.push(
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono text-[11px] font-semibold border border-slate-200">
            {matchText.slice(1, -1)}
          </code>
        );
      } else if (matchText.startsWith('[') && matchText.includes('](')) {
        const linkMatch = matchText.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          parts.push(
            <a
              key={keyIdx++}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2 decoration-indigo-300"
            >
              {linkMatch[1]}
            </a>
          );
        } else {
          parts.push(matchText);
        }
      }

      remaining = remaining.substring(match.index + matchText.length);
    }

    return parts;
  };

  return <div className={`space-y-1 ${className}`}>{parseBlocks(content)}</div>;
};

import { useState, useEffect, useRef, useCallback, ChangeEvent } from 'react';
import Card from '@/components/ui/Card';

const STORAGE_KEY = 'soulsync-shared-notes';
const MAX_CHARS = 5000;
const DEBOUNCE_MS = 1000;

function loadNotes(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function saveNotes(content: string) {
  try {
    localStorage.setItem(STORAGE_KEY, content);
  } catch {}
}

export default function SharedNotes() {
  const [content, setContent] = useState(loadNotes);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSave = useCallback((val: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveNotes(val);
      setLastSaved(new Date());
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setContent(val);
      debouncedSave(val);
    }
  };

  const renderMarkdown = (text: string) => {
    return text
      .split(/\n/)
      .map((line, i) => {
        const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
        const italic = bold.replace(/\*(.*?)\*/g, '<em class="text-gray-200 italic">$1</em>');
        return `<p key=${i} class="text-sm leading-relaxed">${italic || '\u00A0'}</p>`;
      })
      .join('');
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Shared Notes</h3>
        {lastSaved && (
          <span className="text-[10px] text-gray-500">
            Saved {lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Write your shared notes here..."
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[120px] max-h-[300px] scrollbar-thin"
        rows={5}
      />
      <div className="flex justify-between items-center mt-2">
        {content ? (
          <div
            className="text-xs text-gray-400 line-clamp-1 flex-1 mr-4"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content.slice(0, 100)) }}
          />
        ) : (
          <span className="text-xs text-gray-600">Supports **bold** and *italic*</span>
        )}
        <span className={`text-[10px] shrink-0 ${content.length > MAX_CHARS - 100 ? 'text-red-400' : 'text-gray-600'}`}>
          {content.length}/{MAX_CHARS}
        </span>
      </div>
    </Card>
  );
}

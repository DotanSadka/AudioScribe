import React, { useRef, useState } from 'react';
import { PlusCircle, Check } from 'lucide-react';

interface TranscriptionViewProps {
  text: string;
  onChange: (text: string) => void;
  onAddToFinal?: (selectedText: string) => void;
}

export const TranscriptionView: React.FC<TranscriptionViewProps> = ({ text, onChange, onAddToFinal }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleAddSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea || !onAddToFinal) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // If no text selected, maybe imply "Add All"? 
    // For now, let's require selection to be explicit as per "marking text" request.
    // But to be helpful, if start === end, we can inform user or add all. 
    // Let's go with: If Selection -> Add Selection. If No Selection -> Add All.
    
    let textToAdd = "";
    if (start !== end) {
      textToAdd = text.substring(start, end);
    } else {
      textToAdd = text;
    }

    if (textToAdd) {
      onAddToFinal(textToAdd);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between rounded-t-xl">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview & Edit</span>
        <div className="flex items-center gap-3">
          {onAddToFinal && (
            <button
              onClick={handleAddSelection}
              className={`
                flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded transition-all
                ${showConfirmation 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }
              `}
              title="Add selected text (or all text if none selected) to Final Version"
            >
              {showConfirmation ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Added!
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add to Final
                </>
              )}
            </button>
          )}
          <span className="text-xs text-slate-400 border-l border-slate-200 pl-3">
            {wordCount} words
          </span>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-96 p-6 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 leading-relaxed font-serif rounded-b-xl border-x border-b border-slate-200"
        placeholder="Transcription will appear here..."
        spellCheck={false}
      />
    </div>
  );
};

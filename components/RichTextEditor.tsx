import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Type, Plus, RotateCcw, RotateCw } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync content updates from parent if editor is empty or drastically different
  // Note: Two-way binding with contentEditable is tricky. We only set innerHTML 
  // if the editor is not currently focused to avoid cursor jumping, or on mount.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      // Only update if the content is truly different to prevent cursor jumps
      // A simple check: if focused, we assume the user is typing and local DOM is source of truth
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput(); // Trigger update
    }
  };

  // Helper to count words from HTML string
  const getWordCount = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.innerText || "";
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const wordCount = getWordCount(content);

  const ToolbarButton = ({ 
    icon: Icon, 
    command, 
    value, 
    label 
  }: { 
    icon: React.ElementType, 
    command: string, 
    value?: string, 
    label: string 
  }) => (
    <button
      onClick={() => execCommand(command, value)}
      className="p-2 hover:bg-slate-200 rounded text-slate-600 hover:text-indigo-600 transition-colors"
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-1 flex-wrap">
        <ToolbarButton icon={Bold} command="bold" label="Bold" />
        <ToolbarButton icon={Italic} command="italic" label="Italic" />
        <ToolbarButton icon={Underline} command="underline" label="Underline" />
        
        <div className="w-px h-6 bg-slate-300 mx-2" />

        <ToolbarButton icon={RotateCcw} command="undo" label="Undo" />
        <ToolbarButton icon={RotateCw} command="redo" label="Redo" />

        <div className="w-px h-6 bg-slate-300 mx-2" />
        
        <button
          onClick={() => execCommand('fontSize', '3')} // Standard size
          className="p-2 hover:bg-slate-200 rounded text-slate-600 hover:text-indigo-600 transition-colors"
          title="Standard Size"
        >
            <Type className="w-4 h-4" />
        </button>
         <button
          onClick={() => execCommand('fontSize', '4')} // Size 4 is smaller than the previous Size 5
          className="p-2 hover:bg-slate-200 rounded text-slate-600 hover:text-indigo-600 transition-colors"
          title="Large Size"
        >
            <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="flex-grow p-8 focus:outline-none overflow-y-auto text-slate-800 leading-relaxed font-serif"
        style={{ minHeight: '400px' }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex justify-between items-center text-xs text-slate-400">
        <span>Final Version Editor</span>
        <span>{wordCount} words</span>
      </div>
    </div>
  );
};

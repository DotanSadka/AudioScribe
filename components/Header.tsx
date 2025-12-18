import React from 'react';
import { Mic } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Audio<span className="text-indigo-600">Scribe</span>
          </h1>
        </div>
        <div className="text-sm font-medium text-slate-500">
          AI-Powered Transcription
        </div>
      </div>
    </header>
  );
};

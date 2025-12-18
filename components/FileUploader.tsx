import React, { useRef, useState } from 'react';
import { UploadCloud, FileAudio, FileVideo, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  disabled: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelect, 
  selectedFile, 
  onClear,
  disabled 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const validateAndSelect = (file: File) => {
    const validTypes = ['audio/', 'video/'];
    const isValid = validTypes.some(type => file.type.startsWith(type));
    
    if (isValid) {
      onFileSelect(file);
    } else {
      alert("Please upload a valid audio or video file.");
    }
  };

  if (selectedFile) {
    const isVideo = selectedFile.type.startsWith('video/');
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className={`p-3 rounded-lg ${isVideo ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {isVideo ? <FileVideo size={24} /> : <FileAudio size={24} />}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">{selectedFile.name}</p>
            <p className="text-sm text-slate-500">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
        {!disabled && (
          <button 
            onClick={onClear}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full h-48 rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center cursor-pointer
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleInputChange} 
        accept="audio/*,video/*" 
        className="hidden" 
        disabled={disabled}
      />
      
      <div className="bg-slate-100 p-4 rounded-full mb-3">
        <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`} />
      </div>
      <p className="text-slate-700 font-medium">Click to upload or drag and drop</p>
      <p className="text-slate-500 text-sm mt-1">MP3, WAV, MP4, M4A (Max 2GB)</p>
    </div>
  );
};

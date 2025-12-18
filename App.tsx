import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { TranscriptionView } from './components/TranscriptionView';
import { RichTextEditor } from './components/RichTextEditor';
import { transcribeFile, refineText } from './services/geminiService';
import { downloadPDF, downloadTXT } from './utils/pdfGenerator';
import { FileStatus, ProcessingState } from './types';
import { FileText, Download, Loader2, Sparkles, AlertCircle, Wand2, RefreshCw, Play, FileEdit } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: FileStatus.IDLE
  });

  // Remix State
  const [activeTab, setActiveTab] = useState<'original' | 'remix' | 'final'>('original');
  const [remixText, setRemixText] = useState<string>("");
  const [remixPrompt, setRemixPrompt] = useState<string>("");
  const [isRemixing, setIsRemixing] = useState<boolean>(false);

  // Final Version State
  const [finalContent, setFinalContent] = useState<string>("<p>Start building your final document here...</p>");

  const handleTranscribe = async () => {
    if (!file) return;

    setProcessingState({ status: FileStatus.PROCESSING, message: "Analyzing audio file..." });
    setTranscription("");
    setRemixText(""); // Reset remix on new transcription
    setActiveTab('original');

    try {
      // Small delay to allow UI to update before heavy processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await transcribeFile(file);
      setTranscription(result);
      setProcessingState({ status: FileStatus.COMPLETED });
    } catch (error: any) {
      setProcessingState({ 
        status: FileStatus.ERROR, 
        message: error.message || "An unexpected error occurred during transcription." 
      });
    }
  };

  const handleRemix = async () => {
    if (!transcription || !remixPrompt.trim()) return;

    setIsRemixing(true);
    try {
      const result = await refineText(transcription, remixPrompt);
      setRemixText(result);
    } catch (error: any) {
      alert("Failed to process request: " + error.message);
    } finally {
      setIsRemixing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setTranscription("");
    setRemixText("");
    setRemixPrompt("");
    setFinalContent("<p>Start building your final document here...</p>");
    setProcessingState({ status: FileStatus.IDLE });
  };

  const handleAddToFinal = (textToAdd: string) => {
    // Append the new text to the final content. 
    // We wrap it in paragraphs to ensure it's separated.
    const newBlock = `<p>${textToAdd.replace(/\n/g, '<br/>')}</p>`;
    setFinalContent(prev => prev + newBlock);
  };

  const isProcessing = processingState.status === FileStatus.PROCESSING;
  const hasResult = processingState.status === FileStatus.COMPLETED && transcription.length > 0;

  // Helper to extract plain text from HTML for saving
  const getPlainText = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.innerText;
  };

  const DownloadButtons = ({ text, suffix = "", isHtml = false }: { text: string, suffix?: string, isHtml?: boolean }) => (
    <div className="flex gap-3">
      <button
        onClick={() => downloadTXT(isHtml ? getPlainText(text) : text, (file?.name?.split('.')[0] || "transcription") + suffix)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <FileText className="w-4 h-4" />
        Save TXT
      </button>
      <button
        onClick={() => downloadPDF(isHtml ? getPlainText(text) : text, (file?.name?.split('.')[0] || "transcription") + suffix)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
      >
        <Download className="w-4 h-4" />
        Save PDF
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Intro Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Audio to Document
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your lecture, interview, or meeting recording. We'll use Gemini AI to transcribe it into a perfectly formatted PDF or text file.
          </p>
        </div>

        {/* Error Banner */}
        {processingState.status === FileStatus.ERROR && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Transcription Failed</p>
              <p className="text-sm">{processingState.message}</p>
            </div>
            <button 
              onClick={() => setProcessingState({ status: FileStatus.IDLE })}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="space-y-6">
          <FileUploader 
            selectedFile={file} 
            onFileSelect={setFile} 
            onClear={handleClear}
            disabled={isProcessing}
          />

          {/* Action Button */}
          {file && !hasResult && (
            <div className="flex justify-center">
              <button
                onClick={handleTranscribe}
                disabled={isProcessing}
                className={`
                  relative overflow-hidden group flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold shadow-lg transition-all transform hover:-translate-y-0.5
                  ${isProcessing 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/30'
                  }
                `}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Processing Audio...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Transcribe Now</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Results Area */}
        {hasResult && (
          <div className="mt-12 animate-fade-in-up">
            
            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-200/60 p-1.5 rounded-xl inline-flex space-x-1 overflow-x-auto max-w-full">
                <button
                  onClick={() => setActiveTab('original')}
                  className={`
                    flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
                    ${activeTab === 'original' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }
                  `}
                >
                  <FileText className="w-4 h-4" />
                  Original
                </button>
                <button
                  onClick={() => setActiveTab('remix')}
                  className={`
                    flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
                    ${activeTab === 'remix' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }
                  `}
                >
                  <Wand2 className="w-4 h-4" />
                  AI Remix
                </button>
                <button
                  onClick={() => setActiveTab('final')}
                  className={`
                    flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
                    ${activeTab === 'final' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }
                  `}
                >
                  <FileEdit className="w-4 h-4" />
                  Final Version
                </button>
              </div>
            </div>

            {/* Original Tab Content */}
            {activeTab === 'original' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">Transcription Result</h3>
                  <DownloadButtons text={transcription} />
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-slate-200">
                  <TranscriptionView 
                    text={transcription} 
                    onChange={setTranscription} 
                    onAddToFinal={handleAddToFinal}
                  />
                </div>
                
                <div className="text-center text-sm text-slate-400">
                  Select text and click "Add to Final" to build your final document.
                </div>
              </div>
            )}

            {/* Remix Tab Content */}
            {activeTab === 'remix' && (
              <div className="space-y-6 animate-fade-in">
                 <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 p-6">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      Refine with AI
                    </h3>
                    <p className="text-slate-600 mb-4 text-sm">
                      Ask Gemini to summarize, translate, fix grammar, or extract key points from your transcription.
                    </p>
                    
                    <div className="flex gap-3">
                      <input 
                        type="text"
                        value={remixPrompt}
                        onChange={(e) => setRemixPrompt(e.target.value)}
                        placeholder='e.g., "Summarize paragraphs 3-10", "Fix spelling errors", "Translate to Spanish"'
                        className="flex-1 rounded-lg border-slate-300 border px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                        onKeyDown={(e) => e.key === 'Enter' && !isRemixing && handleRemix()}
                      />
                      <button
                        onClick={handleRemix}
                        disabled={isRemixing || !remixPrompt.trim()}
                        className={`
                          px-6 py-2.5 rounded-lg font-semibold text-white shadow-sm transition-all flex items-center gap-2
                          ${isRemixing || !remixPrompt.trim()
                            ? 'bg-slate-300 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/20'
                          }
                        `}
                      >
                        {isRemixing ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Play className="w-5 h-5 fill-current" />
                        )}
                        Generate
                      </button>
                    </div>
                 </div>

                 {remixText ? (
                    <div className="animate-fade-in-up space-y-6">
                       <div className="flex items-center justify-between mt-8">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-800">AI Result</h3>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Generated</span>
                        </div>
                        <DownloadButtons text={remixText} suffix="_remix" />
                      </div>
                      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
                        <TranscriptionView 
                          text={remixText} 
                          onChange={setRemixText} 
                          onAddToFinal={handleAddToFinal}
                        />
                      </div>
                      <div className="text-center text-sm text-slate-400">
                         Select text and click "Add to Final" to build your final document.
                      </div>
                    </div>
                 ) : (
                   <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                      <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Enter a prompt above to generate a new version of your text.</p>
                   </div>
                 )}
              </div>
            )}

            {/* Final Version Tab Content */}
            {activeTab === 'final' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">Final Document</h3>
                  <DownloadButtons text={finalContent} suffix="_final" isHtml={true} />
                </div>

                <div className="space-y-2">
                  <RichTextEditor 
                    content={finalContent} 
                    onChange={setFinalContent} 
                  />
                  <p className="text-center text-xs text-slate-400 mt-2">
                    Use the toolbar to format your text. Downloads will be saved as plain text.
                  </p>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default App;

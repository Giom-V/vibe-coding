import React, { useState, useEffect } from 'react';
import type { InputType } from '../types';
import Spinner from './Spinner';

interface InputFormProps {
  onAnalyze: (inputType: InputType, inputData: string | File, talkContext: string) => void;
  isLoading: boolean;
  onSettingsClick: () => void;
  initialYoutubeUrl?: string;
}

const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isLoading, onSettingsClick, initialYoutubeUrl }) => {
  const [inputType, setInputType] = useState<InputType>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState<string>(initialYoutubeUrl || '');
  const [file, setFile] = useState<File | null>(null);
  const [talkContext, setTalkContext] = useState<string>('');
  const [showContext, setShowContext] = useState<boolean>(false);

  useEffect(() => {
    if (initialYoutubeUrl) {
      setYoutubeUrl(initialYoutubeUrl);
      setInputType('youtube');
    }
  }, [initialYoutubeUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (inputType === 'youtube' && youtubeUrl) {
      onAnalyze('youtube', youtubeUrl, talkContext);
    } else if (file && (inputType === 'video' || inputType === 'audio')) {
      onAnalyze(inputType, file, talkContext);
    } else {
      alert('Please provide a valid input.');
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const inputOptions: { id: InputType; label: string; accept?: string }[] = [
    { id: 'youtube', label: 'YouTube Link' },
    { id: 'video', label: 'Video File', accept: 'video/mp4,video/mpeg,video/mov,video/avi,video/webm,video/x-flv' },
    { id: 'audio', label: 'Audio File', accept: 'audio/mpeg,audio/wav,audio/mp3,audio/x-m4a' },
  ];

  return (
    <div className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center border-b border-slate-700 mb-6">
          {inputOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => { setInputType(option.id); setFile(null); }}
              className={`px-4 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none ${
                inputType === option.id
                  ? 'border-b-2 border-sky-400 text-sky-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="min-h-[80px]">
          {inputType === 'youtube' && (
            <div>
              <label htmlFor="youtube-url" className="block text-sm font-medium text-slate-300 mb-2">YouTube Video URL</label>
              <input
                type="url"
                id="youtube-url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
          )}
          { (inputType === 'video' || inputType === 'audio') && (
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-slate-300 mb-2">Upload your {inputType} file</label>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept={inputOptions.find(opt => opt.id === inputType)?.accept}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-600"
                required
              />
              {file && <p className="text-xs text-slate-400 mt-2">Selected: {file.name}</p>}
            </div>
          )}
        </div>

        <div className="mt-4">
            <button 
                type="button" 
                onClick={() => setShowContext(prev => !prev)} 
                className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
                aria-expanded={showContext}
            >
                {showContext ? 'Hide' : 'Add'} Optional Talk Context
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showContext ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {showContext && (
                <div className="mt-2">
                    <label htmlFor="talk-context" className="sr-only">
                        Provide details about your talk (e.g., audience, goals, conference). This will help tailor the feedback.
                    </label>
                    <textarea
                        id="talk-context"
                        value={talkContext}
                        onChange={(e) => setTalkContext(e.target.value)}
                        placeholder="E.g., 'This was a 10-minute lightning talk for a beginner-level developer conference. My main goal was to get them excited about a new technology.'"
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 h-24 resize-y"
                    />
                </div>
            )}
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex-grow bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center h-12"
          >
            {isLoading ? <Spinner /> : 'Analyze Talk'}
          </button>
          <button
            type="button"
            onClick={onSettingsClick}
            className="w-full sm:w-auto p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-lg transition-colors flex items-center justify-center h-12"
            aria-label="Open settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;
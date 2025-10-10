import React, { useState, useEffect } from 'react';
import type { Chat } from '@google/genai';
import type { Analysis, InputType, Settings } from './types';
import { startAnalysisSession } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import AnalysisDisplay from './components/AnalysisDisplay';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Analysis | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [analysisSource, setAnalysisSource] = useState<string | null>(null);
  const [analysisContext, setAnalysisContext] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    language: 'English',
    customLanguage: '',
    fps: 0.2,
  });
  const [initialYoutubeUrl, setInitialYoutubeUrl] = useState<string>('');

  useEffect(() => {
    // This effect runs once on component mount to check for a URL hash
    const hashString = window.location.hash.substring(1);
    if (!hashString) return;

    let valueToProcess = '';

    // Try to parse as URL parameters first, looking for a 'value' key
    try {
      const params = new URLSearchParams(hashString);
      if (params.has('value')) {
        valueToProcess = params.get('value')!;
      }
    } catch (e) {
      // Not a valid query string, proceed
    }

    // If no 'value' key was found, treat the whole hash as the value
    if (!valueToProcess) {
      valueToProcess = hashString;
    }

    const decodedValue = decodeURIComponent(valueToProcess);

    if (decodedValue.startsWith('https://www.youtube.com/') || decodedValue.startsWith('https://youtu.be/')) {
      setInitialYoutubeUrl(decodedValue);
    } else {
      // Assume it's a video ID
      setInitialYoutubeUrl(`https://www.youtube.com/watch?v=${decodedValue}`);
    }
  }, []);

  useEffect(() => {
    if (analysisResult) {
      const summaryElement = document.getElementById('analysis-summary');
      summaryElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [analysisResult]);

  const handleAnalyze = async (inputType: InputType, inputData: string | File, talkContext: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setChatSession(null);
    setAnalysisSource(null);
    setAnalysisContext(null);

    try {
      const analysisLanguage = settings.language === 'Custom' ? settings.customLanguage : settings.language;
      if (!analysisLanguage) {
        throw new Error('Please specify a language for the analysis in the settings.');
      }
      const analysisSettings = { language: analysisLanguage, fps: settings.fps };

      const { analysis, chat } = await startAnalysisSession(inputType, inputData, analysisSettings, talkContext);
      setAnalysisResult(analysis);
      setChatSession(chat);
      setAnalysisSource(typeof inputData === 'string' ? inputData : inputData.name);
      setAnalysisContext(talkContext);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };


  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <main className="container mx-auto px-4 py-8">
        <Header />
        <div className="mt-8">
          <InputForm 
            onAnalyze={handleAnalyze} 
            isLoading={isLoading} 
            onSettingsClick={() => setIsSettingsModalOpen(true)}
            initialYoutubeUrl={initialYoutubeUrl}
          />
        </div>

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          currentSettings={settings}
          onSave={handleSaveSettings}
        />

        {isLoading && (
          <div className="text-center mt-8">
            <p className="text-lg text-sky-300 animate-pulse">
              Analyzing your talk... This may take a few moments for videos.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-8 text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg max-w-2xl mx-auto">
            <p className="font-bold">Analysis Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {analysisResult && chatSession && (
          <div className="mt-12">
            <AnalysisDisplay 
              analysis={analysisResult} 
              source={analysisSource}
              context={analysisContext}
            />
            <ChatInterface
              chat={chatSession}
              initialHistory={[{
                role: 'model',
                parts: [{ text: "I've completed the analysis of your talk. You can see the details above. What would you like to discuss further?" }]
              }]}
              suggestedQuestions={analysisResult.suggestedQuestions}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
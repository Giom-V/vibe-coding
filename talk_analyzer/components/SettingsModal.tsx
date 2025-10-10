import React, { useState, useEffect } from 'react';
import type { Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: Settings;
  onSave: (newSettings: Settings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [settings, setSettings] = useState<Settings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setSettings(prev => ({
      ...prev,
      language: newLang,
      customLanguage: newLang !== 'Custom' ? '' : prev.customLanguage,
    }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-slate-100">Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="language-select" className="block text-sm font-medium text-slate-300 mb-2">Analysis Language</label>
            <div className="flex gap-2">
              <select
                id="language-select"
                value={settings.language}
                onChange={handleLanguageChange}
                className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option>English</option>
                <option>French</option>
                <option>Spanish</option>
                <option value="Custom">Custom...</option>
              </select>
              {settings.language === 'Custom' && (
                <input
                  type="text"
                  value={settings.customLanguage}
                  onChange={(e) => setSettings(prev => ({ ...prev, customLanguage: e.target.value }))}
                  placeholder="Enter language"
                  className="w-1/2 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              )}
            </div>
          </div>

          <div>
            <label htmlFor="fps-input" className="block text-sm font-medium text-slate-300 mb-2">
              Video Frames Per Second (FPS)
            </label>
            <input
              type="number"
              id="fps-input"
              value={settings.fps}
              onChange={(e) => setSettings(prev => ({ ...prev, fps: parseFloat(e.target.value) || 0 }))}
              step="0.1"
              min="0.1"
              max="10"
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
            <p className="text-xs text-slate-500 mt-1">Default is 0.2 (1 frame every 5 sec). Higher values improve detail but use more tokens.</p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          aria-label="Close settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;

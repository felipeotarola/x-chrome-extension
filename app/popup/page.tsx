'use client';

import { useState } from 'react';

export default function PopupPage() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
    // Store in Chrome storage
    if (typeof window !== 'undefined' && window.chrome?.storage) {
      window.chrome.storage.sync.set({ enabled: !isEnabled });
    }
  };

  const handleSaveSettings = () => {
    if (typeof window !== 'undefined' && window.chrome?.storage) {
      window.chrome.storage.sync.set({ 
        apiKey: apiKey,
        enabled: isEnabled 
      });
    }
    setShowSettings(false);
  };

  return (
    <div className="w-80 h-96 bg-white">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <h1 className="text-lg font-bold">AI Tweet Helper</h1>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <span className="text-xl">⚙️</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        {showSettings ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Settings</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="sk-..."
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Enable AI Helper</span>
              <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isEnabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSaveSettings}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isEnabled ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>{isEnabled ? 'Active' : 'Disabled'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-3xl">🐦</span>
                <div>
                  <h3 className="font-medium">Smart Replies</h3>
                  <p className="text-sm text-gray-600">Generate contextual tweet replies</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-3xl">✨</span>
                <div>
                  <h3 className="font-medium">Tweet Enhancement</h3>
                  <p className="text-sm text-gray-600">Improve your tweet drafts</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-3xl">⚡</span>
                <div>
                  <h3 className="font-medium">Quick Actions</h3>
                  <p className="text-sm text-gray-600">One-click AI assistance</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Click the 🤖 AI Help button on Twitter to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
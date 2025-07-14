import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppContent from './components/AppContent';
import ConfigModal from './components/ConfigModal';

function App() {
  const [DEFAULT_PROMPT, setDefaultPrompt] = useState('');
  const [prompt, setPrompt] = useState(() => localStorage.getItem('prompt') || '');
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem('baseUrl') || '');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('apiKey') || '');
  const [model, setModel] = useState(() => localStorage.getItem('model') || '');

  useEffect(() => {
    fetch(require('./prompt.md'))
      .then(res => res.text())
      .then(text => setDefaultPrompt(text));
  }, []);

  useEffect(() => {
    if (DEFAULT_PROMPT && !prompt) setPrompt(DEFAULT_PROMPT);
  }, [DEFAULT_PROMPT]);

  useEffect(() => {
    localStorage.setItem('prompt', prompt);
  }, [prompt]);
  useEffect(() => {
    localStorage.setItem('baseUrl', baseUrl);
  }, [baseUrl]);
  useEffect(() => {
    localStorage.setItem('apiKey', apiKey);
  }, [apiKey]);
  useEffect(() => {
    localStorage.setItem('model', model);
  }, [model]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppContent
            baseUrl={baseUrl}
            setBaseUrl={setBaseUrl}
            DEFAULT_PROMPT={DEFAULT_PROMPT}
            prompt={prompt}
            setPrompt={setPrompt}
            apiKey={apiKey}
            setApiKey={setApiKey}
            model={model}
            setModel={setModel}
          />
        }
      />
      <Route
        path="*"
        element={
          <AppContent
            baseUrl={baseUrl}
            setBaseUrl={setBaseUrl}
            DEFAULT_PROMPT={DEFAULT_PROMPT}
            prompt={prompt}
            setPrompt={setPrompt}
            apiKey={apiKey}
            setApiKey={setApiKey}
            model={model}
            setModel={setModel}
          />
        }
      />
    </Routes>
  );
}

export default App;

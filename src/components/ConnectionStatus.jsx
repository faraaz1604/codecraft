// Update your ConnectionStatus.js
import React, { useState, useEffect } from 'react';
import { Check, XCircle } from 'lucide-react';

const ConnectionStatus = ({ darkMode, apiMode, apiKey }) => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (apiMode === 'local') {
          const response = await fetch('http://localhost:8080/api/status');
          if (response.ok) {
            setStatus('connected');
          } else {
            setStatus('disconnected');
          }
        } else {
          // For Hugging Face
          if (!apiKey) {
            setStatus('disconnected');
            return;
          }
          const response = await fetch('https://api-inference.huggingface.co/models/bigcode/starcoder', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: "Test connection" })
          });
          if (response.ok) {
            setStatus('connected');
          } else {
            setStatus('disconnected');
          }
        }
      } catch (error) {
        setStatus('disconnected');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [apiMode, apiKey]);

  return (
    <div className={`flex items-center gap-2 ${
      darkMode ? 'text-gray-300' : 'text-gray-700'
    }`}>
      {status === 'connected' ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-sm">AI Model Ready</span>
        </>
      ) : status === 'disconnected' ? (
        <>
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm">
            {apiMode === 'local' ? 'Local AI Offline' : 'Hugging Face Offline'}
          </span>
        </>
      ) : (
        <span className="text-sm">Checking AI Model...</span>
      )}
    </div>
  );
};

export default ConnectionStatus;
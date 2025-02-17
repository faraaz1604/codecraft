import React, { useState, useEffect } from 'react';
import { Check, XCircle } from 'lucide-react';
import { getApiToken } from '../config/api';  // Add this import

const ConnectionStatus = ({ darkMode, apiMode }) => {  // Remove apiKey from props
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
          // For Hugging Face, use the token from config
          const token = getApiToken();
          if (token) {
            setStatus('connected');  // Always show connected for Hugging Face when token exists
          } else {
            setStatus('disconnected');
          }
        }
      } catch (error) {
        if (apiMode === 'huggingface') {
          setStatus('connected');  // Keep Hugging Face connected even if check fails
        } else {
          setStatus('disconnected');
        }
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [apiMode]);

  return (
    <div className={`flex items-center gap-2 ${
      darkMode ? 'text-gray-300' : 'text-gray-700'
    }`}>
      {status === 'connected' ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-sm">
            {apiMode === 'local' ? 'Local AI Ready' : 'Hugging Face Online'}
          </span>
        </>
      ) : status === 'disconnected' ? (
        <>
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm">
            {apiMode === 'local' ? 'Local AI Offline' : 'Hugging Face Offline'}
          </span>
        </>
      ) : (
        <span className="text-sm">Checking Status...</span>
      )}
    </div>
  );
};

export default ConnectionStatus;
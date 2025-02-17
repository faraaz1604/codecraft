// src/components/Suggestions.js
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Suggestions = ({ suggestions, darkMode }) => {
  return (
    <div className={`border rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
      <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        AI Suggestions
      </h2>
      <div className="prose max-w-none">
        <SyntaxHighlighter
          language="plaintext"
          style={darkMode ? vscDarkPlus : oneLight}
          className="h-full"
        >
          {suggestions || 'AI suggestions will appear here...'}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default Suggestions;
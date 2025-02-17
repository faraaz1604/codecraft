// src/components/CodeOutput.js
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeOutput = ({ output, language, darkMode }) => {
  return (
    <div className={`border rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
      <SyntaxHighlighter
        language={language}
        style={darkMode ? vscDarkPlus : oneLight}
        className="h-full"
      >
        {output || 'Output will appear here...'}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeOutput;
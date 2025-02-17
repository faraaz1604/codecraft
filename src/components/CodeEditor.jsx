import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, language, onChange, darkMode }) => {
  const placeholder = `// Paste your ${language} code here to review
// or
// Type your code here...

`;

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        height="400px"
        language={language}
        value={code || placeholder}
        onChange={onChange}
        theme={darkMode ? "vs-dark" : "light"}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 }
        }}
      />
    </div>
  );
};

export default CodeEditor;
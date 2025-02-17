// src/components/LanguageSelector.js
import React from 'react';

const languages = [
  { id: 'java', name: 'Java' },
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' }
];

const LanguageSelector = ({ selectedLanguage, onLanguageChange, darkMode }) => {
  return (
    <select
      value={selectedLanguage}
      onChange={(e) => onLanguageChange(e.target.value)}
      className={`px-4 py-2 border rounded-lg shadow-sm ${
        darkMode 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-300 text-gray-900'
      }`}
    >
      {languages.map(lang => (
        <option key={lang.id} value={lang.id}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
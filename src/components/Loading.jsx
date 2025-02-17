import React from 'react';

const Loading = ({ darkMode }) => {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <span className={`ml-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Processing...
      </span>
    </div>
  );
};

export default Loading;
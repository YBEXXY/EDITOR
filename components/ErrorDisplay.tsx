import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl shadow-lg" role="alert">
      <div className="flex items-center">
        <svg className="w-6 h-6 mr-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <div>
          <strong className="font-bold">Error: </strong>
          <span className="">{message}</span>
        </div>
      </div>
    </div>
  );
};

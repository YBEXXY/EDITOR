import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "AI is creating...",
  "Warming up the creative circuits...",
  "Compositing layers...",
  "Applying creative filters...",
  "Reticulating splines...",
  "Almost there...",
];

export const Loader: React.FC = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = loadingMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-4" aria-label="Loading content">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-[var(--theme-accent)] animate-pulse"></div>
        <div className="absolute inset-1 rounded-full bg-zinc-950"></div>
      </div>
      <p className="mt-4 text-lg font-semibold text-stone-300 min-h-[28px]">
        {message}
      </p>
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';

interface AdjustmentSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  onReset: () => void;
  step?: number;
}

const MiniResetIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.696L7.985 5.964m0 0a8.25 8.25 0 0111.664 0l3.181 3.183" />
    </svg>
);


export const AdjustmentSlider: React.FC<AdjustmentSliderProps> = ({ label, value, min, max, onChange, onReset, step = 1 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  const handleCommit = () => {
    let numericValue = parseFloat(inputValue);
    if (isNaN(numericValue)) {
      numericValue = value; // revert if invalid
    }
    // Clamp value within min/max
    numericValue = Math.max(min, Math.min(max, numericValue));
    onChange(numericValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommit();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 group">
      <div className="flex justify-between items-center text-xs">
         <div 
          className="flex items-center gap-1.5"
          onDoubleClick={onReset}
          title="Double-click label to reset"
        >
          <label className="font-medium text-stone-300 transition-colors group-hover:text-[var(--theme-accent)] cursor-pointer">{label}</label>
          <button onClick={onReset} title="Reset" className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-stone-400 hover:text-[var(--theme-accent)] transition-opacity duration-200">
             <MiniResetIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            value={inputValue}
            min={min}
            max={max}
            step={step}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            className="w-14 text-right bg-zinc-950 border border-zinc-700 text-stone-300 font-mono rounded-md px-1 py-0.5 focus:border-[var(--theme-accent)]/80 focus:outline-none"
          />
        ) : (
          <span 
            onClick={() => setIsEditing(true)}
            className="text-stone-400 font-mono bg-zinc-800/70 px-1.5 py-0.5 rounded-md cursor-pointer hover:bg-zinc-700/90"
            title="Click to edit value"
          >
            {value}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
};
import React, { useRef } from 'react';

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-medium text-stone-300 text-xs">{label}</label>
      <div 
        className="relative w-full h-9 rounded-md border-2 border-zinc-700/80 cursor-pointer hover:border-zinc-600"
        onClick={() => inputRef.current?.click()}
      >
        <div 
          className="absolute inset-0 w-full h-full rounded-[4px]"
          style={{ backgroundColor: color }}
        />
        <input
          ref={inputRef}
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={label}
        />
      </div>
    </div>
  );
};
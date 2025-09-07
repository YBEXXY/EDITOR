import React from 'react';
import { ImageFile } from '../types';
import { ThemeSwitcher } from './ThemeSwitcher';

interface ImageUploadProps {
  onImageUpload: (imageFile: ImageFile) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
}

const UploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-600 mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-[var(--theme-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);


export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, themeColor, setThemeColor }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onImageUpload({
          name: file.name,
          type: file.type,
          base64: e.target.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex-grow flex flex-col items-center justify-center p-4 text-center">
      <div className="relative group mb-4">
        <h1 className="text-9xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white/80 to-white/40 [text-shadow:0_0_25px_rgba(255,255,255,0.15)] transition-all duration-300 group-hover:[text-shadow:0_0_40px_rgb(var(--theme-accent-rgb)/0.3)] pr-1">
            EDITOR
        </h1>
        <p className="text-center text-lg text-[rgb(var(--theme-accent-rgb)/0.9)] mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out transform scale-90 group-hover:scale-100 pointer-events-none">
            The AI Photo Studio. Reimagined.
        </p>
      </div>
      <div className="w-full max-w-2xl group mt-12">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 bg-zinc-950/40 border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:border-[var(--theme-accent)]/60 hover:bg-zinc-950/60 transition-all duration-300 hover:shadow-[0_0_30px_0px_rgb(var(--theme-accent-rgb)/0.15)]">
          <UploadIcon />
          <p className="text-xl font-semibold text-zinc-400 transition-colors duration-300 group-hover:text-[var(--theme-accent)]">Drop your image here or <span className="font-bold">browse</span></p>
          <p className="text-sm text-zinc-500 mt-1">Supports PNG, JPG, WEBP</p>
        </label>
      </div>
       <ThemeSwitcher color={themeColor} onChange={setThemeColor} />
    </div>
  );
};
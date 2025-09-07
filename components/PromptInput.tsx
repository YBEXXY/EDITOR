import React, { useState, useEffect } from 'react';
import { EditMode, BrushSettings } from '../types';

interface PromptInputProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  isLoading: boolean;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  editMode: EditMode;
  setEditMode: (mode: EditMode) => void;
  enhancePrompt: () => void;
  isEnhancing: boolean;
  isPanelOpen: boolean;
  brushSettings: BrushSettings;
  setBrushSettings: (settings: BrushSettings) => void;
}

const MagicWandIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 15l-1.813-1.813a2.25 2.25 0 010-3.182L10.5 6.5a2.25 2.25 0 013.182 0l2.687 2.688a2.25 2.25 0 010 3.182L13.5 15.25l-1.813 1.813a2.25 2.25 0 01-3.182 0zM9 15V9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const BrushIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z" />
    </svg>
);

const EraserIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const GlobeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.758 11a2.25 2.25 0 01-1.41-2.282A5.43 5.43 0 0112 5.25a5.43 5.43 0 015.652 3.468 2.25 2.25 0 01-1.41 2.282m0 0H16.242m-1.284-4.592L12 6.5M12 6.5l-2.958 2.908" />
    </svg>
);


const SparkleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 15l-1.813-1.813a2.25 2.25 0 010-3.182L10.5 6.5a2.25 2.25 0 013.182 0l2.687 2.688a2.25 2.25 0 010 3.182L13.5 15.25l-1.813 1.813a2.25 2.25 0 01-3.182 0zM9 15V9" />
       <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c.42.06.83.15 1.22.28M12 2.25a8.25 8.25 0 00-8.25 8.25c0 1.22.26 2.38.71 3.45M12 2.25c4.55 0 8.25 3.7 8.25 8.25 0 1.22-.26 2.38-.71 3.45M12 21.75c-.42-.06-.83-.15-1.22-.28M12 21.75a8.25 8.25 0 018.25-8.25c0-1.22-.26-2.38-.71-3.45M12 21.75a8.25 8.25 0 00-8.25-8.25c0-1.22.26 2.38.71 3.45" />
    </svg>
);

const ToolbarSlider: React.FC<{label: string, value: number, min: number, max: number, step: number, onChange: (val: number) => void}> = ({ label, value, min, max, step, onChange }) => (
    <div className="flex flex-col gap-1.5 flex-1">
        <div className="flex justify-between items-center text-xs">
            <label className="font-medium text-stone-300">{label}</label>
            <span className="text-stone-400 font-mono bg-zinc-950/60 px-1.5 py-0.5 rounded-md">{value}</span>
        </div>
        <input 
            type="range" 
            min={min} max={max} step={step} 
            value={value} 
            onChange={e => onChange(parseFloat(e.target.value))} 
        />
    </div>
);

const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const stylePresets = [
    { name: 'Cinematic', prompt: 'cinematic lighting, dramatic shadows, teal and orange color grade, film grain' },
    { name: 'Vintage', prompt: 'vintage film photo, faded colors, dust and scratches, soft focus' },
    { name: 'Cyberpunk', prompt: 'cyberpunk style, neon lights, gritty urban environment, high contrast' },
    { name: 'Analog', prompt: 'analog film photo, grainy, nostalgic, warm tones' },
    { name: 'Noir', prompt: 'black and white, high contrast, film noir style, dramatic shadows' },
    { name: 'Dreamy', prompt: 'dreamy, ethereal, soft focus, glowing light, pastel colors' },
    { name: '3D Render', prompt: '3D render, photorealistic, octane render, trending on artstation' },
];

const blendModes = [
    { value: 'source-over', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'soft-light', label: 'Soft Light' },
];

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, isLoading, aspectRatio, setAspectRatio, editMode, setEditMode, enhancePrompt, isEnhancing, isPanelOpen, brushSettings, setBrushSettings }) => {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    const foundPreset = stylePresets.find(p => prompt.startsWith(p.prompt));
    setActivePreset(foundPreset ? foundPreset.name : null);
  }, [prompt]);
  
  const handlePresetClick = (presetName: string, presetPrompt: string) => {
    let newPrompt = prompt;

    // Remove any existing preset from the start of the prompt.
    stylePresets.forEach(p => {
        const regex = new RegExp(`^${p.prompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')},?\\s*`, 'i');
        newPrompt = newPrompt.replace(regex, '');
    });

    // If the clicked preset wasn't the active one, add it. Otherwise, it's toggled off.
    if (activePreset !== presetName) {
        newPrompt = newPrompt ? `${presetPrompt}, ${newPrompt}` : presetPrompt;
    }
    
    setPrompt(newPrompt);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading && prompt) {
      event.preventDefault(); // Prevent any default form submission behavior
      onSubmit();
    }
  };
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 p-4 flex justify-center items-end pointer-events-none transition-all duration-300 ease-in-out ${isPanelOpen ? 'md:pr-[340px]' : 'md:pr-0'}`}>
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-3 shadow-2xl shadow-black/50 pointer-events-auto transition-all duration-300 transform hover:scale-[1.01] hover:border-zinc-700">
        
        {editMode === 'mask' && (
            <div className="flex items-end gap-4 px-1 pb-3 border-b border-zinc-800 mb-3">
                <div className="flex items-center gap-1 bg-zinc-800/70 p-1 rounded-lg">
                    <button onClick={() => setBrushSettings({...brushSettings, mode: 'brush'})} className={`p-2 rounded-md transition-colors ${brushSettings.mode === 'brush' ? 'bg-[var(--theme-accent)] text-black' : 'text-stone-400 hover:bg-zinc-700/60'}`} title="Brush">
                        <BrushIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => setBrushSettings({...brushSettings, mode: 'eraser'})} className={`p-2 rounded-md transition-colors ${brushSettings.mode === 'eraser' ? 'bg-[var(--theme-accent)] text-black' : 'text-stone-400 hover:bg-zinc-700/60'}`} title="Eraser">
                        <EraserIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="blend-mode-select" className="font-medium text-stone-300 text-xs">Blend</label>
                    <div className="relative">
                        <select
                            id="blend-mode-select"
                            value={brushSettings.blendMode}
                            onChange={e => setBrushSettings({ ...brushSettings, blendMode: e.target.value as any })}
                            className="w-28 bg-zinc-800 border border-zinc-700 rounded-md p-1 h-9 appearance-none focus:outline-none hover:border-zinc-600 focus:border-[var(--theme-accent)]/70 text-sm pl-2 pr-7 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={brushSettings.mode === 'eraser'}
                            title="Brush Blend Mode"
                        >
                            {blendModes.map(mode => (
                                <option key={mode.value} value={mode.value} className="bg-zinc-900 text-stone-200">{mode.label}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
                <ToolbarSlider label="Size" min={2} max={150} step={1} value={brushSettings.size} onChange={val => setBrushSettings({...brushSettings, size: val})} />
                <ToolbarSlider label="Hardness" min={0.01} max={1} step={0.01} value={brushSettings.hardness} onChange={val => setBrushSettings({...brushSettings, hardness: val})} />
                <ToolbarSlider label="Feather" min={0} max={50} step={1} value={brushSettings.feather} onChange={val => setBrushSettings({...brushSettings, feather: val})} />
                <ToolbarSlider label="Opacity" min={0.01} max={1} step={0.01} value={brushSettings.opacity} onChange={val => setBrushSettings({...brushSettings, opacity: val})} />
            </div>
        )}

        {/* Toolbar */}
        <div className="flex justify-between items-center px-1">
            {/* Edit Mode */}
            <div className="flex items-center gap-1 bg-zinc-800/70 p-1 rounded-lg">
                <button onClick={() => setEditMode('global')} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${editMode === 'global' ? 'bg-[var(--theme-accent)] text-black' : 'text-stone-400 hover:bg-zinc-700/60'}`}>
                    <GlobeIcon className="w-5 h-5"/> Global
                </button>
                <button onClick={() => setEditMode('mask')} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${editMode === 'mask' ? 'bg-[var(--theme-accent)] text-black' : 'text-stone-400 hover:bg-zinc-700/60'}`}>
                    <BrushIcon className="w-5 h-5"/> Magic Brush
                </button>
            </div>
             {/* Aspect Ratio */}
            <div className="flex items-center gap-1 bg-zinc-800/70 p-1 rounded-lg">
                 {aspectRatios.map((ratio) => (
                    <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        disabled={isLoading}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${aspectRatio === ratio ? 'bg-[var(--theme-accent)] text-black' : 'text-stone-400 hover:bg-zinc-700/60'}`}
                    >
                        {ratio}
                    </button>
                ))}
            </div>
        </div>
        {/* Cinematic Styles */}
        <div className="px-2 pt-3">
            <label className="text-xs font-semibold text-stone-400 mb-2 block">Cinematic Styles</label>
            <div className="flex items-center gap-2 flex-wrap">
                {stylePresets.map(preset => (
                    <button 
                        key={preset.name} 
                        onClick={() => handlePresetClick(preset.name, preset.prompt)} 
                        disabled={isLoading}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                            activePreset === preset.name
                                ? 'bg-[var(--theme-accent)] text-black shadow-md shadow-[var(--theme-accent)]/20'
                                : 'bg-zinc-800/70 text-stone-300 hover:bg-zinc-700/90'
                        }`}
                    >
                        {preset.name}
                    </button>
                ))}
            </div>
        </div>
        {/* Main Input and Actions */}
        <div className="flex gap-2 items-center pt-3 mt-3 border-t border-zinc-800 px-1">
            <div className="relative flex-grow">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your edit... e.g., 'add a majestic castle in the background'"
                    className="w-full bg-zinc-800/70 border-2 border-zinc-700 rounded-lg p-3 pr-24 h-14 focus:outline-none hover:border-zinc-600 focus:border-[var(--theme-accent)]/70"
                    disabled={isLoading || isEnhancing}
                />
                <button
                    onClick={enhancePrompt}
                    disabled={isLoading || isEnhancing || !prompt}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-zinc-700/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    aria-label="Enhance prompt with AI"
                    title="Enhance prompt with AI"
                >
                    <SparkleIcon className={`w-6 h-6 text-stone-400 group-hover:text-[var(--theme-accent)] group-hover:drop-shadow-[0_0_5px_rgb(var(--theme-accent-rgb)/0.7)] transition-all ${isEnhancing ? 'animate-pulse text-[var(--theme-accent)]' : ''}`}/>
                </button>
            </div>
            <button
                onClick={onSubmit}
                disabled={isLoading || !prompt}
                className="flex items-center justify-center gap-2 bg-[var(--theme-accent)] text-black font-bold h-14 px-6 rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 hover:shadow-[var(--glow-shadow)]"
            >
                <MagicWandIcon className="w-5 h-5" />
                <span>{isLoading ? 'Generating...' : 'Generate'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Adjustments } from '../types';
import { AdjustmentSlider } from './AdjustmentSlider';
import { CurvesTool } from './CurvesTool';
import { ColorPicker } from './ColorPicker';

interface AdjustmentsPanelProps {
  adjustments: Adjustments;
  onAdjustmentChange: React.Dispatch<React.SetStateAction<Adjustments>>;
  onReset: () => void;
  isOpen: boolean;
}

// Icons
const SunIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const DropletIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a5 5 0 01-.707-7.071L12 3.586l5.707 5.343A5 5 0 0117 16H7z" /></svg>;
const SparklesIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6.343 17.657l-2.828 2.828M17.657 6.343L14.83 3.515m-4.242 4.243l-1.414-1.414M12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>;
const ChartBarIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const ResetIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.696L7.985 5.964m0 0a8.25 8.25 0 0111.664 0l3.181 3.183" />
    </svg>
);


const tabs = [
    { id: 'light', icon: <SunIcon />, label: 'Light' },
    { id: 'color', icon: <DropletIcon />, label: 'Color' },
    { id: 'effects', icon: <SparklesIcon />, label: 'Effects' },
    { id: 'curves', icon: <ChartBarIcon />, label: 'Curves' },
];

export const AdjustmentsPanel: React.FC<AdjustmentsPanelProps> = ({ adjustments, onAdjustmentChange, onReset, isOpen }) => {
  const [activeTab, setActiveTab] = useState('light');
  
  const handleSliderChange = (key: keyof Adjustments, value: number) => {
    onAdjustmentChange(prev => ({ ...prev, [key]: value }));
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'light':
        return (
          <div className="pt-3 pb-1 px-2 flex flex-col gap-4">
              <AdjustmentSlider label="Exposure" value={adjustments.exposure} min={-100} max={100} onChange={val => handleSliderChange('exposure', val)} onReset={() => handleSliderChange('exposure', 0)} />
              <AdjustmentSlider label="Brightness" value={adjustments.brightness} min={0} max={200} onChange={val => handleSliderChange('brightness', val)} onReset={() => handleSliderChange('brightness', 100)} />
              <AdjustmentSlider label="Contrast" value={adjustments.contrast} min={0} max={200} onChange={val => handleSliderChange('contrast', val)} onReset={() => handleSliderChange('contrast', 100)} />
              <AdjustmentSlider label="Highlights" value={adjustments.highlights} min={-100} max={100} onChange={val => handleSliderChange('highlights', val)} onReset={() => handleSliderChange('highlights', 0)} />
              <AdjustmentSlider label="Shadows" value={adjustments.shadows} min={-100} max={100} onChange={val => handleSliderChange('shadows', val)} onReset={() => handleSliderChange('shadows', 0)} />
          </div>
        );
      case 'color':
        return (
          <div className="pt-3 pb-1 px-2 flex flex-col gap-4">
              <AdjustmentSlider label="Temperature" value={adjustments.temperature} min={-100} max={100} onChange={val => handleSliderChange('temperature', val)} onReset={() => handleSliderChange('temperature', 0)} />
              <AdjustmentSlider label="Tint" value={adjustments.tint} min={-100} max={100} onChange={val => handleSliderChange('tint', val)} onReset={() => handleSliderChange('tint', 0)} />
              <AdjustmentSlider label="Saturation" value={adjustments.saturation} min={0} max={200} onChange={val => handleSliderChange('saturation', val)} onReset={() => handleSliderChange('saturation', 100)} />
              <AdjustmentSlider label="Vibrance" value={adjustments.vibrance} min={-100} max={100} onChange={val => handleSliderChange('vibrance', val)} onReset={() => handleSliderChange('vibrance', 0)} />
          
              <div className="border-t border-zinc-800/90 my-2"></div>
              
              <ColorPicker 
                label="Filter Color"
                color={adjustments.filterColor}
                onChange={color => onAdjustmentChange(prev => ({ ...prev, filterColor: color }))}
              />
              <AdjustmentSlider 
                label="Filter Strength" 
                value={adjustments.filterStrength} 
                min={0} max={100} 
                onChange={val => handleSliderChange('filterStrength', val)}
                onReset={() => handleSliderChange('filterStrength', 0)}
              />
          </div>
        );
      case 'effects':
        return (
          <div className="pt-3 pb-1 px-2 flex flex-col gap-4">
              <AdjustmentSlider label="Sharpen" value={adjustments.sharpen} min={0} max={100} onChange={val => handleSliderChange('sharpen', val)} onReset={() => handleSliderChange('sharpen', 0)} />
              <AdjustmentSlider label="Vignette" value={adjustments.vignette} min={0} max={100} onChange={val => handleSliderChange('vignette', val)} onReset={() => handleSliderChange('vignette', 0)} />
              <AdjustmentSlider label="Grain" value={adjustments.grain} min={0} max={100} onChange={val => handleSliderChange('grain', val)} onReset={() => handleSliderChange('grain', 0)} />
          </div>
        );
      case 'curves':
        return (
           <div className="pt-3 pb-1 px-2">
            <CurvesTool 
                curves={adjustments.curves}
                onCurvesChange={(newCurves) => onAdjustmentChange(prev => ({ ...prev, curves: newCurves }))}
            />
        </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-y-0 right-0 z-20 w-full max-w-sm md:max-w-[340px] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="bg-zinc-950/80 backdrop-blur-xl border-l border-zinc-800/70 h-full flex flex-col pt-20">
          <div className="flex flex-grow overflow-hidden">
            <nav className="flex flex-col items-center gap-2 p-2 border-r border-zinc-800/70 bg-zinc-900/40">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex flex-col items-center justify-center p-3 rounded-lg w-20 h-20 transition-colors ${activeTab === tab.id ? 'bg-zinc-800/90 text-stone-100' : 'text-stone-400 hover:bg-zinc-800/60 hover:text-stone-200'}`}
                        title={tab.label}
                        aria-label={tab.label}
                    >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-[var(--theme-accent)] transition-transform duration-300 ${activeTab === tab.id ? 'scale-y-100' : 'scale-y-0'}`}></div>
                        {tab.icon}
                        <span className="text-xs mt-1">{tab.label}</span>
                    </button>
                ))}
            </nav>
            <div className="relative flex-grow p-4 overflow-y-auto animate-panel-content-in" key={activeTab}>
                {renderContent()}
                <button 
                  onClick={onReset}
                  className="absolute bottom-4 right-4 flex items-center justify-center w-10 h-10 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 rounded-full shadow-lg hover:border-[var(--theme-accent)]/60 hover:bg-zinc-700/90 hover:shadow-[var(--glow-shadow)] transition-all duration-200"
                  title="Reset all adjustments"
                  aria-label="Reset all adjustments"
                >
                  <ResetIcon className="w-5 h-5 text-stone-300" />
                </button>
            </div>
          </div>
        </div>
    </div>
  );
};
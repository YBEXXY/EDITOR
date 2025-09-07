import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { PromptInput } from './components/PromptInput';
import { ResultDisplay } from './components/ResultDisplay';
import { ErrorDisplay } from './components/ErrorDisplay';
import { editImageWithNanoBanana, enhancePrompt as enhancePromptService, upscaleImage } from './services/geminiService';
import { ImageFile, EditMode, Adjustments, Curves, BrushSettings } from './types';
import { applyAdjustmentsToImage } from './utils/imageProcessor';
import { AdjustmentsPanel } from './components/AdjustmentsPanel';
import { ImagePreviewModal } from './components/ImagePreviewModal';

const initialCurves: Curves = {
  rgb: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  r: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  g: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  b: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
};

const initialAdjustments: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  vibrance: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  temperature: 0,
  tint: 0,
  sharpen: 0,
  vignette: 0,
  grain: 0,
  curves: initialCurves,
  filterColor: '#ffffff',
  filterStrength: 0,
};

const initialBrushSettings: BrushSettings = {
    size: 40,
    hardness: 0.5,
    opacity: 1,
    mode: 'brush',
    feather: 0,
    blendMode: 'source-over',
};


interface PreviewState {
  before: string;
  after: string | null;
}

const AdjustmentsToggleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"></line>
      <line x1="4" y1="10" x2="4" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12" y2="3"></line>
      <line x1="20" y1="21" x2="20" y2="16"></line>
      <line x1="20" y1="12" x2="20" y2="3"></line>
      <line x1="1" y1="14" x2="7" y2="14"></line>
      <line x1="9" y1="8" x2="15" y2="8"></line>
      <line x1="17" y1="16" x2="23" y2="16"></line>
    </svg>
);

const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '245, 158, 11'; // Default to amber
};


const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [editMode, setEditMode] = useState<EditMode>('global');
  const [maskData, setMaskData] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isUpscaling, setIsUpscaling] = useState<boolean>(false);
  const [isUpscaled, setIsUpscaled] = useState<boolean>(false);
  const [adjustments, setAdjustments] = useState<Adjustments>(initialAdjustments);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [themeColor, setThemeColor] = useState('#f59e0b'); // Default: amber
  const [brushSettings, setBrushSettings] = useState<BrushSettings>(initialBrushSettings);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-accent', themeColor);
    root.style.setProperty('--theme-accent-rgb', hexToRgb(themeColor));
  }, [themeColor]);

  const handleImageUpload = (imageFile: ImageFile) => {
    setOriginalImage(imageFile);
    handleReset(false); // Soft reset
  };

  const enhancePrompt = useCallback(async () => {
    if (!prompt || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePromptService(prompt);
      setPrompt(enhanced);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enhance prompt.");
    } finally {
      setIsEnhancing(false);
    }
  }, [prompt, isEnhancing]);

  const handleGenerate = useCallback(async () => {
    if (!originalImage || !prompt) {
      setError("Please select an image and enter a prompt.");
      return;
    }
    if (editMode === 'mask' && !maskData) {
      setError("Please use the Magic Brush to select an area to edit.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    setResponseText(null);
    setIsUpscaled(false);

    try {
      // Apply adjustments to the original image before sending to the AI
      const adjustedImageBase64 = await applyAdjustmentsToImage(originalImage, adjustments);
      const adjustedImageFile: ImageFile = { ...originalImage, base64: adjustedImageBase64 };

      let finalPrompt = prompt;
      if (aspectRatio !== 'Original') {
        finalPrompt = `Please ensure the final image has an aspect ratio of ${aspectRatio}. Then, fulfill this request: "${prompt}"`;
      }
      
      const result = await editImageWithNanoBanana(
        adjustedImageFile, 
        finalPrompt,
        editMode === 'mask' ? maskData : null
      );
      if (result.editedImage) {
        setEditedImage(result.editedImage);
      }
      if (result.text) {
        setResponseText(result.text);
      }
      if (!result.editedImage && !result.text) {
        setError("The AI did not return an image or text. Please try a different prompt.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt, aspectRatio, editMode, maskData, adjustments]);
  
  const handleUpscale = useCallback(async () => {
    if (!editedImage || isUpscaling || isUpscaled) return;

    setIsUpscaling(true);
    setError(null);
    
    try {
      const result = await upscaleImage(editedImage);
      if (result.editedImage) {
        setEditedImage(result.editedImage);
        setIsUpscaled(true);
      } else {
        setError("The AI did not return an upscaled image. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during upscaling.");
    } finally {
      setIsUpscaling(false);
    }
  }, [editedImage, isUpscaling, isUpscaled]);


  const handleReset = (fullReset = true) => {
    if (fullReset) {
      setOriginalImage(null);
      setIsPanelOpen(false);
    }
    setEditedImage(null);
    setResponseText(null);
    setError(null);
    setPrompt('');
    setAspectRatio('1:1');
    setEditMode('global');
    setMaskData(null);
    setIsUpscaled(false);
    setIsUpscaling(false);
    setAdjustments(initialAdjustments);
    setBrushSettings(initialBrushSettings);
  };

  const handlePreviewRequest = (beforeUrl: string, afterUrl: string | null) => {
    setPreview({ before: beforeUrl, after: afterUrl });
  };

  return (
    <div className="min-h-screen bg-transparent text-stone-200 font-sans flex flex-col">
       <div className="fixed inset-0 -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          src="https://assets.mixkit.co/videos/preview/mixkit-abstract-flowing-lines-and-dots-42933-large.mp4"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <Header 
        mainRef={mainRef}
        onNewImage={() => handleReset(true)} 
        hasImage={!!originalImage} 
      />
      <main ref={mainRef} className={`flex-grow container mx-auto p-4 flex flex-col items-center justify-center pt-20 pb-56 transition-all duration-300 ease-in-out ${isPanelOpen ? 'md:pr-[340px]' : 'md:pr-0'}`}>
        {!originalImage ? (
          <ImageUpload onImageUpload={handleImageUpload} themeColor={themeColor} setThemeColor={setThemeColor} />
        ) : (
           <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            {error && <ErrorDisplay message={error} />}
            <ResultDisplay
              originalImage={originalImage}
              editedImage={editedImage}
              responseText={responseText}
              isLoading={isLoading}
              editMode={editMode}
              onMaskUpdate={setMaskData}
              aspectRatio={aspectRatio}
              onUpscale={handleUpscale}
              isUpscaling={isUpscaling}
              isUpscaled={isUpscaled}
              adjustments={adjustments}
              onPreviewRequest={handlePreviewRequest}
              brushSettings={brushSettings}
            />
          </div>
        )}
      </main>
      {originalImage && (
        <>
            <button
                onClick={() => setIsPanelOpen(v => !v)}
                className={`fixed top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-12 h-12 bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/60 rounded-full shadow-lg hover:border-[var(--theme-accent)]/50 hover:bg-zinc-800/80 transition-all duration-300 ease-in-out ${isPanelOpen ? 'right-[calc(340px+1rem)]' : 'right-4'}`}
                aria-label={isPanelOpen ? "Close adjustments panel" : "Open adjustments panel"}
                title={isPanelOpen ? "Close adjustments" : "Open adjustments"}
            >
                <AdjustmentsToggleIcon className="w-6 h-6 text-stone-300" />
            </button>

            <PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              onSubmit={handleGenerate}
              isLoading={isLoading || isUpscaling}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              editMode={editMode}
              setEditMode={setEditMode}
              enhancePrompt={enhancePrompt}
              isEnhancing={isEnhancing}
              isPanelOpen={isPanelOpen}
              brushSettings={brushSettings}
              setBrushSettings={setBrushSettings}
            />
        </>
      )}
      {preview && (
        <ImagePreviewModal
          beforeImageUrl={preview.before}
          afterImageUrl={preview.after}
          onClose={() => setPreview(null)}
        />
      )}
      {originalImage && (
        <AdjustmentsPanel 
            adjustments={adjustments} 
            onAdjustmentChange={setAdjustments}
            onReset={() => setAdjustments(initialAdjustments)}
            isOpen={isPanelOpen}
        />
      )}
    </div>
  );
};

export default App;
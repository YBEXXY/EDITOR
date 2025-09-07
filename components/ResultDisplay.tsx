import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader } from './Loader';
import { ImageFile, EditMode, Adjustments, BrushSettings } from '../types';
import { drawAdjustedImageToCanvas } from '../utils/imageProcessor';

interface ResultDisplayProps {
  originalImage: ImageFile;
  editedImage: string | null;
  responseText: string | null;
  isLoading: boolean;
  editMode: EditMode;
  onMaskUpdate: (maskData: string | null) => void;
  aspectRatio: string;
  onUpscale: () => void;
  isUpscaling: boolean;
  isUpscaled: boolean;
  adjustments: Adjustments;
  onPreviewRequest: (beforeUrl: string, afterUrl: string | null) => void;
  brushSettings: BrushSettings;
}

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const SparkleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 15l-1.813-1.813a2.25 2.25 0 010-3.182L10.5 6.5a2.25 2.25 0 013.182 0l2.687 2.688a2.25 2.25 0 010 3.182L13.5 15.25l-1.813 1.813a2.25 2.25 0 01-3.182 0zM9 15V9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c.42.06.83.15 1.22.28M12 2.25a8.25 8.25 0 00-8.25 8.25c0 1.22.26 2.38.71 3.45M12 2.25c4.55 0 8.25 3.7 8.25 8.25 0 1.22-.26 2.38-.71 3.45M12 21.75c-.42-.06-.83-.15-1.22-.28M12 21.75a8.25 8.25 0 018.25-8.25c0-1.22-.26-2.38-.71-3.45M12 21.75a8.25 8.25 0 00-8.25-8.25c0-1.22.26 2.38.71 3.45" />
    </svg>
);


const getAspectRatioStyle = (ratio: string): React.CSSProperties => {
  const [w, h] = ratio.split(':').map(Number);
  if (!w || !h) return { aspectRatio: '1 / 1' };
  return { aspectRatio: `${w} / ${h}` };
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImage, editedImage, responseText, isLoading, editMode, onMaskUpdate, aspectRatio, onUpscale, isUpscaling, isUpscaled, adjustments, onPreviewRequest, brushSettings }) => {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [sliderPos, setSliderPos] = useState(50);
  const [isComparing, setIsComparing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isDownloadingAfterUpscale, setIsDownloadingAfterUpscale] = useState(false);

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{x: number, y: number} | null>(null);
  
  const handleDownload = useCallback(() => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = `editor-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [editedImage]);

  useEffect(() => {
    if (isDownloadingAfterUpscale && isUpscaled) {
        handleDownload();
        setIsDownloadingAfterUpscale(false);
    }
  }, [isUpscaled, isDownloadingAfterUpscale, handleDownload]);


  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !originalImage) return;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      drawAdjustedImageToCanvas(canvas, image, adjustments);
      
      const maskCanvas = maskCanvasRef.current;
      if (maskCanvas) {
          maskCanvas.width = image.naturalWidth;
          maskCanvas.height = image.naturalHeight;
      }
    };
    image.src = originalImage.base64;
  }, [originalImage, adjustments]);


  useEffect(() => {
    const canvas = maskCanvasRef.current;
    if (canvas && editMode === 'mask') {
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        onMaskUpdate(null);
      }
    }
  }, [editMode, originalImage.base64, onMaskUpdate]);


  // MASK DRAWING LOGIC
  const getCoords = (event: React.MouseEvent | React.TouchEvent) => {
    if (!maskCanvasRef.current) return { x: 0, y: 0 };
    const canvas = maskCanvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    
    return { x, y };
  };

  const drawStamp = (x: number, y: number) => {
    const canvas = maskCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return;
    
    if (brushSettings.mode === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    } else {
      context.globalCompositeOperation = brushSettings.blendMode;
    }
    
    const brushRadius = brushSettings.size / 2;
    const gradient = context.createRadialGradient(x, y, 0, x, y, brushRadius);
    const hardness = Math.max(0.01, Math.min(1, brushSettings.hardness));
    
    const color = `rgba(255, 255, 255, ${brushSettings.opacity})`;
    const eraserColor = 'rgba(255, 255, 255, 1)';
    
    const activeColor = brushSettings.mode === 'eraser' ? eraserColor : color;
    gradient.addColorStop(0, activeColor);
    gradient.addColorStop(hardness, activeColor);
    gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
    
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, brushRadius, 0, Math.PI * 2);
    context.fill();
  };
    
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (editMode !== 'mask' || !maskCanvasRef.current) return;
    isDrawingRef.current = true;
    const coords = getCoords(e);
    lastPointRef.current = coords;
    drawStamp(coords.x, coords.y);
  };

  const stopDrawing = () => {
    if (editMode !== 'mask' || !isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas) {
      if (brushSettings.feather > 0) {
        // Use a temporary canvas to apply the blur non-destructively
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = maskCanvas.width;
        tempCanvas.height = maskCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.filter = `blur(${brushSettings.feather}px)`;
          tempCtx.drawImage(maskCanvas, 0, 0);
          onMaskUpdate(tempCanvas.toDataURL('image/png'));
        } else {
          onMaskUpdate(maskCanvas.toDataURL('image/png')); // Fallback if context fails
        }
      } else {
        onMaskUpdate(maskCanvas.toDataURL('image/png'));
      }
    }
  };
  
  const drawingMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    const currentPoint = getCoords(e);
    const lastPoint = lastPointRef.current;
    
    const dist = Math.hypot(currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y);
    const angle = Math.atan2(currentPoint.y - lastPoint.y, currentPoint.x - lastPoint.x);
    const step = Math.min(4, brushSettings.size / 4);
    
    for (let i = 0; i < dist; i += step) {
         const x = lastPoint.x + (Math.cos(angle) * i);
         const y = lastPoint.y + (Math.sin(angle) * i);
         drawStamp(x, y);
    }
    
    drawStamp(currentPoint.x, currentPoint.y);
    lastPointRef.current = currentPoint;
  };

  // COMPARISON SLIDER LOGIC
  const handleSliderMove = (clientX: number) => {
    if (!isComparing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    setSliderPos(percentage);
  };

  const handleMouseMove = (e: MouseEvent) => handleSliderMove(e.clientX);
  const handleTouchMove = (e: TouchEvent) => handleSliderMove(e.touches[0].clientX);

  const handleMouseUp = () => setIsComparing(false);
  const handleTouchEnd = () => setIsComparing(false);

  useEffect(() => {
    if (isComparing) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isComparing]);

  const handlePreviewClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-role="slider-handle"]')) return;
    const adjustedOriginal = previewCanvasRef.current?.toDataURL('image/png') || originalImage.base64;
    onPreviewRequest(adjustedOriginal, editedImage);
  };


  return (
    <>
    <div className="w-full mx-auto flex flex-col items-center gap-4">
      <div 
        ref={containerRef}
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-zinc-950 group/container" 
        style={getAspectRatioStyle(aspectRatio)}
        onClick={handlePreviewClick}
      >
        <canvas
          ref={previewCanvasRef}
          className="absolute inset-0 w-full h-full object-contain"
        />
        
        {editedImage && (
            <div className="absolute inset-0 w-full h-full" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                <img src={editedImage} alt="Edited" className="absolute inset-0 w-full h-full object-contain" />
            </div>
        )}

        
        <canvas
            ref={maskCanvasRef}
            className={`absolute inset-0 w-full h-full object-contain opacity-70 ${editMode === 'mask' ? 'cursor-crosshair' : 'pointer-events-none'}`}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onMouseMove={drawingMove}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={drawingMove}
        />
        
        {editedImage && (
            <div 
                className="absolute top-0 bottom-0 bg-white/80 w-1 cursor-ew-resize opacity-0 group-hover/container:opacity-100 transition-opacity"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                data-role="slider-handle"
                onMouseDown={() => setIsComparing(true)}
                onTouchStart={() => setIsComparing(true)}
            >
                <div 
                    className="absolute top-1/2 -translate-y-1/2 -left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[var(--theme-accent)] shadow-lg flex items-center justify-center"
                >
                    <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                </div>
            </div>
        )}

        {(isLoading || isUpscaling) && (
            <div className="absolute inset-0 w-full h-full bg-black/70 flex items-center justify-center backdrop-blur-sm">
                <Loader />
            </div>
        )}
      </div>
      
      <div className="w-full flex justify-center items-start gap-4">
        {editedImage && !isLoading && (
            <button
                onClick={() => setShowDownloadModal(true)}
                className="flex items-center justify-center gap-2 bg-stone-300 text-black font-bold py-3 px-6 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-stone-100/20"
                aria-label="Download image"
            >
                <DownloadIcon className="w-5 h-5" />
                <span>Download</span>
            </button>
        )}
        {responseText && !isLoading && (
          <div className="bg-zinc-900/60 rounded-lg p-4 text-center max-w-md">
            <p className="text-stone-400 italic">{responseText}</p>
          </div>
        )}
      </div>
    </div>
    {showDownloadModal && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={() => setShowDownloadModal(false)}
        >
            <div 
                className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4 w-full max-w-xs"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold text-center text-stone-100 mb-2">Download Options</h3>
                <button 
                    onClick={() => { handleDownload(); setShowDownloadModal(false); }} 
                    className="w-full text-center bg-zinc-700 text-stone-200 font-semibold py-3 px-4 rounded-lg hover:bg-zinc-600 border border-zinc-600 transition-colors transform hover:scale-105"
                >
                    Standard Quality
                </button>
                <button 
                    onClick={() => { 
                        if (isUpscaled) return;
                        onUpscale(); 
                        setIsDownloadingAfterUpscale(true); 
                        setShowDownloadModal(false); 
                    }}
                    disabled={isUpscaled} 
                    className="w-full flex items-center justify-center gap-2 bg-[var(--theme-accent)] text-black font-bold py-3 px-4 rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 hover:shadow-[var(--glow-shadow)]"
                >
                    <SparkleIcon className="w-5 h-5" />
                    <span>{isUpscaled ? 'Already Upscaled' : 'Upscale & Download HQ'}</span>
                </button>
            </div>
        </div>
    )}
    </>
  );
};
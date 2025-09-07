import React, { useState, useEffect } from 'react';

interface ImagePreviewModalProps {
  beforeImageUrl: string;
  afterImageUrl: string | null;
  onClose: () => void;
}

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ beforeImageUrl, afterImageUrl, onClose }) => {
  const [showAfter, setShowAfter] = useState(!!afterImageUrl);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const activeImageUrl = showAfter ? afterImageUrl : beforeImageUrl;
  if (!activeImageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center z-50 animate-fade-in p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { transform: scale(0.98); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-in-out forwards;
        }
        .animate-scale-up {
          animation: scale-up 0.4s ease-in-out forwards;
        }
      `}</style>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors z-20"
        aria-label="Close image preview"
      >
        <CloseIcon className="w-6 h-6" />
      </button>

      <div
        className="relative max-w-full max-h-[85vh] animate-scale-up flex-shrink"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={activeImageUrl}
          alt={showAfter ? "Enlarged edited preview" : "Enlarged original preview"}
          className="object-contain w-full h-full max-w-full max-h-full rounded-lg shadow-2xl"
        />
      </div>

      {afterImageUrl && (
          <div className="mt-4 bg-black/40 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => setShowAfter(false)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${!showAfter ? 'bg-stone-200 text-black' : 'text-stone-300 hover:bg-zinc-700/60'}`}
                >
                    Original
                </button>
                <button 
                    onClick={() => setShowAfter(true)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${showAfter ? 'bg-stone-200 text-black' : 'text-stone-300 hover:bg-zinc-700/60'}`}
                >
                    Edited
                </button>
          </div>
      )}
    </div>
  );
};
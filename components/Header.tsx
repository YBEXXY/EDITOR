import React, { useState, useEffect, useRef } from 'react';

const NewImageIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

interface HeaderProps {
    onNewImage: () => void;
    hasImage: boolean;
    mainRef: React.RefObject<HTMLElement>;
}

export const Header: React.FC<HeaderProps> = ({ onNewImage, hasImage, mainRef }) => {
  const [isDocked, setIsDocked] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasImage) {
        setIsDocked(false);
        return;
    }

    const handleScroll = () => {
      if (mainRef.current && headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        // Trigger when the bottom of the header is 20px above the main content
        const triggerPoint = mainRef.current.offsetTop - headerHeight - 20; 
        
        const shouldBeDocked = window.scrollY > triggerPoint;
        if (isDocked !== shouldBeDocked) {
          setIsDocked(shouldBeDocked);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasImage, mainRef, isDocked]);

  return (
    <>
      <div 
          ref={headerRef}
          className={`fixed z-20 transition-all duration-500 ease-in-out
          ${isDocked 
              ? 'top-1/2 -translate-y-1/2 left-4 w-auto'
              : 'top-0 left-0 right-0'
          }
      `}>
          <div className={`
            flex items-center transition-all duration-500 ease-in-out
            ${isDocked 
                ? 'flex-col gap-8'
                : 'container mx-auto justify-end py-4 px-4'
            } 
          `}>
              <div className={`
                flex items-center transition-opacity duration-500
                ${isDocked ? 'flex-col gap-6' : 'flex-row gap-4'}
                ${hasImage ? 'opacity-100' : 'opacity-0 pointer-events-none'}
              `}>
                  <button
                      onClick={onNewImage}
                      title="New Image"
                      aria-label="Upload a new image"
                      className="
                          group relative w-12 h-12 flex items-center justify-center bg-zinc-900/60 backdrop-blur-lg
                          border-2 border-zinc-700 rounded-full
                          transition-all duration-300 ease-in-out
                          hover:border-[var(--theme-accent)]/80 hover:scale-110 
                          hover:shadow-[var(--glow-shadow)]
                      "
                  >
                      <NewImageIcon className="w-6 h-6 text-stone-300 group-hover:text-[var(--theme-accent)] transition-colors" />
                  </button>
              </div>
          </div>
      </div>
      {/* Background element for top-bar state */}
      <div className={`
        fixed top-0 left-0 right-0 z-10 h-20 
        bg-gradient-to-b from-black/60 to-transparent
        transition-opacity duration-500
        ${isDocked ? 'opacity-0' : 'opacity-100'}
      `} />
    </>
  );
};
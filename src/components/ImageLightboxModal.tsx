import React, { useEffect, useState, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Check, 
  Maximize, 
  Minimize, 
  Share2 
} from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  productName: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  images,
  currentIndex,
  productName,
  onClose,
  onNavigate,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Reset zoom when active image changes
  useEffect(() => {
    setZoomLevel(1);
  }, [currentIndex]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        onNavigate((currentIndex - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        onNavigate((currentIndex + 1) % images.length);
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel((prev) => Math.min(prev + 0.35, 3));
      } else if (e.key === '-' || e.key === '_') {
        setZoomLevel((prev) => Math.max(prev - 0.35, 0.7));
      } else if (e.key === '0') {
        setZoomLevel(1);
      } else if (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'd') {
        handleSaveImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  // Robust Save / Download Image function for all devices (Mobile & Desktop)
  const handleSaveImage = async () => {
    if (!currentImage || isSaving) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const safeName = (productName || 'herbal-product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const filename = `${safeName}-photo-${currentIndex + 1}.jpg`;

    try {
      // 1. Fetch blob (works for data URLs, same-origin, and CORS enabled images)
      const response = await fetch(currentImage, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2600);
    } catch (err) {
      console.warn('Direct blob save failed, attempting anchor fallback:', err);
      try {
        // 2. Direct anchor download fallback
        const link = document.createElement('a');
        link.href = currentImage;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2600);
      } catch (fallbackErr) {
        console.error('Save image failed:', fallbackErr);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle browser native fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50 && images.length > 1) {
      if (diff > 0) {
        // Swiped left -> next
        onNavigate((currentIndex + 1) % images.length);
      } else {
        // Swiped right -> prev
        onNavigate((currentIndex - 1 + images.length) % images.length);
      }
    }
    touchStartXRef.current = null;
  };

  const handleShareOrCopy = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out ${productName} image`,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} full screen image preview`}
      className="fixed inset-0 z-60 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-2 sm:p-5 select-none animate-in fade-in duration-200"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ========================================================
          1. TOP CONTROLS BAR: Prominent BACK button & SAVE button
          ======================================================== */}
      <div 
        className="flex items-center justify-between text-white z-20 w-full max-w-6xl mx-auto pt-1 sm:pt-2 px-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: BACK Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer border border-white/25 shadow-lg active:scale-95 group"
            title="Go back to product view (Esc)"
            aria-label="Back to product view"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>

          <div className="hidden md:flex flex-col">
            <span className="font-serif font-bold text-sm text-stone-100 line-clamp-1 max-w-md">
              {productName}
            </span>
            {images.length > 1 && (
              <span className="text-[11px] text-stone-300 font-mono">
                Image {currentIndex + 1} of {images.length}
              </span>
            )}
          </div>
        </div>

        {/* Center Pill on Mobile */}
        {images.length > 1 && (
          <div className="flex md:hidden items-center justify-center">
            <span className="text-xs text-stone-200 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full font-mono border border-white/15">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}

        {/* Right Side: SAVE & UTILITY Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* SAVE IMAGE BUTTON */}
          <button
            type="button"
            onClick={handleSaveImage}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold backdrop-blur-md transition-all cursor-pointer shadow-xl active:scale-95 border ${
              saveSuccess
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white border-emerald-400/50'
            }`}
            title="Save / Download this product image to your device"
            aria-label="Save image"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-200 stroke-3" />
                <span className="font-extrabold tracking-wide">Saved!</span>
              </>
            ) : isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-100" />
                <span>Save Image</span>
              </>
            )}
          </button>

          {/* Share / Copy */}
          <button
            type="button"
            onClick={handleShareOrCopy}
            className="hidden sm:flex p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer border border-white/20"
            title="Share or copy product link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="hidden sm:flex p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer border border-white/20"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Close X Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer border border-white/20 ml-1"
            title="Close viewer (Esc)"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* ========================================================
          2. MAIN IMAGE STAGE with Zoom & Pan Support
          ======================================================== */}
      <div 
        className="relative flex-1 flex items-center justify-center my-2 max-w-6xl mx-auto w-full overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((currentIndex - 1 + images.length) % images.length);
            }}
            className="absolute left-2 sm:left-4 z-20 p-3 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 active:bg-black text-white backdrop-blur-md border border-white/20 shadow-2xl transition-all cursor-pointer active:scale-95 group"
            title="Previous Image (Left Arrow)"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:-translate-x-0.5" />
          </button>
        )}

        {/* Large Image Preview with Interactive Zoom */}
        <div 
          className="relative max-h-[76vh] max-w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden"
          onDoubleClick={() => setZoomLevel((prev) => (prev > 1 ? 1 : 1.85))}
        >
          <img
            src={currentImage}
            alt={`${productName} view ${currentIndex + 1}`}
            style={{
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            className="max-h-[72vh] max-w-full object-contain rounded-2xl shadow-2xl cursor-zoom-in"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((currentIndex + 1) % images.length);
            }}
            className="absolute right-2 sm:right-4 z-20 p-3 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 active:bg-black text-white backdrop-blur-md border border-white/20 shadow-2xl transition-all cursor-pointer active:scale-95 group"
            title="Next Image (Right Arrow)"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}

        {/* Floating Zoom Bar at bottom of stage */}
        <div 
          className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-20 pointer-events-none"
        >
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white shadow-xl pointer-events-auto">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.3, 0.7))}
              className="p-1 hover:text-emerald-300 transition-colors cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1 font-semibold min-w-10 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.3, 3))}
              className="p-1 hover:text-emerald-300 transition-colors cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomLevel !== 1 && (
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1 ml-1 hover:text-amber-300 transition-colors cursor-pointer border-l border-white/20 pl-1.5"
                title="Reset Zoom (0)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          3. BOTTOM FILMSTRIP: Quick Navigation Thumbnails
          ======================================================== */}
      {images.length > 1 && (
        <div 
          className="w-full max-w-2xl mx-auto flex items-center justify-center gap-2 overflow-x-auto py-2 z-10 scrollbar-none"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate(idx)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'border-emerald-400 scale-108 shadow-lg ring-2 ring-emerald-500/50'
                  : 'border-white/30 opacity-60 hover:opacity-100 hover:border-white/60'
              }`}
              title={`Switch to image ${idx + 1}`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';

interface ProgressiveImageProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
  showShimmer?: boolean;
}

/**
 * ProgressiveImage:
 * 1. Shimmer skeleton effect while image is loading
 * 2. Progressive blur-up (loads with low-quality blurred preview first, de-blurs to crisp high-res)
 * 3. Fast perception of loading speed ("jaldi se load ho jae")
 * 4. Transparent PNG support retained seamlessly
 * 5. Edge-to-edge flush layout (zero inner margin/padding)
 */
export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full relative overflow-hidden',
  referrerPolicy = 'no-referrer',
  onError,
  onLoad,
  loading = 'lazy',
  showShimmer = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset state if image URL changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    if (onError) onError(e);
  };

  if (!src || hasError) {
    return (
      <div className={`${containerClassName} bg-[#F0FAF4] flex flex-col items-center justify-center p-3 text-center`}>
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-1 text-emerald-700">
          <Leaf className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-semibold text-emerald-800 line-clamp-1">{alt}</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${containerClassName}`}>
      {/* Shimmer Wave Placeholder while image is loading */}
      {showShimmer && !isLoaded && (
        <div 
          className="absolute inset-0 z-0 animate-shimmer pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Main Image with Progressive Low-to-High Blur-up Transition */}
      <img
        src={src}
        alt={alt}
        referrerPolicy={referrerPolicy}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`relative z-1 ${className} ${
          isLoaded ? 'image-progressive-loaded' : 'image-progressive-blur'
        }`}
      />
    </div>
  );
};

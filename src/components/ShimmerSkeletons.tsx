import React from 'react';

interface ProductCardSkeletonProps {
  isModern?: boolean;
}

/**
 * ProductCardSkeleton: Shimmer placeholder for product cards while live Firebase data is loading
 */
export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ isModern = false }) => {
  if (isModern) {
    return (
      <div className="bg-white rounded-2xl border border-[#DCEFE3] shadow-xs flex overflow-hidden min-h-[140px]">
        {/* Left Column: Details shimmer */}
        <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-3 bg-[#E2EFE7] rounded-full w-16 animate-shimmer" />
              <div className="h-3 bg-[#EAF5EF] rounded-full w-20 animate-shimmer" />
            </div>
            <div className="h-5 bg-[#DCEFE3] rounded-md w-4/5 animate-shimmer" />
            <div className="h-3.5 bg-[#EDF7F1] rounded-md w-2/3 animate-shimmer" />
          </div>

          <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#F0FAF4]">
            <div className="h-6 bg-[#DCEFE3] rounded-lg w-20 animate-shimmer" />
            <div className="h-8 bg-[#E2EFE7] rounded-full w-24 animate-shimmer" />
          </div>
        </div>

        {/* Right Column: Image Holder Shimmer */}
        <div className="w-[120px] sm:w-[145px] md:w-[160px] shrink-0 border-l border-[#E6F0EB]/60 animate-shimmer relative bg-[#EBF4EE]" />
      </div>
    );
  }

  // Classic Vertical Card Skeleton
  return (
    <div className="bg-white rounded-3xl border border-[#DCEFE3] shadow-[0_8px_30px_rgba(20,50,30,0.04)] overflow-hidden flex flex-col">
      {/* Top Image Box Shimmer */}
      <div className="relative aspect-4/3 w-full animate-shimmer bg-[#EBF4EE]" />

      {/* Card Content Shimmer */}
      <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1 justify-between bg-white">
        <div className="space-y-2.5">
          {/* Sanskrit / Category Tag Shimmer */}
          <div className="flex items-center justify-between">
            <div className="h-3.5 bg-[#E2EFE7] rounded-full w-24 animate-shimmer" />
            <div className="h-3.5 bg-[#EAF5EF] rounded-full w-12 animate-shimmer" />
          </div>

          {/* Product Name Title Shimmer */}
          <div className="space-y-1.5">
            <div className="h-5 bg-[#DCEFE3] rounded-md w-5/6 animate-shimmer" />
            <div className="h-4 bg-[#EAF5EF] rounded-md w-3/5 animate-shimmer" />
          </div>

          {/* Tagline / Subtitle Shimmer */}
          <div className="h-3 bg-[#F0FAF4] rounded-md w-full animate-shimmer" />
        </div>

        {/* Price & Action Buttons Shimmer */}
        <div className="pt-3 border-t border-[#EDF7F1] space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div className="h-6 bg-[#DCEFE3] rounded-lg w-28 animate-shimmer" />
            <div className="h-4 bg-[#E2EFE7] rounded-md w-14 animate-shimmer" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="h-9 bg-[#E2EFE7] rounded-full animate-shimmer" />
            <div className="h-9 bg-[#DCEFE3] rounded-full animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Grid of ProductCardSkeleton
 */
export const ProductGridSkeleton: React.FC<{ count?: number; isModern?: boolean }> = ({ 
  count = 6, 
  isModern = false 
}) => {
  return (
    <div className={
      isModern
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5'
        : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
    }>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} isModern={isModern} />
      ))}
    </div>
  );
};

/**
 * Horizontal Shelf Shimmer Skeleton with full-width 3D wooden shelf base
 */
export const HorizontalShelfSkeleton: React.FC = () => {
  return (
    <div className="w-full relative py-2">
      {/* Shelf Header Shimmer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E2EBE5]">
          <div className="space-y-1.5">
            <div className="h-4 bg-[#DCEFE3] rounded-full w-28 animate-shimmer" />
            <div className="h-6 bg-[#DCEFE3] rounded-md w-56 animate-shimmer" />
            <div className="h-3 bg-[#EAF5EF] rounded-md w-64 animate-shimmer" />
          </div>
          <div className="h-8 bg-[#E2EFE7] rounded-full w-24 animate-shimmer" />
        </div>
      </div>

      {/* Horizontal Cards Row Shimmer with Normal Curved Cards */}
      <div className="relative w-full">
        <div className="flex gap-4 sm:gap-5 overflow-x-hidden pt-3 pb-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center shrink-0">
              <div className="w-[195px] sm:w-[215px] md:w-[230px] bg-white rounded-2xl border border-[#DCEFE3] overflow-hidden flex flex-col p-0 space-y-0 shadow-2xs">
                <div className="aspect-square w-full rounded-t-2xl bg-[#EBF4EE] animate-shimmer" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-[#DCEFE3] rounded-md w-3/4 animate-shimmer" />
                  <div className="h-3 bg-[#EAF5EF] rounded-md w-1/2 animate-shimmer" />
                  <div className="h-5 bg-[#DCEFE3] rounded-md w-20 animate-shimmer mt-2" />
                </div>
              </div>
              {/* Floor contact shadow shimmer */}
              <div className="w-3/4 h-3.5 mt-1.5 ayurvedic-shelf-shadow rounded-full opacity-30" />
            </div>
          ))}
        </div>

        {/* 3D Wooden Shelf Base Platform */}
        <div className="w-full pointer-events-none select-none mt-0.5">
          <div className="h-3 sm:h-3.5 w-full ayurvedic-shelf-top" />
          <div className="h-3.5 sm:h-4 w-full ayurvedic-shelf-front" />
        </div>
      </div>
    </div>
  );
};

/**
 * Category Pills Shimmer Skeleton
 */
export const CategoryPillsSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-2 overflow-x-hidden py-2 px-4">
      {Array.from({ length: 7 }).map((_, index) => (
        <div 
          key={index} 
          className="h-9 bg-[#EBF4EE] rounded-full animate-shimmer shrink-0" 
          style={{ width: `${75 + (index % 4) * 20}px` }} 
        />
      ))}
    </div>
  );
};

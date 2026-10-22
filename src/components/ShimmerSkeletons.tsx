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
 * Horizontal Shelf Shimmer Skeleton
 */
export const HorizontalShelfSkeleton: React.FC = () => {
  return (
    <div className="py-6 space-y-4">
      {/* Shelf Header Shimmer */}
      <div className="flex items-center justify-between px-4 sm:px-6">
        <div className="space-y-1.5">
          <div className="h-6 bg-[#DCEFE3] rounded-md w-48 animate-shimmer" />
          <div className="h-3.5 bg-[#EAF5EF] rounded-md w-64 animate-shimmer" />
        </div>
        <div className="h-8 bg-[#E2EFE7] rounded-full w-24 animate-shimmer" />
      </div>

      {/* Horizontal Cards Row Shimmer */}
      <div className="flex gap-4 overflow-x-hidden px-4 sm:px-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div 
            key={index} 
            className="w-[200px] sm:w-[220px] md:w-[240px] shrink-0 bg-white rounded-3xl border border-[#DCEFE3] overflow-hidden flex flex-col"
          >
            <div className="aspect-4/3 w-full bg-[#EBF4EE] animate-shimmer" />
            <div className="p-3.5 space-y-2">
              <div className="h-4 bg-[#DCEFE3] rounded-md w-3/4 animate-shimmer" />
              <div className="h-3 bg-[#EAF5EF] rounded-md w-1/2 animate-shimmer" />
              <div className="h-5 bg-[#DCEFE3] rounded-md w-20 animate-shimmer mt-2" />
            </div>
          </div>
        ))}
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

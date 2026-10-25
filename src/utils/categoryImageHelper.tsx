import React from 'react';
import { CategoryItem, CategoryAppearanceConfig, SiteSettings } from '../types/pharmacy';
import { DEFAULT_CATEGORIES } from '../data/herbalProducts';

/**
 * Retrieves the configured image URL for a category.
 */
export function getCategoryImageUrl(
  categoryId: string,
  categories: CategoryItem[] = [],
  appearance?: CategoryAppearanceConfig
): string | undefined {
  if (categoryId === 'all') {
    if (appearance?.showAllProductsImage === false) return undefined;
    return appearance?.allProductsImageUrl || categories.find((c) => c.id === 'all')?.imageUrl;
  }

  const found = categories.find((c) => c.id === categoryId) || DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
  if (found) {
    if (found.showImage === false) return undefined;
    if (found.imageUrl) return found.imageUrl;
  }

  return undefined;
}

/**
 * Retrieves the configured image URL for an Ayurvedic physical form (e.g. Churna, Vati, Syrup).
 */
export function getFormImageUrl(
  formName: string,
  appearance?: CategoryAppearanceConfig
): string | undefined {
  if (!formName) return undefined;

  if (formName === 'all') {
    if (appearance?.showAllFormsImage === false) return undefined;
    return appearance?.allFormsImageUrl;
  }

  const formImages = appearance?.formImages;
  if (!formImages) return undefined;

  // Direct exact match
  if (formImages[formName]) {
    if (formImages[formName].showImage === false) return undefined;
    if (formImages[formName].imageUrl) return formImages[formName].imageUrl;
  }

  // Fuzzy / normalized match (e.g. "Churna" vs "Churna (Powder)")
  const lower = formName.toLowerCase().trim();
  for (const [key, config] of Object.entries(formImages)) {
    if (config.showImage === false) continue;
    const keyLower = key.toLowerCase();
    if (keyLower === lower || keyLower.startsWith(lower) || lower.startsWith(keyLower)) {
      if (config.imageUrl) return config.imageUrl;
    }
  }

  return undefined;
}

/**
 * Helper to get shape class
 */
export function getImageShapeClass(appearance?: CategoryAppearanceConfig): string {
  const shape = appearance?.imageShape || 'circle';
  if (shape === 'circle') return 'rounded-full';
  if (shape === 'rounded') return 'rounded-md';
  return 'rounded-xs';
}

/**
 * Helper to get layout direction based on admin set position
 */
export function getImagePlacementClass(appearance?: CategoryAppearanceConfig): {
  isRight: boolean;
  isTop: boolean;
  isBottom: boolean;
  isLeft: boolean;
} {
  const pos = appearance?.imagePosition || 'left';
  return {
    isRight: pos === 'right',
    isTop: pos === 'top',
    isBottom: pos === 'bottom',
    isLeft: pos === 'left' || (!['right', 'top', 'bottom'].includes(pos)),
  };
}

interface MiniBadgeItemProps {
  label: string;
  imageUrl?: string;
  appearance?: CategoryAppearanceConfig;
  sizePx?: number;
  className?: string;
  imgClassName?: string;
  fallbackIcon?: React.ReactNode;
}

/**
 * Minimal small badge item with image positioned left, right, top or bottom according to admin configuration.
 */
export const MiniBadgeItem: React.FC<MiniBadgeItemProps> = ({
  label,
  imageUrl,
  appearance,
  sizePx = 18,
  className = '',
  imgClassName = '',
  fallbackIcon,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const placement = getImagePlacementClass(appearance);
  const shapeClass = getImageShapeClass(appearance);
  const showImage = Boolean(imageUrl && !imgError && appearance?.showImages !== false);

  const visualNode = showImage ? (
    <img
      src={imageUrl}
      alt=""
      onError={() => setImgError(true)}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
      className={`shrink-0 object-cover ${shapeClass} border border-black/10 shadow-2xs ${imgClassName}`}
    />
  ) : fallbackIcon ? (
    <span className="shrink-0 inline-flex items-center justify-center">
      {fallbackIcon}
    </span>
  ) : null;

  if (placement.isTop) {
    return (
      <span className={`inline-flex flex-col items-center gap-1 ${className}`}>
        {visualNode}
        <span>{label}</span>
      </span>
    );
  }

  if (placement.isBottom) {
    return (
      <span className={`inline-flex flex-col items-center gap-1 ${className}`}>
        <span>{label}</span>
        {visualNode}
      </span>
    );
  }

  if (placement.isRight) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <span>{label}</span>
        {visualNode}
      </span>
    );
  }

  // Default is left
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {visualNode}
      <span>{label}</span>
    </span>
  );
};

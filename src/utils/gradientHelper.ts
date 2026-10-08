import React from 'react';

export type GradientOverlayStyle = 
  | 'none'
  | 'black'
  | 'white'
  | 'emerald'
  | 'glass_dark'
  | 'glass_light';

export interface GradientOptionDef {
  value: GradientOverlayStyle;
  label: string;
  badge: string;
  previewBg: string;
  description: string;
}

export const GRADIENT_OVERLAY_OPTIONS: GradientOptionDef[] = [
  {
    value: 'none',
    label: 'None / Off (Pure Clean Photo)',
    badge: 'Clean Photo',
    previewBg: 'bg-transparent border border-dashed border-[#DDD5C5]',
    description: 'No bottom dark gradient. 100% original photo view.',
  },
  {
    value: 'black',
    label: 'Black / Dark Gradient',
    badge: 'Dark Fade',
    previewBg: 'bg-linear-to-t from-black/85 via-black/40 to-transparent',
    description: 'Smooth dark gradient fade from bottom with soft top melt.',
  },
  {
    value: 'white',
    label: 'White / Light Gradient',
    badge: 'Light Fade',
    previewBg: 'bg-linear-to-t from-white/90 via-white/40 to-transparent',
    description: 'Soft white gradient fade from bottom with clean aesthetic.',
  },
  {
    value: 'emerald',
    label: 'Ayurvedic Emerald Green Gradient',
    badge: 'Herbal Green',
    previewBg: 'bg-linear-to-t from-[#14291D]/90 via-[#14291D]/40 to-transparent',
    description: 'Rich botanical Ayurvedic deep forest green gradient fade.',
  },
  {
    value: 'glass_dark',
    label: 'Blur Glassy Dark Frosted',
    badge: 'Glass Dark',
    previewBg: 'backdrop-blur-md bg-black/40',
    description: 'Frosted glass blur with smooth top fade into picture (no hard border).',
  },
  {
    value: 'glass_light',
    label: 'Blur Glassy Light Frosted',
    badge: 'Glass Light',
    previewBg: 'backdrop-blur-md bg-white/45',
    description: 'Crystal frosted glass blur with smooth top fade into photo.',
  },
];

// Dynamic smooth top fade mask to melt the blur and gradient seamlessly into the image without any hard edge.
// Controls the upper fade curve with silky cubic-ease stops so blur/glassy textures transition invisibly.
export function createSmoothTopFadeMask(fadeSoftnessPercent: number = 75): React.CSSProperties {
  const fade = Math.min(100, Math.max(15, fadeSoftnessPercent !== undefined && !isNaN(fadeSoftnessPercent) ? fadeSoftnessPercent : 75));
  // solidStop is where the 100% solid bottom ends, and the upper fade begins
  const solidStop = Math.max(0, 100 - fade);
  const span = 100 - solidStop;
  
  const stop1 = Math.round(solidStop + span * 0.18);
  const stop2 = Math.round(solidStop + span * 0.42);
  const stop3 = Math.round(solidStop + span * 0.70);
  const stop4 = Math.round(solidStop + span * 0.90);

  const maskGradient = `linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${solidStop}%, rgba(0,0,0,0.92) ${stop1}%, rgba(0,0,0,0.65) ${stop2}%, rgba(0,0,0,0.28) ${stop3}%, rgba(0,0,0,0.06) ${stop4}%, rgba(0,0,0,0) 100%)`;

  return {
    WebkitMaskImage: maskGradient,
    maskImage: maskGradient,
  };
}

export interface OverlayConfigResult {
  hasOverlay: boolean;
  overlayClass: string;
  overlayStyleObj: React.CSSProperties;
  isLightText: boolean;
  titleBoxClass: string;
}

/**
 * Returns overlay CSS configuration for Image Banner Scroller
 */
export function getScrollerOverlayConfig(
  style?: GradientOverlayStyle,
  opacityPercent?: number,
  coveragePercent?: number,
  fadeSoftnessPercent?: number
): OverlayConfigResult {
  const resolved = style || 'none';
  if (resolved === 'none') {
    return {
      hasOverlay: false,
      overlayClass: '',
      overlayStyleObj: {},
      isLightText: true,
      titleBoxClass: 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]',
    };
  }

  const opacity = Math.min(100, Math.max(10, opacityPercent !== undefined && !isNaN(opacityPercent) ? opacityPercent : 85));
  const coverage = Math.min(100, Math.max(15, coveragePercent !== undefined && !isNaN(coveragePercent) ? coveragePercent : 50));
  const fade = Math.min(100, Math.max(15, fadeSoftnessPercent !== undefined && !isNaN(fadeSoftnessPercent) ? fadeSoftnessPercent : 75));

  let specificStyle: React.CSSProperties = {};
  let isLight = true;

  switch (resolved) {
    case 'black':
      specificStyle = {
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.94) 0%, rgba(0, 0, 0, 0.65) 40%, rgba(0, 0, 0, 0.18) 78%, transparent 100%)',
      };
      isLight = true;
      break;
    case 'white':
      specificStyle = {
        background: 'linear-gradient(to top, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.68) 40%, rgba(255, 255, 255, 0.2) 78%, transparent 100%)',
      };
      isLight = false;
      break;
    case 'emerald':
      specificStyle = {
        background: 'linear-gradient(to top, rgba(20, 41, 29, 0.96) 0%, rgba(20, 41, 29, 0.65) 40%, rgba(20, 41, 29, 0.18) 78%, transparent 100%)',
      };
      isLight = true;
      break;
    case 'glass_dark':
      specificStyle = {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.68) 0%, rgba(0, 0, 0, 0.42) 40%, rgba(0, 0, 0, 0.12) 80%, transparent 100%)',
      };
      isLight = true;
      break;
    case 'glass_light':
      specificStyle = {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'linear-gradient(to top, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.5) 40%, rgba(255, 255, 255, 0.15) 80%, transparent 100%)',
      };
      isLight = false;
      break;
  }

  const maskStyles = createSmoothTopFadeMask(fade);

  const overlayStyleObj: React.CSSProperties = {
    ...maskStyles,
    ...specificStyle,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: `${coverage}%`,
    opacity: opacity / 100,
    pointerEvents: 'none',
    zIndex: 5,
  };

  return {
    hasOverlay: true,
    overlayClass: 'pointer-events-none',
    overlayStyleObj,
    isLightText: isLight,
    titleBoxClass: isLight ? 'text-white drop-shadow-xs' : 'text-[#14291D]',
  };
}

/**
 * Returns overlay CSS configuration for Product Primary Image (Cards, Monograph, Detail)
 */
export function getProductOverlayConfig(
  productStyle?: GradientOverlayStyle | 'default',
  storeDefault: GradientOverlayStyle = 'none',
  customOpacity?: number,
  storeOpacity?: number,
  customCoverage?: number,
  storeCoverage?: number,
  customFadeSoftness?: number,
  storeFadeSoftness?: number
): {
  hasOverlay: boolean;
  overlayClass: string;
  overlayStyleObj: React.CSSProperties;
} {
  const resolved: GradientOverlayStyle = 
    productStyle && productStyle !== 'default' 
      ? productStyle 
      : storeDefault;

  if (resolved === 'none') {
    return {
      hasOverlay: false,
      overlayClass: '',
      overlayStyleObj: {},
    };
  }

  const opacityVal = customOpacity !== undefined && !isNaN(customOpacity)
    ? customOpacity
    : (storeOpacity !== undefined && !isNaN(storeOpacity) ? storeOpacity : 85);

  const coverageVal = customCoverage !== undefined && !isNaN(customCoverage)
    ? customCoverage
    : (storeCoverage !== undefined && !isNaN(storeCoverage) ? storeCoverage : 42);

  const fadeVal = customFadeSoftness !== undefined && !isNaN(customFadeSoftness)
    ? customFadeSoftness
    : (storeFadeSoftness !== undefined && !isNaN(storeFadeSoftness) ? storeFadeSoftness : 75);

  const opacity = Math.min(100, Math.max(10, opacityVal));
  const coverage = Math.min(100, Math.max(15, coverageVal));
  const fade = Math.min(100, Math.max(15, fadeVal));

  let specificStyle: React.CSSProperties = {};

  switch (resolved) {
    case 'black':
      specificStyle = {
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.90) 0%, rgba(0, 0, 0, 0.55) 40%, rgba(0, 0, 0, 0.12) 78%, transparent 100%)',
      };
      break;
    case 'white':
      specificStyle = {
        background: 'linear-gradient(to top, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.60) 40%, rgba(255, 255, 255, 0.15) 78%, transparent 100%)',
      };
      break;
    case 'emerald':
      specificStyle = {
        background: 'linear-gradient(to top, rgba(20, 41, 29, 0.94) 0%, rgba(20, 41, 29, 0.58) 40%, rgba(20, 41, 29, 0.14) 78%, transparent 100%)',
      };
      break;
    case 'glass_dark':
      specificStyle = {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.38) 40%, rgba(0, 0, 0, 0.10) 80%, transparent 100%)',
      };
      break;
    case 'glass_light':
      specificStyle = {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'linear-gradient(to top, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.44) 40%, rgba(255, 255, 255, 0.12) 80%, transparent 100%)',
      };
      break;
  }

  const maskStyles = createSmoothTopFadeMask(fade);

  const overlayStyleObj: React.CSSProperties = {
    ...maskStyles,
    ...specificStyle,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: `${coverage}%`,
    opacity: opacity / 100,
    pointerEvents: 'none',
    zIndex: 5,
  };

  return {
    hasOverlay: true,
    overlayClass: 'pointer-events-none z-5',
    overlayStyleObj,
  };
}

/**
 * Backward compatibility helper returning CSS class string
 */
export function getProductBottomOverlayClasses(
  productStyle?: GradientOverlayStyle | 'default',
  storeDefault: GradientOverlayStyle = 'none'
): string | null {
  const config = getProductOverlayConfig(productStyle, storeDefault);
  return config.hasOverlay ? 'pointer-events-none z-5' : null;
}

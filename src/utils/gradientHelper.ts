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
    description: 'Smooth dark gradient fade from bottom.',
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
    description: 'Rich botanical Ayurvedic deep forest green gradient.',
  },
  {
    value: 'glass_dark',
    label: 'Blur Glassy Dark Frosted',
    badge: 'Glass Dark',
    previewBg: 'backdrop-blur-md bg-black/40 border-t border-white/15',
    description: 'Modern frosted glass blur effect with dark tint.',
  },
  {
    value: 'glass_light',
    label: 'Blur Glassy Light Frosted',
    badge: 'Glass Light',
    previewBg: 'backdrop-blur-md bg-white/45 border-t border-white/25',
    description: 'Bright frosted glass blur effect with light tint.',
  },
];

/**
 * Returns overlay CSS classes for Product Primary Image (Cards, Monograph, Detail)
 */
export function getProductBottomOverlayClasses(
  productStyle?: GradientOverlayStyle | 'default',
  storeDefault: GradientOverlayStyle = 'none'
): string | null {
  const resolved: GradientOverlayStyle = 
    productStyle && productStyle !== 'default' 
      ? productStyle 
      : storeDefault;

  switch (resolved) {
    case 'black':
      return 'absolute bottom-0 inset-x-0 h-20 bg-linear-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-5';
    case 'white':
      return 'absolute bottom-0 inset-x-0 h-20 bg-linear-to-t from-white/85 via-white/30 to-transparent pointer-events-none z-5';
    case 'emerald':
      return 'absolute bottom-0 inset-x-0 h-20 bg-linear-to-t from-[#14291D]/85 via-[#14291D]/30 to-transparent pointer-events-none z-5';
    case 'glass_dark':
      return 'absolute bottom-0 inset-x-0 h-12 backdrop-blur-md bg-black/35 border-t border-white/15 pointer-events-none z-5';
    case 'glass_light':
      return 'absolute bottom-0 inset-x-0 h-12 backdrop-blur-md bg-white/45 border-t border-white/25 pointer-events-none z-5';
    case 'none':
    default:
      return null;
  }
}

/**
 * Returns overlay CSS configuration for Image Banner Scroller
 */
export function getScrollerOverlayConfig(style?: GradientOverlayStyle): {
  hasOverlay: boolean;
  overlayClass: string;
  isLightText: boolean;
  titleBoxClass: string;
} {
  const resolved = style || 'none';

  switch (resolved) {
    case 'black':
      return {
        hasOverlay: true,
        overlayClass: 'absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent pointer-events-none',
        isLightText: true,
        titleBoxClass: 'text-white drop-shadow-xs',
      };
    case 'white':
      return {
        hasOverlay: true,
        overlayClass: 'absolute inset-0 bg-linear-to-t from-white/90 via-white/35 to-transparent pointer-events-none',
        isLightText: false,
        titleBoxClass: 'text-[#14291D]',
      };
    case 'emerald':
      return {
        hasOverlay: true,
        overlayClass: 'absolute inset-0 bg-linear-to-t from-[#14291D]/90 via-[#14291D]/35 to-transparent pointer-events-none',
        isLightText: true,
        titleBoxClass: 'text-white drop-shadow-xs',
      };
    case 'glass_dark':
      return {
        hasOverlay: true,
        overlayClass: 'absolute bottom-0 inset-x-0 h-18 backdrop-blur-md bg-black/45 border-t border-white/15 pointer-events-none',
        isLightText: true,
        titleBoxClass: 'text-white drop-shadow-xs',
      };
    case 'glass_light':
      return {
        hasOverlay: true,
        overlayClass: 'absolute bottom-0 inset-x-0 h-18 backdrop-blur-md bg-white/50 border-t border-white/25 pointer-events-none',
        isLightText: false,
        titleBoxClass: 'text-[#14291D]',
      };
    case 'none':
    default:
      return {
        hasOverlay: false,
        overlayClass: '',
        isLightText: true,
        // When no overlay is selected, subtle backdrop badge ensures title/subtitle remain readable if present
        titleBoxClass: 'text-white bg-black/45 backdrop-blur-xs px-2.5 py-1 rounded-lg w-fit max-w-full drop-shadow-xs',
      };
  }
}

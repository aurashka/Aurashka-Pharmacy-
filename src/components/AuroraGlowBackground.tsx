import React from 'react';

interface AuroraGlowBackgroundProps {
  className?: string;
  intensity?: 'subtle' | 'gentle' | 'vibrant';
  /**
   * If true, keeps the blobs contained within the container. Default true.
   */
  contained?: boolean;
}

/**
 * AuroraGlowBackground:
 * Renders ethereal, ambient Aurora Borealis lighting with:
 * - Light Green (#34D399 / emerald)
 * - Light Blue (#60A5FA / sky-blue)
 * - Soft Red / Coral (#FB7185 / rose-red)
 * - Light Yellow / Amber (#FBBF24 / warm yellow)
 *
 * Designed with high-diffusion blurs and organic motion to perfectly complement
 * high-blur white glassmorphic cards and buttons.
 */
export const AuroraGlowBackground: React.FC<AuroraGlowBackgroundProps> = ({
  className = '',
  intensity = 'subtle',
  contained = true,
}) => {
  const opacityMultiplier =
    intensity === 'subtle' ? 'opacity-85' : intensity === 'gentle' ? 'opacity-95' : 'opacity-100';

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none z-0 overflow-hidden ${opacityMultiplier} ${className}`}
    >
      {/* 1. Light Green Aurora Ribbon (Top Left & Center Flow) */}
      <div
        className="absolute -top-[12%] -left-[8%] w-[55vw] max-w-[580px] h-[55vw] max-h-[580px] rounded-full bg-linear-to-br from-emerald-300/40 via-teal-200/25 to-transparent blur-[80px] sm:blur-[115px] animate-aurora-1"
      />

      {/* 2. Light Blue Aurora Ribbon (Top Right & Diagonal Sweep) */}
      <div
        className="absolute top-[10%] -right-[10%] w-[52vw] max-w-[540px] h-[52vw] max-h-[540px] rounded-full bg-linear-to-bl from-sky-300/35 via-blue-200/25 to-transparent blur-[85px] sm:blur-[120px] animate-aurora-2"
      />

      {/* 3. Soft Red / Coral Aurora Ribbon (Bottom Left Glow) */}
      <div
        className="absolute -bottom-[12%] -left-[6%] w-[48vw] max-w-[500px] h-[48vw] max-h-[500px] rounded-full bg-linear-to-tr from-rose-300/30 via-red-200/20 to-transparent blur-[80px] sm:blur-[110px] animate-aurora-3"
      />

      {/* 4. Light Yellow / Amber Aurora Ribbon (Bottom Right & Center Radiance) */}
      <div
        className="absolute bottom-[8%] right-[5%] w-[46vw] max-w-[480px] h-[46vw] max-h-[480px] rounded-full bg-linear-to-tl from-amber-200/40 via-yellow-100/30 to-transparent blur-[80px] sm:blur-[115px] animate-aurora-4"
      />

      {/* 5. Center Soft Aurora Prismatic Blend */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75vw] max-w-[850px] h-[55vw] max-h-[600px] rounded-full bg-radial from-emerald-100/20 via-sky-100/15 to-transparent blur-[100px] pointer-events-none"
      />
    </div>
  );
};

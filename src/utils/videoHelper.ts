// Utility helpers for YouTube and direct playable videos

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * (e.g., watch?v=, youtu.be/, shorts/, embed/)
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // If user entered just an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Common patterns
  // 1. youtube.com/watch?v=VIDEO_ID
  // 2. youtube.com/shorts/VIDEO_ID
  // 3. youtu.be/VIDEO_ID
  // 4. youtube.com/embed/VIDEO_ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regExp);

  return match && match[1] ? match[1] : null;
}

/**
 * Detects whether the URL is a YouTube video, a direct video (mp4, webm, etc.), or none
 */
export function detectVideoType(url?: string): 'youtube' | 'direct' | 'none' {
  if (!url || typeof url !== 'string') return 'none';
  const trimmed = url.trim();
  if (!trimmed) return 'none';

  if (getYouTubeVideoId(trimmed)) {
    return 'youtube';
  }

  // Check if it's a URL
  if (
    trimmed.startsWith('http://') || 
    trimmed.startsWith('https://') || 
    trimmed.startsWith('/') || 
    trimmed.startsWith('blob:')
  ) {
    return 'direct';
  }

  return 'none';
}

/**
 * Returns the embed URL for YouTube videos
 */
export function getYouTubeEmbedUrl(urlOrId: string, autoPlay: boolean = true): string | null {
  const videoId = getYouTubeVideoId(urlOrId);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? '1' : '0'}&rel=0&modestbranding=1`;
}

/**
 * Returns high-quality thumbnail image URL for YouTube videos
 */
export function getYouTubeThumbnail(urlOrId: string): string | null {
  const videoId = getYouTubeVideoId(urlOrId);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Validates if the string is a playable video URL
 */
export function isValidVideoUrl(url?: string): boolean {
  return detectVideoType(url) !== 'none';
}

export type ProductMediaItem =
  | { type: 'image'; url: string; label?: string }
  | { type: 'video'; url: string; videoType: 'youtube' | 'direct'; poster?: string; label?: string };

/**
 * Builds the combined list of media (photos + videos) for a product and selected variety
 */
export function buildProductMediaList(
  product: { image?: string; images?: string[]; videoUrl?: string; videoType?: 'youtube' | 'direct' | 'none' } | null,
  selectedVariant?: { image?: string; images?: string[]; videoUrl?: string; videoType?: 'youtube' | 'direct' | 'none' } | null
): ProductMediaItem[] {
  if (!product) return [];

  const mediaList: ProductMediaItem[] = [];
  const addedImageUrls = new Set<string>();

  // 1. Variant Photos (if selected variety has separate photos or image)
  if (selectedVariant?.images && Array.isArray(selectedVariant.images) && selectedVariant.images.length > 0) {
    selectedVariant.images
      .filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
      .forEach((img) => {
        if (!addedImageUrls.has(img)) {
          addedImageUrls.add(img);
          mediaList.push({ type: 'image', url: img, label: 'Variety Photo' });
        }
      });
  } else if (selectedVariant?.image && selectedVariant.image.trim().length > 0) {
    addedImageUrls.add(selectedVariant.image.trim());
    mediaList.push({ type: 'image', url: selectedVariant.image.trim(), label: 'Variety Photo' });
  }

  // 2. Product Base Photos
  const rawProdImages = product.images;
  const prodImgs: string[] = Array.isArray(rawProdImages)
    ? rawProdImages
    : (rawProdImages && typeof rawProdImages === 'object' ? Object.values(rawProdImages) : []);

  if (prodImgs.length > 0) {
    prodImgs
      .filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
      .forEach((img) => {
        if (!addedImageUrls.has(img)) {
          addedImageUrls.add(img);
          mediaList.push({ type: 'image', url: img, label: 'Product Photo' });
        }
      });
  } else if (product.image && product.image.trim().length > 0 && !addedImageUrls.has(product.image.trim())) {
    addedImageUrls.add(product.image.trim());
    mediaList.push({ type: 'image', url: product.image.trim(), label: 'Product Photo' });
  }

  // Fallback if no images found at all
  if (mediaList.length === 0 && product.image) {
    mediaList.push({ type: 'image', url: product.image, label: 'Primary Photo' });
  }

  // 3. Attach Variety Video OR Product Video (alongside product images)
  const candidateVideoUrl = (selectedVariant?.videoUrl && selectedVariant.videoUrl.trim().length > 0)
    ? selectedVariant.videoUrl.trim()
    : (product.videoUrl && product.videoUrl.trim().length > 0 ? product.videoUrl.trim() : null);

  if (candidateVideoUrl) {
    const vType = detectVideoType(candidateVideoUrl);
    if (vType !== 'none') {
      const poster = vType === 'youtube' ? (getYouTubeThumbnail(candidateVideoUrl) || undefined) : undefined;
      const label = selectedVariant?.videoUrl ? 'Variety Video' : 'Product Video';
      mediaList.push({
        type: 'video',
        url: candidateVideoUrl,
        videoType: vType,
        poster,
        label,
      });
    }
  }

  return mediaList;
}

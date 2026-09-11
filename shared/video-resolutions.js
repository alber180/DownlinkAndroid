// Fuente única de nombres y descripciones de resolución para todas las plataformas.
// Las resoluciones no estándar se conservan con su valor real.
export const VIDEO_RESOLUTIONS = Object.freeze([
  { resolution: 4320, label: '4320p', description: '8K' },
  { resolution: 2160, label: '2160p', description: '4K' },
  { resolution: 1440, label: '1440p', description: '2K' },
  { resolution: 1080, label: '1080p', description: 'Full HD' },
  { resolution: 720, label: '720p', description: 'HD' },
  { resolution: 480, label: '480p', description: 'SD' },
  { resolution: 360, label: '360p', description: 'SD' },
  { resolution: 240, label: '240p', description: 'SD' },
  { resolution: 144, label: '144p', description: 'SD' },
].map(Object.freeze));

export function getDisplayResolution(width, height, formatNote = '') {
  const notedResolution = String(formatNote).match(/(?:^|\D)(\d{3,4})p(?:\D|$)/i);
  if (notedResolution) return Number(notedResolution[1]);

  const numericWidth = Number(width);
  const numericHeight = Number(height);

  if (!Number.isFinite(numericHeight) || numericHeight <= 0) return null;
  const measuredResolution = !Number.isFinite(numericWidth) || numericWidth <= 0
    ? numericHeight
    : Math.min(numericWidth, numericHeight);

  const closestQuality = VIDEO_RESOLUTIONS.reduce((closest, quality) => {
    const distance = Math.abs(quality.resolution - measuredResolution);
    return distance < closest.distance ? { quality, distance } : closest;
  }, { quality: null, distance: Number.POSITIVE_INFINITY });

  // Algunos extractores devuelven la dimensión visible recortada (por ejemplo,
  // 2026 en un formato 2160p). Solo se ajusta si está realmente cerca del estándar.
  if (closestQuality.quality && closestQuality.distance / closestQuality.quality.resolution <= 0.08) {
    return closestQuality.quality.resolution;
  }

  return measuredResolution;
}

export function getVideoResolutionLabel(resolution) {
  const value = Number(resolution);
  if (!Number.isFinite(value) || value <= 0) return 'Mejor disponible';

  const exactQuality = VIDEO_RESOLUTIONS.find(quality => quality.resolution === value);
  if (exactQuality) return exactQuality.label;
  return `${Math.round(value)}p`;
}

export function getVideoResolutionDescription(label) {
  const qualityLabel = String(label).toUpperCase();
  if (qualityLabel === 'MEJOR DISPONIBLE') return 'Original';

  const exactQuality = VIDEO_RESOLUTIONS.find(
    quality => quality.label.toUpperCase() === qualityLabel
  );
  if (exactQuality) return exactQuality.description;

  const resolution = Number.parseInt(qualityLabel, 10);
  if (resolution >= 1440) return '2K';
  if (resolution >= 1080) return 'Full HD';
  if (resolution >= 720) return 'HD';
  return 'SD';
}

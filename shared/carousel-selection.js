const INSTAGRAM_HOST_PATTERN = /(^|\.)instagram\.com$/i;

export function getInstagramCarouselItemFromUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const normalizedUrl = /^https?:\/\//i.test(value.trim())
      ? value.trim()
      : `https://${value.trim()}`;
    const url = new URL(normalizedUrl);
    if (!INSTAGRAM_HOST_PATTERN.test(url.hostname)) return null;

    const rawIndex = url.searchParams.get('img_index');
    if (!rawIndex || !/^\d+$/.test(rawIndex)) return null;

    const index = Number(rawIndex);
    return Number.isSafeInteger(index) && index > 0 ? index : null;
  } catch {
    return null;
  }
}

export function getInitialCarouselVideoIndex(videos, value) {
  if (!Array.isArray(videos) || videos.length === 0) return 0;

  const requestedItem = getInstagramCarouselItemFromUrl(value);
  if (requestedItem === null) return 0;

  const indexedVideos = videos
    .map((video, carouselIndex) => ({
      carouselIndex,
      playlistItem: Number(video?.playlistItem),
    }))
    .filter(video => Number.isSafeInteger(video.playlistItem) && video.playlistItem > 0)
    .sort((a, b) => a.playlistItem - b.playlistItem);

  const exactVideo = indexedVideos.find(video => video.playlistItem === requestedItem);
  if (exactVideo) return exactVideo.carouselIndex;

  // Instagram cuenta también las imágenes. Si el enlace apunta a una de ellas,
  // se omite y se abre el siguiente vídeo; si no existe, se usa el anterior.
  const nextVideo = indexedVideos.find(video => video.playlistItem > requestedItem);
  if (nextVideo) return nextVideo.carouselIndex;

  return indexedVideos.at(-1)?.carouselIndex ?? 0;
}

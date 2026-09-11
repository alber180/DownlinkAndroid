// Fuente única de las calidades MP3 ofrecidas por la interfaz y el conversor.
export const MP3_QUALITIES = Object.freeze([
  { value: '0', label: '320 kbps (Mejor)', kbps: 320 },
  { value: '1', label: '256 kbps (Muy alta)', kbps: 256 },
  { value: '2', label: '224 kbps (Alta)', kbps: 224 },
  { value: '3', label: '192 kbps (Media alta)', kbps: 192 },
  { value: '4', label: '160 kbps (Media)', kbps: 160 },
  { value: '5', label: '128 kbps (Normal)', kbps: 128 },
  { value: '6', label: '96 kbps (Media baja)', kbps: 96 },
  { value: '7', label: '80 kbps (Baja)', kbps: 80 },
  { value: '8', label: '64 kbps (Muy baja)', kbps: 64 },
  { value: '9', label: '48 kbps (Peor)', kbps: 48 },
].map(Object.freeze));

const MP3_BITRATE_BY_VALUE = new Map(
  MP3_QUALITIES.map(quality => [quality.value, quality.kbps])
);

export function getMp3BitrateFromQuality(value) {
  return MP3_BITRATE_BY_VALUE.get(String(value ?? '0')) ?? MP3_QUALITIES[0].kbps;
}

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  readingTimeMinutes: number;
  topWords: { word: string; count: number }[];
  detectedLanguage: 'fa' | 'en' | 'mixed';
}

export function analyzeTextOffline(text: string): TextStats {
  if (!text.trim()) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      lines: 0,
      readingTimeMinutes: 0,
      topWords: [],
      detectedLanguage: 'fa',
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s+/g, '').length;
  const lines = text.split('\n').length;

  // Split words by spaces, punctuation
  const wordsArray = text
    .trim()
    .toLowerCase()
    .split(/[\s,،؛.:!؟?()\[\]{}"'«»]+/)
    .filter((w) => w.length > 1);

  const words = wordsArray.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 180));

  // Determine language ratio
  const persianChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const detectedLanguage =
    persianChars > englishChars * 2 ? 'fa' : englishChars > persianChars * 2 ? 'en' : 'mixed';

  // Common stop words to exclude from top words
  const stopWords = new Set([
    'در', 'به', 'از', 'که', 'این', 'را', 'با', 'است', 'برای', 'آن', 'یک', 'خود', 'تا', 'کرد', 'بر', 'هم', 'نیز', 'شد', 'وی',
    'the', 'and', 'to', 'of', 'a', 'in', 'is', 'that', 'for', 'it', 'as', 'was', 'with', 'on', 'be', 'by', 'at'
  ]);

  const frequencyMap = new Map<string, number>();
  for (const w of wordsArray) {
    if (!stopWords.has(w) && w.length > 2) {
      frequencyMap.set(w, (frequencyMap.get(w) || 0) + 1);
    }
  }

  const topWords = Array.from(frequencyMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    words,
    characters,
    charactersNoSpaces,
    lines,
    readingTimeMinutes,
    topWords,
    detectedLanguage,
  };
}

export interface ImageFilters {
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
  brightness?: number; // 0.5 to 2.0 (1.0 default)
  contrast?: number;   // 0.5 to 2.0 (1.0 default)
  watermarkText?: string;
  targetWidth?: number;
  targetHeight?: number;
}

export async function processImageOffline(
  imageSource: string,
  filters: ImageFilters
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = filters.targetWidth || img.naturalWidth || 800;
      const height = filters.targetHeight || img.naturalHeight || 800;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));

      // Build CSS filter string
      const cssFilters: string[] = [];
      if (filters.grayscale) cssFilters.push('grayscale(100%)');
      if (filters.sepia) cssFilters.push('sepia(100%)');
      if (filters.invert) cssFilters.push('invert(100%)');
      if (filters.brightness && filters.brightness !== 1) cssFilters.push(`brightness(${filters.brightness})`);
      if (filters.contrast && filters.contrast !== 1) cssFilters.push(`contrast(${filters.contrast})`);

      if (cssFilters.length > 0) {
        ctx.filter = cssFilters.join(' ');
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Reset filter before watermark
      ctx.filter = 'none';

      if (filters.watermarkText) {
        ctx.save();
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.textAlign = 'right';
        ctx.fillText(filters.watermarkText, width - 24, height - 24);
        ctx.restore();
      }

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('Failed to load image for offline processing'));
    img.src = imageSource;
  });
}

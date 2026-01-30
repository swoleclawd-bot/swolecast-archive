export function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

export function getYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|\/)([\w-]{11})/);
  return match ? match[1] : null;
}

export function highlightText(text: string, query: string): string {
  if (!query || !text) return text;
  const terms = query.split(/\s+/).filter(t => t.length > 1);
  let result = text;
  for (const term of terms) {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    result = result.replace(regex, '|||$1|||');
  }
  return result;
}

export function extractTitle(fullTitle: string): string {
  // Many titles start with "Swolecast, " or "Swolecast - "
  // Extract the meaningful part after the date if present
  const cleaned = fullTitle
    .replace(/^Swolecast,?\s*/i, '')
    .replace(/^-\s*/, '');
  return cleaned || fullTitle;
}

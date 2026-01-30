import { getDb, SearchResult } from './db';

function extractSnippet(content: string, query: string, contextChars: number = 150): string {
  const lowerContent = content.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

  let bestPos = -1;
  for (const term of terms) {
    const pos = lowerContent.indexOf(term);
    if (pos !== -1) {
      bestPos = pos;
      break;
    }
  }

  if (bestPos === -1) {
    // Fallback: skip any header lines, return first meaningful chunk
    const lines = content.split('\n').filter(l => !l.startsWith('#') && l.trim().length > 0);
    return lines.length > 0 ? lines[0].substring(0, contextChars * 2) + '...' : content.substring(0, contextChars * 2);
  }

  const start = Math.max(0, bestPos - contextChars);
  const end = Math.min(content.length, bestPos + contextChars);

  let snippet = content.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';

  return snippet;
}

export function searchEpisodes(query: string, limit: number = 20): SearchResult[] {
  if (!query || query.trim().length === 0) return [];

  const db = getDb();

  // FTS5 query - escape special characters and build search terms
  const cleanQuery = query
    .replace(/[^\w\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 0)
    .join(' OR ');

  if (!cleanQuery) return [];

  try {
    const rows = db.prepare(`
      SELECT
        e.id,
        e.title,
        e.published_at,
        e.duration_seconds,
        e.youtube_url,
        e.transcript_word_count,
        t.content
      FROM transcripts_fts fts
      JOIN transcripts t ON t.episode_id = fts.episode_id
      JOIN episodes e ON e.id = fts.episode_id
      WHERE transcripts_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `).all(cleanQuery, limit) as (SearchResult & { content: string })[];

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      published_at: row.published_at,
      duration_seconds: row.duration_seconds,
      youtube_url: row.youtube_url,
      transcript_word_count: row.transcript_word_count,
      snippet: extractSnippet(row.content, query),
    }));
  } catch {
    // FTS query parse errors - return empty
    return [];
  }
}

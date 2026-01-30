import { getDb, Episode, Transcript } from './db';

export function getAllEpisodes(): Episode[] {
  const db = getDb();
  return db.prepare(`
    SELECT id, title, description, published_at, duration_seconds,
           view_count, like_count, comment_count, thumbnail_url,
           youtube_url, has_transcript, transcript_word_count
    FROM episodes
    ORDER BY published_at DESC
  `).all() as Episode[];
}

export function getEpisodeById(id: string): Episode | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT id, title, description, published_at, duration_seconds,
           view_count, like_count, comment_count, thumbnail_url,
           youtube_url, has_transcript, transcript_word_count
    FROM episodes
    WHERE id = ?
  `).get(id) as Episode | undefined;
}

export function getTranscript(episodeId: string): Transcript | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT episode_id, content, word_count
    FROM transcripts
    WHERE episode_id = ?
  `).get(episodeId) as Transcript | undefined;
}

export function getRecentEpisodes(limit: number = 8): Episode[] {
  const db = getDb();
  return db.prepare(`
    SELECT id, title, description, published_at, duration_seconds,
           view_count, like_count, comment_count, thumbnail_url,
           youtube_url, has_transcript, transcript_word_count
    FROM episodes
    ORDER BY published_at DESC
    LIMIT ?
  `).all(limit) as Episode[];
}

export function getEpisodeCount(): number {
  const db = getDb();
  const result = db.prepare('SELECT COUNT(*) as count FROM episodes').get() as { count: number };
  return result.count;
}

export function getTotalWordCount(): number {
  const db = getDb();
  const result = db.prepare('SELECT COALESCE(SUM(transcript_word_count), 0) as total FROM episodes').get() as { total: number };
  return result.total;
}

import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'swolecast.db');
    db = new Database(dbPath, { readonly: true, fileMustExist: true });
  }
  return db;
}

// Types
export interface Episode {
  id: string;
  title: string;
  description: string | null;
  published_at: string | null;
  duration_seconds: number | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  thumbnail_url: string | null;
  youtube_url: string | null;
  has_transcript: number;
  transcript_word_count: number;
}

export interface Transcript {
  episode_id: string;
  content: string;
  word_count: number;
}

export interface SearchResult {
  id: string;
  title: string;
  published_at: string | null;
  duration_seconds: number | null;
  youtube_url: string | null;
  transcript_word_count: number;
  snippet: string;
}

export interface Highlight {
  id: string;
  quote: string;
  episode_id: string;
  episode_title: string;
  host: string;
  tags: string[];
  timestamp_seconds?: number;
}

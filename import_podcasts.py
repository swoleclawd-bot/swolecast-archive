#!/usr/bin/env python3
"""
Import podcast transcripts from swolecast-archive into the Vercel project database.
"""

import sqlite3
import json
from pathlib import Path
from datetime import datetime

# Source: our cleaned podcast data
SOURCE_DB = Path.home() / "clawd/projects/swolecast-db/swolecast.db"
# Target: the Vercel project database
TARGET_DB = Path(__file__).parent / "data/swolecast.db"

def import_podcasts():
    source = sqlite3.connect(SOURCE_DB)
    source.row_factory = sqlite3.Row
    
    target = sqlite3.connect(TARGET_DB)
    target.row_factory = sqlite3.Row
    
    # Get existing episode IDs
    existing = set(row[0] for row in target.execute("SELECT id FROM episodes").fetchall())
    print(f"Existing episodes: {len(existing)}")
    
    # Get podcast episodes from source
    podcasts = source.execute("""
        SELECT id, title, pub_date, duration_seconds, word_count, transcript, 
               players, topics, summary
        FROM podcast_episodes
        WHERE transcript IS NOT NULL AND transcript != ''
    """).fetchall()
    
    print(f"Podcasts to import: {len(podcasts)}")
    
    imported = 0
    for p in podcasts:
        # Create a unique ID for podcast episodes
        ep_id = f"podcast-{p['id'][:20]}" if not p['id'].startswith('podcast-') else p['id']
        
        if ep_id in existing:
            continue
        
        # Insert into episodes table
        target.execute("""
            INSERT OR REPLACE INTO episodes 
            (id, title, description, published_at, duration_seconds, 
             has_transcript, transcript_word_count, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
        """, (
            ep_id,
            p['title'],
            p['summary'] or '',
            p['pub_date'],
            p['duration_seconds'] or 0,
            p['word_count'] or 0,
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
        
        # Insert into transcripts table
        target.execute("""
            INSERT OR REPLACE INTO transcripts (episode_id, content, word_count)
            VALUES (?, ?, ?)
        """, (ep_id, p['transcript'], p['word_count']))
        
        # Insert into FTS
        target.execute("""
            INSERT INTO transcripts_fts (episode_id, content)
            VALUES (?, ?)
        """, (ep_id, p['transcript']))
        
        imported += 1
        if imported % 50 == 0:
            print(f"  Imported {imported}...")
    
    target.commit()
    
    # Get final stats
    total = target.execute("SELECT COUNT(*) FROM episodes").fetchone()[0]
    with_trans = target.execute("SELECT COUNT(*) FROM transcripts").fetchone()[0]
    total_words = target.execute("SELECT SUM(word_count) FROM transcripts").fetchone()[0]
    
    print(f"\n✅ Import complete!")
    print(f"   New episodes: {imported}")
    print(f"   Total episodes: {total}")
    print(f"   With transcripts: {with_trans}")
    print(f"   Total words: {total_words:,}")
    
    source.close()
    target.close()

if __name__ == "__main__":
    import_podcasts()

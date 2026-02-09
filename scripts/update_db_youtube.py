#!/usr/bin/env python3
"""Update the SQLite database with matched YouTube URLs."""

import json
import sqlite3
from pathlib import Path

EPISODES_PATH = Path(__file__).parent.parent / "data/episodes_final.json"
DB_PATH = Path(__file__).parent.parent / "data/swolecast.db"

def main():
    # Load matched episodes
    with open(EPISODES_PATH) as f:
        episodes = json.load(f)
    
    # Build lookup by various ID formats
    youtube_lookup = {}
    for ep in episodes:
        if ep.get("youtube_url"):
            ep_id = ep.get("id", "")
            youtube_lookup[ep_id] = ep["youtube_url"]
            
            # Also try the podcast- prefix version
            if not ep_id.startswith("podcast-"):
                youtube_lookup[f"podcast-{ep_id}"] = ep["youtube_url"]
    
    print(f"Loaded {len(youtube_lookup)} YouTube URL mappings")
    
    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get all episode IDs
    cursor.execute("SELECT id, youtube_url FROM episodes")
    db_episodes = cursor.fetchall()
    
    print(f"Found {len(db_episodes)} episodes in database")
    
    # Update YouTube URLs
    updated = 0
    already_set = 0
    for ep_id, current_url in db_episodes:
        if ep_id in youtube_lookup:
            new_url = youtube_lookup[ep_id]
            if current_url != new_url:
                cursor.execute(
                    "UPDATE episodes SET youtube_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (new_url, ep_id)
                )
                updated += 1
            else:
                already_set += 1
    
    conn.commit()
    
    # Verify
    cursor.execute("SELECT COUNT(*) FROM episodes WHERE youtube_url IS NOT NULL")
    with_youtube = cursor.fetchone()[0]
    
    print(f"\nResults:")
    print(f"  Updated: {updated}")
    print(f"  Already set: {already_set}")
    print(f"  Total with YouTube: {with_youtube}")
    
    # Show sample
    print("\nSample updated episodes:")
    cursor.execute("SELECT id, title, youtube_url FROM episodes WHERE youtube_url IS NOT NULL LIMIT 5")
    for row in cursor.fetchall():
        print(f"  {row[1][:40]} -> {row[2]}")
    
    conn.close()

if __name__ == "__main__":
    main()

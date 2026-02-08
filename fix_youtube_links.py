#!/usr/bin/env python3
"""
Fix YouTube links to only point to full video streams (60+ min),
not the shorter podcast audio uploads.
"""

import sqlite3

DB_PATH = "data/swolecast.db"
UPLOADS_DB = "/Users/davidkitchen-ai/clawd/projects/swolecast-db/swolecast_uploads.db"

def fix_links():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Load video durations from uploads DB
    uploads = sqlite3.connect(UPLOADS_DB)
    uploads.row_factory = sqlite3.Row
    
    video_durations = {}
    for row in uploads.execute("SELECT id, duration_seconds FROM episodes WHERE duration_seconds IS NOT NULL"):
        video_durations[row['id']] = row['duration_seconds']
    
    print(f"Loaded {len(video_durations)} video durations")
    
    # Check current YouTube links
    cursor.execute("""
        SELECT id, title, youtube_url FROM episodes 
        WHERE youtube_url IS NOT NULL
    """)
    
    episodes = cursor.fetchall()
    print(f"Episodes with YouTube links: {len(episodes)}")
    
    short_removed = 0
    for ep in episodes:
        url = ep['youtube_url']
        # Extract video ID from URL
        vid_id = None
        if 'v=' in url:
            vid_id = url.split('v=')[1].split('&')[0]
        elif 'youtu.be/' in url:
            vid_id = url.split('youtu.be/')[1].split('?')[0]
        
        if vid_id and vid_id in video_durations:
            duration = video_durations[vid_id]
            # If video is less than 45 minutes, it's probably a podcast audio upload
            if duration < 2700:  # 45 minutes
                cursor.execute(
                    "UPDATE episodes SET youtube_url = NULL WHERE id = ?",
                    (ep['id'],)
                )
                short_removed += 1
                print(f"  ✗ Removed short video ({duration//60}min): {ep['title'][:50]}")
    
    conn.commit()
    
    # Stats
    cursor.execute("SELECT COUNT(*) FROM episodes WHERE youtube_url IS NOT NULL")
    remaining = cursor.fetchone()[0]
    
    print(f"\n✅ Removed {short_removed} short video links")
    print(f"   Remaining YouTube links: {remaining}")
    
    uploads.close()
    conn.close()

if __name__ == "__main__":
    fix_links()

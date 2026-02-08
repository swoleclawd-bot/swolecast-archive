#!/usr/bin/env python3
"""
Consolidate podcast and YouTube episodes into single entries.
Podcasts are the source of truth for dates; YouTube provides video URLs.
"""

import sqlite3
from difflib import SequenceMatcher

DB_PATH = "data/swolecast.db"

def similarity(a, b):
    """Calculate string similarity ratio."""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def consolidate():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Step 1: Remove exact duplicate podcasts (keep one with most data)
    print("Step 1: Removing duplicate podcasts...")
    cursor.execute("""
        SELECT title, GROUP_CONCAT(id) as ids, COUNT(*) as cnt 
        FROM episodes 
        WHERE id LIKE 'podcast%' 
        GROUP BY title 
        HAVING cnt > 1
    """)
    
    duplicates_removed = 0
    for row in cursor.fetchall():
        ids = row['ids'].split(',')
        # Keep the first, delete the rest
        for dup_id in ids[1:]:
            cursor.execute("DELETE FROM episodes WHERE id = ?", (dup_id,))
            cursor.execute("DELETE FROM transcripts WHERE episode_id = ?", (dup_id,))
            duplicates_removed += 1
    
    print(f"   Removed {duplicates_removed} duplicate podcasts")
    
    # Step 2: Get all podcasts with dates
    cursor.execute("""
        SELECT id, title, published_at FROM episodes 
        WHERE id LIKE 'podcast%' AND published_at IS NOT NULL
        ORDER BY published_at DESC
    """)
    podcasts = cursor.fetchall()
    
    # Step 3: Get all YouTube videos
    cursor.execute("""
        SELECT id, title, published_at, youtube_url FROM episodes 
        WHERE id NOT LIKE 'podcast%'
    """)
    youtube_vids = cursor.fetchall()
    
    print(f"\nStep 2: Matching {len(youtube_vids)} YouTube videos to {len(podcasts)} podcasts...")
    
    matched = 0
    youtube_to_delete = []
    
    for yt in youtube_vids:
        yt_title = yt['title'].lower()
        best_match = None
        best_score = 0
        
        for pod in podcasts:
            pod_title = pod['title'].lower()
            
            # Check for title similarity
            score = similarity(yt_title, pod_title)
            
            # Boost score if dates match
            if yt['published_at'] and pod['published_at']:
                if yt['published_at'][:10] == pod['published_at'][:10]:
                    score += 0.3
            
            # Boost if both contain same week number
            import re
            yt_week = re.search(r'week\s*(\d+)', yt_title)
            pod_week = re.search(r'week\s*(\d+)', pod_title)
            if yt_week and pod_week and yt_week.group(1) == pod_week.group(1):
                score += 0.2
            
            if score > best_score:
                best_score = score
                best_match = pod
        
        # If good match found, update podcast with YouTube URL and mark YT for deletion
        if best_score > 0.6 and best_match:
            yt_url = yt['youtube_url'] or f"https://www.youtube.com/watch?v={yt['id']}"
            cursor.execute(
                "UPDATE episodes SET youtube_url = ? WHERE id = ?",
                (yt_url, best_match['id'])
            )
            youtube_to_delete.append(yt['id'])
            matched += 1
            if matched <= 10:
                print(f"   ✓ {yt['title'][:40]}... → {best_match['title'][:30]}... (score: {best_score:.2f})")
    
    print(f"\n   Matched {matched} YouTube videos to podcasts")
    
    # Step 4: Delete matched YouTube entries (they're now linked to podcasts)
    print(f"\nStep 3: Removing {len(youtube_to_delete)} merged YouTube entries...")
    for yt_id in youtube_to_delete:
        cursor.execute("DELETE FROM episodes WHERE id = ?", (yt_id,))
        cursor.execute("DELETE FROM transcripts WHERE episode_id = ?", (yt_id,))
    
    # Step 5: For remaining YouTube videos without dates, try to extract from title
    cursor.execute("""
        SELECT id, title FROM episodes 
        WHERE id NOT LIKE 'podcast%' 
        AND (published_at IS NULL OR published_at = '')
    """)
    remaining = cursor.fetchall()
    print(f"\nStep 4: {len(remaining)} YouTube videos remaining without matches")
    
    conn.commit()
    
    # Final stats
    cursor.execute("SELECT COUNT(*) FROM episodes")
    total = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM episodes WHERE published_at IS NOT NULL AND published_at != ''")
    with_dates = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM episodes WHERE youtube_url IS NOT NULL")
    with_youtube = cursor.fetchone()[0]
    
    print(f"\n✅ Consolidation complete!")
    print(f"   Total episodes: {total}")
    print(f"   With dates: {with_dates}")
    print(f"   With YouTube URLs: {with_youtube}")
    
    conn.close()

if __name__ == "__main__":
    consolidate()

#!/usr/bin/env python3
"""Merge YouTube matches across duplicate podcast entries."""

import json
from pathlib import Path
from collections import defaultdict

MATCHED_PATH = Path(__file__).parent.parent / "data/matched_episodes.json"
OUTPUT_PATH = Path(__file__).parent.parent / "data/episodes_final.json"

def main():
    with open(MATCHED_PATH) as f:
        episodes = json.load(f)
    
    print(f"Loaded {len(episodes)} episodes")
    
    # Group by title+duration (these are duplicates)
    groups = defaultdict(list)
    for ep in episodes:
        key = (ep.get("title"), ep.get("duration_seconds"))
        groups[key].append(ep)
    
    # For each group, if any has youtube_url, apply to all
    youtube_applied = 0
    for key, group in groups.items():
        # Find youtube info from any entry
        youtube_url = None
        youtube_id = None
        youtube_title = None
        match_confidence = None
        
        for ep in group:
            if ep.get("youtube_url"):
                youtube_url = ep["youtube_url"]
                youtube_id = ep.get("youtube_id")
                youtube_title = ep.get("youtube_title")
                match_confidence = ep.get("match_confidence")
                break
        
        # Apply to all entries in group
        if youtube_url:
            for ep in group:
                if not ep.get("youtube_url"):
                    ep["youtube_url"] = youtube_url
                    ep["youtube_id"] = youtube_id
                    ep["youtube_title"] = youtube_title
                    ep["match_confidence"] = match_confidence
                    youtube_applied += 1
    
    print(f"Applied YouTube URLs to {youtube_applied} additional episodes")
    
    # Count final stats
    with_youtube = sum(1 for ep in episodes if ep.get("youtube_url"))
    print(f"Episodes with YouTube: {with_youtube}/{len(episodes)}")
    
    # Save
    with open(OUTPUT_PATH, "w") as f:
        json.dump(episodes, f, indent=2)
    
    print(f"Saved to {OUTPUT_PATH}")
    
    # Verify the Super Bowl episode
    print("\nVerifying Super Bowl episode:")
    for ep in episodes:
        if "698587ad" in str(ep.get("id", "")):
            print(f"  ID: {ep['id']}")
            print(f"  Title: {ep['title']}")
            print(f"  YouTube: {ep.get('youtube_url', 'NONE')}")
            break

if __name__ == "__main__":
    main()

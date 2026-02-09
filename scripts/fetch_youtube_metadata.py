#!/usr/bin/env python3
"""Fetch real metadata (dates, durations) for all YouTube videos using yt-dlp."""

import json
import subprocess
import sys
from pathlib import Path
from datetime import datetime

STREAMS_PATH = Path(__file__).parent.parent.parent / "swolecast-streams/public/data/streams.json"
OUTPUT_PATH = Path(__file__).parent.parent / "data/youtube_metadata.json"

def fetch_video_metadata(video_id: str) -> dict | None:
    """Fetch metadata for a single video."""
    try:
        result = subprocess.run(
            ["yt-dlp", "--dump-json", f"https://www.youtube.com/watch?v={video_id}"],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            data = json.loads(result.stdout)
            return {
                "id": video_id,
                "title": data.get("title"),
                "upload_date": data.get("upload_date"),  # YYYYMMDD format
                "duration": data.get("duration"),
                "channel": data.get("channel"),
                "view_count": data.get("view_count"),
                "url": f"https://www.youtube.com/watch?v={video_id}"
            }
    except Exception as e:
        print(f"  Error fetching {video_id}: {e}", file=sys.stderr)
    return None

def main():
    # Load existing streams
    with open(STREAMS_PATH) as f:
        streams = json.load(f)
    
    print(f"Found {len(streams)} videos to process")
    
    # Check for existing progress
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    existing = {}
    if OUTPUT_PATH.exists():
        with open(OUTPUT_PATH) as f:
            existing = {v["id"]: v for v in json.load(f)}
        print(f"Loaded {len(existing)} existing entries")
    
    results = list(existing.values())
    processed_ids = set(existing.keys())
    
    for i, stream in enumerate(streams):
        video_id = stream["id"]
        if video_id in processed_ids:
            continue
            
        print(f"[{i+1}/{len(streams)}] Fetching {video_id}...")
        metadata = fetch_video_metadata(video_id)
        
        if metadata:
            results.append(metadata)
            processed_ids.add(video_id)
            
            # Save progress every 10 videos
            if len(results) % 10 == 0:
                with open(OUTPUT_PATH, "w") as f:
                    json.dump(results, f, indent=2)
                print(f"  Saved {len(results)} videos")
    
    # Final save
    with open(OUTPUT_PATH, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nDone! Saved {len(results)} videos to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()

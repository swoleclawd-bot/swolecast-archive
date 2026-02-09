#!/usr/bin/env python3
"""Fetch all livestream metadata from Swolecast channel with real dates."""

import json
import subprocess
import sys
from pathlib import Path

OUTPUT_PATH = Path(__file__).parent.parent / "data/youtube_metadata.json"
CHANNEL_STREAMS_URL = "https://www.youtube.com/channel/UCRUA9P6vB_O9sEKrEluPETQ/streams"

def get_video_ids():
    """Get all video IDs from the channel's streams tab."""
    result = subprocess.run(
        ["yt-dlp", "--flat-playlist", "--print", "id", CHANNEL_STREAMS_URL],
        capture_output=True,
        text=True,
        timeout=120
    )
    if result.returncode != 0:
        print(f"Error getting video list: {result.stderr}", file=sys.stderr)
        return []
    
    ids = [line.strip() for line in result.stdout.strip().split('\n') if line.strip()]
    return ids

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
    print("Fetching video IDs from channel...")
    video_ids = get_video_ids()
    print(f"Found {len(video_ids)} videos")
    
    # Load existing progress
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    existing = {}
    if OUTPUT_PATH.exists():
        with open(OUTPUT_PATH) as f:
            existing = {v["id"]: v for v in json.load(f)}
        print(f"Loaded {len(existing)} existing entries")
    
    results = list(existing.values())
    processed_ids = set(existing.keys())
    new_count = 0
    
    for i, video_id in enumerate(video_ids):
        if video_id in processed_ids:
            continue
        
        print(f"[{i+1}/{len(video_ids)}] Fetching {video_id}...")
        metadata = fetch_video_metadata(video_id)
        
        if metadata:
            results.append(metadata)
            processed_ids.add(video_id)
            new_count += 1
            
            # Save progress every 10 videos
            if new_count % 10 == 0:
                with open(OUTPUT_PATH, "w") as f:
                    json.dump(results, f, indent=2)
                print(f"  Saved {len(results)} videos")
    
    # Final save
    with open(OUTPUT_PATH, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nDone! Added {new_count} new videos. Total: {len(results)}")

if __name__ == "__main__":
    main()

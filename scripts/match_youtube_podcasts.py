#!/usr/bin/env python3
"""Match YouTube videos to podcast episodes using duration + date proximity."""

import json
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict

# Paths
YOUTUBE_PATH = Path(__file__).parent.parent / "data/youtube_metadata.json"
PODCASTS_PATH = Path(__file__).parent.parent / "data/podcasts_with_duration.json"
OUTPUT_PATH = Path(__file__).parent.parent / "data/matched_episodes.json"
REPORT_PATH = Path(__file__).parent.parent / "data/match_report.txt"

def parse_youtube_date(date_str: str) -> datetime | None:
    """Parse YYYYMMDD format."""
    if not date_str or len(date_str) != 8:
        return None
    try:
        return datetime.strptime(date_str, "%Y%m%d")
    except:
        return None

def parse_podcast_date(date_str: str) -> datetime | None:
    """Parse various podcast date formats."""
    if not date_str:
        return None
    
    # Try different formats
    formats = [
        "%a, %d %b %Y %H:%M:%S %Z",  # "Fri, 06 Feb 2026 10:30:00 GMT"
        "%Y-%m-%d",                    # "2025-01-28"
        "%a, %d %b %Y %H:%M:%S %z",   # With timezone offset
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except:
            continue
    
    # Try partial parse for weird formats
    try:
        # Handle "Fri, 06 Feb 2026 10:30:00 GMT" without timezone
        parts = date_str.split()
        if len(parts) >= 4:
            day = int(parts[1])
            month = datetime.strptime(parts[2], "%b").month
            year = int(parts[3])
            return datetime(year, month, day)
    except:
        pass
    
    return None

def duration_match_score(yt_duration: int, pod_duration: int) -> float:
    """Calculate duration match score (0-1, higher is better)."""
    if not yt_duration or not pod_duration:
        return 0.0
    
    diff = abs(yt_duration - pod_duration)
    max_dur = max(yt_duration, pod_duration)
    
    # Perfect match: within 10 seconds
    if diff <= 10:
        return 1.0
    
    # Very good: within 1%
    if diff / max_dur <= 0.01:
        return 0.95
    
    # Good: within 3%
    if diff / max_dur <= 0.03:
        return 0.8
    
    # OK: within 5%
    if diff / max_dur <= 0.05:
        return 0.6
    
    # Marginal: within 10%
    if diff / max_dur <= 0.10:
        return 0.3
    
    return 0.0

def date_match_score(yt_date: datetime, pod_date: datetime) -> float:
    """Calculate date match score (0-1, higher is better)."""
    if not yt_date or not pod_date:
        return 0.0
    
    diff = abs((yt_date - pod_date).days)
    
    # Same day
    if diff == 0:
        return 1.0
    
    # Within 3 days (typical upload gap)
    if diff <= 3:
        return 0.9
    
    # Within a week
    if diff <= 7:
        return 0.7
    
    # Within 2 weeks
    if diff <= 14:
        return 0.4
    
    # Within a month
    if diff <= 30:
        return 0.2
    
    return 0.0

def find_matches(youtube_videos: list, podcasts: list) -> tuple[list, list, list]:
    """
    Find matches between YouTube videos and podcasts.
    Returns: (matches, unmatched_youtube, unmatched_podcasts)
    """
    matches = []
    matched_yt_ids = set()
    matched_pod_ids = set()
    
    # Parse dates upfront
    yt_with_dates = []
    for yt in youtube_videos:
        yt_date = parse_youtube_date(yt.get("upload_date"))
        yt_with_dates.append({**yt, "_date": yt_date})
    
    pod_with_dates = []
    for pod in podcasts:
        pod_date = parse_podcast_date(pod.get("pub_date"))
        pod_with_dates.append({**pod, "_date": pod_date})
    
    # Sort by confidence: try high-confidence matches first
    candidates = []
    for yt in yt_with_dates:
        for pod in pod_with_dates:
            dur_score = duration_match_score(
                yt.get("duration"), 
                pod.get("duration_seconds")
            )
            date_score = date_match_score(yt.get("_date"), pod.get("_date"))
            
            # Calculate date difference for hard filter
            date_diff = 9999
            if yt.get("_date") and pod.get("_date"):
                date_diff = abs((yt["_date"] - pod["_date"]).days)
            
            # HARD FILTER: Must be within 14 days to be considered
            if date_diff > 14:
                continue
            
            # Combined score (duration is more reliable)
            combined_score = (dur_score * 0.7) + (date_score * 0.3)
            
            if combined_score >= 0.5:  # Minimum threshold
                candidates.append({
                    "youtube": yt,
                    "podcast": pod,
                    "dur_score": dur_score,
                    "date_score": date_score,
                    "combined_score": combined_score,
                    "dur_diff": abs((yt.get("duration") or 0) - (pod.get("duration_seconds") or 0)),
                    "date_diff": date_diff
                })
    
    # Sort by combined score (highest first)
    candidates.sort(key=lambda x: x["combined_score"], reverse=True)
    
    # Greedy matching: take best matches first
    for candidate in candidates:
        yt_id = candidate["youtube"]["id"]
        pod_id = candidate["podcast"]["id"]
        
        if yt_id in matched_yt_ids or pod_id in matched_pod_ids:
            continue
        
        matches.append(candidate)
        matched_yt_ids.add(yt_id)
        matched_pod_ids.add(pod_id)
    
    # Find unmatched
    unmatched_youtube = [yt for yt in youtube_videos if yt["id"] not in matched_yt_ids]
    unmatched_podcasts = [pod for pod in podcasts if pod["id"] not in matched_pod_ids]
    
    return matches, unmatched_youtube, unmatched_podcasts

def main():
    # Load data
    with open(YOUTUBE_PATH) as f:
        youtube_videos = json.load(f)
    
    with open(PODCASTS_PATH) as f:
        podcasts = json.load(f)
    
    print(f"Loaded {len(youtube_videos)} YouTube videos")
    print(f"Loaded {len(podcasts)} podcasts")
    
    # Find matches
    matches, unmatched_yt, unmatched_pod = find_matches(youtube_videos, podcasts)
    
    print(f"\nResults:")
    print(f"  ✅ Matched: {len(matches)}")
    print(f"  📹 Unmatched YouTube: {len(unmatched_yt)}")
    print(f"  🎙️ Unmatched Podcasts: {len(unmatched_pod)}")
    
    # Create enriched podcast data with YouTube links
    podcast_lookup = {p["id"]: p.copy() for p in podcasts}
    for match in matches:
        pod_id = match["podcast"]["id"]
        podcast_lookup[pod_id]["youtube_url"] = match["youtube"]["url"]
        podcast_lookup[pod_id]["youtube_id"] = match["youtube"]["id"]
        podcast_lookup[pod_id]["youtube_title"] = match["youtube"]["title"]
        podcast_lookup[pod_id]["match_confidence"] = match["combined_score"]
    
    enriched_podcasts = list(podcast_lookup.values())
    
    # Save enriched data
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(enriched_podcasts, f, indent=2)
    
    print(f"\n📁 Saved enriched data to {OUTPUT_PATH}")
    
    # Generate report
    report_lines = [
        "=" * 60,
        "YOUTUBE ↔️ PODCAST MATCHING REPORT",
        "=" * 60,
        "",
        f"Total YouTube videos: {len(youtube_videos)}",
        f"Total podcasts: {len(podcasts)}",
        f"Matched: {len(matches)}",
        f"Unmatched YouTube: {len(unmatched_yt)}",
        f"Unmatched Podcasts: {len(unmatched_pod)}",
        "",
        "-" * 60,
        "HIGH CONFIDENCE MATCHES (score >= 0.8)",
        "-" * 60,
    ]
    
    for match in sorted(matches, key=lambda x: -x["combined_score"])[:20]:
        report_lines.extend([
            f"\n📹 {match['youtube']['title']}",
            f"   → 🎙️ {match['podcast']['title']}",
            f"   Score: {match['combined_score']:.2f} | Duration diff: {match['dur_diff']}s | Date diff: {match['date_diff']} days"
        ])
    
    if unmatched_yt:
        report_lines.extend([
            "",
            "-" * 60,
            "UNMATCHED YOUTUBE VIDEOS (sample)",
            "-" * 60,
        ])
        for yt in unmatched_yt[:10]:
            report_lines.append(f"📹 {yt['title']} ({yt.get('upload_date', 'no date')})")
    
    if unmatched_pod:
        report_lines.extend([
            "",
            "-" * 60,
            "UNMATCHED PODCASTS (sample)",
            "-" * 60,
        ])
        for pod in unmatched_pod[:10]:
            report_lines.append(f"🎙️ {pod['title']} ({pod.get('pub_date', 'no date')})")
    
    report = "\n".join(report_lines)
    with open(REPORT_PATH, "w") as f:
        f.write(report)
    
    print(f"📋 Saved report to {REPORT_PATH}")
    
    # Print sample matches
    print("\n" + "=" * 60)
    print("SAMPLE MATCHES")
    print("=" * 60)
    for match in matches[:5]:
        print(f"\n📹 YouTube: {match['youtube']['title']}")
        print(f"🎙️ Podcast: {match['podcast']['title']}")
        print(f"   Score: {match['combined_score']:.2f} (dur: {match['dur_score']:.2f}, date: {match['date_score']:.2f})")
        print(f"   Duration diff: {match['dur_diff']}s | Date diff: {match['date_diff']} days")

if __name__ == "__main__":
    main()

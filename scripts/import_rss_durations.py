#!/usr/bin/env python3
"""Import durations and mp3 URLs from RSS feed into podcast data."""

import xml.etree.ElementTree as ET
import json
import re
from pathlib import Path
from datetime import datetime

RSS_PATH = "/tmp/swolecast_rss.xml"
PODCASTS_PATH = Path(__file__).parent.parent.parent / "swolecast-streams/public/data/podcasts.json"
OUTPUT_PATH = Path(__file__).parent.parent / "data/podcasts_with_duration.json"

def parse_duration(duration_str: str) -> int:
    """Convert duration string (H:MM:SS or MM:SS) to seconds."""
    if not duration_str:
        return 0
    
    parts = duration_str.split(':')
    if len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
    elif len(parts) == 2:
        return int(parts[0]) * 60 + int(parts[1])
    else:
        return int(parts[0])

def parse_rss_date(date_str: str) -> str:
    """Parse RSS date to YYYY-MM-DD format."""
    try:
        # "Fri, 06 Feb 2026 10:30:00 GMT"
        dt = datetime.strptime(date_str.replace(" GMT", "").strip(), "%a, %d %b %Y %H:%M:%S")
        return dt.strftime("%Y-%m-%d")
    except:
        return None

def extract_episode_id(url: str) -> str:
    """Extract episode ID from Acast URL."""
    # https://sphinx.acast.com/p/open/s/.../e/698587ad5ad8bc4f7c6b4a7d/...
    match = re.search(r'/e/([a-f0-9]+)/', url)
    if match:
        return match.group(1)
    return None

def main():
    # Parse RSS
    tree = ET.parse(RSS_PATH)
    root = tree.getroot()
    channel = root.find('channel')
    items = channel.findall('item')
    
    ns = {'itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd'}
    
    print(f"Parsing {len(items)} RSS episodes...")
    
    rss_episodes = []
    for item in items:
        title = item.find('title').text if item.find('title') is not None else ''
        pub_date = item.find('pubDate').text if item.find('pubDate') is not None else ''
        duration = item.find('itunes:duration', ns)
        duration_seconds = parse_duration(duration.text) if duration is not None else 0
        enclosure = item.find('enclosure')
        mp3_url = enclosure.get('url') if enclosure is not None else None
        episode_id = extract_episode_id(mp3_url) if mp3_url else None
        
        rss_episodes.append({
            "id": episode_id,
            "title": title,
            "pub_date": pub_date,
            "pub_date_simple": parse_rss_date(pub_date),
            "duration_seconds": duration_seconds,
            "mp3_url": mp3_url
        })
    
    print(f"Extracted {len(rss_episodes)} episodes from RSS")
    
    # Load existing podcasts
    with open(PODCASTS_PATH) as f:
        podcasts = json.load(f)
    
    print(f"Loaded {len(podcasts)} existing podcasts")
    
    # Build lookup by ID and by date+title similarity
    rss_by_id = {e["id"]: e for e in rss_episodes if e["id"]}
    rss_by_date = {}
    for e in rss_episodes:
        if e["pub_date_simple"]:
            if e["pub_date_simple"] not in rss_by_date:
                rss_by_date[e["pub_date_simple"]] = []
            rss_by_date[e["pub_date_simple"]].append(e)
    
    # Match and enrich podcasts
    matched = 0
    for podcast in podcasts:
        pod_id = podcast.get("id", "")
        
        # Try direct ID match (for Acast IDs like 698587ad5ad8bc4f7c6b4a7d)
        if pod_id in rss_by_id:
            rss = rss_by_id[pod_id]
            podcast["duration_seconds"] = rss["duration_seconds"]
            podcast["mp3_url"] = rss["mp3_url"]
            matched += 1
            continue
        
        # Try matching by date
        pod_date = podcast.get("pub_date", "")
        if pod_date:
            # Parse various date formats
            simple_date = None
            if re.match(r"\d{4}-\d{2}-\d{2}", pod_date):
                simple_date = pod_date[:10]
            elif "," in pod_date:
                simple_date = parse_rss_date(pod_date)
            
            if simple_date and simple_date in rss_by_date:
                # Find best match by title
                pod_title = podcast.get("title", "").lower()
                best_match = None
                best_score = 0
                
                for rss in rss_by_date[simple_date]:
                    rss_title = rss["title"].lower()
                    # Simple word overlap score
                    pod_words = set(pod_title.split())
                    rss_words = set(rss_title.split())
                    overlap = len(pod_words & rss_words)
                    if overlap > best_score:
                        best_score = overlap
                        best_match = rss
                
                if best_match and best_score >= 2:
                    podcast["duration_seconds"] = best_match["duration_seconds"]
                    podcast["mp3_url"] = best_match["mp3_url"]
                    matched += 1
    
    print(f"Matched {matched} podcasts with RSS data")
    
    # Count how many have duration now
    with_duration = sum(1 for p in podcasts if p.get("duration_seconds", 0) > 0)
    print(f"Podcasts with duration: {with_duration}/{len(podcasts)}")
    
    # Save enriched data
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(podcasts, f, indent=2)
    
    print(f"\nSaved to {OUTPUT_PATH}")
    
    # Show sample
    print("\nSample enriched podcasts:")
    for p in podcasts[:5]:
        print(f"  {p.get('title', '')[:50]} - {p.get('duration_seconds', 0)}s")

if __name__ == "__main__":
    main()

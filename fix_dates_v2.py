#!/usr/bin/env python3
"""Fix missing dates by extracting from titles or estimating from patterns."""

import sqlite3
import re
from datetime import datetime, timedelta

DB_PATH = "data/swolecast.db"

MONTHS = {
    'january': 1, 'jan': 1, 'february': 2, 'feb': 2, 'march': 3, 'mar': 3,
    'april': 4, 'apr': 4, 'may': 5, 'june': 6, 'jun': 6, 'july': 7, 'jul': 7,
    'august': 8, 'aug': 8, 'september': 9, 'sep': 9, 'sept': 9,
    'october': 10, 'oct': 10, 'november': 11, 'nov': 11, 'december': 12, 'dec': 12,
}

# NFL season week patterns - map week numbers to approximate dates
NFL_WEEKS_2023 = {
    'week 1': '2023-09-07', 'week 2': '2023-09-14', 'week 3': '2023-09-21',
    'week 4': '2023-09-28', 'week 5': '2023-10-05', 'week 6': '2023-10-12',
    'week 7': '2023-10-19', 'week 8': '2023-10-26', 'week 9': '2023-11-02',
    'week 10': '2023-11-09', 'week 11': '2023-11-16', 'week 12': '2023-11-23',
    'week 13': '2023-11-30', 'week 14': '2023-12-07', 'week 15': '2023-12-14',
    'week 16': '2023-12-21', 'week 17': '2023-12-28', 'week 18': '2024-01-04',
    'wild card': '2024-01-13', 'divisional': '2024-01-20', 
    'conference': '2024-01-28', 'super bowl': '2024-02-11',
}

NFL_WEEKS_2024 = {
    'week 1': '2024-09-05', 'week 2': '2024-09-12', 'week 3': '2024-09-19',
    'week 4': '2024-09-26', 'week 5': '2024-10-03', 'week 6': '2024-10-10',
    'week 7': '2024-10-17', 'week 8': '2024-10-24', 'week 9': '2024-10-31',
    'week 10': '2024-11-07', 'week 11': '2024-11-14', 'week 12': '2024-11-21',
    'week 13': '2024-11-28', 'week 14': '2024-12-05', 'week 15': '2024-12-12',
    'week 16': '2024-12-19', 'week 17': '2024-12-26', 'week 18': '2025-01-02',
    'wild card': '2025-01-11', 'divisional': '2025-01-18',
    'conference': '2025-01-26', 'super bowl': '2025-02-09',
}

def extract_date(title):
    title_lower = title.lower()
    
    # Pattern: "Month DD, YYYY" or "Month D, YYYY"
    pattern1 = r'(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2}),?\s+(\d{4})'
    match = re.search(pattern1, title_lower)
    if match:
        month = MONTHS.get(match.group(1))
        day = int(match.group(2))
        year = int(match.group(3))
        return f"{year}-{month:02d}-{day:02d}"
    
    # Check for NFL week patterns with year context
    if '2024' in title or 'best ball' in title_lower:
        weeks = NFL_WEEKS_2024
    else:
        weeks = NFL_WEEKS_2023
    
    for pattern, date in weeks.items():
        if pattern in title_lower:
            return date
    
    # Pattern: "2023 NFL" or "2024 NFL" with DFS
    if '2023 dfs' in title_lower or '2023 fantasy' in title_lower:
        # Late 2023 season content
        return '2023-10-01'
    if '2024 dfs' in title_lower or '2024 fantasy' in title_lower:
        return '2024-10-01'
    
    # Draft content
    if 'nfl draft' in title_lower:
        if '2024' in title or '2024' in title_lower:
            return '2024-04-25'
        elif '2023' in title:
            return '2023-04-27'
    
    # Best ball content
    if 'best ball' in title_lower:
        if '2024' in title:
            return '2024-06-01'
        elif '2023' in title:
            return '2023-06-01'
    
    # Free agency
    if 'free agency' in title_lower:
        if '2024' in title:
            return '2024-03-13'
        elif '2023' in title:
            return '2023-03-15'
    
    return None

def fix_dates():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get episodes without dates
    cursor.execute("""
        SELECT id, title FROM episodes 
        WHERE published_at IS NULL OR published_at = ''
    """)
    
    episodes = cursor.fetchall()
    print(f"Episodes without dates: {len(episodes)}")
    
    fixed = 0
    for ep in episodes:
        date = extract_date(ep['title'])
        if date:
            cursor.execute(
                "UPDATE episodes SET published_at = ? WHERE id = ?",
                (date, ep['id'])
            )
            print(f"  ✓ {date}: {ep['title'][:50]}")
            fixed += 1
    
    conn.commit()
    
    # Show remaining
    cursor.execute("""
        SELECT COUNT(*) FROM episodes 
        WHERE published_at IS NULL OR published_at = ''
    """)
    still_missing = cursor.fetchone()[0]
    
    print(f"\n✅ Fixed {fixed} dates")
    print(f"   Still missing: {still_missing}")
    
    if still_missing > 0:
        cursor.execute("""
            SELECT id, title FROM episodes 
            WHERE published_at IS NULL OR published_at = ''
            LIMIT 10
        """)
        print("\nSample missing:")
        for row in cursor.fetchall():
            print(f"  - {row['title'][:60]}")
    
    conn.close()

if __name__ == "__main__":
    fix_dates()

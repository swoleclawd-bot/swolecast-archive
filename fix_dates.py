#!/usr/bin/env python3
"""Fix missing dates in episodes table by extracting from titles."""

import sqlite3
import re
from datetime import datetime

DB_PATH = "data/swolecast.db"

# Month name to number mapping
MONTHS = {
    'january': '01', 'jan': '01',
    'february': '02', 'feb': '02',
    'march': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'may': '05',
    'june': '06', 'jun': '06',
    'july': '07', 'jul': '07',
    'august': '08', 'aug': '08',
    'september': '09', 'sep': '09', 'sept': '09',
    'october': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'december': '12', 'dec': '12',
}

def extract_date_from_title(title):
    """Try to extract a date from the title."""
    title_lower = title.lower()
    
    # Pattern: "Month DD, YYYY" or "Month D, YYYY"
    pattern1 = r'(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2}),?\s+(\d{4})'
    match = re.search(pattern1, title_lower)
    if match:
        month = MONTHS.get(match.group(1))
        day = match.group(2).zfill(2)
        year = match.group(3)
        return f"{year}-{month}-{day}"
    
    # Pattern: "YYYY-MM-DD" already in title
    pattern2 = r'(\d{4})-(\d{2})-(\d{2})'
    match = re.search(pattern2, title)
    if match:
        return match.group(0)
    
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
        date = extract_date_from_title(ep['title'])
        if date:
            cursor.execute(
                "UPDATE episodes SET published_at = ? WHERE id = ?",
                (date, ep['id'])
            )
            print(f"  ✓ {ep['id'][:20]}: {date}")
            fixed += 1
    
    conn.commit()
    
    # Also normalize existing dates to YYYY-MM-DD format
    cursor.execute("""
        SELECT id, published_at FROM episodes 
        WHERE published_at LIKE '%GMT%'
    """)
    
    gmt_dates = cursor.fetchall()
    for ep in gmt_dates:
        # Parse "Fri, 06 Feb 2026 10:30:00 GMT" format
        try:
            dt = datetime.strptime(ep['published_at'], '%a, %d %b %Y %H:%M:%S GMT')
            new_date = dt.strftime('%Y-%m-%d')
            cursor.execute(
                "UPDATE episodes SET published_at = ? WHERE id = ?",
                (new_date, ep['id'])
            )
            fixed += 1
        except:
            pass
    
    conn.commit()
    
    # Show final stats
    cursor.execute("SELECT COUNT(*) FROM episodes WHERE published_at IS NULL OR published_at = ''")
    still_missing = cursor.fetchone()[0]
    
    print(f"\n✅ Fixed {fixed} dates")
    print(f"   Still missing: {still_missing}")
    
    conn.close()

if __name__ == "__main__":
    fix_dates()

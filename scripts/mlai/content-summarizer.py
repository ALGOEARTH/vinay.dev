#!/usr/bin/env python3
"""Content Summarizer 1996 — reads visitors.json and contacts.json for leet stats."""

import json
import os
from datetime import datetime, timedelta, timezone

ROOT = os.path.join(os.path.dirname(__file__), '../..')
VISITORS_FILE = os.path.join(ROOT, 'Backend/server/data/visitors.json')
CONTACTS_FILE = os.path.join(ROOT, 'Backend/server/data/contacts.json')


def load_json(path, default):
    if not os.path.exists(path):
        return default
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return default


visitors = load_json(VISITORS_FILE, {'count': 0, 'visits': []})
contacts = load_json(CONTACTS_FILE, [])

visits = visitors.get('visits', [])
total_visits = visitors.get('count', len(visits))
total_contacts = len(contacts)

now = datetime.now(timezone.utc)
today_str = now.strftime('%Y-%m-%d')

# Parse timestamps safely
def parse_ts(ts):
    try:
        dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None

parsed = [parse_ts(v.get('timestamp', '')) for v in visits]
parsed = [d for d in parsed if d is not None]

today_visits = sum(1 for d in parsed if d.strftime('%Y-%m-%d') == today_str)

# Last 7 days
days_data = {}
for i in range(6, -1, -1):
    day = (now - timedelta(days=i)).strftime('%Y-%m-%d')
    days_data[day] = 0
for d in parsed:
    day = d.strftime('%Y-%m-%d')
    if day in days_data:
        days_data[day] += 1

weekly_total = sum(days_data.values())
best_day = max(days_data, key=days_data.get) if days_data else today_str
best_count = days_data.get(best_day, 0)
avg_daily = round(weekly_total / 7, 1)

# ASCII bar chart
max_count = max(days_data.values()) if any(days_data.values()) else 1
BAR_WIDTH = 20

WIDTH = 52
print()
print('╔' + '═' * WIDTH + '╗')
print('║' + '  CONTENT SUMMARIZER 1996'.center(WIDTH) + '║')
print('║' + '  YO DUDE! HERE ARE YOUR SITE STATS'.center(WIDTH) + '║')
print('╠' + '═' * WIDTH + '╣')
print('║' + f'  t0t4l h1tz:     {total_visits}'.ljust(WIDTH) + '║')
print('║' + f'  t0d4y h1tz:     {today_visits}'.ljust(WIDTH) + '║')
print('║' + f'  w33kly h1tz:    {weekly_total}'.ljust(WIDTH) + '║')
print('║' + f'  4vg d4ily:      {avg_daily}'.ljust(WIDTH) + '║')
print('║' + f'  b3st d4y:       {best_day} ({best_count} h1tz)'.ljust(WIDTH) + '║')
print('║' + f'  m3ss4g3z:       {total_contacts}'.ljust(WIDTH) + '║')
print('╠' + '═' * WIDTH + '╣')
print('║' + '  L4ST 7 D4YZ (ASCII B4R CH4RT):'.ljust(WIDTH) + '║')
print('║' + ''.ljust(WIDTH) + '║')

for day, count in days_data.items():
    bar_len = int((count / max_count) * BAR_WIDTH) if max_count > 0 else 0
    bar = '#' * bar_len + '.' * (BAR_WIDTH - bar_len)
    label = day[5:]  # MM-DD
    line = f'  {label} |{bar}| {count}'
    print('║' + line.ljust(WIDTH) + '║')

print('║' + ''.ljust(WIDTH) + '║')
print('╚' + '═' * WIDTH + '╝')

if weekly_total >= 100:
    print(f'\n  YO DUDE! YOUR SITE GOT {weekly_total} HITS THIS WEEK! 1337 STATUS ACHIEVED!')
elif weekly_total >= 10:
    print(f'\n  N0T B4D D00D! {weekly_total} HITS THIS WEEK. K33P IT UP!')
else:
    print(f'\n  ONLY {weekly_total} HITS THIS WEEK... T3LL YOUR FRIENDS ABOUT YOUR SITE!')

print()

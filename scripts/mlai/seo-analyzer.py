#!/usr/bin/env python3
"""SEO Analyzer 1996 — checks HTML meta tags and scores them."""

import os
import sys
from html.parser import HTMLParser

ROOT = os.path.join(os.path.dirname(__file__), '../..')
DIST_HTML = os.path.join(ROOT, 'Frontend/dist/index.html')
FALLBACK_HTML = os.path.join(ROOT, 'Frontend/index.html')

html_path = DIST_HTML if os.path.exists(DIST_HTML) else FALLBACK_HTML

if not os.path.exists(html_path):
    print("╔══ SEO ANALYZER 1996 ══╗")
    print("║  ERROR: No index.html found.        ║")
    print("╚═════════════════════════════════════╝")
    sys.exit(0)

with open(html_path, 'r', encoding='utf-8', errors='ignore') as f:
    html_content = f.read()


class MetaParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = None
        self.metas = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'title':
            self._in_title = True
        elif tag == 'meta':
            name = attrs.get('name', attrs.get('property', '')).lower()
            content = attrs.get('content', '')
            if name:
                self.metas[name] = content

    def handle_endtag(self, tag):
        if tag == 'title':
            self._in_title = False

    def handle_data(self, data):
        if getattr(self, '_in_title', False) and self.title is None:
            self.title = data.strip()

    _in_title = False


parser = MetaParser()
parser.feed(html_content)

checks = [
    ('title',               bool(parser.title),                   '<title>',           parser.title or ''),
    ('description',         'description' in parser.metas,         'meta description',  parser.metas.get('description', '')),
    ('keywords',            'keywords' in parser.metas,            'meta keywords',     parser.metas.get('keywords', '')),
    ('og:title',            'og:title' in parser.metas,            'og:title',          parser.metas.get('og:title', '')),
    ('og:description',      'og:description' in parser.metas,      'og:description',    parser.metas.get('og:description', '')),
    ('viewport',            'viewport' in parser.metas,            'meta viewport',     parser.metas.get('viewport', '')),
    ('author',              'author' in parser.metas,              'meta author',       parser.metas.get('author', '')),
]

score = sum(1 for _, passed, _, _ in checks if passed)
total = len(checks)
grade = 'A' if score == 7 else 'B' if score >= 5 else 'C' if score >= 3 else 'F'

WIDTH = 50
print()
print('╔' + '═' * WIDTH + '╗')
print('║' + '  SEO ANALYZER 1996'.center(WIDTH) + '║')
print('║' + f'  File: {os.path.basename(html_path)}'.ljust(WIDTH) + '║')
print('╠' + '═' * WIDTH + '╣')

for _, passed, label, value in checks:
    icon = '✓' if passed else '✗'
    short_val = (value[:28] + '…') if len(value) > 30 else value
    line = f'  {icon}  {label:<20} {short_val}'
    print('║' + line.ljust(WIDTH) + '║')

print('╠' + '═' * WIDTH + '╣')
print('║' + f'  SCORE: {score}/{total}  GRADE: {grade}'.ljust(WIDTH) + '║')
print('╚' + '═' * WIDTH + '╝')

# Suggestions
missing = [label for _, passed, label, _ in checks if not passed]
if missing:
    print('\n  SUGGESTIONS FOR IMPROVEMENT:')
    for m in missing:
        print(f'  → Add {m} tag to your HTML')
else:
    print('\n  PERFECT SEO SCORE! ALL TAGS PRESENT.')

print()

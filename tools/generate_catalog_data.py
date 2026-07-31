#!/usr/bin/env python3
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
products = json.loads((ROOT / 'data/products.json').read_text('utf-8'))
categories = json.loads((ROOT / 'data/categories.json').read_text('utf-8'))
settings = json.loads((ROOT / 'data/settings.json').read_text('utf-8'))
existing_path = ROOT / 'data/catalog-data.js'
existing = {}
if existing_path.exists():
    match = re.fullmatch(r'window\.VINTAGE_JAM_DATA\s*=\s*(\{.*\});\s*', existing_path.read_text('utf-8'), re.S)
    if match:
        existing = json.loads(match.group(1))

contacts = dict(existing.get('contacts', {}))
contacts.update({key: value for key, value in settings.get('contacts', {}).items() if value})
if settings.get('social', {}).get('youtube'):
    contacts['youtube'] = settings['social']['youtube']

payload = {
    'version': '3.0.0',
    'generatedAt': datetime.now(timezone.utc).isoformat(),
    'site': {
        'name': settings.get('site', {}).get('name', existing.get('site', {}).get('name', 'Vintage Jam')),
        'defaultLanguage': settings.get('site', {}).get('default_language', existing.get('site', {}).get('defaultLanguage', 'uk')),
    },
    'contacts': contacts,
    'shipping': existing.get('shipping', {}),
    'payments': [
        {'id': item.get('id', ''), 'label': item.get('label', item.get('id', ''))}
        for item in settings.get('payments', []) if item.get('enabled', True)
    ] or existing.get('payments', []),
    'categories': categories,
    'products': products,
}
existing_path.write_text('window.VINTAGE_JAM_DATA = ' + json.dumps(payload, ensure_ascii=False, indent=2) + ';\n', 'utf-8')
print('generated data/catalog-data.js')

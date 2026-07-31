#!/usr/bin/env python3
import json
import re
import sys
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
errors = []


def fail(message):
    errors.append(message)


def read_json(path):
    try:
        return json.loads((ROOT / path).read_text('utf-8'))
    except Exception as exc:
        fail(f'{path}: {exc}')
        return None


class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets = []
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script' and attrs.get('src'):
            self.assets.append(attrs['src'])
            self.scripts.append(attrs['src'])
        elif tag == 'link' and attrs.get('href'):
            self.assets.append(attrs['href'])


products = read_json(Path('data/products.json'))
categories = read_json(Path('data/categories.json'))
read_json(Path('data/settings.json'))
if not isinstance(products, list):
    fail('products.json must be an array')
    products = []
if not isinstance(categories, list):
    fail('categories.json must be an array')
    categories = []

category_ids = {item.get('id') for item in categories if isinstance(item, dict)}
seen = set()
for index, product in enumerate(products, 1):
    prefix = f'product #{index}'
    if not isinstance(product, dict):
        fail(f'{prefix}: not an object')
        continue
    product_id = product.get('id', '')
    if not re.fullmatch(r'vj-\d{6}', product_id):
        fail(f'{prefix}: invalid id {product_id!r}')
    if product_id in seen:
        fail(f'{prefix}: duplicate id {product_id}')
    seen.add(product_id)
    if product.get('category') not in category_ids:
        fail(f'{product_id}: unknown category {product.get("category")}')
    if product.get('publication_status') not in {'published', 'draft'}:
        fail(f'{product_id}: bad publication_status')
    if product.get('sale_status') not in {'available', 'reserved', 'sold'}:
        fail(f'{product_id}: bad sale_status')
    try:
        date.fromisoformat(product.get('date_added', ''))
    except Exception:
        fail(f'{product_id}: invalid date_added')
    for field in ('title', 'description'):
        value = product.get(field, {})
        if product.get('publication_status') == 'published' and (not value.get('uk') or not value.get('en')):
            fail(f'{product_id}: {field} must have uk/en')
    price = product.get('price', {})
    if price.get('type') not in {'fixed', 'request'}:
        fail(f'{product_id}: invalid price type')
    if price.get('type') == 'fixed':
        try:
            if float(price.get('value')) < 0:
                raise ValueError
        except Exception:
            fail(f'{product_id}: invalid fixed price')
    images = product.get('media', {}).get('images', [])
    if product.get('publication_status') == 'published' and not images:
        fail(f'{product_id}: published product has no images')
    for image in images:
        if not re.fullmatch(r'images/products/[^/]+/\d{2}\.(webp|jpg|jpeg|png)', image, re.I):
            fail(f'{product_id}: suspicious image path {image}')
        if not (ROOT / image).exists():
            fail(f'{product_id}: missing image {image}')

legacy = ('network-guard.js', 'homepage-fast.js', 'homepage-interactions.js', 'item-fast.js', 'app.js', 'catalog.js')
for html_name in ('index.html', 'item.html', 'admin.html', 'publish.html', '404.html'):
    path = ROOT / html_name
    if not path.exists():
        fail(f'missing {html_name}')
        continue
    parser = AssetParser()
    parser.feed(path.read_text('utf-8'))
    for raw in parser.assets:
        value = raw.split('?', 1)[0]
        if not value or value.startswith(('http:', 'https:', 'mailto:', 'tel:', '#')):
            continue
        if not (ROOT / value).exists():
            fail(f'{html_name}: missing referenced file {value}')
    if html_name in ('index.html', 'item.html'):
        active = ' '.join(parser.scripts)
        for name in legacy:
            if name in active:
                fail(f'{html_name}: legacy script still active: {name}')

catalog_path = ROOT / 'data/catalog-data.js'
if not catalog_path.exists():
    fail('missing data/catalog-data.js')
else:
    text = catalog_path.read_text('utf-8').strip()
    match = re.fullmatch(r'window\.VINTAGE_JAM_DATA\s*=\s*(\{.*\});', text, re.S)
    if not match:
        fail('catalog-data.js has invalid wrapper')
    else:
        try:
            embedded = json.loads(match.group(1))
        except Exception as exc:
            fail(f'catalog-data.js invalid JSON: {exc}')
            embedded = {}
        if embedded.get('products') != products:
            fail('catalog-data.js products are not synchronized with products.json')
        if embedded.get('categories') != categories:
            fail('catalog-data.js categories are not synchronized with categories.json')

for js in ('assets/js/catalog-v3.js', 'assets/js/product-v3.js', 'assets/js/admin-v3.js', 'assets/js/publish-v3.js'):
    if not (ROOT / js).exists():
        fail(f'missing {js}')

if errors:
    print('\n'.join(f'ERROR: {error}' for error in errors))
    sys.exit(1)
print(f'OK: {len(products)} products, {len(categories)} categories, public/admin files valid')

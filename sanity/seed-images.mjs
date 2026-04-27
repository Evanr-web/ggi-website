// Upload images to Sanity and attach to existing documents
import { readFileSync } from 'fs';
import { basename } from 'path';

const PROJECT_ID = 'dhzbvx7r';
const DATASET = 'production';
const TOKEN = process.env.SANITY_TOKEN;
const API_MUTATE = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`;
const API_ASSETS = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/${DATASET}`;
const IMG_BASE = 'public/images';

async function uploadImage(filePath) {
  const data = readFileSync(filePath);
  const ext = filePath.split('.').pop();
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const name = basename(filePath);
  
  const res = await fetch(`${API_ASSETS}?filename=${name}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': mime },
    body: data,
  });
  const json = await res.json();
  if (!json.document) { console.error(`UPLOAD FAIL: ${name}`, json); return null; }
  return json.document._id;
}

async function patchImage(docId, field, assetId) {
  const res = await fetch(API_MUTATE, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations: [{ patch: { id: docId, set: {
      [field]: { _type: 'image', asset: { _type: 'reference', _ref: assetId } }
    }}}]}),
  });
  const json = await res.json();
  return json.results?.length > 0;
}

async function run() {
  // === People headshots ===
  const people = [
    ['person-ryan-topping', 'Ryan-Topping-headshot.jpg'],
    ['person-catherine-renneberg', 'Catherine-Renneberg-headshot.jpg'],
    ['person-victor-carpay', 'Victor-Carpay-headshot.jpg'],
    ['person-brian-holdsworth', 'Brian-Holdsworth-headshot.jpg'],
    ['person-celene-sidloski', 'Celene-Sidloski-headshot.jpg'],
    ['person-caleb-ropp', 'Caleb-Ropp-headshot.jpg'],
    ['person-joe-woodard', 'Joe-Woodard-headshot.jpg'],
    ['person-celene-sidloski-fellow', 'Celene-Sidloski-headshot.jpg'],
    ['person-mark-ingham', 'Mark-Ingham-headshot.jpg'],
    ['person-fr-michael-bombak', 'Fr-Michael-Bombak-headshot.jpg'],
    ['person-jeff-lockert', 'Jeff-Lockert-headshot.jpg'],
    ['person-andrew-bennett', 'Andrew-Bennett-headshot.jpg'],
    ['person-keith-cassidy', 'Keith-Cassidy-headshot.jpg'],
    ['person-alane-boudreau', 'Alane-Boudreau-headshot.jpg'],
    ['person-thomas-collins', 'thomas-collins.jpg'],
  ];

  // Track uploaded assets to avoid duplicates (Celene appears twice)
  const assetCache = {};

  for (const [docId, file] of people) {
    const path = `${IMG_BASE}/people/${file}`;
    if (!assetCache[file]) {
      assetCache[file] = await uploadImage(path);
    }
    if (assetCache[file]) {
      const ok = await patchImage(docId, 'photo', assetCache[file]);
      console.log(`${ok ? '✓' : '✗'} ${docId} → ${file}`);
    }
  }

  // === Event images ===
  const events = [
    ['event-book-study-feb-2026', 'events/book-study-placeholder.jpg'],
    ['event-prayer-breakfast-2026', 'events/prayer-breakfast-placeholder.jpg'],
    ['event-finances-101', 'events/finances-placeholder.jpg'],
    ['event-book-study-may-2026', 'events/animal-farm-morland.jpg'],
    ['event-music-camp-2026', 'events/music-camp-hero-outdoor.jpg'],
    ['event-book-study-sep-2026', 'events/leisure-bruegel-harvesters.jpg'],
    ['event-conference-2026', 'events/2026-renewing-culture-conference-art.jpg'],
    ['event-conference-2025', 'events/2026-renewing-culture-conference-art.jpg'],
  ];

  for (const [docId, file] of events) {
    const path = `${IMG_BASE}/${file}`;
    const key = file;
    if (!assetCache[key]) {
      assetCache[key] = await uploadImage(path);
    }
    if (assetCache[key]) {
      const ok = await patchImage(docId, 'headerImage', assetCache[key]);
      console.log(`${ok ? '✓' : '✗'} ${docId} → ${file}`);
    }
  }

  // === Library article images ===
  const library = [
    ['library-fine-gathering-ottawa', 'art/parliament-hill-ottawa.jpg'],
    ['library-personal-finances', 'events/finances-placeholder.jpg'],
    ['library-medicine-forgets-vocation', 'art/raphael-resurrection.jpg'],
    ['library-easter-family', 'art/caravaggio-supper-emmaus.jpg'],
    ['library-abolition-of-man-guide', 'art/gozzoli-triumph-aquinas.jpg'],
    ['library-christmas-books-2025', 'art/roestraten-still-life-books.jpg'],
  ];

  for (const [docId, file] of library) {
    const path = `${IMG_BASE}/${file}`;
    const key = file;
    if (!assetCache[key]) {
      assetCache[key] = await uploadImage(path);
    }
    if (assetCache[key]) {
      const ok = await patchImage(docId, 'image', assetCache[key]);
      console.log(`${ok ? '✓' : '✗'} ${docId} → ${file}`);
    }
  }

  // === Magnalia cover ===
  const coverId = await uploadImage(`${IMG_BASE}/branding/Magnalia_Cover.jpg`);
  if (coverId) {
    const ok = await patchImage('magnalia-issue-1', 'coverImage', coverId);
    console.log(`${ok ? '✓' : '✗'} magnalia-issue-1 → Magnalia_Cover.jpg`);
  }

  console.log('\n✅ All images uploaded!');
}

run().catch(console.error);

import { readFileSync } from 'fs';
import { basename } from 'path';

const PROJECT_ID = 'dhzbvx7r';
const DATASET = 'production';
const TOKEN = process.env.SANITY_TOKEN;
const API_MUTATE = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`;
const API_ASSETS = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/${DATASET}`;

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
  if (!json.document) { console.error(`FAIL: ${name}`, json); return null; }
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
  return (await res.json()).results?.length > 0;
}

async function run() {
  const programs = [
    ['program-conference', 'public/images/events/2026-renewing-culture-conference-art.jpg'],
    ['program-book-studies', 'public/images/events/2026-book-studies-reading-list.jpg'],
    ['program-masterclasses', 'public/images/art/vanitas-still-life-painting.jpg'],
    ['program-faith-and-reason', 'public/images/art/Bodleian-Library-Oxford.jpg'],
    ['program-music-camp', 'public/images/events/music-camp-hero-outdoor.jpg'],
  ];

  for (const [docId, path] of programs) {
    const assetId = await uploadImage(path);
    if (assetId) {
      const ok = await patchImage(docId, 'headerImage', assetId);
      console.log(`${ok ? '✓' : '✗'} ${docId}`);
    }
  }
  console.log('\n✅ Program images done!');
}

run().catch(console.error);

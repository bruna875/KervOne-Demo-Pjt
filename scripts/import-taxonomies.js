// scripts/import-taxonomies.js — one-time taxonomy import into Neon
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs   = require('fs');
const path = require('path');

const sql  = neon(process.env.DATABASE_URL);
const DIR  = '/Users/alessandrogaravaglia/Downloads';

function readCsv(file) {
  const lines = fs.readFileSync(path.join(DIR, file), 'utf8')
    .split('\n').map(l => l.trim()).filter(Boolean);
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const fields = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQ = !inQ; continue; }
      if (line[i] === ',' && !inQ) { fields.push(cur); cur = ''; continue; }
      cur += line[i];
    }
    fields.push(cur);
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (fields[i] || '').trim());
    return obj;
  });
}

// Bulk insert using a single VALUES statement per chunk
async function bulkInsert(rows) {
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    // Build parameterized query manually
    const placeholders = chunk.map((_, j) => {
      const base = j * 6;
      return `($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6})`;
    }).join(',');
    const params = [];
    chunk.forEach(r => {
      params.push(r.id, r.type, r.name, r.category || null, r.subcategory || null, r.extra || null);
    });
    await sql.query(`INSERT INTO taxonomy_items (id,type,name,category,subcategory,extra) VALUES ${placeholders}`, params);
    process.stdout.write(`\r  Inserted ${Math.min(i + CHUNK, rows.length)} / ${rows.length}...`);
  }
}

async function run() {
  console.log('Creating taxonomy_items table...');
  await sql`DROP TABLE IF EXISTS taxonomy_items`;
  await sql`
    CREATE TABLE taxonomy_items (
      id          TEXT,
      type        TEXT  NOT NULL,
      name        TEXT  NOT NULL,
      category    TEXT,
      subcategory TEXT,
      extra       TEXT
    )
  `;
  await sql`CREATE INDEX ON taxonomy_items (type)`;
  console.log('Table created.\n');

  const rows = [];

  // IAB (698)
  readCsv('taxonomies_IAB.csv').forEach(r =>
    rows.push({ id: r.ID, type: 'iab', name: r['IAB Name'], category: null, subcategory: null, extra: null }));
  console.log(`IAB:          ${rows.length} rows`);

  // Emotions (10)
  const e0 = rows.length;
  readCsv('taxonomies_emotions.csv').forEach(r =>
    rows.push({ id: r.ID, type: 'emotion', name: r['Emotion Name'], category: null, subcategory: null, extra: null }));
  console.log(`Emotions:     ${rows.length - e0} rows`);

  // Sentiment (6)
  const s0 = rows.length;
  readCsv('taxonomies_sentiment.csv').forEach(r =>
    rows.push({ id: r.ID, type: 'sentiment', name: r.Name, category: null, subcategory: null, extra: null }));
  console.log(`Sentiment:    ${rows.length - s0} rows`);

  // Brand Safety (22)
  const b0 = rows.length;
  readCsv('taxonomies_brand_safety.csv').forEach(r =>
    rows.push({ id: r.ID, type: 'brand_safety', name: r['Brand Safety Name'], category: null, subcategory: null, extra: null }));
  console.log(`Brand Safety: ${rows.length - b0} rows`);

  // Objects (435) — no ID
  const o0 = rows.length;
  readCsv('taxonomies_objects.csv').forEach((r, i) =>
    rows.push({ id: 'OBJ' + (i + 1), type: 'object', name: r.Name, category: null, subcategory: null, extra: null }));
  console.log(`Objects:      ${rows.length - o0} rows`);

  // Locations (123)
  const l0 = rows.length;
  readCsv('taxonomies_locations.csv').forEach(r =>
    rows.push({ id: r.ID, type: 'location', name: r['Location Name'],
      category: r.Category, subcategory: null,
      extra: r['Visual/Contextual Cues'] || null }));
  console.log(`Locations:    ${rows.length - l0} rows`);

  // Logos (477)
  const lg0 = rows.length;
  readCsv('taxonomies_logos.csv').forEach(r =>
    rows.push({ id: r.ID, type: 'logo', name: r['Logo Name'],
      category: r.Category, subcategory: r.Subcategory, extra: null }));
  console.log(`Logos:        ${rows.length - lg0} rows`);

  // Faces (1741)
  const f0 = rows.length;
  readCsv('taxonomies_faces.csv').forEach(r =>
    rows.push({ id: r.ID, type: 'face', name: r.Name,
      category: r.Category, subcategory: r.Subcategory, extra: null }));
  console.log(`Faces:        ${rows.length - f0} rows`);

  console.log(`\nTotal: ${rows.length} rows — inserting...`);
  await bulkInsert(rows);

  console.log('\n\nVerifying:');
  const counts = await sql`SELECT type, COUNT(*)::int AS n FROM taxonomy_items GROUP BY type ORDER BY type`;
  counts.forEach(r => console.log(`  ${r.type.padEnd(12)} ${r.n}`));
  console.log('\nDone ✓');
}

run().catch(e => { console.error(e.message); process.exit(1); });

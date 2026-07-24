// scripts/import-creatives.js — full import from Radius CSV
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const sql     = neon(process.env.DATABASE_URL);
const CSV     = '/Users/alessandrogaravaglia/Downloads/Creative List from Radius - Import for the Demo - IMPORT_JUNE_10TH.csv';
const THUMB_DIR = path.join(__dirname, '../public/thumbnails/creatives');

if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });

const delay = ms => new Promise(r => setTimeout(r, ms));

// ── Org alias mapping ─────────────────────────────────────────────────────────
const ORG_ALIAS = { 'WPP Media': 'WPP' };

// ── Parse CSV ─────────────────────────────────────────────────────────────────
function parseCSV() {
  const lines = fs.readFileSync(CSV, 'utf8').trim().split('\n');
  return lines.slice(1).map(l => {
    const cols = l.split(',');
    const html = s => s.replace(/&#x27;/g,"'").replace(/&#x2019;/g,"'").replace(/&amp;/g,"&");
    return {
      id:         parseInt(cols[0].trim()),
      name:       html(cols[1].trim()),
      org:        ORG_ALIAS[cols[2].trim()] || cols[2].trim(),
      advertiser: cols[3].trim(),
      campaign:   html(cols[4].trim()),
      template:   cols[5].trim(),
      media:      cols[6].trim(),
      url:        cols[7].trim()
    };
  });
}

// ── HTTP fetch ────────────────────────────────────────────────────────────────
function fetchUrl(url, maxRedirects = 5) {
  return new Promise((res, rej) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, r => {
      if ([301,302,307,308].includes(r.statusCode) && r.headers.location && maxRedirects > 0)
        return fetchUrl(r.headers.location, maxRedirects - 1).then(res).catch(rej);
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => res({ status: r.statusCode, buf: Buffer.concat(chunks), ct: r.headers['content-type'] || '' }));
    });
    req.on('error', rej);
    req.setTimeout(10000, () => { req.destroy(); rej(new Error('timeout')); });
  });
}

// ── Fetch thumbnail from Radius preview page ──────────────────────────────────
async function fetchThumbnail(creativeId, previewUrl) {
  // Try standard Radius thumbnail endpoint
  const attempts = [
    `https://radius.video/thumbnails/${creativeId}.jpg`,
    `https://radius.video/thumbnails/${creativeId}.png`,
  ];
  for (const url of attempts) {
    try {
      const r = await fetchUrl(url);
      if (r.status === 200 && r.buf.length > 2000) {
        const ext = url.split('.').pop();
        const file = `radius-${creativeId}.${ext}`;
        fs.writeFileSync(path.join(THUMB_DIR, file), r.buf);
        return `/thumbnails/creatives/${file}`;
      }
    } catch {}
  }

  // Fallback: scrape og:image from preview page
  try {
    const r = await fetchUrl(previewUrl);
    if (r.status === 200) {
      const html = r.buf.toString();
      const og = html.match(/og:image[^>]*content="([^"]+)"/)?.[1]
                || html.match(/content="([^"]+)"[^>]*og:image/)?.[1]
                || html.match(/poster="([^"]+)"/)?.[1];
      if (og) {
        const imgUrl = og.startsWith('http') ? og : 'https://radius.video' + og;
        const imgR = await fetchUrl(imgUrl);
        if (imgR.status === 200 && imgR.buf.length > 2000) {
          const ext = (og.split('.').pop().split('?')[0].replace(/[^a-z]/gi,'') || 'jpg').slice(0,4);
          const file = `radius-${creativeId}.${ext}`;
          fs.writeFileSync(path.join(THUMB_DIR, file), imgR.buf);
          return `/thumbnails/creatives/${file}`;
        }
      }
    }
  } catch {}

  return null;
}

async function run() {
  const rows = parseCSV();
  console.log(`Parsed ${rows.length} creatives\n`);

  // ── 1. Load existing DB data ──────────────────────────────────────────────────
  const [dbOrgs, dbAdvs, dbCamps, dbAdTypes, dbCreatives] = await Promise.all([
    sql`SELECT client_org_id, client_name FROM client_organizations`,
    sql`SELECT advertiser_id, advertiser_name, client_org_id FROM advertisers`,
    sql`SELECT campaign_id, campaign_name FROM campaigns`,
    sql`SELECT ad_type_id, ad_type_name FROM ad_types`,
    sql`SELECT creative_id FROM creatives`,
  ]);

  const orgMap      = new Map(dbOrgs.map(o => [o.client_name, o.client_org_id]));
  const advMap      = new Map(dbAdvs.map(a => [a.advertiser_name, { id: a.advertiser_id, orgId: a.client_org_id }]));
  const campMap     = new Map(dbCamps.map(c => [c.campaign_name, c.campaign_id]));
  const adTypeMap   = new Map(dbAdTypes.map(t => [t.ad_type_name, t.ad_type_id]));
  const existCreIds = new Set(dbCreatives.map(c => c.creative_id));

  // ── 2. Add missing ad_types (templates) ──────────────────────────────────────
  console.log('── Ad Types (Templates) ──');
  const uniqueTemplates = [...new Set(rows.map(r => r.template))].sort();
  for (const t of uniqueTemplates) {
    if (!adTypeMap.has(t)) {
      const [row] = await sql`
        INSERT INTO ad_types (ad_type_name, media_type, details_schema)
        VALUES (${t}, 'CTV', '{}')
        RETURNING ad_type_id
      `;
      adTypeMap.set(t, row.ad_type_id);
      console.log(`  + ${t} (id: ${row.ad_type_id})`);
    } else {
      console.log(`  ✓ ${t} (id: ${adTypeMap.get(t)})`);
    }
  }

  // ── 3. Create missing orgs ────────────────────────────────────────────────────
  console.log('\n── Client Organizations ──');
  const uniqueOrgs = [...new Set(rows.map(r => r.org))].sort();
  for (const orgName of uniqueOrgs) {
    if (!orgMap.has(orgName)) {
      const [row] = await sql`
        INSERT INTO client_organizations (client_name, client_type)
        VALUES (${orgName}, 'Agency')
        RETURNING client_org_id
      `;
      orgMap.set(orgName, row.client_org_id);
      console.log(`  + ${orgName}`);
    } else {
      console.log(`  ✓ ${orgName}`);
    }
  }

  // ── 4. Create missing advertisers ─────────────────────────────────────────────
  console.log('\n── Advertisers ──');
  const advOrgPairs = [...new Map(rows.map(r => [r.advertiser, r.org])).entries()];
  for (const [advName, orgName] of advOrgPairs) {
    if (!advMap.has(advName)) {
      const orgId = orgMap.get(orgName);
      const [row] = await sql`
        INSERT INTO advertisers (advertiser_name, client_org_id)
        VALUES (${advName}, ${orgId})
        RETURNING advertiser_id
      `;
      advMap.set(advName, { id: row.advertiser_id, orgId });
      console.log(`  + ${advName}`);
    } else {
      console.log(`  ✓ ${advName}`);
    }
  }

  // ── 5. Create missing campaigns ───────────────────────────────────────────────
  console.log('\n── Campaigns ──');
  const campAdvPairs = [...new Map(rows.map(r => [r.campaign, r.advertiser])).entries()];
  for (const [campName, advName] of campAdvPairs) {
    if (!campMap.has(campName)) {
      const advData = advMap.get(advName);
      const [row] = await sql`
        INSERT INTO campaigns (campaign_name, advertiser_id, status)
        VALUES (${campName}, ${advData?.id || null}, 'DRAFT')
        RETURNING campaign_id
      `;
      campMap.set(campName, row.campaign_id);
      console.log(`  + ${campName}`);
    } else {
      console.log(`  ✓ ${campName}`);
    }
  }

  // ── 6. Creatives + thumbnails ──────────────────────────────────────────────────
  console.log('\n── Creatives ──');
  let created = 0, skipped = 0, thumbOk = 0, thumbFail = 0;
  const maxId = Math.max(...rows.map(r => r.id));

  for (const row of rows) {
    if (existCreIds.has(row.id)) {
      console.log(`  ✓ [${row.id}] already exists`);
      skipped++;
      continue;
    }

    process.stdout.write(`  + [${row.id}] thumb...`);
    const thumbPath = await fetchThumbnail(row.id, row.url);
    if (thumbPath) { thumbOk++; process.stdout.write(' ✓'); }
    else           { thumbFail++; process.stdout.write(' ✗'); }

    const adTypeId  = adTypeMap.get(row.template);
    const campId    = campMap.get(row.campaign);
    const advData   = advMap.get(row.advertiser);
    const orgId     = orgMap.get(row.org);
    const thumbUrl  = thumbPath ? `https://kerv-one-vision-bruna.vercel.app${thumbPath}` : null;

    try {
      await sql`
        INSERT INTO creatives (
          creative_id, creative_name, campaign_id, advertiser_id,
          client_org_id, media_type, creative_asset_type,
          creative_preview, creative_asset_link,
          ad_types_id
        ) VALUES (
          ${row.id}, ${row.name}, ${campId || null}, ${advData?.id || null},
          ${orgId || null}, 'CTV', 'radius',
          ${row.url}, ${thumbUrl},
          ${adTypeId ? [adTypeId] : []}
        )
      `;
      process.stdout.write(` saved\n`);
      created++;
    } catch(e) {
      process.stdout.write(` ERR: ${e.message.slice(0,80)}\n`);
    }

    await delay(200);
  }

  // ── 7. Reset sequence above max imported ID ───────────────────────────────────
  if (created > 0) {
    await sql`SELECT setval('creatives_creative_id_seq', ${maxId})`;
    console.log(`\n  Sequence reset to ${maxId}`);
  }

  console.log(`\n✓ Done`);
  console.log(`  Creatives: ${created} created, ${skipped} skipped`);
  console.log(`  Thumbnails: ${thumbOk} ok, ${thumbFail} failed`);
}

run().catch(console.error);

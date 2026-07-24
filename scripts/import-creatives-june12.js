// scripts/import-creatives-june12.js
require('dotenv').config({ path: '.env.local' });
const puppeteer = require('puppeteer');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);
const CSV = '/Users/alessandrogaravaglia/Downloads/Creative List from Radius - Import for the Demo - IMPORT_JUNE_12TH.csv';
const fs = require('fs');

const DELAY = ms => new Promise(r => setTimeout(r, ms));

function parseCSV() {
  const lines = fs.readFileSync(CSV, 'utf8').trim().split('\n');
  return lines.slice(1).map(l => {
    // Split on comma but be careful — names can have commas if quoted
    const cols = l.split(',');
    return {
      id:         parseInt(cols[0].trim()),
      name:       cols[1].trim(),
      org:        cols[2].trim(),
      advertiser: cols[3].trim(),
      campaign:   cols[4].trim(),
      template:   cols[5].trim(),
      previewUrl: cols[6].trim(),
    };
  });
}

async function screenshotRadius(browser, url) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 320, height: 180 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
    try { await page.waitForSelector('video', { timeout: 10000 }); await DELAY(2000); } catch (_) {}
    const buf = await page.screenshot({ type: 'jpeg', quality: 70, clip: { x: 0, y: 0, width: 320, height: 180 } });
    return 'data:image/jpeg;base64,' + buf.toString('base64');
  } finally {
    await page.close();
  }
}

async function run() {
  const rows = parseCSV();
  console.log(`Parsed ${rows.length} creatives\n`);

  // ── 1. Load DB ────────────────────────────────────────────────────────────────
  const [dbOrgs, dbAdvs, dbCamps, dbAdTypes, dbCreatives] = await Promise.all([
    sql`SELECT client_org_id, client_name FROM client_organizations`,
    sql`SELECT advertiser_id, advertiser_name, client_org_id FROM advertisers`,
    sql`SELECT campaign_id, campaign_name FROM campaigns`,
    sql`SELECT ad_type_id, ad_type_name FROM ad_types`,
    sql`SELECT creative_id FROM creatives`,
  ]);

  const orgMap      = new Map(dbOrgs.map(o => [o.client_name, o.client_org_id]));
  const advMap      = new Map(dbAdvs.map(a => [`${a.advertiser_name}__${a.client_org_id}`, a.advertiser_id]));
  const campMap     = new Map(dbCamps.map(c => [c.campaign_name, c.campaign_id]));
  const adTypeMap   = new Map(dbAdTypes.map(t => [t.ad_type_name, t.ad_type_id]));
  const existCreIds = new Set(dbCreatives.map(c => c.creative_id));

  // ── 2. Ad types (templates) ───────────────────────────────────────────────────
  console.log('── Ad Types ──');
  for (const t of [...new Set(rows.map(r => r.template))]) {
    if (!adTypeMap.has(t)) {
      const [row] = await sql`INSERT INTO ad_types (ad_type_name, media_type, details_schema) VALUES (${t}, 'CTV', '{}') RETURNING ad_type_id`;
      adTypeMap.set(t, row.ad_type_id);
      console.log(`  + ${t}`);
    } else {
      console.log(`  ✓ ${t}`);
    }
  }

  // ── 3. Client orgs ────────────────────────────────────────────────────────────
  console.log('\n── Client Orgs ──');
  for (const orgName of [...new Set(rows.map(r => r.org))]) {
    if (!orgMap.has(orgName)) {
      const [row] = await sql`INSERT INTO client_organizations (client_name, client_type) VALUES (${orgName}, 'Publisher') RETURNING client_org_id`;
      orgMap.set(orgName, row.client_org_id);
      console.log(`  + ${orgName} (id: ${row.client_org_id})`);
    } else {
      console.log(`  ✓ ${orgName} (id: ${orgMap.get(orgName)})`);
    }
  }

  // ── 4. Advertisers (keyed by name+org to avoid cross-org collisions) ──────────
  console.log('\n── Advertisers ──');
  for (const r of rows) {
    const orgId = orgMap.get(r.org);
    const key   = `${r.advertiser}__${orgId}`;
    if (!advMap.has(key)) {
      const [row] = await sql`INSERT INTO advertisers (advertiser_name, client_org_id) VALUES (${r.advertiser}, ${orgId}) RETURNING advertiser_id`;
      advMap.set(key, row.advertiser_id);
      console.log(`  + ${r.advertiser} (org: ${r.org})`);
    } else {
      console.log(`  ✓ ${r.advertiser} (org: ${r.org})`);
    }
  }

  // ── 5. Campaigns ──────────────────────────────────────────────────────────────
  console.log('\n── Campaigns ──');
  for (const r of rows) {
    if (!campMap.has(r.campaign)) {
      const orgId  = orgMap.get(r.org);
      const advId  = advMap.get(`${r.advertiser}__${orgId}`);
      const [row] = await sql`INSERT INTO campaigns (campaign_name, advertiser_id, status) VALUES (${r.campaign}, ${advId}, 'draft') RETURNING campaign_id`;
      campMap.set(r.campaign, row.campaign_id);
      console.log(`  + ${r.campaign} (id: ${row.campaign_id})`);
    } else {
      console.log(`  ✓ ${r.campaign} (id: ${campMap.get(r.campaign)})`);
    }
  }

  // ── 6. Creatives (preserve Radius ID) ─────────────────────────────────────────
  console.log('\n── Creatives ──');
  for (const r of rows) {
    if (existCreIds.has(r.id)) {
      console.log(`  ✓ #${r.id} already exists — skip`);
      continue;
    }
    const orgId   = orgMap.get(r.org);
    const advId   = advMap.get(`${r.advertiser}__${orgId}`);
    const campId  = campMap.get(r.campaign);
    const adTypeId = adTypeMap.get(r.template);
    await sql`
      INSERT INTO creatives (creative_id, creative_name, creative_asset_type, creative_asset_link, campaign_id, advertiser_id, client_org_id, ad_types_id, media_type)
      VALUES (${r.id}, ${r.name}, 'radius', ${r.previewUrl}, ${campId}, ${advId}, ${orgId}, ${adTypeId ? [adTypeId] : []}, 'CTV')
    `;
    existCreIds.add(r.id);
    console.log(`  + #${r.id} ${r.name}`);
  }

  // ── 7. Thumbnails via Puppeteer ───────────────────────────────────────────────
  console.log('\n── Thumbnails ──');
  const toThumb = rows.filter(r => true); // all rows
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  for (let i = 0; i < toThumb.length; i++) {
    const r = toThumb[i];
    process.stdout.write(`  [${i+1}/${toThumb.length}] #${r.id} ${r.name.slice(0,40)} ... `);
    try {
      const b64 = await screenshotRadius(browser, r.previewUrl);
      await sql`UPDATE creatives SET creative_preview = ${b64} WHERE creative_id = ${r.id}`;
      console.log('✅');
    } catch (e) {
      console.log(`❌ ${e.message}`);
    }
    if (i < toThumb.length - 1) await DELAY(1500);
  }

  await browser.close();
  console.log('\n🏁 Done.');
}

run().catch(err => { console.error(err); process.exit(1); });

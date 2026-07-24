// scripts/fetch-thumbnails.js — fetch show thumbnails via TV Maze + Wikipedia
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const OUT_DIR = path.join(__dirname, '../public/thumbnails');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const SHOWS = [
  { name: 'CNN',                    search: 'CNN',                          category: 'News' },
  { name: 'BBC News',               search: 'BBC News',                     category: 'News' },
  { name: 'Fox Weather',            search: 'Fox Weather',                  category: 'News' },
  { name: 'Bloomberg TV',           search: 'Bloomberg Television',         category: 'News' },
  { name: 'ABC 20/20',              search: '20/20',                        category: 'News' },
  { name: 'Newsmax',                search: 'Newsmax',                      category: 'News' },
  { name: 'NBC News Now',           search: 'NBC News Now',                 category: 'News' },
  { name: 'CBS News',               search: 'CBS News',                     category: 'News' },
  { name: 'ABC News Live',          search: 'ABC News',                     category: 'News' },
  { name: 'Live Now From Fox',      search: 'LiveNOW from FOX',             category: 'News' },
  { name: 'Scripps News',           search: 'Scripps News',                 category: 'News' },
  { name: 'WeatherNation',          search: 'WeatherNation',                category: 'News' },
  { name: 'OAN',                    search: 'One America News',             category: 'News' },
  { name: 'Real Americas Voice',    search: "Real America's Voice",         category: 'News' },
  { name: 'Estrella News',          search: 'Estrella TV',                  category: 'News' },

  { name: 'Pawn Stars',             search: 'Pawn Stars',                   category: 'Entertainment' },
  { name: 'Storage Wars',           search: 'Storage Wars',                 category: 'Entertainment' },
  { name: 'Dog the Bounty Hunter',  search: 'Dog the Bounty Hunter',        category: 'Entertainment' },
  { name: 'Dance Moms',             search: 'Dance Moms',                   category: 'Entertainment' },
  { name: 'Deal or No Deal',        search: 'Deal or No Deal',              category: 'Entertainment' },
  { name: 'Midsomer Murders',       search: 'Midsomer Murders',             category: 'Entertainment' },
  { name: 'Baywatch',               search: 'Baywatch',                     category: 'Entertainment' },
  { name: 'Heartland',              search: 'Heartland',                    category: 'Entertainment' },
  { name: 'Ion Television',         search: 'Ion Television',               category: 'Entertainment' },
  { name: 'Court TV',               search: 'Court TV',                     category: 'Entertainment' },
  { name: 'Bounce TV',              search: 'Bounce TV',                    category: 'Entertainment' },
  { name: 'Law & Crime Network',    search: 'Law and Crime',                category: 'Entertainment' },
  { name: 'Game Show Network',      search: 'GSN',                          category: 'Entertainment' },
  { name: 'Forged in Fire',         search: 'Forged in Fire',               category: 'Entertainment' },
  { name: 'National Lampoon',       search: 'National Lampoon',             category: 'Entertainment' },
  { name: 'Buzzr',                  search: 'Buzzr',                        category: 'Entertainment' },

  { name: 'Ancient Aliens',         search: 'Ancient Aliens',               category: 'Documentary' },
  { name: 'American Pickers',       search: 'American Pickers',             category: 'Documentary' },
  { name: 'Forensic Files',         search: 'Forensic Files',               category: 'Documentary' },
  { name: 'The First 48',           search: 'The First 48',                 category: 'Documentary' },
  { name: 'Cold Case Files',        search: 'Cold Case Files',              category: 'Documentary' },
  { name: 'Modern Marvels',         search: 'Modern Marvels',               category: 'Documentary' },
  { name: 'Dateline NBC',           search: 'Dateline',                     category: 'Documentary' },
  { name: 'BBC Earth',              search: 'BBC Earth',                    category: 'Documentary' },
  { name: 'Mountain Men',           search: 'Mountain Men',                 category: 'Documentary' },
  { name: 'Bondi Rescue',           search: 'Bondi Rescue',                 category: 'Documentary' },

  { name: 'Kitchen Nightmares',     search: 'Kitchen Nightmares',           category: 'Lifestyle' },
  { name: "Hell's Kitchen",         search: "Hell's Kitchen",               category: 'Lifestyle' },
  { name: "America's Test Kitchen", search: "America's Test Kitchen",       category: 'Lifestyle' },
  { name: 'This Old House',         search: 'This Old House',               category: 'Lifestyle' },
  { name: 'Tiny House Nation',      search: 'Tiny House Nation',            category: 'Lifestyle' },
  { name: 'The Pet Collective',     search: 'The Pet Collective',           category: 'Lifestyle' },

  { name: 'Hallmark Movies',        search: 'Hallmark Channel',             category: 'Movies' },
  { name: 'Lifetime Movies',        search: 'Lifetime',                     category: 'Movies' },
  { name: 'Miramax',                search: 'Miramax',                      category: 'Movies' },

  { name: 'NFL Network',            search: 'NFL Network',                  category: 'Sports' },
  { name: 'MLB Network',            search: 'MLB Network',                  category: 'Sports' },
  { name: 'Roku Sports Channel',    search: 'Roku Channel',                 category: 'Sports' },
];

const delay = ms => new Promise(r => setTimeout(r, ms));

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'ThumbnailFetcher/1.0' } }, r => {
      if ([301,302,307,308].includes(r.statusCode) && r.headers.location)
        return get(r.headers.location).then(res).catch(rej);
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => res({ status: r.statusCode, buf: Buffer.concat(chunks) }));
    }).on('error', rej);
  });
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Already downloaded from previous run — skip these
const existing = fs.existsSync(OUT_DIR)
  ? fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.gif') || f.endsWith('.svg'))
  : [];
const existingSlugs = new Set(existing.map(f => f.replace(/\.[^.]+$/, '')));

async function tvMazeImage(query) {
  const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
  await delay(300);
  const r = await get(url);
  try {
    const results = JSON.parse(r.buf.toString());
    const img = results[0]?.show?.image;
    return img?.original || img?.medium || null;
  } catch { return null; }
}

async function run() {
  const results = [];
  let found = 0, skipped = 0, missing = 0;

  for (let i = 0; i < SHOWS.length; i++) {
    const show = SHOWS[i];
    const sl   = slug(show.name);

    // Check if already downloaded
    const alreadyDone = existing.find(f => f.startsWith(sl + '.'));
    if (alreadyDone) {
      process.stdout.write(`[${i+1}/${SHOWS.length}] ${show.name}... already ✓\n`);
      results.push({ name: show.name, category: show.category, url: `/thumbnails/${alreadyDone}`, src: 'cached' });
      skipped++;
      continue;
    }

    process.stdout.write(`[${i+1}/${SHOWS.length}] ${show.name}... `);

    try {
      const imgUrl = await tvMazeImage(show.search);
      if (!imgUrl) { process.stdout.write('— not found\n'); missing++; results.push({name:show.name,category:show.category,url:'',src:''}); continue; }

      await delay(200);
      const dl = await get(imgUrl);
      if (dl.status === 200 && dl.buf.length > 1000) {
        const ext  = (imgUrl.split('?')[0].split('.').pop() || 'jpg').toLowerCase().slice(0,4);
        const file = sl + '.' + ext;
        fs.writeFileSync(path.join(OUT_DIR, file), dl.buf);
        process.stdout.write(`✓ (${Math.round(dl.buf.length/1024)}KB)\n`);
        results.push({ name: show.name, category: show.category, url: `/thumbnails/${file}`, src: imgUrl });
        found++;
      } else {
        process.stdout.write(`✗ (${dl.status})\n`);
        results.push({ name: show.name, category: show.category, url: '', src: imgUrl });
        missing++;
      }
    } catch(e) {
      process.stdout.write(`✗ ${e.message}\n`);
      results.push({ name: show.name, category: show.category, url: '', src: '' });
      missing++;
    }
  }

  const csv = 'Name,Category,Public URL\n'
    + results.map(r => `"${r.name}","${r.category}","${r.url}"`).join('\n');
  fs.writeFileSync(path.join(OUT_DIR, 'index.csv'), csv);

  console.log(`\n✓ ${found} new · ${skipped} cached · ${missing} missing`);
  console.log(`Output: public/thumbnails/`);
}

run().catch(console.error);

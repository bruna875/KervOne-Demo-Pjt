require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

const ORG = { Disney: 3, Paramount: 110, NBCU: 72, WBD: 105, Fox: 106 };
const BASE_THUMB = 'https://kerv-one-vision-bruna.vercel.app/public/thumbnails/vod';

function ytUrl(videoId) {
  return videoId ? 'https://www.youtube.com/watch?v=' + videoId : null;
}

// All rows from CSV (id, org, name, category, ytVideoId)
const rows = [
  // ── Disney (existing, update) ──
  [10, 'Disney', 'Andor S1 E1',                          'Entertainment', 'vfpmvUvubR0'],
  [11, 'Disney', 'The Mandalorian',                       'Sci-Fi',        null],
  [12, 'Disney', 'Loki S1 E2',                            'Superhero',     'f7vhLUtPbYc'],
  [13, 'Disney', 'Daredevil: Born Again S2 E8',           'Superhero',     '6weDzYsbVLQ'],
  [14, 'Disney', 'Percy Jackson and the Olympians S2',    'Fantasy',       'XvRA1JXRmSM'],
  [15, 'Disney', 'Ahsoka S1 E5',                          'Sci-Fi',        'XdUm1bP8fV0'],
  [16, 'Disney', "X-Men '97 S1 E1",                       'Superhero',     'CH0ivU87gXc'],
  [17, 'Disney', 'WandaVision S1 E9',                     'Superhero',     'VtiFdQVblPo'],
  [18, 'Disney', 'Moon Knight S1 E2',                     'Superhero',     'kP-aSTLy_m0'],
  [19, 'Disney', 'Agatha All Along S1 E2',                'Superhero',     'ClDmwnb8Bs0'],
  [20, 'Disney', 'Hawkeye',                               'Superhero',     null],
  [21, 'Disney', 'The Bear S2 E7',                        'Drama',         '1ABxxKbqXhc'],
  [22, 'Disney', 'Only Murders in the Building S4 E6',    'Comedy',        'OsMZT1C__Mw'],
  [23, 'Disney', 'Shōgun S1 E9',                          'Drama',         'WsONPIdluYU'],
  [24, 'Disney', 'Star Wars: Skeleton Crew',              'Sci-Fi',        '2wZJ3flDMnw'],
  [25, 'Disney', 'What If...? S1 E2',                     'Superhero',     'MqESetn75-g'],
  [26, 'Disney', 'The Acolyte',                           'Sci-Fi',        '-caL_Fhsr4U'],
  [27, 'Disney', 'Monsters at Work S2 E2',                'Animation',     'deqwzP-KA6s'],
  [28, 'Disney', 'National Treasure: Edge of History',    'Adventure',     '7Mntqim-rtc'],
  [29, 'Disney', 'Goosebumps',                            'Horror',        'W2VjTcMKoeE'],
  // ── Paramount (new) ──
  [30, 'Paramount', 'Tulsa King S1 E3',                   'Crime',         'SDBcNckQ4VE'],
  [31, 'Paramount', 'Landman S1 E4',                      'Drama',         'Nj9zRijIPAE'],
  [32, 'Paramount', 'Lioness S2 E2',                      'Thriller',      'oYG1gDs_4ik'],
  [33, 'Paramount', '1923 S2 E7',                         'Drama',         '4Vz79izVyCk'],
  [34, 'Paramount', 'Criminal Minds: Evolution',          'Crime',         '74qW2rsj-OQ'],
  [35, 'Paramount', 'Tracker S2 E9',                      'Drama',         'pSuXPjUr0e0'],
  [36, 'Paramount', 'Ghosts S4 E16',                      'Comedy',        'QnoDwVt19Rk'],
  [37, 'Paramount', 'NCIS S11 E2',                        'Crime',         'eK6mm7H49qk'],
  [38, 'Paramount', 'Fire Country',                       'Drama',         null],
  [39, 'Paramount', 'Matlock S1',                         'Drama',         'wTnezhXglJY'],
  [40, 'Paramount', 'Yellowjackets S3 E6',                'Thriller',      'OxO0oQFP3d8'],
  [41, 'Paramount', 'Dexter: Original Sin S1 E10',        'Crime',         'oTaZFdJXlQc'],
  [42, 'Paramount', 'Mayor of Kingstown S2 E2',           'Crime',         'sq03vM_RKQc'],
  [43, 'Paramount', 'Star Trek: Strange New Worlds S1 E1','Sci-Fi',        '4bC4uLWhzFw'],
  [44, 'Paramount', 'Survivor S49 E7',                    'Entertainment', 'NabSTlT0bgY'],
  [45, 'Paramount', 'The Amazing Race',                   'Entertainment', 'ImgstTjDcsk'],
  [46, 'Paramount', 'Blue Bloods S6 E7',                  'Crime',         '6BPfIwc3JDw'],
  // ── NBCU (new) ──
  [47, 'NBCU', 'The Traitors S2 E2',                      'Entertainment', 'YylLwoHbY20'],
  [48, 'NBCU', 'The Day of the Jackal S1 E1',             'Thriller',      'A9_FpQYuUnM'],
  [49, 'NBCU', 'Love Island USA S8 E13',                  'Entertainment', '7e1VUC3hLFU'],
  [50, 'NBCU', 'Twisted Metal S2 E5',                     'Comedy',        'bRnbijdbqDg'],
  [51, 'NBCU', 'Bel-Air S1 E7',                           'Drama',         'G3Ojcs91WOY'],
  [52, 'NBCU', 'Law & Order: SVU S6 E6',                  'Crime',         'pZk_2IwEiDI'],
  [53, 'NBCU', 'Chicago Fire S13 E18',                    'Drama',         'eDTnIBh02QY'],
  [54, 'NBCU', 'Chicago P.D. S13 E6',                     'Crime',         '3AsQReBQHWk'],
  [55, 'NBCU', 'Chicago Med S2 E11',                      'Drama',         'xGa4EqbyCyo'],
  [56, 'NBCU', 'Yellowstone S5 E11',                      'Drama',         'GHK9RjkeI1U'],
  [57, 'NBCU', 'Saturday Night Live',                     'Entertainment', 'JYqfVE-fykk'],
  [58, 'NBCU', 'Love Island Games S1 E4',                 'Entertainment', 'VJre9l515oo'],
  [59, 'NBCU', 'Below Deck S11 E8',                       'Entertainment', 'XgehUOTRjQI'],
  [60, 'NBCU', 'Resident Alien S1 E1',                    'Sci-Fi',        '2W2s6uN4vmg'],
  [61, 'NBCU', 'Suits S6 E11',                            'Drama',         'kNTjOIxY5qM'],
  [62, 'NBCU', 'The Office S6 E11',                       'Comedy',        'pkZF54FpRcY'],
  [63, 'NBCU', 'Parks and Recreation S2 E19',             'Comedy',        'CptGNaNekpY'],
  [64, 'NBCU', 'Based on a True Story S1 E9',             'Comedy',        '93FxYWijoZ0'],
  [65, 'NBCU', 'Mr. Throwback S1 E2',                     'Comedy',        'sMaLt3cybto'],
  // ── WBD (new) ──
  [66, 'WBD', 'The Last of Us S1 E6',                     'Drama',         'iHhvThyMlQ4'],
  [67, 'WBD', 'The White Lotus S1 E1',                    'Comedy',        'xMDbJyB1n_M'],
  [68, 'WBD', 'Hacks S5 E10',                             'Comedy',        '5dCXuCO7LgU'],
  [69, 'WBD', 'The Pitt S2 E4',                           'Drama',         'y94KLxufu-A'],
  [70, 'WBD', 'Euphoria',                                 'Drama',         null],
  [71, 'WBD', 'Peacemaker',                               'Superhero',     null],
  [72, 'WBD', 'The Righteous Gemstones',                  'Comedy',        null],
  [73, 'WBD', 'And Just Like That...',                    'Comedy',        null],
  [74, 'WBD', 'Succession',                               'Drama',         null],
  [75, 'WBD', 'Game of Thrones',                          'Fantasy',       null],
  [76, 'WBD', 'True Detective',                           'Crime',         null],
  [77, 'WBD', 'The Sopranos',                             'Crime',         null],
  [78, 'WBD', 'Curb Your Enthusiasm',                     'Comedy',        null],
  [79, 'WBD', 'The Penguin',                              'Crime',         null],
  [80, 'WBD', 'Barry',                                    'Comedy',        null],
  [81, 'WBD', 'Industry',                                 'Drama',         null],
  [82, 'WBD', 'Last Week Tonight with John Oliver',       'Entertainment', null],
  [83, 'WBD', 'The Gilded Age',                           'Drama',         null],
  [84, 'WBD', 'Mare of Easttown',                         'Crime',         null],
  // ── Fox (new) ──
  [85,  'Fox', 'NFL on FOX',                              'Sports',        null],
  [86,  'Fox', 'FIFA World Cup',                          'Sports',        null],
  [87,  'Fox', 'The Simpsons',                            'Animation',     null],
  [88,  'Fox', "Hell's Kitchen",                          'Entertainment', null],
  [89,  'Fox', 'The Floor',                               'Entertainment', null],
  [90,  'Fox', 'Family Guy',                              'Animation',     null],
  [91,  'Fox', "Bob's Burgers",                           'Animation',     null],
  [92,  'Fox', 'The Masked Singer',                       'Entertainment', null],
  [93,  'Fox', "Special Forces: World's Toughest Test",   'Entertainment', null],
  [94,  'Fox', 'Animal Control',                          'Comedy',        null],
  [95,  'Fox', 'Doc',                                     'Drama',         null],
  [96,  'Fox', 'Murder in a Small Town',                  'Crime',         null],
  [97,  'Fox', 'Farmer Wants a Wife',                     'Entertainment', null],
  [98,  'Fox', 'Major League Baseball on FOX',            'Sports',        null],
  [99,  'Fox', 'College Football on FOX',                 'Sports',        null],
  [100, 'Fox', 'UFL',                                     'Sports',        null],
  [101, 'Fox', 'Kitchen Nightmares',                      'Entertainment', null],
  [102, 'Fox', 'LEGO Masters',                            'Entertainment', null],
  [103, 'Fox', 'Next Level Chef',                         'Entertainment', null],
  [104, 'Fox', 'Accused',                                 'Crime',         null],
];

// Thumbnail slug mapping for new shows (to be downloaded)
const THUMB_SLUGS = {
  30: 'paramount-tulsa-king',         31: 'paramount-landman',
  32: 'paramount-lioness',            33: 'paramount-1923',
  34: 'paramount-criminal-minds',     35: 'paramount-tracker',
  36: 'paramount-ghosts',             37: 'paramount-ncis',
  38: 'paramount-fire-country',       39: 'paramount-matlock',
  40: 'paramount-yellowjackets',      41: 'paramount-dexter-original-sin',
  42: 'paramount-mayor-of-kingstown', 43: 'paramount-star-trek-snw',
  44: 'paramount-survivor',           45: 'paramount-amazing-race',
  46: 'paramount-blue-bloods',
  47: 'nbcu-the-traitors',            48: 'nbcu-day-of-the-jackal',
  49: 'nbcu-love-island-usa',         50: 'nbcu-twisted-metal',
  51: 'nbcu-bel-air',                 52: 'nbcu-law-and-order-svu',
  53: 'nbcu-chicago-fire',            54: 'nbcu-chicago-pd',
  55: 'nbcu-chicago-med',             56: 'nbcu-yellowstone',
  57: 'nbcu-snl',                     58: 'nbcu-love-island-games',
  59: 'nbcu-below-deck',              60: 'nbcu-resident-alien',
  61: 'nbcu-suits',                   62: 'nbcu-the-office',
  63: 'nbcu-parks-and-rec',           64: 'nbcu-based-on-a-true-story',
  65: 'nbcu-mr-throwback',
  66: 'wbd-the-last-of-us',           67: 'wbd-the-white-lotus',
  68: 'wbd-hacks',                    69: 'wbd-the-pitt',
  70: 'wbd-euphoria',                 71: 'wbd-peacemaker',
  72: 'wbd-righteous-gemstones',      73: 'wbd-and-just-like-that',
  74: 'wbd-succession',               75: 'wbd-game-of-thrones',
  76: 'wbd-true-detective',           77: 'wbd-the-sopranos',
  78: 'wbd-curb-your-enthusiasm',     79: 'wbd-the-penguin',
  80: 'wbd-barry',                    81: 'wbd-industry',
  82: 'wbd-last-week-tonight',        83: 'wbd-the-gilded-age',
  84: 'wbd-mare-of-easttown',
  85: 'fox-nfl',                      86: 'fox-fifa-world-cup',
  87: 'fox-the-simpsons',             88: 'fox-hells-kitchen',
  89: 'fox-the-floor',                90: 'fox-family-guy',
  91: 'fox-bobs-burgers',             92: 'fox-the-masked-singer',
  93: 'fox-special-forces',           94: 'fox-animal-control',
  95: 'fox-doc',                      96: 'fox-murder-small-town',
  97: 'fox-farmer-wants-a-wife',      98: 'fox-mlb',
  99: 'fox-college-football',         100: 'fox-ufl',
  101: 'fox-kitchen-nightmares',      102: 'fox-lego-masters',
  103: 'fox-next-level-chef',         104: 'fox-accused',
};

const EXISTING_IDS = new Set([10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29]);

async function run() {
  // Get existing vod_content_ids
  const existing = await sql.query('SELECT vod_content_id FROM vod_content');
  const existingSet = new Set(existing.map(r => r.vod_content_id));

  for (const [id, orgName, name, category, ytId] of rows) {
    const orgId = ORG[orgName];
    const ytLink = ytUrl(ytId);
    const thumb = THUMB_SLUGS[id] ? BASE_THUMB + '/' + THUMB_SLUGS[id] + '.jpg' : null;

    if (existingSet.has(id)) {
      // UPDATE existing
      await sql.query(
        'UPDATE vod_content SET vod_content_name=$1, vod_content_category=$2, client_org_id=$3, content_yt_link=$4 WHERE vod_content_id=$5',
        [name, category, orgId, ytLink, id]
      );
      console.log('✓ updated', id, '|', name);
    } else {
      // INSERT new with explicit ID
      await sql.query(
        'INSERT INTO vod_content (vod_content_id, vod_content_name, vod_content_category, client_org_id, content_yt_link, thumbnail) VALUES ($1,$2,$3,$4,$5,$6)',
        [id, name, category, orgId, ytLink, thumb]
      );
      console.log('+ inserted', id, '|', name);
    }
  }

  // Update sequence to avoid conflicts
  await sql.query("SELECT setval('vod_content_vod_content_id_seq', (SELECT MAX(vod_content_id) FROM vod_content))");
  console.log('\n✅ Done. Sequence updated.');
}

run().catch(e => { console.error(e.message); process.exit(1); });

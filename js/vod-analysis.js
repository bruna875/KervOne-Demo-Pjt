// vod-analysis.js — VoD Analysis page + shared tx2 helpers

// ── Live Prototype: Metadata Analysis ────────────────────────────────────

function _vodSparklineSvg(data, color, gradId) {
  var W = 120, H = 36;
  var min = Math.min.apply(null, data);
  var max = Math.max.apply(null, data);
  var range = (max - min) || 1;
  var pts = data.map(function(v, i) {
    var x = ((i / (data.length - 1)) * W).toFixed(1);
    var y = (H - 4 - ((v - min) / range) * (H - 8)).toFixed(1);
    return x + ',' + y;
  });
  var ptsStr = pts.join(' ');
  var fx = pts[0].split(',')[0], lx = pts[pts.length - 1].split(',')[0];
  var areaD = 'M' + fx + ',' + H + ' L' + pts.join(' L') + ' L' + lx + ',' + H + ' Z';
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="width:100%;height:' + H + 'px;display:block">'
    + '<defs><linearGradient id="' + gradId + '" x1="0" y1="0" x2="0" y2="1">'
    + '<stop offset="0%" stop-color="' + color + '" stop-opacity=".18"/>'
    + '<stop offset="100%" stop-color="' + color + '" stop-opacity="0"/>'
    + '</linearGradient></defs>'
    + '<path d="' + areaD + '" fill="url(#' + gradId + ')"/>'
    + '<polyline points="' + ptsStr + '" fill="none" stroke="' + color + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg>';
}

function renderMetadataAnalysis() {
  setTimeout(function() {
    csActiveTx2Filter = 'all'; csSelectedTx2Id = null; vodActivePanels = [];
    vodFilterOpen = false; vodActivePublishers = []; vodActiveChannels = []; vodActiveCategories = []; vodActivePeriod = 'all'; vodPublisherSearch = ''; vodChannelSearch = '';
    sdtInjectStyles();
    csTx2Render();
  }, 0);
  var spark1 = _vodSparklineSvg([680,710,695,730,760,745,790,820,810,847], '#e11d8f', 'vsg1');
  var spark2 = _vodSparklineSvg([980,1020,1005,1060,1090,1070,1120,1180,1200,1240], '#0891b2', 'vsg2');
  var scorecards =
    '<div id="vod-scorecards" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">'
    + '<div class="vod-sc-card" style="padding-bottom:0;overflow:hidden">'
    +   '<div style="display:flex;justify-content:space-between;align-items:baseline">'
    +     '<div class="vod-sc-val">847</div>'
    +     '<span style="font-size:10px;font-weight:600;color:#16a34a">↑ 12%</span>'
    +   '</div>'
    +   '<div class="vod-sc-lbl" style="margin-bottom:10px">Content Fully Processed</div>'
    +   spark1
    + '</div>'
    + '<div class="vod-sc-card" style="padding-bottom:0;overflow:hidden">'
    +   '<div style="display:flex;justify-content:space-between;align-items:baseline">'
    +     '<div class="vod-sc-val">1,240h</div>'
    +     '<span style="font-size:10px;font-weight:600;color:#16a34a">↑ 8%</span>'
    +   '</div>'
    +   '<div class="vod-sc-lbl" style="margin-bottom:10px">Total Duration</div>'
    +   spark2
    + '</div>'
    + '<div class="vod-sc-card">'
    +   '<div class="vod-sc-val vod-sc-val--err">3</div>'
    +   '<div class="vod-sc-lbl">Errors</div>'
    + '</div>'
    + '</div>';
  return '<div style="margin-bottom:26px">'
    + '<h1 id="vod-page-title" style="font-size:22px;font-weight:700;letter-spacing:-.5px;color:var(--text);line-height:1.2;margin:0">VoD Analysis</h1>'
    + '<div id="vod-page-sub" style="font-size:13px;color:var(--muted);margin-top:5px">Browse your VoD Inventory</div>'
    + '</div>'
    + scorecards
    + '<div id="sdt-panel-taxonomy2">'
    +   '<div class="cs-card">'
    +     '<div class="cs-toolbar" style="margin-bottom:0;position:relative;gap:8px">'
    +       '<div style="position:relative;flex:1;min-width:0">'
    +         '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--faint);pointer-events:none"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>'
    +         '<input type="text" placeholder="Search content…" style="width:100%;box-sizing:border-box;height:32px;border:1px solid var(--border);border-radius:7px;padding:0 10px 0 30px;font-size:12px;font-family:inherit;color:var(--text);background:#fff;outline:none;transition:border-color .15s" onfocus="this.style.borderColor=\'var(--accent)\'" onblur="this.style.borderColor=\'var(--border)\'">'
    +       '</div>'
    +       '<button id="vod-filter-btn" onclick="vodToggleFilters()" title="Filters" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:7px;background:var(--bg);color:var(--muted);cursor:pointer;transition:all .13s;flex-shrink:0;position:relative;z-index:100">'
    +         '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>'
    +       '</button>'
    +       '<div style="width:1px;height:20px;background:var(--border-md);flex-shrink:0"></div>'
    +       '<div style="display:flex;gap:2px;background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:2px;flex-shrink:0">'
    +         '<button id="cs-view-grid-btn" onclick="csTx2SetView(\'grid\')" title="Grid view" style="width:28px;height:26px;border:none;border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:center;background:var(--surface);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.08);transition:all .12s"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></button>'
    +         '<button id="cs-view-table-btn" onclick="csTx2SetView(\'table\')" title="Table view" style="width:28px;height:26px;border:none;border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;color:var(--muted);transition:all .12s"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>'
    +       '</div>'
    +       '<div id="vod-filter-panel" style="display:none;position:absolute;top:calc(100% + 8px);right:72px;z-index:99;width:240px;background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,.13);overflow:hidden"></div>'
    +     '</div>'
    +     '<div id="vod-chips-row" style="display:none;flex-wrap:wrap;align-items:center;gap:6px;margin-top:10px"></div>'
    +     '<div style="margin-top:16px"><div id="cs-grid5"></div></div>'
    +   '</div>'
    + '</div>';
}

// ── Content Selection data ────────────────────────────────────────────────
var VOD_YT_MAP = {
  'Parks and Recreation':    'https://www.youtube.com/embed/IpUe0ElcTAk?autoplay=1&mute=1',
  'Yellowstone':             'https://www.youtube.com/embed/9slKldYnqeM?autoplay=1&mute=1',
  'Below Deck':              'https://www.youtube.com/embed/xeBxDAJ43lc?autoplay=1&mute=1',
  'Everybody Loves Raymond': 'https://www.youtube.com/embed/pkrO-IYDosw?autoplay=1&mute=1',
  'ted':                     'https://www.youtube.com/embed/W4-M3NsJB7E?autoplay=1&mute=1',
  'Wolf Like Me':            'https://www.youtube.com/embed/nVWBbJ9B3xg?autoplay=1&mute=1',
  'A.P. Bio':                'https://www.youtube.com/embed/FnLH0PqB8xY?autoplay=1&mute=1',
  'Below Deck Mediterranean':'https://www.youtube.com/embed/TEOzit_nXmA?autoplay=1&mute=1',
  'Suits':                   'https://www.youtube.com/embed/SOLnxyYg8-I?autoplay=1&mute=1',
  'The Office':              'https://www.youtube.com/embed/CZZrFC2MFAw?autoplay=1&mute=1',
};

var CS_SHOWS = [
  { id:1,  title:'Parks and Recreation',     episode:'S04 · E11', publisher:'NBCUniversal',   category:'comedy',      grad:'linear-gradient(145deg,#D4820A,#A05E08)', initials:'PR', analysed: true  },
  { id:2,  title:'Yellowstone',              episode:'S05 · E08', publisher:'Paramount AUS',  category:'drama',       grad:'linear-gradient(145deg,#4A3820,#2E2210)', initials:'YS', analysed: true  },
  { id:3,  title:'Below Deck',              episode:'S11 · E03', publisher:'Peacock',         category:'reality',     grad:'linear-gradient(145deg,#1A6FC4,#0D4A8A)', initials:'BD', analysed: true  },
  { id:4,  title:'Everybody Loves Raymond', episode:'S07 · E02', publisher:'CBS',             category:'comedy',      grad:'linear-gradient(145deg,#C44B1A,#8A2E0D)', initials:'EL', analysed: true  },
  { id:5,  title:'ted',                     episode:'S01 · E06', publisher:'Peacock',         category:'comedy',      grad:'linear-gradient(145deg,#2E8B57,#1A5C38)', initials:'te', analysed: true  },
  { id:6,  title:'Wolf Like Me',            episode:'S02 · E04', publisher:'Peacock',         category:'drama',       grad:'linear-gradient(145deg,#5A3080,#3A1A5A)', initials:'WL', analysed: true  },
  { id:7,  title:'A.P. Bio',               episode:'S04 · E08', publisher:'Peacock',         category:'comedy',      grad:'linear-gradient(145deg,#1A6FC4,#0D4080)', initials:'AP', analysed: true  },
  { id:8,  title:'Below Deck Mediterranean',episode:'S09 · E01', publisher:'Peacock',         category:'reality',     grad:'linear-gradient(145deg,#1A6FC4,#0D4A8A)', initials:'BM', analysed: true  },
  { id:9,  title:'Suits',                   episode:'S06 · E10', publisher:'Paramount AUS',   category:'drama',       grad:'linear-gradient(145deg,#4A5568,#2D3748)', initials:'SU', analysed: true  },
  { id:10, title:'The Office',              episode:'S03 · E15', publisher:'NBCUniversal',    category:'comedy',      grad:'linear-gradient(145deg,#1A6FC4,#0D4080)', initials:'TO', analysed: true  },
  { id:11, title:'Yellowstone',             episode:'S04 · E02', publisher:'Paramount AUS',   category:'drama',       grad:'linear-gradient(145deg,#4A3820,#2E2210)', initials:'YS', analysed: true  },
  { id:12, title:'Parks and Recreation',    episode:'S06 · E03', publisher:'NBCUniversal',    category:'comedy',      grad:'linear-gradient(145deg,#D4820A,#A05E08)', initials:'PR', analysed: true  },
  { id:13, title:'The Real Housewives',     episode:'S14 · E07', publisher:'Bravo',            category:'reality',     grad:'linear-gradient(145deg,#B8860B,#7A5B08)', initials:'RH', analysed: true  },
  { id:14, title:'Law & Order SVU',         episode:'S25 · E04', publisher:'NBCUniversal',    category:'drama',       grad:'linear-gradient(145deg,#2C3E50,#1A2530)', initials:'LO', analysed: true  },
  { id:15, title:'Succession',              episode:'S03 · E06', publisher:'HBO',              category:'drama',       grad:'linear-gradient(145deg,#1C1C1C,#0A0A0A)', initials:'SC', analysed: true  },
  { id:16, title:'The Bear',               episode:'S02 · E05', publisher:'FX',               category:'drama',       grad:'linear-gradient(145deg,#7B3F00,#4A2500)', initials:'TB', analysed: false },
  { id:17, title:'Abbott Elementary',      episode:'S03 · E09', publisher:'ABC',              category:'comedy',      grad:'linear-gradient(145deg,#E8B84B,#C49428)', initials:'AE', analysed: false },
  { id:18, title:'Survivor',               episode:'S46 · E11', publisher:'CBS',              category:'reality',     grad:'linear-gradient(145deg,#2E7D32,#1B5E20)', initials:'SV', analysed: false },
  { id:19, title:'The Crown',              episode:'S06 · E02', publisher:'Netflix',           category:'drama',       grad:'linear-gradient(145deg,#4A0080,#2D004D)', initials:'TC', analysed: false },
  { id:20, title:'Seinfeld',               episode:'S08 · E12', publisher:'NBCUniversal',     category:'comedy',      grad:'linear-gradient(145deg,#1565C0,#0D3B7A)', initials:'SE', analysed: false },
  { id:21, title:'Below Deck',             episode:'S10 · E07', publisher:'Peacock',          category:'reality',     grad:'linear-gradient(145deg,#1A6FC4,#0D4A8A)', initials:'BD', analysed: false },
  { id:22, title:'The Office',             episode:'S05 · E08', publisher:'NBCUniversal',     category:'comedy',      grad:'linear-gradient(145deg,#1A6FC4,#0D4080)', initials:'TO', analysed: false },
  { id:23, title:'Suits',                  episode:'S07 · E03', publisher:'Paramount AUS',    category:'drama',       grad:'linear-gradient(145deg,#4A5568,#2D3748)', initials:'SU', analysed: false },
  { id:24, title:'Breaking Bad',           episode:'S04 · E11', publisher:'AMC',              category:'drama',       grad:'linear-gradient(145deg,#1B5E20,#0A2E0F)', initials:'BB', analysed: false },
  { id:25, title:'The Amazing Race',       episode:'S35 · E06', publisher:'CBS',              category:'reality',     grad:'linear-gradient(145deg,#E53935,#B71C1C)', initials:'AR', analysed: false },
  { id:26, title:'Modern Family',          episode:'S09 · E14', publisher:'ABC',              category:'comedy',      grad:'linear-gradient(145deg,#0288D1,#01579B)', initials:'MF', analysed: false },
  { id:27, title:'Grey\'s Anatomy',        episode:'S20 · E05', publisher:'ABC',              category:'drama',       grad:'linear-gradient(145deg,#6A1B9A,#4A1272)', initials:'GA', analysed: false },
  { id:28, title:'The Voice',              episode:'S25 · E08', publisher:'NBCUniversal',     category:'reality',     grad:'linear-gradient(145deg,#E91E63,#AD1457)', initials:'TV', analysed: false },
  { id:29, title:'Yellowstone',            episode:'S03 · E09', publisher:'Paramount AUS',    category:'drama',       grad:'linear-gradient(145deg,#4A3820,#2E2210)', initials:'YS', analysed: false },
  { id:30, title:'Friends',               episode:'S08 · E17', publisher:'HBO Max',           category:'comedy',      grad:'linear-gradient(145deg,#FF6B35,#CC4400)', initials:'FR', analysed: false },
  { id:31, title:'The Kardashians',        episode:'S05 · E02', publisher:'Hulu',             category:'reality',     grad:'linear-gradient(145deg,#9C27B0,#6A0080)', initials:'KD', analysed: false },
  { id:32, title:'House of the Dragon',    episode:'S02 · E06', publisher:'HBO',              category:'drama',       grad:'linear-gradient(145deg,#B71C1C,#7F0000)', initials:'HD', analysed: false },
  { id:33, title:'Parks and Recreation',   episode:'S03 · E07', publisher:'NBCUniversal',     category:'comedy',      grad:'linear-gradient(145deg,#D4820A,#A05E08)', initials:'PR', analysed: false },
  { id:34, title:'Top Chef',              episode:'S21 · E04', publisher:'Peacock',           category:'reality',     grad:'linear-gradient(145deg,#C62828,#8E1919)', initials:'TC', analysed: false },
  { id:35, title:'Frasier',              episode:'S02 · E03', publisher:'Paramount+',         category:'comedy',      grad:'linear-gradient(145deg,#37474F,#1C262B)', initials:'FS', analysed: false },
  { id:36, title:'A.P. Bio',            episode:'S03 · E05', publisher:'Peacock',             category:'comedy',      grad:'linear-gradient(145deg,#1A6FC4,#0D4080)', initials:'AP', analysed: false },
  { id:37, title:'The Real Housewives',  episode:'S12 · E09', publisher:'Bravo',              category:'reality',     grad:'linear-gradient(145deg,#B8860B,#7A5B08)', initials:'RH', analysed: false },
  { id:38, title:'It\'s Always Sunny',   episode:'S16 · E07', publisher:'FX',                category:'comedy',      grad:'linear-gradient(145deg,#F57C00,#E65100)', initials:'AS', analysed: false },
  { id:39, title:'Tulsa King',           episode:'S02 · E04', publisher:'Paramount+',         category:'drama',       grad:'linear-gradient(145deg,#3E2723,#1A0E0A)', initials:'TK', analysed: false },
  { id:40, title:'The Amazing Race',     episode:'S34 · E10', publisher:'CBS',               category:'reality',     grad:'linear-gradient(145deg,#E53935,#B71C1C)', initials:'AR', analysed: false },
];

// ── Request New Content Modal — 3-step (Taxonomy Explorer v1) ────────────
// NOTE: This modal includes the Enable Features block (4 checkboxes) in step 1.

function csOpenModalTaxonomy() {
  if (document.getElementById('cs-modal')) return;
  csCurrentStep = 1;
  var modal = document.createElement('div');
  modal.id = 'cs-modal';
  modal.className = 'cs-modal-overlay';
  modal.innerHTML =
    '<div class="cs-modal" onclick="event.stopPropagation()">'

    // Header
    + '<div class="cs-modal-header">'
    +   '<div><div class="cs-modal-title">Request New Content</div>'
    +   '<div class="cs-modal-sub">Fill in the details below to submit your request</div></div>'
    +   '<button class="cs-modal-close" onclick="csCloseModal()">'
    +     '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +   '</button>'
    + '</div>'

    // Stepper
    + '<div class="cs-stepper">'
    +   '<div class="cs-step cs-step--act" id="cs-step-ind-1"><div class="cs-step-circle"><span>1</span></div><div class="cs-step-label">Content</div></div>'
    +   '<div class="cs-step-line"></div>'
    +   '<div class="cs-step" id="cs-step-ind-2"><div class="cs-step-circle"><span>2</span></div><div class="cs-step-label">Processing</div></div>'
    +   '<div class="cs-step-line"></div>'
    +   '<div class="cs-step" id="cs-step-ind-3"><div class="cs-step-circle"><span>3</span></div><div class="cs-step-label">Add Ads (optional)</div></div>'
    + '</div>'

    // ── Step 1 body ──
    + '<div class="cs-modal-body" id="cs-step-body-1">'

    +   '<div class="cs-field"><div class="cs-field-row"><label class="cs-label">Requestor</label><span class="cs-field-note">Comes from the account</span></div>'
    +   '<input class="cs-input cs-input--disabled" type="text" value="Marika Roque" disabled></div>'

    +   '<div class="cs-field"><label class="cs-label">Client Name</label>'
    +   '<input class="cs-input" type="text" placeholder="e.g. Nike, Unilever…"></div>'

    +   '<div class="cs-field"><label class="cs-label">Content Name</label>'
    +   '<input class="cs-input" id="cs-rt-content-name" type="text" placeholder="e.g. Below Deck S5E3…"></div>'


    +   '<div class="cs-field">'
    +     '<label class="cs-label">Enable Features</label>'
    +     '<div class="cs-features-grid">'
    +       '<label class="cs-feature-item"><input type="checkbox" class="cs-feature-cb"><span>Metadata analysis</span></label>'
    +       '<label class="cs-feature-item"><input type="checkbox" class="cs-feature-cb"><span>Moments analysis</span></label>'
    +       '<label class="cs-feature-item"><input type="checkbox" class="cs-feature-cb"><span>Taxonomy analysis</span></label>'
    +       '<label class="cs-feature-item"><input type="checkbox" class="cs-feature-cb"><span>Show / episodes analysis</span></label>'
    +     '</div>'
    +   '</div>'

    +   '<div class="cs-field">'
    +     '<div class="cs-field-row"><label class="cs-label">Content Upload <span class="cs-mandatory">*</span></label></div>'
    +     '<div class="cs-ads-toggle" style="margin-bottom:8px">'
    +       '<div class="cs-ads-btn cs-ads-btn--act" id="cs-content-upload-btn" onclick="csContentTab(\'upload\')">Upload</div>'
    +       '<div class="cs-ads-btn" id="cs-content-link-btn" onclick="csContentTab(\'link\')">Link</div>'
    +     '</div>'
    +     '<div id="cs-content-upload">'
    +       '<div class="cs-upload-area" id="cs-upload-label" onclick="csFakeUpload()">'
    +         '<div id="cs-upload-idle" style="display:flex;flex-direction:column;align-items:center;gap:6px">'
    +           '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="color:var(--muted)"><path d="M12 16V8m0 0-3 3m3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.5"/></svg>'
    +           '<div class="cs-upload-text">Click to upload a video file</div>'
    +           '<div class="cs-upload-hint">MP4, MOV, AVI, MKV…</div>'
    +         '</div>'
    +         '<div id="cs-upload-chosen" style="display:none;align-items:center;gap:8px;justify-content:center">'
    +           '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="color:#2EAD4B;flex-shrink:0"><path d="M4 10l4 4 8-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +           '<span id="cs-upload-filename" class="cs-upload-text" style="color:var(--text)"></span>'
    +           '<span class="cs-upload-hint" id="cs-upload-filesize"></span>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div id="cs-content-link" style="display:none">'
    +       '<input class="cs-input" id="cs-link-input" type="url" placeholder="https://…" style="width:100%;box-sizing:border-box">'
    +     '</div>'
    +   '</div>'

    + '</div>'

    // ── Step 2 body — Processing ──
    + '<div class="cs-modal-body" id="cs-step-body-2" style="display:none;gap:16px">'

    +   '<div class="cs-proc-preview">'
    +     '<div class="cs-proc-thumb">'
    +       '<div class="cs-proc-thumb-inner">'
    +         '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" style="color:rgba(255,255,255,.55)"><rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="1.3"/><path d="M9 8.5l6 3.5-6 3.5V8.5z" fill="currentColor"/><path d="M2 8h2M20 8h2M2 16h2M20 16h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
    +       '</div>'
    +     '</div>'
    +     '<div class="cs-proc-meta">'
    +       '<div style="display:flex;align-items:center;gap:6px">'
    +         '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" style="color:var(--muted);flex-shrink:0"><rect x="2" y="1" width="9" height="14" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M5 6h4M5 9h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M11 1v4h4" stroke="currentColor" stroke-width="1.2"/><path d="M11 1l4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +         '<span class="cs-proc-fname">sample_ad_creative.mp4</span>'
    +       '</div>'
    +       '<span class="cs-proc-fsize">47.3 MB &nbsp;·&nbsp; MP4 &nbsp;·&nbsp; HD 1080p</span>'
    +     '</div>'
    +   '</div>'

    +   '<div class="cs-proc-bar-section">'
    +     '<div class="cs-proc-bar-header">'
    +       '<span class="cs-proc-status-label" id="cs-proc-status-text">Preparing analysis…</span>'
    +       '<span class="cs-proc-pct-badge" id="cs-proc-pct">0%</span>'
    +     '</div>'
    +     '<div class="cs-proc-bar-track"><div class="cs-proc-bar-fill" id="cs-proc-bar" style="width:0%"></div></div>'
    +   '</div>'

    +   '<div class="cs-proc-log" id="cs-proc-log"></div>'

    +   '<div id="cs-proc-success" style="display:none">'
    +     '<div class="cs-proc-success-box">'
    +       '<svg width="20" height="20" viewBox="0 0 34 34" fill="none" style="flex-shrink:0"><circle cx="17" cy="17" r="16" fill="rgba(46,173,75,.12)" stroke="#2EAD4B" stroke-width="1.5"/><path d="M10 17l5 5 9-9" stroke="#2EAD4B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       '<div>'
    +         '<div class="cs-proc-success-title">Analysis Complete</div>'
    +         '<div class="cs-proc-success-sub">Content processed. Taxonomy signals extracted and catalogued.</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'

    + '</div>'

    // ── Step 3 body — Add Ads ──
    + '<div class="cs-modal-body" id="cs-step-body-3" style="display:none">'
    +   csStep3Html()
    + '</div>'

    // Footer
    + '<div class="cs-modal-footer">'
    +   '<button class="cs-btn-secondary" id="cs-modal-back-btn" style="display:none;margin-right:auto" onclick="csPrevStep()">← Back</button>'
    +   ''
    +   '<button class="cs-btn-primary" id="cs-modal-next-btn" onclick="csNextStep()">Next</button>'
    + '</div>'

    + '</div>';

  modal.addEventListener('click', csCloseModal);
  document.body.appendChild(modal);
  // Hide Enable Features on Metadata Analysis page
  if (typeof activeId !== 'undefined' && activeId === 'metadata-analysis') {
    var featField = modal.querySelector('.cs-features-grid');
    if (featField && featField.parentElement) featField.parentElement.style.display = 'none';
  }
  setTimeout(function() { modal.classList.add('cs-modal-overlay--in'); }, 10);
}

// ── Process Flow ──────────────────────────────────────────────────────────
var WF_ACTORS = {
  sales:   { label:'Sales',         color:'#ED005E', bg:'rgba(237,0,94,.1)'   },
  product: { label:'Product / Tech', color:'#4F6CF7', bg:'rgba(79,108,247,.1)' },
  xts:     { label:'XTS',           color:'#0D9488', bg:'rgba(13,148,136,.1)' },
  auto:    { label:'Automated',     color:'#8B5CF6', bg:'rgba(139,92,246,.1)' },
};

var WF_STEPS = [
  {
    actors: ['sales'],
    title:  'New Content Request',
    desc:   'Sales Team (Marika, Ryan, etc.) requests new content via the Dashboard by compiling the Modal Form.'
  },
  {
    actors: ['auto'],
    title:  'Automated Notification',
    desc:   'The request is submitted to the Product Team via automated Jira Ticket + Email.'
  },
  {
    actors: ['product'],
    title:  'Data Package Production',
    desc:   'Product Team (Bruna + Grant + Ben) produces the Data Package: Original Content + JSONs; Ads Creation + JSONs.'
  },
  {
    actors: ['product'],
    title:  'Google Drive Storage',
    desc:   'The Data Package is stored on the Google Drive folder following the defined naming path / structure.'
  },
  {
    actors: ['product'],
    title:  'Delivery to XTS',
    desc:   'The Data Package is delivered to XTS.'
  },
  {
    actors: ['product','xts'],
    title:  'Upload Planning',
    desc:   'The upload is planned in a hybrid SCRUM / Kanban way, prioritised against ongoing development work and desired delivery date.'
  },
  {
    actors: ['product','sales'],
    title:  'SLA Returned',
    desc:   'An SLA is returned to the Sales Team.'
  },
  {
    actors: ['product','xts','sales'],
    title:  'Deploy & Notification',
    desc:   'New Data Package is deployed and the Sales Team is notified by Product.'
  },
];

function csBackToGrid() {
  var panelKey = csDetailViewPanel;
  if (panelKey === 'manual') {
    var panel = document.getElementById('sdt-panel-manual');
    if (!panel) return;
    panel.innerHTML =
      '<div class="cs-toggle-sticky"><div class="cs-view-toggle">'
      + '<div class="cs-view-btn cs-view-btn--act" id="cs-vbtn-mockup" onclick="csView(\'mockup\')">Mockup</div>'
      + '<div class="cs-view-btn" id="cs-vbtn-process" onclick="csView(\'process\')">Process</div>'
      + '</div></div>'
      + '<div id="cs-view-mockup">'
      + '<div class="cs-card"><div class="cs-title">Content Selection</div>'
      + '<div class="cs-toolbar"><div class="cs-filter-wrap"><div class="cs-filter-label">Category</div>'
      + '<select class="cs-filter-select" onchange="csFilter(this.value)">'
      + '<option value="all">All</option><option value="comedy">Comedy</option>'
      + '<option value="drama">Drama</option><option value="reality">Reality</option>'
      + '<option value="documentary">Documentary</option></select></div>'
      + '<button class="cs-request-btn" onclick="csOpenModal()">'
      + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
      + ' Request New Content</button></div>'
      + '<div class="cs-grid" id="cs-grid"></div></div></div>'
      + '<div id="cs-view-process" style="display:none"><div id="cs-process-container"></div></div>';
    csRender();
    csRenderProcess();
  } else if (panelKey === 'taxonomy2') {
    if (typeof activeId !== 'undefined' && activeId === 'vod-analysis') {
      // VoD Analysis page: re-render the whole page cleanly
      if (typeof setPage === 'function') setPage('vod-analysis', 'VoD Analysis', true);
    } else {
      // Dashboard shell stays — restore content area to "Metadata Analysis" tab
      csTx2NavTab('metadata');
    }
  } else {
    csBackToGrid3();
  }
}

// ── Detail view (NEW item) ────────────────────────────────────────────────

var csDetailPanels3 = { tax: true, prod: true, json: true };
var csDetailViewPanel = 'realtime'; // tracks which panel is currently showing the detail view

var CS_DETAIL_SCENES = [
  { scene: 2,  tax: 'IAB Taxonomy', badge: 'Real Estate Buying and Selling (0.80)', extra: 'Music Emotion:', extra2: 'Dreamy (0.95)' },
  { scene: 5,  tax: 'IAB Taxonomy', badge: 'Real Estate (0.85)',                   extra: 'Considered: Travel<br>Music Emotion:', extra2: 'Dreamy (0.99)' },
  { scene: 7,  tax: 'IAB Taxonomy', badge: 'Remodeling &amp; Construction (0.78)',  extra: 'Music Emotion:', extra2: 'Energizing, pump-up (0.90)' },
  { scene: 8,  tax: 'IAB Taxonomy', badge: 'Home &amp; Garden (0.82)',              extra: 'Music Emotion:', extra2: 'Happy (0.88)' },
  { scene: 11, tax: 'IAB Taxonomy', badge: 'DIY &amp; Home Improvement (0.91)',     extra: 'Music Emotion:', extra2: 'Motivating (0.92)' },
];

var CS_DETAIL_PRODUCTS = [
  { name: '8 ft. Fiberglass Step Ladder (12 ft. Reach Height) with 250 lb. Load Capacity Type I Duty Rating', detected: 'Ladder (90% confidence)', price: '$169.00', scene: 'Scene 7 – 00:30', emoji: '🪜' },
  { name: 'Adjustable Electricians Work Waist Tool Belt',                                                      detected: 'Belt (80% confidence)',   price: '$114.00', scene: 'Scene 7 – 00:30', emoji: '🔧' },
  { name: '5 ft. Yellow Fiberglass Step Ladder with 375 lb. Load Capacity Type IAA Duty Rating',               detected: 'Ladder (90% confidence)', price: '$89.00',  scene: 'Scene 9 – 01:14', emoji: '🪜' },
  { name: 'Professional 25 ft. Power Drill Driver Kit with Carrying Case',                                     detected: 'Tool (75% confidence)',    price: '$234.00', scene: 'Scene 11 – 02:03', emoji: '🔩' },
];

var CS_DETAIL_JSON = `{
  "video_id": "DHYH1_111H_RIDO111H_CL",
  "duration_in_seconds": 2655.061333,
  "aspect_ratio": "16:9",
  "video_metadata": {
    "garm_category": [
      {
        "id": "G7",
        "name": "Obscenity & Profanity",
        "risk_level": "Medium",
        "confidence": 0.85,
        "count": 1,
        "screen_time": 4.796,
        "screen_time_percentage": 0.0
      },
      {
        "id": "G14",
        "name": "Violence",
        "risk_level": "Medium",
        "confidence": 0.8,
        "count": 1,
        "screen_time": 1.668,
        "screen_time_percentage": 0.0
      }
    ],
    "iab_category": [
      { "id": "IAB1", "name": "Arts & Entertainment", "confidence": 0.92 },
      { "id": "IAB10", "name": "Home & Garden",        "confidence": 0.88 }
    ]
  }
}`;

function csShowDetailView(panelKey, item) {
  // For taxonomy2 the dashboard shell (topbar + sidebar) stays put;
  // we only swap out the content area.
  var isTax2 = panelKey === 'taxonomy2';

  var panelId = panelKey === 'manual'   ? 'sdt-panel-manual'
              : panelKey === 'taxonomy2' ? 'sdt-panel-taxonomy2'
              : 'sdt-panel-realtime';
  var panel = document.getElementById(panelId);
  if (!panel) return;

  // For taxonomy2 target only the inner content area
  var renderTarget = isTax2
    ? (document.getElementById('tx2-content-area') || panel)
    : panel;

  csDetailViewPanel = panelKey;
  csDetailPanels3 = { tax: true, prod: true, json: true };

  var txTabNav  = '';
  var metaOpen  = '';
  var metaClose = '';

  var TH = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)';
  var thumbSeed = 'kervshow' + (item ? (item.id || 1) : 1);

  // Build the shared detail view card HTML
  var detailCard =
    // ── Mockup / Process toggle — hidden for taxonomy2 ──
    (isTax2 ? '' :
      '<div class="cs-toggle-sticky">'
      + '<div class="cs-view-toggle">'
      +   '<div class="cs-view-btn cs-view-btn--act" id="cs-dv-vbtn-mockup" onclick="csDvToggleView(\'mockup\')">Mockup</div>'
      +   '<div class="cs-view-btn" id="cs-dv-vbtn-process" onclick="csDvToggleView(\'process\')">Process</div>'
      + '</div>'
      + '</div>'
    )

    // ── Mockup view wrapper (tax/tax2: no wrapper; others: wrapped for toggle) ──
    + (isTax2 ? '' : '<div id="cs-dv-view-mockup">')
    // tax2: plain div — no card border/padding (dashboard shell already provides the container)
    // others: full cs-card with border, bg and padding
    + (isTax2
        ? '<div style="display:flex;flex-direction:column;gap:14px">'
        : '<div class="cs-card" style="display:flex;flex-direction:column;gap:14px">'
      )

    // Top bar
    + '<div class="cs-dv-topbar">'
    +   '<button class="cs-dv-back" onclick="csBackToGrid()">'
    +     '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +     ' BACK TO CONTENT SELECTION'
    +   '</button>'
    +   '<span class="cs-dv-title" id="cs-dv-title">VOD: EXACT PRODUCT MATCH – SYNC L BAR</span>'
    +   '<button class="cs-dv-collapse">'
    +     '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 6l5-4 5 4M3 10l5 4 5-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +   '</button>'
    + '</div>'

    // Tab nav (taxonomy only)
    + txTabNav

    // Open metadata content wrapper (taxonomy only)
    + metaOpen

    // Settings row
    + '<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end">'
    +   '<div class="cs-field"><label class="cs-label">Tier Selection</label>'
    +     '<select class="cs-dv-select" onchange="csDvUpdateTitle()" id="cs-dv-tier" style="min-width:170px">'
    +       '<option>Exact Product Match</option><option>Contextual Match</option><option>Audience Match</option>'
    +     '</select></div>'
    +   '<div class="cs-field"><label class="cs-label">Ad Playback Mode</label>'
    +     '<select class="cs-dv-select" onchange="csDvUpdateTitle()" id="cs-dv-mode" style="min-width:150px">'
    +       '<option>Sync L Bar</option><option>Pre-roll</option><option>Mid-roll</option><option>Overlay</option>'
    +     '</select></div>'
    + '</div>'

    // Main block — height fills viewport
    + '<div style="display:flex;border:1px solid var(--border);border-radius:8px;overflow:hidden;height:calc(100vh - ' + (isTax2 ? '320' : '380') + 'px);min-height:240px">'

    //   Video column: white bg, 16:9 photo at top (narrower in tax2 to fit without scroll)
    +   '<div style="width:' + (isTax2 ? '180' : '220') + 'px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column">'
    //     16:9 box with real photo + overlay
    +     '<div style="width:100%;position:relative;padding-top:56.25%;overflow:hidden;flex-shrink:0">'
    +       '<img src="https://picsum.photos/seed/homeremodel/440/248" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block" alt="">'
    //       dark gradient overlay (bottom) + play button
    +       '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.55) 0%,transparent 50%)">'
    +         '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">'
    +           '<div style="width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.35);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center">'
    +             '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" style="color:#fff;margin-left:2px"><path d="M4 3l9 5-9 5V3z" fill="currentColor"/></svg>'
    +           '</div>'
    +         '</div>'
    +         '<div style="position:absolute;bottom:0;left:0;right:0;display:flex;align-items:center;gap:5px;padding:5px 7px">'
    +           '<svg width="10" height="10" viewBox="0 0 16 16" fill="none" style="color:rgba(255,255,255,.85);flex-shrink:0"><path d="M4 3l9 5-9 5V3z" fill="currentColor"/></svg>'
    +           '<span style="font-size:9px;color:rgba(255,255,255,.7)">0:00</span>'
    +           '<div style="flex:1;height:2px;background:rgba(255,255,255,.25);border-radius:1px"><div style="width:1%;height:100%;background:var(--accent);border-radius:1px"></div></div>'
    +           '<span style="font-size:9px;color:rgba(255,255,255,.7)">44:15</span>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'

    //   Panels
    +   '<div style="display:flex;flex:1;overflow-x:auto;overflow-y:hidden" id="cs-dv-panels">'
    +     csDvTaxPanel() + csDvProdPanel() + csDvJsonPanel()
    +   '</div>'

    + '</div>'

    // Panel toggle bar (icons only)
    + '<div style="display:flex;justify-content:center;gap:6px">'
    +   '<button class="cs-dv-tog cs-dv-tog--act" id="cs-dvtog-tax"  onclick="csDvToggle(\'tax\')">'
    +     '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="13" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/></svg>'
    +   '</button>'
    +   '<button class="cs-dv-tog cs-dv-tog--act" id="cs-dvtog-prod" onclick="csDvToggle(\'prod\')">'
    +     '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 3h2l2 7h6l2-5H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="13" r="1" fill="currentColor"/><circle cx="12" cy="13" r="1" fill="currentColor"/></svg>'
    +   '</button>'
    +   '<button class="cs-dv-tog cs-dv-tog--act" id="cs-dvtog-json" onclick="csDvToggle(\'json\')">'
    +     '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4 5c-1 0-2 .5-2 1.5v1c0 .8-.5 1.5-.5 1.5s.5.7.5 1.5v1C2 12.5 3 13 4 13M12 5c1 0 2 .5 2 1.5v1c0 .8.5 1.5.5 1.5s-.5.7-.5 1.5v1C14 12.5 13 13 12 13M9 4l-2 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
    +   '</button>'
    + '</div>'

    + '</div>' // close cs-card
    + (isTax2 ? '' : '</div>') // close cs-dv-view-mockup

    // ── Process view — not shown for taxonomy2 ──
    + (isTax2 ? '' :
        '<div id="cs-dv-view-process" style="display:none">'
        + '<div id="cs-process-container3"></div>'
        + '</div>'
      );

  // Inject into the correct target
  renderTarget.innerHTML = detailCard;

  // Metadata Analysis page: update breadcrumb
  if (typeof activeId !== 'undefined' && activeId === 'metadata-analysis') {
    var pgname = document.getElementById('content-bc');
    if (pgname) pgname.innerHTML =
      '<span style="font-weight:400;opacity:.55;cursor:pointer" onclick="csBackToGrid()">Metadata Analysis</span>'
      + ' &nbsp;/&nbsp; ' + (item ? item.title : '');
  }

  if (!isTax2) csRenderProcess3();
  // Ensure taxonomy-explorer styles are available when viewing tab 4/5 detail
  if ((panelKey === 'taxonomy' || panelKey === 'taxonomy2') && typeof txInjectStyles === 'function') txInjectStyles();
}

function csDvToggleView(view) {
  ['mockup', 'process'].forEach(function(v) {
    var btn = document.getElementById('cs-dv-vbtn-' + v);
    var pnl = document.getElementById('cs-dv-view-' + v);
    if (btn) btn.className = 'cs-view-btn' + (v === view ? ' cs-view-btn--act' : '');
    if (pnl) pnl.style.display = v === view ? '' : 'none';
  });
}

function csDvTab(tab) {
  ['metadata', 'moments', 'taxonomies', 'episodes'].forEach(function(t) {
    var btn = document.getElementById('cs-dv-tab-' + t);
    if (btn) btn.className = 'cs-dv-tab' + (t === tab ? ' cs-dv-tab--act' : '');
  });

  // Metadata tab: show metadata panel, hide the sidebar+tabs wrapper
  var metaPanel = document.getElementById('cs-dv-tab-content-metadata');
  var wrap      = document.getElementById('cs-dv-tax-content-wrap');
  if (tab === 'metadata') {
    if (metaPanel) metaPanel.style.display = '';
    if (wrap)      wrap.style.display = 'none';
  } else {
    if (metaPanel) metaPanel.style.display = 'none';
    if (wrap)      wrap.style.display = 'flex';
    // Switch the inner panels
    ['moments', 'taxonomies', 'episodes'].forEach(function(t) {
      var content = document.getElementById('cs-dv-tab-content-' + t);
      if (content) content.style.display = t === tab ? '' : 'none';
    });
  }

  if (tab === 'moments')    { txCustomSelections = []; txRenderCategories(); }
  if (tab === 'taxonomies') { txCustomActiveTab = 'emotion'; txCustomCurrentPage = 1; txCustomRenderTable(); txRenderChips(); }
  if (tab === 'episodes')   txRenderEpisodes();
}

function csDvUpdateTitle() {
  var tier = document.getElementById('cs-dv-tier');
  var mode = document.getElementById('cs-dv-mode');
  var el   = document.getElementById('cs-dv-title');
  if (el && tier && mode) el.textContent = 'VOD: ' + tier.value.toUpperCase() + ' – ' + mode.value.toUpperCase();
}

function csDvTaxPanel() {
  return '<div class="cs-dv-panel" id="cs-dv-panel-tax">'
    + '<div class="cs-dv-panel-hd">'
    +   '<div style="display:flex;align-items:center;gap:7px"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="13" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/></svg><span>Taxonomies</span></div>'
    +   '<div style="display:flex;gap:4px"><button class="cs-dv-panel-ico" title="Expand">⤢</button><button class="cs-dv-panel-ico cs-dv-panel-ico--red" onclick="csDvToggle(\'tax\')" title="Close">✕</button></div>'
    + '</div>'
    + '<div class="cs-dv-panel-sub">'
    +   '<select class="cs-dv-select" style="width:100%"><option>IAB Taxonomy</option><option>Brand Safety</option><option>Custom Moments</option></select>'
    + '</div>'
    + '<div class="cs-dv-panel-body">'
    + CS_DETAIL_SCENES.map(function(sc) {
        return '<div class="cs-dv-scene">'
          + '<div class="cs-dv-scene-num">Scene ' + sc.scene + '</div>'
          + '<div class="cs-dv-scene-tax">' + sc.tax + '</div>'
          + '<div class="cs-dv-scene-badge">' + sc.badge + '</div>'
          + '<div class="cs-dv-scene-meta">' + sc.extra + '</div>'
          + '<div class="cs-dv-scene-meta cs-dv-scene-meta--val">' + sc.extra2 + '</div>'
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>';
}

function csDvProdPanel() {
  return '<div class="cs-dv-panel" id="cs-dv-panel-prod">'
    + '<div class="cs-dv-panel-hd">'
    +   '<div style="display:flex;align-items:center;gap:7px"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 3h2l2 7h6l2-5H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="13" r="1" fill="currentColor"/><circle cx="12" cy="13" r="1" fill="currentColor"/></svg><span>Products</span></div>'
    +   '<div style="display:flex;gap:4px"><button class="cs-dv-panel-ico" title="Expand">⤢</button><button class="cs-dv-panel-ico cs-dv-panel-ico--red" onclick="csDvToggle(\'prod\')" title="Close">✕</button></div>'
    + '</div>'
    + '<div class="cs-dv-panel-body" style="padding-top:4px">'
    + CS_DETAIL_PRODUCTS.map(function(p) {
        return '<div class="cs-dv-product">'
          + '<div class="cs-dv-prod-img">' + p.emoji + '</div>'
          + '<div class="cs-dv-prod-info">'
          +   '<div class="cs-dv-prod-name">' + p.name + '</div>'
          +   '<div class="cs-dv-prod-det">Detected: ' + p.detected + '</div>'
          +   '<div class="cs-dv-prod-price">' + p.price + '</div>'
          +   '<div class="cs-dv-prod-scene">' + p.scene + '</div>'
          + '</div>'
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>';
}

function csDvJsonPanel() {
  var html = CS_DETAIL_JSON
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span class="cs-dv-json-key">"$1"</span>:')
    .replace(/:\s*"([^"]+)"/g, ': <span class="cs-dv-json-str">"$1"</span>')
    .replace(/:\s*(\d[\d.]*)/g, ': <span class="cs-dv-json-num">$1</span>');

  return '<div class="cs-dv-panel cs-dv-panel--dark cs-dv-panel--last" id="cs-dv-panel-json">'
    + '<div class="cs-dv-panel-hd cs-dv-panel-hd--dark">'
    +   '<div style="display:flex;align-items:center;gap:7px"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 5c-1 0-2 .5-2 1.5v1c0 .8-.5 1.5-.5 1.5s.5.7.5 1.5v1C2 12.5 3 13 4 13M12 5c1 0 2 .5 2 1.5v1c0 .8.5 1.5.5 1.5s-.5.7-.5 1.5v1C14 12.5 13 13 12 13M9 4l-2 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg><span>{} JSON</span></div>'
    +   '<div style="display:flex;gap:4px">'
    +     '<button class="cs-dv-panel-ico cs-dv-panel-ico--dm" title="Expand">⤢</button>'
    +     '<button class="cs-dv-panel-ico cs-dv-panel-ico--dm" title="Download">⬇</button>'
    +     '<button class="cs-dv-panel-ico cs-dv-panel-ico--dm" onclick="csDvToggle(\'json\')" title="Close">✕</button>'
    +   '</div>'
    + '</div>'
    + '<div class="cs-dv-panel-body cs-dv-panel-body--dark">'
    +   '<pre class="cs-dv-json-pre">' + html + '</pre>'
    + '</div>'
    + '</div>';
}

function csDvToggle(key) {
  csDetailPanels3[key] = !csDetailPanels3[key];
  var panel = document.getElementById('cs-dv-panel-' + key);
  var tog   = document.getElementById('cs-dvtog-' + key);
  if (panel) panel.style.display = csDetailPanels3[key] ? '' : 'none';
  if (tog)   tog.classList.toggle('cs-dv-tog--act', csDetailPanels3[key]);
}

// ── Panel helpers (Taxonomy Explorer / Metadata Analysis) ───────────────

var csActiveTx2Filter  = 'all';
var csSelectedTx2Id    = null;
var csTx2ViewMode      = 'grid';
var csUnsplashCache    = {}; // showId → image URL
var vodActivePanels      = []; // keys of currently open panels (ordered)
var vodDetailTab         = 'content'; // 'content' | 'brand' | 'test'
var vodCurrentShow       = null;
var vodEnrichmentTier    = 'advanced'; // 'basic' | 'advanced' | 'exact'
var vodTestAdCreative    = null;  // { id, name, advertiser, template } — currently selected
var vodFilterOpen        = false;
var vodFilterAccOpen     = { period: true, publisher: false, channel: false, category: false };
var vodActivePeriod      = 'all';
var vodActivePublishers  = [];
var vodActiveChannels    = [];
var vodActiveCategories  = [];
var vodPublisherSearch   = '';
var vodChannelSearch     = '';

function csTx2View(view) {
  ['mockup','process'].forEach(function(v) {
    var btn   = document.getElementById('cs-vbtn5-' + v);
    var panel = document.getElementById('cs-view5-' + v);
    if (btn)   btn.className       = 'cs-view-btn' + (v === view ? ' cs-view-btn--act' : '');
    if (panel) panel.style.display = v === view ? '' : 'none';
  });
}

function csTx2NavTab(tab) {
  // Update sidebar active state
  ['metadata', 'taxonomy'].forEach(function(t) {
    var el = document.getElementById('tx2-nav-' + t);
    if (el) el.className = 'tx2-nav-item' + (t === tab ? ' tx2-nav-item--act' : '');
  });

  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  if (tab === 'metadata') {
    // Restore Content Selection grid
    ca.innerHTML =
        '<div class="cs-toolbar"><div class="cs-filter-wrap"><div class="cs-filter-label">Category</div>'
      + '<select class="cs-filter-select" onchange="csTx2Filter(this.value)">'
      + '<option value="all">All</option><option value="comedy">Comedy</option>'
      + '<option value="drama">Drama</option><option value="reality">Reality</option>'
      + '<option value="documentary">Documentary</option></select></div>'
      + '<div style="display:flex;align-items:center;gap:8px">'
      + '<div style="display:flex;gap:2px;background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:2px">'
      + '<button id="cs-view-grid-btn" onclick="csTx2SetView(\'grid\')" title="Grid view" style="width:28px;height:26px;border:none;border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:center;background:var(--surface);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.08);transition:all .12s"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></button>'
      + '<button id="cs-view-table-btn" onclick="csTx2SetView(\'table\')" title="Table view" style="width:28px;height:26px;border:none;border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;color:var(--muted);transition:all .12s"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>'
      + '</div>'
      + '<button class="cs-request-btn" onclick="csOpenModalTaxonomy()">'
      + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
      + ' Scan New Content</button></div></div>'
      + '<div id="cs-grid5"></div>';
    csTx2Render();
  }
}
function csTx2SetView(mode) {
  csTx2ViewMode = mode;
  var gridBtn  = document.getElementById('cs-view-grid-btn');
  var tableBtn = document.getElementById('cs-view-table-btn');
  if (gridBtn) {
    gridBtn.style.background  = mode === 'grid'  ? 'var(--surface)' : 'transparent';
    gridBtn.style.color       = mode === 'grid'  ? 'var(--text)'    : 'var(--muted)';
    gridBtn.style.boxShadow   = mode === 'grid'  ? '0 1px 3px rgba(0,0,0,.08)' : 'none';
  }
  if (tableBtn) {
    tableBtn.style.background = mode === 'table' ? 'var(--surface)' : 'transparent';
    tableBtn.style.color      = mode === 'table' ? 'var(--text)'    : 'var(--muted)';
    tableBtn.style.boxShadow  = mode === 'table' ? '0 1px 3px rgba(0,0,0,.08)' : 'none';
  }
  csTx2Render();
}

function csTx2Filter(val) {
  csActiveTx2Filter = val;
  csTx2Render();
}

function vodToggleFilters() {
  if (vodFilterOpen) { vodCloseFilters(); return; }
  vodFilterOpen = true;
  var fp  = document.getElementById('vod-filter-panel');
  var btn = document.getElementById('vod-filter-btn');
  if (fp) { fp.style.display = ''; vodRenderFilterPanel(); }
  if (btn) { btn.style.background = 'var(--subtle)'; btn.style.borderColor = 'var(--accent)'; btn.style.color = 'var(--accent)'; }
  // backdrop
  var bd = document.createElement('div');
  bd.id = 'vod-fp-bd';
  bd.style.cssText = 'position:fixed;inset:0;z-index:98';
  bd.onclick = function() { vodCloseFilters(); };
  document.body.appendChild(bd);
}

function vodCloseFilters() {
  vodFilterOpen = false;
  var fp  = document.getElementById('vod-filter-panel');
  var btn = document.getElementById('vod-filter-btn');
  var bd  = document.getElementById('vod-fp-bd');
  if (fp)  fp.style.display = 'none';
  if (btn) { btn.style.background = 'var(--bg)'; btn.style.borderColor = 'var(--border)'; btn.style.color = 'var(--muted)'; }
  if (bd && bd.parentNode) bd.parentNode.removeChild(bd);
}

function vodToggleAcc(key) {
  vodFilterAccOpen[key] = !vodFilterAccOpen[key];
  vodRenderFilterPanel();
}

function vodSetPeriod(p) {
  vodActivePeriod = p;
  vodRenderFilterPanel();
  vodRenderChips();
}

function vodTogglePublisher(pub) {
  var i = vodActivePublishers.indexOf(pub);
  if (i > -1) vodActivePublishers.splice(i, 1); else vodActivePublishers.push(pub);
  vodRenderChips();
}

function vodToggleChannel(ch) {
  var i = vodActiveChannels.indexOf(ch);
  if (i > -1) vodActiveChannels.splice(i, 1); else vodActiveChannels.push(ch);
  vodRenderChips();
}

function vodToggleCategory(cat) {
  var i = vodActiveCategories.indexOf(cat);
  if (i > -1) vodActiveCategories.splice(i, 1); else vodActiveCategories.push(cat);
  vodRenderChips();
}

function vodRemoveChip(type, val) {
  if (type === 'period')    { vodActivePeriod = 'all'; }
  if (type === 'publisher') { vodActivePublishers  = vodActivePublishers.filter(function(v)  { return v !== val; }); }
  if (type === 'channel')   { vodActiveChannels    = vodActiveChannels.filter(function(v)    { return v !== val; }); }
  if (type === 'category')  { vodActiveCategories  = vodActiveCategories.filter(function(v)  { return v !== val; }); }
  if (vodFilterOpen) vodRenderFilterPanel();
  vodRenderChips();
}

function vodRenderChips() {
  var row = document.getElementById('vod-chips-row');
  if (!row) return;
  var chips = [];
  if (vodActivePeriod !== 'all') {
    var pl = { week: 'Last week', month: 'Last month', custom: 'Custom date' };
    chips.push({ type: 'period', val: vodActivePeriod, label: pl[vodActivePeriod] || vodActivePeriod });
  }
  vodActivePublishers.forEach(function(v)  { chips.push({ type: 'publisher', val: v, label: v }); });
  vodActiveChannels.forEach(function(v)    { chips.push({ type: 'channel',   val: v, label: v }); });
  vodActiveCategories.forEach(function(v)  { chips.push({ type: 'category',  val: v, label: v }); });
  if (!chips.length) { row.style.display = 'none'; row.innerHTML = ''; return; }
  row.style.display = 'flex';
  row.innerHTML = '<span style="font-size:11px;font-weight:500;color:var(--muted);white-space:nowrap;align-self:center;margin-right:2px">Filter by</span>'
    + chips.map(function(c) {
        return '<div class="vod-chip">' + c.label
          + '<span onclick="vodRemoveChip(\'' + c.type + '\',\'' + c.val.replace(/'/g,"\\'") + '\')" style="cursor:pointer;font-size:14px;line-height:1;opacity:.55;margin-left:2px" title="Remove">&times;</span>'
          + '</div>';
      }).join('');
}

function vodRenderFilterPanel() {
  var fp = document.getElementById('vod-filter-panel');
  if (!fp) return;
  fp.innerHTML = vodFilterPanelHtml();
}

function vodFilterPanelHtml() {
  function chev(key) {
    var o = vodFilterAccOpen[key];
    return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:var(--faint);' + (o ? 'transform:rotate(180deg)' : '') + '"><path d="M6 9l6 6 6-6"/></svg>';
  }
  function acc(key, label, body) {
    var o = vodFilterAccOpen[key];
    return '<div style="border-bottom:1px solid var(--border)">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;user-select:none" onclick="vodToggleAcc(\'' + key + '\')">'
      +   '<span style="font-size:12px;font-weight:500;color:var(--text)">' + label + '</span>' + chev(key)
      + '</div>'
      + (o ? '<div style="padding:2px 14px 12px">' + body + '</div>' : '')
      + '</div>';
  }
  function radio(val, lbl) {
    return '<label style="display:flex;align-items:center;gap:8px;padding:3px 0;font-size:12px;color:var(--text);cursor:pointer">'
      + '<input type="radio" name="vod-period" value="' + val + '" ' + (vodActivePeriod === val ? 'checked' : '') + ' onchange="vodSetPeriod(\'' + val + '\')" style="accent-color:var(--accent);cursor:pointer">'
      + lbl + '</label>';
  }
  function searchBox(placeholder, currentVal, onInputFn) {
    return '<div style="position:relative;margin-bottom:8px">'
      + '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;left:7px;top:50%;transform:translateY(-50%);color:var(--faint);pointer-events:none"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>'
      + '<input type="text" placeholder="' + placeholder + '" value="' + currentVal + '" oninput="' + onInputFn + ';vodRenderFilterPanel()" style="width:100%;box-sizing:border-box;height:26px;padding:0 7px 0 24px;border:1px solid var(--border);border-radius:5px;font-size:11px;font-family:inherit;color:var(--text);background:var(--bg);outline:none">'
      + '</div>';
  }
  function chkItem(type, val, arr) {
    var checked = arr.indexOf(val) > -1;
    return '<label style="display:flex;align-items:center;gap:8px;padding:3px 0;font-size:12px;color:var(--text);cursor:pointer">'
      + '<input type="checkbox" ' + (checked ? 'checked' : '') + ' onchange="vodToggle' + type + '(\'' + val.replace(/'/g,"\\'") + '\')" style="accent-color:var(--accent);cursor:pointer"><span>' + val + '</span></label>';
  }

  var periodBody = radio('all','All time') + radio('week','Last week') + radio('month','Last month') + radio('custom','Custom date')
    + (vodActivePeriod === 'custom' ? '<div style="margin-top:6px"><input type="date" style="width:100%;box-sizing:border-box;padding:4px 7px;border:1px solid var(--border);border-radius:5px;font-size:11px;font-family:inherit;color:var(--text);background:var(--surface);outline:none"></div>' : '');

  var pubList = ['NBCUniversal','Paramount AUS','Peacock','CBS'].filter(function(p) { return !vodPublisherSearch || p.toLowerCase().indexOf(vodPublisherSearch.toLowerCase()) > -1; });
  var publisherBody = searchBox('Search publishers…', vodPublisherSearch, 'vodPublisherSearch=this.value')
    + pubList.map(function(p) { return chkItem('Publisher', p, vodActivePublishers); }).join('');

  var chList = ['NBC','CBS','Peacock Premium','Paramount+'].filter(function(c) { return !vodChannelSearch || c.toLowerCase().indexOf(vodChannelSearch.toLowerCase()) > -1; });
  var channelBody = searchBox('Search channels…', vodChannelSearch, 'vodChannelSearch=this.value')
    + chList.map(function(c) { return chkItem('Channel', c, vodActiveChannels); }).join('');

  var categoryBody = ['Comedy','Drama','Reality','Documentary'].map(function(c) { return chkItem('Category', c, vodActiveCategories); }).join('');

  return acc('period',    'Processing Period', periodBody)
    + acc('publisher', 'Publisher',         publisherBody)
    + acc('channel',   'Channel',           channelBody)
    + '<div>' // last item, no border-bottom inside acc needed
    + '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;user-select:none" onclick="vodToggleAcc(\'category\')">'
    + '<span style="font-size:12px;font-weight:500;color:var(--text)">Category</span>' + chev('category')
    + '</div>'
    + (vodFilterAccOpen.category ? '<div style="padding:2px 14px 12px">' + categoryBody + '</div>' : '')
    + '</div>';
}

function vodSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function vodShowDetail(show) {
  vodCloseFilters();
  vodActivePanels = [];
  var slug = vodSlug(show.title);

  // URL + state
  history.pushState({ id: 'vod-analysis', label: 'VoD Analysis' }, '', '/vod-analysis/' + slug);

  // Breadcrumb
  var bc = document.getElementById('content-bc');
  if (bc) bc.innerHTML =
    '<span style="font-weight:400;color:var(--muted);cursor:pointer;transition:color .15s" '
    + 'onmouseover="this.style.color=\'var(--accent)\'" onmouseout="this.style.color=\'var(--muted)\'" '
    + 'onclick="setPage(\'vod-analysis\',\'VoD Analysis\')">VoD Analysis</span>'
    + '&nbsp;&nbsp;<span style="color:var(--faint)">/</span>&nbsp;&nbsp;' + show.title;

  // Page header
  var ptitle = document.getElementById('vod-page-title');
  var psub   = document.getElementById('vod-page-sub');
  if (psub) {
    var sub = show.title || '';
    if (show.episode) sub += ' · ' + show.episode;
    psub.textContent = sub;
    psub.style.marginBottom = '';
  }

  // Hide scorecards
  var sc = document.getElementById('vod-scorecards');
  if (sc) sc.style.display = 'none';

  // Render detail in the panel
  var panel = document.getElementById('sdt-panel-taxonomy2');
  if (!panel) return;
  vodDetailTab = 'content';
  vodCurrentShow = show;
  panel.innerHTML = vodSubNavHtml() + '<div id="vod-detail-body">' + vodDetailCardHtml(show) + '</div>';

  // Load image if not cached
  if (!csUnsplashCache[show.id]) {
    fetch('/api/unsplash?q=' + encodeURIComponent('TV Show ' + show.title))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.url) {
          csUnsplashCache[show.id] = data.url;
          var poster = document.getElementById('vod-detail-poster');
          if (poster) { poster.style.backgroundImage = 'url(' + data.url + ')'; poster.style.opacity = '1'; }
        }
      }).catch(function() {});
  } else {
    setTimeout(function() {
      var poster = document.getElementById('vod-detail-poster');
      if (poster) { poster.style.backgroundImage = 'url(' + csUnsplashCache[show.id] + ')'; poster.style.opacity = '1'; }
    }, 0);
  }
}

var VOD_PANEL_W = 240; // px — width per panel
var vodScanTimeouts = {};

function vodPanelPlaceholder(key) {
  var texts = {
    tax:  'Fetching taxonomy data when video plays…',
    prod: 'Detecting products when video plays…',
    json: 'Generating JSON output when video plays…'
  };
  return '<div style="padding:32px 0;text-align:center">'
    + '<div style="font-size:11px;color:var(--faint);font-style:italic;line-height:1.6">' + (texts[key] || 'Fetching data…') + '</div>'
    + '</div>';
}

function vodTaxItemHtml(sc) {
  return '<div style="padding:9px 0;border-bottom:1px solid var(--border)">'
    + '<div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:2px">Scene ' + sc.scene + '</div>'
    + '<div style="font-size:11px;font-weight:600;color:var(--text);margin-bottom:1px">' + sc.badge + '</div>'
    + '<div style="font-size:11px;color:var(--muted)">' + sc.extra2 + '</div>'
    + '</div>';
}

function vodProdItemHtml(p) {
  return '<div style="display:flex;gap:9px;padding:9px 0;border-bottom:1px solid var(--border)">'
    + '<div style="font-size:20px;flex-shrink:0;margin-top:1px">' + p.emoji + '</div>'
    + '<div style="min-width:0">'
    +   '<div style="font-size:11px;font-weight:500;color:var(--text);line-height:1.4;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">' + p.name + '</div>'
    +   '<div style="font-size:11px;color:var(--muted)">' + p.price + ' · ' + p.scene + '</div>'
    + '</div></div>';
}

function vodStartPanelScan(key) {
  vodStopPanelScan(key);

  if (key === 'json') {
    // Reveal JSON line-by-line
    var highlighted = CS_DETAIL_JSON
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"([^"]+)":/g,'<span style="color:#7dd3fc">"$1"</span>:')
      .replace(/:\s*"([^"]+)"/g,': <span style="color:#86efac">"$1"</span>')
      .replace(/:\s*(\d[\d.]*)/g,': <span style="color:#fbbf24">$1</span>');
    var hlLines = highlighted.split('\n');
    var lineIdx = 0;
    function revealLine() {
      var body = document.getElementById('vod-panel-body-json');
      if (!body) return;
      if (lineIdx === 0) body.innerHTML = '<pre style="font-size:10px;line-height:1.6;color:#e2e8f0;margin:0;white-space:pre-wrap;word-break:break-all"></pre>';
      var pre = body.querySelector('pre');
      if (!pre || lineIdx >= hlLines.length) {
        // All lines revealed — start slow autoscroll
        vodJsonStartScroll(body);
        return;
      }
      pre.innerHTML += (lineIdx > 0 ? '\n' : '') + hlLines[lineIdx++];
      body.scrollTop = body.scrollHeight; // follow reveal
      vodScanTimeouts[key] = setTimeout(revealLine, 70);
    }
    vodScanTimeouts[key] = setTimeout(revealLine, 2500);
    return;
  }

  var items = key === 'tax' ? CS_DETAIL_SCENES.slice() : CS_DETAIL_PRODUCTS.slice();
  var idx = 0;

  function reveal() {
    var body = document.getElementById('vod-panel-body-' + key);
    if (!body || idx >= items.length) return;
    if (idx === 0) body.innerHTML = '';
    var item = items[idx++];
    var wrapper = document.createElement('div');
    wrapper.innerHTML = key === 'tax' ? vodTaxItemHtml(item) : vodProdItemHtml(item);
    var node = wrapper.firstChild;
    node.style.opacity = '0';
    node.style.transform = 'translateY(-5px)';
    node.style.transition = 'opacity .35s ease, transform .35s ease';
    body.insertBefore(node, body.firstChild);
    requestAnimationFrame(function() { requestAnimationFrame(function() {
      node.style.opacity = '1'; node.style.transform = 'translateY(0)';
    }); });
    if (idx < items.length) vodScanTimeouts[key] = setTimeout(reveal, 2000 + Math.random() * 2500);
  }
  vodScanTimeouts[key] = setTimeout(reveal, 2500);
}

function vodJsonStartScroll(body) {
  if (!body) return;
  var rafId = null;
  var paused = false;
  var resumeTimer = null;
  var speed = 0.4; // px per frame

  function step() {
    if (!paused && body.isConnected) {
      var max = body.scrollHeight - body.clientHeight;
      if (body.scrollTop < max) {
        body.scrollTop += speed;
      } else {
        // reached bottom — scroll back to top smoothly and loop
        body.scrollTop = 0;
      }
      rafId = requestAnimationFrame(step);
    }
  }

  // Pause on user scroll, resume after 2s
  body.addEventListener('wheel', function() {
    paused = true;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function() {
      paused = false;
      rafId = requestAnimationFrame(step);
    }, 2000);
  }, { passive: true });

  // Start after a short pause post-reveal
  setTimeout(function() {
    if (body.isConnected) rafId = requestAnimationFrame(step);
  }, 800);

  // Store so we can cancel on panel close
  body._jsonRaf = function() {
    paused = true;
    if (rafId) cancelAnimationFrame(rafId);
    clearTimeout(resumeTimer);
  };
}

function vodStopPanelScan(key) {
  if (vodScanTimeouts[key]) { clearTimeout(vodScanTimeouts[key]); delete vodScanTimeouts[key]; }
  // Stop JSON autoscroll if running
  if (key === 'json') {
    var body = document.getElementById('vod-panel-body-json');
    if (body && body._jsonRaf) { body._jsonRaf(); }
  }
}

function vodStopAllPanelScans() {
  Object.keys(vodScanTimeouts).forEach(vodStopPanelScan);
}

function vodSubNavHtml() {
  var tabs = [
    { id: 'content',     label: 'Content Analysis' },
    { id: 'brand',       label: 'Brand Safety Analysis' },
    { id: 'viewership',  label: 'Viewership Analysis' },
    { id: 'test',        label: 'Test an Ad', dividerBefore: true }
  ];
  return '<div id="vod-subnav" style="margin-bottom:16px">'
    + UI.tabNav(tabs, vodDetailTab, 'vodSetDetailTab')
    + '</div>';
}

function vodDetailCardHtml(show) {
  var tierOptions = [
    { val: 'basic',    label: 'Basic Scene' },
    { val: 'advanced', label: 'Advanced Scene' },
    { val: 'exact',    label: 'Exact Product Match' }
  ];
  var headerRight = vodDetailTab === 'content'
    ? '<div style="display:flex;align-items:center;gap:8px">'
        + '<span style="font-size:11px;color:var(--muted);font-weight:500;white-space:nowrap">Enrichment Tier</span>'
        + '<div style="width:190px">' + UI.customSelect('vod-tier', tierOptions, vodEnrichmentTier, 'vodSetEnrichmentTier') + '</div>'
      + '</div>'
    : vodDetailTab === 'test'
    ? '<div style="display:flex;align-items:center;gap:8px">'
        + '<span style="font-size:11px;color:var(--muted);font-weight:500;white-space:nowrap">Creative</span>'
        + '<div style="width:280px" id="vod-test-creative-wrap">' + _vodTestCreativeSelectHtml() + '</div>'
      + '</div>'
    : '';
  var hdr = '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 20px;border-bottom:1px solid var(--border);flex-shrink:0;min-height:0">'
    + '<div style="display:flex;align-items:center;gap:8px;min-width:0;overflow:hidden">'
    +   '<div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (show.title || '') + '</div>'
    +   (show.episode ? '<span style="color:var(--border-md,var(--border));font-size:12px;flex-shrink:0">·</span><div style="font-size:12px;color:var(--faint);white-space:nowrap">' + show.episode + '</div>' : '')
    + '</div>'
    + (headerRight ? '<div style="flex-shrink:0;margin-left:16px">' + headerRight + '</div>' : '')
    + '</div>';
  return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;height:calc(100vh - 252px);display:flex;flex-direction:column">'
    + hdr
    + '<div style="flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden">'
    +   vodDetailInnerHtml(show)
    + '</div>'
    + '</div>';
}

// ── Test an Ad — Creative selector ───────────────────────────────────────────

function _vodTestCreativeSelectHtml() {
  var label = vodTestAdCreative
    ? (vodTestAdCreative.name
        + (vodTestAdCreative.advertiser ? ' (' + vodTestAdCreative.advertiser + ')' : '')
        + ' — ' + vodTestAdCreative.template)
    : 'Select a Creative…';
  var isMuted = !vodTestAdCreative;
  return '<button id="vod-test-cr-btn" onclick="_vodTestCreativeDdOpen(event)"'
    + ' style="width:100%;height:32px;display:flex;align-items:center;justify-content:space-between;gap:6px;'
    +         'padding:0 10px;border:1px solid var(--border-md);border-radius:8px;background:var(--surface);'
    +         'cursor:pointer;font-family:inherit;font-size:12px;color:' + (isMuted ? 'var(--faint)' : 'var(--text)') + ';'
    +         'transition:border-color .12s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"'
    + ' onmouseover="this.style.borderColor=\'var(--text)\'" onmouseout="this.style.borderColor=\'var(--border-md)\'">'
    + '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;text-align:left">' + label + '</span>'
    + '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" style="flex-shrink:0"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    + '</button>';
}

function _vodTestCreativeDdOpen(e) {
  e.stopPropagation();
  // Remove any existing dropdown
  var old = document.getElementById('vod-test-cr-dd');
  if (old) { old.remove(); return; }

  // Fetch options then build dropdown
  _vodFetchCreativeOpts(function(opts) {
    var btn = document.getElementById('vod-test-cr-btn');
    if (!btn) return;
    var rect = btn.getBoundingClientRect();

    var dd = document.createElement('div');
    dd.id = 'vod-test-cr-dd';
    dd.style.cssText = 'position:fixed;top:' + (rect.bottom + 4) + 'px;left:' + rect.left + 'px;'
      + 'width:' + Math.max(rect.width, 320) + 'px;max-height:280px;display:flex;flex-direction:column;'
      + 'background:var(--surface);border:1px solid var(--border-md);border-radius:10px;'
      + 'box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:9999;overflow:hidden';

    // Search input
    var searchRow = '<div style="padding:8px 8px 6px;border-bottom:1px solid var(--border);flex-shrink:0">'
      + '<div style="display:flex;align-items:center;gap:6px;height:28px;padding:0 8px;border:1px solid var(--border-md);border-radius:7px;background:var(--bg)">'
      + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="color:var(--faint);flex-shrink:0"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>'
      + '<input id="vod-test-cr-search" type="text" placeholder="Search creatives…"'
      +   ' style="flex:1;border:none;background:transparent;font-size:12px;color:var(--text);outline:none;font-family:inherit"'
      +   ' oninput="_vodTestCreativeFilter(this.value)">'
      + '</div></div>';

    // Options list
    var listHtml = '<div id="vod-test-cr-list" style="overflow-y:auto;flex:1">'
      + _vodTestCreativeListHtml(opts, '')
      + '</div>';

    dd.innerHTML = searchRow + listHtml;
    dd._opts = opts;
    document.body.appendChild(dd);
    setTimeout(function() { var s = document.getElementById('vod-test-cr-search'); if(s) s.focus(); }, 0);

    // Close on outside click
    function onOutside(ev) {
      if (!dd.contains(ev.target) && ev.target !== btn) {
        dd.remove(); document.removeEventListener('mousedown', onOutside);
      }
    }
    setTimeout(function() { document.addEventListener('mousedown', onOutside); }, 0);
  });
}

function _vodTestCreativeListHtml(opts, query) {
  var q = (query || '').toLowerCase().trim();
  var filtered = q
    ? opts.filter(function(o) { return o.label.toLowerCase().indexOf(q) > -1; })
    : opts;

  if (!filtered.length) {
    return '<div style="padding:16px;text-align:center;font-size:12px;color:var(--faint)">No results</div>';
  }
  return filtered.map(function(o, i) {
    var isSelected = vodTestAdCreative && vodTestAdCreative.id === o.id && vodTestAdCreative.template === o.template;
    return '<div onclick="_vodTestCreativePick(' + JSON.stringify(o).replace(/"/g,'&quot;') + ')"'
      + ' style="padding:8px 12px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:8px;'
      +         'background:' + (isSelected ? 'var(--subtle)' : 'transparent') + ';'
      +         'color:' + (isSelected ? 'var(--accent)' : 'var(--text)') + ';transition:background .1s"'
      + ' onmouseover="this.style.background=\'var(--hover)\'" onmouseout="this.style.background=\'' + (isSelected?'var(--subtle)':'transparent') + '\'">'
      + '<div style="min-width:0;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">'
      +   '<span style="font-weight:500">' + o.name + '</span>'
      +   (o.advertiser ? ' <span style="font-weight:400;color:var(--muted)">(' + o.advertiser + ')</span>' : '')
      +   (o.template && o.template !== '—' ? ' <span style="font-size:10px;color:var(--faint);margin-left:4px">— ' + o.template + '</span>' : '')
      + '</div>'
      + (isSelected ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '')
      + '</div>';
  }).join('');
}

function _vodTestCreativeFilter(val) {
  var dd = document.getElementById('vod-test-cr-dd');
  if (!dd) return;
  var list = document.getElementById('vod-test-cr-list');
  if (list) list.innerHTML = _vodTestCreativeListHtml(dd._opts, val);
}

function _vodTestCreativePick(opt) {
  vodTestAdCreative = opt;
  // Update button label
  var wrap = document.getElementById('vod-test-creative-wrap');
  if (wrap) wrap.innerHTML = _vodTestCreativeSelectHtml();
  // Close dropdown
  var dd = document.getElementById('vod-test-cr-dd');
  if (dd) dd.remove();
}

function _vodFetchCreativeOpts(cb) {
  var lib = (typeof CS_LIBRARY !== 'undefined') ? CS_LIBRARY : [];
  function buildOpts(arr) {
    var opts = [];
    arr.forEach(function(cr) {
      var rawTpls = (cr.templates && cr.templates.length) ? cr.templates : [null];
      rawTpls.forEach(function(t) {
        var tName = t === null ? '—' : (typeof t === 'object' ? (t.name || '—') : String(t));
        opts.push({
          id: cr.id,
          name: cr.name || '—',
          advertiser: cr.advertiser || '',
          template: tName,
          label: (cr.name || '—') + (cr.advertiser ? ' (' + cr.advertiser + ')' : '') + ' — ' + tName
        });
      });
    });
    return opts;
  }
  if (lib.length) { cb(buildOpts(lib)); return; }
  fetch('/api/creatives')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var crs = data.creatives || [];
      if (crs.length && typeof CS_LIBRARY !== 'undefined') CS_LIBRARY = crs;
      cb(buildOpts(crs));
    })
    .catch(function() { cb([]); });
}

function vodSetDetailTab(tab) {
  vodDetailTab = tab;
  var el = document.getElementById('vod-subnav');
  if (el) el.outerHTML = vodSubNavHtml();
  var body = document.getElementById('vod-detail-body');
  if (body && vodCurrentShow) {
    body.innerHTML = vodDetailCardHtml(vodCurrentShow);
    // Re-apply cached poster image
    var poster = document.getElementById('vod-detail-poster');
    if (poster && csUnsplashCache[vodCurrentShow.id]) {
      poster.style.backgroundImage = 'url(' + csUnsplashCache[vodCurrentShow.id] + ')';
    }
  }
}

function vodSetEnrichmentTier(tier) {
  vodEnrichmentTier = tier;
}

function vodDetailInnerHtml(show) {
  if (vodDetailTab === 'brand')       return vodBrandSafetyHtml(show);
  if (vodDetailTab === 'viewership')  return vodViewershipHtml(show);
  if (vodDetailTab === 'test')        return vodTestAdHtml(show);
  return vodContentAnalysisHtml(show);
}

function vodViewershipHtml(show) {
  return '<div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:12px;color:var(--faint)">'
    + '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>'
    + '<div style="font-size:13px;font-weight:500;color:var(--muted)">Viewership Analysis</div>'
    + '<div style="font-size:12px;color:var(--faint);text-align:center;max-width:320px">Audience data and viewership metrics for this content will appear here.</div>'
    + '</div>';
}

function vodContentAnalysisHtml(show) {
  var grad = show.grad || 'linear-gradient(145deg,#222,#111)';
  var ytUrl = VOD_YT_MAP[show.title] || null;
  // card=calc(100vh-252px), card-header≈53px, toggle-bar≈54px
  var containerH = 'calc(100vh - 359px)';

  var playerInner = ytUrl
    ? '<iframe src="' + ytUrl + '" style="position:absolute;inset:0;width:100%;height:100%;border:0" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe>'
    : '<div id="vod-detail-poster" style="position:absolute;inset:0;background:' + grad + ';background-size:cover;background-position:center;opacity:.85;transition:opacity .3s"></div>'
      + '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.72) 0%,transparent 50%)"></div>'
      + '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">'
      +   '<div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.14);backdrop-filter:blur(8px);border:2px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s" onmouseover="this.style.background=\'rgba(255,255,255,.22)\'" onmouseout="this.style.background=\'rgba(255,255,255,.14)\'">'
      +     '<svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,.92)" style="margin-left:3px"><path d="M5 3l14 9-14 9V3z"/></svg>'
      +   '</div>'
      + '</div>'
      + '<div style="position:absolute;bottom:0;left:0;right:0;padding:10px 16px">'
      +   '<div style="width:100%;height:3px;background:rgba(255,255,255,.22);border-radius:2px;margin-bottom:9px;cursor:pointer"><div style="width:18%;height:100%;background:var(--accent);border-radius:2px"></div></div>'
      +   '<div style="display:flex;align-items:center;gap:10px">'
      +     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor:pointer"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
      +     '<span style="font-size:11px;color:rgba(255,255,255,.6)">8:12 / 44:15</span>'
      +     '<div style="flex:1"></div>'
      +     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor:pointer"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>'
      +     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor:pointer"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>'
      +   '</div>'
      + '</div>';

  return ''
    // ── Viewport-height row: video + panels ──
    + '<div id="vod-detail-layout" style="display:flex;flex:1;min-height:0;overflow:hidden">'

    //  Player wrap (flex:1, white bg below the 16:9 box)
    + '<div id="vod-player-wrap" style="flex:1;min-width:0;display:flex;align-items:flex-start;justify-content:center;background:var(--surface);position:relative">'
    //  Inner: 16:9 box — width = min(full-wrap-width, containerH×16/9); height auto from aspect-ratio
    +   '<div id="vod-player-inner" style="width:min(100%,calc(' + containerH + ' * 16 / 9));aspect-ratio:16/9;position:relative;overflow:hidden;flex-shrink:0">'
    +     playerInner
    +   '</div>'
    + '</div>'

    //  Panel area
    + '<div id="vod-panel-area" style="display:none;flex-shrink:0;height:100%;border-left:1px solid var(--border)"></div>'

    + '</div>'

    // ── Toggle bar ──
    + '<div style="height:1px;background:var(--border);flex-shrink:0"></div>'
    + '<div style="display:flex;justify-content:center;gap:6px;padding:14px 0 20px;flex-shrink:0">'
    +   '<button class="cs-dv-tog" id="vodtog-tax"  onclick="vodTogglePanel(\'tax\')"  title="Taxonomies"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="13" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/></svg></button>'
    +   '<button class="cs-dv-tog" id="vodtog-prod" onclick="vodTogglePanel(\'prod\')" title="Products"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 3h2l2 7h6l2-5H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="13" r="1" fill="currentColor"/><circle cx="12" cy="13" r="1" fill="currentColor"/></svg></button>'
    +   '<button class="cs-dv-tog" id="vodtog-json" onclick="vodTogglePanel(\'json\')" title="JSON"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4 5c-1 0-2 .5-2 1.5v1c0 .8-.5 1.5-.5 1.5s.5.7.5 1.5v1C2 12.5 3 13 4 13M12 5c1 0 2 .5 2 1.5v1c0 .8.5 1.5.5 1.5s-.5.7-.5 1.5v1C14 12.5 13 13 12 13M9 4l-2 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></button>'
    + '</div>';
}

function vodTestAdHtml(show) {
  var grad = show.grad || 'linear-gradient(145deg,#222,#111)';
  var ytUrl = VOD_YT_MAP[show.title] || null;

  var playerInner2 = ytUrl
    ? '<iframe src="' + ytUrl + '" style="position:absolute;inset:0;width:100%;height:100%;border:0" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe>'
    : '<div style="position:absolute;inset:0;background:' + grad + ';background-size:cover;background-position:center;opacity:.85"></div>'
      + '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.72) 0%,transparent 50%)"></div>'
      + '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">'
      +   '<div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.14);backdrop-filter:blur(8px);border:2px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;cursor:pointer">'
      +     '<svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,.92)" style="margin-left:3px"><path d="M5 3l14 9-14 9V3z"/></svg>'
      +   '</div>'
      + '</div>';

  // ── Player — takes all remaining width, vertically centered ──
  var playerHtml = '<div style="flex:1;min-width:0;display:flex;align-items:center;justify-content:center;background:#000;border-right:1px solid #1e2a3a">'
    + '<div style="width:100%;aspect-ratio:16/9;position:relative;overflow:hidden">'
    +   playerInner2
    + '</div>'
    + '</div>';

  // ── JSON panel — dark, fixed width, open by default ──
  var JSON_W = 280;
  var jsonPanel = '<div style="flex:0 0 ' + JSON_W + 'px;width:' + JSON_W + 'px;display:flex;flex-direction:column;height:100%;background:#0f1623">'
    + '<div style="display:flex;align-items:center;gap:6px;padding:9px 12px;background:#0f1623;border-bottom:1px solid #1e2a3a;flex-shrink:0">'
    +   '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" style="color:#94a3b8"><path d="M4 5c-1 0-2 .5-2 1.5v1c0 .8-.5 1.5-.5 1.5s.5.7.5 1.5v1C2 12.5 3 13 4 13M12 5c1 0 2 .5 2 1.5v1c0 .8.5 1.5.5 1.5s-.5.7-.5 1.5v1C14 12.5 13 13 12 13M9 4l-2 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
    +   '<span style="font-size:11px;font-weight:600;color:#e2e8f0;flex:1">{} JSON</span>'
    + '</div>'
    + '<div id="vod-panel-body-json" style="flex:1;overflow-y:auto;padding:0 12px;background:#0f1623">'
    +   '<div style="padding:32px 0;text-align:center"><div style="font-size:11px;color:#475569;font-style:italic;line-height:1.6">Generating JSON output when video plays…</div></div>'
    + '</div>'
    + '</div>';

  // Start JSON reveal after render
  setTimeout(function() { vodStartPanelScan('json'); }, 0);

  return '<div style="display:flex;flex:1;min-height:0;overflow:hidden">' + playerHtml + jsonPanel + '</div>';
}

function vodBrandSafetyHtml(show) {
  var grad = show.grad || 'linear-gradient(145deg,#222,#111)';
  var ytUrl = VOD_YT_MAP[show.title] || null;

  var playerInner = ytUrl
    ? '<iframe src="' + ytUrl + '" style="position:absolute;inset:0;width:100%;height:100%;border:0" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe>'
    : '<div style="position:absolute;inset:0;background:' + grad + ';background-size:cover;background-position:center;opacity:.85"></div>'
      + '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.72) 0%,transparent 50%)"></div>'
      + '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">'
      +   '<div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.14);backdrop-filter:blur(8px);border:2px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;cursor:pointer">'
      +     '<svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,.92)" style="margin-left:3px"><path d="M5 3l14 9-14 9V3z"/></svg>'
      +   '</div>'
      + '</div>'
      + '<div style="position:absolute;bottom:0;left:0;right:0;padding:10px 16px">'
      +   '<div style="width:100%;height:3px;background:rgba(255,255,255,.22);border-radius:2px;margin-bottom:9px"><div style="width:18%;height:100%;background:var(--accent);border-radius:2px"></div></div>'
      +   '<div style="display:flex;align-items:center;gap:10px">'
      +     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
      +     '<span style="font-size:11px;color:rgba(255,255,255,.6)">8:12 / 44:15</span>'
      +   '</div>'
      + '</div>';

  // ── Player (left 50%) ──
  var playerHtml = '<div style="flex:0 0 50%;display:flex;align-items:center;justify-content:center;background:#000;border-right:1px solid var(--border)">'
    + '<div style="width:100%;aspect-ratio:16/9;position:relative;overflow:hidden">'
    +   playerInner
    + '</div>'
    + '</div>';

  // ── Brand Safety Panel (right 50%, scrollable) ──
  // Mock data
  var logos = ['Peacock', 'NBCUniversal', show.publisher || 'Network'];
  var objects = [
    { pct: 97, tags: ['Person', 'Adult', 'Face', 'Smile', 'Indoor'] },
    { pct: 91, tags: ['Couch', 'Living Room', 'Television', 'Furniture'] },
    { pct: 84, tags: ['Food', 'Plate', 'Table', 'Dining'] }
  ];
  var alerts = [
    { label: 'Alcohol', score: 72 },
    { label: 'Suggestive', score: 58 }
  ];

  // Section label style
  var SL = 'font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--faint);margin-bottom:10px';
  // Tag pill style
  var TAG = 'display:inline-block;font-size:11px;font-weight:500;color:var(--text);background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:3px 10px;margin:3px 3px 0 0';

  // Logos section
  var logosHtml = '<div style="margin-bottom:20px">'
    + '<div style="' + SL + '">Logos Detected</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:6px">'
    + logos.map(function(l) {
        return '<div style="display:inline-flex;align-items:center;gap:6px;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:6px 12px">'
          + '<div style="width:22px;height:22px;border-radius:4px;background:var(--subtle);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
          + '<svg width="11" height="11" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="var(--muted)" stroke-width="1.4"/><path d="M5 8h6M8 5v6" stroke="var(--muted)" stroke-width="1.4" stroke-linecap="round"/></svg>'
          + '</div>'
          + '<span style="font-size:12px;font-weight:500;color:var(--text)">' + l + '</span>'
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>';

  // Objects Detected section
  var objectsHtml = '<div style="margin-bottom:20px">'
    + '<div style="' + SL + '">Objects Detected</div>'
    + objects.map(function(g) {
        var scoreColor = g.pct >= 95 ? '#15803D' : g.pct >= 85 ? '#B45309' : '#6B7280';
        var scoreBg    = g.pct >= 95 ? '#DCFCE7'  : g.pct >= 85 ? '#FEF3C7'  : 'var(--subtle)';
        return '<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border)">'
          + '<span style="display:inline-block;font-size:10px;font-weight:700;color:' + scoreColor + ';background:' + scoreBg + ';border-radius:20px;padding:2px 8px;margin-bottom:6px">' + g.pct + '%</span>'
          + '<div>' + g.tags.map(function(t) { return '<span style="' + TAG + '">' + t + '</span>'; }).join('') + '</div>'
          + '</div>';
      }).join('')
    + '</div>';

  // Ad Compliance Alert section
  var alertsHtml = '<div>'
    + '<div style="' + SL + '">Ad Compliance</div>'
    + '<div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;padding:14px 16px">'
    +   '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px">'
    +     '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;margin-top:1px"><path d="M8 1L15 14H1L8 1z" stroke="#C2410C" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 6v4M8 11.5v.5" stroke="#C2410C" stroke-width="1.4" stroke-linecap="round"/></svg>'
    +     '<div>'
    +       '<div style="font-size:12px;font-weight:600;color:#C2410C;margin-bottom:2px">Review recommended sensitive labels</div>'
    +       '<div style="font-size:11px;color:#92400E">May be false positives in context — review before activation</div>'
    +     '</div>'
    +   '</div>'
    +   '<div style="display:flex;flex-wrap:wrap;gap:6px">'
    + alerts.map(function(a) {
        return '<span style="display:inline-block;font-size:11px;font-weight:600;background:#FEF3C7;border:1px solid #FCD34D;border-radius:20px;padding:3px 10px;color:#92400E">' + a.label + ' ' + a.score + '%</span>';
      }).join('')
    +   '</div>'
    + '</div>'
    + '</div>';

  var panelHtml = '<div style="flex:0 0 50%;overflow-y:auto;padding:20px;background:var(--surface)">'
    + logosHtml + objectsHtml + alertsHtml
    + '</div>';

  return '<div style="display:flex;flex:1;min-height:0;overflow:hidden">'
    + playerHtml
    + panelHtml
    + '</div>';
}

function vodTogglePanel(key) {
  var idx = vodActivePanels.indexOf(key);
  if (idx > -1) { vodActivePanels.splice(idx, 1); vodStopPanelScan(key); }
  else vodActivePanels.push(key);
  // Sync toggle button states
  ['tax','prod','json'].forEach(function(k) {
    var b = document.getElementById('vodtog-' + k);
    if (b) b.classList.toggle('cs-dv-tog--act', vodActivePanels.indexOf(k) > -1);
  });
  vodRenderPanelArea();
}

function vodRenderPanelArea() {
  var pa = document.getElementById('vod-panel-area');
  if (!pa) return;
  vodStopAllPanelScans();
  if (!vodActivePanels.length) {
    pa.style.display = 'none';
    pa.innerHTML = '';
    return;
  }
  pa.style.display = 'flex';
  pa.style.width = (vodActivePanels.length * VOD_PANEL_W) + 'px';
  pa.innerHTML = vodActivePanels.map(function(k, i) {
    return vodPanelContent(k, i < vodActivePanels.length - 1);
  }).join('');
  // Start progressive reveal for each open panel
  vodActivePanels.forEach(function(k) { vodStartPanelScan(k); });
}

function vodPanelContent(key, hasBorderRight) {
  var titles = { tax: 'Taxonomies', prod: 'Products', json: '{} JSON' };
  var icons  = {
    tax:  '<path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="13" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/>',
    prod: '<path d="M2 3h2l2 7h6l2-5H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="13" r="1" fill="currentColor"/><circle cx="12" cy="13" r="1" fill="currentColor"/>',
    json: '<path d="M4 5c-1 0-2 .5-2 1.5v1c0 .8-.5 1.5-.5 1.5s.5.7.5 1.5v1C2 12.5 3 13 4 13M12 5c1 0 2 .5 2 1.5v1c0 .8.5 1.5.5 1.5s-.5.7-.5 1.5v1C14 12.5 13 13 12 13M9 4l-2 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'
  };
  var isDark = key === 'json';
  var hdrBg  = isDark ? '#0f1623' : 'var(--surface)';
  var bodyBg = isDark ? '#0f1623' : 'var(--surface)';
  var hdrBd  = isDark ? '#1e2a3a' : 'var(--border)';
  var sepBd  = hasBorderRight ? ('border-right:1px solid ' + (isDark ? '#1e2a3a' : 'var(--border)') + ';') : '';

  return '<div style="width:' + VOD_PANEL_W + 'px;flex-shrink:0;display:flex;flex-direction:column;height:100%;' + sepBd + '">'
    + '<div style="display:flex;align-items:center;gap:6px;padding:9px 12px;background:' + hdrBg + ';border-bottom:1px solid ' + hdrBd + ';flex-shrink:0">'
    +   '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" style="color:' + (isDark?'#94a3b8':'var(--muted)') + '">' + icons[key] + '</svg>'
    +   '<span style="font-size:11px;font-weight:600;color:' + (isDark?'#e2e8f0':'var(--text)') + ';flex:1">' + titles[key] + '</span>'
    +   '<button onclick="vodTogglePanel(\'' + key + '\')" style="background:none;border:none;cursor:pointer;color:' + (isDark?'#64748b':'var(--faint)') + ';font-size:15px;line-height:1;padding:0" title="Close">&times;</button>'
    + '</div>'
    + '<div id="vod-panel-body-' + key + '" style="flex:1;overflow-y:auto;padding:0 12px;background:' + bodyBg + '">' + vodPanelPlaceholder(key) + '</div>'
    + '</div>';
}

function csTx2Select(id) {
  var show = CS_SHOWS.filter(function(s) { return s.id === id; })[0];
  if (!show) {
    var newIt = csNewItems3.filter(function(s) { return s.id === id; })[0];
    if (newIt) show = newIt;
  }
  if (show) {
    if (!show.analysed) { vodShowNotAnalysed(show); return; }
    vodShowDetail(show);
    return;
  }
  csSelectedTx2Id = id;
  csTx2Render();
}

function vodShowNotAnalysed(show) {
  // breadcrumb
  var bc = document.getElementById('vod-breadcrumb');
  if (bc) bc.innerHTML = '<span style="font-weight:400;color:var(--muted);cursor:pointer;transition:color .15s" onmouseover="this.style.color=\'var(--accent)\'" onmouseout="this.style.color=\'var(--muted)\'" onclick="setPage(\'vod-analysis\',\'VoD Analysis\')">VoD Analysis</span>&nbsp;&nbsp;<span style="color:var(--faint)">/</span>&nbsp;&nbsp;' + show.title;

  // header
  var ptitle = document.getElementById('vod-page-title');
  var psub   = document.getElementById('vod-page-sub');
  if (psub) { var sub2 = show.title || ''; if (show.episode) sub2 += ' · ' + show.episode; psub.textContent = sub2; }

  // hide scorecards
  var sc = document.getElementById('vod-scorecards');
  if (sc) sc.style.display = 'none';

  // render start-analysis panel
  var panel = document.getElementById('sdt-panel-taxonomy2');
  if (!panel) return;
  panel.innerHTML = vodNotAnalysedHtml(show);
}

function vodNotAnalysedHtml(show) {
  return '<div class="cs-card" style="padding:48px 32px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;text-align:center">'
    + '<div style="width:80px;height:80px;border-radius:12px;background:' + (show.grad || 'var(--subtle)') + ';display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:rgba(255,255,255,.8);flex-shrink:0">' + (show.initials || '?') + '</div>'
    + '<div>'
    +   '<div style="font-size:16px;font-weight:600;color:var(--text);margin-bottom:4px">' + show.title + '</div>'
    +   '<div style="font-size:13px;color:var(--muted)">' + (show.episode || '') + '</div>'
    + '</div>'
    + '<div style="font-size:13px;color:var(--muted);max-width:380px">This content has not been analysed yet. Start the analysis to access Content Analysis, Brand Safety and Test an Ad.</div>'
    + UI.badge('Not Analysed', 'var(--muted)', 'var(--subtle)')
    + '<div id="vod-analysis-action">'
    +   UI.btnPrimary('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><polygon points="5 3 19 12 5 21 5 3"/></svg> Start Analysis', 'vodStartAnalysis(' + show.id + ')')
    + '</div>'
    + '<div id="vod-analysis-progress" style="display:none;width:100%;max-width:480px">'
    +   vodAnalysisProgressHtml()
    + '</div>'
    + '</div>';
}

function vodAnalysisProgressHtml() {
  return '<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:20px;text-align:left">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
    +   '<span style="font-size:12px;font-weight:500;color:var(--muted)" id="vod-proc-status">Preparing analysis…</span>'
    +   '<span style="font-size:11px;font-weight:600;color:var(--accent)" id="vod-proc-pct">0%</span>'
    + '</div>'
    + '<div style="height:4px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:14px">'
    +   '<div id="vod-proc-bar" style="height:100%;width:0%;background:var(--accent);border-radius:4px;transition:width .3s"></div>'
    + '</div>'
    + '<div id="vod-proc-log" style="max-height:120px;overflow-y:auto;display:flex;flex-direction:column;gap:5px"></div>'
    + '</div>';
}

var VOD_PROC_STEPS = [
  { at: 10, msg: 'Extracting video metadata' },
  { at: 25, msg: 'Detecting scene boundaries' },
  { at: 40, msg: 'Running object recognition' },
  { at: 55, msg: 'Analysing sentiment & tone' },
  { at: 70, msg: 'Mapping IAB content categories' },
  { at: 85, msg: 'Applying brand safety classification' },
  { at: 95, msg: 'Generating analysis report' }
];

function vodStartAnalysis(id) {
  var show = CS_SHOWS.filter(function(s) { return s.id === id; })[0];
  if (!show) return;

  var actionEl = document.getElementById('vod-analysis-action');
  var progEl   = document.getElementById('vod-analysis-progress');
  if (actionEl) actionEl.style.display = 'none';
  if (progEl)   progEl.style.display   = '';

  var pct = 0, stepIdx = 0;
  var iv = setInterval(function() {
    pct = Math.min(pct + 2, 100);

    var bar    = document.getElementById('vod-proc-bar');
    var pctEl  = document.getElementById('vod-proc-pct');
    var statEl = document.getElementById('vod-proc-status');
    var logEl  = document.getElementById('vod-proc-log');

    if (bar)   bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';

    while (stepIdx < VOD_PROC_STEPS.length && pct >= VOD_PROC_STEPS[stepIdx].at) {
      if (statEl) statEl.textContent = VOD_PROC_STEPS[stepIdx].msg + '…';
      if (logEl) {
        var line = document.createElement('div');
        line.style.cssText = 'display:flex;align-items:center;gap:7px;font-size:11px;color:var(--muted)';
        line.innerHTML = '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" style="flex-shrink:0"><circle cx="6" cy="6" r="5.25" fill="rgba(46,173,75,.12)" stroke="#2EAD4B" stroke-width="1.2"/><path d="M3.5 6l1.8 1.8 3-3.3" stroke="#2EAD4B" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          + '<span>' + VOD_PROC_STEPS[stepIdx].msg + '</span>';
        logEl.appendChild(line);
        logEl.scrollTop = logEl.scrollHeight;
      }
      stepIdx++;
    }

    if (pct >= 100) {
      clearInterval(iv);
      show.analysed = true;
      if (statEl) statEl.textContent = 'Analysis complete';
      if (pctEl)  { pctEl.textContent = '100%'; pctEl.style.color = '#2EAD4B'; }
      setTimeout(function() { vodShowDetail(show); }, 600);
    }
  }, 80);
}

function csTx2Render() {
  var container = document.getElementById('cs-grid5');
  if (!container) return;

  var shows = CS_SHOWS.filter(function(s) {
    return csActiveTx2Filter === 'all' || s.category === csActiveTx2Filter;
  });

  if (csTx2ViewMode === 'table') {
    var TH = 'padding:9px 14px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border);text-align:left;white-space:nowrap';
    var TD = 'padding:10px 14px;font-size:13px;color:var(--text);border-bottom:1px solid var(--border)';
    var allShows = csNewItems3.concat(shows);
    var rows = allShows.map(function(s, i) {
      var isNew    = s.id >= 900;
      var isLast   = i === allShows.length - 1;
      var td       = isLast ? TD.replace('border-bottom:1px solid var(--border)', '') : TD;
      var catLabel = s.category ? (s.category.charAt(0).toUpperCase() + s.category.slice(1)) : '—';
      var pub      = s.publisher || '—';
      var ep       = s.episode   || '—';
      var newBadge = isNew
        ? '<span style="font-size:9px;font-weight:700;background:rgba(237,0,94,.1);color:var(--accent);border-radius:20px;padding:2px 7px;margin-left:7px;letter-spacing:.3px">NEW</span>'
        : '';
      return '<tr style="transition:background .1s;cursor:pointer" onclick="csTx2Select(' + s.id + ')" onmouseover="this.style.background=\'var(--bg)\'" onmouseout="this.style.background=\'\'">'
        + '<td style="' + td + '">'
        +   '<div style="display:flex;align-items:center;gap:12px">'
        +     '<div data-show-id="' + s.id + '" data-show-title="' + s.title + '" style="width:56px;height:32px;border-radius:5px;background:' + s.grad + ';background-size:cover;background-position:center;flex-shrink:0;overflow:hidden"></div>'
        +     '<div>'
        +       '<div style="font-weight:500;font-size:13px">' + s.title + newBadge + '</div>'
        +       '<div style="font-size:11px;color:var(--faint);margin-top:1px">' + ep + '</div>'
        +     '</div>'
        +   '</div>'
        + '</td>'
        + '<td style="' + td + 'color:var(--muted)">' + pub + '</td>'
        + '<td style="' + td + 'color:var(--muted)">' + catLabel + '</td>'
        + '<td style="' + td + 'color:var(--faint);font-size:12px">44:15</td>'
        + '<td style="' + td + '">' + (isNew || s.analysed ? UI.badge('Analysed', '#15803D', '#DCFCE7') : UI.badge('Not Analysed', 'var(--muted)', 'var(--subtle)')) + '</td>'
        + '<td style="' + td + 'text-align:right">'
        +   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color:var(--faint)"><path d="M9 18l6-6-6-6"/></svg>'
        + '</td>'
        + '</tr>';
    }).join('');

    container.setAttribute('style', '');
    container.className = '';
    container.innerHTML =
      '<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden">'
      + '<table style="width:100%;border-collapse:collapse">'
      + '<thead><tr>'
      +   '<th style="' + TH + '">Title</th>'
      +   '<th style="' + TH + '">Publisher</th>'
      +   '<th style="' + TH + '">Category</th>'
      +   '<th style="' + TH + '">Duration</th>'
      +   '<th style="' + TH + '">Status</th>'
      +   '<th style="' + TH + '"></th>'
      + '</tr></thead>'
      + '<tbody>' + rows + '</tbody>'
      + '</table>'
      + '</div>';
    csTx2LoadImages();
    return;
  }

  // ── Grid view (default) ──
  container.className = 'cs-grid';
  container.removeAttribute('style');

  function vodCard(s, isNew) {
    var ep        = s.episode   || '—';
    var pub       = s.publisher || '—';
    var cat       = s.category  ? s.category.charAt(0).toUpperCase() + s.category.slice(1) : '—';
    var badgeHtml = isNew
      ? '<div class="cs-vod-badge cs-vod-badge--new">NEW</div>'
      : '';
    return '<div class="cs-vod-card" onclick="csTx2Select(' + s.id + ')">'
      + '<div class="cs-vod-thumb" data-show-id="' + s.id + '" data-show-title="' + s.title + '" style="background:' + s.grad + '">'
      +   badgeHtml
      + '</div>'
      + '<div class="cs-vod-info">'
      +   '<div class="cs-vod-title">' + s.title + '</div>'
      +   '<div class="cs-vod-ep">' + ep + '</div>'
      +   '<div class="cs-vod-row"><span class="cs-vod-lbl">Publisher</span><span class="cs-vod-val">' + pub + '</span></div>'
      +   '<div class="cs-vod-row"><span class="cs-vod-lbl">Category</span><span class="cs-vod-val">' + cat + '</span></div>'
      +   '<div class="cs-vod-row"><span class="cs-vod-lbl">Status</span>' + (isNew || s.analysed ? UI.badge('Analysed', '#15803D', '#DCFCE7') : UI.badge('Not Analysed', 'var(--muted)', 'var(--subtle)')) + '</div>'
      + '</div>'
      + '</div>';
  }

  var newHtml      = csNewItems3.map(function(s) { return vodCard(s, true);  }).join('');
  var existingHtml = shows.map(function(s)        { return vodCard(s, false); }).join('');
  container.innerHTML = newHtml + existingHtml;
  csTx2LoadImages();
}

function csTx2LoadImages() {
  var posters = document.querySelectorAll('[data-show-id]');
  posters.forEach(function(poster) {
    var id    = poster.getAttribute('data-show-id');
    var title = poster.getAttribute('data-show-title');
    if (!title) return;
    // Apply cached image immediately
    if (csUnsplashCache[id]) {
      csApplyPosterImage(poster, csUnsplashCache[id]);
      return;
    }
    // Fetch from proxy
    fetch('/api/unsplash?q=' + encodeURIComponent('TV Show ' + title))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.url) {
          csUnsplashCache[id] = data.url;
          csApplyPosterImage(poster, data.url);
        }
      })
      .catch(function() { /* keep gradient fallback */ });
  });
}

function csApplyPosterImage(poster, url) {
  poster.style.backgroundImage    = 'url(' + url + ')';
  poster.style.backgroundSize     = 'cover';
  poster.style.backgroundPosition = 'center';
  // Hide fallback text/initials
  var initials = poster.querySelector('.cs-poster-initials');
  if (initials) initials.style.opacity = '0';
  else poster.style.color = 'transparent';
}

function sdtInjectStyles() {
  if (document.getElementById('sdt-styles')) return;
  var s = document.createElement('style');
  s.id = 'sdt-styles';
  s.textContent = `
    .tx-bc-link { font-size:12px; color:var(--muted); cursor:pointer; transition:color .15s; }
    .tx-bc-link:hover { color:var(--accent); }

    /* Sidebar shell */
    .sdt-sb {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 6px;
      transition: width .2s;
    }
    .sdt-sb-divider {
      height: 1px;
      background: var(--border);
      margin: 4px 6px;
      transition: margin .2s;
    }
    .sdt-sb-tog {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      margin-top: 4px;
      border-radius: 6px;
      cursor: pointer;
      color: var(--faint);
      transition: background .13s, color .13s;
    }
    .sdt-sb-tog:hover { background: var(--bg); color: var(--muted); }

    /* Nav items */
    .sdt-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background .13s;
      margin-bottom: 2px;
      overflow: hidden;
    }
    .sdt-nav-item:hover { background: var(--bg); }
    .sdt-nav-item--act  { background: var(--subtle); }
    .sdt-nav-item--act .sdt-nav-num   { background: var(--accent); color: #fff; }
    .sdt-nav-item--act .sdt-nav-label { color: var(--accent); }
    .sdt-nav-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--bg);
      color: var(--muted);
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background .13s, color .13s;
    }
    .sdt-nav-text {
      overflow: hidden;
      transition: opacity .15s, max-width .2s;
      max-width: 180px;
      white-space: nowrap;
    }
    .sdt-nav-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--text);
      line-height: 1.3;
      transition: color .13s;
    }
    .sdt-nav-sub {
      font-size: 11px;
      color: var(--faint);
      line-height: 1.2;
    }

    /* Collapsed state */
    .sdt-sb--col .sdt-nav-item { padding: 10px 0; justify-content: center; gap: 0; }
    .sdt-sb--col .sdt-nav-text { opacity: 0; max-width: 0; }
    .sdt-sb--col .sdt-sb-divider { margin: 4px 8px; }

    .sdt-panel-title {
      font-size: 15px;
      font-weight: 500;
      letter-spacing: -.3px;
      margin-bottom: 6px;
    }
    .sdt-panel-sub {
      font-size: 13px;
      color: var(--muted);
    }

    /* Content Selection */
    .cs-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    .cs-toolbar {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 12px;
    }
    .cs-request-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      height: 28px;
      padding: 0 10px;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity .15s;
      flex-shrink: 0;
    }
    .cs-request-btn:hover { opacity: .88; }
    .cs-view-toggle {
      display: flex;
      gap: 2px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 3px;
      width: fit-content;
    }
    .cs-view-btn {
      height: 28px;
      padding: 0 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      color: var(--muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: background .13s, color .13s;
      user-select: none;
    }
    .cs-view-btn:hover { color: var(--text); }
    .cs-view-btn--act {
      background: var(--bg);
      color: var(--text);
      box-shadow: 0 1px 3px rgba(0,0,0,.07);
    }

    /* Taxonomy v2 detail view: panels shrink to fit, no horizontal scroll */
    #tx2-content-area .cs-dv-panel { min-width: 0; }

    /* ── Taxonomy Explorer: Upload form ── */
    .tx2-upload-wrap {
      max-width: 540px;
      margin: 0 auto;
      padding: 8px 0 24px;
    }
    .tx2-opt-row {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .tx2-opt {
      flex: 1;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 9px 12px;
      border: 1.5px solid var(--border-md);
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      color: var(--muted);
      transition: border-color .15s, background .15s, color .15s;
      user-select: none;
      white-space: nowrap;
    }
    .tx2-opt:hover { border-color: var(--accent); color: var(--text); background: var(--bg); }
    .tx2-opt--act  { border-color: var(--accent); color: var(--accent); background: rgba(237,0,94,.04); }
    .tx2-seg {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 30px;
      padding: 0 10px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      color: var(--muted);
      transition: background .13s, color .13s;
      user-select: none;
      white-space: nowrap;
    }
    .tx2-seg:hover { color: var(--text); }
    .tx2-seg--act  { background: var(--surface); color: var(--accent); box-shadow: 0 1px 3px rgba(0,0,0,.07); }
    .tx2-upload-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 32px 20px;
      border: 1.5px dashed var(--border-md);
      border-radius: 10px;
      cursor: pointer;
      background: var(--bg);
      text-align: center;
      transition: border-color .15s, background .15s;
    }
    .tx2-upload-zone:hover { border-color: var(--accent); background: rgba(237,0,94,.025); }

    /* ── Taxonomy Explorer: Library ── */
    .tx2-home-tab {
      font-size: 12px; font-weight: 500; color: var(--muted);
      padding: 8px 12px 9px; cursor: pointer; border-bottom: 2px solid transparent;
      margin-bottom: -1px; transition: color .15s;
    }
    .tx2-home-tab:hover { color: var(--text); }
    .tx2-home-tab--act  { color: var(--text); border-bottom-color: var(--accent); }

    .tx2-lib-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: background .13s;
      border-bottom: 1px solid var(--border);
    }
    .tx2-lib-row:last-child { border-bottom: none; }
    .tx2-lib-row:hover { background: var(--bg); }
    .tx2-lib-icon {
      width: 30px;
      height: 30px;
      border-radius: 7px;
      background: var(--bg);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted);
      flex-shrink: 0;
    }
    .tx2-lib-load-btn {
      height: 26px;
      padding: 0 12px;
      border: 1px solid var(--border-md);
      border-radius: 6px;
      background: var(--surface);
      font-size: 11px;
      font-weight: 500;
      font-family: inherit;
      color: var(--muted);
      cursor: pointer;
      transition: border-color .13s, color .13s, background .13s;
    }
    .tx2-lib-load-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(237,0,94,.04); }

    /* ── Taxonomy Explorer: Progress ── */
    .tx2-progress-wrap {
      max-width: 400px;
      margin: 60px auto 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      text-align: center;
    }
    .tx2-progress-icon { position: relative; width: 64px; height: 64px; }
    .tx2-progress-icon svg { width: 64px; height: 64px; }
    .tx2-progress-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: -.3px;
    }
    .tx2-progress-step {
      font-size: 12px;
      color: var(--muted);
      min-height: 18px;
      transition: opacity .2s;
    }
    .tx2-progress-track {
      width: 100%;
      height: 6px;
      background: var(--bg);
      border-radius: 99px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .tx2-progress-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 99px;
      transition: width .1s linear;
    }
    .tx2-progress-pct {
      font-size: 11px;
      font-weight: 600;
      color: var(--accent);
      letter-spacing: .3px;
    }

    /* Taxonomies sub-nav: override tabs → buttons (detail view + sidebar Taxonomy Explorer view) */
    #cs-dv-tab-content-taxonomies .tx-ctabs-nav,
    #tx2-sub-content-taxonomies .tx-ctabs-nav {
      gap: 6px;
      flex-wrap: wrap;
      border-bottom: none;
      padding-bottom: 0;
      margin-bottom: 12px;
    }
    #cs-dv-tab-content-taxonomies .tx-ctab,
    #tx2-sub-content-taxonomies .tx-ctab {
      border: none;
      border-radius: 6px;
      background: var(--bg);
      padding: 4px 10px;
      height: auto;
      font-size: 11px;
      font-weight: 500;
      color: var(--muted);
      cursor: pointer;
      transition: background .13s, color .13s;
      margin-bottom: 0;
    }
    #cs-dv-tab-content-taxonomies .tx-ctab:hover,
    #tx2-sub-content-taxonomies .tx-ctab:hover {
      background: var(--subtle);
      color: var(--accent);
    }
    #cs-dv-tab-content-taxonomies .tx-ctab--act,
    #tx2-sub-content-taxonomies .tx-ctab--act {
      background: var(--subtle);
      color: var(--accent);
    }

    /* Taxonomy v2 dashboard: topbar */
    .tx2-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
      background: var(--surface);
    }
    .tx2-topbar-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tx2-logo-mark {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -.5px;
      line-height: 1;
    }
    .tx2-topbar-title {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -.3px;
      color: var(--text);
    }
    .tx2-topbar-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tx2-icon-btn {
      position: relative;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background .13s, color .13s, border-color .13s;
    }
    .tx2-icon-btn:hover { background: var(--surface); color: var(--text); border-color: var(--border-md); }
    .tx2-notif-dot {
      position: absolute;
      top: 6px;
      right: 7px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
      border: 1.5px solid var(--bg);
    }

    /* Taxonomy v2 dashboard: sidebar */
    .tx2-sidebar {
      width: 200px;
      flex-shrink: 0;
      background: var(--surface);
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .tx2-sidebar-section {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .8px;
      color: var(--faint);
      padding: 4px 10px 8px;
    }

    /* Taxonomy v2 sidebar nav items */
    .tx2-nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--muted);
      cursor: pointer;
      transition: background .13s, color .13s;
    }
    .tx2-nav-item:hover { background: var(--bg); color: var(--text); }
    .tx2-nav-item--act  { background: var(--subtle); color: var(--accent); }

    /* Detail view tab nav (Taxonomy Explorer v1) */
    .cs-dv-tabnav {
      display: flex;
      gap: 2px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 2px;
    }
    .cs-dv-tab {
      height: 34px;
      padding: 0 16px;
      border: none;
      background: none;
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
      color: var(--muted);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color .13s, border-color .13s;
      white-space: nowrap;
    }
    .cs-dv-tab:hover { color: var(--text); }
    .cs-dv-tab--act  { color: var(--accent); border-bottom-color: var(--accent); }
    /* AI conversational params */
    .ai-trigger {
      display: inline; cursor: pointer; padding: 0 2px; border-radius: 2px;
      color: #bbb; font-weight: 500;
      text-decoration: underline dotted #bbb;
      text-underline-offset: 2px;
      transition: color .15s, background .15s, text-decoration-color .15s;
    }
    .ai-trigger:hover { color: #e11d8f; text-decoration-color: #e11d8f; background: #fdf2f8; }
    .ai-trigger--set  { color: #e11d8f; font-weight: 600; text-decoration: underline solid #e11d8f; text-underline-offset: 2px; }
    .ai-trigger--set:hover { background: #fdf2f8; }
    /* Dual range slider */
    .ai-range {
      position: absolute; width: 100%; height: 100%; top: 0; margin: 0; padding: 0;
      background: transparent; border: none; outline: none; pointer-events: none;
      -webkit-appearance: none; appearance: none;
    }
    .ai-range::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none; pointer-events: all;
      width: 16px; height: 16px; border-radius: 50%;
      background: #e11d8f; cursor: pointer;
      box-shadow: 0 1px 4px rgba(225,29,143,.35);
      border: 2px solid #fff;
    }
    .ai-range::-moz-range-thumb {
      pointer-events: all; width: 14px; height: 14px; border-radius: 50%;
      background: #e11d8f; cursor: pointer; border: 2px solid #fff;
      box-shadow: 0 1px 4px rgba(225,29,143,.35);
    }
    .ai-mode-btn {
      flex: 1; height: 26px; border: none; background: none;
      font-size: 11px; font-weight: 500; font-family: inherit;
      color: var(--muted); cursor: pointer; border-radius: 5px;
      transition: color .12s, background .12s; white-space: nowrap;
    }
    .ai-mode-btn:hover { color: var(--text); }
    .ai-mode-btn--act  { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .ai-check-pill {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border: 1px solid var(--border); border-radius: 20px;
      font-size: 11px; cursor: pointer; user-select: none; color: var(--muted);
      transition: border-color .12s, color .12s, background .12s;
    }
    .ai-check-pill input { display: none; }
    .ai-input {
      height: 30px; border: 1px solid var(--border-md); border-radius: 6px;
      padding: 0 9px; font-size: 12px; font-family: inherit;
      color: var(--text); background: var(--bg); outline: none; box-sizing: border-box;
    }
    .ai-input:focus { border-color: #e11d8f; }
    .cs-dv-tab--ai       { color: #c026d3; display: flex; align-items: center; gap: 5px; }
    .cs-dv-tab--ai:hover { color: #a21caf; }
    .cs-dv-tab--ai.cs-dv-tab--act { color: #c026d3; border-bottom-color: #c026d3; }

    /* Inventory filter panel */
    .inv-fp-acc { border-bottom: 1px solid var(--border); }
    .inv-fp-acc:last-child { border-bottom: none; }
    .inv-fp-acc-hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 0; cursor: pointer;
      font-size: 12px; font-weight: 500; color: var(--text);
      user-select: none;
    }
    .inv-fp-acc-hdr:hover { color: var(--accent); }
    .inv-fp-chevron { transition: transform .18s; color: var(--faint); flex-shrink: 0; }
    .inv-fp-chevron.open { transform: rotate(180deg); }
    .inv-fp-search {
      width: 100%; box-sizing: border-box;
      padding: 6px 9px; margin-bottom: 8px;
      border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg); color: var(--text); font-size: 11px;
      outline: none; font-family: inherit;
    }
    .inv-fp-search:focus { border-color: var(--accent); }
    .inv-fp-opt {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 0; cursor: pointer; font-size: 12px; color: var(--text);
    }
    .inv-fp-opt input[type=checkbox] { accent-color: var(--accent); cursor: pointer; flex-shrink:0; }
    .inv-fp-opt:hover span { color: var(--accent); }

    /* Inventory cards */
    .inv-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      transition: border-color .15s, box-shadow .15s;
    }
    .inv-card:hover { border-color: var(--border-md); box-shadow: 0 2px 8px rgba(0,0,0,.07); }
    .inv-item--sel.inv-card { border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 18%, transparent); }
    tr.inv-item--sel td { background: color-mix(in srgb, var(--accent) 5%, transparent); }

    /* Inventory filter chips */
    .inv-chip {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 11px; color: var(--accent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
      border-radius: 20px; padding: 3px 10px;
    }
    .inv-chip span { font-size: 14px; line-height: 1; opacity: .7; }
    .inv-chip span:hover { opacity: 1; }

    /* Inventory view toggle buttons */
    .inv-view-btn {
      display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--surface);
      color: var(--faint);
      cursor: pointer;
      transition: color .15s, border-color .15s, background .15s;
    }
    .inv-view-btn:hover { color: var(--muted); border-color: var(--border-md); }
    .inv-view-btn--act  { color: var(--accent); border-color: var(--accent); background: var(--bg); }

    /* Enable Features checkboxes */
    .cs-features-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      margin-top: 8px;
    }
    .cs-feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text);
      cursor: pointer;
      user-select: none;
    }
    .cs-feature-cb {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
      accent-color: var(--accent);
      cursor: pointer;
    }

    /* Modal */
    .cs-modal-overlay {
      position: fixed; inset: 0;
      background: rgba(13,30,54,.45);
      z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity .2s;
      isolation: isolate;
    }
    .cs-modal-overlay--in { opacity: 1; }
    .cs-modal {
      background: var(--surface);
      border-radius: 14px;
      width: 720px;
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 64px);
      display: flex; flex-direction: column;
      box-shadow: 0 12px 48px rgba(0,0,0,.18);
      transform: translateY(8px); transition: transform .2s;
      position: relative; z-index: 10000;
    }
    .cs-modal-overlay--in .cs-modal { transform: translateY(0); }
    .cs-modal-header {
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
      flex-shrink: 0;
    }
    .cs-modal-title { font-size: 16px; font-weight: 500; letter-spacing: -.3px; color: var(--text); }
    .cs-modal-sub   { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .cs-modal-close {
      width: 28px; height: 28px; border-radius: 6px; border: none;
      background: none; cursor: pointer; color: var(--faint);
      display: flex; align-items: center; justify-content: center;
      transition: background .13s, color .13s; flex-shrink: 0;
    }
    .cs-modal-close:hover { background: var(--bg); color: var(--text); }
    .cs-modal-body {
      padding: 18px 20px;
      overflow-y: auto;
      display: flex; flex-direction: column; gap: 14px;
    }
    .cs-modal-footer {
      padding: 14px 20px;
      border-top: 1px solid var(--border);
      display: flex; justify-content: flex-end; gap: 8px;
      flex-shrink: 0;
    }
    .cs-field { display: flex; flex-direction: column; gap: 5px; }
    .cs-field-row { display: flex; align-items: center; justify-content: space-between; }
    .cs-label {
      font-size: 11px; font-weight: 500; text-transform: uppercase;
      letter-spacing: .4px; color: var(--muted);
    }
    .cs-mandatory { color: var(--accent); }
    .cs-field-note { font-size: 10px; color: var(--faint); font-style: italic; }
    .cs-input {
      height: 36px; border: 1px solid var(--border-md); border-radius: 8px;
      padding: 0 11px; font-size: 13px; font-family: inherit; color: var(--text);
      background: var(--surface); outline: none; transition: border .15s, box-shadow .15s;
    }
    .cs-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(237,0,94,.1); }
    .cs-input--disabled { background: var(--bg); color: var(--muted); cursor: not-allowed; }
    .cs-input--error { border-color: #E5243B !important; box-shadow: 0 0 0 3px rgba(229,36,59,.1) !important; }
    .cs-textarea {
      border: 1px solid var(--border-md); border-radius: 8px;
      padding: 9px 11px; font-size: 13px; font-family: inherit; color: var(--text);
      background: var(--surface); outline: none; resize: vertical; min-height: 80px;
      transition: border .15s, box-shadow .15s;
    }
    .cs-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(237,0,94,.1); }
    .cs-ads-toggle {
      display: flex; gap: 3px;
      background: var(--bg); border-radius: 7px; padding: 3px; width: fit-content;
    }
    .cs-ads-btn {
      height: 26px; padding: 0 14px; border-radius: 5px;
      font-size: 11px; font-weight: 500; color: var(--muted);
      cursor: pointer; display: flex; align-items: center;
      transition: all .13s; user-select: none;
    }
    .cs-ads-btn--act { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,.07); }
    .cs-btn-secondary {
      height: 34px; padding: 0 16px; background: none;
      border: 1px solid var(--border-md); border-radius: 8px;
      font-size: 13px; font-weight: 500; font-family: inherit;
      color: var(--muted); cursor: pointer; transition: border-color .13s, color .13s;
    }
    .cs-btn-secondary:hover { border-color: var(--text); color: var(--text); }
    .cs-btn-primary {
      height: 34px; padding: 0 18px; background: var(--accent);
      border: none; border-radius: 8px;
      font-size: 13px; font-weight: 500; font-family: inherit;
      color: #fff; cursor: pointer; transition: opacity .13s;
    }
    .cs-btn-primary:hover { opacity: .88; }

    /* Content upload area */
    .cs-upload-area {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 6px; padding: 20px 16px;
      border: 1.5px dashed var(--border-md); border-radius: 10px;
      cursor: pointer; transition: border-color .15s, background .15s;
      background: var(--bg); text-align: center;
    }
    .cs-upload-area:hover { border-color: var(--accent); background: rgba(237,0,94,.03); }
    .cs-upload-area--error { border-color: #E5243B; background: rgba(229,36,59,.04); }
    #cs-upload-chosen {
      display: flex; align-items: center; gap: 8px; justify-content: center;
    }
    .cs-upload-text { font-size: 12px; font-weight: 500; color: var(--muted); word-break: break-all; }
    .cs-upload-hint { font-size: 11px; color: var(--faint); }

    /* Toggle sticky wrapper */
    .cs-toggle-sticky {
      position: sticky;
      top: 0;
      z-index: 20;
      background: var(--bg);
      padding: 2px 0 12px;
      margin-bottom: 0;
    }

    /* Workflow */
    .wf-legend-sticky {
      position: sticky;
      top: 50px;
      z-index: 10;
      background: var(--bg);
      padding-bottom: 12px;
    }
    .wf-legend {
      display: flex; flex-wrap: wrap; gap: 16px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; padding: 12px 16px;
    }
    .wf-legend-item { display: flex; align-items: center; gap: 6px; }
    .wf-legend-dot  { width: 10px; height: 10px; border-radius: 50%; flex-shrink:0; }
    .wf-legend-name { font-size: 12px; }
    .wf-legend-members { font-size: 11px; color: var(--faint); }

    /* Horizontal scroll flowchart */
    .wf-scroll-outer {
      overflow-x: auto;
      padding-bottom: 12px;
    }
    .wf-scroll-outer::-webkit-scrollbar { height: 5px; }
    .wf-scroll-outer::-webkit-scrollbar-track { background: var(--bg); border-radius: 3px; }
    .wf-scroll-outer::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 3px; }
    .wf-row-h {
      display: flex;
      align-items: stretch;
    }
    .wf-node {
      width: 210px;
      flex-shrink: 0;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; overflow: hidden;
      display: flex; flex-direction: column;
      transition: box-shadow .15s;
    }
    .wf-node:hover { box-shadow: 0 2px 14px rgba(0,0,0,.08); }
    .wf-node-bar { height: 5px; flex-shrink: 0; }
    .wf-node-body {
      padding: 12px 13px; display: flex; flex-direction: column;
      gap: 4px; flex: 1;
    }
    .wf-node-num { font-size: 9px; text-transform: uppercase; letter-spacing: .5px; color: var(--faint); }
    .wf-node-title { font-size: 12px; font-weight: 600; color: var(--text); line-height: 1.3; }
    .wf-node-desc { font-size: 11px; color: var(--muted); line-height: 1.45; flex: 1; }
    .wf-node-pills { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 6px; }
    .wf-pill {
      font-size: 9px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .3px; padding: 2px 7px; border-radius: 20px;
    }
    .wf-arrow-h {
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; width: 28px;
    }
    .cs-title {
      font-size: 20px;
      font-weight: 500;
      letter-spacing: -.4px;
      color: var(--text);
      margin-bottom: 16px;
    }
    .cs-filter-row { margin-bottom: 20px; }
    .cs-filter-wrap {
      display: inline-flex;
      flex-direction: column;
      gap: 4px;
    }
    .cs-filter-label {
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: .5px;
      color: var(--accent);
    }
    .cs-filter-select {
      height: 34px;
      min-width: 140px;
      border: 1.5px solid var(--accent);
      border-radius: 7px;
      padding: 0 28px 0 10px;
      font-size: 13px;
      font-family: inherit;
      color: var(--text);
      background: var(--surface);
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23ED005E' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 9px center;
    }
    /* ── VoD card grid ── */
    .cs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(172px, 1fr));
      gap: 14px;
    }
    .cs-vod-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: box-shadow .15s, border-color .15s;
    }
    .cs-vod-card:hover { border-color: var(--border-md); box-shadow: 0 4px 16px rgba(0,0,0,.08); }
    .cs-vod-card--sel  { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(237,0,94,.15); }
    .cs-vod-thumb {
      width: 100%;
      aspect-ratio: 16/9;
      background-size: cover;
      background-position: center;
      position: relative;
      transition: background-image .2s;
    }
    .cs-vod-info { padding: 12px 14px 14px; }
    .cs-vod-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 2px;
    }
    .cs-vod-ep {
      font-size: 11px;
      color: var(--muted);
      margin-bottom: 10px;
    }
    .cs-vod-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 0;
      border-top: 1px solid var(--border);
      gap: 8px;
    }
    .cs-vod-lbl {
      font-size: 10px;
      font-weight: 500;
      color: var(--faint);
      text-transform: uppercase;
      letter-spacing: .4px;
      flex-shrink: 0;
    }
    .cs-vod-val {
      font-size: 11px;
      color: var(--text);
      text-align: right;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cs-vod-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      font-size: 9px;
      font-weight: 700;
      color: #fff;
      background: rgba(0,0,0,.55);
      padding: 2px 7px;
      border-radius: 20px;
      letter-spacing: .4px;
      text-transform: uppercase;
      backdrop-filter: blur(4px);
    }
    .cs-vod-badge--new { background: var(--accent); }

    /* ── VoD Scorecards ── */
    .vod-sc-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .vod-sc-val {
      font-size: 22px;
      font-weight: 600;
      letter-spacing: -0.5px;
      color: var(--text);
      line-height: 1.2;
    }
    .vod-sc-val--err { color: #E5243B; }
    .vod-sc-lbl {
      font-size: 11px;
      color: var(--muted);
    }

    /* ── VoD filter chips ── */
    .vod-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 500;
      color: var(--accent);
      background: rgba(237,0,94,.08);
      border: 1px solid rgba(237,0,94,.22);
      border-radius: 20px;
      padding: 3px 8px 3px 10px;
      white-space: nowrap;
    }

    /* ── Legacy poster (used in detail/modal views) ── */
    .cs-thumb {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      width: 80px;
    }
    .cs-poster {
      width: 80px;
      height: 108px;
      border-radius: 7px;
      overflow: hidden;
      position: relative;
      border: 2px solid transparent;
      transition: border-color .15s, transform .12s;
      background: var(--bg);
    }
    .cs-thumb:hover .cs-poster { transform: scale(1.03); }
    .cs-thumb--sel .cs-poster  { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(237,0,94,.2); }
    .cs-thumb-title {
      font-size: 11px;
      color: var(--text);
      text-align: center;
      line-height: 1.3;
      word-break: break-word;
    }
    .cs-poster-initials {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 600;
      color: rgba(255,255,255,.7);
      letter-spacing: 1px;
    }
    .cs-badge {
      position: absolute;
      top: 6px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 7px;
      font-weight: 600;
      color: #fff;
      background: rgba(0,0,0,.5);
      padding: 2px 4px;
      letter-spacing: .4px;
      text-transform: uppercase;
    }
    .cs-badge--new {
      background: var(--accent);
      box-shadow: 0 1px 4px rgba(237,0,94,.4);
      animation: cs-badge-pop .3s ease;
    }
    @keyframes cs-badge-pop {
      from { transform: scale(.7); opacity: 0; }
      to   { transform: scale(1);  opacity: 1; }
    }
    .cs-thumb--bump {
      animation: cs-thumb-bump .5s cubic-bezier(.36,.07,.19,.97);
    }
    @keyframes cs-thumb-bump {
      0%   { transform: scale(1)    translateY(0);   opacity: .4; }
      30%  { transform: scale(1.12) translateY(-6px); opacity: 1; }
      55%  { transform: scale(.97)  translateY(1px);  opacity: 1; }
      75%  { transform: scale(1.04) translateY(-2px); opacity: 1; }
      100% { transform: scale(1)    translateY(0);   opacity: 1; }
    }

    /* ── Detail View ─────────────────────────────── */
    .cs-dv-topbar {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .cs-dv-back {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      font-size: 11px;
      font-weight: 600;
      color: var(--accent);
      cursor: pointer;
      padding: 0;
      white-space: nowrap;
      font-family: inherit;
      letter-spacing: .4px;
      text-transform: uppercase;
    }
    .cs-dv-back:hover { opacity: .75; }
    .cs-dv-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: .3px;
      flex: 1;
      text-transform: uppercase;
    }
    .cs-dv-collapse {
      width: 26px; height: 26px;
      background: none; border: 1px solid var(--border);
      border-radius: 6px; cursor: pointer; color: var(--muted);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background .13s;
    }
    .cs-dv-collapse:hover { background: var(--bg); }
    /* panels strip — flush, no gaps, clipped by outer border-radius */
    .cs-dv-panel {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 220px;
      overflow: hidden;
      border-right: 1px solid var(--border);
    }
    .cs-dv-panel--dark {
      background: #0f1623;
      border-right-color: #1e2a3a;
    }
    .cs-dv-panel--last { border-right: none; }
    .cs-dv-panel-hd {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 12px;
      border-bottom: 1px solid var(--border);
      font-size: 12px;
      font-weight: 600;
      color: var(--text);
      flex-shrink: 0;
      background: var(--surface);
    }
    .cs-dv-panel-hd--dark {
      border-bottom-color: #1e2a3a;
      color: #e2e8f0;
      background: #0f1623;
    }
    .cs-dv-panel-sub {
      padding: 8px 12px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
    }
    .cs-dv-panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
      background: var(--surface);
    }
    .cs-dv-panel-body::-webkit-scrollbar { width: 3px; }
    .cs-dv-panel-body::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 2px; }
    .cs-dv-panel-body--dark {
      padding: 12px;
      background: #0f1623;
    }
    .cs-dv-panel-ico {
      background: none; border: none; cursor: pointer;
      color: var(--accent); font-size: 12px; padding: 2px 3px;
      border-radius: 3px; line-height: 1;
      transition: background .12s;
    }
    .cs-dv-panel-ico:hover { background: rgba(237,0,94,.08); }
    .cs-dv-panel-ico--dm { color: #64748b; }
    .cs-dv-panel-ico--dm:hover { background: rgba(255,255,255,.07); color: #94a3b8; }
    .cs-dv-panel-ico--red { color: var(--accent); }
    .cs-dv-scene {
      padding: 9px 12px;
      border-bottom: 1px solid var(--border);
    }
    .cs-dv-scene:last-child { border-bottom: none; }
    .cs-dv-scene-num  { font-size: 10px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; margin-bottom: 2px; }
    .cs-dv-scene-tax  { font-size: 11px; color: var(--muted); margin-bottom: 5px; }
    .cs-dv-scene-badge {
      display: inline-block;
      background: rgba(237,0,94,.07);
      color: var(--accent);
      border: 1px solid rgba(237,0,94,.15);
      font-size: 11px; font-weight: 500;
      padding: 2px 8px; border-radius: 20px;
      margin-bottom: 5px;
    }
    .cs-dv-scene-meta { font-size: 11px; color: var(--muted); line-height: 1.5; }
    .cs-dv-scene-meta--val { color: var(--text); font-weight: 500; }
    .cs-dv-product {
      display: flex;
      gap: 10px;
      padding: 9px 12px;
      border-bottom: 1px solid var(--border);
      align-items: flex-start;
    }
    .cs-dv-product:last-child { border-bottom: none; }
    .cs-dv-prod-img {
      width: 44px; height: 44px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
    }
    .cs-dv-prod-info { flex: 1; min-width: 0; }
    .cs-dv-prod-name  { font-size: 11.5px; font-weight: 500; color: var(--text); line-height: 1.35; margin-bottom: 3px; }
    .cs-dv-prod-det   { font-size: 11px; color: var(--muted); margin-bottom: 3px; }
    .cs-dv-prod-price { font-size: 12px; font-weight: 600; color: var(--text); }
    .cs-dv-prod-scene { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .cs-dv-json-pre {
      font-size: 11px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      line-height: 1.65;
      color: #94a3b8;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
    }
    .cs-dv-json-key { color: #7dd3fc; }
    .cs-dv-json-str { color: #f9a8d4; }
    .cs-dv-json-num { color: #86efac; }
    /* Detail view select (neutral border, no accent) */
    .cs-dv-select {
      height: 34px;
      border: 1.5px solid var(--border-md);
      border-radius: 7px;
      padding: 0 28px 0 10px;
      font-size: 13px;
      font-family: inherit;
      color: var(--text);
      background: var(--surface);
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 9px center;
    }
    .cs-dv-select:focus { border-color: var(--border-md); box-shadow: 0 0 0 3px rgba(107,114,128,.1); }

    /* Toggle buttons: rounded square, subtle bg, no border */
    .cs-dv-tog {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      border-radius: 8px;
      border: none;
      background: none;
      color: var(--muted);
      cursor: pointer;
      font-family: inherit;
      transition: all .13s;
    }
    .cs-dv-tog:hover { background: var(--subtle); color: var(--accent); }
    .cs-dv-tog--act  { background: var(--subtle); color: var(--accent); }

    /* Processing step */
    .cs-proc-preview {
      display: flex;
      align-items: center;
      gap: 14px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px;
    }
    .cs-proc-thumb {
      width: 80px;
      height: 52px;
      border-radius: 7px;
      background: linear-gradient(135deg, #1a1f2e 0%, #0d1220 50%, #1a2035 100%);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }
    .cs-proc-thumb::before,
    .cs-proc-thumb::after {
      content: '';
      position: absolute;
      top: 0; bottom: 0;
      width: 8px;
      background: repeating-linear-gradient(
        to bottom,
        rgba(255,255,255,.15) 0px,
        rgba(255,255,255,.15) 5px,
        transparent 5px,
        transparent 9px
      );
    }
    .cs-proc-thumb::before { left: 0; }
    .cs-proc-thumb::after  { right: 0; }
    .cs-proc-thumb-inner { position: relative; z-index: 1; }
    .cs-proc-meta {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }
    .cs-proc-fname {
      font-size: 12px;
      font-weight: 500;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cs-proc-fsize {
      font-size: 11px;
      color: var(--muted);
    }
    .cs-proc-bar-section {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .cs-proc-bar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .cs-proc-status-label {
      font-size: 12px;
      color: var(--muted);
      font-style: italic;
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cs-proc-pct-badge {
      font-size: 11px;
      font-weight: 600;
      color: var(--accent);
      flex-shrink: 0;
      transition: color .3s;
      min-width: 32px;
      text-align: right;
    }
    .cs-proc-bar-track {
      height: 5px;
      background: var(--border);
      border-radius: 99px;
      overflow: hidden;
    }
    .cs-proc-bar-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 99px;
      transition: width .1s linear;
    }
    .cs-proc-log {
      display: flex;
      flex-direction: column;
      gap: 5px;
      max-height: 120px;
      overflow-y: auto;
      padding: 2px 0;
    }
    .cs-proc-log::-webkit-scrollbar { width: 3px; }
    .cs-proc-log::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 2px; }
    .cs-proc-log-line {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 11.5px;
      color: var(--muted);
      animation: cs-log-in .2s ease;
    }
    @keyframes cs-log-in {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .cs-proc-success-box {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: rgba(46,173,75,.06);
      border: 1px solid rgba(46,173,75,.25);
      border-radius: 8px;
      animation: cs-succ-in .35s ease;
    }
    @keyframes cs-succ-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .cs-proc-success-title {
      font-size: 12px;
      font-weight: 600;
      color: #2EAD4B;
    }
    .cs-proc-success-sub {
      font-size: 11px;
      color: var(--muted);
      line-height: 1.4;
      margin-top: 1px;
    }

    /* Stepper */
    .cs-stepper {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .cs-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .cs-step-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1.5px solid var(--border-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
      transition: all .2s;
    }
    .cs-step-label {
      font-size: 10px;
      font-weight: 500;
      color: var(--muted);
      white-space: nowrap;
    }
    .cs-step--act .cs-step-circle {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }
    .cs-step--act .cs-step-label {
      color: var(--accent);
      font-weight: 600;
    }
    .cs-step--done .cs-step-circle {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }
    .cs-step--done .cs-step-label {
      color: var(--accent);
    }
    .cs-step-line {
      flex: 1;
      height: 1.5px;
      background: var(--border);
      margin: 0 8px;
      margin-bottom: 18px;
    }

    /* Upload spinner */
    .cs-upload-spinner {
      width: 22px;
      height: 22px;
      border: 2px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: cs-spin .7s linear infinite;
    }
    @keyframes cs-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(s);
}

// ── OLV Analysis — placeholder ────────────────────────────────────────────────
function renderOlvAnalysis() {
  var ca = document.getElementById('content-area');
  if (!ca) return;
  ca.innerHTML = '<div class="page-header"><div>'
    + '<div class="ptitle">OLV Analysis</div>'
    + '<div class="psub">Online Video analysis and inventory intelligence — coming soon.</div>'
    + '</div></div>'
    + '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;'
    + 'min-height:320px;gap:16px;color:var(--faint)">'
    + '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">'
    + '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>'
    + '</svg>'
    + '<div style="font-size:15px;font-weight:500;color:var(--muted);letter-spacing:-.2px">OLV Analysis</div>'
    + '<div style="font-size:13px;color:var(--faint);text-align:center;max-width:340px;line-height:1.6">'
    + 'Online Video inventory analysis and moment detection will be available here.'
    + '</div>'
    + '</div>';
}

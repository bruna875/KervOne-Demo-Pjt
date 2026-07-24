// app.js — navigation, routing, events, init

// ── Global driver color system ─────────────────────────────────────────────
var KERV_DRIVER_PALETTE = [
  '#ED005E', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#3B82F6',
  '#84CC16', '#A855F7'
];

function kervDriverColor(name) {
  if (!name || name === '—') return '#8E8E93';
  var h = 0;
  for (var i = 0; i < name.length; i++) { h = (h * 31 + name.charCodeAt(i)) >>> 0; }
  return KERV_DRIVER_PALETTE[h % KERV_DRIVER_PALETTE.length];
}

// ── Shared page stub helper ──
function _pageStub(title, description) {
  return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:64px 32px;text-align:center">'
    + '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--border-md);margin-bottom:14px"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>'
    + '<div style="font-size:14px;font-weight:500;color:var(--muted);margin-bottom:6px">' + title + '</div>'
    + '<div style="font-size:13px;color:var(--faint);max-width:360px;margin:0 auto;line-height:1.6">' + description + '</div>'
    + '</div>';
}

// ── App data ──
var APP_ORGS = [
  { id: 'kerv',          name: 'KERV',            type: 'Super Organization', email: 'admin@kerv.com',           users: 24, advertisers: 0,  campaigns: 0,  status: 'Active', since: 'Jun 2023' },
  { id: 'paramount-aus', name: 'Paramount AUS',   type: 'Publisher',          email: 'admin@paramount.com.au',  users: 12, advertisers: 3,  campaigns: 18, status: 'Active', since: 'Mar 2024' },
  { id: 'disney',        name: 'Disney',           type: 'Publisher',          email: 'admin@disney.com',         users: 8,  advertisers: 2,  campaigns: 12, status: 'Active', since: 'Jan 2024' },
  { id: 'groupm',        name: 'GroupM',           type: 'Agency',             email: 'admin@groupm.com',         users: 35, advertisers: 8,  campaigns: 47, status: 'Active', since: 'Feb 2024' },
  { id: 'walmart',       name: 'Walmart',          type: 'Brand',              email: 'admin@walmart.com',        users: 6,  advertisers: 1,  campaigns: 8,  status: 'Active', since: 'May 2024' },
  { id: 'hulu',          name: 'Hulu',             type: 'Platform',           email: 'admin@hulu.com',           users: 10, advertisers: 2,  campaigns: 14, status: 'Active', since: 'Aug 2024' },
];

var APP_ADVERTISERS = [
  { id: 'walmart-adv',  name: 'Walmart',         org: 'walmart',  spend: '$2.4M', campaigns: 8,  status: 'Active' },
  { id: 'target',       name: 'Target',          org: 'groupm',   spend: '$1.8M', campaigns: 5,  status: 'Active' },
  { id: 'home-depot',   name: 'The Home Depot',  org: 'groupm',   spend: '$950K', campaigns: 3,  status: 'Active' }
];

var APP_USERS = [
  { id:'u1', name:'Sarah Mitchell',  email:'sarah.mitchell@paramount.com.au', role:'Admin',       org:'paramount-aus', status:'Active',   last:'2h ago'   },
  { id:'u2', name:'James Thornton',  email:'j.thornton@paramount.com.au',     role:'Editor',      org:'paramount-aus', status:'Active',   last:'1d ago'   },
  { id:'u3', name:'Lena Park',       email:'l.park@paramount.com.au',         role:'Viewer',      org:'paramount-aus', status:'Active',   last:'3d ago'   },
  { id:'u4', name:'Emma Clarke',     email:'e.clarke@disney.com',             role:'Admin',       org:'disney',        status:'Active',   last:'5h ago'   },
  { id:'u5', name:'Tom Reyes',       email:'t.reyes@disney.com',              role:'Editor',      org:'disney',        status:'Inactive', last:'14d ago'  },
  { id:'u6', name:'Bruna Ferrari',   email:'bruna@saykudos.co',               role:'Super Admin', org:'kerv',          status:'Active',   last:'Just now' },
  { id:'u7', name:'Marco Rossi',     email:'m.rossi@kerv.com',                role:'Admin',       org:'kerv',          status:'Active',   last:'1h ago'   },
  { id:'u8', name:'Alex Rivera',     email:'a.rivera@groupm.com',             role:'Admin',       org:'groupm',        status:'Active',   last:'3h ago'   },
  { id:'u9', name:'Priya Nair',      email:'p.nair@groupm.com',               role:'Planner',     org:'groupm',        status:'Active',   last:'2d ago'   },
  { id:'u10',name:'Jordan Kim',      email:'j.kim@walmart.com',               role:'Viewer',      org:'walmart',       status:'Active',   last:'1w ago'   }
];

var selectedOrgId       = 'kerv';
var selectedClientOrgId = null;   // numeric DB id of selected client org
var _appDbOrgs          = [];     // [{dbId, name, type}] loaded from /api/organizations
var _appDbAdvertisers   = [];     // [{advertiser_id, advertiser_name, client_org_id}] loaded from /api/advertisers
var selectedAdvId       = 'walmart-adv';

// ── Client org helpers (used by all pages with a Client select) ───────────────

// True when the selected org is a Super Organization (sees all clients)
function _appIsSuperOrg() {
  if (!selectedClientOrgId || !_appDbOrgs.length) return true; // default open while loading
  var org = _appDbOrgs.find(function(o) { return o.dbId === selectedClientOrgId; });
  return !org || org.type === 'Super Organization';
}

// Orgs available in a Client select for the current user:
// Super org → all orgs; any other type → only their own org
function _appClientOrgs() {
  if (_appIsSuperOrg()) return _appDbOrgs;
  return _appDbOrgs.filter(function(o) { return o.dbId === selectedClientOrgId; });
}

// ── App state ──
var activeId  = 'overview';
var collapsed = false;

// ── Nav config ──
var NAV_CONFIG = [
  {
    items: [
      { id: 'overview',            label: 'Overview',              icon: ico.overview }
    ]
  },
  {
    section: 'Explore Inventory',
    items: [
      { id: 'vod-analysis',          label: 'VoD Analysis',                 icon: ico.tv          },
      { id: 'livestream-analysis',   label: 'Livestream Analysis',          icon: ico.radio       },
      { id: 'olv-analysis',          label: 'OLV Analysis',                 icon: ico.smartphone  },
      { id: 'pods-explorer',    label: 'Inventory Explorer',           icon: ico.search      }
    ]
  },
  {
    section: 'Plan and Activate',
    items: [
      { id: 'campaign-management',      label: 'Campaign Manager',          icon: ico.campaign },
      { id: 'creative-studio',          label: 'Creative Studio',           icon: ico.creative,  dividerBefore: true },
      { id: 'moments-builder',          label: 'Moments Builder',           icon: ico.builder  },
      { id: 'media-planner-v2',         label: 'Moments Match',             icon: ico.combine  }
    ]
  },
  {
    section: 'Measure and Optimize',
    items: [
      { id: 'measurement',         label: 'Measurement',           icon: ico.reporting }
    ]
  },
  {
    section: 'Integrations',
    dividerBefore: true,
    items: [
      { id: 'vod-livestream-feeds',      label: 'VoD/Live/OLV Stream',        icon: ico.castconn },
      { id: 'dsp-ssp',                   label: 'DSP / SSP Connections',    icon: ico.dsp      },
      { id: 'api-docs',                  label: 'API Documentation',        icon: ico.api      }
    ]
  }
];

// ── Pages map ──
var PAGES = {
  // ── Main nav ──
  'overview':              renderOverview,
  'vod-analysis':          renderMetadataAnalysis,
  'livestream-analysis':   renderLivestreamAnalysis,
  'olv-analysis':          renderOlvAnalysis,
  'pods-explorer':    renderMomentsSearch,
  'media-planner-v2':      renderMediaPlannerV2,
  'moments-builder':       renderMomentsBuilder,
  'campaign-management':   renderCampaignManagement,
  'build-ad-group':      renderBuildAdGroup,
  'creative-assets':       renderCreativeManagement,
  'creative-studio':       renderCreativeStudio,
  'measurement':           renderMeasurement,
  'dsp-ssp':                   renderDspSsp,
  'vod-livestream-feeds':      renderVodLivestreamFeeds,
  'api-docs':                  renderApiDocs,
  // ── Settings ──
  'organization':          renderOrganization,
  'org-management':        renderOrgManagement,
  // ── WIP ──
  'sdt-content-form':      renderSdtContentForm,
  'taxonomy-showcase':     renderTaxonomyShowcase,
  'media-planner':         renderInventoryExplorerV2
};

// ── Nav section collapse state — both sections open by default ──
var navCollapsed = {};

function toggleNavSection(section) {
  navCollapsed[section] = !navCollapsed[section];
  buildNav();
}

function _appCurrentOrgType() {
  if (!selectedClientOrgId || !_appDbOrgs.length) return null;
  var org = _appDbOrgs.find(function(o) { return o.dbId === selectedClientOrgId; });
  return org ? org.type : null;
}

function buildNav() {
  var orgType = _appCurrentOrgType();
  var isRestricted = (orgType === 'Agency' || orgType === 'Brand');
  var hiddenSections = isRestricted ? ['Explore Inventory'] : [];
  var hiddenItems    = isRestricted ? ['vod-livestream-feeds'] : [];

  document.getElementById('nav').innerHTML = NAV_CONFIG.map(function(sec) {
    // Hide entire section for restricted orgs
    if (sec.section && hiddenSections.indexOf(sec.section) >= 0) return '';

    // Filter individual items
    var allowedItems = sec.items.filter(function(item) {
      return hiddenItems.indexOf(item.id) < 0;
    });
    if (!allowedItems.length && sec.section) return '';

    var items = allowedItems.map(function(item) {
      var act = item.id === activeId;
      var div = item.dividerBefore ? '<div style="height:1px;background:var(--border);margin:4px 12px"></div>' : '';
      return div + '<div class="nitem' + (act ? ' act' : '') + '" data-page="' + item.id + '" data-label="' + item.label + '">'
        + (act ? '<div class="nbar"></div>' : '')
        + '<div class="nico">' + item.icon + '</div>'
        + '<span class="nlabel">' + item.label + '</span>'
        + '</div>';
    }).join('');

    var divider = sec.dividerBefore ? '<div style="height:1px;background:var(--border);margin:6px 12px"></div>' : '';

    if (!sec.section) {
      return divider + '<div>' + items + '</div>';
    }

    var col = !!navCollapsed[sec.section];
    var chevron = col
      ? '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 6.5l3-3 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var badge = sec.sectionBadge
      ? ' <span style="font-size:8px;font-weight:700;padding:1px 5px;border-radius:8px;background:#EFF6FF;color:#1D4ED8;letter-spacing:.2px;vertical-align:middle">' + sec.sectionBadge + '</span>'
      : '';
    var header = '<div class="seclabel seclabel--toggle" onclick="toggleNavSection(\'' + sec.section.replace(/'/g, "\\'") + '\')">'
      + '<span>' + sec.section + badge + '</span>'
      + '<span class="seclabel-chevron">' + chevron + '</span>'
      + '</div>';
    return divider + '<div>' + header + (col ? '' : items) + '</div>';
  }).join('');
}

function setPage(id, label, noPush) {
  activeId = id;
  var content = document.getElementById('content');
  var pageHtml = PAGES[id] ? PAGES[id]() : '<div class="ptitle">' + label + '</div>';
  content.innerHTML = '<div id="content-bc" class="content-bc">' + label + '</div>' + pageHtml;
  buildNav();
  if (!noPush) {
    var urlSlug = id === 'organization'
      ? (function() {
          var _o = APP_ORGS.find(function(o) { return o.dbId === selectedClientOrgId; }) || APP_ORGS[0];
          return '/organization/' + (typeof _orgSlug === 'function' ? _orgSlug(_o.name) : (_o.id || 'org'));
        })()
      : id === 'org-management'
        ? '/organization'
        : id === 'build-ad-group'
          ? '/campaign-management/draft-campaign/build-ad-group'
          : id === 'media-planner-v2'
            ? '/moments-match'
            : '/' + id;
    history.pushState({ id: id, label: label }, '', urlSlug);
  }
}

// ── URL routing helpers ──

function pageFromPath() {
  var path = location.pathname.replace(/^\//, '').replace(/\/$/, '') || 'overview';
  // Sub-page routes
  var csBuildMatch = path.match(/^creative-studio\/build-template\/(.+)$/);
  if (csBuildMatch) return { id: 'creative-studio', label: 'Creative Studio', openEditor: true, csAssetId: csBuildMatch[1] };
  if (path === 'creative-studio/build-template') return { id: 'creative-studio', label: 'Creative Studio', openEditor: true };
  if (path === 'creative-studio/creative-library') return { id: 'creative-studio', label: 'Creative Studio', openLibrary: true };
  if (path === 'creative-studio/brief-library') return { id: 'creative-studio', label: 'Creative Studio', openBriefLibrary: true };
  if (path === 'campaign-management/draft-campaign/build-ad-group') return { id: 'build-ad-group', label: 'Build Moments Group' };
  var cmDetailMatch = path.match(/^campaign-management\/(draft-campaign|pacing-campaign)\/(.+)$/);
  if (cmDetailMatch) return { id: 'campaign-management', label: 'Campaign Management', cmCampaignId: cmDetailMatch[2] };
  if (path === 'campaign-management/draft-campaign' || path === 'campaign-management/pacing-campaign') return { id: 'campaign-management', label: 'Campaign Management' };
  var mp2PlanMatch = path.match(/^media-planner-v2\/ad-groups\/(.+)$/);
  if (mp2PlanMatch) return { id: 'media-planner-v2', label: 'Moments Match', mp2AdGroupId: mp2PlanMatch[1] };
  if (path === 'media-planner-v2/ad-groups')       return { id: 'media-planner-v2', label: 'Moments Match', mp2Tab: 'plans' };
  if (path === 'media-planner-v2/previous-analysis') return { id: 'media-planner-v2', label: 'Moments Match', mp2Tab: 'analyses' };
  if (path === 'media-planner-v2/analysis') return { id: 'media-planner-v2', label: 'Moments Match', mp2View: 'analysis' };
  // ── moments-match URL patterns ──
  if (path === 'moments-match' || path === 'moments-match/new') return { id: 'media-planner-v2', label: 'Moments Match', mp2Tab: 'new-plan' };
  if (path === 'moments-match/saved') return { id: 'media-planner-v2', label: 'Moments Match', mp2Tab: 'analyses' };
  var mmSavedMatch = path.match(/^moments-match\/saved\/(\d+)(?:-.+)?$/);
  if (mmSavedMatch) return { id: 'media-planner-v2', label: 'Moments Match', mp2View: 'analysis', analysisId: parseInt(mmSavedMatch[1]), origin: 'saved' };
  var mmNewMatch = path.match(/^moments-match\/new\/(\d+)(?:-.+)?$/);
  if (mmNewMatch) return { id: 'media-planner-v2', label: 'Moments Match', mp2View: 'analysis', analysisId: parseInt(mmNewMatch[1]), origin: 'new' };
  // /organization            → org list (org-management)
  // /organization/{org-slug} → single org detail  (no tab in URL)
  var parts = path.split('/');
  if (parts[0] === 'organization') {
    if (!parts[1]) return { id: 'org-management', label: 'Organization' };
    // Try to resolve by name slug, numeric dbId, or legacy id string
    var orgFromUrl = APP_ORGS.find(function(o) {
      var slug = (o.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return slug === parts[1] || String(o.dbId) === parts[1] || o.id === parts[1];
    });
    if (orgFromUrl) selectedOrgId = orgFromUrl.id;
    return { id: 'organization', label: 'Organization' };
  }
  var base = parts[0];
  // Direct PAGES entries not in NAV_CONFIG (e.g. /organization/users, /organization/advertisers)
  var directLabels = {
    'organization':          'Organization',
    'org-management':        'Organization',
    'overview':              'Overview',
    'livestream-analysis':   'Livestream Analysis',
    'olv-analysis':          'OLV Analysis',
    'pods-explorer':    'Inventory Explorer',
    'campaign-management':   'Campaign Management',
    'build-ad-group':      'Build Moments Group',
    'moments-builder':       'Custom Moments Builder',
    'creative-assets':       'Creative Management',
    'creative-studio':       'Creative Studio',
    'measurement':           'Measurement',
    'dsp-ssp':                   'DSP / SSP Connections',
    'vod-livestream-feeds':      'VoD/Live/OLV Stream',
    'api-docs':                  'API Documentation',
    'moments-match':             'Moments Match'
  };
  if (directLabels[base]) return { id: base, label: directLabels[base] };
  var found = null;
  NAV_CONFIG.forEach(function(sec) {
    sec.items.forEach(function(item) {
      if (item.id === base) found = item;
    });
  });
  if (!found) found = NAV_CONFIG[0].items[0];
  return found;
}

window.addEventListener('popstate', function(e) {
  // Close editor overlay on browser back
  var overlay = document.getElementById('cs-editor-overlay');
  if (overlay) { overlay.remove(); return; }
  // Close Build Moments Group overlay on browser back
  var bmpOverlay = document.getElementById('cm-bmp-overlay');
  if (bmpOverlay) { bmpOverlay.remove(); return; }
  // Restore campaign detail page
  if (e.state && e.state.cmCampaignId) {
    setPage('campaign-management', 'Campaign Management', true);
    cmOpenDetail(e.state.cmCampaignId, true);
    return;
  }
  // Media planner analysis view
  if (e.state && e.state.mp2View === 'analysis') {
    setPage('media-planner-v2', 'Moments Match', true);
    var _aid = e.state.analysisId || null;
    setTimeout(function() { mp2ShowResults(_aid); }, 80);
    return;
  }
  // Media planner plan detail
  if (e.state && e.state.mp2AdGroupId) {
    setPage('media-planner-v2', 'Moments Match', true);
    setTimeout(function() { mp2OpenPlanById(e.state.mp2AdGroupId, true); }, 80);
    return;
  }
  // Media planner tab (ad-groups / previous-analysis)
  if (e.state && e.state.mp2Tab) {
    mp2HomeTab = e.state.mp2Tab; // set before render so correct tab is shown
    setPage('media-planner-v2', 'Moments Match', true);
    return;
  }
  // Media planner home (back from analysis/new-plan with no specific tab)
  if (e.state && e.state.id === 'media-planner-v2' && !e.state.mp2View) {
    mp2HomeTab = 'new-plan';
    setPage('media-planner-v2', 'Moments Match', true);
    return;
  }
  if (e.state && e.state.id) {
    setPage(e.state.id, e.state.label, true);
  } else {
    var item = pageFromPath();
    setPage(item.id, item.label, true);
  }
});

// ── Event delegation ──

document.addEventListener('click', function(e) {
  var ni = e.target.closest('[data-page]');
  if (ni) { setPage(ni.dataset.page, ni.dataset.label); return; }
});

// ── Topbar dropdowns ──

function toggleSettingsMenu(e) {
  e.stopPropagation();
  var settings = document.getElementById('settingsMenu');
  var btn = document.getElementById('settingsBtn');
  var wasOpen = settings.classList.contains('open');
  closeNotifPanel();
  closeSelectDds();
  settings.classList.toggle('open', !wasOpen);
  btn.classList.toggle('active', !wasOpen);
  if (wasOpen) {
    document.getElementById('wipSubmenu').classList.remove('open');
    document.getElementById('wip-chevron').classList.remove('open');
  }
}

function toggleWipSubmenu(e) {
  e.stopPropagation();
  var sub = document.getElementById('wipSubmenu');
  var chevron = document.getElementById('wip-chevron');
  sub.classList.toggle('open');
  chevron.classList.toggle('open');
}

function closeMenus() {
  document.getElementById('settingsMenu').classList.remove('open');
  document.getElementById('settingsBtn').classList.remove('active');
  document.getElementById('wipSubmenu').classList.remove('open');
  document.getElementById('wip-chevron').classList.remove('open');
}

// ── Notification panel ──

var notifUnreadCount = 3;

function toggleNotifPanel(e) {
  e.stopPropagation();
  var panel = document.getElementById('notifPanel');
  var btn   = document.getElementById('notifBtn');
  var wasOpen = panel.classList.contains('open');
  // Close other panels first
  closeMenus();
  closeSelectDds();
  if (!wasOpen) {
    panel.classList.add('open');
    btn.classList.add('active');
  } else {
    panel.classList.remove('open');
    btn.classList.remove('active');
  }
}

function closeNotifPanel() {
  var panel = document.getElementById('notifPanel');
  var btn   = document.getElementById('notifBtn');
  if (panel) panel.classList.remove('open');
  if (btn)   btn.classList.remove('active');
}

function markAllRead() {
  notifUnreadCount = 0;
  for (var i = 1; i <= 5; i++) {
    var item = document.getElementById('notif-' + i);
    var dot  = document.getElementById('ndot-' + i);
    if (item) item.classList.remove('unread');
    if (dot)  dot.classList.add('read');
  }
  var dotEl = document.getElementById('notifDot');
  if (dotEl) dotEl.style.display = 'none';
}

// ── AI Assistant panel ──

var aiOpen = false;
var aiTyping = false;

var AI_RESPONSES = [
  { k: ['campaign', 'perform'], r: 'Across all active campaigns, your overall CTR is sitting at 2.4% — up 0.3pp week-over-week. The Walmart Summer Launch is your top performer at 3.1% CTR with 12.4M impressions delivered so far.' },
  { k: ['moment', 'engag', 'top'], r: 'Your highest-engagement moments this week are from the Paramount AUS library: cooking segments (+38% avg attention vs benchmark), sports highlights (+27%), and live event recaps (+22%). Want me to surface these in the Moments Match?' },
  { k: ['Moments Group', 'walmart', 'build'], r: 'To build a plan for Walmart, I\'d recommend targeting cooking, home improvement, and family entertainment moments across Paramount AUS and Disney. Estimated reach: 4.2M uniques. Shall I draft a full plan in the Moments Match?' },
  { k: ['q3', 'invent', 'avail'], r: 'Q3 pods looks strong. Paramount AUS has ~18M available impressions, Disney ~11M. Premium slots (live events, sports) are filling fast — roughly 62% already committed. I\'d recommend locking in now for key programming windows.' },
  { k: ['hello', 'hi', 'hey'], r: 'Hi there! Ready to help. You can ask me about campaign performance, pods insights, audience moments, or anything else on the platform.' }
];

function aiGetResponse(msg) {
  var lower = msg.toLowerCase();
  for (var i = 0; i < AI_RESPONSES.length; i++) {
    var match = AI_RESPONSES[i].k.some(function(k){ return lower.indexOf(k) !== -1; });
    if (match) return AI_RESPONSES[i].r;
  }
  return 'Great question. Based on current data across your pods and active campaigns, I\'d recommend reviewing the Moments Search Tool for deeper context — or let me know if you\'d like me to dig into a specific area like reach, frequency, or spend pacing.';
}

function toggleAiPanel(e) {
  e.stopPropagation();
  if (aiOpen) { closeAiPanel(); } else { openAiPanel(); }
}

function openAiPanel() {
  closeMenus();
  closeSelectDds();
  aiOpen = true;
  document.getElementById('aiDrawer').classList.add('open');
  document.getElementById('aiOverlay').classList.add('show');
  document.getElementById('aiBtn').classList.add('active');
  setTimeout(function(){ document.getElementById('aiInput').focus(); }, 300);
}

function closeAiPanel() {
  aiOpen = false;
  document.getElementById('aiDrawer').classList.remove('open');
  document.getElementById('aiOverlay').classList.remove('show');
  document.getElementById('aiBtn').classList.remove('active');
}

function aiInputResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function aiInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); aiSend(); }
}

function aiAppendMsg(role, text) {
  var msgs = document.getElementById('aiMessages');
  var now  = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  var div  = document.createElement('div');
  div.className = 'ai-msg ' + role;
  div.innerHTML = '<div class="ai-msg-bubble">' + text + '</div><div class="ai-msg-time">' + now + '</div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function aiShowTyping() {
  var msgs = document.getElementById('aiMessages');
  var div  = document.createElement('div');
  div.className = 'ai-msg bot';
  div.id = 'ai-typing-indicator';
  div.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function aiHideTyping() {
  var el = document.getElementById('ai-typing-indicator');
  if (el) el.remove();
}

function aiSend() {
  if (aiTyping) return;
  var input = document.getElementById('aiInput');
  var text  = input.value.trim();
  if (!text) return;

  // Hide suggestions after first interaction
  var sugg = document.getElementById('aiSuggestions');
  if (sugg) sugg.style.display = 'none';

  aiAppendMsg('user', text);
  input.value = '';
  input.style.height = 'auto';
  aiTyping = true;

  aiShowTyping();
  var response = aiGetResponse(text);
  setTimeout(function() {
    aiHideTyping();
    aiAppendMsg('bot', response);
    aiTyping = false;
  }, 900 + Math.random() * 600);
}

function aiQuickSend(text) {
  var input = document.getElementById('aiInput');
  input.value = text;
  aiSend();
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('#settings-wrap') && !e.target.closest('#notif-wrap')) closeMenus();
  if (!e.target.closest('#org-wrap')) { document.getElementById('orgDd').classList.remove('open'); document.getElementById('orgBtn').classList.remove('active'); }
  if (!e.target.closest('#notif-wrap')) closeNotifPanel();
});

// ── Topbar selectors ──

function orgTypeBadge(type) {
  var cls = type === 'Publisher' ? 'tb-type-publisher' : type === 'Agency' ? 'tb-type-agency' : type === 'Platform' ? 'tb-type-platform' : 'tb-type-brand';
  return '<span class="tb-type-badge ' + cls + '">' + type + '</span>';
}

function buildOrgDd() {
  var orgs = _appDbOrgs.length ? _appDbOrgs : APP_ORGS.map(function(o) {
    return { dbId: o.id, name: o.name, type: o.type };
  });
  document.getElementById('orgDd').innerHTML = orgs.map(function(o) {
    var isSel = o.dbId === selectedClientOrgId || (!selectedClientOrgId && o.dbId === 'kerv');
    return '<div class="tb-select-item' + (isSel ? ' sel' : '') + '" onclick="selectOrg(' + JSON.stringify(o.dbId) + ')">'
      + '<span class="tb-select-item-name">' + o.name
      + (o.type ? ' <span style="color:var(--faint);font-weight:400">(' + o.type + ')</span>' : '')
      + '</span>'
      + '</div>';
  }).join('');
}

// ── Shared campaign list (objects) ───────────────────────────────────────────
var APP_CAMPAIGNS = [
  { name: 'Q2 Walmart Grocery',    advertiserName: 'Walmart',        advertiserId: 'walmart-adv', geography: 'United States'          },
  { name: 'Back to School 2026',   advertiserName: 'Walmart',        advertiserId: 'walmart-adv', geography: 'United States, Canada'  },
  { name: 'Summer Fresh Campaign', advertiserName: 'Walmart',        advertiserId: 'walmart-adv', geography: 'Europe'                 },
  { name: 'Home Renovation Q3',    advertiserName: 'The Home Depot', advertiserId: 'home-depot',  geography: 'United States'          },
  { name: 'Target Back to School', advertiserName: 'Target',         advertiserId: 'target',      geography: 'United States'          },
];

// ── Shared segmented control helper ──────────────────────────────────────────
function _segControlHtml(activeId, items) {
  return '<div style="display:flex;gap:2px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:3px;margin-bottom:16px">'
    + items.map(function(item) {
      var active = activeId === item.id;
      return '<div style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;height:30px;padding:0 10px;border-radius:5px;cursor:pointer;font-size:11px;font-weight:500;user-select:none;white-space:nowrap;transition:background .13s,color .13s;'
        + (active ? 'background:var(--surface);color:var(--accent);box-shadow:0 1px 3px rgba(0,0,0,.07)' : 'color:var(--muted)')
        + '" onclick="' + item.onclick + '">'
        + item.label
        + '</div>';
    }).join('')
    + '</div>';
}

// ── Shared Campaign custom-select with search ─────────────────────────────────
function _buildCampItems(term, panelId, triggerId, stateVarName, refreshFnName) {
  var listEl = document.getElementById(panelId + '-list');
  if (!listEl) return;
  var q = (term || '').toLowerCase().trim();
  var current = window[stateVarName];
  var currentName = current ? current.name : null;
  var filtered = APP_CAMPAIGNS.filter(function(c) {
    return !q || c.name.toLowerCase().indexOf(q) >= 0 || c.advertiserName.toLowerCase().indexOf(q) >= 0;
  });
  if (!filtered.length) {
    listEl.innerHTML = '<div style="padding:12px;text-align:center;font-size:11px;color:var(--faint)">No campaigns found</div>';
    return;
  }
  listEl.innerHTML = filtered.map(function(c) {
    var idx = APP_CAMPAIGNS.indexOf(c);
    var sel = currentName === c.name;
    return '<div onclick="sharedSelectCampaign(' + idx + ',\'' + triggerId + '\',\'' + panelId + '\',\'' + stateVarName + '\',\'' + refreshFnName + '\')" '
      + 'style="padding:8px 12px;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;font-weight:' + (sel ? '600' : '400') + '" '
      + 'onmouseover="this.style.background=\'var(--hover)\'" onmouseout="this.style.background=\'transparent\'">'
      + '<span style="color:var(--text)">' + c.name + ' <span style="color:var(--faint);font-weight:400">(' + c.advertiserName + ')</span></span>'
      + (sel ? '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" style="flex-shrink:0"><path d="M2 5l2.5 2.5L8 3" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '')
      + '</div>';
  }).join('');
}

function toggleSharedCampaignPanel(e, triggerId, panelId, stateVarName, refreshFnName) {
  if (e) e.stopPropagation();
  var trigger = document.getElementById(triggerId);
  var panel   = document.getElementById(panelId);
  if (!trigger || !panel) return;
  var isOpen = panel.style.display !== 'none' && panel.style.display !== '';
  if (isOpen) {
    panel.style.display = 'none';
    trigger.style.borderColor = 'var(--border-md)'; trigger.style.boxShadow = 'none';
    return;
  }
  // Build panel with search + list
  panel.innerHTML =
    '<div style="padding:8px;border-bottom:1px solid var(--border)">'
    + '<input id="' + panelId + '-search" type="text" placeholder="Search campaigns…" '
    + 'oninput="_buildCampItems(this.value,\'' + panelId + '\',\'' + triggerId + '\',\'' + stateVarName + '\',\'' + refreshFnName + '\')" '
    + 'style="width:100%;height:28px;border:1px solid var(--border-md);border-radius:6px;padding:0 8px;font-size:11px;font-family:inherit;color:var(--text);background:var(--surface);outline:none;box-sizing:border-box" '
    + 'onclick="event.stopPropagation()">'
    + '</div>'
    + '<div id="' + panelId + '-list" style="max-height:180px;overflow-y:auto"></div>';
  _buildCampItems('', panelId, triggerId, stateVarName, refreshFnName);
  // Position fixed
  var rect = trigger.getBoundingClientRect();
  panel.style.cssText = 'display:block;position:fixed;width:' + Math.max(rect.width, 220) + 'px;left:' + rect.left + 'px;top:' + (rect.bottom + 4) + 'px;z-index:9999;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.12);overflow:hidden';
  trigger.style.borderColor = 'var(--accent)'; trigger.style.boxShadow = '0 0 0 3px rgba(237,0,94,.08)';
  setTimeout(function() {
    var si = document.getElementById(panelId + '-search');
    if (si) si.focus();
    document.addEventListener('click', function _close(ev) {
      var p = document.getElementById(panelId);
      var t = document.getElementById(triggerId);
      if (p && !p.contains(ev.target) && (!t || !t.contains(ev.target))) {
        p.style.display = 'none';
        if (t) { t.style.borderColor = 'var(--border-md)'; t.style.boxShadow = 'none'; }
        document.removeEventListener('click', _close);
      }
    });
  }, 0);
}

function sharedSelectCampaign(idx, triggerId, panelId, stateVarName, refreshFnName) {
  var camp = APP_CAMPAIGNS[idx];
  if (!camp) return;
  window[stateVarName] = camp;
  var lbl = document.querySelector('#' + triggerId + ' .camp-lbl');
  if (lbl) lbl.textContent = camp.name;
  var panel = document.getElementById(panelId);
  if (panel) panel.style.display = 'none';
  var trigger = document.getElementById(triggerId);
  if (trigger) { trigger.style.borderColor = 'var(--border-md)'; trigger.style.boxShadow = 'none'; }
  if (refreshFnName && window[refreshFnName]) window[refreshFnName]();
}

// ── Shared Advertiser custom-select (used in MP and CS forms) ─────────────────
function toggleSharedAdvPanel(e, triggerId, panelId) {
  if (e) e.stopPropagation();
  var trigger = document.getElementById(triggerId);
  var panel   = document.getElementById(panelId);
  if (!trigger || !panel) return;
  var isOpen = panel.style.display !== 'none' && panel.style.display !== '';
  if (isOpen) {
    panel.style.display = 'none';
    trigger.style.borderColor = 'var(--border-md)'; trigger.style.boxShadow = 'none';
    return;
  }
  // Build items
  panel.innerHTML = APP_ADVERTISERS.map(function(a) {
    var sel = a.id === selectedAdvId;
    return '<div onclick="sharedSelectAdv(\'' + a.id + '\',\'' + triggerId + '\',\'' + panelId + '\')" '
      + 'style="padding:8px 12px;font-size:12px;cursor:pointer;color:var(--text);display:flex;align-items:center;justify-content:space-between;font-weight:' + (sel?'600':'400') + '" '
      + 'onmouseover="this.style.background=\'var(--hover)\'" onmouseout="this.style.background=\'transparent\'">'
      + '<span>' + a.name + '</span>'
      + (sel ? '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '')
      + '</div>';
  }).join('');
  // Position fixed to escape overflow:hidden
  var rect = trigger.getBoundingClientRect();
  panel.style.cssText = 'display:block;position:fixed;width:' + rect.width + 'px;left:' + rect.left + 'px;top:' + (rect.bottom + 4) + 'px;z-index:9999;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.12);overflow:hidden';
  trigger.style.borderColor = 'var(--accent)'; trigger.style.boxShadow = '0 0 0 3px rgba(237,0,94,.08)';
  setTimeout(function() {
    document.addEventListener('click', function _close(ev) {
      var p = document.getElementById(panelId);
      var t = document.getElementById(triggerId);
      if (p && !p.contains(ev.target) && (!t || !t.contains(ev.target))) {
        p.style.display = 'none';
        if (t) { t.style.borderColor = 'var(--border-md)'; t.style.boxShadow = 'none'; }
        document.removeEventListener('click', _close);
      }
    });
  }, 0);
}

function sharedSelectAdv(id, triggerId, panelId) {
  selectedAdvId = id;
  var adv = APP_ADVERTISERS.find(function(a){ return a.id === id; });
  var lbl = document.querySelector('#' + triggerId + ' .adv-lbl');
  if (lbl) lbl.textContent = adv ? adv.name : id;
  var panel = document.getElementById(panelId);
  if (panel) panel.style.display = 'none';
  var trigger = document.getElementById(triggerId);
  if (trigger) { trigger.style.borderColor = 'var(--border-md)'; trigger.style.boxShadow = 'none'; }
}

function toggleOrgDd(e) {
  e.stopPropagation();
  var dd = document.getElementById('orgDd');
  var btn = document.getElementById('orgBtn');
  var wasOpen = dd.classList.contains('open');
  closeSelectDds();
  if (!wasOpen) { buildOrgDd(); dd.classList.add('open'); btn.classList.add('active'); }
}

function closeSelectDds() {
  var orgDd = document.getElementById('orgDd');
  var orgBtn = document.getElementById('orgBtn');
  if (orgDd) orgDd.classList.remove('open');
  if (orgBtn) orgBtn.classList.remove('active');
}

function updateOrgMgmtVisibility() {
  var el = document.getElementById('org-mgmt-item');
  if (el) el.style.display = _appIsSuperOrg() ? '' : 'none';
}

function selectOrg(id) {
  // Try DB orgs first (numeric id)
  var dbOrg = _appDbOrgs.find(function(o) { return o.dbId === id; });
  if (dbOrg) {
    selectedClientOrgId = dbOrg.dbId;
    selectedOrgId       = String(dbOrg.dbId); // keep compat
    document.getElementById('orgVal').textContent = dbOrg.name;
    var typeEl = document.getElementById('orgTypeVal');
    if (typeEl) typeEl.textContent = dbOrg.type || '';
  } else {
    // Fallback: legacy string slug
    var org = APP_ORGS.find(function(o){ return o.id === id; });
    if (!org) return;
    selectedOrgId = id;
    document.getElementById('orgVal').textContent = org.name;
    var typeEl = document.getElementById('orgTypeVal');
    if (typeEl) typeEl.textContent = org.type;
  }
  closeSelectDds();
  buildNav();
  updateOrgMgmtVisibility();
  // Re-render the current page so all selects and data refresh
  if (activeId === 'organization') {
    setPage('organization', 'Organization', true);
    var _selOrg = APP_ORGS.find(function(o) { return o.dbId === selectedClientOrgId; }) || APP_ORGS[0];
    var _slug = (typeof _orgSlug === 'function') ? _orgSlug(_selOrg.name) : (_selOrg.id || 'org');
    history.replaceState({ id: 'organization', label: 'Organization' }, '', '/organization/' + _slug);
  } else {
    var _pageLabels = {
      'overview':              'Overview',
      'vod-analysis':          'VoD Analysis',
      'livestream-analysis':   'Livestream Analysis',
      'olv-analysis':          'OLV Analysis',
      'pods-explorer':    'Inventory Explorer',
      'campaign-management':   'Campaign Management',
      'build-ad-group':      'Build Moments Group',
      'creative-studio':       'Creative Studio',
      'moments-builder':       'Custom Moments Builder',
      'media-planner-v2':      'Moments Match',
      'measurement':           'Measurement',
      'dsp-ssp':               'DSP / SSP Connections',
      'vod-livestream-feeds':  'VoD/Live/OLV Stream',
      'api-docs':              'API Documentation',
      'org-management':        'Organization',
    };
    var _currentLabel = _pageLabels[activeId] || activeId;
    setPage(activeId, _currentLabel, true);
  }
}


// ── Sidebar toggle ──

function toggleSb() {
  collapsed = !collapsed;
  document.getElementById('sb').classList.toggle('col', collapsed);
  document.getElementById('togico').innerHTML = collapsed
    ? '<path d="M4 2l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
    : '<path d="M6 2L3 5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
}

// ── Login / Logout ──

function login() {
  var e = document.getElementById('em').value.trim(), p = document.getElementById('pw').value;
  if (e === 'bruna' && p === 'Bruna2026') {
    document.getElementById('auth').classList.add('gone');
    setTimeout(function() { document.getElementById('auth').style.display = 'none'; }, 300);
    document.getElementById('app').classList.add('show');
    var name = e.split('@')[0];
    document.getElementById('un').textContent = name.charAt(0).toUpperCase() + name.slice(1);
    document.getElementById('av').textContent = name.charAt(0).toUpperCase() + name.charAt(name.length > 1 ? 1 : 0).toUpperCase();
    var startItem = pageFromPath();
    activeId = startItem.id;
    buildNav();
    setPage(startItem.id, startItem.label, true);
    // Load client orgs from DB for topbar select
    fetch('/api/organizations').then(function(r){ return r.json(); }).then(function(d) {
      _appDbOrgs = (d.orgs || []).map(function(o) {
        return { dbId: o.dbId, name: o.name, type: o.type };
      });
      // Default to Kerv (dbId=1)
      var kerv = _appDbOrgs.find(function(o) { return o.dbId === 1; }) || _appDbOrgs[0];
      if (kerv) {
        selectedClientOrgId = kerv.dbId;
        selectedOrgId       = String(kerv.dbId);
        document.getElementById('orgVal').textContent = kerv.name;
        var typeEl = document.getElementById('orgTypeVal');
        if (typeEl) typeEl.textContent = kerv.type || '';
      }
    }).catch(function() { /* keep hardcoded fallback */ });
    // Load advertisers from DB (used by campaign forms)
    fetch('/api/advertisers').then(function(r){ return r.json(); }).then(function(d) {
      _appDbAdvertisers = d.advertisers || [];
    }).catch(function() { /* keep empty */ });
    if (startItem.openEditor)       { setTimeout(function() { csBuildTemplates(0, startItem.csAssetId); }, 80); }
    if (startItem.openLibrary)      { setTimeout(function() { csSwitchTab('library'); }, 80); }
    if (startItem.openBriefLibrary) { setTimeout(function() { csSwitchTab('brief-library'); }, 80); }
    if (startItem.cmCampaignId)  { setTimeout(function() { cmOpenDetail(startItem.cmCampaignId, true); }, 80); }
    if (startItem.mp2Tab)        { setTimeout(function() { mp2SwitchHomeTab(startItem.mp2Tab); }, 80); }
    if (startItem.mp2AdGroupId)     { setTimeout(function() { mp2OpenPlanById(startItem.mp2AdGroupId, true); }, 80); }
  } else {
    document.getElementById('err').textContent = 'Invalid credentials.';
  }
}

function logout() {
  document.getElementById('app').classList.remove('show');
  document.getElementById('auth').style.display = 'block';
  setTimeout(function() { document.getElementById('auth').classList.remove('gone'); }, 10);
  document.getElementById('pw').value = '';
  document.getElementById('err').textContent = '';
}

// ── Init ──

document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('tog').addEventListener('click', toggleSb);
document.getElementById('pw').addEventListener('keydown', function(e) { if (e.key === 'Enter') login(); });
document.getElementById('em').addEventListener('keydown', function(e) { if (e.key === 'Enter') login(); });

// Inject WIP icons (ico.* available after icons.js loads)
document.getElementById('wip-ico-0').innerHTML = ico.sdtform;
document.getElementById('wip-ico-1').innerHTML = ico.taxonomy;
document.getElementById('wip-ico-2').innerHTML = ico.showcase;

updateOrgMgmtVisibility();

// media-planner-v2.js — Media Planner page  (self-contained module)

// ── Shared creative assets for asset strips (plan detail + analysis) ──────────
var mp2MockCreatives = [
  { id:'mpc1', name:'campaign-hero.mp4', type:'MP4', thumb:'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=640&h=360&fit=crop&q=80', templates:[] },
  { id:'mpc2', name:'banner-static.jpg', type:'JPG', thumb:'/Asset%20Demo%20K1/walmart-ad.jpg',                    templates:[] }
];

function _mp2CreativeTilesHtml(dbCreatives) {
  var PLUS = '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  // Use DB creatives if provided, otherwise fall back to mock
  var list = (dbCreatives && dbCreatives.length) ? dbCreatives.map(function(cr) {
    return { id: cr.id || ('dbcr' + cr.dbId), name: cr.name, thumb: cr.thumb || '', type: cr.fileType || cr.assetType || 'VoD', templates: [] };
  }) : mp2MockCreatives;

  if (!list.length) {
    return '<span style="font-size:12px;color:var(--faint);font-style:italic">No assets linked to this campaign.</span>';
  }

  return list.map(function(cr) {
    var tpls = cr.templates || [];
    var tplChips = tpls.map(function(t) {
      var label = (t && typeof t === 'object') ? (t.name || String(t.id || '')) : String(t);
      return '<span style="font-size:9px;font-weight:600;padding:2px 5px;border-radius:4px;background:var(--subtle);color:var(--muted);border:1px solid var(--border);white-space:nowrap;flex-shrink:0">' + label + '</span>';
    }).join('');
    var addTplBtn = '<button onclick="event.stopPropagation();mp2AddTemplate(\'' + cr.id + '\')" style="display:inline-flex;align-items:center;gap:3px;height:18px;padding:0 6px;border:1px solid var(--border-md);border-radius:5px;font-size:9px;font-weight:500;color:var(--muted);background:var(--surface);cursor:pointer;font-family:inherit;transition:border .15s" onmouseover="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'">' + PLUS + 'Add Template</button>';
    var bottomSection = tpls.length
      ? '<div style="padding:4px 6px 6px;border-top:1px solid var(--border);flex:1;display:flex;flex-wrap:wrap;align-content:flex-start;gap:3px">' + tplChips + '</div>'
      : '<div style="padding:5px 6px 6px;border-top:1px solid var(--border);flex:1;display:flex;align-items:center;justify-content:center">' + addTplBtn + '</div>';
    var hasTpls = tpls.length > 0;
    var thumbHtml = cr.thumb
      ? '<img src="' + cr.thumb + '" style="width:100%;height:100%;object-fit:cover;display:block">'
      : '<div style="width:100%;height:100%;background:#e5e7eb;display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9l5-5 4 4 3-3 6 6"/></svg></div>';
    return '<div onclick="mp2AddTemplate(\'' + cr.id + '\')" style="border:1px solid var(--border);border-radius:8px;overflow:hidden;background:var(--surface);position:relative;display:flex;flex-direction:column;width:140px;flex-shrink:0;' + (hasTpls ? 'cursor:pointer' : '') + '" ' + (hasTpls ? 'onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--border)\'"' : '') + '>'
      + '<div style="aspect-ratio:16/9;background:#e5e7eb;overflow:hidden;flex-shrink:0">' + thumbHtml + '</div>'
      + '<div style="position:absolute;top:4px;left:4px;font-size:8px;font-weight:700;padding:1px 5px;border-radius:3px;background:rgba(0,0,0,.5);color:#fff;letter-spacing:.3px">' + (cr.type || 'VoD') + '</div>'
      + '<div style="padding:4px 6px;flex-shrink:0">'
      +   '<div style="font-size:10px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + cr.name + '</div>'
      + '</div>'
      + bottomSection
      + '</div>';
  }).join('');
}

function mp2AddTemplate(crId) {
  var selectedIdx = 0;
  for (var i = 0; i < mp2MockCreatives.length; i++) {
    if (mp2MockCreatives[i].id === crId) { selectedIdx = i; break; }
  }
  window._mp2AddTemplateCreativeId = true;
  window._mp2TemplateReturnUrl  = location.pathname;
  window._mp2TemplateReturnState = history.state || {};
  csEditorAssets = mp2MockCreatives.map(function(cr) {
    return { id: cr.id, name: cr.name, type: cr.type, thumb: cr.thumb, templates: (cr.templates || []).slice() };
  });
  csBuildSelectedAsset = selectedIdx;
  var existing = document.getElementById('cs-editor-overlay');
  if (existing) existing.remove();
  var overlay = document.createElement('div');
  overlay.id = 'cs-editor-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;background:#0d1117';
  overlay.innerHTML = _csEditorHtml();
  document.body.appendChild(overlay);
  history.pushState({ id: 'creative-studio', label: 'Creative Studio', openEditor: true, csAssetId: crId }, '', '/creative-studio/build-template/' + crId);
}

var mp2TaxStep      = 'upload';
var mp2TaxInputType = 'video';
var mp2TaxFileName  = '';

function renderMediaPlannerV2() {
  // Reset client/campaign selection state so data re-fetches with current org filter
  mp2Step1Clients        = null;
  mp2SelectedClientId    = null;
  mp2Step1Campaigns      = null;
  mp2SelectedCampaign    = null;
  mp2LibrarySelected     = null;
  mp2LibrarySelectedItems = [];
  setTimeout(function() {
    mp2TaxStep = 'upload'; mp2TaxInputType = 'video'; mp2TaxFileName = '';
    sdtInjectStyles();
    mp2InjectSliderStyles();
    mp2SwitchHomeTab(mp2HomeTab, true); // restore correct tab without pushing history
  }, 0);
  var mp2PillTabs = [{id:'new-plan',label:'New Moments Match'},{id:'analyses',label:'Previous Moments Match',dividerBefore:true}];
  return UI.pageHeader({ title: 'Moments Match', subtitle: 'AI-powered inventory matching and media plan generation'})
    + '<div id="mp2-pills" style="margin-bottom:20px">' + UI.tabNav(mp2PillTabs, mp2HomeTab, 'mp2SwitchHomeTab') + '</div>'
    + `<div id="sdt-panel-taxonomy2">
  <div class="cs-card" id="mp2-outer-card" style="padding:${mp2HomeTab === 'new-plan' ? '32px' : '0'};overflow:hidden">
    <div id="tx2-content-area"></div>
  </div>
</div>`;
}

function mp2OpenPlanById(id, noPush) {
  var idx = savedMediaPlansV2.findIndex(function(p) { return p.id === id; });
  if (idx < 0) { mp2SwitchHomeTab('analyses'); return; }
  mp2ShowMediaPlanDetail(idx, noPush);
}

function mp2ShowMediaPlanDetail(idx, noPush) {
  var plan = savedMediaPlansV2[idx];
  if (!plan) return;
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  mp2HomeTab = 'analyses';

  // Hide tab nav while a plan detail is open
  var pills = document.getElementById('mp2-pills');
  if (pills) pills.style.display = 'none';

  var outerCard = document.getElementById('mp2-outer-card');
  if (outerCard) outerCard.style.padding = '20px';

  var TH  = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border);white-space:nowrap';
  var TOT = 'padding:10px 12px;font-size:12px;font-weight:600;color:var(--text);border-top:2px solid var(--border-md);background:var(--bg)';
  var DELBTN = 'border:none;background:none;cursor:pointer;color:var(--faint);padding:2px 6px;border-radius:5px;line-height:1;font-size:16px;transition:color .12s';
  var pencilSvg = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var CPM_DT = { 'Prime Time': 25, 'Daytime': 15, 'Late Night': 18, 'Morning': 12, 'Early Fringe': 20 };

  // Build rows from plan.moments
  var allItems = (plan.moments || []).map(function(m, mi) {
    return {
      name:             m.name,
      channels:         Array.isArray(m.channels) ? m.channels : [],
      pods:        m.pods || 0,
      impressionsLabel: m.impressionsLabel || null,
      _cpm:             m.cpm || 0,
      _impNum:          m.impressionsNum || 0,
      _dollarsNum:      (m.impressionsNum || 0) * 1000 * (m.cpm || 0),
      type:             m.type || 'ads',
      _idx:             mi
    };
  });

  var totalImpNum     = allItems.reduce(function(s, it) { return s + it._impNum;     }, 0);
  var totalDollarsNum = allItems.reduce(function(s, it) { return s + it._dollarsNum; }, 0);
  var avgCpm          = totalImpNum > 0 ? Math.round(totalDollarsNum / (totalImpNum * 1000)) : 0;
  var fmtTotImp       = totalImpNum >= 1 ? totalImpNum.toFixed(1) + 'M' : totalImpNum > 0 ? Math.round(totalImpNum * 1000) + 'K' : '—';
  var fmtAvgCpm       = avgCpm > 0 ? '$' + avgCpm : '—';

  var fmtDollars = function(n) {
    if (!n) return '—';
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return '$' + Math.round(n / 1000) + 'K';
    return '$' + Math.round(n);
  };
  var fmtTotDollars = fmtDollars(totalDollarsNum);

  var tableRowsHtml = allItems.length === 0
    ? '<tr><td colspan="8" style="padding:32px;text-align:center;font-size:12px;color:var(--faint)">No moments in this plan.</td></tr>'
    : allItems.map(function(item) {
        var rowType = (item.type || '').toLowerCase();
        var typeBadge = rowType === 'live'
          ? '<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;background:#fef2f2;border:1px solid #fecaca;border-radius:20px;padding:2px 8px;color:#dc2626;white-space:nowrap"><span style="width:5px;height:5px;border-radius:50%;background:#ef4444;display:inline-block;box-shadow:0 0 4px #ef4444"></span>Live</span>'
          : rowType === 'organic pause' || rowType === 'organic'
          ? '<span style="font-size:10px;font-weight:600;background:#f0fdfa;border:1px solid #99f6e4;border-radius:20px;padding:2px 8px;color:#0f766e;white-space:nowrap">Organic Pause</span>'
          : '<span style="font-size:10px;font-weight:600;background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:2px 8px;color:#1d4ed8;white-space:nowrap">VoD</span>';
        var chCount = item.channels.length;
        var chList  = item.channels.join(', ');
        var chChip  = chCount > 0
          ? '<div style="position:relative;display:inline-block" onmouseenter="this.querySelector(\'.mp2-ch-tt\').style.display=\'block\'" onmouseleave="this.querySelector(\'.mp2-ch-tt\').style.display=\'none\'">'
          +   '<span class="mp2-ch-chip" style="font-size:10px;font-weight:500;color:var(--muted);background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:2px 8px;cursor:default;white-space:nowrap">' + chCount + ' channel' + (chCount > 1 ? 's' : '') + '</span>'
          +   '<div style="display:none;position:absolute;left:0;top:calc(100% + 4px);z-index:200;background:#1e293b;color:#e2e8f0;font-size:10px;line-height:1.6;padding:6px 10px;border-radius:7px;box-shadow:0 4px 16px rgba(0,0,0,.2);white-space:nowrap;pointer-events:none" class="mp2-ch-tt">' + chList + '</div>'
          + '</div>'
          : '<span style="color:var(--faint)">—</span>';
        var estDollars = fmtDollars(item._dollarsNum);
        return '<tr style="border-bottom:1px solid var(--border)">'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text)">' + item.name + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text);text-align:right;white-space:nowrap">' + (item.pods || '—') + '</td>'
          + '<td style="padding:10px 12px">' + typeBadge + '</td>'
          + '<td style="padding:10px 12px">' + chChip + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text);text-align:right;white-space:nowrap">' + (item.impressionsLabel || '—') + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text);text-align:right;white-space:nowrap">' + (item._cpm > 0 ? '$' + item._cpm : '—') + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:600;color:var(--text);text-align:right;white-space:nowrap">' + estDollars + '</td>'
          + '<td style="padding:6px 8px;text-align:center;width:32px">'
          +   '<button style="' + DELBTN + '" onclick="mp2DeletePlanItem(' + idx + ',' + item._idx + ')" onmouseenter="this.style.color=\'var(--accent)\'" onmouseleave="this.style.color=\'var(--faint)\'">×</button>'
          + '</td>'
          + '</tr>';
      }).join('');

  // Update URL
  if (!noPush && plan.id) {
    history.pushState({ id: 'media-planner-v2', label: 'Media Planner', mp2PlanId: plan.id }, '', '/media-planner-v2/media-plans/' + plan.id);
  }

  // Update breadcrumb
  var pgname = document.getElementById('content-bc');
  if (pgname) pgname.innerHTML =
    '<span style="font-weight:400;opacity:.55;cursor:pointer" onclick="mp2SwitchHomeTab(\'plans\')">Moments Match</span>'
    + ' &nbsp;/&nbsp; ' + plan.name;

  // ── Campaign panel (same structure as analysis detail) ────────────────────────
  function infoField(label, value) {
    return '<div style="display:flex;align-items:baseline;gap:8px;min-width:0">'
      + '<span style="font-size:10px;font-weight:600;color:var(--faint);white-space:nowrap;flex-shrink:0">' + label + '</span>'
      + '<span style="font-size:12px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + value + '</span>'
      + '</div>';
  }
  function chipList(items) {
    if (!items || !items.length) return '<span style="font-size:12px;color:var(--faint)">—</span>';
    return items.map(function(v) {
      return '<span style="display:inline-flex;align-items:center;font-size:10px;font-weight:500;color:var(--text);padding:2px 8px;border:1px solid var(--border);border-radius:999px;background:var(--bg);white-space:nowrap">' + v + '</span>';
    }).join('');
  }
  function sectionLabel(text) {
    return '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--faint);margin-bottom:10px">' + text + '</div>';
  }

  var cd = plan._campaignData || null;
  var planCampName = cd ? cd.name        : (plan.campaign  || '—');
  var planAdvName  = cd ? cd.advertiser  : (plan.advertiser || '—');
  var planGeo      = cd && cd.geography && cd.geography.length ? cd.geography.join(', ') : 'All regions';
  var planFdLabel  = cd && cd.start && cd.start !== '—' ? cd.start + ' → ' + (cd.end || '—') :
                     (plan.flightStart && plan.flightEnd) ? plan.flightStart + ' → ' + plan.flightEnd : '—';
  var SEP = '<span style="color:var(--border-md);margin:0 10px">·</span>';

  function metaChunk(label, value) {
    return '<span style="font-size:12px;color:var(--faint)">' + label + ':</span>'
      + '<span style="font-size:12px;font-weight:500;color:var(--text);margin-left:5px">' + value + '</span>';
  }

  var campCardHeader =
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 20px;border-bottom:1px solid var(--border)">'
    + '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px 0;min-width:0">'
    +   metaChunk('Campaign', planCampName)
    +   SEP
    +   metaChunk('Advertiser', planAdvName)
    +   SEP
    +   metaChunk('Flight Dates', planFdLabel)
    +   SEP
    +   metaChunk('Geography', planGeo)
    + '</div>'
    + '<button id="mp2-plan-camp-toggle" onclick="mp2TogglePlanCampStrip()" title="Toggle campaign details" '
    +   'style="width:26px;height:26px;border:1px solid var(--border-md);border-radius:6px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:15px;font-weight:300;line-height:1;font-family:inherit;transition:border-color .12s,color .12s;flex-shrink:0;margin-left:16px" '
    +   'onmouseover="this.style.borderColor=\'var(--text)\';this.style.color=\'var(--text)\'" '
    +   'onmouseout="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'">'
    +   '+'
    + '</button>'
    + '</div>';

  var campAssetStrip =
    '<div id="mp2-plan-camp-strip" style="border-bottom:1px solid var(--border);display:none">'
    + '<div style="display:flex;align-items:stretch">'

    + '<div style="flex:1;padding:12px 20px;min-width:0">'
    + sectionLabel('Asset')
    + '<div style="display:flex;gap:10px;flex-wrap:wrap">' + _mp2CreativeTilesHtml(plan._creativesData) + '</div>'
    + '</div>'

    + '<div style="width:1px;background:var(--border);flex-shrink:0"></div>'

    + '<div style="flex:1;padding:12px 20px;min-width:0">'
    + sectionLabel('Campaign')
    + '<div style="display:flex;flex-direction:column;gap:8px">'
    +   infoField('Campaign', planCampName)
    +   infoField('Advertiser', planAdvName)
    +   infoField('Geography', planGeo)
    +   infoField('Flight Dates', planFdLabel)
    + '</div>'
    + '</div>'

    + '<div style="width:1px;background:var(--border);flex-shrink:0"></div>'

    + '<div style="flex:1;padding:12px 20px;min-width:0">'
    + sectionLabel('Additional Details')
    + '<div style="display:flex;flex-direction:column;gap:8px">'
    +   infoField('Goal', cd ? (cd.goal || '—') : '—')
    +   infoField('Budget', cd ? (cd.budget || '—') : '—')
    +   infoField('Status', cd ? (cd.status || '—') : '—')
    +   infoField('Partners', cd && cd.partners && cd.partners.length ? cd.partners.join(', ') : '—')
    + '</div>'
    + '</div>'

    + '</div>'
    + '</div>';

  var campPanel = '<div class="cs-card" style="padding:0;overflow:hidden;margin-bottom:20px">' + campCardHeader + campAssetStrip + '</div>';

  ca.innerHTML =

    // Campaign accordion — TOP
    campPanel

    // Plan card (accordion)
    + (function() {
        var planCardHeader =
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 20px;border-bottom:1px solid var(--border)">'
          + '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px 0;min-width:0">'
          +   metaChunk('Plan Name', plan.name)
          +   SEP
          +   metaChunk('Created by', plan.author || '—')
          +   SEP
          +   metaChunk('At', plan.date || '—')
          +   SEP
          +   metaChunk('Moments', allItems.length + '')
          +   (totalImpNum > 0 ? SEP + metaChunk('Est. Impr.', fmtTotImp) : '')
          +   (avgCpm > 0     ? SEP + metaChunk('Avg CPM', fmtAvgCpm)    : '')
          +   (totalDollarsNum > 0 ? SEP + metaChunk('Est. $ Value', fmtTotDollars) : '')
          + '</div>'
          + '<button id="mp2-plan-body-toggle" onclick="mp2TogglePlanBody()" '
          +   'style="width:26px;height:26px;border:1px solid var(--border-md);border-radius:6px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:15px;font-weight:300;line-height:1;font-family:inherit;transition:border-color .12s,color .12s;flex-shrink:0;margin-left:16px" '
          +   'onmouseover="this.style.borderColor=\'var(--text)\';this.style.color=\'var(--text)\'" '
          +   'onmouseout="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'">−</button>'
          + '</div>';

        var planCardBody =
          '<div id="mp2-plan-body">'

          // Title row
          + '<div style="padding:16px 20px 0">'
          +   '<div id="mp-title-wrap-' + idx + '">'
          +     '<div id="mp-title-display-' + idx + '" style="display:flex;align-items:center;gap:8px">'
          +       '<span onclick="mp2StartEditPlanName(' + idx + ')" style="font-size:18px;font-weight:600;color:var(--text);letter-spacing:-.3px;cursor:pointer">' + plan.name + '</span>'
          +       '<button onclick="mp2StartEditPlanName(' + idx + ')" title="Rename plan" style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--faint);cursor:pointer;padding:0;transition:border-color .12s,color .12s,background .12s" onmouseenter="this.style.borderColor=\'var(--border-md)\';this.style.background=\'var(--bg)\';this.style.color=\'var(--text)\'" onmouseleave="this.style.borderColor=\'var(--border)\';this.style.background=\'transparent\';this.style.color=\'var(--faint)\'">' + pencilSvg + '</button>'
          +       '<button onclick="mp2DeleteMediaPlan(' + idx + ')" title="Delete plan" style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--faint);cursor:pointer;padding:0;transition:border-color .12s,color .12s,background .12s" onmouseenter="this.style.borderColor=\'#fecaca\';this.style.background=\'#fff5f5\';this.style.color=\'#ef4444\'" onmouseleave="this.style.borderColor=\'var(--border)\';this.style.background=\'transparent\';this.style.color=\'var(--faint)\'">'
          +         '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5A1 1 0 004.8 12.5h4.4a1 1 0 001-.9L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          +       '</button>'
          +     '</div>'
          +   '</div>'
          +   '<div style="display:flex;align-items:center;gap:6px;margin-top:4px;margin-bottom:16px">'
          +     '<span style="font-size:12px;color:var(--faint)">Created by ' + (plan.author || '—') + ',</span>'
          +     '<span style="font-size:12px;color:var(--faint)">' + (plan.date || '—') + '</span>'
          +   '</div>'
          + '</div>'

          // Table
          + '<div style="border-top:1px solid var(--border)">'
          +   '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:var(--bg);position:sticky;top:0;z-index:1">'
          +     '<th style="text-align:left;' + TH + '">Moment</th>'
          +     '<th style="text-align:right;' + TH + '">PODs</th>'
          +     '<th style="text-align:left;' + TH + '">Type</th>'
          +     '<th style="text-align:left;' + TH + '">Channels</th>'
          +     '<th style="text-align:right;' + TH + '">Est. Imp.</th>'
          +     '<th style="text-align:right;' + TH + '">Est. CPM</th>'
          +     '<th style="text-align:right;' + TH + '">Est. $ Value</th>'
          +     '<th style="' + TH + ';width:40px"></th>'
          +   '</tr></thead>'
          +   '<tbody>' + tableRowsHtml + '</tbody>'
          +   '<tfoot style="position:sticky;bottom:0;z-index:1"><tr>'
          +     '<td style="' + TOT + '">Total</td>'
          +     '<td style="' + TOT + '"></td>'
          +     '<td style="' + TOT + '"></td>'
          +     '<td style="' + TOT + '"></td>'
          +     '<td style="' + TOT + ';text-align:right">' + fmtTotImp + '</td>'
          +     '<td style="' + TOT + ';text-align:right">' + fmtAvgCpm + '</td>'
          +     '<td style="' + TOT + ';text-align:right">' + fmtTotDollars + '</td>'
          +     '<td style="' + TOT + '"></td>'
          +   '</tr></tfoot>'
          +   '</table>'
          + '</div>'

          // Add more moments — inside card body
          + '<div style="padding:12px 20px;border-top:1px solid var(--border)">'
          +   '<button onclick="mp2AddMoreMoments(' + idx + ')" style="width:100%;height:36px;display:flex;align-items:center;justify-content:center;gap:7px;border-radius:8px;border:1px solid var(--border-md);background:var(--surface);color:var(--text);font-size:13px;font-weight:500;cursor:pointer;font-family:inherit" onmouseenter="this.style.background=\'var(--bg)\'" onmouseleave="this.style.background=\'var(--surface)\'">'
          +     '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
          +     'Add more moments'
          +   '</button>'
          + '</div>'

          + '</div>'; // #mp2-plan-body

        return '<div class="cs-card" style="padding:0;overflow:hidden;margin-bottom:20px">' + planCardHeader + planCardBody + '</div>';
      })()

    // Action buttons
    + '<div style="display:flex;gap:8px">'
    +   '<button id="inv-export-btn-' + idx + '" onclick="mp2ExportInsertionOrder(' + idx + ',this)" style="flex:1;height:40px;display:flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;border:none;background:#0f172a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit" onmouseenter="this.style.background=\'#1e293b\'" onmouseleave="this.style.background=\'#0f172a\'">'
    +     '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +     'Export to IO'
    +   '</button>'
    +   '<button onclick="mp2ActivateDSP(' + idx + ')" style="flex:1;height:40px;display:flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;border:none;background:#0f172a;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s" onmouseenter="this.style.background=\'#1e293b\'" onmouseleave="this.style.background=\'#0f172a\'">'
    +     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/></svg>'
    +     'Send to DSP / SSP'
    +   '</button>'
    + '</div>';
}

function mp2SaveCurrentAnalysis() {
  var btn = event && event.currentTarget;
  if (btn) { btn.textContent = 'Saving…'; btn.disabled = true; }
  var analysisId = _mp2LastAnalysisId;
  if (!analysisId) {
    if (btn) { btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save'; btn.disabled = false; }
    return;
  }
  fetch('/api/moments-match?moments_match_analysis_id=' + analysisId, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_plans: _mp2CurrentAnalysisPlans.map(function(p) { return p._dbRaw || p; }) })
  })
  .then(function(r) { return r.json(); })
  .then(function() {
    if (btn) {
      btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Saved';
      setTimeout(function() {
        btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save';
        btn.disabled = false;
      }, 1800);
    }
  })
  .catch(function() {
    if (btn) { btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save'; btn.disabled = false; }
  });
}

function mp2OpenDistributeModal() {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1100;display:flex;align-items:center;justify-content:center';

  function renderCards(list) {
    if (!list.length) return '<div style="padding:24px;text-align:center;font-size:12px;color:var(--faint);grid-column:1/-1">No partners found</div>';
    return list.map(function(p) {
      var color     = (typeof _dspColors !== 'undefined' && _dspColors[p.name]) || '#5A6578';
      var logoHtml  = (typeof _dspLogoHtml === 'function') ? _dspLogoHtml(p.name, 36) : '<div style="width:36px;height:36px;border-radius:9px;background:' + color + ';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0">' + p.name.charAt(0) + '</div>';
      var typeColor = p.type === 'DSP' ? '#1d4ed8' : '#7c3aed';
      var typeBg    = p.type === 'DSP' ? '#eff6ff' : '#f5f3ff';
      var typeBorder= p.type === 'DSP' ? '#bfdbfe' : '#ddd6fe';
      var pName = p.name.replace(/'/g, "\\'");
      return '<button onclick="mp2DistSelectPartner(\'' + pName + '\',this)" data-partner="' + p.name.replace(/"/g,'&quot;') + '" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--surface);cursor:pointer;font-family:inherit;text-align:left;transition:border-color .12s,box-shadow .12s">'
        + logoHtml
        + '<div style="min-width:0">'
        +   '<div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + p.name + '</div>'
        +   '<span style="display:inline-block;margin-top:3px;font-size:9px;font-weight:600;padding:1px 5px;border-radius:4px;border:1px solid ' + typeBorder + ';color:' + typeColor + ';background:' + typeBg + '">' + p.type + '</span>'
        + '</div>'
        + '</button>';
    }).join('');
  }

  overlay.innerHTML =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:0;width:560px;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,.18);font-family:inherit;overflow:hidden">'
    + '<div style="padding:20px 20px 14px;border-bottom:1px solid var(--border);flex-shrink:0">'
    +   '<div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:2px">Save and Distribute</div>'
    +   '<div style="font-size:12px;color:var(--muted)">Select a partner to push this moments group to</div>'
    + '</div>'
    + '<div style="padding:12px 16px;border-bottom:1px solid var(--border);flex-shrink:0">'
    +   '<input id="mp2-dist-search" type="text" placeholder="Search partners…" oninput="mp2DistSearch(this.value)" style="width:100%;box-sizing:border-box;height:34px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:12px;font-family:inherit;outline:none" onfocus="this.style.borderColor=\'var(--accent)\'" onblur="this.style.borderColor=\'var(--border)\'">'
    + '</div>'
    + '<div id="mp2-dist-cards" style="flex:1;overflow-y:auto;padding:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;align-content:start">'
    + '<div style="grid-column:1/-1;text-align:center;font-size:12px;color:var(--faint);padding:16px">Loading partners…</div>'
    + '</div>'
    + '<div style="padding:12px 16px;border-top:1px solid var(--border);flex-shrink:0;display:flex;gap:8px">'
    +   '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="flex:1;height:34px;border-radius:8px;border:1px solid var(--border-md);background:none;color:var(--muted);font-size:12px;font-weight:500;cursor:pointer;font-family:inherit">Cancel</button>'
    +   '<button id="mp2-dist-btn" disabled onclick="mp2Distribute()" style="flex:2;height:34px;border-radius:8px;border:none;background:#0f172a;color:#fff;font-size:12px;font-weight:600;cursor:not-allowed;font-family:inherit;opacity:.4;transition:opacity .13s">Distribute</button>'
    + '</div>'
    + '</div>';

  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);

  // Fetch from DB
  fetch('/api/dsp-ssp')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      window._mp2DistPartners   = d.library || [];
      window._mp2DistRenderCards = renderCards;
      var el = document.getElementById('mp2-dist-cards');
      if (el) el.innerHTML = renderCards(window._mp2DistPartners);
    })
    .catch(function() {
      var el = document.getElementById('mp2-dist-cards');
      if (el) el.innerHTML = '<div style="grid-column:1/-1;text-align:center;font-size:12px;color:var(--faint);padding:16px">Failed to load partners</div>';
    });
}

function mp2DistSearch(q) {
  var el = document.getElementById('mp2-dist-cards');
  if (!el) return;
  window._mp2DistSelected = null;
  var list = (window._mp2DistPartners || []).filter(function(p) {
    return !q || p.name.toLowerCase().includes(q.toLowerCase()) || (p.type||'').toLowerCase().includes(q.toLowerCase()) || (p.category||'').toLowerCase().includes(q.toLowerCase());
  });
  el.innerHTML = window._mp2DistRenderCards ? window._mp2DistRenderCards(list) : '';
  var btn = document.getElementById('mp2-dist-btn');
  if (btn) { btn.disabled = true; btn.style.opacity = '.4'; btn.style.cursor = 'not-allowed'; }
}

function mp2DistSelectPartner(name, el) {
  window._mp2DistSelected = name;
  // Deselect all cards
  var cards = document.querySelectorAll('#mp2-dist-cards button');
  cards.forEach(function(c) {
    c.style.borderColor = 'var(--border)';
    c.style.boxShadow   = 'none';
    c.style.background  = 'var(--surface)';
  });
  // Highlight selected
  var color = (typeof _dspColors !== 'undefined' && _dspColors[name]) || '#0f172a';
  el.style.borderColor = color;
  el.style.boxShadow   = '0 0 0 3px ' + color + '22';
  el.style.background  = 'var(--subtle)';
  // Enable distribute button
  var btn = document.getElementById('mp2-dist-btn');
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
}

function mp2Distribute() {
  // placeholder — no action yet
}

function mp2ActivateDSP(idx) {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1100;display:flex;align-items:center;justify-content:center';
  var dsps = [
    { name: 'DV360',          logo: 'G', color: '#4285F4' },
    { name: 'The Trade Desk', logo: 'T', color: '#00C851' },
    { name: 'Xandr',          logo: 'X', color: '#FF6B35' }
  ];
  overlay.innerHTML =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px;width:360px;box-shadow:0 8px 32px rgba(0,0,0,.18);font-family:inherit">'
    + '<div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px">Activate via DSP</div>'
    + '<div style="font-size:12px;color:var(--muted);margin-bottom:20px">Select the DSP to push this media plan to</div>'
    + '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">'
    + dsps.map(function(d) {
        return '<button onclick="mp2DSPPush(\'' + d.name + '\',this.closest(\'.dsp-overlay\'))" style="display:flex;align-items:center;gap:12px;height:48px;padding:0 14px;border-radius:10px;border:1px solid var(--border);background:var(--surface);cursor:pointer;font-family:inherit;text-align:left;transition:border-color .12s" onmouseenter="this.style.borderColor=\'' + d.color + '\'" onmouseleave="this.style.borderColor=\'var(--border)\'">'
          + '<div style="width:32px;height:32px;border-radius:8px;background:' + d.color + ';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0">' + d.logo + '</div>'
          + '<div>'
          +   '<div style="font-size:13px;font-weight:500;color:var(--text)">' + d.name + '</div>'
          +   '<div style="font-size:11px;color:var(--muted)">Connect & push line items</div>'
          + '</div>'
          + '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-left:auto;flex-shrink:0;color:var(--faint)"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          + '</button>';
      }).join('')
    + '</div>'
    + '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="width:100%;height:36px;border-radius:8px;border:1px solid var(--border-md);background:none;color:var(--muted);font-size:13px;font-weight:500;cursor:pointer;font-family:inherit">Cancel</button>'
    + '</div>';
  overlay.classList.add('dsp-overlay');
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

var DSP_PARAMS_V2 = {
  'DV360': [
    { id: 'dv-advertiser', label: 'Advertiser ID',       placeholder: 'e.g. 123456789',     required: true },
    { id: 'dv-campaign',   label: 'Campaign ID',         placeholder: 'e.g. 987654321',     required: true },
    { id: 'dv-io-name',    label: 'Insertion Order Name',placeholder: 'e.g. Nike_Q3_CTV',   required: true },
    { id: 'dv-start',      label: 'Flight Start',        placeholder: '',  type: 'date',    required: true },
    { id: 'dv-end',        label: 'Flight End',          placeholder: '',  type: 'date',    required: true },
    { id: 'dv-budget',     label: 'Budget (USD)',        placeholder: 'e.g. 50000',         required: false }
  ],
  'The Trade Desk': [
    { id: 'ttd-advertiser',label: 'Advertiser ID',       placeholder: 'e.g. ttd_adv_001',   required: true },
    { id: 'ttd-campaign',  label: 'Campaign ID',         placeholder: 'e.g. ttd_camp_001',  required: true },
    { id: 'ttd-adgroup',   label: 'Moments Group Name',  placeholder: 'e.g. CTV_Moments_Q3',required: true },
    { id: 'ttd-start',     label: 'Flight Start',        placeholder: '',  type: 'date',    required: true },
    { id: 'ttd-end',       label: 'Flight End',          placeholder: '',  type: 'date',    required: true },
    { id: 'ttd-cpm',       label: 'Target CPM (USD)',    placeholder: 'e.g. 18',            required: false }
  ],
  'Xandr': [
    { id: 'xndr-member',   label: 'Member ID',           placeholder: 'e.g. 1234',          required: true },
    { id: 'xndr-advertiser',label:'Advertiser ID',       placeholder: 'e.g. 5678',          required: true },
    { id: 'xndr-order',    label: 'Order Name',          placeholder: 'e.g. Nike_CTV_2026', required: true },
    { id: 'xndr-start',    label: 'Flight Start',        placeholder: '',  type: 'date',    required: true },
    { id: 'xndr-end',      label: 'Flight End',          placeholder: '',  type: 'date',    required: true },
    { id: 'xndr-freq',     label: 'Frequency Cap',       placeholder: 'e.g. 3 per day',     required: false }
  ]
};

var DSP_COLORS_V2 = { 'DV360': '#4285F4', 'The Trade Desk': '#00C851', 'Xandr': '#FF6B35' };
var DSP_LOGOS_V2  = { 'DV360': 'G',       'The Trade Desk': 'T',       'Xandr': 'X' };

function mp2DSPPush(dspName, prevOverlay) {
  if (prevOverlay) prevOverlay.remove();

  var color  = DSP_COLORS_V2[dspName];
  var logo   = DSP_LOGOS_V2[dspName];
  var fields = DSP_PARAMS_V2[dspName] || [];
  var INP    = 'width:100%;box-sizing:border-box;height:34px;padding:0 10px;border:1px solid var(--border);border-radius:7px;background:var(--surface);color:var(--text);font-size:12px;font-family:inherit;outline:none;';

  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1100;display:flex;align-items:center;justify-content:center';

  overlay.innerHTML =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px;width:420px;box-shadow:0 8px 32px rgba(0,0,0,.18);font-family:inherit;max-height:90vh;overflow-y:auto">'

    // Header
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">'
    +   '<div style="width:36px;height:36px;border-radius:9px;background:' + color + ';display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0">' + logo + '</div>'
    +   '<div>'
    +     '<div style="font-size:14px;font-weight:600;color:var(--text)">' + dspName + '</div>'
    +     '<div style="font-size:11px;color:var(--muted)">Enter campaign parameters to push the plan</div>'
    +   '</div>'
    + '</div>'

    // Fields
    + '<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px">'
    + fields.map(function(f) {
        var inputHtml = f.type === 'date'
          ? '<input id="dsp-field-' + f.id + '" type="date" style="' + INP + '">'
          : '<input id="dsp-field-' + f.id + '" type="text" placeholder="' + f.placeholder + '" style="' + INP + '">';
        return '<div>'
          + '<label style="display:block;font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">'
          +   f.label + (f.required ? ' <span style="color:var(--accent)">*</span>' : ' <span style="color:var(--faint);font-weight:400;text-transform:none;letter-spacing:0">(optional)</span>')
          + '</label>'
          + inputHtml
          + '</div>';
      }).join('')
    + '</div>'

    // Actions
    + '<div style="display:flex;gap:8px">'
    +   '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="flex:1;height:38px;border-radius:8px;border:1px solid var(--border-md);background:none;color:var(--muted);font-size:13px;font-weight:500;cursor:pointer;font-family:inherit">Cancel</button>'
    +   '<button onclick="mp2DSPSubmit(\'' + dspName + '\',this)" style="flex:2;height:38px;border-radius:8px;border:none;background:' + color + ';color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:7px">'
    +     '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +     'Push to ' + dspName
    +   '</button>'
    + '</div>'
    + '</div>';

  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function mp2DSPSubmit(dspName, btn) {
  // Validate required fields
  var fields = DSP_PARAMS_V2[dspName] || [];
  var missing = fields.filter(function(f) {
    if (!f.required) return false;
    var el = document.getElementById('dsp-field-' + f.id);
    return !el || !el.value.trim();
  });
  if (missing.length > 0) {
    missing.forEach(function(f) {
      var el = document.getElementById('dsp-field-' + f.id);
      if (el) { el.style.borderColor = 'var(--accent)'; el.focus(); }
    });
    return;
  }

  // Loading state
  var origHTML = btn.innerHTML;
  btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" style="animation:spin 1s linear infinite"><path d="M8 2a6 6 0 100 12A6 6 0 008 2z" stroke="currentColor" stroke-width="1.5" stroke-dasharray="20" stroke-dashoffset="10"/></svg> Pushing…';
  btn.disabled = true;

  setTimeout(function() {
    var overlay = btn.closest('div[style*="fixed"]');
    if (overlay) overlay.remove();

    // Success toast
    var refId = dspName.substring(0, 3).toUpperCase() + '-' + Math.floor(10000 + Math.random() * 90000);
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:1200;background:#0f172a;color:#fff;border-radius:10px;padding:14px 18px;font-size:13px;font-family:inherit;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,.25);animation:cs-badge-pop .25s ease;max-width:320px';
    toast.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><circle cx="8" cy="8" r="7" stroke="#2EAD4B" stroke-width="1.5"/><path d="M5 8.5l2 2 4-4" stroke="#2EAD4B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '<div>'
      +   '<div style="font-weight:600;margin-bottom:2px">Pushed to ' + dspName + '</div>'
      +   '<div style="font-size:11px;color:rgba(255,255,255,.6)">Reference ID: ' + refId + '</div>'
      + '</div>';
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity .3s';
      setTimeout(function() { toast.remove(); }, 300);
    }, 4000);
  }, 1600);
}

function mp2ExportInsertionOrder(idx, btn) {
  var plan = savedMediaPlansV2[idx];
  if (!plan) return;
  if (!btn) return;
  var origHTML = btn.innerHTML;
  btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Exported!';
  btn.style.color = '#16a34a';
  btn.style.borderColor = '#bbf7d0';
  btn.style.background = '#f0fdf4';
  setTimeout(function() {
    if (btn) {
      btn.innerHTML = origHTML;
      btn.style.color = '';
      btn.style.borderColor = '';
      btn.style.background = '';
    }
  }, 1800);
}

function mp2EditMediaPlan(idx) {
  mp2ShowMediaPlanDetail(idx);
}

function mp2StartEditPlanName(idx) {
  var wrap = document.getElementById('mp-title-wrap-' + idx);
  if (!wrap) return;
  var plan = savedMediaPlansV2[idx];
  if (!plan) return;
  wrap.innerHTML =
    '<div style="display:flex;align-items:center;gap:6px">'
    + '<input id="mp-title-input-' + idx + '" type="text" value="' + plan.name.replace(/"/g, '&quot;') + '"'
    + ' style="font-size:18px;font-weight:600;color:var(--text);letter-spacing:-.3px;border:none;border-bottom:2px solid var(--accent);background:transparent;outline:none;padding:0;font-family:inherit;min-width:0;width:260px"'
    + ' onkeydown="if(event.key===\'Enter\')mp2SavePlanName(' + idx + ');if(event.key===\'Escape\')mp2ShowMediaPlanDetail(' + idx + ')">'
    + '<button onclick="mp2SavePlanName(' + idx + ')" style="height:26px;padding:0 10px;border-radius:6px;border:none;background:var(--accent);color:#fff;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;flex-shrink:0">Save</button>'
    + '</div>';
  var input = document.getElementById('mp-title-input-' + idx);
  if (input) { input.focus(); input.select(); }
}

function mp2SavePlanName(idx) {
  var input = document.getElementById('mp-title-input-' + idx);
  if (!input) return;
  var newName = input.value.trim();
  if (newName && savedMediaPlansV2[idx]) savedMediaPlansV2[idx].name = newName;
  mp2ShowMediaPlanDetail(idx);
}

function mp2EditFlightDates(idx, pill) {
  // Remove any existing picker
  var existing = document.getElementById('mp-flight-picker');
  if (existing) { existing.remove(); return; }

  var plan = savedMediaPlansV2[idx];
  var INP  = 'height:32px;padding:0 8px;border:1px solid var(--border);border-radius:7px;background:var(--surface);color:var(--text);font-size:12px;font-family:inherit;outline:none;box-sizing:border-box;width:100%';

  // Parse existing dates to yyyy-mm-dd for the input
  function toInputDate(label) {
    if (!label) return '';
    var months = { Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12' };
    var parts = label.trim().split(' ');
    if (parts.length === 3) return parts[2] + '-' + (months[parts[1]] || '01') + '-' + parts[0].padStart(2,'0');
    return '';
  }
  function fromInputDate(val) {
    if (!val) return '';
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var d = new Date(val + 'T00:00:00');
    if (isNaN(d)) return val;
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  var picker = document.createElement('div');
  picker.id = 'mp-flight-picker';

  var rect = pill.getBoundingClientRect();
  picker.style.cssText = 'position:fixed;z-index:500;background:var(--surface);border:1px solid var(--border-md);border-radius:10px;padding:14px;box-shadow:0 4px 20px rgba(0,0,0,.12);width:240px;font-family:inherit';
  picker.style.top  = (rect.bottom + 6) + 'px';
  picker.style.left = rect.left + 'px';

  picker.innerHTML =
    '<div style="font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px">Flight Dates</div>'
    + '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">'
    +   '<div>'
    +     '<label style="display:block;font-size:11px;color:var(--muted);margin-bottom:3px">Start</label>'
    +     '<input id="mp-flight-start-' + idx + '" type="date" value="' + toInputDate(plan.flightStart) + '" style="' + INP + '">'
    +   '</div>'
    +   '<div>'
    +     '<label style="display:block;font-size:11px;color:var(--muted);margin-bottom:3px">End</label>'
    +     '<input id="mp-flight-end-' + idx + '" type="date" value="' + toInputDate(plan.flightEnd) + '" style="' + INP + '">'
    +   '</div>'
    + '</div>'
    + '<div style="display:flex;gap:6px">'
    +   '<button onclick="document.getElementById(\'mp-flight-picker\').remove()" style="flex:1;height:30px;border-radius:6px;border:1px solid var(--border-md);background:none;color:var(--muted);font-size:12px;cursor:pointer;font-family:inherit">Cancel</button>'
    +   '<button onclick="mp2SaveFlightDates(' + idx + ')" style="flex:1;height:30px;border-radius:6px;border:none;background:var(--accent);color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">Save</button>'
    + '</div>';

  document.body.appendChild(picker);

  // Close on outside click
  setTimeout(function() {
    document.addEventListener('click', function h(e) {
      if (!picker.contains(e.target) && e.target !== pill) {
        picker.remove();
        document.removeEventListener('click', h);
      }
    });
  }, 0);
}

function mp2SaveFlightDates(idx) {
  var startEl = document.getElementById('mp-flight-start-' + idx);
  var endEl   = document.getElementById('mp-flight-end-'   + idx);
  if (!startEl || !endEl) return;

  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function fmt(val) {
    if (!val) return '';
    var d = new Date(val + 'T00:00:00');
    if (isNaN(d)) return '';
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  var start = fmt(startEl.value);
  var end   = fmt(endEl.value);
  if (savedMediaPlansV2[idx]) {
    savedMediaPlansV2[idx].flightStart = start;
    savedMediaPlansV2[idx].flightEnd   = end;
  }

  var picker = document.getElementById('mp-flight-picker');
  if (picker) picker.remove();

  // Update label in place without full re-render
  var label = document.getElementById('mp-flight-label-' + idx);
  if (label) label.textContent = start && end ? start + ' → ' + end : 'Set flight dates';
}

function mp2DeletePlanItem(planIdx, momentIdx) {
  var plan = savedMediaPlansV2[planIdx];
  if (!plan) return;
  plan.moments = plan.moments || [];
  plan.moments.splice(momentIdx, 1);
  mp2ShowMediaPlanDetail(planIdx);
}

function mp2AddMoreMoments(planIdx) {
  var plan = savedMediaPlansV2[planIdx];
  if (!plan) return;
  mp2ShowResults();
  invSelected = {};
  (plan.programs || []).forEach(function(p) { if (p.id) invSelected[p.id] = true; });
  inv2MediaPlanVisible = true;
  mp2SubTab('moments');
}

function mp2AddMoreToInventory(planIdx) {
  var plan = savedMediaPlansV2[planIdx];
  if (!plan) return;
  // Build the v2 results page (resets invSelected internally)
  mp2ShowResults();
  // Now populate the cart after the reset
  invSelected = {};
  (plan.programs || []).forEach(function(p) {
    if (p.id) invSelected[p.id] = true;
  });
  inv2MediaPlanVisible = true;
  // Switch to moments tab — mp2RenderMoments will pick up our state
  mp2SubTab('moments');
}

function mp2DeleteMediaPlan(idx) {
  var plan = savedMediaPlansV2[idx];
  if (!plan) return;
  if (!confirm('Delete "' + plan.name + '"? This cannot be undone.')) return;
  savedMediaPlansV2.splice(idx, 1);
  mp2SwitchHomeTab('analyses');
}

var mp2NewPlanStep    = 1;
var mp2CampaignMode   = 'select';   // 'create' | 'select'
var mp2SelectedCampaign   = null;
var _mp2LastAnalysisId    = null;   // analysis_id returned from last POST to creatives-analysis
var _mp2CurrentAnalysisPlans = [];  // saved media plans for the current analysis only
var _mp2DistributePlanIdx    = null; // index of plan selected for Save & Distribute
var _mp2LastAnalysisName  = '';     // analysis_name for URL slug
var _mp2AnalysisFromSaved = false;  // true when loaded from Previous Analysis
var _mp2BriefContent      = '';     // full brief text captured before DOM replacement
var _mp2DocName           = '';     // doc filename captured before DOM replacement

// Statuses that lock editing actions on an analysis
var _MP2_LOCKED_STATUSES = ['pacing', 'underpacing', 'completed', 'error', 'failed'];
function _mp2IsLocked() {
  return !!(mp2SelectedCampaign && _MP2_LOCKED_STATUSES.indexOf((mp2SelectedCampaign.status || '').toLowerCase()) >= 0);
}

function mp2Slug(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'analysis';
}
function mp2AnalysisUrl(id, name, origin) {
  var base = origin === 'saved' ? '/moments-match/saved/' : '/moments-match/new/';
  return base + (id ? id + '-' + mp2Slug(name) : mp2Slug(name));
}
var mp2SelectedClientId   = null;   // selected client org dbId
var mp2Step1Clients       = null;   // null = not fetched yet; [] = loaded
var mp2Step1Campaigns     = null;   // null = not fetched yet; [] = loaded
var mp2CreateClientId     = null;   // selected client in create mode
var mp2CreateAdvId        = null;   // selected advertiser id in create mode
var mp2CreateAdvs         = null;   // null = not fetched; 'loading' | []
var mp2CreateGeo          = '';     // selected geography in create mode
var mp2Step1CreateError   = '';     // validation error message for create mode
var mp2LibrarySelected    = null;   // selected CS_LIBRARY item (first selected, for step-1 compat)
var mp2LibrarySelectedItems = [];   // all selected CS_LIBRARY items

// ── Search-select helper (single-select + integrated search, fixed positioning) ─
function _mp2SearchSelectHtml(opts) {
  // opts: { id, placeholder, selectedLabel, items:[{label, html?, searchText?, onclick, selected}], loading, emptyMsg, searchPlaceholder }
  var id = opts.id;
  var panelId = id + '-panel';
  var TRIG = 'width:100%;box-sizing:border-box;padding:0 32px 0 10px;font-size:12px;border:1px solid var(--border-md);border-radius:8px;background:var(--surface);color:var(--text);outline:none;font-family:inherit;transition:border-color .15s;height:34px;display:flex;align-items:center;justify-content:flex-start;cursor:pointer;position:relative';
  var chevron = '<svg width="10" height="6" viewBox="0 0 10 6" fill="none" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);pointer-events:none"><path d="M1 1l4 4 4-4" stroke="#A8A8A0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var bodyHtml;
  if (opts.loading) {
    bodyHtml = '<div style="padding:10px 12px;font-size:11px;color:var(--faint)">Loading…</div>';
  } else if (!opts.items || !opts.items.length) {
    bodyHtml = '<div style="padding:10px 12px;font-size:11px;color:var(--faint)">' + (opts.emptyMsg || 'No results.') + '</div>';
  } else {
    var rows = opts.items.map(function(it) {
      var searchKey = ((it.searchText || it.label) + '').toLowerCase().replace(/'/g, '&#39;');
      var content   = it.html || it.label;
      return '<div class="ui-sc-row" data-lbl="' + searchKey + '" onclick="' + it.onclick + '" '
        + 'style="padding:7px 10px;font-size:12px;cursor:pointer;border-radius:6px;transition:background .1s;'
        + 'color:' + (it.selected ? 'var(--accent)' : 'var(--text)') + ';'
        + 'font-weight:' + (it.selected ? '600' : '400') + ';'
        + 'background:' + (it.selected ? 'var(--subtle)' : 'transparent') + '" '
        + 'onmouseenter="this.style.background=\'var(--subtle)\'" '
        + 'onmouseleave="this.style.background=\'' + (it.selected ? 'var(--subtle)' : 'transparent') + '\'">'
        + content + '</div>';
    }).join('');
    var search = '<div style="padding:5px 5px 2px">'
      + '<input type="text" placeholder="' + (opts.searchPlaceholder || 'Search…') + '" '
      + 'oninput="UI._scFilter(\'' + panelId + '\',this.value)" '
      + 'style="width:100%;box-sizing:border-box;height:28px;padding:0 8px;border:1px solid var(--border-md);border-radius:6px;font-size:11px;font-family:inherit;color:var(--text);background:var(--bg);outline:none" '
      + 'onfocus="this.style.borderColor=\'var(--accent)\'" onblur="this.style.borderColor=\'var(--border-md)\'">'
      + '</div>';
    bodyHtml = search + '<div style="overflow-y:auto;max-height:196px;padding:2px 5px 5px">' + rows + '</div>';
  }

  var isEmpty = !opts.selectedLabel;
  return '<div style="position:relative" id="' + id + '-wrap">'
    + '<button type="button" id="' + id + '-btn" onclick="UI._csToggle(\'' + id + '\')" style="' + TRIG + '" '
    + 'onfocus="this.style.borderColor=\'var(--accent)\'" onblur="this.style.borderColor=\'var(--border-md)\'">'
    + '<span id="' + id + '-lbl" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;' + (isEmpty ? 'color:var(--faint)' : '') + '">'
    + (isEmpty ? (opts.placeholder || '— select —') : opts.selectedLabel) + '</span>'
    + chevron + '</button>'
    + '<div id="' + panelId + '" class="tb-admin-dd" style="left:0;right:0;min-width:0;padding:0;overflow:hidden">'
    + bodyHtml
    + '</div>'
    + '</div>';
}

function mp2RefreshStep1() {
  var el = document.getElementById('mp2-step1');
  if (el) el.innerHTML = _mp2Step1Html();
}

function mp2LoadStep1Clients() {
  if (mp2Step1Clients !== null) return; // already loading or loaded
  // Use global _appClientOrgs() only if _appDbOrgs has already been populated.
  // If it is still empty (orgs fetch hasn't resolved yet), fall through to the API fetch
  // so we don't lock mp2Step1Clients to [] and block future retries.
  if (typeof _appClientOrgs === 'function' && typeof _appDbOrgs !== 'undefined' && _appDbOrgs.length > 0) {
    mp2Step1Clients = _appClientOrgs();
    // For non-super orgs, auto-select their org and load campaigns
    if (typeof _appIsSuperOrg === 'function' && !_appIsSuperOrg() && typeof selectedClientOrgId !== 'undefined' && selectedClientOrgId) {
      if (!mp2SelectedClientId) {
        mp2SelectedClientId = selectedClientOrgId;
        fetch('/api/campaigns?client_org_id=' + selectedClientOrgId)
          .then(function(r){return r.json();})
          .then(function(d){ mp2Step1Campaigns = d.campaigns || []; mp2RefreshStep1(); })
          .catch(function(){ mp2Step1Campaigns = []; mp2RefreshStep1(); });
      }
    }
    mp2RefreshStep1();
    return;
  }
  // Fallback: fetch from API (also used when _appDbOrgs is not yet populated)
  mp2Step1Clients = 'loading';
  fetch('/api/organizations')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      mp2Step1Clients = d.orgs || [];
      mp2RefreshStep1();
    })
    .catch(function(e) {
      console.error('mp2 orgs fetch error', e);
      mp2Step1Clients = [];
      mp2RefreshStep1();
    });
}

function mp2SelectStep1Client(orgId) {
  if (mp2SelectedClientId === orgId) return;
  mp2SelectedClientId = orgId;
  mp2SelectedCampaign = null;
  mp2Step1Campaigns   = null;
  mp2ClearStep1Error();
  mp2RefreshStep1();
  fetch('/api/campaigns?client_org_id=' + orgId).then(function(r){return r.json();}).then(function(d){
    mp2Step1Campaigns = d.campaigns || [];
    mp2RefreshStep1();
  }).catch(function(){ mp2Step1Campaigns = []; mp2RefreshStep1(); });
}

function mp2SelectStep1Campaign(idx) {
  mp2SelectedCampaign = (mp2Step1Campaigns || [])[idx] || null;
  mp2ClearStep1Error();
  mp2RefreshStep1();
}

function mp2ClearStep1Error() {
  mp2Step1CreateError = '';
  var el = document.getElementById('mp2-step1-error');
  if (el) el.remove();
}

function mp2ShowStep3Error(msg) {
  var existing = document.getElementById('mp2-step3-error');
  if (existing) return;
  var nav = document.getElementById('mp2-step-nav');
  if (!nav) return;
  var div = document.createElement('div');
  div.id = 'mp2-step3-error';
  div.style.cssText = 'display:flex;align-items:flex-start;gap:8px;margin:0 24px 8px;padding:9px 12px;background:#fff1f4;border:1px solid #fca5a5;border-radius:8px;font-size:12px;color:#b91c1c;line-height:1.5';
  div.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    + '<span style="flex:1">' + msg + '</span>'
    + '<button onclick="mp2ClearStep3Error()" type="button" style="background:none;border:none;cursor:pointer;padding:0;line-height:1;color:#b91c1c;opacity:.7;flex-shrink:0;margin-top:1px" title="Dismiss"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
  nav.parentNode.insertBefore(div, nav);
}

function mp2ClearStep3Error() {
  var el = document.getElementById('mp2-step3-error');
  if (el) el.remove();
}

function mp2LoadCreateAdvs() {
  if (mp2CreateAdvs !== null) return;
  mp2CreateAdvs = 'loading';
  fetch('/api/advertisers')
    .then(function(r){return r.json();})
    .then(function(d){ mp2CreateAdvs = d.advertisers || []; mp2RefreshStep1(); })
    .catch(function(){ mp2CreateAdvs = []; mp2RefreshStep1(); });
}

function mp2SelectCreateClient(orgId) {
  mp2CreateClientId = orgId;
  mp2CreateAdvId = null;
  mp2ClearStep1Error();
  mp2RefreshStep1();
}

function mp2SelectCreateAdv(advId) {
  mp2CreateAdvId = String(advId);
  mp2ClearStep1Error();
  mp2RefreshStep1();
}

function mp2SelectCreateGeo(val) {
  mp2CreateGeo = val;
  mp2ClearStep1Error();
  mp2RefreshStep1();
}

function _mp2Step1Html() {
  var INP = 'width:100%;height:36px;border:1px solid var(--border-md);border-radius:8px;padding:0 12px;font-size:13px;font-family:inherit;color:var(--text);background:var(--surface);outline:none;transition:border .15s,box-shadow .15s;box-sizing:border-box';
  var FOCUS = 'onfocus="this.style.borderColor=\'var(--accent)\';this.style.boxShadow=\'0 0 0 3px rgba(237,0,94,.08)\'" onblur="this.style.borderColor=\'var(--border-md)\';this.style.boxShadow=\'none\'"';
  var CHEVRON = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="flex-shrink:0;color:var(--faint)"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var TRIGBTN = 'width:100%;height:36px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;border:1px solid var(--border-md);border-radius:8px;background:var(--surface);font-size:13px;font-family:inherit;cursor:pointer;transition:border .15s,box-shadow .15s;text-align:left';

  var DISABLED = 'width:100%;height:36px;border:1px solid var(--border);border-radius:8px;padding:0 12px;font-size:13px;font-family:inherit;color:var(--muted);background:var(--bg);outline:none;cursor:not-allowed;box-sizing:border-box';
  var LBL = 'display:block;font-size:10px;font-weight:600;color:var(--faint);text-transform:uppercase;letter-spacing:.6px;margin-bottom:5px';

  // If an asset was selected from the library, show pre-filled locked fields
  if (mp2LibrarySelected) {
    var cr = mp2LibrarySelected;
    return '<div style="margin-bottom:14px">'
      + '<label style="' + LBL + '">Campaign</label>'
      + '<input type="text" value="' + (cr.campaign || '—') + '" disabled style="' + DISABLED + '">'
      + '</div>'
      + '<div style="margin-bottom:14px">'
      + '<label style="' + LBL + '">Advertiser</label>'
      + '<input type="text" value="' + (cr.advertiser || '—') + '" disabled style="' + DISABLED + '">'
      + '</div>'
      + '<div>'
      + '<label style="' + LBL + '">Geography</label>'
      + '<input type="text" value="All regions" disabled style="' + DISABLED + '">'
      + '</div>';
  }

  var toggle = _segControlHtml(mp2CampaignMode, [
    { id: 'select', label: 'Select Campaign', onclick: "mp2CampaignMode='select';mp2Step1CreateError='';mp2RefreshStep1();mp2LoadStep1Clients()" },
    { id: 'create', label: 'Create Campaign', onclick: "mp2CampaignMode='create';mp2Step1CreateError='';mp2RefreshStep1();mp2LoadStep1Clients();mp2LoadCreateAdvs()" },
  ]);

  var campField;
  if (mp2CampaignMode === 'select') {

    // ── Client search-select ───────────────────────────────────────────────
    var selClientLabel = '';
    if (mp2SelectedClientId && Array.isArray(mp2Step1Clients)) {
      for (var ci = 0; ci < mp2Step1Clients.length; ci++) {
        if (mp2Step1Clients[ci].dbId === mp2SelectedClientId) { selClientLabel = mp2Step1Clients[ci].name; break; }
      }
    }
    var clientItems = Array.isArray(mp2Step1Clients)
      ? mp2Step1Clients.map(function(c) {
          return { label: c.name, selected: c.dbId === mp2SelectedClientId, onclick: 'mp2SelectStep1Client(' + c.dbId + ')' };
        })
      : [];
    var clientField;
    if (typeof _appIsSuperOrg === 'function' && !_appIsSuperOrg()) {
      // Non-super: show locked field pre-filled with their org
      clientField = '<div style="margin-bottom:14px">'
        + '<label style="' + LBL + '">Client</label>'
        + '<div style="height:36px;padding:0 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);'
        + 'display:flex;align-items:center;font-size:13px;font-weight:500;color:var(--text);cursor:not-allowed;opacity:.8;box-sizing:border-box">'
        + (selClientLabel || '—')
        + '</div>'
        + '</div>';
    } else {
      clientField = '<div style="margin-bottom:14px">'
        + '<label style="' + LBL + '">Client</label>'
        + _mp2SearchSelectHtml({
            id: 'mp2-s1-client',
            placeholder: '— select a client —',
            selectedLabel: selClientLabel,
            loading: mp2Step1Clients === 'loading' || mp2Step1Clients === null,
            items: clientItems,
            emptyMsg: 'No clients found.',
            searchPlaceholder: 'Search clients…',
          })
        + '</div>';
    }

    // ── Campaign search-select (appears after client chosen) ───────────────
    var campField2 = '';
    if (mp2SelectedClientId) {
      var selCamp = mp2SelectedCampaign;
      var campItems = Array.isArray(mp2Step1Campaigns)
        ? mp2Step1Campaigns
            .map(function(c, ci) { return { c: c, ci: ci }; })
            .filter(function(item) { return item.c.status === 'draft' || item.c.status === 'planned' || !item.c.status; })
            .map(function(item) {
              var c = item.c, ci = item.ci;
              var adv = (c.advertiser && c.advertiser !== '—') ? c.advertiser : '';
              var badge = (typeof cmStatusChip === 'function' && c.status) ? cmStatusChip(c.status) : '';
              var html = c.name
                + (adv ? ' <span style="font-size:10px;font-weight:400;color:var(--faint)">(' + adv + ')</span>' : '')
                + (badge ? ' ' + badge : '');
              return { html: html, label: c.name, searchText: c.name + ' ' + adv, selected: selCamp && selCamp.dbId === c.dbId, onclick: 'mp2SelectStep1Campaign(' + ci + ')' };
            })
        : [];
      campField2 = '<div style="margin-bottom:' + (selCamp ? '14px' : '0') + '">'
        + '<label style="' + LBL + '">Campaign</label>'
        + _mp2SearchSelectHtml({
            id: 'mp2-s1-camp',
            placeholder: '— select a campaign —',
            selectedLabel: selCamp ? selCamp.name : '',
            loading: mp2Step1Campaigns === null,
            items: campItems,
            emptyMsg: 'No campaigns for this client.',
            searchPlaceholder: 'Search campaigns…',
          })
        + '</div>';

      // ── Read-only fields after campaign selected ───────────────────────
      if (selCamp) {
        var advVal = selCamp.advertiser || '—';
        var geoVal = Array.isArray(selCamp.geography) ? selCamp.geography.join(', ') : (selCamp.geography || 'All regions');
        var fdVal  = (selCamp.start && selCamp.start !== '—') ? selCamp.start + ' → ' + (selCamp.end || '—') : '—';
        campField2 +=
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">'
          + '<div><label style="' + LBL + '">Advertiser</label><input type="text" value="' + advVal + '" disabled style="' + DISABLED + '"></div>'
          + '<div><label style="' + LBL + '">Geography</label><input type="text" value="' + geoVal + '" disabled style="' + DISABLED + '"></div>'
          + '</div>'
          + '<div><label style="' + LBL + '">Flight Dates</label><input type="text" value="' + fdVal + '" disabled style="' + DISABLED + '"></div>';
      }
    }

    var _selErrMsg = mp2Step1CreateError === 'select'
      ? 'Please select Campaign details to proceed with a Campaign. Click on <strong>Skip this step</strong> if you don\'t have a Campaign yet.'
      : '';
    var selErrorBanner = _selErrMsg
      ? '<div id="mp2-step1-error" style="display:flex;align-items:flex-start;gap:8px;margin-top:4px;padding:9px 12px;background:#fff1f4;border:1px solid #fca5a5;border-radius:8px;font-size:12px;color:#b91c1c;line-height:1.5">'
        + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
        + '<span style="flex:1">' + _selErrMsg + '</span>'
        + '<button onclick="mp2ClearStep1Error()" type="button" style="background:none;border:none;cursor:pointer;padding:0;line-height:1;color:#b91c1c;opacity:.7;flex-shrink:0;margin-top:1px" title="Dismiss">'
        + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        + '</button>'
        + '</div>'
      : '';
    return toggle + clientField + campField2 + selErrorBanner;
  }

  // ── Create mode ──────────────────────────────────────────────────────────
  var isSuperOrg = typeof _appIsSuperOrg === 'function' && _appIsSuperOrg();

  // Auto-set client for non-super orgs (pre-fill + lock)
  if (!isSuperOrg && !mp2CreateClientId && typeof selectedClientOrgId !== 'undefined' && selectedClientOrgId) {
    mp2CreateClientId = selectedClientOrgId;
  }

  var clientSelected = !!mp2CreateClientId;

  // ── Client field ──────────────────────────────────────────────────────────
  var selCCLabel = '';
  if (mp2CreateClientId) {
    if (Array.isArray(mp2Step1Clients)) {
      for (var cci = 0; cci < mp2Step1Clients.length; cci++) {
        if (mp2Step1Clients[cci].dbId === mp2CreateClientId) { selCCLabel = mp2Step1Clients[cci].name; break; }
      }
    }
    // Fallback: try _appDbOrgs if clients not yet loaded
    if (!selCCLabel && typeof _appDbOrgs !== 'undefined') {
      for (var dbi = 0; dbi < _appDbOrgs.length; dbi++) {
        if (_appDbOrgs[dbi].dbId === mp2CreateClientId) { selCCLabel = _appDbOrgs[dbi].name; break; }
      }
    }
  }

  var createClientField;
  if (!isSuperOrg) {
    // Non-super: locked, pre-filled
    createClientField = '<div style="margin-bottom:14px">'
      + '<label style="' + LBL + '">Client</label>'
      + '<div style="height:36px;padding:0 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);display:flex;align-items:center;font-size:13px;font-weight:500;color:var(--text);cursor:not-allowed;opacity:.8;box-sizing:border-box">'
      + (selCCLabel || '—') + '</div></div>';
  } else {
    // Super org: active search-select
    var ccItems = Array.isArray(mp2Step1Clients)
      ? mp2Step1Clients.map(function(c) {
          return { label: c.name, selected: c.dbId === mp2CreateClientId, onclick: 'mp2SelectCreateClient(' + c.dbId + ')' };
        })
      : [];
    createClientField = '<div style="margin-bottom:14px">'
      + '<label style="' + LBL + '">Client</label>'
      + _mp2SearchSelectHtml({
          id: 'mp2-s1-create-client',
          placeholder: '— select a client —',
          selectedLabel: selCCLabel,
          loading: mp2Step1Clients === 'loading' || mp2Step1Clients === null,
          items: ccItems,
          emptyMsg: 'No clients found.',
          searchPlaceholder: 'Search clients…',
        })
      + '</div>';
  }

  var LOCKED = 'height:36px;padding:0 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);display:flex;align-items:center;font-size:13px;color:var(--faint);cursor:not-allowed;opacity:.65;box-sizing:border-box';

  // ── Advertiser (filtered by client, disabled until client selected) ───────
  // Filter advertiser list by selected client
  var filteredAdvs = [];
  if (clientSelected && Array.isArray(mp2CreateAdvs)) {
    filteredAdvs = mp2CreateAdvs.filter(function(a) {
      return String(a.client_org_id) === String(mp2CreateClientId);
    });
  }
  var selCALabel = '';
  if (mp2CreateAdvId) {
    for (var cai = 0; cai < filteredAdvs.length; cai++) {
      if (String(filteredAdvs[cai].advertiser_id) === String(mp2CreateAdvId)) { selCALabel = filteredAdvs[cai].advertiser_name; break; }
    }
    if (!selCALabel) mp2CreateAdvId = null; // clear if no longer in filtered list
  }

  var createAdvField;
  if (!clientSelected) {
    createAdvField = '<div style="margin-bottom:14px">'
      + '<label style="' + LBL + '">Advertiser</label>'
      + '<div style="' + LOCKED + '">— select a client first —</div>'
      + '</div>';
  } else {
    var caItems = filteredAdvs.map(function(a) {
      return { label: a.advertiser_name, selected: String(a.advertiser_id) === String(mp2CreateAdvId), onclick: 'mp2SelectCreateAdv(\'' + a.advertiser_id + '\')' };
    });
    createAdvField = '<div style="margin-bottom:14px">'
      + '<label style="' + LBL + '">Advertiser</label>'
      + _mp2SearchSelectHtml({
          id: 'mp2-s1-create-adv',
          placeholder: '— select an advertiser —',
          selectedLabel: selCALabel,
          loading: mp2CreateAdvs === 'loading' || mp2CreateAdvs === null,
          items: caItems,
          emptyMsg: 'No advertisers for this client.',
          searchPlaceholder: 'Search advertisers…',
        })
      + '</div>';
  }

  // ── Campaign Name (disabled until client selected) ─────────────────────
  var createNameField = '<div style="margin-bottom:14px">'
    + '<label style="' + LBL + '">Campaign Name</label>'
    + (clientSelected
        ? '<input id="mp2-campaign-name" type="text" placeholder="e.g. Walmart Summer Launch" style="' + INP + '" ' + FOCUS + ' oninput="mp2ClearStep1Error()">'
        : '<input type="text" disabled placeholder="— select a client first —" style="' + DISABLED + '">')
    + '</div>';

  // ── Flight Dates (disabled until client selected) ──────────────────────
  var cFlightSet = mp2FlightDates.start && mp2FlightDates.end;
  var createFlightField;
  if (!clientSelected) {
    createFlightField = '<div>'
      + '<label style="' + LBL + '">Flight Dates</label>'
      + '<div style="' + LOCKED + '">— select a client first —</div>'
      + '</div>';
  } else {
    createFlightField = '<div>'
      + '<label style="' + LBL + '">Flight Dates</label>'
      + '<button type="button" onclick="mp2ClearStep1Error();mp2OpenFlightPicker(this)" style="' + TRIGBTN + ';color:' + (cFlightSet ? 'var(--text)' : 'var(--faint)') + '">'
      + '<span id="mp2-s1-flight-lbl">' + (cFlightSet ? mp2FlightPillLabel() : 'Select flight dates') + '</span>'
      + CHEVRON + '</button>'
      + '</div>';
  }

  // ── Geography (disabled until client selected) ─────────────────────────
  var GEO_OPTS = [
    {val:'europe',label:'Europe'},{val:'united-states',label:'United States'},{val:'canada',label:'Canada'},
    {val:'united-kingdom',label:'United Kingdom'},{val:'australia',label:'Australia'},{val:'new-zealand',label:'New Zealand'},
    {val:'japan',label:'Japan'},{val:'brazil',label:'Brazil'},{val:'germany',label:'Germany'},
    {val:'france',label:'France'},{val:'italy',label:'Italy'},{val:'spain',label:'Spain'},
  ];
  var createGeoField;
  if (!clientSelected) {
    createGeoField = '<div>'
      + '<label style="' + LBL + '">Geography</label>'
      + '<div style="' + LOCKED + '">— select a client first —</div>'
      + '</div>';
  } else {
    var selGeoLbl = '';
    for (var gi = 0; gi < GEO_OPTS.length; gi++) {
      if (GEO_OPTS[gi].val === mp2CreateGeo) { selGeoLbl = GEO_OPTS[gi].label; break; }
    }
    var geoItems2 = GEO_OPTS.map(function(g) {
      return { label: g.label, selected: g.val === mp2CreateGeo, onclick: 'mp2SelectCreateGeo(\'' + g.val + '\')' };
    });
    createGeoField = '<div>'
      + '<label style="' + LBL + '">Geography</label>'
      + _mp2SearchSelectHtml({
          id: 'mp2-s1-create-geo',
          placeholder: '— select a region —',
          selectedLabel: selGeoLbl,
          loading: false,
          items: geoItems2,
          emptyMsg: 'No regions found.',
          searchPlaceholder: 'Search regions…',
        })
      + '</div>';
  }

  var _errMsg = mp2Step1CreateError === 'create'
    ? 'Please fill in Campaign details to create a Campaign. Click on <strong>Skip this step</strong> if you don\'t have a Campaign yet.'
    : mp2Step1CreateError === 'select'
    ? 'Please select Campaign details to proceed with a Campaign. Click on <strong>Skip this step</strong> if you don\'t have a Campaign yet.'
    : '';
  var errorBanner = _errMsg
    ? '<div id="mp2-step1-error" style="display:flex;align-items:flex-start;gap:8px;margin-top:4px;padding:9px 12px;background:#fff1f4;border:1px solid #fca5a5;border-radius:8px;font-size:12px;color:#b91c1c;line-height:1.5">'
      + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
      + '<span style="flex:1">' + _errMsg + '</span>'
      + '<button onclick="mp2ClearStep1Error()" type="button" style="background:none;border:none;cursor:pointer;padding:0;line-height:1;color:#b91c1c;opacity:.7;flex-shrink:0;margin-top:1px" title="Dismiss">'
      + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      + '</button>'
      + '</div>'
    : '';

  return toggle
    + createClientField
    + createAdvField
    + createNameField
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">'
    + createFlightField + createGeoField
    + '</div>'
    + errorBanner;
}

function _mp2StepHdrHtml() {
  var steps = [{n:1,label:'Add Campaign'},{n:2,label:'Add Campaign Details'},{n:3,label:'Add Asset'}];
  var html = '<div style="display:flex;align-items:center;padding:16px 24px;border-bottom:1px solid var(--border)">';
  steps.forEach(function(s, i) {
    var done   = mp2NewPlanStep > s.n;
    var active = mp2NewPlanStep === s.n;
    var circleBg = (done || active) ? 'var(--accent)' : 'transparent';
    var circleBd = (done || active) ? 'none' : '1.5px solid var(--border-md)';
    var inner = done
      ? '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<span style="font-size:11px;font-weight:700;color:' + (active ? '#fff' : 'var(--faint)') + '">' + s.n + '</span>';
    var lc = active ? 'var(--text)' : done ? 'var(--accent)' : 'var(--faint)';
    var lw = active ? '600' : '400';
    html += '<div style="display:flex;align-items:center;gap:8px">'
      + '<div style="width:24px;height:24px;border-radius:50%;background:' + circleBg + ';border:' + circleBd + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">' + inner + '</div>'
      + '<span style="font-size:12px;font-weight:' + lw + ';color:' + lc + ';white-space:nowrap">' + s.label + '</span>'
      + '</div>';
    if (i < 2) html += '<div style="flex:1;height:1px;background:' + (mp2NewPlanStep > s.n ? 'var(--accent)' : 'var(--border)') + ';margin:0 12px"></div>';
  });
  return html + '</div>';
}

function _mp2StepNavHtml() {
  var BACK = 'display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border:1px solid var(--border-md);border-radius:8px;background:none;font-size:12px;font-weight:500;font-family:inherit;color:var(--muted);cursor:pointer';
  var NEXT = 'display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 18px;border:none;border-radius:8px;background:linear-gradient(135deg,#e11d8f,#f43f5e);color:#fff;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;box-shadow:0 3px 10px rgba(225,29,143,.28)';
  var html = '<div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">';
  html += mp2NewPlanStep > 1
    ? '<button onclick="mp2StepNav(-1)" style="' + BACK + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>Back</button>'
    : '<div></div>';
  var right = '';
  if (mp2NewPlanStep !== 3) right += '<button type="button" onclick="mp2StepNav(1,true)" style="background:none;border:none;color:var(--muted);font-size:11px;font-weight:400;cursor:pointer;font-family:inherit;padding:0;letter-spacing:.1px;display:inline-flex;align-items:center;line-height:1;transition:opacity .15s" onmouseenter="this.style.opacity=\'.65\'" onmouseleave="this.style.opacity=\'1\'">Skip this step</button>';
  right += mp2NewPlanStep < 3
    ? '<button onclick="mp2StepNav(1)" style="' + NEXT + '">Next<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>'
    : '<button onclick="mp2Analyze()" style="' + NEXT + '"><svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M9 3L11.2 9.2 17.5 11.5 11.2 13.8 9 20 6.8 13.8 0.5 11.5 6.8 9.2Z"/><path d="M18.5 3L20 7 24 8.5 20 10 18.5 14 17 10 13 8.5 17 7Z" opacity=".75"/></svg>Start Analysis</button>';
  html += '<div style="display:inline-flex;align-items:center;gap:16px">' + right + '</div>';
  return html + '</div>';
}

function mp2StepNav(dir, skip) {
  // Validate step 1 before advancing (unless Skip was clicked)
  if (dir === 1 && mp2NewPlanStep === 1 && !skip) {
    var invalid = false;
    if (mp2CampaignMode === 'create') {
      var nameVal = (document.getElementById('mp2-campaign-name') || {}).value || '';
      if (!mp2CreateClientId || !mp2CreateAdvId || !nameVal.trim() || !mp2FlightDates.start || !mp2FlightDates.end || !mp2CreateGeo) {
        mp2Step1CreateError = 'create';
        mp2RefreshStep1();
        invalid = true;
      }
    } else {
      // select mode
      if (!mp2SelectedClientId || !mp2SelectedCampaign) {
        mp2Step1CreateError = 'select';
        mp2RefreshStep1();
        invalid = true;
      }
    }
    if (invalid) return;
    mp2Step1CreateError = '';
  } else {
    mp2Step1CreateError = '';
  }
  mp2NewPlanStep = Math.min(3, Math.max(1, mp2NewPlanStep + dir));
  var hdr = document.getElementById('mp2-step-hdr');
  if (hdr) hdr.innerHTML = _mp2StepHdrHtml();
  [1,2,3].forEach(function(n) {
    var el = document.getElementById('mp2-step' + n);
    if (el) el.style.display = mp2NewPlanStep === n ? '' : 'none';
  });
  var nav = document.getElementById('mp2-step-nav');
  if (nav) nav.innerHTML = _mp2StepNavHtml();
  if (mp2NewPlanStep === 1) { var s1 = document.getElementById('mp2-step1'); if (s1) s1.innerHTML = _mp2Step1Html(); }
  if (mp2NewPlanStep === 2) mp2BuildNewPlanAIPanel();
  if (mp2NewPlanStep === 3) {
    setTimeout(function() { mp2SliderFill(mp2LookbackSecs); }, 0);
    // Pre-fill analysis name from whichever mode provided a campaign name
    var _step3CampaignName = '';
    if (mp2CampaignMode === 'create') {
      var _cnInput = document.getElementById('mp2-campaign-name');
      _step3CampaignName = (_cnInput && _cnInput.value.trim()) ? _cnInput.value.trim() : '';
      // Store it so it survives the DOM re-render
      if (_step3CampaignName) window._mp2CreateCampaignName = _step3CampaignName;
    } else if (mp2CampaignMode === 'select' && mp2SelectedCampaign) {
      _step3CampaignName = mp2SelectedCampaign.name || '';
    }
    if (_step3CampaignName) {
      setTimeout(function() {
        var anInput = document.getElementById('mp2-analysis-name-input');
        if (!anInput) return;
        var _baseName = _step3CampaignName + ' Moments Match';
        var _uniqueName = _baseName;
        var _existing = (_mp2AnalysesCache || []).map(function(a) { return (a.moments_match_analysis_name || '').toLowerCase(); });
        if (_existing.indexOf(_baseName.toLowerCase()) !== -1) {
          var _n2 = 2;
          while (_existing.indexOf((_baseName + ' ' + _n2).toLowerCase()) !== -1) { _n2++; }
          _uniqueName = _baseName + ' ' + _n2;
        }
        anInput.value = _uniqueName;
        anInput.disabled = false;
        anInput.style.background = '';
        anInput.style.color      = '';
        anInput.style.cursor     = '';
      }, 50);
    }
    // If a campaign was selected in Step 1, pre-select "Asset from Library"
    // and auto-load its associated creatives
    if (mp2SelectedCampaign && mp2SelectedCampaign.dbId) {
      mp2SelectInput('library');
      // Pre-fill analysis name with campaign name; make it editable but suggest a unique name
      var anInput = document.getElementById('mp2-analysis-name-input');
      if (anInput) {
        var _baseName = (mp2SelectedCampaign.name ? mp2SelectedCampaign.name + ' Moments Match' : '');
        // Find a unique name by incrementing suffix if name already exists in cache
        var _uniqueName = _baseName;
        if (_baseName) {
          var _existing = (_mp2AnalysesCache || []).map(function(a) { return (a.moments_match_analysis_name || '').toLowerCase(); });
          if (_existing.indexOf(_baseName.toLowerCase()) !== -1) {
            var _n = 2;
            while (_existing.indexOf((_baseName + ' ' + _n).toLowerCase()) !== -1) { _n++; }
            _uniqueName = _baseName + ' ' + _n;
          }
        }
        anInput.value    = _uniqueName;
        anInput.disabled = false;
        anInput.style.background = '';
        anInput.style.color      = '';
        anInput.style.cursor     = '';
      }
      var area = document.getElementById('tx2-input-area');
      if (area) area.innerHTML = '<div style="padding:20px;text-align:center;font-size:12px;color:var(--faint)">Loading creatives…</div>';
      fetch('/api/creatives?campaign_id=' + mp2SelectedCampaign.dbId)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var creatives = data.creatives || [];
          if (!creatives.length) {
            // No creatives for this campaign — show empty library zone
            if (area) area.innerHTML =
              '<div class="tx2-upload-zone" style="padding:18px 20px" onclick="mp2OpenLibraryModal()">'
              + '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:var(--faint)"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>'
              + '<div style="font-size:12px;font-weight:500;color:var(--text);margin-top:4px">No creatives for this campaign</div>'
              + '<div style="font-size:11px;color:var(--faint);margin-top:1px">Browse the library to pick one</div>'
              + '<button onclick="event.stopPropagation();mp2OpenLibraryModal()" style="display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 12px;border:1px solid var(--border-md);border-radius:7px;font-size:11px;font-weight:500;color:var(--text);background:var(--surface);cursor:pointer;font-family:inherit;margin-top:8px;transition:border .15s" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--border-md)\'">Browse Library</button>'
              + '</div>';
            return;
          }
          // Map API shape → mp2LibrarySelectedItems shape
          mp2LibrarySelectedItems = creatives.map(function(c) {
            return {
              id:        c.id,
              dbId:      c.dbId,
              name:      c.name,
              thumb:     c.thumb      || '',
              fileType:  c.fileType   || '',
              mediaType: c.mediaType  || '',
              templates: c.templates  || [],
              campaign:  c.campaign   || '',
              advertiser: c.advertiser || ''
            };
          });
          mp2LibrarySelected = mp2LibrarySelectedItems[0] || null;
          var areaEl = document.getElementById('tx2-input-area');
          if (areaEl) areaEl.innerHTML = _mp2LibrarySelectedGridHtml(mp2LibrarySelectedItems);
          // Disable New Asset and Brief tabs since creatives are locked from campaign
          ['tx2-opt-video', 'tx2-opt-brief'].forEach(function(id) {
            var el = document.getElementById(id);
            if (!el) return;
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.35';
            el.style.cursor = 'not-allowed';
          });
        })
        .catch(function() {
          if (area) area.innerHTML = '<div style="padding:20px;text-align:center;font-size:12px;color:#dc2626">Failed to load creatives</div>';
        });
    }
  }
}

var _mp2GeoSelected = new Set();

function mp2ToggleGeoPanel(e) {
  if (e) e.stopPropagation();
  var panel   = document.getElementById('mp2-geo-panel');
  var trigger = document.getElementById('mp2-geo-trigger');
  if (!panel) return;
  var opening = !panel.classList.contains('open');

  if (opening && trigger) {
    // Use fixed positioning so the panel escapes overflow:hidden on the card
    var rect      = trigger.getBoundingClientRect();
    var panelH    = 280;
    var spaceBelow = window.innerHeight - rect.bottom - 8;
    var spaceAbove = rect.top - 8;
    panel.style.position = 'fixed';
    panel.style.width    = rect.width + 'px';
    panel.style.left     = rect.left + 'px';
    panel.style.right    = 'auto';
    if (spaceBelow >= panelH || spaceBelow >= spaceAbove) {
      panel.style.top    = (rect.bottom + 6) + 'px';
      panel.style.bottom = 'auto';
    } else {
      panel.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
      panel.style.top    = 'auto';
    }
    panel.style.zIndex = '9999';
    panel.style.maxHeight = Math.max(spaceBelow, spaceAbove) - 8 + 'px';
    panel.style.overflowY = 'auto';
  }

  panel.classList.toggle('open', opening);
  if (trigger) {
    trigger.style.borderColor = opening ? 'var(--accent)' : 'var(--border-md)';
    trigger.style.boxShadow   = opening ? '0 0 0 3px rgba(237,0,94,.08)' : 'none';
  }
  if (opening) {
    setTimeout(function() {
      document.addEventListener('click', function _close(ev) {
        var p = document.getElementById('mp2-geo-panel');
        var t = document.getElementById('mp2-geo-trigger');
        if (p && !p.contains(ev.target) && ev.target !== t && !t.contains(ev.target)) {
          p.classList.remove('open');
          if (t) { t.style.borderColor = 'var(--border-md)'; t.style.boxShadow = 'none'; }
          document.removeEventListener('click', _close);
        }
      });
    }, 0);
  }
}

function mp2GeoToggle(val, checked) {
  if (checked) _mp2GeoSelected.add(val);
  else _mp2GeoSelected.delete(val);
  var lbl = document.getElementById('mp2-geo-label');
  if (!lbl) return;
  var count = _mp2GeoSelected.size;
  lbl.textContent = count === 0 ? 'All regions' : count + ' region' + (count > 1 ? 's' : '') + ' selected';
  lbl.style.color = count > 0 ? 'var(--text)' : 'var(--faint)';
}

function mp2BuildNewPlanAIPanel() {
  var panel = document.getElementById('mp2-new-plan-ai-panel');
  if (!panel) return;

  panel.innerHTML =
    '<div style="display:flex;flex-direction:column;min-height:200px">'
    + '<div style="width:100%">'


    + '<div style="font-size:15px;line-height:2;color:var(--text);margin-bottom:32px;text-align:left">'
    +   'The budget for my media plan is ' + aiTriggerHtml('budget')
    +   ' and I want to deliver ' + aiTriggerHtml('impressions') + ' impressions per day. '
    +   'I want to target ' + aiTriggerHtml('type') + ' Inventory, and the following channels: '
    +   aiTriggerHtml('channels') + '. '
    +   'My Brand Safety parameters are ' + aiTriggerHtml('brand') + '. '
    +   'Use ' + aiTriggerHtml('score') + ' Match Score and a ' + aiTriggerHtml('window') + ' Lookback.'
    + '</div>'

    + '</div>'
    + '</div>';
}

function mp2GenerateNewPlanAI() {
  var panel = document.getElementById('mp2-new-plan-ai-panel');
  if (!panel) return;
  panel.innerHTML =
    '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:260px;gap:14px">'
    + '<div style="width:36px;height:36px;border:3px solid var(--border);border-top-color:#e11d8f;border-radius:50%;animation:cs-spin .7s linear infinite"></div>'
    + '<div style="font-size:12px;color:var(--muted)">Generating your AI media plan…</div>'
    + '</div>';
  setTimeout(function() {
    _aiSuggestions = [
      { moment:'Family Dinner Time',   channels:['NBC', 'Fox', 'ABC'],       pods:312, cpm:'$28',  impressions:'3.2M', type:'ads'     },
      { moment:'Grocery Shopping',     channels:['Food Network', 'NBC'],     pods:278, cpm:'$22',  impressions:'2.8M', type:'organic' },
      { moment:'Healthy Eating',       channels:['CBS', 'Fox', 'Discovery'], pods:241, cpm:'$19',  impressions:'2.1M', type:'live'    },
      { moment:'Meal Prep & Cooking',  channels:['Food Network', 'PBS'],     pods:198, cpm:'$24',  impressions:'1.9M', type:'ads'     },
      { moment:'Weekend BBQ',          channels:['Fox', 'ABC', 'NBC'],       pods:143, cpm:'$31',  impressions:'2.8M', type:'organic' },
    ];
    mp2RenderNewPlanAIResults();
  }, 1800);
}

function mp2RenderNewPlanAIResults() {
  var panel = document.getElementById('mp2-new-plan-ai-panel');
  if (!panel) return;
  var sugg = _aiSuggestions;
  var TH   = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border);white-space:nowrap';
  var TOT  = 'padding:10px 12px;font-size:12px;font-weight:600;color:var(--text);border-top:2px solid var(--border-md);background:var(--bg)';
  var DELBTN = 'border:none;background:none;cursor:pointer;color:var(--faint);padding:2px 6px;border-radius:5px;line-height:1;font-size:16px;transition:color .12s';
  var totalImpr = sugg.reduce(function(s, r) { return s + parseFloat(r.impressions) * (r.impressions.indexOf('M') >= 0 ? 1000000 : 1000); }, 0);
  var fmtImpr   = totalImpr >= 1000000 ? (totalImpr/1000000).toFixed(1) + 'M' : Math.round(totalImpr/1000) + 'K';
  var avgCpm    = Math.round(sugg.reduce(function(s, r) { return s + parseInt(r.cpm.replace(/[^0-9]/g,'')); }, 0) / (sugg.length || 1));

  panel.innerHTML =
    '<div style="display:flex;flex-direction:column;min-height:0">'
    + '<div style="flex-shrink:0;margin-bottom:12px">'
    +   '<span class="tx-bc-link" onclick="mp2BuildNewPlanAIPanel()" style="display:inline-flex;align-items:center;gap:4px;font-size:12px;cursor:pointer">'
    +     '<svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M8 2.5L4.5 6.5 8 10.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +     'Adjust parameters'
    +   '</span>'
    + '</div>'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-shrink:0">'
    +   '<div style="width:20px;height:20px;border-radius:6px;background:linear-gradient(135deg,#e11d8f,#f43f5e);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    +     '<svg width="11" height="11" viewBox="0 0 16 16" fill="#fff"><path d="M6 1L7.3 4.7 11 6 7.3 7.3 6 11 4.7 7.3 1 6 4.7 4.7Z"/><path d="M12.5 0.5L13.3 2.7 15.5 3.5 13.3 4.3 12.5 6.5 11.7 4.3 9.5 3.5 11.7 2.7Z" opacity=".8"/></svg>'
    +   '</div>'
    +   '<span style="font-size:13px;font-weight:600;color:var(--text)">AI-Suggested Placements</span>'
    + '</div>'
    + '<div style="font-size:11px;color:var(--muted);margin-bottom:14px;flex-shrink:0">Based on your parameters and audience fit</div>'
    + '<div style="overflow-x:auto;margin-bottom:14px">'
    +   '<table style="width:100%;border-collapse:collapse">'
    +   '<thead><tr>'
    +     '<th style="text-align:left;'  + TH + '">Moment</th>'
    +     '<th style="text-align:left;'  + TH + '">Channels</th>'
    +     '<th style="text-align:left;'  + TH + '">Type</th>'
    +     '<th style="text-align:right;' + TH + '">PODs</th>'
    +     '<th style="text-align:right;' + TH + '">Est. CPM</th>'
    +     '<th style="text-align:right;' + TH + '">Est. Impressions</th>'
    +     '<th style="' + TH + 'width:32px"></th>'
    +   '</tr></thead>'
    +   '<tbody>'
    +   sugg.map(function(s, idx) {
        var chansHtml = (s.channels || []).map(function(c) {
          return '<span style="font-size:10px;font-weight:500;color:var(--muted);background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:1px 6px;white-space:nowrap">' + c + '</span>';
        }).join(' ');
        var rowType = s.type || 'ads';
        var typeBadge = rowType === 'live'
          ? '<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;background:#fef2f2;border:1px solid #fecaca;border-radius:20px;padding:2px 8px;color:#dc2626;white-space:nowrap"><span style="width:5px;height:5px;border-radius:50%;background:#ef4444;display:inline-block;box-shadow:0 0 4px #ef4444"></span>Live</span>'
          : rowType === 'organic'
          ? '<span style="font-size:10px;font-weight:600;background:#f0fdfa;border:1px solid #99f6e4;border-radius:20px;padding:2px 8px;color:#0f766e;white-space:nowrap">Organic Pause</span>'
          : '<span style="font-size:10px;font-weight:600;background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:2px 8px;color:#1d4ed8;white-space:nowrap">VoD</span>';
        return '<tr style="border-bottom:1px solid var(--border)">'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text)">' + s.moment + '</td>'
          + '<td style="padding:10px 12px"><div style="display:flex;flex-wrap:wrap;gap:4px">' + chansHtml + '</div></td>'
          + '<td style="padding:10px 12px">' + typeBadge + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text);text-align:right">' + (s.pods || '—') + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text);text-align:right">' + s.cpm + '</td>'
          + '<td style="padding:10px 12px;font-size:12px;font-weight:500;color:var(--text);text-align:right">' + s.impressions + '</td>'
          + '<td style="padding:6px 8px;text-align:center">'
          +   '<button style="' + DELBTN + '" onclick="_aiSuggestions.splice(' + idx + ',1);mp2RenderNewPlanAIResults()" onmouseenter="this.style.color=\'#e11d8f\'" onmouseleave="this.style.color=\'var(--faint)\'">×</button>'
          + '</td>'
          + '</tr>';
      }).join('')
    +   '</tbody>'
    +   '<tfoot><tr>'
    +     '<td style="' + TOT + '">Total</td>'
    +     '<td style="' + TOT + '"></td>'
    +     '<td style="' + TOT + '"></td>'
    +     '<td style="' + TOT + '"></td>'
    +     '<td style="' + TOT + ';text-align:right">Avg $' + avgCpm + '</td>'
    +     '<td style="' + TOT + ';text-align:right">' + fmtImpr + '</td>'
    +     '<td style="' + TOT + '"></td>'
    +   '</tr></tfoot>'
    +   '</table>'
    + '</div>'
    + '<div style="display:flex;gap:8px;align-items:center">'
    +   '<input id="ai-plan-name" class="ai-input" placeholder="Media plan name…" style="flex:1;height:38px">'
    +   '<button onclick="aiSaveAIMediaPlan()" style="height:38px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;border:none;background:linear-gradient(135deg,#e11d8f,#f43f5e);color:#fff;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(225,29,143,.25);white-space:nowrap">'
    +     '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2h8l2 2v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="#fff" stroke-width="1.4"/><path d="M5 13V8h4v5M4 2v3h5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>'
    +     'Save Moments Group'
    +   '</button>'
    + '</div>'
    + '</div>';
}

function mp2ShowUpload() {
  mp2TaxStep = 'upload';
  mp2NewPlanStep = 1;
  _mp2GeoSelected = new Set();
  if (mp2CampaignMode === 'select') mp2LoadStep1Clients();
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  // Restore tab nav when returning to the home view
  var pills = document.getElementById('mp2-pills');
  if (pills) pills.style.display = '';

  var pgname = document.getElementById('content-bc');
  if (pgname) pgname.textContent = 'Moments Match';

  function inputArea(type) {
    var uploadZone = type === 'video'
      ? '<div class="tx2-upload-zone" style="padding:18px 20px" onclick="document.getElementById(\'tx2-file-input-video\').click()">'
        + '<input type="file" id="tx2-file-input-video" style="display:none" accept="video/*,image/*" onchange="if(this.files&&this.files.length)mp2ClearStep3Error()">'
        + '<svg width="20" height="20" viewBox="0 0 32 32" fill="none" style="color:var(--faint)"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
        + '<div style="font-size:12px;font-weight:500;color:var(--text);margin-top:4px">Drop Asset Here</div>'
        + '<div style="font-size:11px;color:var(--faint);margin-top:1px">MP4, MOV, JPG, PNG — up to 2 GB</div>'
        + '<button onclick="event.stopPropagation();document.getElementById(\'tx2-file-input-video\').click()" style="display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 12px;border:1px solid var(--border-md);border-radius:7px;font-size:11px;font-weight:500;color:var(--text);background:var(--surface);cursor:pointer;font-family:inherit;margin-top:8px;transition:border .15s" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--border-md)\'"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Browse</button>'
        + '</div>'
      : type === 'library'
      ? '<div class="tx2-upload-zone" style="padding:18px 20px" onclick="mp2OpenLibraryModal()">'
        + '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:var(--faint)"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>'
        + '<div style="font-size:12px;font-weight:500;color:var(--text);margin-top:4px">Upload Asset from Library</div>'
        + '<div style="font-size:11px;color:var(--faint);margin-top:1px">Browse and select from your Creative Library</div>'
        + '<button onclick="event.stopPropagation();mp2OpenLibraryModal()" style="display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 12px;border:1px solid var(--border-md);border-radius:7px;font-size:11px;font-weight:500;color:var(--text);background:var(--surface);cursor:pointer;font-family:inherit;margin-top:8px;transition:border .15s" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--border-md)\'"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Browse</button>'
        + '</div>'
      : '<div class="tx2-upload-zone" style="padding:18px 20px" onclick="document.getElementById(\'tx2-file-input-doc\').click()">'
        + '<input type="file" id="tx2-file-input-doc" style="display:none" accept=".pdf,.doc,.docx">'
        + '<svg width="20" height="20" viewBox="0 0 32 32" fill="none" style="color:var(--faint)"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.6"/><path d="M20 4v6h6M10 14h12M10 18h12M10 22h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
        + '<div style="font-size:12px;font-weight:500;color:var(--text);margin-top:4px">Drop PDF or document here</div>'
        + '<div style="font-size:11px;color:var(--faint);margin-top:1px">PDF, DOCX, TXT — up to 50 MB</div>'
        + '<button onclick="event.stopPropagation();document.getElementById(\'tx2-file-input-doc\').click()" style="display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 12px;border:1px solid var(--border-md);border-radius:7px;font-size:11px;font-weight:500;color:var(--text);background:var(--surface);cursor:pointer;font-family:inherit;margin-top:8px;transition:border .15s" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--border-md)\'"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Browse</button>'
        + '</div>';
    var textArea =
        '<textarea class="cs-textarea" id="tx2-text-input" placeholder="Paste or type your text here. The AI will analyse topics, sentiments, moments and taxonomy classifications…" style="width:100%;box-sizing:border-box;min-height:120px;resize:vertical"></textarea>';
    return type === 'text' ? textArea : uploadZone;
  }

  function typeIcon(t) {
    return t === 'video'
      ? '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
      : t === 'doc'
      ? '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
      : '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M4 8h24M4 14h18M4 20h24M4 26h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }

  var TX2_LIBRARY = [
    { type:'video', name:'kroger-ad.mp4',                date:'2 May 2025',   moments:14, taxonomies:38, lookback:'4 min',  flightStart:'1 Jun 2025',  flightEnd:'30 Jun 2025'  },
    { type:'video', name:'parks-and-rec-s04e11.mp4',     date:'29 Apr 2025',  moments:9,  taxonomies:22, lookback:'3 min',  flightStart:'15 May 2025', flightEnd:'15 Jun 2025'  },
    { type:'doc',   name:'Q1-content-brief.pdf',         date:'25 Apr 2025',  moments:6,  taxonomies:17, lookback:'2 min',  flightStart:'1 May 2025',  flightEnd:'31 May 2025'  },
    { type:'text',  name:'Campaign brief — Spring 2025', date:'18 Apr 2025',  moments:4,  taxonomies:11, lookback:'5 min',  flightStart:'1 Apr 2025',  flightEnd:'30 Apr 2025'  },
    { type:'video', name:'yellowstone-s05e08.mp4',       date:'11 Apr 2025',  moments:21, taxonomies:54, lookback:'4 min',  flightStart:'1 Jul 2025',  flightEnd:'31 Jul 2025'  },
    { type:'doc',   name:'Brand-safety-guidelines.docx', date:'3 Apr 2025',   moments:3,  taxonomies:9,  lookback:'90 sec', flightStart:'1 Jun 2025',  flightEnd:'15 Jun 2025'  },
  ];

  var libCols = [
    { label: '',               width: '36px'                       },
    { label: 'Analysis Name',  width: '220px'                      },
    { label: 'Campaign',       width: '220px'                      },
    { label: 'Client',         width: '120px'                      },
    { label: 'Advertiser',     width: '120px'                      },
    { label: 'Moments Groups', width: '90px',  align: 'center'     },
    { label: 'Date',           width: '100px'                      },
    { label: '',               width: '44px'                       },
  ];
  var TDl  = 'padding:11px 16px;font-size:12px;color:var(--text);border-bottom:1px solid var(--border)';
  var TDlm = 'padding:11px 16px;font-size:12px;color:var(--muted);border-bottom:1px solid var(--border)';
  var TDln = 'padding:11px 16px;font-size:12px;font-weight:600;color:var(--text);border-bottom:1px solid var(--border);text-align:right';
  var TDlc = 'padding:11px 16px;font-size:12px;border-bottom:1px solid var(--border);text-align:center';
  var libSearchBar = '<div style="padding:10px 16px;border-bottom:1px solid var(--border)">'
    + UI.searchBar('mp2-lib-search', 'Search analyses…', 'mp2LibSearch(this.value)')
    + '</div>';
  var libraryRows = UI.cardHeader({
    titleHtml: '<div style="font-size:13px;font-weight:600;color:var(--text)">Previous Moments Match</div>'
      + '<div style="font-size:12px;color:var(--faint)"><span id="mp2-analyses-subtitle">Loading…</span></div>',
    padding: '0',
    bodyHtml: libSearchBar + UI.tableScroll(libCols, '<tr><td colspan="8" style="padding:32px;text-align:center;font-size:12px;color:var(--faint)" id="mp2-analyses-loading">Loading…</td></tr>', 'mp2-lib-tbody', 0, null, { inCard: true, tableLayout: 'fixed' }),
  });

  ca.innerHTML =
    '<div style="display:flex;flex-direction:column">'

    // ── New Plan tab — gradient bg, 2 columns: AI panel | upload form ──
    + '<div id="tx2-home-panel-new-plan" style="' + (mp2HomeTab !== 'new-plan' ? 'display:none;' : '') + 'min-height:400px;background:linear-gradient(160deg,#fef6fb 0%,var(--surface) 65%);border-radius:10px;padding:28px 32px;display:flex;flex-direction:column">'
    +   '<div style="text-align:center;margin-bottom:16px">'
    +     '<div style="font-size:15px;font-weight:700;color:#0D1E36;margin-bottom:4px">AI-powered inventory matching and media plan generation</div>'
    +     '<div style="font-size:11px;color:var(--muted)">Scan your creatives or describe your campaign and let AI match them to the right shows and inventory.</div>'
    +   '</div>'
    // ── Stepper card ──
    +   '<div style="max-width:520px;width:100%;margin:0 auto;flex:1;display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">'

    // Stepper header
    +     '<div id="mp2-step-hdr">' + _mp2StepHdrHtml() + '</div>'

    // Step content area
    +     '<div style="padding:16px 20px;flex:1">'

    // Step 1 — Add Campaign
    +       '<div id="mp2-step1">' + _mp2Step1Html() + '</div>'

    // Step 2 — Add Campaign Details
    +       '<div id="mp2-step2" style="display:none"><div id="mp2-new-plan-ai-panel"></div></div>'

    // Step 3 — Add Asset
    +       '<div id="mp2-step3" style="display:none">'
    +         '<div style="margin-bottom:10px">'
    +           '<label style="font-size:10px;font-weight:600;color:var(--faint);text-transform:uppercase;letter-spacing:.6px;display:block;margin-bottom:4px">Analysis Name</label>'
    +           '<input id="mp2-analysis-name-input" type="text" placeholder="e.g. Summer Campaign Q3" style="width:100%;box-sizing:border-box;height:34px;padding:0 10px;border:1px solid var(--border);border-radius:8px;font-size:12px;color:var(--text);background:var(--surface);font-family:inherit;outline:none" onfocus="this.style.borderColor=\'var(--accent)\'" onblur="this.style.borderColor=\'var(--border)\'">'
    +         '</div>'
    +         '<div style="display:flex;gap:2px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:3px;margin-bottom:10px">'
    +           '<div class="tx2-seg tx2-seg--act" id="tx2-opt-video" onclick="mp2SelectInput(\'video\')">'
    +             '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
    +             '<span>New Asset</span>'
    +           '</div>'
    +           '<div class="tx2-seg" id="tx2-opt-library" onclick="mp2SelectInput(\'library\')">'
    +             '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>'
    +             '<span>Asset from Library <span id="mp2-tab-badge-library" style="display:none;min-width:13px;height:13px;border-radius:7px;padding:0 3px;background:#5A6578;color:#fff;font-size:8px;font-weight:700;line-height:13px;text-align:center;vertical-align:middle;margin-left:3px"></span></span>'
    +           '</div>'
    +           '<div class="tx2-seg" id="tx2-opt-brief" onclick="mp2SelectInput(\'brief\')">'
    +             '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M4 8h24M4 14h18M4 20h24M4 26h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    +             '<span>Brief <span id="mp2-tab-badge-brief" style="display:none;min-width:13px;height:13px;border-radius:7px;padding:0 3px;background:#5A6578;color:#fff;font-size:8px;font-weight:700;line-height:13px;text-align:center;vertical-align:middle;margin-left:3px"></span></span>'
    +           '</div>'
    +         '</div>'
    +         '<div id="tx2-input-area" style="margin-bottom:10px">' + inputArea('video') + '</div>'
    +         '<div style="margin-bottom:0">'
    +           '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">'
    +             '<div style="display:flex;align-items:center;gap:4px">'
    +               '<span style="font-size:10px;font-weight:600;color:var(--faint);text-transform:uppercase;letter-spacing:.6px">Lookback Window</span>'
    +               '<span style="position:relative;display:inline-flex;align-items:center" onmouseenter="this.querySelector(\'.mp2-lbw-tt\').style.display=\'block\'" onmouseleave="this.querySelector(\'.mp2-lbw-tt\').style.display=\'none\'">'
    +                 '<svg width="12" height="12" viewBox="0 0 14 14" fill="none" style="color:var(--faint);cursor:default"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M7 6.5v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="5" r=".6" fill="currentColor"/></svg>'
    +                 '<span class="mp2-lbw-tt" style="display:none;position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);width:220px;background:#1e293b;color:#e2e8f0;font-size:10px;line-height:1.5;padding:7px 10px;border-radius:7px;box-shadow:0 4px 16px rgba(0,0,0,.2);z-index:999;pointer-events:none">The lookback window indicates the time before an Ad Break used to qualify the scene as a Moment</span>'
    +               '</span>'
    +             '</div>'
    +             '<span id="mp2-lookback-label" style="font-size:11px;font-weight:600;color:var(--accent)">' + _mp2FmtWindowSecs(mp2LookbackSecs) + '</span>'
    +           '</div>'
    +           '<input type="range" id="mp2-lookback-slider" min="30" max="300" value="' + mp2LookbackSecs + '" step="15" oninput="mp2UpdateLookback(this.value)" style="accent-color:var(--accent)">'
    +           '<div style="display:flex;justify-content:space-between;margin-top:1px">'
    +             '<span style="font-size:9px;color:var(--faint)">30 sec</span>'
    +             '<span style="font-size:9px;color:var(--faint)">5 min</span>'
    +           '</div>'
    +         '</div>'
    +       '</div>'

    +     '</div>'
    // Stepper nav footer
    +     '<div id="mp2-step-nav">' + _mp2StepNavHtml() + '</div>'
    +   '</div>'
    + '</div>'

    // ── Previous Analysis tab ──
    + '<div id="tx2-home-panel-analyses" style="overflow-y:auto;flex-direction:column;gap:0;' + (mp2HomeTab !== 'analyses' ? 'display:none' : 'display:flex') + '">'
    +   libraryRows
    + '</div>'

    + '</div>';

  setTimeout(function(){
    mp2SliderFill(mp2LookbackSecs);
    if (mp2HomeTab === 'analyses') mp2LoadAnalysesTable();
  }, 0);
}

function mp2OpenLibraryModal() {
  var lib = (typeof CS_LIBRARY !== 'undefined') ? CS_LIBRARY : [];

  // If CS_LIBRARY is empty, fetch from DB first then re-open
  if (!lib.length) {
    fetch('/api/creatives')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.creatives && data.creatives.length) {
          if (typeof CS_LIBRARY !== 'undefined') CS_LIBRARY = data.creatives;
        }
        mp2OpenLibraryModal();
      })
      .catch(function() { mp2OpenLibraryModal(); });
    return;
  }

  // If no campaign/client selected, show only unassigned creatives
  var noCampaignContext = !mp2SelectedCampaign && !mp2SelectedClientId;
  if (noCampaignContext) {
    lib = lib.filter(function(cr) { return !cr.campaign; });
  }

  var PINNED = ['cr_w1', 'cr_w2'];
  var sorted = lib.slice().sort(function(a, b) {
    var pa = PINNED.indexOf(a.id), pb = PINNED.indexOf(b.id);
    if (pa >= 0 || pb >= 0) {
      if (pa < 0) pa = 999; if (pb < 0) pb = 999;
      return pa - pb;
    }
    if (a.campaign && !b.campaign) return -1;
    if (!a.campaign && b.campaign) return 1;
    if (a.campaign && b.campaign && a.campaign !== b.campaign) return a.campaign < b.campaign ? -1 : 1;
    return 0;
  });

  var BADGE = 'font-size:9px;font-weight:600;border-radius:4px;padding:2px 7px;border:1px solid;white-space:nowrap';
  var TD    = 'padding:10px 16px;vertical-align:middle;border-bottom:1px solid var(--border)';

  var rows = sorted.map(function(cr) {
    var lbl = (cr.name + ' ' + (cr.campaign || '') + ' ' + cr.advertiser + ' ' + (cr.mediaType || '') + ' ' + (cr.fileType || '')).toLowerCase();

    var chk = '<td style="' + TD + ';width:36px;padding-right:0;padding-left:14px" onclick="event.stopPropagation();mp2LibModalSelect(\'' + cr.id + '\')">'
      + '<input type="checkbox" id="mp2-lm-chk-' + cr.id + '" style="width:14px;height:14px;accent-color:var(--accent);cursor:pointer;display:block">'
      + '</td>';

    var thumb = '<td style="' + TD + ';padding-right:6px;width:60px">'
      + '<div style="width:56px;height:32px;border-radius:4px;overflow:hidden;background:#e5e7eb">'
      + '<img src="' + (cr.thumb || '') + '" style="width:100%;height:100%;object-fit:cover;display:block"></div></td>';

    var name = '<td style="' + TD + '">'
      + '<div style="font-weight:600;color:var(--text);font-size:12px">' + (cr.name || '—') + '</div>'
      + '<div style="font-size:10px;color:var(--faint);margin-top:2px">' + (cr.fileType || '') + '</div></td>';

    var adv  = '<td style="' + TD + ';font-size:12px">' + (cr.advertiser || '—') + '</td>';
    var camp = '<td style="' + TD + ';font-size:12px;color:' + (cr.campaign ? 'var(--text)' : 'var(--faint)') + '">' + (cr.campaign || '—') + '</td>';

    var mtStyle = cr.mediaType === 'CTV' ? 'color:#1d4ed8;background:#eff6ff;border-color:#bfdbfe'
                : cr.mediaType === 'Web' ? 'color:#7c3aed;background:#f5f3ff;border-color:#ddd6fe'
                :                          'color:#0369a1;background:#f0f9ff;border-color:#bae6fd';
    var mt = '<td style="' + TD + '"><span style="' + BADGE + ';' + mtStyle + '">' + (cr.mediaType || '—') + '</span></td>';

    var tpls = (cr.templates && cr.templates.length)
      ? cr.templates.map(function(t) {
          return '<span style="' + BADGE + ';color:#e11d8f;background:#fdf2f8;border-color:#f9a8d4;margin-right:3px">' + t + '</span>';
        }).join('')
      : '<span style="font-size:11px;color:var(--faint)">—</span>';
    var tpl  = '<td style="' + TD + '">' + tpls + '</td>';
    var date = '<td style="' + TD + ';color:var(--muted);font-size:11px">' + (cr.date || '—') + '</td>';

    return '<tr data-id="' + cr.id + '" data-lbl="' + lbl + '"'
      + ' onclick="mp2LibModalSelect(\'' + cr.id + '\')"'
      + ' style="cursor:pointer;transition:background .12s"'
      + ' onmouseover="if(!this.classList.contains(\'mp2-lm-sel\'))this.style.background=\'var(--hover)\'"'
      + ' onmouseout="if(!this.classList.contains(\'mp2-lm-sel\'))this.style.background=\'\'">'
      + chk + thumb + name + adv + camp + mt + tpl + date + '</tr>';
  }).join('');

  var cols = [
    { label: '',           width: '36px'  },
    { label: '',           width: '60px'  },
    { label: 'Creative'                   },
    { label: 'Advertiser', width: '130px' },
    { label: 'Campaign',   width: '170px' },
    { label: 'Media',      width: '75px'  },
    { label: 'Templates'                  },
    { label: 'Date',       width: '105px' },
  ];

  var searchBar = '<div style="padding:10px 16px 8px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px">'
    + UI.searchBar('mp2-lib-modal-search', 'Search creatives, campaigns, advertisers…', 'mp2FilterLibraryModal(this.value)')
    + '<span style="font-size:11px;color:var(--faint);white-space:nowrap;flex-shrink:0">Select one or more</span>'
    + '</div>';

  var bodyHtml = '<div style="margin:-20px -24px">'
    + searchBar + UI.tableScroll(cols, rows, 'mp2-lib-modal-tbody', 0, null, { inCard: true })
    + '</div>';

  UI.openModal({
    id: 'mp2-library-modal',
    title: 'Select Asset from Creative Library',
    subtitle: lib.length + ' creative' + (lib.length !== 1 ? 's' : '') + (noCampaignContext ? ' · unassigned only' : ''),
    width: '860px',
    closeFn: 'mp2CloseLibraryModal',
    bodyHtml: bodyHtml,
    footerLeft: UI.btnText('Cancel', 'mp2CloseLibraryModal()', 'var(--muted)'),
    footerRight: UI.btnPrimary('Select', 'mp2ConfirmLibraryAsset()'),
  });
}

function mp2CloseLibraryModal() { UI.closeModal('mp2-library-modal'); }

function mp2LibModalSelect(id) {
  var row = document.querySelector('#mp2-lib-modal-tbody tr[data-id="' + id + '"]');
  if (!row) return;
  var nowSel = !row.classList.contains('mp2-lm-sel');
  row.classList.toggle('mp2-lm-sel', nowSel);
  row.style.background = nowSel ? 'var(--subtle)' : '';
  var chk = row.querySelector('input[type="checkbox"]');
  if (chk) chk.checked = nowSel;

  // Update Select button count
  var count = document.querySelectorAll('#mp2-lib-modal-tbody .mp2-lm-sel').length;
  var btn = document.querySelector('#mp2-library-modal [onclick="mp2ConfirmLibraryAsset()"]');
  if (btn) btn.textContent = count > 0 ? 'Select (' + count + ')' : 'Select';
}

function mp2ConfirmLibraryAsset() {
  var selRows = document.querySelectorAll('#mp2-lib-modal-tbody .mp2-lm-sel');
  if (!selRows.length) return;
  var lib = (typeof CS_LIBRARY !== 'undefined') ? CS_LIBRARY : [];
  var items = [];
  selRows.forEach(function(row) {
    var id = row.getAttribute('data-id');
    var cr = lib.filter(function(c) { return c.id === id; })[0];
    if (cr) items.push(cr);
  });
  if (!items.length) return;
  mp2LibrarySelectedItems = items;
  mp2LibrarySelected = items[0]; // keep first for step-1 compat
  mp2ClearStep3Error();
  var area = document.getElementById('tx2-input-area');
  if (area) area.innerHTML = _mp2LibrarySelectedGridHtml(items);
  mp2CloseLibraryModal();
  mp2UpdateTabBadges();
}

function mp2DeselectLibraryItem(id) {
  mp2LibrarySelectedItems = mp2LibrarySelectedItems.filter(function(c) { return c.id !== id; });
  mp2LibrarySelected = mp2LibrarySelectedItems.length ? mp2LibrarySelectedItems[0] : null;
  var area = document.getElementById('tx2-input-area');
  if (!area) return;
  if (mp2LibrarySelectedItems.length === 0) {
    mp2LibrarySelected = null;
    mp2LibrarySelectedItems = [];
    // Revert to empty library zone
    area.innerHTML = '<div class="tx2-upload-zone" style="padding:18px 20px" onclick="mp2OpenLibraryModal()">'
      + '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:var(--faint)"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>'
      + '<div style="font-size:12px;font-weight:500;color:var(--text);margin-top:4px">Upload Asset from Library</div>'
      + '<div style="font-size:11px;color:var(--faint);margin-top:1px">Browse and select from your Creative Library</div>'
      + '<button onclick="event.stopPropagation();mp2OpenLibraryModal()" style="display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 12px;border:1px solid var(--border-md);border-radius:7px;font-size:11px;font-weight:500;color:var(--text);background:var(--surface);cursor:pointer;font-family:inherit;margin-top:8px;transition:border .15s" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--border-md)\'"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Browse</button>'
      + '</div>';
  } else {
    area.innerHTML = _mp2LibrarySelectedGridHtml(mp2LibrarySelectedItems);
  }
  mp2UpdateTabBadges();
}

function _mp2LibrarySelectedGridHtml(items) {
  var tiles = items.map(function(a) {
    var tpls = (a.templates && a.templates.length) ? a.templates : [];
    var tplChips = tpls.map(function(t) {
      var label = (t && typeof t === 'object') ? (t.name || String(t.id || '')) : String(t);
      return '<span style="font-size:9px;font-weight:600;padding:2px 5px;border-radius:4px;background:var(--subtle);color:var(--muted);border:1px solid var(--border);white-space:nowrap;flex-shrink:0">' + label + '</span>';
    }).join('');
    var bottomSection = tpls.length
      ? '<div style="padding:4px 6px 6px;border-top:1px solid var(--border);flex:1;display:flex;flex-wrap:wrap;align-content:flex-start;gap:3px">' + tplChips + '</div>'
      : '<div style="padding:5px 6px 6px;border-top:1px solid var(--border);flex:1;display:flex;align-items:center;justify-content:center"><span style="font-size:9px;color:var(--faint)">No templates</span></div>';
    var fileType = a.fileType || a.mediaType || '';
    return '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;background:var(--surface);position:relative;display:flex;flex-direction:column">'
      + '<div style="aspect-ratio:16/9;background:#e5e7eb;overflow:hidden;flex-shrink:0">'
      +   '<img src="' + (a.thumb || '') + '" style="width:100%;height:100%;object-fit:cover;display:block">'
      + '</div>'
      + '<div style="position:absolute;top:4px;left:4px;font-size:8px;font-weight:700;padding:1px 5px;border-radius:3px;background:rgba(0,0,0,.5);color:#fff">' + fileType + '</div>'
      + '<button onclick="mp2DeselectLibraryItem(\'' + a.id + '\')" style="position:absolute;top:3px;right:3px;width:17px;height:17px;border:none;border-radius:4px;background:rgba(0,0,0,.4);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:background .12s" onmouseover="this.style.background=\'#ef4444\'" onmouseout="this.style.background=\'rgba(0,0,0,.4)\'">'
      +   '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      + '</button>'
      + '<div style="padding:4px 6px;flex-shrink:0">'
      +   '<div style="font-size:10px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (a.name || '—') + '</div>'
      + '</div>'
      + bottomSection
      + '</div>';
  }).join('');

  var addMoreTile = '<div onclick="mp2OpenLibraryModal()" '
    + 'style="border:1.5px dashed var(--border-md);border-radius:8px;cursor:pointer;transition:border-color .15s;background:var(--bg);display:flex;align-items:center;justify-content:center;min-height:60px" '
    + 'onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--border-md)\'">'
    +   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
    + '</div>';

  return '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">' + tiles + addMoreTile + '</div>';
}

function _mp2LibrarySelectedHtml(cr) {
  // Template icon map
  function tplIcon(name) {
    var n = (name || '').toLowerCase();
    if (n.indexOf('l-bar') >= 0 || n.indexOf('lbar') >= 0)
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="14" width="20" height="7" rx="2"/><rect x="2" y="3" width="9" height="9" rx="2"/></svg>';
    if (n.indexOf('sync') >= 0)
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>';
    if (n.indexOf('pause') >= 0)
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>';
  }

  var tpls = (cr.templates && cr.templates.length) ? cr.templates : [];
  var tilesHtml = tpls.length
    ? tpls.map(function(t) {
        return '<div style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:var(--bg);border:1px solid var(--border);border-radius:6px">'
          + '<span style="color:var(--text);display:flex;align-items:center;flex-shrink:0">' + tplIcon(t) + '</span>'
          + '<span style="font-size:11px;font-weight:500;color:var(--text);white-space:nowrap">' + t + '</span>'
          + '</div>';
      }).join('')
    : '<span style="font-size:11px;color:var(--faint)">No templates assigned</span>';

  var mtStyle = cr.mediaType === 'CTV' ? 'color:#1d4ed8;background:#eff6ff;border-color:#bfdbfe'
              : cr.mediaType === 'Web' ? 'color:#7c3aed;background:#f5f3ff;border-color:#ddd6fe'
              :                          'color:#0369a1;background:#f0f9ff;border-color:#bae6fd';
  var BADGE = 'font-size:9px;font-weight:600;border-radius:4px;padding:2px 7px;border:1px solid;white-space:nowrap';

  var SECTION_LBL = 'font-size:10px;font-weight:600;color:var(--faint);text-transform:uppercase;letter-spacing:.6px';

  var leftCol = '<div style="flex:0 0 52%;display:flex;flex-direction:column;gap:8px">'
    + '<div style="' + SECTION_LBL + '">Asset</div>'
    // thumbnail + name block
    + '<div style="display:flex;gap:10px;align-items:flex-start">'
    +   '<img src="' + (cr.thumb || '') + '" style="width:72px;height:42px;object-fit:cover;border-radius:5px;border:1px solid var(--border);flex-shrink:0">'
    +   '<div style="min-width:0">'
    +     '<div style="font-size:12px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (cr.name || '—') + '</div>'
    +     '<div style="font-size:10px;color:var(--faint);margin-top:3px">'
    +       (cr.fileType || '') + (cr.mediaType ? ' · ' + cr.mediaType : '')
    +     '</div>'
    +   '</div>'
    + '</div>'
    // advertiser row
    + '<div style="display:flex;justify-content:space-between;align-items:baseline;padding:4px 0;border-bottom:1px solid var(--border)">'
    +   '<span style="font-size:10px;color:var(--faint);flex-shrink:0;margin-right:6px">Advertiser</span>'
    +   '<span style="font-size:10px;font-weight:500;color:var(--text);text-align:right;word-break:break-all">' + (cr.advertiser || '—') + '</span>'
    + '</div>'
    // campaign row
    + '<div style="display:flex;justify-content:space-between;align-items:baseline;padding:4px 0;border-bottom:1px solid var(--border)">'
    +   '<span style="font-size:10px;color:var(--faint);flex-shrink:0;margin-right:6px">Campaign</span>'
    +   '<span style="font-size:10px;font-weight:500;color:' + (cr.campaign ? 'var(--text)' : 'var(--faint)') + ';text-align:right;word-break:break-all">' + (cr.campaign || '—') + '</span>'
    + '</div>'
    + '</div>';

  var rightCol = '<div style="flex:1;display:flex;flex-direction:column;gap:8px;border-left:1px solid var(--border);padding-left:14px">'
    + '<div style="' + SECTION_LBL + '">Templates</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:6px">' + tilesHtml + '</div>'
    + '</div>';

  return '<div style="border:1px solid var(--border-md);border-radius:8px;overflow:hidden;background:var(--surface)">'
    + '<div style="padding:14px;display:flex;gap:14px">' + leftCol + rightCol + '</div>'
    + '<div style="height:1px;background:var(--border)"></div>'
    + '<label onclick="mp2OpenLibraryModal()"'
    +   ' style="display:flex;align-items:center;gap:7px;padding:8px 12px;cursor:pointer;color:var(--muted);font-size:12px;transition:background .13s,color .13s;border-radius:0 0 8px 8px"'
    +   ' onmouseenter="this.style.background=\'var(--bg)\';this.style.color=\'var(--text)\'"'
    +   ' onmouseleave="this.style.background=\'\';this.style.color=\'var(--muted)\'">'
    +   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>'
    +   '<span>Change Asset</span>'
    + '</label>'
    + '</div>';
}

function mp2FilterLibraryModal(q) {
  var term = (q || '').toLowerCase().trim();
  document.querySelectorAll('#mp2-lib-modal-tbody tr[data-id]').forEach(function(el) {
    el.style.display = (!term || (el.getAttribute('data-lbl') || '').indexOf(term) >= 0) ? '' : 'none';
  });
}

function mp2LibSearch(q) {
  var term = (q || '').toLowerCase().trim();
  if (!_mp2AnalysesCache.length) return;
  var filtered = !term ? _mp2AnalysesCache : _mp2AnalysesCache.filter(function(a) {
    return (a.moments_match_analysis_name  || '').toLowerCase().indexOf(term) >= 0
        || (a.campaign_name  || '').toLowerCase().indexOf(term) >= 0
        || (a.client_name    || '').toLowerCase().indexOf(term) >= 0
        || (a.advertiser_name|| '').toLowerCase().indexOf(term) >= 0;
  });
  _mp2RenderAnalysisRows(filtered);
}

function mp2PlansSearch(q) {
  var term = (q || '').toLowerCase().trim();
  document.querySelectorAll('#mp2-plans-tbody tr').forEach(function(tr) {
    tr.style.display = (!term || tr.textContent.toLowerCase().indexOf(term) >= 0) ? '' : 'none';
  });
}

function mp2DeleteAnalysis(analysisId, btn) {
  var rec = _mp2AnalysesCache.filter(function(a) { return a.moments_match_analysis_id === analysisId; })[0] || {};
  var aName = rec.moments_match_analysis_name || ('Analysis #' + analysisId);
  mp2ShowConfirmModal(
    'Delete analysis?',
    'Deleting <strong>' + aName.replace(/</g,'&lt;') + '</strong> will also permanently remove all media plans associated with this analysis. This cannot be undone.',
    function() {
      if (btn) { btn.disabled = true; btn.style.opacity = '0.4'; }
      fetch('/api/moments-match?moments_match_analysis_id=' + analysisId, { method: 'DELETE' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.ok) {
            _mp2AnalysesCache = _mp2AnalysesCache.filter(function(a) { return a.moments_match_analysis_id !== analysisId; });
            delete _mp2ExpandedRows[analysisId];
            _mp2RenderAnalysisRows(_mp2AnalysesCache);
            var subtitle = document.getElementById('mp2-analyses-subtitle');
            var n = _mp2AnalysesCache.length;
            if (subtitle) subtitle.textContent = n + ' anal' + (n !== 1 ? 'yses' : 'ysis');
          } else {
            if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
          }
        })
        .catch(function() {
          if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
        });
    }
  );
}

function mp2LibLoad(analysisId, analysisName) {
  _mp2AnalysisFromSaved = true;
  var url = mp2AnalysisUrl(analysisId, analysisName, 'saved');
  history.pushState({ id: 'media-planner-v2', label: 'Media Planner', mp2View: 'analysis', analysisId: analysisId, origin: 'saved' }, '', url);
  mp2ShowResults(analysisId);
}

// ── Previous Analysis table — DB-backed ───────────────────────────────────────
var _mp2AnalysesCache = [];   // full fetched list; used by search + delete
var _mp2ExpandedRows  = {};   // analysisId → true/false

function mp2LoadAnalysesTable() {
  var tbody    = document.getElementById('mp2-lib-tbody');
  var subtitle = document.getElementById('mp2-analyses-subtitle');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="8" style="padding:32px;text-align:center;font-size:12px;color:var(--faint)">Loading…</td></tr>';
  if (subtitle) subtitle.textContent = 'Loading…';

  var _analysesQs = (typeof _appIsSuperOrg === 'function' && !_appIsSuperOrg() && typeof selectedClientOrgId !== 'undefined' && selectedClientOrgId)
    ? '?client_org_id=' + selectedClientOrgId : '';
  fetch('/api/moments-match' + _analysesQs)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      _mp2AnalysesCache = data.analyses || [];
      var n = _mp2AnalysesCache.length;
      if (subtitle) subtitle.textContent = n + ' anal' + (n !== 1 ? 'yses' : 'ysis');
      _mp2RenderAnalysisRows(_mp2AnalysesCache);
    })
    .catch(function(e) {
      if (subtitle) subtitle.textContent = 'Error';
      tbody.innerHTML = '<tr><td colspan="8" style="padding:32px;text-align:center;font-size:12px;color:#dc2626">Error loading analyses: ' + e.message + '</td></tr>';
    });
}

// Toggle expand/collapse for an analysis row
function mp2ToggleAnalysisExpand(analysisId, e) {
  if (e) e.stopPropagation();
  _mp2ExpandedRows[analysisId] = !_mp2ExpandedRows[analysisId];
  var chevron = document.getElementById('mp2-chev-' + analysisId);
  var open    = _mp2ExpandedRows[analysisId];
  if (chevron) chevron.style.transform = open ? 'rotate(90deg)' : 'rotate(0deg)';
  // sub-rows are siblings in the same table — find by class
  var subRows = document.querySelectorAll('.mp2-sub-' + analysisId);
  if (!subRows.length) { _mp2RenderAnalysisRows(_mp2AnalysesCache); return; }
  subRows.forEach(function(tr) { tr.style.display = open ? '' : 'none'; });
}

// Delete a specific media plan from an analysis (from the expanded sub-rows)
function mp2DeleteAnalysisPlanFromLib(analysisId, planIdx, planName) {
  mp2ShowConfirmModal(
    'Delete media plan?',
    'Are you sure you want to delete <strong>' + (planName || 'this plan').replace(/</g,'&lt;') + '</strong>? This cannot be undone.',
    function() {
      var rec = _mp2AnalysesCache.filter(function(a) { return a.moments_match_analysis_id === analysisId; })[0];
      if (!rec || !Array.isArray(rec.moments_groups)) return;
      rec.moments_groups.splice(planIdx, 1);
      // Remove old sub-rows and re-insert
      document.querySelectorAll('.mp2-sub-' + analysisId).forEach(function(tr) { tr.remove(); });
      var anchor = document.getElementById('mp2-anchor-' + analysisId);
      if (anchor) {
        var newHtml = _mp2SubRowsHtml(analysisId, rec.moments_groups, true);
        anchor.insertAdjacentHTML('afterend', newHtml);
      }
      var countEl = document.getElementById('mp2-pcount-' + analysisId);
      if (countEl) countEl.textContent = rec.moments_groups.length;
      fetch('/api/moments-match?moments_match_analysis_id=' + analysisId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moments_groups: rec.moments_groups })
      }).catch(function(err) { console.warn('mp2DeleteAnalysisPlanFromLib DB error:', err); });
    }
  );
}

// ─── Sub-rows for expanded media plans ────────────────────────────────────────
// Returns sibling <tr> elements for the SAME parent table — no nested table,
// so column widths are inherited from the parent's table-layout:fixed automatically.
// ─────────────────────────────────────────────────────────────────────────────
function _mp2SubRowsHtml(analysisId, plans, visible) {
  var _cacheRec = (_mp2AnalysesCache || []).filter(function(a) { return a.moments_match_analysis_id === analysisId; })[0] || {};
  var _campName = (_cacheRec.campaign_name || '').replace(/</g,'&lt;');
  var cls  = 'mp2-sub-' + analysisId;
  var disp = visible ? '' : 'display:none';

  var HDR = 'padding:5px 16px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);background:var(--bg);border-bottom:1px solid var(--border);overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
  var CEL = 'padding:7px 16px;font-size:11px;border-bottom:1px solid var(--border);background:var(--surface);overflow:hidden;text-overflow:ellipsis;white-space:nowrap';

  // Header row (Plan Name / Campaign / Channels / …)
  var hdrRow = '<tr class="' + cls + '" style="' + disp + '">'
    + '<td style="' + HDR + '"></td>'
    + '<td style="' + HDR + ';text-align:left">Moment Gr. Name</td>'
    + '<td style="' + HDR + ';text-align:left">Campaign</td>'
    + '<td style="' + HDR + ';text-align:center">Channels</td>'
    + '<td style="' + HDR + ';text-align:center">Moments</td>'
    + '<td style="' + HDR + ';text-align:right">Est. Imp.</td>'
    + '<td style="' + HDR + ';text-align:right">Avg CPM</td>'
    + '<td style="' + HDR + '"></td>'
    + '</tr>';

  if (!plans || !plans.length) {
    var emptyRow = '<tr class="' + cls + '" style="' + disp + '">'
      + '<td style="' + CEL + '"></td>'
      + '<td colspan="7" style="' + CEL + ';color:var(--faint);font-style:italic">No Moments saved for this analysis.</td>'
      + '</tr>';
    return hdrRow + emptyRow;
  }

  var MERGE_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/></svg>';
  var TRASH_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>';
  var IBTN = 'display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:none;background:none;cursor:pointer;border-radius:4px;transition:color .15s,background .15s';

  function fmtImpr(n) {
    n = Number(n) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return Math.round(n / 1000) + 'K';
    return n || '—';
  }
  function fmtCpm(n) { return n ? '$' + Number(n).toFixed(2) : '—'; }

  var dataRows = plans.map(function(p, idx) {
    var moms        = Array.isArray(p.moments) ? p.moments : [];
    var momCount    = moms.length;
    var totalImpr   = moms.reduce(function(s,m){ return s + (Number(m.moment_est_impr)||0); }, 0);
    var totalDollar = moms.reduce(function(s,m){ return s + (Number(m.moment_est_dollar_value)||0); }, 0);
    var avgCpm      = (totalImpr > 0) ? (totalDollar / totalImpr * 1000) : 0;
    var chanSet = {};
    moms.forEach(function(m){ (m.moment_channels||[]).forEach(function(c){ chanSet[c]=1; }); });
    var chanCount = Object.keys(chanSet).length;
    var pName     = (p.media_plan_name || 'Untitled').replace(/</g,'&lt;');
    var safeQ     = (p.media_plan_name || 'Untitled').replace(/'/g,"\\'").replace(/</g,'&lt;');

    var chanBadge = chanCount
      ? '<span style="display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:16px;padding:0 5px;border-radius:9px;background:var(--bg);border:1px solid var(--border);font-size:10px;font-weight:600;color:var(--muted)">' + chanCount + '</span>'
      : '<span style="color:var(--faint)">—</span>';

    var delBtn = '<button onclick="event.stopPropagation();mp2DeleteAnalysisPlanFromLib(' + analysisId + ',' + idx + ',\'' + safeQ + '\')"'
      + ' style="' + IBTN + ';color:var(--faint)"'
      + ' onmouseover="this.style.color=\'#dc2626\';this.style.background=\'#fef2f2\'"'
      + ' onmouseout="this.style.color=\'var(--faint)\';this.style.background=\'none\'">'
      + TRASH_ICON + '</button>';

    return '<tr class="' + cls + '" style="' + disp + '">'
      + '<td style="' + CEL + '"></td>'
      + '<td style="' + CEL + ';font-weight:600;color:var(--text);max-width:0">' + pName + '</td>'
      + '<td style="' + CEL + ';color:var(--muted);vertical-align:middle;overflow:hidden;max-width:0">'
      +   '<div style="display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden">'
      +     '<span style="overflow:hidden;text-overflow:ellipsis;flex-shrink:1;min-width:0">' + (_campName || '—') + '</span>'
      +     ((_cacheRec.campaign_status) && typeof cmStatusChip === 'function' ? cmStatusChip(_cacheRec.campaign_status) : '')
      +   '</div>'
      + '</td>'
      + '<td style="' + CEL + ';text-align:center">' + chanBadge + '</td>'
      + '<td style="' + CEL + ';color:var(--muted);text-align:center">' + (momCount || '—') + '</td>'
      + '<td style="' + CEL + ';color:var(--muted);text-align:right">' + (totalImpr ? fmtImpr(totalImpr) : '—') + '</td>'
      + '<td style="' + CEL + ';color:var(--muted);text-align:right">' + (avgCpm ? fmtCpm(avgCpm) : '—') + '</td>'
      + '<td style="' + CEL + ';text-align:center;padding:4px 8px">'
      +   '<div style="display:flex;align-items:center;justify-content:center;gap:2px">' + delBtn + '</div>'
      + '</td>'
      + '</tr>';
  }).join('');

  return hdrRow + dataRows;
}

function _mp2RenderAnalysisRows(analyses) {
  var tbody = document.getElementById('mp2-lib-tbody');
  if (!tbody) return;

  if (!analyses.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="padding:40px;text-align:center;font-size:12px;color:var(--faint)">No analyses yet. Run your first analysis from New Plan.</td></tr>';
    return;
  }

  var CHEVRON_R = '<svg id="mp2-chev-{ID}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:transform .18s;transform:{ROT};flex-shrink:0"><polyline points="9 18 15 12 9 6"/></svg>';

  var TDchev = 'padding:0 0 0 12px;width:36px;border-bottom:1px solid var(--border);vertical-align:middle';
  var TDl    = 'padding:11px 16px;font-size:12px;color:var(--text);border-bottom:1px solid var(--border)';
  var TDlm   = 'padding:11px 16px;font-size:12px;color:var(--muted);border-bottom:1px solid var(--border)';
  var TDlc   = 'padding:11px 16px;font-size:12px;color:var(--muted);border-bottom:1px solid var(--border);text-align:center';

  tbody.innerHTML = analyses.map(function(a) {
    var aid  = a.moments_match_analysis_id;
    var open = !!_mp2ExpandedRows[aid];

    var chevron = CHEVRON_R
      .replace('{ID}', aid)
      .replace('{ROT}', open ? 'rotate(90deg)' : 'rotate(0deg)');

    var analysisLabel = (a.moments_match_analysis_name || ('Analysis #' + aid)).replace(/</g,'&lt;');
    var safeQuote     = (a.moments_match_analysis_name || '').replace(/'/g,"\\'");

    var dateStr = a.created_at
      ? new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '—';

    var planCount = Array.isArray(a.moments_groups) ? a.moments_groups.length : 0;

    var deleteBtn = '<button onclick="event.stopPropagation();mp2DeleteAnalysis(' + aid + ',this)"'
      + ' style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:none;background:none;cursor:pointer;border-radius:6px;color:var(--faint);transition:color .15s,background .15s"'
      + ' onmouseover="this.style.color=\'#dc2626\';this.style.background=\'#fef2f2\'"'
      + ' onmouseout="this.style.color=\'var(--faint)\';this.style.background=\'none\'">'
      + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>'
      + '</button>';

    // Main analysis row — id used as anchor for sub-row insertion after delete
    var mainRow = '<tr id="mp2-anchor-' + aid + '" style="cursor:pointer;transition:background .12s"'
      + ' onclick="mp2LibLoad(' + aid + ',\'' + safeQuote + '\')"'
      + ' onmouseover="this.style.background=\'var(--hover)\'"'
      + ' onmouseout="this.style.background=\'\'">'
      + '<td style="' + TDchev + '">'
      +   '<button onclick="mp2ToggleAnalysisExpand(' + aid + ',event)"'
      +     ' style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border:none;background:none;cursor:pointer;border-radius:4px;color:var(--muted);transition:background .12s"'
      +     ' onmouseover="this.style.background=\'var(--border)\'"'
      +     ' onmouseout="this.style.background=\'none\'">'
      +     chevron
      +   '</button>'
      + '</td>'
      + '<td style="' + TDl + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:0">' + analysisLabel + '</td>'
      + '<td style="' + TDlm + ';vertical-align:middle;overflow:hidden;max-width:0">'
      +   '<div style="display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden">'
      +     '<span style="overflow:hidden;text-overflow:ellipsis;flex-shrink:1;min-width:0">' + (a.campaign_name || '—') + '</span>'
      +     (a.campaign_status && typeof cmStatusChip === 'function' ? cmStatusChip(a.campaign_status) : '')
      +   '</div>'
      + '</td>'
      + '<td style="' + TDlm + '">' + (a.client_name     || '—') + '</td>'
      + '<td style="' + TDlm + '">' + (a.advertiser_name || '—') + '</td>'
      + '<td style="' + TDlc + '"><span id="mp2-pcount-' + aid + '">' + planCount + '</span></td>'
      + '<td style="' + TDlm + '">' + dateStr + '</td>'
      + '<td style="padding:8px 12px;border-bottom:1px solid var(--border);text-align:center" onclick="event.stopPropagation()">' + deleteBtn + '</td>'
      + '</tr>';

    // Sub-rows: siblings in the same table — alignment is automatic via table-layout:fixed
    var subRows = _mp2SubRowsHtml(aid, a.moments_groups, open);

    return mainRow + subRows;
  }).join('');
}

// ── Media Plans table — DB-backed ─────────────────────────────────────────────
var _mp2PlansCache = null; // cache fetched rows; cleared on tab re-enter if needed

function mp2LoadPlansTable() {
  var tbody    = document.getElementById('mp2-plans-tbody');
  var subtitle = document.getElementById('mp2-plans-subtitle');
  if (!tbody) return;

  // Show loading row while we fetch
  tbody.innerHTML = '<tr><td colspan="11" style="padding:32px;text-align:center;font-size:12px;color:var(--faint)">Loading…</td></tr>';
  if (subtitle) subtitle.textContent = 'Loading…';

  var _plansQs = (typeof _appIsSuperOrg === 'function' && !_appIsSuperOrg() && typeof selectedClientOrgId !== 'undefined' && selectedClientOrgId)
    ? '?client_org_id=' + selectedClientOrgId : '';
  fetch('/api/media-plans-summary' + _plansQs)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var plans = data.plans || [];
      _mp2PlansCache = plans;
      if (subtitle) subtitle.textContent = plans.length + ' plan' + (plans.length !== 1 ? 's' : '');
      _mp2RenderPlanRows(plans);
    })
    .catch(function(e) {
      if (subtitle) subtitle.textContent = 'Error';
      tbody.innerHTML = '<tr><td colspan="11" style="padding:32px;text-align:center;font-size:12px;color:#dc2626">Error loading plans: ' + e.message + '</td></tr>';
    });
}

function _mp2RenderPlanRows(plans) {
  var tbody = document.getElementById('mp2-plans-tbody');
  if (!tbody) return;

  if (!plans.length) {
    tbody.innerHTML = '<tr><td colspan="11" style="padding:40px;text-align:center;font-size:12px;color:var(--faint)">No media plans in the database yet.</td></tr>';
    return;
  }

  var TDp  = 'padding:13px 16px;font-size:12px;color:var(--text);border-bottom:1px solid var(--border)';
  var TDpm = 'padding:13px 16px;font-size:12px;color:var(--muted);border-bottom:1px solid var(--border)';
  var TDpn = 'padding:13px 16px;font-size:12px;font-weight:600;color:var(--text);border-bottom:1px solid var(--border);text-align:right';

  tbody.innerHTML = plans.map(function(p, i) {
    var last = i === plans.length - 1;
    var fix  = last ? ';border-bottom:none' : '';
    var planNameCell = p.media_plan_name
      ? '<span style="font-weight:600;color:var(--text)">' + p.media_plan_name + '</span>'
      : '<span style="font-size:11px;color:var(--faint);font-style:italic">—</span>';
    var folderLinkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/><path d="M2 13h10"/><path d="m9 16 3-3-3-3"/></svg>';
    var campCell = p.campaign_name
      ? '<div style="font-size:12px;font-weight:500;color:var(--text)">' + p.campaign_name + '</div>'
      : '<button onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:5px;background:none;border:none;padding:0;cursor:pointer;color:var(--accent);font-size:12px;font-weight:500;font-family:inherit">' + folderLinkIcon + 'Add Campaign</button>';
    var pJson = JSON.stringify(p).replace(/'/g, '&#39;');
    return '<tr style="cursor:pointer" onclick=\'mp2EditPlan(' + pJson + ')\' onmouseover="this.style.background=\'var(--hover)\'" onmouseout="this.style.background=\'\'">'
      + '<td style="' + TDp  + fix + ';background:var(--surface);white-space:nowrap">' + planNameCell + '</td>'
      + '<td style="' + TDp  + fix + '">' + campCell + '</td>'
      + '<td style="' + TDpm + fix + '">' + (p.client_name     || '—') + '</td>'
      + '<td style="' + TDpm + fix + '">' + (p.advertiser_name || '—') + '</td>'
      + '<td style="' + TDpn + fix + '">' + p.moment_count + '</td>'
      + '<td style="' + TDpn + fix + '">' + p.total_impressions  + '</td>'
      + '<td style="' + TDpn + fix + '">' + p.avg_cpm            + '</td>'
      + '<td style="' + TDpn + fix + ';color:#16a34a">' + p.total_dollar_value + '</td>'
      + '<td style="' + TDpm + fix + '">' + p.created_by   + '</td>'
      + '<td style="' + TDpm + fix + '">' + p.last_updated + '</td>'
      + '<td style="padding:8px 12px;border-bottom:1px solid var(--border)' + fix + ';text-align:center;color:var(--faint)" onclick="event.stopPropagation()">'
      +   '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '</td>'
      + '</tr>';
  }).join('');
}

function mp2EditPlan(p) {
  // Build API query: filter by plan_name (+ campaign_id if available)
  var qs = 'plan_name=' + encodeURIComponent(p.media_plan_name || '');
  if (p.campaign_id) qs += '&campaign_id=' + p.campaign_id;

  var planFetch = fetch('/api/media-plans?' + qs).then(function(r) { return r.json(); });
  var campFetch = p.campaign_id
    ? fetch('/api/campaigns?campaign_id=' + p.campaign_id).then(function(r) { return r.json(); })
    : Promise.resolve({ campaigns: [] });
  var crFetch = p.campaign_id
    ? fetch('/api/creatives?campaign_id=' + p.campaign_id).then(function(r) { return r.json(); })
    : Promise.resolve({ creatives: [] });

  Promise.all([planFetch, campFetch, crFetch])
    .then(function(results) {
      var dbRows    = results[0].moments_groups || [];
      var campData  = (results[1].campaigns || [])[0] || null;
      var creatives = results[2].creatives  || [];

      // Convert DB rows into the moments format expected by mp2ShowMediaPlanDetail
      var moments = dbRows.map(function(r) {
        var det = r.moment_details || {};
        // fallback to momentById for any missing fields
        var mock = (typeof momentById === 'function' && momentById(r.moment_id)) || {};
        var impNum = r.est_impressions ? Number(r.est_impressions) / 1000000 : 0;
        return {
          name:             det.moment_name  || mock.moment_name || r.moment_id || '—',
          channels:         det.channels     || mock.channels    || [],
          pods:        det.pods         || mock.pods        || 0,
          impressionsLabel: (typeof fmtMomentImpr === 'function') ? fmtMomentImpr(Number(r.est_impressions)) : '—',
          impressionsNum:   impNum,
          cpm:              r.est_cpm ? parseFloat(r.est_cpm) : 0,
          type:             det.moment_type  || mock.moment_type || '—',
          _dbId:            r.media_plan_id,
          _momentId:        r.moment_id,
        };
      });

      // Build a synthetic savedMediaPlansV2-compatible plan object
      var syntheticPlan = {
        id:          'db-' + (p.media_plan_name || 'plan').replace(/\s+/g, '-').toLowerCase(),
        name:        p.media_plan_name || '—',
        campaign:    campData ? campData.name       : (p.campaign_name   || ''),
        advertiser:  campData ? campData.advertiser  : (p.advertiser_name || ''),
        client:      campData ? campData.client      : (p.client_name     || ''),
        flightStart: campData ? campData.start       : '',
        flightEnd:   campData ? campData.end         : '',
        impressions: p.total_impressions  || '—',
        avgCpm:      p.avg_cpm            || '—',
        dollars:     p.total_dollar_value || '—',
        author:      p.created_by         || '—',
        date:        p.last_updated       || '—',
        moments:     moments,
        programs:    [],
        episodes:    [],
        _fromDB:     true,
        _campaignData: campData,
        _creativesData: creatives,
      };

      // Reuse existing DB slot if already there
      var existingIdx = savedMediaPlansV2.findIndex(function(x) { return x.id === syntheticPlan.id; });
      if (existingIdx >= 0) {
        savedMediaPlansV2[existingIdx] = syntheticPlan;
        mp2ShowMediaPlanDetail(existingIdx);
      } else {
        savedMediaPlansV2.push(syntheticPlan);
        mp2ShowMediaPlanDetail(savedMediaPlansV2.length - 1);
      }
    })
    .catch(function(e) { alert('Error loading plan: ' + e.message); });
}


function mp2SwitchHomeTab(tab, noPush) {
  mp2HomeTab = tab;

  // Reset wizard state FIRST, before any DOM rebuild, so _mp2Step1Html()
  // always renders clean when New Plan tab is shown.
  if (tab === 'new-plan') {
    mp2SelectedCampaign     = null;
    mp2SelectedClientId     = null;
    mp2Step1Campaigns       = null;
    mp2Step1Clients         = null;   // force re-run so non-super orgs get client auto-selected
    mp2LibrarySelected      = null;
    mp2LibrarySelectedItems = [];
    mp2NewPlanStep          = 1;
  }

  var mp2PillTabs = [{id:'new-plan',label:'New Moments Match'},{id:'analyses',label:'Previous Moments Match',dividerBefore:true}];
  var pillsEl = document.getElementById('mp2-pills');
  if (pillsEl) { pillsEl.style.display = ''; pillsEl.innerHTML = UI.tabNav(mp2PillTabs, tab, 'mp2SwitchHomeTab'); }
  // If home panels were replaced by analysis content, re-render home first
  // (variables already cleared above, so _mp2Step1Html renders clean)
  if (!document.getElementById('tx2-home-panel-new-plan')) {
    mp2ShowUpload();
  }
  // If panel already exists but we're switching to new-plan, refresh step 1 in-place
  if (tab === 'new-plan') {
    var s1 = document.getElementById('mp2-step1');
    if (s1) s1.innerHTML = _mp2Step1Html();
    var stepHdr = document.getElementById('mp2-step-hdr');
    if (stepHdr) stepHdr.innerHTML = _mp2StepHdrHtml();
    var stepNav = document.getElementById('mp2-step-nav');
    if (stepNav) stepNav.innerHTML = _mp2StepNavHtml();
    [1,2,3].forEach(function(n) {
      var el = document.getElementById('mp2-step' + n);
      if (el) el.style.display = n === 1 ? '' : 'none';
    });
    mp2LoadStep1Clients();
  }
  var newPlan  = document.getElementById('tx2-home-panel-new-plan');
  var analyses = document.getElementById('tx2-home-panel-analyses');
  if (newPlan)  newPlan.style.display  = tab === 'new-plan'  ? ''     : 'none';
  if (analyses) analyses.style.display = tab === 'analyses'  ? 'flex' : 'none';
  var outerCard = document.getElementById('mp2-outer-card');
  if (outerCard) {
    outerCard.style.padding  = tab === 'new-plan' ? '32px' : '0';
    outerCard.style.height   = '';
    outerCard.style.overflow = 'hidden';
  }
  var ca = document.getElementById('tx2-content-area');
  if (ca) {
    ca.style.height        = '';
    ca.style.display       = '';
    ca.style.flexDirection = '';
    ca.style.overflow      = '';
  }
  // Lazy-load analyses table from DB every time the tab becomes visible
  if (tab === 'analyses') mp2LoadAnalysesTable();
  // Update URL
  if (!noPush) {
    var urlMap = { 'new-plan': '/moments-match/new', 'analyses': '/moments-match/saved' };
    var url = urlMap[tab] || '/moments-match';
    var stateObj = { id: 'media-planner-v2', label: 'Media Planner' };
    if (tab !== 'new-plan') stateObj.mp2Tab = tab;
    history.pushState(stateObj, '', url);
  }
}

var mp2LookbackSecs = 120;

// ── Flight Dates picker state (New Analysis panel) ────────────────────────────
var mp2FlightDates = {
  start: '', end: '',
  viewMonth: new Date().getMonth(),
  viewYear:  new Date().getFullYear()
};

function mp2FlightPillLabel() {
  if (mp2FlightDates.start && mp2FlightDates.end) {
    var fmt = function(s) {
      return new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
    };
    return fmt(mp2FlightDates.start) + ' → ' + fmt(mp2FlightDates.end);
  }
  return 'Select dates';
}

function mp2UpdateFlightPill() {
  var set = mp2FlightDates.start && mp2FlightDates.end;
  var lbl = document.getElementById('mp2-flight-pill-label');
  if (lbl) { lbl.textContent = mp2FlightPillLabel(); lbl.style.color = set ? 'var(--text)' : 'var(--faint)'; }
  var s1lbl = document.getElementById('mp2-s1-flight-lbl');
  if (s1lbl) { s1lbl.textContent = set ? mp2FlightPillLabel() : 'Select flight dates'; s1lbl.style.color = set ? 'var(--text)' : 'var(--faint)'; }
}

function mp2OpenFlightPicker(triggerEl) {
  // Close any existing AI dropdown first
  var existing = document.getElementById('mp2-flight-dd');
  if (existing) { existing.remove(); return; }
  aiCloseDropdown();

  var dd = document.createElement('div');
  dd.id = 'mp2-flight-dd';
  dd.style.cssText = 'position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border-md);border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.14);padding:14px;width:294px;box-sizing:border-box';
  dd.innerHTML = mp2FlightDdContent();
  document.body.appendChild(dd);

  var rect = triggerEl.getBoundingClientRect();
  var vw   = window.innerWidth, vh = window.innerHeight;
  var ddH  = dd.scrollHeight, ddW = 294, GAP = 6;
  var top  = rect.bottom + GAP + ddH <= vh - 8 ? rect.bottom + GAP : rect.top - GAP - ddH;
  var left = Math.min(rect.left, vw - ddW - 8);
  if (left < 8) left = 8;
  dd.style.top  = Math.max(8, top) + 'px';
  dd.style.left = left + 'px';

  var close = function(e) {
    if (!dd.contains(e.target) && e.target !== triggerEl) {
      dd.remove();
      document.removeEventListener('mousedown', close);
    }
  };
  setTimeout(function() { document.addEventListener('mousedown', close); }, 0);
}

function mp2FlightDdContent() {
  var p = mp2FlightDates;
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS   = ['Mo','Tu','We','Th','Fr','Sa','Su'];
  var vm = p.viewMonth, vy = p.viewYear;
  var firstDay    = (new Date(vy, vm, 1).getDay() + 6) % 7;
  var daysInMonth = new Date(vy, vm + 1, 0).getDate();
  var daysInPrev  = new Date(vy, vm, 0).getDate();
  var today = new Date(); today.setHours(0,0,0,0);
  var startD = p.start ? new Date(p.start + 'T00:00:00') : null;
  var endD   = p.end   ? new Date(p.end   + 'T00:00:00') : null;
  function ds(y,m,d){ return y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'); }
  var fmtDL  = function(s){ return new Date(s+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}); };
  var NBTN   = 'background:none;border:none;cursor:pointer;font-size:18px;color:var(--muted);padding:2px 8px;border-radius:5px;line-height:1';
  var html   = '<div style="width:270px">';

  // Status bar
  if (!p.start) {
    html += '<div style="font-size:11px;color:var(--muted);text-align:center;margin-bottom:10px;padding:6px 10px;background:var(--bg);border-radius:6px">Select a start date</div>';
  } else if (!p.end) {
    html += '<div style="font-size:11px;color:#e11d8f;font-weight:500;text-align:center;margin-bottom:10px;padding:6px 10px;background:#fdf2f8;border-radius:6px">'
      + fmtDL(p.start) + ' → now pick end date'
      + '</div>';
  } else {
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:6px 10px;background:#fdf2f8;border-radius:6px">'
      + '<span style="font-size:11px;color:#e11d8f;font-weight:500">' + fmtDL(p.start) + ' – ' + fmtDL(p.end) + '</span>'
      + '<span onclick="event.stopPropagation();mp2FlightDates.start=\'\';mp2FlightDates.end=\'\';mp2UpdateFlightPill();var dd=document.getElementById(\'mp2-flight-dd\');if(dd)dd.innerHTML=mp2FlightDdContent()" style="font-size:11px;color:var(--muted);cursor:pointer;padding:1px 5px;border-radius:4px;border:1px solid var(--border)">Clear</span>'
      + '</div>';
  }

  // Nav header
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
    + '<button style="' + NBTN + '" onclick="event.stopPropagation();mp2FlightCalNav(-1)">‹</button>'
    + '<span style="font-size:13px;font-weight:600;color:var(--text)">' + MONTHS[vm] + ' ' + vy + '</span>'
    + '<button style="' + NBTN + '" onclick="event.stopPropagation();mp2FlightCalNav(1)">›</button>'
    + '</div>';

  // Day headers
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:2px">';
  DAYS.forEach(function(d){ html += '<div style="text-align:center;font-size:10px;font-weight:500;color:var(--faint);padding:3px 0">' + d + '</div>'; });
  html += '</div>';

  // Day grid
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr)">';
  function renderCell(dayNum, dStr, active) {
    if (!active) { html += '<div style="height:34px;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--faint)">' + dayNum + '</div>'; return; }
    var cellD = new Date(dStr + 'T00:00:00');
    var isSt  = p.start === dStr, isEn = p.end === dStr;
    var inRng = startD && endD && cellD > startD && cellD < endD;
    var isTdy = cellD.getTime() === today.getTime();
    var wrapBg   = inRng ? '#fdf2f8' : (isSt && endD) ? 'linear-gradient(to right,transparent 50%,#fdf2f8 50%)' : (isEn && startD) ? 'linear-gradient(to left,transparent 50%,#fdf2f8 50%)' : 'transparent';
    var innerBg  = (isSt || isEn) ? '#e11d8f' : 'transparent';
    var innerCol = (isSt || isEn) ? '#fff' : isTdy ? '#e11d8f' : 'var(--text)';
    var fw       = (isTdy && !isSt && !isEn) ? '700' : '400';
    html += '<div style="background:' + wrapBg + ';padding:2px 0">'
      + '<div onclick="event.stopPropagation();mp2FlightCalPick(\'' + dStr + '\')" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;border-radius:50%;background:' + innerBg + ';color:' + innerCol + ';font-weight:' + fw + ';margin:0 auto">' + dayNum + '</div>'
      + '</div>';
  }
  for (var i = 0; i < firstDay; i++) { renderCell(daysInPrev - firstDay + 1 + i, '', false); }
  for (var d2 = 1; d2 <= daysInMonth; d2++) { renderCell(d2, ds(vy, vm, d2), true); }
  var rem = (firstDay + daysInMonth) % 7;
  if (rem > 0) for (var j = 1; j <= 7 - rem; j++) { renderCell(j, '', false); }
  html += '</div></div>';

  // OK button
  html += '<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px">'
    + '<button onclick="document.getElementById(\'mp2-flight-dd\').remove()" style="width:100%;height:30px;border-radius:7px;border:1px solid var(--border-md);background:var(--surface);color:var(--text);font-size:12px;font-weight:500;cursor:pointer;font-family:inherit">OK</button>'
    + '</div>';
  return html;
}

function mp2FlightCalNav(dir) {
  mp2FlightDates.viewMonth += dir;
  if (mp2FlightDates.viewMonth < 0)  { mp2FlightDates.viewMonth = 11; mp2FlightDates.viewYear--; }
  if (mp2FlightDates.viewMonth > 11) { mp2FlightDates.viewMonth = 0;  mp2FlightDates.viewYear++; }
  var dd = document.getElementById('mp2-flight-dd');
  if (dd) dd.innerHTML = mp2FlightDdContent();
}

function mp2FlightCalPick(dStr) {
  var p = mp2FlightDates;
  if (!p.start || (p.start && p.end)) {
    p.start = dStr; p.end = '';
  } else {
    if      (dStr < p.start)      { p.end = p.start; p.start = dStr; }
    else if (dStr === p.start)     { p.start = ''; p.end = ''; }
    else                           { p.end = dStr; }
  }
  mp2UpdateFlightPill();
  var dd = document.getElementById('mp2-flight-dd');
  if (dd) dd.innerHTML = mp2FlightDdContent();
}

function mp2InjectSliderStyles() {
  if (document.getElementById('mp2-slider-styles')) return;
  var s = document.createElement('style');
  s.id = 'mp2-slider-styles';
  s.textContent =
    '#mp2-lookback-slider{-webkit-appearance:none;appearance:none;outline:none;border:none;width:100%;height:4px;margin:4px 0;cursor:pointer;border-radius:2px}'
    + '#mp2-lookback-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:13px;height:13px;border-radius:50%;background:#ED005E;cursor:pointer;border:none;outline:none;box-shadow:0 0 0 2px rgba(237,0,94,.15)}'
    + '#mp2-lookback-slider::-moz-range-thumb{width:13px;height:13px;border-radius:50%;background:#ED005E;cursor:pointer;border:none;outline:none}'
    + '#mp2-lookback-slider::-moz-range-track{height:4px;background:#e2e8f0;border-radius:2px;border:none}'
    + '#mp2-lookback-slider::-moz-range-progress{height:4px;background:#ED005E;border-radius:2px}';
  document.head.appendChild(s);
}

function mp2SliderFill(val) {
  var el = document.getElementById('mp2-lookback-slider');
  if (!el) return;
  var pct = (val - 30) / (300 - 30) * 100;
  el.style.background = 'linear-gradient(to right,#ED005E 0%,#ED005E ' + pct + '%,#e2e8f0 ' + pct + '%,#e2e8f0 100%)';
}

function mp2UpdateLookback(val) {
  mp2LookbackSecs = parseInt(val);
  mp2AiParams.window.mode = 'set';
  mp2AiParams.window.secs = mp2LookbackSecs;
  var label = document.getElementById('mp2-lookback-label');
  if (label) label.textContent = _mp2FmtWindowSecs(mp2LookbackSecs);
  mp2SliderFill(mp2LookbackSecs);
}

function mp2DeletePlan(idx, e) {
  if (e) e.stopPropagation();
  if (!confirm('Delete "' + savedMediaPlansV2[idx].name + '"?')) return;
  savedMediaPlansV2.splice(idx, 1);
  mp2SwitchHomeTab('analyses');
}

function mp2RefreshDSP(idx, e) {
  if (e) e.stopPropagation();
  var mp = savedMediaPlansV2[idx];
  if (!mp || !mp.dsp) return;
  var btn = e && e.currentTarget;
  if (btn) {
    btn.style.color = 'var(--accent)';
    btn.style.borderColor = 'var(--accent)';
    var svg = btn.querySelector('svg');
    if (svg) { svg.style.transition = 'transform .6s'; svg.style.transform = 'rotate(360deg)'; }
    setTimeout(function() {
      if (svg) { svg.style.transition = 'none'; svg.style.transform = ''; }
      btn.style.color = 'var(--muted)';
      btn.style.borderColor = 'var(--border)';
    }, 650);
  }
}

// ── Media Planner v2: self-contained upload → analyze → results flow ─────────

function _mp2LibraryPanelHtml() {
  var lib = (typeof CS_LIBRARY !== 'undefined') ? CS_LIBRARY : [];

  // ── left: searchable list ──
  var rows = lib.map(function(cr) {
    var sel = mp2LibrarySelected && mp2LibrarySelected.id === cr.id;
    var bg  = sel ? 'var(--subtle)' : 'transparent';
    var brd = sel ? '1px solid var(--accent)' : '1px solid transparent';
    return '<div data-id="' + cr.id + '" data-lbl="' + (cr.name + ' ' + cr.advertiser + ' ' + (cr.campaign||'')).toLowerCase() + '"'
      + ' onclick="mp2SelectLibraryItem(\'' + cr.id + '\')"'
      + ' style="display:flex;align-items:center;gap:8px;padding:6px 8px;cursor:pointer;border-radius:6px;border:' + brd + ';background:' + bg + ';transition:background .1s"'
      + ' onmouseover="if(!this.classList.contains(\'mp2-lib-sel\'))this.style.background=\'var(--hover)\'"'
      + ' onmouseout="if(!this.classList.contains(\'mp2-lib-sel\'))this.style.background=\'transparent\'"'
      + (sel ? ' class="mp2-lib-sel"' : '') + '>'
      + '<img src="' + cr.thumb + '" style="width:36px;height:22px;object-fit:cover;border-radius:3px;flex-shrink:0">'
      + '<div style="min-width:0;flex:1">'
      +   '<div style="font-size:12px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + cr.name + '</div>'
      +   '<div style="font-size:10px;color:var(--muted)">' + cr.advertiser + ' · ' + cr.fileType + '</div>'
      + '</div>'
      + '</div>';
  }).join('');

  var leftCol = '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px">'
    + UI.searchBar('mp2-lib-asset-search', 'Search library…', 'mp2FilterLibraryItems(this.value)')
    + '<div id="mp2-lib-asset-list" style="max-height:150px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:4px">'
    + rows
    + '</div>'
    + '</div>';

  // ── right: selected item detail ──
  var rightCol;
  if (mp2LibrarySelected) {
    var cr  = mp2LibrarySelected;
    var tpls = (cr.templates || []);
    var badgesHtml = tpls.length
      ? tpls.map(function(t) {
          return '<span style="font-size:10px;font-weight:500;background:var(--bg);border:1px solid var(--border-md);border-radius:6px;padding:3px 8px;color:var(--text);white-space:nowrap">' + t + '</span>';
        }).join('')
      : '<span style="font-size:10px;color:var(--faint)">No templates assigned</span>';
    rightCol = '<div style="flex:0 0 170px;display:flex;flex-direction:column;gap:8px;border-left:1px solid var(--border);padding-left:14px">'
      + '<div>'
      +   '<div style="font-size:9px;font-weight:700;letter-spacing:.06em;color:var(--faint);text-transform:uppercase;margin-bottom:2px">Advertiser</div>'
      +   '<div style="font-size:13px;font-weight:600;color:var(--text)">' + cr.advertiser + '</div>'
      + '</div>'
      + '<img src="' + cr.thumb + '" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:6px;border:1px solid var(--border)">'
      + '<div>'
      +   '<div style="font-size:9px;font-weight:700;letter-spacing:.06em;color:var(--faint);text-transform:uppercase;margin-bottom:5px">Templates</div>'
      +   '<div style="display:flex;flex-wrap:wrap;gap:4px">' + badgesHtml + '</div>'
      + '</div>'
      + '</div>';
  } else {
    rightCol = '<div style="flex:0 0 170px;display:flex;align-items:center;justify-content:center;border-left:1px solid var(--border);padding-left:14px">'
      + '<div style="text-align:center;color:var(--faint)">'
      +   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="display:block;margin:0 auto 6px"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>'
      +   '<div style="font-size:11px">Select an asset</div>'
      + '</div>'
      + '</div>';
  }

  return '<div style="display:flex;gap:0">' + leftCol + rightCol + '</div>';
}

function mp2SelectLibraryItem(id) {
  var lib = (typeof CS_LIBRARY !== 'undefined') ? CS_LIBRARY : [];
  mp2LibrarySelected = lib.filter(function(c) { return c.id === id; })[0] || null;
  var area = document.getElementById('tx2-input-area');
  if (area) area.innerHTML = _mp2LibraryPanelHtml();
}

function mp2FilterLibraryItems(q) {
  var term = (q || '').toLowerCase().trim();
  var list = document.getElementById('mp2-lib-asset-list');
  if (!list) return;
  list.querySelectorAll('[data-id]').forEach(function(el) {
    var lbl = el.getAttribute('data-lbl') || '';
    el.style.display = (!term || lbl.indexOf(term) >= 0) ? '' : 'none';
  });
}

function mp2UpdateTabBadges() {
  var libEl  = document.getElementById('tx2-opt-library');
  var briefEl = document.getElementById('tx2-opt-brief');
  var libActive   = libEl   && libEl.classList.contains('tx2-seg--act');
  var briefActive = briefEl && briefEl.classList.contains('tx2-seg--act');

  var libBadge = document.getElementById('mp2-tab-badge-library');
  if (libBadge) {
    var libCount = (mp2LibrarySelectedItems && mp2LibrarySelectedItems.length) || 0;
    libBadge.textContent = libCount;
    libBadge.style.display = libCount > 0 ? 'inline-flex' : 'none';
    libBadge.style.alignItems = 'center';
    libBadge.style.justifyContent = 'center';
    libBadge.style.background = libActive ? 'var(--accent)' : '#5A6578';
  }
  var briefBadge = document.getElementById('mp2-tab-badge-brief');
  if (briefBadge) {
    var liveText = '';
    var ta = document.getElementById('tx2-text-input');
    if (ta) liveText = ta.value;
    var hasText = !!((liveText || _mp2BriefContent || '').trim());
    var liveDoc = '';
    var lbl = document.getElementById('tx2-brief-file-label');
    if (lbl && lbl.textContent !== 'Upload Doc or PDF') liveDoc = lbl.textContent;
    var hasDoc = !!(liveDoc || _mp2DocName);
    var briefCount = (hasText ? 1 : 0) + (hasDoc ? 1 : 0);
    briefBadge.textContent = briefCount;
    briefBadge.style.display = briefCount > 0 ? 'inline-flex' : 'none';
    briefBadge.style.alignItems = 'center';
    briefBadge.style.justifyContent = 'center';
    briefBadge.style.background = briefActive ? 'var(--accent)' : '#5A6578';
  }
}

function mp2SelectInput(type) {
  // Capture brief state before leaving
  var _curTa = document.getElementById('tx2-text-input');
  if (_curTa) _mp2BriefContent = _curTa.value;
  var _curLbl = document.getElementById('tx2-brief-file-label');
  if (_curLbl && _curLbl.textContent !== 'Upload Doc or PDF') _mp2DocName = _curLbl.textContent;

  mp2ClearStep3Error();
  ['video', 'library', 'brief'].forEach(function(t) {
    var el = document.getElementById('tx2-opt-' + t);
    if (el) el.className = 'tx2-seg' + (t === type ? ' tx2-seg--act' : '');
  });
  var area = document.getElementById('tx2-input-area');
  if (!area) return;
  if (type === 'video') {
    mp2TaxInputType = 'video';
    mp2LibrarySelected = null;
    mp2LibrarySelectedItems = [];
    area.innerHTML =
      '<div class="tx2-upload-zone" style="padding:18px 20px" onclick="document.getElementById(\'tx2-file-input-video\').click()">'
      + '<input type="file" id="tx2-file-input-video" style="display:none" accept="video/*,image/*" onchange="if(this.files&&this.files.length)mp2ClearStep3Error()">'
      + '<svg width="20" height="20" viewBox="0 0 32 32" fill="none" style="color:var(--faint)"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
      + '<div style="font-size:12px;font-weight:500;color:var(--text);margin-top:4px">Drop Asset Here</div>'
      + '<div style="font-size:11px;color:var(--faint);margin-top:1px">MP4, MOV, JPG, PNG — up to 2 GB</div>'
      + '<button onclick="event.stopPropagation();document.getElementById(\'tx2-file-input-video\').click()" style="display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 12px;border:1px solid var(--border-md);border-radius:7px;font-size:11px;font-weight:500;color:var(--text);background:var(--surface);cursor:pointer;font-family:inherit;margin-top:8px;transition:border .15s" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--border-md)\'"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Browse</button>'
      + '</div>';
  } else if (type === 'library') {
    mp2TaxInputType = 'library';
    area.innerHTML =
      '<div class="tx2-upload-zone" style="padding:18px 20px" onclick="mp2OpenLibraryModal()">'
      + '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:var(--faint)"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>'
      + '<div style="font-size:12px;font-weight:500;color:var(--text);margin-top:4px">Upload Asset from Library</div>'
      + '<div style="font-size:11px;color:var(--faint);margin-top:1px">Browse and select from your Creative Library</div>'
      + '<button onclick="event.stopPropagation();mp2OpenLibraryModal()" style="display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 12px;border:1px solid var(--border-md);border-radius:7px;font-size:11px;font-weight:500;color:var(--text);background:var(--surface);cursor:pointer;font-family:inherit;margin-top:8px;transition:border .15s" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--border-md)\'"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Browse</button>'
      + '</div>';
  } else {
    mp2TaxInputType = (_mp2DocName && !(_mp2BriefContent && _mp2BriefContent.trim())) ? 'doc' : 'text';
    mp2LibrarySelected = null;
    mp2LibrarySelectedItems = [];
    area.innerHTML = mp2BriefHtml();
  }
  mp2UpdateTabBadges();
}

function mp2BriefHtml() {
  var _restoredText = _mp2BriefContent || '';
  var _restoredDoc  = _mp2DocName || '';
  var _escapedText  = _restoredText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return '<div style="border:1px solid var(--border-md);border-radius:8px;overflow:hidden;background:var(--surface)">'
    + '<div style="position:relative">'
    +   '<textarea id="tx2-text-input"'
    +   ' placeholder="Paste or type your brief here. The AI will analyse topics, sentiments, moments and taxonomy classifications…"'
    +   ' oninput="if(this.value.trim())mp2ClearStep3Error();_mp2BriefContent=this.value;mp2UpdateTabBadges()"'
    +   ' style="width:100%;box-sizing:border-box;min-height:110px;resize:none;border:none;outline:none;padding:10px 36px 10px 12px;font-size:13px;font-family:inherit;color:var(--text);background:transparent;display:block">' + _escapedText + '</textarea>'
    +   '<button type="button" onclick="mp2OpenBriefExpand()" title="Expand" style="position:absolute;top:8px;right:8px;background:none;border:none;cursor:pointer;padding:3px;color:var(--muted);line-height:1;border-radius:4px;transition:color .13s,background .13s" onmouseenter="this.style.color=\'var(--text)\';this.style.background=\'var(--bg)\'" onmouseleave="this.style.color=\'var(--muted)\';this.style.background=\'none\'">'
    +     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>'
    +   '</button>'
    + '</div>'
    + '<div style="height:1px;background:var(--border)"></div>'
    + '<label for="tx2-file-input-doc" id="tx2-brief-upload-label"'
    +   ' style="display:flex;align-items:center;gap:7px;padding:8px 12px;cursor:pointer;color:var(--muted);font-size:12px;transition:background .13s,color .13s;border-radius:0 0 8px 8px"'
    +   ' onmouseenter="this.style.background=\'var(--bg)\';this.style.color=\'var(--text)\'"'
    +   ' onmouseleave="this.style.background=\'\';this.style.color=\'var(--muted)\'">'
    +   '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12M10 22h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    +   '<span id="tx2-brief-file-label">' + (_restoredDoc || 'Upload Doc or PDF') + '</span>'
    + '</label>'
    + '<input type="file" id="tx2-file-input-doc" style="display:none" accept=".pdf,.doc,.docx"'
    +   ' onchange="var n=this.files[0]?this.files[0].name:\'\';document.getElementById(\'tx2-brief-file-label\').textContent=n||\'Upload Doc or PDF\';mp2TaxInputType=n?\'doc\':\'text\';_mp2DocName=n||\'\';if(n)mp2ClearStep3Error();mp2UpdateTabBadges()">'
    + '</div>';
}

function mp2OpenBriefExpand() {
  var ta = document.getElementById('tx2-text-input');
  var currentText = ta ? ta.value : '';
  var fileLabel = (document.getElementById('tx2-brief-file-label') || {}).textContent || 'Upload Doc or PDF';
  var hasFile = fileLabel !== 'Upload Doc or PDF';

  var overlay = document.createElement('div');
  overlay.id = 'mp2-brief-expand-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1200;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box';

  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity .18s ease';

  overlay.innerHTML =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:100%;max-width:780px;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(0,0,0,.22);font-family:inherit;transform:translateY(6px);transition:transform .2s ease;opacity:1">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);flex-shrink:0">'
    +   '<div style="font-size:14px;font-weight:600;color:var(--text)">Campaign Brief</div>'
    +   '<button type="button" onclick="mp2CloseBriefExpand()" style="background:none;border:none;cursor:pointer;padding:4px;color:var(--muted);line-height:1;border-radius:4px" onmouseenter="this.style.color=\'var(--text)\'" onmouseleave="this.style.color=\'var(--muted)\'">'
    +     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
    +   '</button>'
    + '</div>'
    + '<textarea id="mp2-brief-expand-ta" placeholder="Paste or type your brief here. The AI will analyse topics, sentiments, moments and taxonomy classifications…"'
    +   ' style="flex:1;width:100%;box-sizing:border-box;resize:none;border:none;outline:none;padding:16px 20px;font-size:13px;line-height:1.7;font-family:inherit;color:var(--text);background:transparent;min-height:420px">'
    + (currentText ? currentText.replace(/</g,'&lt;') : '')
    + '</textarea>'
    + '<div style="border-top:1px solid var(--border);padding:12px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:12px">'
    +   '<label for="mp2-brief-expand-file" id="mp2-brief-expand-file-label" style="display:inline-flex;align-items:center;gap:7px;cursor:pointer;color:var(--muted);font-size:12px;transition:color .13s" onmouseenter="this.style.color=\'var(--text)\'" onmouseleave="this.style.color=\'var(--muted)\'">'
    +     '<svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12M10 22h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    +     '<span id="mp2-brief-expand-file-name">' + (hasFile ? fileLabel : 'Upload Doc or PDF') + '</span>'
    +   '</label>'
    +   '<input type="file" id="mp2-brief-expand-file" style="display:none" accept=".pdf,.doc,.docx" onchange="mp2BriefExpandFileChange(this)">'
    +   '<button type="button" onclick="mp2CloseBriefExpand()" style="height:32px;padding:0 18px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit">Apply</button>'
    + '</div>'
    + '</div>';

  document.body.appendChild(overlay);
  requestAnimationFrame(function() {
    overlay.style.opacity = '1';
    var inner = overlay.querySelector('div');
    if (inner) inner.style.transform = 'translateY(0)';
  });
  overlay.addEventListener('click', function(e) { if (e.target === overlay) mp2CloseBriefExpand(); });

  var expandTa = document.getElementById('mp2-brief-expand-ta');
  if (expandTa) { expandTa.focus(); expandTa.setSelectionRange(expandTa.value.length, expandTa.value.length); }
}

function mp2BriefExpandFileChange(input) {
  var n = input.files[0] ? input.files[0].name : '';
  var lbl = document.getElementById('mp2-brief-expand-file-name');
  if (lbl) lbl.textContent = n || 'Upload Doc or PDF';
}

function mp2CloseBriefExpand() {
  var expandTa = document.getElementById('mp2-brief-expand-ta');
  var mainTa   = document.getElementById('tx2-text-input');
  if (expandTa && mainTa) {
    mainTa.value = expandTa.value;
    if (mainTa.value.trim()) mp2ClearStep3Error();
  }

  // sync file if one was selected in the modal
  var expandFile = document.getElementById('mp2-brief-expand-file');
  var mainFile   = document.getElementById('tx2-file-input-doc');
  var mainLbl    = document.getElementById('tx2-brief-file-label');
  if (expandFile && expandFile.files && expandFile.files.length && mainFile && mainLbl) {
    var dt = new DataTransfer();
    dt.items.add(expandFile.files[0]);
    mainFile.files = dt.files;
    mainLbl.textContent = expandFile.files[0].name;
    mp2TaxInputType = 'doc';
    mp2ClearStep3Error();
  }

  var overlay = document.getElementById('mp2-brief-expand-overlay');
  if (overlay) overlay.remove();
  mp2UpdateTabBadges();
}

function mp2Analyze() {
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  // ── Validate: at least one asset input must be provided ──────────────────
  var hasAsset = false;
  if (mp2TaxInputType === 'video') {
    var _vf = document.getElementById('tx2-file-input-video');
    hasAsset = !!(_vf && _vf.files && _vf.files.length > 0);
  } else if (mp2TaxInputType === 'library') {
    hasAsset = !!(mp2LibrarySelectedItems && mp2LibrarySelectedItems.length > 0);
  } else if (mp2TaxInputType === 'text') {
    var _ta = document.getElementById('tx2-text-input');
    hasAsset = !!(_ta && _ta.value.trim().length > 0);
  } else if (mp2TaxInputType === 'doc') {
    var _df = document.getElementById('tx2-file-input-doc');
    hasAsset = !!(_df && _df.files && _df.files.length > 0);
  }
  if (!hasAsset) {
    mp2ShowStep3Error('Upload / Link an asset, a brief or a doc to start the analysis');
    return;
  }
  mp2ClearStep3Error();

  // ── Re-run guard: if this campaign already has an analysis, ask first ─────
  if (mp2CampaignMode === 'select' && mp2SelectedCampaign && mp2SelectedCampaign.dbId) {
    var _campId   = parseInt(mp2SelectedCampaign.dbId);
    var _existing = (_mp2AnalysesCache || []).filter(function(a) { return parseInt(a.campaign_id) === _campId; })[0];
    if (_existing) {
      var _existingIds = (_existing.creative_ids || []).map(Number);
      var _currentIds  = (mp2LibrarySelectedItems || []).map(function(c) {
        return c.dbId ? parseInt(c.dbId) : (c.id ? parseInt(String(c.id).replace('dbcr', '')) : null);
      }).filter(Boolean);
      var _newCount = _currentIds.filter(function(id) { return _existingIds.indexOf(id) === -1; }).length;
      _mp2ShowRerunConfirmModal(_newCount, function() { _mp2DoAnalyze(); });
      return;
    }
  }

  _mp2DoAnalyze();
}

function _mp2ShowRerunConfirmModal(newCreativesCount, onConfirm) {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1100;display:flex;align-items:center;justify-content:center';

  var creativeNote = newCreativesCount > 0
    ? '<div style="display:flex;align-items:flex-start;gap:10px;background:#FFF3D0;border:1px solid #E5A100;border-radius:8px;padding:10px 12px;margin-bottom:16px">'
    +   '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;margin-top:1px;color:#E5A100"><path d="M8 2L14.9 14H1.1L8 2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><line x1="8" y1="7" x2="8" y2="10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="12" r=".6" fill="currentColor"/></svg>'
    +   '<span style="font-size:12px;color:#92400E">' + newCreativesCount + ' new creative' + (newCreativesCount !== 1 ? 's' : '') + ' detected since the last analysis.</span>'
    + '</div>'
    : '';

  overlay.innerHTML =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px;width:380px;box-shadow:0 8px 32px rgba(0,0,0,.18);font-family:inherit">'
    + '<div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:6px">Re-run Analysis?</div>'
    + '<div style="font-size:13px;color:var(--muted);margin-bottom:16px">This campaign already has an analysis. Running a new one will replace it and flag any existing Media Plans as outdated.</div>'
    + creativeNote
    + '<div style="display:flex;gap:8px">'
    +   '<button id="mp2-rerun-cancel" style="flex:1;height:38px;border-radius:8px;border:1px solid var(--border-md);background:none;color:var(--muted);font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:border-color .12s,color .12s" onmouseenter="this.style.borderColor=\'var(--text)\';this.style.color=\'var(--text)\'" onmouseleave="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'">Cancel</button>'
    +   '<button id="mp2-rerun-confirm" style="flex:1;height:38px;border-radius:8px;border:none;background:var(--accent);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .12s" onmouseenter="this.style.opacity=\'.88\'" onmouseleave="this.style.opacity=\'1\'">Continue</button>'
    + '</div>'
    + '</div>';

  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);

  overlay.querySelector('#mp2-rerun-cancel').addEventListener('click', function() { overlay.remove(); });
  overlay.querySelector('#mp2-rerun-confirm').addEventListener('click', function() {
    overlay.remove();
    onConfirm();
  });
}

function _mp2DoAnalyze() {
  mp2TaxStep = 'progress';

  // ── DB save chain ─────────────────────────────────────────────────────────
  // Order: (A) create campaign if needed → (B) save analysis → (C) assign analysis_id to campaign
  (function() {
    var isCreateMode   = mp2CampaignMode === 'create';
    var campaignDbId   = (mp2SelectedCampaign && mp2SelectedCampaign.dbId) ? parseInt(mp2SelectedCampaign.dbId) : null;
    var clientOrgId    = mp2SelectedClientId
      ? parseInt(mp2SelectedClientId)
      : (typeof selectedClientOrgId !== 'undefined' && selectedClientOrgId ? parseInt(selectedClientOrgId) : null);
    var advertiserDbId = (mp2SelectedCampaign && mp2SelectedCampaign.advertiserId) ? parseInt(mp2SelectedCampaign.advertiserId) : null;

    // Collect all selected creative IDs as an array
    var creativeIdsArr = (mp2LibrarySelectedItems && mp2LibrarySelectedItems.length)
      ? mp2LibrarySelectedItems.map(function(c) {
          return c.dbId ? parseInt(c.dbId) : (c.id ? parseInt(String(c.id).replace('dbcr', '')) : null);
        }).filter(function(id) { return id && !isNaN(id); })
      : [];

    var _assetType = (mp2TaxInputType === 'library' || mp2TaxInputType === 'video') ? 'creative'
                   : mp2TaxInputType === 'text' ? 'brief'
                   : mp2TaxInputType === 'doc'  ? 'doc'
                   : null;
    var _briefText = (mp2TaxInputType === 'text')
      ? (function() { var ta = document.getElementById('tx2-text-input'); return ta ? ta.value.trim() : ''; })()
      : null;
    var _docName = (mp2TaxInputType === 'doc')
      ? (function() { var fi = document.getElementById('tx2-file-input-doc'); return (fi && fi.files && fi.files[0]) ? fi.files[0].name : null; })()
      : null;

    // Capture to module-level vars so mp2ShowResults() can read them after DOM replacement
    _mp2BriefContent = _briefText || '';
    _mp2DocName      = _docName   || '';

    var _analysisNameInput = document.getElementById('mp2-analysis-name-input');
    var _analysisName = _analysisNameInput ? _analysisNameInput.value.trim() : '';

    _mp2LastAnalysisId = null;
    mp2AnalysisMoments = null; // reset so new analysis uses MOCK_MOMENTS_API live

    // ── Step A: create campaign if in create mode ──────────────────────────
    var stepA;
    if (isCreateMode) {
      var _createClientId = mp2CreateClientId ? parseInt(mp2CreateClientId) : clientOrgId;
      var _createAdvId    = mp2CreateAdvId    ? parseInt(mp2CreateAdvId)    : null;
      var _campName       = window._mp2CreateCampaignName || '';
      stepA = fetch('/api/campaigns-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_name: _campName,
          client_org_id: _createClientId,
          advertiser_id: _createAdvId,
          geo:           mp2CreateGeo || null,
          start_date:    mp2FlightDates.start || null,
          end_date:      mp2FlightDates.end   || null
        })
      })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.campaign_id) {
          advertiserDbId = _createAdvId;
          return parseInt(d.campaign_id);
        }
        return null;
      });
    } else {
      // Select mode: use existing campaign_id (may be null if no campaign selected)
      stepA = Promise.resolve(campaignDbId);
    }

    // ── Step B: save analysis record ───────────────────────────────────────
    stepA.then(function(campaignId) {
      return fetch('/api/moments-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_name:   _analysisName || null,
          campaign_id:     campaignId,
          client_org_id:   clientOrgId,
          advertiser_id:   advertiserDbId,
          creative_ids:    creativeIdsArr.length ? creativeIdsArr : null,
          created_by:      'Bruna M.',
          mediaplan_id:    null,
          lookback_window: Math.round(mp2LookbackSecs / 60),
          asset_type:      _assetType,
          brief:           _briefText,
          doc:             _docName,
          moments:         MOCK_MOMENTS_API  // snapshot saved to DB at creation time
        })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (!data.moments_match_analysis_id) return;
        _mp2LastAnalysisId   = data.moments_match_analysis_id;
        _mp2LastAnalysisName = _analysisName || '';
        _mp2AnalysisFromSaved = false;
        history.replaceState(
          { id: 'media-planner-v2', label: 'Media Planner', mp2View: 'analysis', analysisId: data.moments_match_analysis_id, origin: 'new' },
          '',
          mp2AnalysisUrl(data.moments_match_analysis_id, _analysisName, 'new')
        );
        // ── Step C: assign analysis_id back to the campaign ───────────────
        if (campaignId) {
          fetch('/api/campaigns-update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign_id: campaignId, analysis_id: data.moments_match_analysis_id })
          }).catch(function(e) { console.warn('campaign analysis_id assign error:', e); });
        }
      });
    })
    .catch(function(err) { console.warn('analyze save error:', err); });
  })();
  // ─────────────────────────────────────────────────────────────────────────

  if (mp2TaxInputType === 'text') {
    var ta = document.getElementById('tx2-text-input');
    var raw = ta ? ta.value.trim() : '';
    mp2TaxFileName = raw.length ? (raw.slice(0, 42) + (raw.length > 42 ? '…' : '')) : 'Free text input';
  } else {
    var fi = document.getElementById('tx2-file-input-' + mp2TaxInputType);
    mp2TaxFileName = (fi && fi.files && fi.files[0]) ? fi.files[0].name
      : (mp2TaxInputType === 'video' ? 'video-file.mp4' : 'document.pdf');
  }

  var typeLabel = mp2TaxInputType === 'video' ? 'video file'
               : mp2TaxInputType === 'doc'   ? 'document'
               : 'text input';

  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  // ── Animation: branch on input type ────────────────────────────────────────
  var isTextBrief = (mp2TaxInputType === 'text');
  var isDocBrief  = (mp2TaxInputType === 'doc');
  var isVideo     = (mp2TaxInputType === 'video');

  // For brief animation: split real text into words (first 30)
  var _briefWords = [];
  if (isTextBrief) {
    var _briefRaw = (raw || '');
    _briefWords = _briefRaw.split(/\s+/).filter(Boolean).slice(0, 30);
    if (!_briefWords.length) _briefWords = ['Analyzing','brief','content…'];
  }

  var _docLineWidths = ['55%','100%','93%','88%','100%','76%','100%','84%','60%'];

  var progressSteps = isTextBrief
    ? ['Reading brief…','Extracting keywords…','Identifying moments…','Tagging entities…','Building taxonomy…']
    : isDocBrief
    ? ['Loading document…','Parsing content…','Extracting sections…','Classifying moments…','Building taxonomy…']
    : ['Analyzing metadata…','Detecting scenes & objects…','Classifying moments…','Building taxonomy map…','Matching episodes & shows…'];

  // Build inner frame HTML
  var _frameInner = '';
  if (isTextBrief) {
    var _wordsHtml = _briefWords.map(function(w, i) {
      return '<span id="tx2-w-' + i + '" style="color:rgba(255,255,255,.25);transition:color .2s">'
        + w.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</span>';
    }).join(' ');
    _frameInner =
      '<div style="padding:16px 14px;font-size:11px;line-height:1.8;height:100%;overflow:hidden;font-family:\'SF Mono\',\'Fira Mono\',monospace">' + _wordsHtml + '</div>';
  } else if (isDocBrief) {
    _frameInner = '<div style="padding:14px 16px;height:100%;display:flex;flex-direction:column;gap:7px">'
      + _docLineWidths.map(function(w, i) {
          var isH = i === 0;
          return '<div id="tx2-dl-' + i + '" style="height:' + (isH ? '8' : '5') + 'px;border-radius:2px;background:rgba(255,255,255,' + (isH ? '.18' : '.12') + ');width:' + w + ';transition:background .3s"></div>';
        }).join('')
      + '</div>';
  } else {
    var _frames = [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=360&fit=crop&q=80',
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=640&h=360&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=640&h=360&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=640&h=360&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=640&h=360&fit=crop&q=80',
    ];
    _frameInner = '<img id="tx2-prog-frame" src="' + _frames[0] + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .5s">';
  }

  // Build meta bar (bottom of frame)
  var _metaHtml = isTextBrief
    ? '<span id="tx2-prog-wordcount" style="font-size:10px;color:rgba(255,255,255,.75);font-variant-numeric:tabular-nums;letter-spacing:.5px">Word 1 / ' + _briefWords.length + '</span>'
    : isDocBrief
    ? '<span id="tx2-prog-page" style="font-size:10px;color:rgba(255,255,255,.75);font-variant-numeric:tabular-nums;letter-spacing:.5px">Page 1 / 4</span>'
    + '<span id="tx2-prog-section" style="font-size:10px;color:rgba(255,255,255,.5)">Section 1</span>'
    : '<span id="tx2-prog-timecode" style="font-size:10px;color:rgba(255,255,255,.75);font-variant-numeric:tabular-nums;letter-spacing:.5px">00:00:00</span>'
    + '<span id="tx2-prog-scene" style="font-size:10px;color:rgba(255,255,255,.5)">Scene 1 / 5</span>';

  ca.innerHTML =
    '<div style="max-width:520px;margin:0 auto">'
    + '<div style="margin-bottom:14px">'
    +   '<div style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.6px;color:var(--faint);margin-bottom:3px">Scanning ' + typeLabel + '</div>'
    +   '<div style="font-size:15px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + mp2TaxFileName + '</div>'
    + '</div>'
    + '<div style="position:relative;width:100%;padding-top:56.25%;border-radius:10px;overflow:hidden;background:#111;margin-bottom:14px">'
    +   '<div style="position:absolute;inset:0">' + _frameInner + '</div>'
    +   '<div id="tx2-scan-line" style="position:absolute;left:0;right:0;height:2px;top:0%;background:rgba(237,0,94,.7);box-shadow:0 0 10px 2px rgba(237,0,94,.35);transition:none"></div>'
    +   '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 55%);pointer-events:none">'
    +     '<div style="position:absolute;bottom:10px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between">'
    +       _metaHtml
    +     '</div>'
    +   '</div>'
    + '</div>'
    + '<div style="font-size:12px;color:var(--muted);margin-bottom:10px;min-height:18px" id="tx2-progress-label">' + progressSteps[0] + '</div>'
    + '<div class="tx2-progress-track" style="margin-bottom:7px"><div class="tx2-progress-fill" id="tx2-progress-bar" style="width:0%"></div></div>'
    + '<div style="font-size:11px;color:var(--faint);text-align:right" id="tx2-progress-pct">0%</div>'
    + '</div>';

  var pct = 0; var stepIdx = 0; var scanPct = 0; var frameIdx = 0; var wordCursor = 0;
  var interval = setInterval(function() {
    pct = Math.min(pct + 1.0, 100);
    scanPct = (scanPct + 3) % 100;
    var bar      = document.getElementById('tx2-progress-bar');
    var label    = document.getElementById('tx2-progress-label');
    var pctEl    = document.getElementById('tx2-progress-pct');
    var scanLine = document.getElementById('tx2-scan-line');
    if (bar)  bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = Math.round(pct) + '%';
    if (scanLine) scanLine.style.top = scanPct + '%';

    var newStep = Math.min(Math.floor(pct / 20), progressSteps.length - 1);
    if (newStep !== stepIdx) {
      stepIdx = newStep;
      if (label) label.textContent = progressSteps[stepIdx];
    }

    if (isTextBrief) {
      var newCursor = Math.ceil((pct / 100) * _briefWords.length);
      if (newCursor !== wordCursor) {
        if (wordCursor > 0) {
          var prev = document.getElementById('tx2-w-' + (wordCursor - 1));
          if (prev) prev.style.color = 'rgba(255,255,255,.4)';
        }
        var cur = document.getElementById('tx2-w-' + (newCursor - 1));
        if (cur) cur.style.color = 'rgba(255,255,255,.88)';
        wordCursor = newCursor;
      }
      var wcEl = document.getElementById('tx2-prog-wordcount');
      if (wcEl) wcEl.textContent = 'Word ' + Math.min(wordCursor, _briefWords.length) + ' / ' + _briefWords.length;

    } else if (isDocBrief) {
      var litCount = Math.ceil((pct / 100) * _docLineWidths.length);
      for (var li = 0; li < _docLineWidths.length; li++) {
        var dlEl = document.getElementById('tx2-dl-' + li);
        if (dlEl) dlEl.style.background = li < litCount ? 'rgba(255,255,255,.5)' : (li === 0 ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.12)');
      }
      var pageEl = document.getElementById('tx2-prog-page');
      var secEl  = document.getElementById('tx2-prog-section');
      if (pageEl) pageEl.textContent = 'Page ' + Math.min(Math.ceil(pct / 25), 4) + ' / 4';
      if (secEl)  secEl.textContent  = 'Section ' + Math.min(Math.ceil(pct / 16), 6);

    } else {
      var timecode = document.getElementById('tx2-prog-timecode');
      var sceneLbl = document.getElementById('tx2-prog-scene');
      var frameEl  = document.getElementById('tx2-prog-frame');
      var totalSec = Math.round((pct / 100) * 2655);
      var hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
      var mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
      var ss = String(totalSec % 60).padStart(2, '0');
      if (timecode) timecode.textContent = hh + ':' + mm + ':' + ss;
      if (newStep !== stepIdx - 1) { // already updated stepIdx above
        var newFrameIdx = Math.min(stepIdx, _frames ? _frames.length - 1 : 0);
        if (frameEl && newFrameIdx !== frameIdx) {
          frameIdx = newFrameIdx;
          frameEl.style.opacity = '0';
          setTimeout(function() { if (frameEl) { frameEl.src = _frames[frameIdx]; frameEl.style.opacity = '1'; } }, 250);
        }
        if (sceneLbl) sceneLbl.textContent = 'Scene ' + (stepIdx + 1) + ' / 5';
      }
    }

    if (pct >= 100) {
      clearInterval(interval);
      if (scanLine) scanLine.style.display = 'none';
      setTimeout(mp2ShowResults, 600);
    }
  }, 40);
}

function mp2ShowResults(analysisId) {
  mp2TaxStep = 'results';
  _mp2CurrentAnalysisPlans = []; // reset saved plans for this analysis
  _mp2DistributePlanIdx    = null; // reset distribution selection
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  // Hide tab nav while analysis results are open
  var pills = document.getElementById('mp2-pills');
  if (pills) pills.style.display = 'none';

  // ── When loading from Previous Analysis, fetch all data from APIs first ──
  if (analysisId) {
    _mp2LastAnalysisId = analysisId;
    ca.innerHTML = '<div style="padding:60px;text-align:center;color:var(--faint);font-size:12px">Loading analysis…</div>';
    fetch('/api/moments-match?moments_match_analysis_id=' + analysisId)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var rec = (data.analyses || [])[0];
        if (!rec) throw new Error('Analysis not found');
        _mp2LastAnalysisName = rec.moments_match_analysis_name || '';
        // Restore moments snapshot from DB (avoids re-calling API on every load)
        mp2AnalysisMoments = (rec.moments && Array.isArray(rec.moments) && rec.moments.length) ? rec.moments : null;
        // Restore saved media plans for this analysis from DB
        if (rec.moments_groups && Array.isArray(rec.moments_groups) && rec.moments_groups.length) {
          _mp2CurrentAnalysisPlans = rec.moments_groups.map(function(p) {
            var moms = (p.moments || []).map(function(m) {
              var impM = m.moment_est_impr >= 1000000
                ? (m.moment_est_impr / 1000000).toFixed(1) + 'M'
                : m.moment_est_impr ? Math.round(m.moment_est_impr / 1000) + 'K' : '';
              return { moment: m.moment_name, channels: m.moment_channels || [], impressions: impM, cpm: m.moment_est_cpm ? ('$' + m.moment_est_cpm) : '', type: 'ads' };
            });
            var totalImpr = (p.moments || []).reduce(function(s, m) { return s + (Number(m.moment_est_impr) || 0); }, 0);
            var fmtImpr = totalImpr >= 1000000 ? (totalImpr / 1000000).toFixed(1) + 'M' : totalImpr ? Math.round(totalImpr / 1000) + 'K' : '';
            return {
              id:          p.media_plan_id,
              name:        p.media_plan_name || '(Untitled)',
              date:        '—',
              source:      'ai',
              moments:     moms,
              impressions: fmtImpr,
              programs:    [],
              episodes:    [],
              _dbRaw:      p  // keep original DB object for delete/patch
            };
          });
        }
        // Set asset type / content from DB record
        mp2TaxInputType  = rec.asset_type === 'brief' ? 'text' : rec.asset_type === 'doc' ? 'doc' : 'video';
        _mp2BriefContent = rec.brief || '';
        _mp2DocName      = rec.doc   || '';
        mp2TaxFileName   = rec.doc || rec.brief || (rec.moments_match_analysis_name || ('Analysis #' + analysisId));
        // Fetch campaign + creatives in parallel
        var campFetch = rec.campaign_id
          ? fetch('/api/campaigns?campaign_id=' + rec.campaign_id).then(function(r) { return r.json(); })
          : Promise.resolve({ campaigns: [] });
        var crFetch = rec.campaign_id
          ? fetch('/api/creatives?campaign_id=' + rec.campaign_id).then(function(r) { return r.json(); })
          : Promise.resolve({ creatives: [] });
        return Promise.all([campFetch, crFetch]).then(function(results) {
          var camp = (results[0].campaigns || [])[0] || null;
          var crs  = results[1].creatives  || [];
          if (camp) {
            mp2SelectedCampaign = {
              name: camp.name, advertiser: camp.advertiser,
              advertiserId: camp.advertiserId, dbId: camp.dbId,
              budget: camp.budget, impression_goal: camp.goal,
              client: camp.client || '',
              status: camp.status || '',
            };
            mp2FlightDates   = { start: camp.start || '', end: camp.end || '' };
            _mp2GeoSelected  = new Set(camp.geography || []);
          } else {
            mp2SelectedCampaign = null;
            mp2FlightDates      = { start: '', end: '' };
            _mp2GeoSelected     = new Set();
          }
          mp2LibrarySelectedItems = crs.map(function(c) {
            return { id: c.id, dbId: c.dbId, name: c.name,
                     thumb: c.thumb || '', fileType: c.fileType || '',
                     templates: c.templates || [],
                     campaign: c.campaign || '', advertiser: c.advertiser || '' };
          });
          _mp2DoRender();
        });
      })
      .catch(function(err) {
        ca.innerHTML = '<div style="padding:60px;text-align:center;color:#dc2626;font-size:12px">Error loading analysis: ' + err.message + '</div>';
      });
    return; // render happens async inside the fetch chain
  }

  _mp2DoRender();
}

function _mp2DoRender() {
  var ca = document.getElementById('tx2-content-area');
  if (!ca) return;

  var _origin = _mp2AnalysisFromSaved ? 'saved' : 'new';
  var analysisUrl = mp2AnalysisUrl(_mp2LastAnalysisId, _mp2LastAnalysisName, _origin);
  history.replaceState({ id: 'media-planner-v2', label: 'Media Planner', mp2View: 'analysis', analysisId: _mp2LastAnalysisId, origin: _origin }, '', analysisUrl);

  var TH = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border)';
  var fileIcon = mp2TaxInputType === 'video'
    ? '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M22 13l8-5v16l-8-5V13z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
    : mp2TaxInputType === 'doc'
    ? '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    : '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><path d="M4 8h24M4 14h18M4 20h24M4 26h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  var pgname = document.getElementById('content-bc');
  if (pgname) pgname.innerHTML =
    '<span style="font-weight:400;opacity:.55;cursor:pointer" onclick="mp2SwitchHomeTab(mp2HomeTab)">Moments Match</span>'
    + ' &nbsp;/&nbsp; '
    + (_mp2LastAnalysisName ? _mp2LastAnalysisName : 'Analysis');

  var typeLabel = mp2TaxInputType === 'video' ? 'Video' : mp2TaxInputType === 'doc' ? 'Document' : 'Text';

  var outerCard = document.getElementById('mp2-outer-card');
  if (outerCard) outerCard.style.padding = '0';

  var campName   = (mp2SelectedCampaign && mp2SelectedCampaign.name)
    ? mp2SelectedCampaign.name
    : '—';
  var advName    = (mp2SelectedCampaign && mp2SelectedCampaign.advertiser)
    ? mp2SelectedCampaign.advertiser
    : '—';
  var clientName = (mp2SelectedCampaign && mp2SelectedCampaign.client)
    ? mp2SelectedCampaign.client
    : '—';

  // ── helpers ──
  function infoField(label, value) {
    return '<div style="display:flex;align-items:baseline;gap:8px;min-width:0">'
      + '<span style="font-size:10px;font-weight:600;color:var(--faint);white-space:nowrap;flex-shrink:0">' + label + '</span>'
      + '<span style="font-size:12px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + value + '</span>'
      + '</div>';
  }
  function chipList(items) {
    if (!items || !items.length) return '<span style="font-size:12px;color:var(--faint)">—</span>';
    return items.map(function(v) {
      return '<span style="display:inline-flex;align-items:center;font-size:10px;font-weight:500;color:var(--text);padding:2px 8px;border:1px solid var(--border);border-radius:999px;background:var(--bg);white-space:nowrap">' + v + '</span>';
    }).join('');
  }
  function sectionLabel(text) {
    return '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--faint);margin-bottom:10px">' + text + '</div>';
  }

  var fdLabel = (function() {
    if (!mp2FlightDates || !mp2FlightDates.start || !mp2FlightDates.end) return '—';
    function fmtDateStr(s) {
      // If it looks like an ISO date (YYYY-MM-DD), parse and format
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        var d = new Date(s + 'T00:00:00');
        return isNaN(d.getTime()) ? s : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      // Otherwise use as-is (already formatted, e.g. "1 Jan 2025")
      return s;
    }
    return fmtDateStr(mp2FlightDates.start) + ' → ' + fmtDateStr(mp2FlightDates.end);
  })();

  var geoLabel = !mp2SelectedCampaign
    ? '—'
    : _mp2GeoSelected.size > 0
      ? _mp2GeoSelected.size + ' region' + (_mp2GeoSelected.size > 1 ? 's' : '')
      : 'All regions';

  var SEP2 = '<span style="color:var(--border-md);margin:0 8px">·</span>';

  var assetSectionHtml = (function() {
    if (mp2TaxInputType === 'text') {
      var briefText = _mp2BriefContent || mp2TaxFileName || '';
      return briefText
        ? '<div style="font-size:11px;color:var(--text);line-height:1.6;font-style:italic;max-height:80px;overflow:hidden">"' + briefText.slice(0, 200) + (briefText.length > 200 ? '…' : '') + '"</div>'
        : '<span style="font-size:11px;color:var(--faint)">—</span>';
    }
    if (mp2TaxInputType === 'doc') {
      var docName = _mp2DocName || mp2TaxFileName || '—';
      return '<div style="display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--text)">'
        + '<svg width="12" height="12" viewBox="0 0 32 32" fill="none"><path d="M6 4h14l6 6v18a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.8"/><path d="M20 4v6h6M10 14h12M10 18h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
        + '<span>' + docName + '</span></div>';
    }
    if (mp2LibrarySelectedItems && mp2LibrarySelectedItems.length) {
      return '<div style="display:flex;gap:8px;flex-wrap:wrap">' + _mp2CreativeTilesHtml(mp2LibrarySelectedItems) + '</div>';
    }
    return '<span style="font-size:11px;color:var(--faint)">—</span>';
  })();

  var cardHeader =
    // ── Compact header row ──
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 20px;border-bottom:1px solid var(--border)">'
    + '<div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1">'
    +   '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:0;min-width:0">'
    +     '<span style="font-size:12px;font-weight:600;color:var(--text)">' + (mp2SelectedCampaign ? campName + ' — Campaign Details' : 'Campaign Details') + '</span>'
    +     (!mp2SelectedCampaign ? '<span style="margin-left:8px;display:inline-flex;align-items:center;font-size:10px;font-weight:600;padding:3px 8px;border-radius:5px;white-space:nowrap;color:var(--muted);background:var(--subtle)">No campaign selected for this analysis</span>' : '')
    +     (mp2SelectedCampaign && mp2SelectedCampaign.status
          ? '<span style="margin-left:8px">' + (typeof cmStatusChip === 'function' ? cmStatusChip(mp2SelectedCampaign.status) : '') + '</span>'
          : '')
    +     (mp2SelectedCampaign
          ? SEP2 + '<span style="font-size:12px;color:var(--faint)">' + clientName + '</span>'
            + SEP2 + '<span style="font-size:12px;color:var(--faint)">' + advName + '</span>'
            + SEP2 + '<span style="font-size:12px;color:var(--faint)">' + fdLabel + '</span>'
          : '')
    +   '</div>'
    + '</div>'
    + '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0;margin-left:16px">'

    // Expand/collapse toggle
    + '<button id="mp2-analysis-details-toggle" onclick="mp2ToggleAnalysisDetails()" '
    +   'style="width:26px;height:26px;border:1px solid var(--border-md);border-radius:6px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:15px;font-weight:300;line-height:1;font-family:inherit;transition:border-color .12s,color .12s;flex-shrink:0" '
    +   'onmouseover="this.style.borderColor=\'var(--text)\';this.style.color=\'var(--text)\'" '
    +   'onmouseout="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'">+</button>'
    + '</div>'
    + '</div>'

    // ── Expandable 3-column panel ──
    + '<div id="mp2-analysis-details-panel" style="border-bottom:1px solid var(--border);display:none">'
    +   '<div style="display:flex;align-items:stretch">'

    +     '<div style="flex:2;padding:12px 20px;min-width:0;overflow:hidden">'
    +     sectionLabel('Asset')
    +     assetSectionHtml
    +     '</div>'

    +     '<div style="width:1px;background:var(--border);flex-shrink:0"></div>'

    +     '<div style="flex:1;padding:12px 20px;min-width:0">'
    +     sectionLabel('Campaign')
    +     '<div style="display:flex;flex-direction:column;gap:8px">'
    +       infoField('Campaign',    campName)
    +       infoField('Advertiser',  advName)
    +       infoField('Geography',   geoLabel)
    +       infoField('Flight Dates',fdLabel)
    +     '</div>'
    +     '</div>'

    +     '<div style="width:1px;background:var(--border);flex-shrink:0"></div>'

    +     '<div style="flex:1;padding:12px 20px;min-width:0">'
    +     sectionLabel('Campaign Details')
    +     '<div style="display:flex;flex-direction:column;gap:8px">'
    +       infoField('Budget',     (mp2SelectedCampaign && mp2SelectedCampaign.budget)          ? '$' + mp2SelectedCampaign.budget : '—')
    +       infoField('Impr. Goal', (mp2SelectedCampaign && mp2SelectedCampaign.impression_goal) ? mp2SelectedCampaign.impression_goal : '—')
    +       infoField('Lookback',   mp2LookbackSecs ? Math.round(mp2LookbackSecs / 60) + ' min' : '—')
    +     '</div>'
    +     '</div>'

    +   '</div>'
    + '</div>';

  var WAND_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>';

  var assetStrip =
    '<div id="mp2-asset-strip" style="display:none;width:220px;flex-shrink:0;border-left:1px solid var(--border);flex-direction:column;overflow:hidden">'

    // ── Build Media Plan zone ──
    + '<div id="mp2-strip-plan" style="display:flex;flex-direction:column;flex:1;overflow:hidden">'
    +   '<div id="mp2-strip-plan-body" style="flex:1;overflow-y:auto;padding:16px 16px 12px">'
    +     '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:12px">Build Moments Group</div>'
    +     '<div style="display:flex;align-items:center;justify-content:center;text-align:center;color:var(--faint);font-size:12px;padding:20px 8px">Click a moment card to add it to your media plan</div>'
    +   '</div>'
    +   '<div style="flex-shrink:0">'
    +     '<div id="mp2-strip-plan-totals" style="display:none;border-top:1px solid var(--border);padding:10px 16px">'
    +     '</div>'
    +     '<div style="border-top:1px solid var(--border);padding:12px 16px;display:flex;flex-direction:column;gap:8px">'
    +       '<div style="position:relative">'
    +         '<input id="mp2-plan-name-input" type="text" placeholder="Media Plan Name" class="ai-input" style="width:100%;box-sizing:border-box;min-height:0;height:34px;padding:0 28px 0 10px;font-size:12px;resize:none;transition:border-color .15s,box-shadow .15s">'
    +         '<button onclick="mp2GeneratePlanName()" title="Generate name with AI" style="position:absolute;right:7px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;color:var(--faint);transition:color .13s" onmouseover="this.style.color=\'var(--text)\'" onmouseout="this.style.color=\'var(--faint)\'">' + WAND_ICON + '</button>'
    +         '<span id="mp2-plan-name-err" style="display:none;position:absolute;bottom:calc(100% + 4px);left:0;font-size:10px;color:#ef4444;background:#fff;border:1px solid #fca5a5;border-radius:5px;padding:3px 8px;white-space:nowrap;z-index:10;pointer-events:none;box-shadow:0 2px 6px rgba(239,68,68,.12)"></span>'
    +       '</div>'
    +       (function(){ var _lk=_mp2IsLocked(); return '<button ' + (_lk ? 'disabled ' : '') + 'onclick="mp2SaveBuilderMediaPlan()" style="width:100%;height:34px;font-size:12px;font-weight:600;font-family:inherit;background:' + (_lk ? 'var(--bg)' : 'var(--accent)') + ';color:' + (_lk ? 'var(--faint)' : '#fff') + ';border:' + (_lk ? '1px solid var(--border)' : 'none') + ';border-radius:8px;cursor:' + (_lk ? 'not-allowed' : 'pointer') + ';opacity:' + (_lk ? '.6' : '1') + ';transition:opacity .13s,background .2s"' + (_lk ? '' : ' onmouseenter="this.style.opacity=\'.88\'" onmouseleave="this.style.opacity=\'1\'"') + '>Save Moments Group</button>'; })()
    +     '</div>'
    +   '</div>'
    + '</div>'

    // ── Saved Media Plans zone ──
    + '<div id="mp2-strip-list" style="display:none;flex-direction:column;flex:1;overflow:hidden">'
    +   '<div style="flex-shrink:0;padding:16px 16px 12px">'
    +     '<div style="font-size:12px;font-weight:600;color:var(--text)">Saved Moments Groups</div>'
    +   '</div>'
    +   '<div style="flex:1;overflow-y:auto;padding:0 16px 16px;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--faint);font-size:12px">No saved media plans yet</div>'
    + '</div>'

    + '</div>';  // closes mp2-asset-strip

  ca.innerHTML = cardHeader

    // ── Nav strip ──
    + '<div style="display:flex;align-items:center;gap:4px;padding:5px 20px;border-bottom:1px solid var(--border)">'
    +   '<button id="tx2-sub-tab-ad-analysis" onclick="mp2SubTab(\'ad-analysis\')" onmouseover="if(!this.dataset.act)this.style.background=\'var(--bg)\'" onmouseout="if(!this.dataset.act)this.style.background=\'transparent\'" style="display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:6px;border:none;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;background:transparent;color:var(--muted);transition:background .13s,color .13s">'
    +     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><polygon points="10 12 15 15 10 18"/></svg>'
    +     'Ad Analysis'
    +   '</button>'
    +   '<span style="width:1px;align-self:stretch;background:var(--border);margin:-5px 4px;flex-shrink:0"></span>'
    +   '<button id="tx2-sub-tab-ai-media-plan" onclick="mp2SubTab(\'ai-media-plan\')" onmouseover="if(!this.dataset.act)this.style.background=\'var(--bg)\'" onmouseout="if(!this.dataset.act)this.style.background=\'transparent\'" style="display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:6px;border:none;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;background:transparent;color:var(--muted);transition:background .13s,color .13s">'
    +     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>'
    +     'AI Media Plans'
    +   '</button>'
    +   '<button id="tx2-sub-tab-moments" onclick="mp2SubTab(\'moments\')" onmouseover="if(!this.dataset.act)this.style.background=\'var(--bg)\'" onmouseout="if(!this.dataset.act)this.style.background=\'transparent\'" style="display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:6px;border:none;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;background:var(--bg);color:var(--text);transition:background .13s,color .13s" data-act="1">'
    +     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'
    +     'Moments Match'
    +   '</button>'
    +   '<button id="tx2-sub-tab-custom-moments" onclick="mp2SubTab(\'custom-moments\')" onmouseover="if(!this.dataset.act)this.style.background=\'var(--bg)\'" onmouseout="if(!this.dataset.act)this.style.background=\'transparent\'" style="display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:6px;border:none;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;background:transparent;color:var(--muted);transition:background .13s,color .13s">'
    +     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5c0-1.1.9-2 2-2h2"/><path d="M17 3h2c1.1 0 2 .9 2 2v2"/><path d="M21 17v2c0 1.1-.9 2-2 2h-2"/><path d="M7 21H5c-1.1 0-2-.9-2-2v-2"/><rect width="7" height="5" x="7" y="7" rx="1"/><rect width="7" height="5" x="10" y="12" rx="1"/></svg>'
    +     'Custom Moments'
    +   '</button>'
    +   '<div id="mp2-nav-right-group" style="display:flex;align-items:center;margin-left:auto;justify-content:flex-start;flex-shrink:0">'
    +     '<span style="width:1px;align-self:stretch;background:var(--border);margin:-5px 6px -5px 0;flex-shrink:0"></span>'
    +     '<button id="mp2-asset-toggle" onclick="mp2ToggleSidebar(\'plan\')" onmouseover="if(!this.dataset.act)this.style.background=\'var(--bg)\'" onmouseout="if(!this.dataset.act)this.style.background=\'transparent\'" style="display:inline-flex;align-items:center;gap:5px;justify-content:center;height:28px;padding:0 8px;border-radius:6px;border:none;cursor:pointer;background:transparent;color:var(--muted);transition:background .13s,color .13s" title="Build Moments Group">'
    +       '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><path d="M7 14v4"/><path d="M5 16h4"/></svg>'
    +       '<span id="mp2-mp-badge" style="font-size:10px;font-weight:700;background:var(--accent);color:#fff;border-radius:10px;padding:0 5px;min-width:14px;text-align:center;display:none"></span>'
    +     '</button>'
    +     '<button id="mp2-list-toggle" onclick="mp2ToggleSidebar(\'list\')" onmouseover="if(!this.dataset.act)this.style.background=\'var(--bg)\'" onmouseout="if(!this.dataset.act)this.style.background=\'transparent\'" style="display:inline-flex;align-items:center;justify-content:center;height:28px;width:28px;border-radius:6px;border:none;cursor:pointer;background:transparent;color:var(--muted);transition:background .13s,color .13s" title="Saved Moments Groups">'
    +       '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V8a2 2 0 0 1 2-2h1l2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M14 10v6l-2-2-2 2v-6"/></svg>'
    +     '</button>'
    +     '<button id="mp2-sidebar-close" onclick="mp2CloseSidebar()" title="Close panel" style="display:none;align-items:center;justify-content:center;height:28px;width:28px;border-radius:6px;border:none;cursor:pointer;background:transparent;color:var(--muted);transition:background .13s,color .13s;margin-left:auto" onmouseover="this.style.background=\'var(--bg)\';this.style.color=\'var(--text)\'" onmouseout="this.style.background=\'transparent\';this.style.color=\'var(--muted)\'">'
    +       '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
    +     '</button>'
    +   '</div>'
    + '</div>'

    // ── Main area: content + sidebar ──
    + '<div style="display:flex;min-height:0;flex:1;overflow:hidden">'
    +   '<div style="flex:1;min-width:0;padding:20px;display:flex;flex-direction:column;gap:16px;overflow-y:auto">'
    +     '<div id="tx2-sub-content-ad-analysis" style="display:none">'
    +       '<table style="width:100%;border-collapse:collapse"><thead><tr>'
    +         '<th style="text-align:left;'  + TH + '">Moment</th>'
    +         '<th style="text-align:right;' + TH + '">Score</th>'
    +         '<th style="text-align:right;' + TH + '">PODs</th>'
    +       '</tr></thead><tbody id="tx-cat-body"></tbody></table>'
    +     '</div>'
    +     '<div id="tx2-sub-content-ai-media-plan" style="display:none;border-radius:10px"></div>'
    +     '<div id="tx2-sub-content-moments" style="display:flex;flex-direction:column"></div>'
    +     '<div id="tx2-sub-content-custom-moments" style="display:none;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;gap:10px">'
    +       '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--faint)"><path d="M3 7V5c0-1.1.9-2 2-2h2"/><path d="M17 3h2c1.1 0 2 .9 2 2v2"/><path d="M21 17v2c0 1.1-.9 2-2 2h-2"/><path d="M7 21H5c-1.1 0-2-.9-2-2v-2"/><rect width="7" height="5" x="7" y="7" rx="1"/><rect width="7" height="5" x="10" y="12" rx="1"/></svg>'
    +       '<div style="font-size:13px;font-weight:600;color:var(--text)">Custom Moments</div>'
    +       '<div style="font-size:12px;color:var(--faint);text-align:center;max-width:280px">Define and manage your own custom moment groups to target specific audience contexts.</div>'
    +     '</div>'
    +   '</div>'
    + assetStrip
    + '</div>';

  if (typeof txInjectStyles === 'function') txInjectStyles();
  txCustomSelections = [];
  mp2SubTab('moments');
  // When landing from Previous Analysis, open the Saved Moments Groups panel by default
  if (_mp2AnalysisFromSaved) {
    setTimeout(function() { mp2OpenSidebarList(); }, 0);
  }
  // Fix sidebar height after DOM settles
  setTimeout(mp2FixSidebarHeight, 50);
}

// ── Analysis layout viewport-lock ─────────────────────────────────────────────
// Pins the outer card + sidebar to the viewport so only the left content scrolls
function mp2FixSidebarHeight() {
  // Only apply in analysis view (when the moments panel exists)
  var isAnalysis = !!document.getElementById('tx2-sub-content-moments');
  if (!isAnalysis) return;

  // Extra height when the Campaign Details accordion is open — so the card
  // grows to accommodate the panel without squishing the content below it.
  var detailsPanel = document.getElementById('mp2-analysis-details-panel');
  var panelH = (detailsPanel && detailsPanel.style.display !== 'none')
    ? (detailsPanel.offsetHeight || 0)
    : 0;

  // 1. Constrain the outer card to the remaining viewport height + any open accordion
  var card = document.getElementById('mp2-outer-card');
  if (card) {
    var cardRect = card.getBoundingClientRect();
    var cardH = Math.max(200, window.innerHeight - cardRect.top) + panelH;
    card.style.height   = cardH + 'px';
    card.style.overflow = 'hidden';
  }

  // 2. Make tx2-content-area propagate height through the flex chain
  var ca = document.getElementById('tx2-content-area');
  if (ca) {
    ca.style.height         = '100%';
    ca.style.display        = 'flex';
    ca.style.flexDirection  = 'column';
    ca.style.overflow       = 'hidden';
  }

  // 3. Constrain the sidebar to whatever space is left below the nav strip
  var strip = document.getElementById('mp2-asset-strip');
  if (strip && strip.style.display !== 'none') {
    var stripRect = strip.getBoundingClientRect();
    strip.style.height = Math.max(120, window.innerHeight - stripRect.top) + 'px';
  }
}
(function() {
  var _mp2ResizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(_mp2ResizeTimer);
    _mp2ResizeTimer = setTimeout(mp2FixSidebarHeight, 60);
  });
})();

function mp2ToggleAnalysisDetails() {
  var panel = document.getElementById('mp2-analysis-details-panel');
  var btn   = document.getElementById('mp2-analysis-details-toggle');
  if (!panel) return;
  var open = panel.style.display !== 'none';
  panel.style.display = open ? 'none' : '';
  if (btn) btn.textContent = open ? '+' : '−';
  // Accordion changes the strip's top position — recalculate
  setTimeout(mp2FixSidebarHeight, 0);
}

function mp2TogglePlanBody() {
  var body = document.getElementById('mp2-plan-body');
  var btn  = document.getElementById('mp2-plan-body-toggle');
  if (!body) return;
  var open = body.style.display !== 'none';
  body.style.display = open ? 'none' : '';
  if (btn) btn.textContent = open ? '+' : '−';
}

function mp2TogglePlanCampStrip() {
  var strip = document.getElementById('mp2-plan-camp-strip');
  var btn   = document.getElementById('mp2-plan-camp-toggle');
  if (!strip) return;
  var open = strip.style.display !== 'none';
  strip.style.display = open ? 'none' : '';
  if (btn) btn.textContent = open ? '+' : '−';
}

var mp2SidebarMode = null; // 'plan' | 'list' | null

function mp2ToggleSidebar(mode) {
  var strip    = document.getElementById('mp2-asset-strip');
  var group    = document.getElementById('mp2-nav-right-group');
  var btnPlan  = document.getElementById('mp2-asset-toggle');
  var btnList  = document.getElementById('mp2-list-toggle');
  var closeBtn = document.getElementById('mp2-sidebar-close');
  var zonePlan = document.getElementById('mp2-strip-plan');
  var zoneList = document.getElementById('mp2-strip-list');
  if (!strip) return;

  var isOpen   = strip.style.display === 'flex';
  var sameMode = mp2SidebarMode === mode;

  // Same icon clicked while open → close
  if (isOpen && sameMode) {
    strip.style.display = 'none';
    mp2SidebarMode = null;
    if (group) group.style.width = 'auto';
    if (closeBtn) closeBtn.style.display = 'none';
  } else {
    // Open or switch zone
    strip.style.display = 'flex';
    mp2SidebarMode = mode;
    if (group) group.style.width = '200px';
    if (closeBtn) closeBtn.style.display = 'inline-flex';
    // Show the correct zone, hide the other
    if (zonePlan) zonePlan.style.display = mode === 'plan' ? 'flex' : 'none';
    if (zoneList) zoneList.style.display = mode === 'list' ? 'flex' : 'none';
    // Always re-render list from current in-memory state (loaded from DB on analysis open)
    if (mode === 'list') mp2RenderStripList();
    // Lock sidebar to viewport
    setTimeout(mp2FixSidebarHeight, 0);
  }

  // Update button active states
  [{ btn: btnPlan, m: 'plan' }, { btn: btnList, m: 'list' }].forEach(function(item) {
    var act = mp2SidebarMode === item.m;
    if (item.btn) {
      item.btn.dataset.act      = act ? '1' : '';
      item.btn.style.background = act ? 'var(--bg)' : 'transparent';
      item.btn.style.color      = act ? 'var(--text)' : 'var(--muted)';
    }
  });
}

// Always opens the list panel (never closes) and re-renders it
function mp2OpenSidebarList(highlightIdx) {
  var strip    = document.getElementById('mp2-asset-strip');
  var group    = document.getElementById('mp2-nav-right-group');
  var closeBtn = document.getElementById('mp2-sidebar-close');
  var zonePlan = document.getElementById('mp2-strip-plan');
  var zoneList = document.getElementById('mp2-strip-list');
  var btnPlan  = document.getElementById('mp2-asset-toggle');
  var btnList  = document.getElementById('mp2-list-toggle');
  if (!strip) return;
  strip.style.display = 'flex';
  mp2SidebarMode = 'list';
  if (group)    group.style.width        = '200px';
  if (closeBtn) closeBtn.style.display   = 'inline-flex';
  if (zonePlan) zonePlan.style.display = 'none';
  if (zoneList) zoneList.style.display = 'flex';
  mp2RenderStripList(highlightIdx);
  setTimeout(mp2FixSidebarHeight, 0);
  // Update button active states
  [{ btn: btnPlan, m: 'plan' }, { btn: btnList, m: 'list' }].forEach(function(item) {
    var act = item.m === 'list';
    if (item.btn) {
      item.btn.dataset.act      = act ? '1' : '';
      item.btn.style.background = act ? 'var(--bg)' : 'transparent';
      item.btn.style.color      = act ? 'var(--text)' : 'var(--muted)';
    }
  });
}

function mp2CloseSidebar() {
  var strip    = document.getElementById('mp2-asset-strip');
  var group    = document.getElementById('mp2-nav-right-group');
  var closeBtn = document.getElementById('mp2-sidebar-close');
  if (strip)    strip.style.display = 'none';
  if (group)    group.style.width   = 'auto';
  if (closeBtn) closeBtn.style.display = 'none';
  mp2SidebarMode = null;
  ['mp2-asset-toggle','mp2-list-toggle'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) { btn.dataset.act = ''; btn.style.background = 'transparent'; btn.style.color = 'var(--muted)'; }
  });
}

// Kept for backward compat (auto-open from mp2ToggleMomentCard)
function mp2ToggleAssetStrip() {
  var strip = document.getElementById('mp2-asset-strip');
  if (strip && strip.style.display !== 'flex') mp2ToggleSidebar('plan');
  else mp2ToggleSidebar('plan');
}

function mp2SubTab(tab) {
  ['ad-analysis', 'ai-media-plan', 'moments', 'custom-moments'].forEach(function(t) {
    var btn = document.getElementById('tx2-sub-tab-' + t);
    var pnl = document.getElementById('tx2-sub-content-' + t);
    if (btn) {
      var isAct = t === tab;
      btn.dataset.act      = isAct ? '1' : '';
      btn.style.background = isAct ? 'var(--bg)'   : 'transparent';
      btn.style.color      = isAct ? 'var(--text)'  : 'var(--muted)';
    }
    if (pnl) pnl.style.display = t === tab ? 'flex' : 'none';
  });
  if (tab === 'ad-analysis')   {
    txRenderAdAnalysis();
    // Fix height so inner flex panels fill the viewport instead of overflowing freely
    setTimeout(function() {
      var adPnl = document.getElementById('tx2-sub-content-ad-analysis');
      if (adPnl) {
        var rect = adPnl.getBoundingClientRect();
        adPnl.style.height = Math.max(300, window.innerHeight - rect.top - 20) + 'px';
        adPnl.style.minHeight = '0';
        adPnl.style.overflow  = 'hidden';
      }
    }, 0);
  }
  if (tab === 'moments')       { txCustomSelections = []; mp2RenderMoments(); }
  if (tab === 'ai-media-plan') {
    var aiPanel = document.getElementById('tx2-sub-content-ai-media-plan');
    if (aiPanel) {
      aiPanel.style.display = 'flex';
      aiPanel.style.flexDirection = 'column';
      if (!aiPanel.firstChild) {
        // Always initialise from the mock API (replaces any stale hardcoded data)
        aiInitPlanVariantsFromAPI();
        aiRenderResultsPanel();
      }
      setTimeout(function() {
        var rect = aiPanel.getBoundingClientRect();
        aiPanel.style.height    = Math.max(300, window.innerHeight - rect.top - 20) + 'px';
        aiPanel.style.minHeight = '0';
        aiPanel.style.overflow  = 'hidden';
      }, 0);
    }
  }
}

// ── Inventory Explorer v2: matched programs data + helpers ────────────────────

var INV_PROGRAMS_V2 = [
  { id:1, title:'Parks and Recreation — Ep. 4x12',   channel:'NBC', category:'Comedy',          daypart:'Prime Time',  match:96, scenes:['Scene 3 (00:14 – 1:02)','Scene 7 (04:38 – 5:10)'],  impressionsLabel:'3.2M', impressionsNum:3.2,
    moments:[{label:'Community Spirit',score:94},{label:'Joy & Laughter',score:88},{label:'Outdoor Life',score:82},{label:'Friendship',score:78},{label:'Celebration',score:74},{label:'Teamwork',score:71},{label:'Humor',score:68},{label:'Nostalgia',score:63},{label:'Public Service',score:59},{label:'Local Pride',score:54}] },
  { id:2, title:'MasterChef US — Ep. 6x08',          channel:'Fox', category:'Reality',          daypart:'Prime Time',  match:91, scenes:['Scene 5 (02:20 – 3:45)'],                            impressionsLabel:'4.8M', impressionsNum:4.8,
    moments:[{label:'Food & Cooking',score:97},{label:'Competition',score:91},{label:'Achievement',score:85},{label:'Tension',score:82},{label:'Skill & Craft',score:79},{label:'Ambition',score:74},{label:'Passion',score:70},{label:'Precision',score:66},{label:'Leadership',score:61}] },
  { id:3, title:'The Good Place — Ep. 2x06',         channel:'NBC', category:'Comedy',          daypart:'Early Fringe', match:88, scenes:['Scene 2 (00:30 – 1:18)','Scene 9 (18:44 – 19:20)'], impressionsLabel:'2.9M', impressionsNum:2.9,
    moments:[{label:'Warmth',score:90},{label:'Comedy',score:87},{label:'Friendship',score:84},{label:'Philosophy',score:77},{label:'Redemption',score:72},{label:'Surprise',score:68},{label:'Ethics',score:63},{label:'Growth',score:58}] },
  { id:4, title:"America's Got Talent — S17 Finale", channel:'NBC', category:'Reality',          daypart:'Prime Time',  match:84, scenes:['Scene 11 (38:05 – 39:30)'],                         impressionsLabel:'7.1M', impressionsNum:7.1,
    moments:[{label:'Inspiration',score:92},{label:'Emotion',score:89},{label:'Entertainment',score:85},{label:'Achievement',score:81},{label:'Surprise',score:77},{label:'Family',score:74},{label:'Drama',score:70},{label:'Hope',score:66},{label:'Talent',score:62},{label:'Celebration',score:58}] },
  { id:5, title:'Modern Family — Ep. 5x09',          channel:'ABC', category:'Comedy',          daypart:'Daytime',     match:81, scenes:['Scene 4 (07:12 – 8:00)'],                            impressionsLabel:'5.3M', impressionsNum:5.3,
    moments:[{label:'Family',score:94},{label:'Comedy',score:88},{label:'Everyday Life',score:83},{label:'Warmth',score:78},{label:'Parenting',score:74},{label:'Humor',score:70},{label:'Relationships',score:65},{label:'Home Life',score:60}] },
  { id:6, title:'The Tonight Show — Ep. 312',        channel:'NBC', category:'Entertainment',   daypart:'Late Night',  match:77, scenes:['Scene 1 (00:00 – 1:30)'],                            impressionsLabel:'3.6M', impressionsNum:3.6,
    moments:[{label:'Comedy',score:88},{label:'Live Entertainment',score:83},{label:'Pop Culture',score:78},{label:'Celebrity',score:73},{label:'Music',score:68},{label:'Humor',score:63},{label:'Late Night',score:58}] },
  { id:7,  title:'Ellen DeGeneres Show — Ep. 1847',        channel:'CBS',          category:'Entertainment',   daypart:'Daytime',      match:74, scenes:['Scene 6 (14:22 – 15:05)'],                           impressionsLabel:'2.8M', impressionsNum:2.8,
    moments:[{label:'Joy',score:90},{label:'Community',score:84},{label:'Lifestyle',score:79},{label:'Positivity',score:75},{label:'Surprise',score:70},{label:'Generosity',score:65},{label:'Fun',score:60}] },
  { id:8,  title:'Good Morning America — 08 May',          channel:'ABC',          category:'News & Morning',  daypart:'Morning',      match:71, scenes:['Scene 2 (09:15 – 10:00)'],                           impressionsLabel:'4.1M', impressionsNum:4.1,
    moments:[{label:'Morning Routine',score:82},{label:'Lifestyle',score:77},{label:'Positivity',score:73},{label:'News',score:68},{label:'Family',score:64},{label:'Health',score:59},{label:'Community',score:55}] },
  { id:9,  title:'Yellowstone — Ep. 5x08',                 channel:'Paramount',    category:'Drama',           daypart:'Prime Time',   match:68, scenes:['Scene 4 (12:30 – 13:45)','Scene 10 (38:00 – 39:10)'], impressionsLabel:'6.8M', impressionsNum:6.8,
    moments:[{label:'Outdoors & Nature',score:93},{label:'Family',score:86},{label:'Drama',score:81},{label:'Conflict',score:76},{label:'Loyalty',score:72},{label:'Power',score:67},{label:'Landscape',score:62}] },
  { id:10, title:'The Bear — Ep. 2x05',                    channel:'FX',           category:'Drama',           daypart:'Prime Time',   match:65, scenes:['Scene 1 (00:00 – 2:10)'],                            impressionsLabel:'2.4M', impressionsNum:2.4,
    moments:[{label:'Food & Cooking',score:95},{label:'Pressure',score:89},{label:'Skill & Craft',score:84},{label:'Passion',score:80},{label:'Teamwork',score:75},{label:'Ambition',score:69},{label:'Drama',score:63}] },
  { id:11, title:'Succession — Ep. 4x09',                  channel:'HBO',          category:'Drama',           daypart:'Prime Time',   match:63, scenes:['Scene 7 (22:15 – 23:30)'],                           impressionsLabel:'3.9M', impressionsNum:3.9,
    moments:[{label:'Power',score:91},{label:'Family',score:85},{label:'Business',score:80},{label:'Conflict',score:76},{label:'Tension',score:72},{label:'Drama',score:68},{label:'Wealth',score:63}] },
  { id:12, title:'The Marvelous Mrs. Maisel — Ep. 5x03',   channel:'Prime Video',  category:'Comedy',          daypart:'Prime Time',   match:61, scenes:['Scene 3 (08:40 – 9:55)'],                            impressionsLabel:'2.1M', impressionsNum:2.1,
    moments:[{label:'Humor',score:92},{label:'Empowerment',score:86},{label:'1950s Nostalgia',score:81},{label:'Comedy',score:77},{label:'Fashion',score:73},{label:'Female Lead',score:68},{label:'Music',score:63}] },
  { id:13, title:'The Voice — S24 Ep. 12',                 channel:'NBC',          category:'Reality',         daypart:'Prime Time',   match:59, scenes:['Scene 9 (31:20 – 32:45)'],                           impressionsLabel:'5.5M', impressionsNum:5.5,
    moments:[{label:'Talent',score:89},{label:'Emotion',score:83},{label:'Music',score:79},{label:'Competition',score:75},{label:'Inspiration',score:71},{label:'Achievement',score:66},{label:'Entertainment',score:60}] },
  { id:14, title:'Jeopardy! — Ep. 4012',                   channel:'ABC',          category:'Game Show',       daypart:'Early Fringe', match:56, scenes:['Scene 5 (14:00 – 15:20)'],                           impressionsLabel:'3.3M', impressionsNum:3.3,
    moments:[{label:'Knowledge',score:88},{label:'Competition',score:82},{label:'Intelligence',score:77},{label:'Fun',score:72},{label:'Tension',score:67},{label:'Pop Culture',score:61}] },
  { id:15, title:'Abbott Elementary — Ep. 3x07',           channel:'ABC',          category:'Comedy',          daypart:'Prime Time',   match:54, scenes:['Scene 2 (04:05 – 5:00)','Scene 8 (20:10 – 20:55)'],  impressionsLabel:'4.2M', impressionsNum:4.2,
    moments:[{label:'Comedy',score:91},{label:'Education',score:85},{label:'Community',score:80},{label:'Workplace',score:75},{label:'Warmth',score:70},{label:'Family',score:65},{label:'Humor',score:60}] },
  { id:16, title:'Top Chef — S21 Ep. 09',                  channel:'Bravo',        category:'Reality',         daypart:'Prime Time',   match:52, scenes:['Scene 6 (18:30 – 19:50)'],                           impressionsLabel:'1.9M', impressionsNum:1.9,
    moments:[{label:'Food & Cooking',score:96},{label:'Competition',score:90},{label:'Creativity',score:84},{label:'Skill & Craft',score:79},{label:'Tension',score:74},{label:'Achievement',score:69},{label:'Passion',score:64}] },
  { id:17, title:'The Daily Show — Ep. 2201',               channel:'Comedy Central',category:'Entertainment',  daypart:'Late Night',   match:50, scenes:['Scene 1 (00:00 – 1:45)'],                            impressionsLabel:'1.7M', impressionsNum:1.7,
    moments:[{label:'Comedy',score:87},{label:'Politics',score:82},{label:'Satire',score:78},{label:'News',score:73},{label:'Pop Culture',score:68},{label:'Humor',score:63}] },
  { id:18, title:'Grey\'s Anatomy — Ep. 20x04',             channel:'ABC',          category:'Drama',           daypart:'Prime Time',   match:48, scenes:['Scene 5 (15:20 – 16:30)'],                           impressionsLabel:'4.7M', impressionsNum:4.7,
    moments:[{label:'Emotion',score:90},{label:'Medical',score:85},{label:'Drama',score:80},{label:'Relationships',score:75},{label:'Hope',score:70},{label:'Tension',score:65},{label:'Human Spirit',score:60}] },
  { id:19, title:'Wheel of Fortune — Ep. 4208',             channel:'CBS',          category:'Game Show',       daypart:'Early Fringe', match:46, scenes:['Scene 3 (07:00 – 8:15)'],                            impressionsLabel:'5.9M', impressionsNum:5.9,
    moments:[{label:'Fun',score:86},{label:'Excitement',score:80},{label:'Winning',score:75},{label:'Entertainment',score:70},{label:'Family',score:65},{label:'Luck',score:60}] },
  { id:20, title:'Saturday Night Live — Ep. 49x14',         channel:'NBC',          category:'Entertainment',   daypart:'Late Night',   match:44, scenes:['Scene 4 (11:30 – 12:45)'],                           impressionsLabel:'3.1M', impressionsNum:3.1,
    moments:[{label:'Comedy',score:93},{label:'Satire',score:87},{label:'Pop Culture',score:82},{label:'Live Entertainment',score:77},{label:'Music',score:72},{label:'Humor',score:67},{label:'Celebrity',score:62}] },
  { id:21, title:'Survivor — S46 Ep. 07',                   channel:'CBS',          category:'Reality',         daypart:'Prime Time',   match:42, scenes:['Scene 8 (26:10 – 27:30)'],                           impressionsLabel:'4.4M', impressionsNum:4.4,
    moments:[{label:'Competition',score:90},{label:'Strategy',score:84},{label:'Outdoor Life',score:79},{label:'Drama',score:75},{label:'Teamwork',score:70},{label:'Tension',score:65},{label:'Resilience',score:60}] },
  { id:22, title:'How I Met Your Father — Ep. 2x10',        channel:'Hulu',         category:'Comedy',          daypart:'Prime Time',   match:40, scenes:['Scene 2 (03:55 – 5:10)'],                            impressionsLabel:'1.5M', impressionsNum:1.5,
    moments:[{label:'Friendship',score:89},{label:'Romance',score:83},{label:'Comedy',score:78},{label:'Urban Lifestyle',score:73},{label:'Nostalgia',score:68},{label:'Relationships',score:63}] },
  { id:23, title:'60 Minutes — Ep. S56E30',                 channel:'CBS',          category:'News & Morning',  daypart:'Prime Time',   match:38, scenes:['Scene 1 (00:00 – 3:00)'],                            impressionsLabel:'6.2M', impressionsNum:6.2,
    moments:[{label:'Journalism',score:88},{label:'Society',score:82},{label:'Investigation',score:77},{label:'Human Interest',score:72},{label:'Drama',score:67},{label:'Emotion',score:62}] },
  { id:24, title:'Dancing with the Stars — S32 Ep. 05',     channel:'ABC',          category:'Reality',         daypart:'Prime Time',   match:36, scenes:['Scene 7 (22:45 – 23:50)'],                           impressionsLabel:'3.8M', impressionsNum:3.8,
    moments:[{label:'Entertainment',score:91},{label:'Dance',score:86},{label:'Celebrity',score:81},{label:'Emotion',score:76},{label:'Competition',score:71},{label:'Style',score:66},{label:'Achievement',score:61}] },
  { id:25, title:'The Price Is Right — Ep. 7314',           channel:'CBS',          category:'Game Show',       daypart:'Daytime',      match:34, scenes:['Scene 4 (10:00 – 11:15)'],                           impressionsLabel:'3.5M', impressionsNum:3.5,
    moments:[{label:'Fun',score:88},{label:'Excitement',score:82},{label:'Consumer Products',score:77},{label:'Winning',score:72},{label:'Entertainment',score:67},{label:'Audience Participation',score:62}] },
  { id:26, title:'Oprah Daily — Ep. 211',                   channel:'OWN',          category:'Entertainment',   daypart:'Daytime',      match:32, scenes:['Scene 3 (06:20 – 7:35)'],                            impressionsLabel:'2.0M', impressionsNum:2.0,
    moments:[{label:'Empowerment',score:92},{label:'Wellness',score:87},{label:'Lifestyle',score:82},{label:'Inspiration',score:77},{label:'Community',score:72},{label:'Positivity',score:67},{label:'Growth',score:62}] },
  { id:27, title:'The Late Late Show — Ep. 3108',           channel:'CBS',          category:'Entertainment',   daypart:'Late Night',   match:30, scenes:['Scene 6 (17:00 – 18:10)'],                           impressionsLabel:'1.4M', impressionsNum:1.4,
    moments:[{label:'Comedy',score:86},{label:'Celebrity',score:80},{label:'Music',score:75},{label:'Entertainment',score:70},{label:'Humor',score:65},{label:'Late Night',score:60}] },
  { id:28, title:'Family Feud — Ep. S26E44',                channel:'ABC',          category:'Game Show',       daypart:'Early Fringe', match:28, scenes:['Scene 5 (13:40 – 14:50)'],                           impressionsLabel:'4.9M', impressionsNum:4.9,
    moments:[{label:'Family',score:90},{label:'Fun',score:84},{label:'Humor',score:79},{label:'Competition',score:74},{label:'Entertainment',score:69},{label:'Pop Culture',score:64},{label:'Winning',score:59}] }
];

var savedMediaPlansV2     = [];
var mp2HomeTab        = 'new-plan';

// ── AI Media Plan params state ────────────────────────────────────────────────
var mp2AiParams = {
  budget:      { noBudget: false, min: 0, max: 1000000, exact: '' },
  impressions: { noEstimate: false, min: 0, max: 10000000, exact: '' },
  daypart:     { mode: 'any', values: [] },
  channels:    { mode: 'any', values: [] },
  type:        { mode: 'any', values: [] },
  programs:    { mode: 'any', exact: '', min: '', max: '' },
  brand:       { mode: 'any', values: [] },
  score:       { mode: 'all', values: [] },
  window:      { mode: 'any', secs: 120 },
  dates:       { start: '', end: '', viewMonth: new Date().getMonth(), viewYear: new Date().getFullYear() }
};

function _mp2FmtWindowSecs(s) {
  var m = Math.floor(s / 60);
  var r = s % 60;
  return m > 0 && r > 0 ? m + ' min ' + r + ' sec' : m > 0 ? m + ' min' : s + ' sec';
}

// ── AI trigger helpers ─────────────────────────────────────────────────────

function aiTriggerText(param) {
  var p = mp2AiParams[param];
  if (param === 'budget') {
    var BDG_MAX = 1000000;
    if (p.noBudget) return 'no budget';
    if (p.exact) return '$' + Number(p.exact).toLocaleString();
    var bMin = p.min, bMax = p.max;
    var hasRange = (bMin > 0 || bMax < BDG_MAX);
    if (!hasRange) return '…';
    if (bMin === bMax) return '$' + Number(bMin).toLocaleString();
    return '$' + Number(bMin).toLocaleString() + '–$' + Number(bMax).toLocaleString();
  }
  if (param === 'impressions') {
    var IMP_MAX = 10000000;
    function fmtImp(n) { return n >= 1000000 ? (n/1000000).toFixed(n%1000000===0?0:1)+'M' : n >= 1000 ? Math.round(n/1000)+'K' : String(n); }
    if (p.noEstimate) return 'no estimate';
    if (p.exact) return fmtImp(Number(p.exact));
    var iMin = p.min, iMax = p.max;
    var hasImpRange = (iMin > 0 || iMax < IMP_MAX);
    if (!hasImpRange) return '…';
    if (iMin === iMax) return fmtImp(iMin);
    return fmtImp(iMin) + '–' + fmtImp(iMax);
  }
  if (!p || p.mode === 'any') return '…';
  if (param === 'programs') {
    if (p.mode === 'exact' && p.exact) return p.exact + (parseInt(p.exact) > 1 ? ' shows' : ' show');
    if (p.mode === 'range' && (p.min || p.max)) return (p.min||'1') + '–' + (p.max||'∞') + ' shows';
  } else if (param === 'daypart') {
    if (p.mode === 'all') return 'All';
    if (p.mode === 'custom' && p.values.length > 0) return p.values.join(', ');
  } else if (param === 'channels') {
    if (p.mode === 'all') return 'All';
    if (p.mode === 'custom' && p.values.length > 0) return p.values.join(', ');
  } else if (param === 'type') {
    if (p.mode === 'all') return 'All';
    if (p.mode === 'custom' && p.values.length > 0) return p.values.join(', ');
  } else if (param === 'brand') {
    if (p.mode === 'all') return 'No Restrictions';
    if (p.mode === 'custom' && p.values.length > 0) return 'no ' + p.values.join(', ');
  } else if (param === 'score') {
    if (p.mode === 'all' || !p.values || p.values.length === 0) return '…';
    return p.values.join(', ');
  } else if (param === 'window') {
    if (p.mode === 'any') return '…';
    return _mp2FmtWindowSecs(p.secs);
  } else if (param === 'dates') {
    if (!p.start) return '…';
    var fmtD = function(s) { return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' }); };
    if (!p.end) return fmtD(p.start);
    return fmtD(p.start) + ' – ' + fmtD(p.end);
  }
  return '…';
}

var AI_PLACEHOLDERS = {
  budget:      'Select Budget',
  impressions: 'Select Number',
  daypart:     'Select Daypart',
  channels:    'Select Channels',
  type:        'Select Type',
  programs:    'Select Shows',
  brand:       'Select Brand Safety',
  score:       'Select Score',
  window:      'Select Window',
  dates:       'Select Dates'
};

function aiTriggerHtml(param) {
  var val  = aiTriggerText(param);
  var set  = val !== '…';
  var label = set ? val : (AI_PLACEHOLDERS[param] || '…');
  return '<span class="ai-trigger' + (set ? ' ai-trigger--set' : '') + '" id="ai-trigger-' + param + '" onclick="aiOpenDropdown(\'' + param + '\',this)">' + label + '</span>';
}

function aiUpdateTrigger(param) {
  var el = document.getElementById('ai-trigger-' + param);
  if (!el) return;
  var val  = aiTriggerText(param);
  var set  = val !== '…';
  el.textContent = set ? val : (AI_PLACEHOLDERS[param] || '…');
  el.className   = 'ai-trigger' + (set ? ' ai-trigger--set' : '');
}

// ── AI dropdown ───────────────────────────────────────────────────────────────

function aiOpenDropdown(param, triggerEl) {
  aiCloseDropdown();
  var dd = document.getElementById('ai-global-dd');
  if (!dd) {
    dd = document.createElement('div');
    dd.id = 'ai-global-dd';
    document.body.appendChild(dd);
  }

  var ddW = param === 'dates' ? 294 : 260;
  dd.style.cssText = 'position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border-md);border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.14);padding:14px;width:' + ddW + 'px;box-sizing:border-box;visibility:hidden;display:block;overflow-y:auto';
  dd.innerHTML = aiDdContent(param);

  var rect = triggerEl.getBoundingClientRect();
  var vw   = window.innerWidth;
  var vh   = window.innerHeight;
  var ddH  = dd.scrollHeight;
  var GAP  = 6;

  // Vertical: prefer below, flip above if not enough room
  var top;
  if (rect.bottom + GAP + ddH <= vh - 8) {
    top = rect.bottom + GAP;
  } else if (rect.top - GAP - ddH >= 8) {
    top = rect.top - GAP - ddH;
  } else {
    // Constrain with max-height
    top = rect.bottom + GAP;
    dd.style.maxHeight = (vh - top - 8) + 'px';
  }

  // Horizontal: align to trigger left, clamp to viewport
  var left = rect.left;
  if (left + ddW > vw - 8) left = vw - ddW - 8;
  if (left < 8) left = 8;

  dd.style.top  = top + 'px';
  dd.style.left = left + 'px';
  dd.style.visibility = 'visible';

  setTimeout(function() { document.addEventListener('click', _aiDdOutside); }, 0);
}

function _aiDdOutside(e) {
  var dd = document.getElementById('ai-global-dd');
  if (dd && dd.style.display !== 'none' && !dd.contains(e.target) && !e.target.closest('.ai-trigger')) {
    aiCloseDropdown();
  }
}

function aiCloseDropdown() {
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.style.display = 'none';
  document.removeEventListener('click', _aiDdOutside);
}

var AI_PARAM_DEFAULTS = {
  budget:      { noBudget: false, min: 0, max: 1000000, exact: '' },
  impressions: { noEstimate: false, min: 0, max: 10000000, exact: '' },
  daypart:     { mode: 'any', values: [] },
  channels:    { mode: 'any', values: [] },
  type:        { mode: 'any', values: [] },
  programs:    { mode: 'any', exact: '', min: '', max: '' },
  brand:       { mode: 'any', values: [] },
  score:       { mode: 'all', values: [] },
  window:      { mode: 'any', secs: 120 },
  dates:       { start: '', end: '' }
};

function aiDdReset(param) {
  var def = AI_PARAM_DEFAULTS[param];
  if (!def) return;
  var fresh = {};
  for (var k in def) { fresh[k] = Array.isArray(def[k]) ? def[k].slice() : def[k]; }
  if (param === 'dates') { fresh.viewMonth = new Date().getMonth(); fresh.viewYear = new Date().getFullYear(); }
  mp2AiParams[param] = fresh;
  if (param === 'window') {
    mp2LookbackSecs = 120;
    var slider = document.getElementById('mp2-lookback-slider');
    var label  = document.getElementById('mp2-lookback-label');
    if (slider) slider.value = 120;
    if (label)  label.textContent = _mp2FmtWindowSecs(120);
    mp2SliderFill(120);
  }
  aiUpdateTrigger(param);
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent(param);
}

function aiDdOkBtn(param) {
  return '<div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px;display:flex;align-items:center;justify-content:space-between;gap:8px">'
    + '<button onclick="aiDdReset(\'' + param + '\')" style="background:none;border:none;padding:2px 0;cursor:pointer;font-size:11px;color:var(--faint);font-family:inherit;transition:color .12s" onmouseenter="this.style.color=\'var(--muted)\'" onmouseleave="this.style.color=\'var(--faint)\'">Reset</button>'
    + '<button onclick="aiCloseDropdown()" style="height:30px;padding:0 16px;border-radius:7px;border:1px solid var(--border-md);background:var(--surface);color:var(--text);font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;transition:background .12s" onmouseenter="this.style.background=\'var(--bg)\'" onmouseleave="this.style.background=\'var(--surface)\'">OK</button>'
    + '</div>';
}

function aiDdContent(param) {
  var p = mp2AiParams[param];

  function modeSeg(opts) {
    return '<div style="display:flex;gap:2px;background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:2px;margin-bottom:10px">'
      + opts.map(function(o) {
          var act = (param === 'daypart' || param === 'channels')
            ? (o.val === 'any' ? p.mode === 'any' : p.mode !== 'any' && p.dir === o.val)
            : p.mode === o.val;
          return '<button class="ai-mode-btn' + (act ? ' ai-mode-btn--act' : '') + '" onclick="aiDdDo(\'' + param + '\',\'' + o.val + '\')">' + o.label + '</button>';
        }).join('')
      + '</div>';
  }

  function checkPills(items) {
    return '<div style="display:flex;flex-wrap:wrap;gap:5px">'
      + items.map(function(v) {
          var chk = p.values.indexOf(v) >= 0;
          return '<label class="ai-check-pill"' + (chk ? ' style="border-color:#e11d8f;color:#e11d8f;background:#fdf2f8"' : '') + '>'
            + '<input type="checkbox" value="' + v + '"' + (chk ? ' checked' : '') + ' onchange="aiDdCheckItem(\'' + param + '\',this)">'
            + '<span>' + v + '</span></label>';
        }).join('')
      + '</div>';
  }

  if (param === 'budget') {
    var BDG_MAX = 1000000;
    var bMin = p.noBudget ? 0 : (p.min || 0);
    var bMax = p.noBudget ? BDG_MAX : (p.max || BDG_MAX);
    var minPct = bMin / BDG_MAX * 100;
    var maxPct = bMax / BDG_MAX * 100;
    var dis = p.noBudget ? 'opacity:.35;pointer-events:none;' : '';
    return '<div style="' + dis + '">'
      // Dual range slider
      + '<div style="position:relative;height:28px;margin-bottom:8px">'
      +   '<div style="position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);height:4px;background:var(--border);border-radius:2px">'
      +     '<div id="ai-bdg-track" style="position:absolute;height:100%;border-radius:2px;background:linear-gradient(90deg,#e11d8f,#f43f5e);left:' + minPct + '%;right:' + (100 - maxPct) + '%"></div>'
      +   '</div>'
      +   '<input type="range" id="ai-bdg-min" class="ai-range" min="0" max="' + BDG_MAX + '" step="10000" value="' + bMin + '" oninput="aiBudgetSlide(\'min\',this.value)">'
      +   '<input type="range" id="ai-bdg-max" class="ai-range" min="0" max="' + BDG_MAX + '" step="10000" value="' + bMax + '" oninput="aiBudgetSlide(\'max\',this.value)">'
      + '</div>'
      // Min / Max labels
      + '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:12px">'
      +   '<span id="ai-bdg-min-lbl">$' + Number(bMin).toLocaleString() + '</span>'
      +   '<span id="ai-bdg-max-lbl">$' + Number(bMax).toLocaleString() + '</span>'
      + '</div>'
      // Exact input
      + '<input type="number" id="ai-bdg-exact" class="ai-input" placeholder="Or enter exact budget…" value="' + (p.exact||'') + '" style="width:100%;box-sizing:border-box" oninput="aiBudgetExact(this.value)">'
      + '</div>'
      // No budget checkbox
      + '<label style="display:flex;align-items:center;gap:7px;margin-top:10px;cursor:pointer;font-size:12px;color:var(--muted);user-select:none">'
      +   '<input type="checkbox"' + (p.noBudget ? ' checked' : '') + ' style="accent-color:#e11d8f;width:13px;height:13px" onchange="mp2AiParams.budget.noBudget=this.checked;aiUpdateTrigger(\'budget\');var dd=document.getElementById(\'ai-global-dd\');if(dd)dd.innerHTML=aiDdContent(\'budget\')">'
      +   "I don't have a budget"
      + '</label>'
      + aiDdOkBtn(param);
  }

  if (param === 'impressions') {
    var IMP_MAX = 10000000;
    function fmtImpLbl(n) { return n >= 1000000 ? (n/1000000).toFixed(n%1000000===0?0:1)+'M' : n >= 1000 ? Math.round(n/1000)+'K' : String(n); }
    var iMin = p.noEstimate ? 0 : (p.min || 0);
    var iMax = p.noEstimate ? IMP_MAX : (p.max || IMP_MAX);
    var iMinPct = iMin / IMP_MAX * 100;
    var iMaxPct = iMax / IMP_MAX * 100;
    var iDis = p.noEstimate ? 'opacity:.35;pointer-events:none;' : '';
    return '<div style="' + iDis + '">'
      + '<div style="position:relative;height:28px;margin-bottom:8px">'
      +   '<div style="position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);height:4px;background:var(--border);border-radius:2px">'
      +     '<div id="ai-imp-track" style="position:absolute;height:100%;border-radius:2px;background:linear-gradient(90deg,#e11d8f,#f43f5e);left:' + iMinPct + '%;right:' + (100 - iMaxPct) + '%"></div>'
      +   '</div>'
      +   '<input type="range" id="ai-imp-min" class="ai-range" min="0" max="' + IMP_MAX + '" step="100000" value="' + iMin + '" oninput="aiImprSlide(\'min\',this.value)">'
      +   '<input type="range" id="ai-imp-max" class="ai-range" min="0" max="' + IMP_MAX + '" step="100000" value="' + iMax + '" oninput="aiImprSlide(\'max\',this.value)">'
      + '</div>'
      + '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:12px">'
      +   '<span id="ai-imp-min-lbl">' + fmtImpLbl(iMin) + '</span>'
      +   '<span id="ai-imp-max-lbl">' + fmtImpLbl(iMax) + '</span>'
      + '</div>'
      + '<input type="number" id="ai-imp-exact" class="ai-input" placeholder="Or enter exact impressions…" value="' + (p.exact||'') + '" style="width:100%;box-sizing:border-box" oninput="aiImprExact(this.value)">'
      + '</div>'
      + '<label style="display:flex;align-items:center;gap:7px;margin-top:10px;cursor:pointer;font-size:12px;color:var(--muted);user-select:none">'
      +   '<input type="checkbox"' + (p.noEstimate ? ' checked' : '') + ' style="accent-color:#e11d8f;width:13px;height:13px" onchange="mp2AiParams.impressions.noEstimate=this.checked;aiUpdateTrigger(\'impressions\');var dd=document.getElementById(\'ai-global-dd\');if(dd)dd.innerHTML=aiDdContent(\'impressions\')">'
      +   'No estimate impressions'
      + '</label>'
      + aiDdOkBtn(param);
  }

  if (param === 'programs') {
    return modeSeg([{val:'any',label:'Any'},{val:'exact',label:'Exact'},{val:'range',label:'Range'}])
      + (p.mode === 'exact'
        ? '<div style="display:flex;align-items:center;gap:6px">'
          + '<input type="number" class="ai-input" placeholder="e.g. 5" value="' + (p.exact||'') + '" style="width:90px" oninput="mp2AiParams.programs.exact=this.value;aiUpdateTrigger(\'programs\')">'
          + '</div>'
        : p.mode === 'range'
        ? '<div style="display:flex;align-items:center;gap:5px">'
          + '<input type="number" class="ai-input" placeholder="Min" value="' + (p.min||'') + '" style="flex:1" oninput="mp2AiParams.programs.min=this.value;aiUpdateTrigger(\'programs\')">'
          + '<span style="color:var(--faint)">—</span>'
          + '<input type="number" class="ai-input" placeholder="Max" value="' + (p.max||'') + '" style="flex:1" oninput="mp2AiParams.programs.max=this.value;aiUpdateTrigger(\'programs\')">'
          + '</div>'
        : '')
      + aiDdOkBtn(param);
  }

  if (param === 'daypart') {
    var dpItems = ['Morning','Daytime','Early Fringe','Prime Time','Late Night'];
    var dpAllChecked = p.mode === 'all';
    var ROW = 'display:flex;align-items:center;gap:9px;padding:5px 2px;cursor:pointer;font-size:13px;color:var(--text);user-select:none;border-radius:5px;';
    return '<div style="display:flex;flex-direction:column">'
      + '<label style="' + ROW + 'font-weight:500;margin-bottom:2px">'
      +   '<input type="checkbox"' + (dpAllChecked ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiDaypartAll()">'
      +   'All'
      + '</label>'
      + '<div style="height:1px;background:var(--border);margin:2px 0 4px"></div>'
      + dpItems.map(function(v) {
          var chk = p.values.indexOf(v) >= 0;
          return '<label style="' + ROW + '">'
            + '<input type="checkbox" value="' + v + '"' + (chk ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiDaypartItem(\'' + v + '\',this.checked)">'
            + v
            + '</label>';
        }).join('')
      + '</div>'
      + aiDdOkBtn(param);
  }

  if (param === 'channels') {
    var chItems = INV_PROGRAMS.map(function(x){ return x.channel; }).filter(function(v,i,a){ return a.indexOf(v)===i; }).sort();
    var chAllChecked = p.mode === 'all';
    var CH_ROW = 'display:flex;align-items:center;gap:9px;padding:5px 2px;cursor:pointer;font-size:13px;color:var(--text);user-select:none;border-radius:5px;';
    return '<div style="display:flex;flex-direction:column">'
      + '<label style="' + CH_ROW + 'font-weight:500;margin-bottom:2px">'
      +   '<input type="checkbox"' + (chAllChecked ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiChannelsAll()">'
      +   'All'
      + '</label>'
      + '<div style="height:1px;background:var(--border);margin:2px 0 4px"></div>'
      + chItems.map(function(v) {
          var chk = p.values.indexOf(v) >= 0;
          return '<label style="' + CH_ROW + '">'
            + '<input type="checkbox" value="' + v + '"' + (chk ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiChannelsItem(\'' + v + '\',this.checked)">'
            + v
            + '</label>';
        }).join('')
      + '</div>'
      + aiDdOkBtn(param);
  }

  if (param === 'type') {
    var tyItems = ['VoD', 'Organic Pause', 'Live'];
    var tyAllChecked = p.mode === 'all';
    var TY_ROW = 'display:flex;align-items:center;gap:9px;padding:5px 2px;cursor:pointer;font-size:13px;color:var(--text);user-select:none;border-radius:5px;';
    return '<div style="display:flex;flex-direction:column">'
      + '<label style="' + TY_ROW + 'font-weight:500;margin-bottom:2px">'
      +   '<input type="checkbox"' + (tyAllChecked ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiTypeAll()">'
      +   'All'
      + '</label>'
      + '<div style="height:1px;background:var(--border);margin:2px 0 4px"></div>'
      + tyItems.map(function(v) {
          var chk = p.values.indexOf(v) >= 0;
          return '<label style="' + TY_ROW + '">'
            + '<input type="checkbox" value="' + v + '"' + (chk ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiTypeItem(\'' + v + '\',this.checked)">'
            + v
            + '</label>';
        }).join('')
      + '</div>'
      + aiDdOkBtn(param);
  }

  if (param === 'brand') {
    var brItems = ['Alcohol','Violence','Gambling','Drugs','Adult Content','Weapons','Political'];
    var brAllChecked = p.mode === 'all';
    var BR_ROW = 'display:flex;align-items:center;gap:9px;padding:5px 2px;cursor:pointer;font-size:13px;color:var(--text);user-select:none;border-radius:5px;';
    return '<div style="display:flex;flex-direction:column">'
      + '<label style="' + BR_ROW + 'font-weight:500;margin-bottom:2px">'
      +   '<input type="checkbox"' + (brAllChecked ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiBrandAll()">'
      +   'No Restrictions'
      + '</label>'
      + '<div style="height:1px;background:var(--border);margin:2px 0 4px"></div>'
      + brItems.map(function(v) {
          var chk = p.values.indexOf(v) >= 0;
          return '<label style="' + BR_ROW + '">'
            + '<input type="checkbox" value="' + v + '"' + (chk ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiBrandItem(\'' + v + '\',this.checked)">'
            + v
            + '</label>';
        }).join('')
      + '</div>'
      + aiDdOkBtn(param);
  }

  if (param === 'score') {
    var scItems = ['High', 'Standard'];
    var scAllChecked = p.mode === 'all' || !p.values || p.values.length === 0;
    var SC_ROW = 'display:flex;align-items:center;gap:9px;padding:5px 2px;cursor:pointer;font-size:13px;color:var(--text);user-select:none;border-radius:5px;';
    return '<div style="display:flex;flex-direction:column">'
      + '<label style="' + SC_ROW + 'font-weight:500;margin-bottom:2px">'
      +   '<input type="checkbox"' + (scAllChecked ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiScoreAll()">'
      +   'All'
      + '</label>'
      + '<div style="height:1px;background:var(--border);margin:2px 0 4px"></div>'
      + scItems.map(function(v) {
          var chk = !scAllChecked && p.values.indexOf(v) >= 0;
          return '<label style="' + SC_ROW + '">'
            + '<input type="checkbox" value="' + v + '"' + (chk ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiScoreItem(\'' + v + '\',this.checked)">'
            + v
            + '</label>';
        }).join('')
      + '</div>'
      + aiDdOkBtn(param);
  }

  if (param === 'window') {
    var wnOpts = [30, 60, 120, 180, 300];
    var WN_ROW = 'display:flex;align-items:center;gap:9px;padding:5px 2px;cursor:pointer;font-size:13px;color:var(--text);user-select:none;border-radius:5px;';
    return '<div style="display:flex;flex-direction:column">'
      + wnOpts.map(function(s) {
          var chk = p.mode === 'set' && p.secs === s;
          return '<label style="' + WN_ROW + '">'
            + '<input type="radio" name="ai-window-radio" value="' + s + '"' + (chk ? ' checked' : '') + ' style="accent-color:#e11d8f;width:14px;height:14px;flex-shrink:0" onchange="aiWindowSelect(' + s + ')">'
            + _mp2FmtWindowSecs(s)
            + '</label>';
        }).join('')
      + '</div>'
      + aiDdOkBtn(param);
  }
  if (param === 'dates') {
    var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var DAYS   = ['Mo','Tu','We','Th','Fr','Sa','Su'];
    var vm = p.viewMonth, vy = p.viewYear;
    var firstDay = (new Date(vy, vm, 1).getDay() + 6) % 7; // 0=Mon
    var daysInMonth = new Date(vy, vm + 1, 0).getDate();
    var daysInPrev  = new Date(vy, vm, 0).getDate();
    var today = new Date(); today.setHours(0,0,0,0);
    var startD = p.start ? new Date(p.start + 'T00:00:00') : null;
    var endD   = p.end   ? new Date(p.end   + 'T00:00:00') : null;
    function ds(y,m,d){ return y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'); }
    var fmtDL = function(s) { return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' }); };
    var NBTN = 'background:none;border:none;cursor:pointer;font-size:18px;color:var(--muted);padding:2px 8px;border-radius:5px;line-height:1;pointer-events:all';
    var html = '<div style="width:270px">';

    // Status bar
    if (!p.start) {
      html += '<div style="font-size:11px;color:var(--muted);text-align:center;margin-bottom:10px;padding:6px 10px;background:var(--bg);border-radius:6px">Select a start date</div>';
    } else if (!p.end) {
      html += '<div style="font-size:11px;color:#e11d8f;font-weight:500;text-align:center;margin-bottom:10px;padding:6px 10px;background:#fdf2f8;border-radius:6px">'
        + fmtDL(p.start) + ' → now pick end date'
        + '</div>';
    } else {
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:6px 10px;background:#fdf2f8;border-radius:6px">'
        + '<span style="font-size:11px;color:#e11d8f;font-weight:500">' + fmtDL(p.start) + ' – ' + fmtDL(p.end) + '</span>'
        + '<span onclick="event.stopPropagation();mp2AiParams.dates.start=\'\';mp2AiParams.dates.end=\'\';aiUpdateTrigger(\'dates\');var dd=document.getElementById(\'ai-global-dd\');if(dd)dd.innerHTML=aiDdContent(\'dates\')" style="font-size:11px;color:var(--muted);cursor:pointer;padding:1px 5px;border-radius:4px;border:1px solid var(--border)">Clear</span>'
        + '</div>';
    }

    // Nav header
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
      +   '<button style="' + NBTN + '" onclick="event.stopPropagation();aiCalNav(-1)">‹</button>'
      +   '<span style="font-size:13px;font-weight:600;color:var(--text)">' + MONTHS[vm] + ' ' + vy + '</span>'
      +   '<button style="' + NBTN + '" onclick="event.stopPropagation();aiCalNav(1)">›</button>'
      + '</div>';

    // Day-of-week headers
    html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:2px">';
    DAYS.forEach(function(d){ html += '<div style="text-align:center;font-size:10px;font-weight:500;color:var(--faint);padding:3px 0">' + d + '</div>'; });
    html += '</div>';

    // Day cells grid — no gap, use wrapper bg for range fill
    html += '<div style="display:grid;grid-template-columns:repeat(7,1fr)">';

    function renderCell(dayNum, dStr, active) {
      if (!active) {
        html += '<div style="height:34px;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--faint)">' + dayNum + '</div>';
        return;
      }
      var cellD  = new Date(dStr + 'T00:00:00');
      var isSt   = p.start === dStr;
      var isEn   = p.end   === dStr;
      var inRng  = startD && endD && cellD > startD && cellD < endD;
      var isTdy  = cellD.getTime() === today.getTime();
      var colInRow = (html.split('grid-template-columns').length - 2) % 7; // rough col tracking

      // Outer wrapper background for range band
      var wrapBg = inRng ? '#fdf2f8'
        : (isSt && endD)  ? 'linear-gradient(to right, transparent 50%, #fdf2f8 50%)'
        : (isEn && startD) ? 'linear-gradient(to left, transparent 50%, #fdf2f8 50%)'
        : 'transparent';

      var innerBg  = (isSt || isEn) ? '#e11d8f' : 'transparent';
      var innerCol = (isSt || isEn) ? '#fff' : isTdy ? '#e11d8f' : 'var(--text)';
      var fw       = (isTdy && !isSt && !isEn) ? '700' : '400';

      html += '<div style="background:' + wrapBg + ';padding:2px 0">'
        + '<div onclick="event.stopPropagation();aiCalPick(\'' + dStr + '\')" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;border-radius:50%;background:' + innerBg + ';color:' + innerCol + ';font-weight:' + fw + ';margin:0 auto">' + dayNum + '</div>'
        + '</div>';
    }

    for (var i = 0; i < firstDay; i++) { renderCell(daysInPrev - firstDay + 1 + i, '', false); }
    for (var d3 = 1; d3 <= daysInMonth; d3++) { renderCell(d3, ds(vy, vm, d3), true); }
    var rem = (firstDay + daysInMonth) % 7;
    if (rem > 0) for (var j = 1; j <= 7 - rem; j++) { renderCell(j, '', false); }

    html += '</div></div>';
    return html + aiDdOkBtn(param);
  }
  return '';
}

function aiBudgetSlide(which, val) {
  var BDG_MAX = 1000000;
  val = parseInt(val) || 0;
  var p = mp2AiParams.budget;
  if (which === 'min') {
    p.min = Math.min(val, p.max);
    var minEl = document.getElementById('ai-bdg-min');
    if (minEl) minEl.value = p.min;
  } else {
    p.max = Math.max(val, p.min);
    var maxEl = document.getElementById('ai-bdg-max');
    if (maxEl) maxEl.value = p.max;
  }
  p.exact = '';
  var exactEl = document.getElementById('ai-bdg-exact');
  if (exactEl) exactEl.value = '';
  var minPct = p.min / BDG_MAX * 100;
  var maxPct = p.max / BDG_MAX * 100;
  var track = document.getElementById('ai-bdg-track');
  if (track) { track.style.left = minPct + '%'; track.style.right = (100 - maxPct) + '%'; }
  var minLbl = document.getElementById('ai-bdg-min-lbl');
  if (minLbl) minLbl.textContent = '$' + Number(p.min).toLocaleString();
  var maxLbl = document.getElementById('ai-bdg-max-lbl');
  if (maxLbl) maxLbl.textContent = '$' + Number(p.max).toLocaleString();
  aiUpdateTrigger('budget');
}

function aiBudgetExact(val) {
  var BDG_MAX = 1000000;
  val = Math.min(Math.max(parseInt(val) || 0, 0), BDG_MAX);
  var p = mp2AiParams.budget;
  p.exact = val;
  p.min = val;
  p.max = val;
  var minEl = document.getElementById('ai-bdg-min');
  var maxEl = document.getElementById('ai-bdg-max');
  if (minEl) minEl.value = val;
  if (maxEl) maxEl.value = val;
  var pct = val / BDG_MAX * 100;
  var track = document.getElementById('ai-bdg-track');
  if (track) { track.style.left = pct + '%'; track.style.right = (100 - pct) + '%'; }
  var minLbl = document.getElementById('ai-bdg-min-lbl');
  if (minLbl) minLbl.textContent = '$' + Number(val).toLocaleString();
  var maxLbl = document.getElementById('ai-bdg-max-lbl');
  if (maxLbl) maxLbl.textContent = '$' + Number(val).toLocaleString();
  aiUpdateTrigger('budget');
}

function aiImprSlide(which, val) {
  var IMP_MAX = 10000000;
  function fmt(n) { return n >= 1000000 ? (n/1000000).toFixed(n%1000000===0?0:1)+'M' : n >= 1000 ? Math.round(n/1000)+'K' : String(n); }
  val = parseInt(val) || 0;
  var p = mp2AiParams.impressions;
  if (which === 'min') {
    p.min = Math.min(val, p.max);
    var minEl = document.getElementById('ai-imp-min');
    if (minEl) minEl.value = p.min;
  } else {
    p.max = Math.max(val, p.min);
    var maxEl = document.getElementById('ai-imp-max');
    if (maxEl) maxEl.value = p.max;
  }
  p.exact = '';
  var exactEl = document.getElementById('ai-imp-exact');
  if (exactEl) exactEl.value = '';
  var minPct = p.min / IMP_MAX * 100;
  var maxPct = p.max / IMP_MAX * 100;
  var track = document.getElementById('ai-imp-track');
  if (track) { track.style.left = minPct + '%'; track.style.right = (100 - maxPct) + '%'; }
  var minLbl = document.getElementById('ai-imp-min-lbl');
  if (minLbl) minLbl.textContent = fmt(p.min);
  var maxLbl = document.getElementById('ai-imp-max-lbl');
  if (maxLbl) maxLbl.textContent = fmt(p.max);
  aiUpdateTrigger('impressions');
}

function aiImprExact(val) {
  var IMP_MAX = 10000000;
  function fmt(n) { return n >= 1000000 ? (n/1000000).toFixed(n%1000000===0?0:1)+'M' : n >= 1000 ? Math.round(n/1000)+'K' : String(n); }
  val = Math.min(Math.max(parseInt(val) || 0, 0), IMP_MAX);
  var p = mp2AiParams.impressions;
  p.exact = val; p.min = val; p.max = val;
  var minEl = document.getElementById('ai-imp-min');
  var maxEl = document.getElementById('ai-imp-max');
  if (minEl) minEl.value = val;
  if (maxEl) maxEl.value = val;
  var pct = val / IMP_MAX * 100;
  var track = document.getElementById('ai-imp-track');
  if (track) { track.style.left = pct + '%'; track.style.right = (100 - pct) + '%'; }
  var minLbl = document.getElementById('ai-imp-min-lbl');
  if (minLbl) minLbl.textContent = fmt(val);
  var maxLbl = document.getElementById('ai-imp-max-lbl');
  if (maxLbl) maxLbl.textContent = fmt(val);
  aiUpdateTrigger('impressions');
}

function aiCalNav(dir) {
  var p = mp2AiParams.dates;
  p.viewMonth += dir;
  if (p.viewMonth < 0)  { p.viewMonth = 11; p.viewYear--; }
  if (p.viewMonth > 11) { p.viewMonth = 0;  p.viewYear++; }
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('dates');
}

function aiCalPick(dStr) {
  var p = mp2AiParams.dates;
  if (!p.start || (p.start && p.end)) {
    p.start = dStr; p.end = '';
  } else {
    if (dStr < p.start)      { p.end = p.start; p.start = dStr; }
    else if (dStr === p.start){ p.start = ''; p.end = ''; }
    else                      { p.end = dStr; }
  }
  aiUpdateTrigger('dates');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('dates');
}

function aiScoreSlide(which, val) {
  val = parseInt(val) || 0;
  var p = mp2AiParams.score;
  if (which === 'min') {
    p.min = Math.min(val, p.max);
    var minEl = document.getElementById('ai-sc-min');
    if (minEl) minEl.value = p.min;
  } else {
    p.max = Math.max(val, p.min);
    var maxEl = document.getElementById('ai-sc-max');
    if (maxEl) maxEl.value = p.max;
  }
  var track = document.getElementById('ai-sc-track');
  if (track) { track.style.left = p.min + '%'; track.style.right = (100 - p.max) + '%'; }
  var minLbl = document.getElementById('ai-sc-min-lbl');
  if (minLbl) minLbl.textContent = p.min + '%';
  var maxLbl = document.getElementById('ai-sc-max-lbl');
  if (maxLbl) maxLbl.textContent = p.max + '%';
  aiUpdateTrigger('score');
}

function aiDaypartAll() {
  mp2AiParams.daypart.mode = 'all';
  mp2AiParams.daypart.values = [];
  aiUpdateTrigger('daypart');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('daypart');
}

function aiDaypartItem(val, checked) {
  var p = mp2AiParams.daypart;
  if (checked) {
    if (p.values.indexOf(val) < 0) p.values.push(val);
  } else {
    p.values = p.values.filter(function(v) { return v !== val; });
  }
  p.mode = p.values.length > 0 ? 'custom' : 'any';
  aiUpdateTrigger('daypart');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('daypart');
}

function aiChannelsAll() {
  mp2AiParams.channels.mode = 'all';
  mp2AiParams.channels.values = [];
  aiUpdateTrigger('channels');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('channels');
}

function aiChannelsItem(val, checked) {
  var p = mp2AiParams.channels;
  if (checked) {
    if (p.values.indexOf(val) < 0) p.values.push(val);
  } else {
    p.values = p.values.filter(function(v) { return v !== val; });
  }
  p.mode = p.values.length > 0 ? 'custom' : 'any';
  aiUpdateTrigger('channels');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('channels');
}

function aiTypeAll() {
  mp2AiParams.type.mode = 'all';
  mp2AiParams.type.values = [];
  aiUpdateTrigger('type');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('type');
}

function aiTypeItem(val, checked) {
  var p = mp2AiParams.type;
  if (checked) {
    if (p.values.indexOf(val) < 0) p.values.push(val);
  } else {
    p.values = p.values.filter(function(v) { return v !== val; });
  }
  p.mode = p.values.length > 0 ? 'custom' : 'any';
  aiUpdateTrigger('type');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('type');
}

function aiBrandAll() {
  mp2AiParams.brand.mode = 'all';
  mp2AiParams.brand.values = [];
  aiUpdateTrigger('brand');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('brand');
}

function aiBrandItem(val, checked) {
  var p = mp2AiParams.brand;
  if (checked) {
    if (p.values.indexOf(val) < 0) p.values.push(val);
  } else {
    p.values = p.values.filter(function(v) { return v !== val; });
  }
  p.mode = p.values.length > 0 ? 'custom' : 'any';
  aiUpdateTrigger('brand');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('brand');
}

function aiScoreAll() {
  mp2AiParams.score.mode = 'all';
  mp2AiParams.score.values = [];
  aiUpdateTrigger('score');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('score');
}

function aiScoreItem(val, checked) {
  var p = mp2AiParams.score;
  if (checked) {
    if (p.values.indexOf(val) < 0) p.values.push(val);
  } else {
    p.values = p.values.filter(function(v) { return v !== val; });
  }
  p.mode = p.values.length > 0 ? 'custom' : 'all';
  aiUpdateTrigger('score');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('score');
}

function aiWindowSelect(secs) {
  mp2AiParams.window.mode = 'set';
  mp2AiParams.window.secs = secs;
  mp2LookbackSecs = secs;
  aiUpdateTrigger('window');
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent('window');
  // Keep Step 3's Lookback Window slider in sync if already rendered
  var slider = document.getElementById('mp2-lookback-slider');
  var label  = document.getElementById('mp2-lookback-label');
  if (slider) slider.value = secs;
  if (label)  label.textContent = _mp2FmtWindowSecs(secs);
  mp2SliderFill(secs);
}

function aiDdDo(param, val) {
  var p = mp2AiParams[param];
  if (param === 'daypart' || param === 'channels') {
    if (val === 'any') { p.mode = 'any'; p.values = []; }
    else               { p.mode = 'set'; p.dir = val; }
  } else {
    p.mode = val;
  }
  var dd = document.getElementById('ai-global-dd');
  if (dd) dd.innerHTML = aiDdContent(param);
  aiUpdateTrigger(param);
}

function aiDdCheckItem(param, input) {
  var p   = mp2AiParams[param];
  var val = input.value;
  if (input.checked) {
    if (p.values.indexOf(val) < 0) p.values.push(val);
    if (p.mode === 'any') { p.mode = (param === 'brand' ? 'custom' : 'set'); }
  } else {
    p.values = p.values.filter(function(v){ return v !== val; });
  }
  var label = input.closest('.ai-check-pill');
  if (label) {
    label.style.borderColor = input.checked ? '#e11d8f' : '';
    label.style.color       = input.checked ? '#e11d8f' : '';
    label.style.background  = input.checked ? '#fdf2f8' : '';
  }
  aiUpdateTrigger(param);
}

// ── AI params panel ───────────────────────────────────────────────────────────

function csTx2BuildAIParamsPanel() {
  var panel = document.getElementById('tx2-sub-content-ai-media-plan');
  if (!panel) return;
  panel.style.overflow = 'hidden';

  panel.innerHTML =
    '<div style="flex:1;overflow-y:auto;min-height:0;display:flex;align-items:center;justify-content:center;padding:16px 4px">'
    + '<div style="max-width:460px;width:100%;text-align:center">'

    // Visual header
    + '<div style="margin-bottom:32px">'
    +   '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:2px">AI Media Plan</div>'
    +   '<div style="font-size:11px;color:var(--muted);line-height:1.4">Describe what you need and the AI will find the best placements.</div>'
    + '</div>'

    // Conversational sentence — free-flowing, centered, wraps naturally
    + '<div style="font-size:15px;line-height:2;color:var(--text);margin-bottom:32px">'
    +   'The budget for my media plan is ' + aiTriggerHtml('budget')
    +   ' and I want to deliver ' + aiTriggerHtml('impressions') + ' impressions per day. '
    +   'The Channels should be ' + aiTriggerHtml('channels')
    +   ' and the type ' + aiTriggerHtml('type') + '. '
    +   'My Brand Safety parameters are ' + aiTriggerHtml('brand') + '. '
    +   'Use ' + aiTriggerHtml('score') + ' Match Score.'
    + '</div>'

    // Button — inside the same wrapper, same gap
    + '<div style="display:flex;justify-content:center">'
    +   '<button onclick="csTx2GenerateAIMediaPlan()" style="height:38px;padding:0 22px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:9px;border:none;background:var(--accent);color:#fff;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit">'
    +     '<svg width="13" height="13" viewBox="0 0 16 16" fill="#fff"><path d="M6 1L7.3 4.7 11 6 7.3 7.3 6 11 4.7 7.3 1 6 4.7 4.7Z"/><path d="M12.5 0.5L13.3 2.7 15.5 3.5 13.3 4.3 12.5 6.5 11.7 4.3 9.5 3.5 11.7 2.7Z" opacity=".8"/></svg>'
    +     'Generate AI Plan'
    +   '</button>'
    + '</div>'

    + '</div>'  // max-width wrapper
    + '</div>';  // scroll area
  mp2FixAiPanelHeight();
}

function mp2FixAiPanelHeight() {
  setTimeout(function() {
    var p = document.getElementById('tx2-sub-content-ai-media-plan');
    if (!p || p.style.display === 'none') return;
    var rect = p.getBoundingClientRect();
    p.style.height    = Math.max(300, window.innerHeight - rect.top - 20) + 'px';
    p.style.minHeight = '0';
    p.style.overflow  = 'hidden';
  }, 0);
}

var _aiSuggestions    = [];
var _aiActiveVariant  = 2;   // default: Optimized (index 2)
var _aiPlanVariants   = [];  // populated by aiInitPlanVariantsFromAPI()

// ── Map MOCK_AI_MEDIA_PLANS → internal _aiPlanVariants format ────────────────
function aiInitPlanVariantsFromAPI() {
  var typeMap = { 'Live': 'live', 'Organic Pause': 'organic', 'VoD': 'ads' };
  _aiPlanVariants = (MOCK_AI_MEDIA_PLANS || []).map(function(plan) {
    var suggestions = (plan.moments || []).map(function(m) {
      // pods from MOCK_MOMENTS_API lookup (ai-plans API doesn't carry pods)
      var mockM = (MOCK_MOMENTS_API || []).find(function(x) { return x.moment_id === m.moment_id; }) || {};
      var impM  = m.est_impressions >= 1000000
        ? (m.est_impressions / 1000000).toFixed(1) + 'M'
        : Math.round(m.est_impressions / 1000) + 'K';
      return {
        moment:          m.moment_name,
        channels:        m.channels,
        type:            typeMap[m.moment_type] || 'ads',
        pods:            mockM.pods || 0,
        cpm:             '$' + m.est_cpm.toFixed(2),
        impressions:     impM,
        est_dollar_value: m.est_dollar_value,
        moment_score:    m.moment_score,
      };
    });
    return {
      plan_id:     plan.plan_id,
      name:        plan.plan_name,
      budget:      plan.budget_k,
      impressions: plan.total_impressions_m,
      description: plan.description,
      suggestions: suggestions,
    };
  });
  _aiActiveVariant = 2; // Optimized
  _aiSuggestions   = _aiPlanVariants.length > 2 ? _aiPlanVariants[2].suggestions.slice() : [];
}

function aiSelectPlanVariant(idx) {
  _aiActiveVariant = idx;
  _aiSuggestions = _aiPlanVariants[idx].suggestions.slice();
  aiRenderResultsPanel();
}

function aiInitPlanScatter() {
  var canvas = document.getElementById('ai-plan-scatter');
  if (!canvas || !window.Chart) return;
  if (window._aiScatterChart) { window._aiScatterChart.destroy(); }

  var pts = _aiPlanVariants.map(function(p, i) {
    return { x: p.impressions, y: p.budget, label: p.name, idx: i };
  });

  var PINK = '#e11d8f';
  var GREY = '#CBD5E1';

  var INDIGO = '#ED005E';
  var activeNow = _aiActiveVariant;

  var bgColors = pts.map(function(p, i) {
    return i === activeNow ? (i === 2 ? PINK : INDIGO) : (i === 2 ? 'rgba(225,29,143,.12)' : GREY);
  });
  var borderColors = pts.map(function(p, i) {
    return i === activeNow ? (i === 2 ? PINK : INDIGO) : (i === 2 ? PINK : '#94A3B8');
  });
  var radii = pts.map(function(p, i) {
    return i === activeNow ? 11 : 7;
  });

  function makeImg(svg) { var img = new Image(14, 14); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); return img; }
  var awardImg  = makeImg('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>');
  var upImg     = makeImg('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>');
  var downImg   = makeImg('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>');

  function iconForIdx(i) {
    var v = _aiPlanVariants[i];
    if (!v) return downImg;
    if (v.plan_id === 'PLAN003') return awardImg;   // Optimized ★
    if (v.plan_id === 'PLAN004' || v.plan_id === 'PLAN005') return upImg;   // Scale, Premium ↑
    return downImg;  // Efficiency, Value ↓
  }

  var awardPlugin = {
    id: 'awardIcon',
    afterDraw: function(chart) {
      var meta = chart.getDatasetMeta(0);
      var ctx  = chart.ctx;
      var elA = meta.data[activeNow];
      var img = iconForIdx(activeNow);
      if (elA && img.complete) ctx.drawImage(img, elA.x - 7, elA.y - 7, 14, 14);
    }
  };

  function buildChart() {
    if (window._aiScatterChart) { window._aiScatterChart.destroy(); }
    window._aiScatterChart = new Chart(canvas, {
      type: 'scatter',
      data: {
        datasets: [{
          data: pts,
          backgroundColor: bgColors,
          borderColor:     borderColors,
          pointRadius:     radii,
          pointHoverRadius: 11,
          borderWidth: 2,
        }]
      },
      plugins: [awardPlugin],
      options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              var d = ctx.raw;
              return [d.label, 'Budget: $' + d.y + 'K', 'Impressions: ' + d.x + 'M'];
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Impressions (M)', font: { size: 9 }, color: 'var(--muted)' },
          ticks: { font: { size: 9 }, color: 'var(--faint)' },
          grid:  { color: 'rgba(0,0,0,.05)' }
        },
        y: {
          title: { display: true, text: 'Budget ($K)', font: { size: 9 }, color: 'var(--muted)' },
          ticks: { font: { size: 9 }, color: 'var(--faint)' },
          grid:  { color: 'rgba(0,0,0,.05)' }
        }
      },
      onClick: function(evt, elements) {
        if (elements && elements.length > 0) {
          aiSelectPlanVariant(elements[0].index);
        }
      }
    }
  });
  }

  if (awardImg.complete) { buildChart(); }
  else { awardImg.onload = buildChart; awardImg.onerror = buildChart; }
}

function aiRenderResultsPanel() {
  var panel = document.getElementById('tx2-sub-content-ai-media-plan');
  if (!panel) return;
  var sugg = _aiSuggestions;
  var TH = 'font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);padding:10px 10px;border-bottom:1px solid var(--border);white-space:nowrap';
  var totalImpr   = sugg.reduce(function(s, r) { return s + parseFloat(r.impressions) * (r.impressions.indexOf('M') >= 0 ? 1000000 : 1000); }, 0);
  var fmtImpr = totalImpr >= 1000000 ? (totalImpr/1000000).toFixed(1) + 'M' : Math.round(totalImpr/1000) + 'K';
  var avgCpm = Math.round(sugg.reduce(function(s, r) { return s + parseInt(r.cpm.replace(/[^0-9]/g,'')); }, 0) / (sugg.length || 1));
  var TOT  = 'padding:10px 10px;font-size:12px;font-weight:600;color:var(--text);border-top:2px solid var(--border-md);background:#fff';
  var DELBTN = 'border:none;background:none;cursor:pointer;color:var(--faint);padding:2px 6px;border-radius:5px;line-height:1;font-size:16px;transition:color .12s';
  var activeVariant = _aiPlanVariants[_aiActiveVariant];
  // Dollar values come directly from suggestion rows (set by aiInitPlanVariantsFromAPI)
  var totalDollar = sugg.reduce(function(s, r) { return s + (r.est_dollar_value || 0); }, 0);
  var fmtDollar   = totalDollar >= 1000000 ? '$' + (totalDollar/1000000).toFixed(2) + 'M' : '$' + Math.round(totalDollar/1000) + 'K';

  panel.innerHTML =
    '<div style="display:flex;flex:1;min-height:0;padding:0 9px;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">'

    // ── Left: scatter chart ──
    + '<div style="width:360px;flex-shrink:0;display:flex;flex-direction:column;padding:9px 13px">'
    +   '<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">'
    +     '<div style="width:18px;height:18px;border-radius:5px;background:linear-gradient(135deg,#e11d8f,#f43f5e);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    +       '<svg width="10" height="10" viewBox="0 0 16 16" fill="#fff"><path d="M6 1L7.3 4.7 11 6 7.3 7.3 6 11 4.7 7.3 1 6 4.7 4.7Z"/><path d="M12.5 0.5L13.3 2.7 15.5 3.5 13.3 4.3 12.5 6.5 11.7 4.3 9.5 3.5 11.7 2.7Z" opacity=".8"/></svg>'
    +     '</div>'
    +     '<div style="font-size:11px;font-weight:600;color:var(--text)">AI-Suggested Plans</div>'
    +   '</div>'
    +   '<div style="font-size:10px;color:var(--faint);margin-bottom:10px">Click a point to switch</div>'
    +   '<div style="flex:1;min-height:0;position:relative">'
    +     '<canvas id="ai-plan-scatter"></canvas>'
    +   '</div>'
    + '</div>'

    // ── Vertical divider ──
    + '<div style="width:1px;background:var(--border);align-self:stretch;flex-shrink:0"></div>'

    // ── Right: table ──
    + '<div style="display:flex;flex-direction:column;flex:1;min-height:0;padding:9px 13px;overflow:hidden">'

    // Header — aligns with "AI-Suggested Plans" on the left
    + (function() {
        var _av = _aiPlanVariants[_aiActiveVariant] || {};
        var planIcon = (_av.plan_id === 'PLAN003')
          ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>'
          : (_av.plan_id === 'PLAN004' || _av.plan_id === 'PLAN005')
          ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>'
          : '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>';
        var subtitle = activeVariant
          ? sugg.length + ' moment' + (sugg.length !== 1 ? 's' : '') + ' &nbsp;·&nbsp; $' + activeVariant.budget + 'K budget &nbsp;·&nbsp; ' + activeVariant.impressions + 'M imp.'
          : '';
        return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;flex-shrink:0">'
          + '<div style="width:18px;height:18px;border-radius:5px;background:linear-gradient(135deg,#e11d8f,#f43f5e);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
          +   planIcon
          + '</div>'
          + '<div>'
          +   '<div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.3">' + (activeVariant ? activeVariant.name : 'Media Plan') + '</div>'
          +   '<div style="font-size:10px;color:var(--faint);line-height:1.3">' + subtitle + '</div>'
          + '</div>'
          + '</div>';
      })()

    // Card wrapping the table
    + '<div style="flex:1;min-height:0;display:flex;flex-direction:column;border:1px solid var(--border);border-radius:10px;overflow:hidden;background:#fff">'
    + '<div style="overflow-y:auto;overflow-x:auto;flex:1;min-height:0">'
    +   '<table style="width:100%;border-collapse:collapse;background:#fff">'
    +   '<thead><tr style="background:var(--bg)">'
    +     '<th style="text-align:left;'  + TH + '">Moment</th>'
    +     '<th style="text-align:left;'  + TH + '">Channels</th>'
    +     '<th style="text-align:left;'  + TH + '">Type</th>'
    +     '<th style="text-align:right;' + TH + '">PODs</th>'
    +     '<th style="text-align:right;' + TH + '">Est. CPM</th>'
    +     '<th style="text-align:right;' + TH + '">Est. Impr.</th>'
    +     '<th style="text-align:right;' + TH + '">Est. $ Value</th>'
    +     '<th style="' + TH + ';width:32px"></th>'
    +   '</tr></thead>'
    +   '<tbody>'
    +   sugg.map(function(s, idx) {
          var chans = s.channels || [];
          var chCount = chans.length;
          var chTooltipLines = chans.join('<br>');
          var chBadge = chCount === 0 ? '—'
            : '<span style="position:relative;display:inline-block"'
            +   ' onmouseenter="var t=this.querySelector(\'.ai-ch-tt\');if(t)t.style.display=\'block\'"'
            +   ' onmouseleave="var t=this.querySelector(\'.ai-ch-tt\');if(t)t.style.display=\'none\'">'
            +   '<span style="display:inline-flex;align-items:center;font-size:10px;font-weight:500;color:var(--text);background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:2px 9px;cursor:default;white-space:nowrap">'
            +     chCount + ' channel' + (chCount !== 1 ? 's' : '')
            +   '</span>'
            +   '<div class="ai-ch-tt" style="display:none;position:absolute;bottom:calc(100% + 5px);left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;font-size:10px;line-height:1.6;border-radius:7px;padding:6px 10px;white-space:nowrap;z-index:200;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,.2)">'
            +     chTooltipLines
            +   '</div>'
            + '</span>';
          var rawDollar = s.est_dollar_value || 0;
          var estDollar = rawDollar ? '$' + (rawDollar >= 1000 ? Math.round(rawDollar/1000) + 'K' : rawDollar) : '—';
          var rowType = s.type || 'ads';
          var typeBadge = rowType === 'live'
            ? '<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;background:#fef2f2;border:1px solid #fecaca;border-radius:20px;padding:2px 8px;color:#dc2626;white-space:nowrap"><span style="width:5px;height:5px;border-radius:50%;background:#ef4444;display:inline-block;box-shadow:0 0 4px #ef4444"></span>Live</span>'
            : rowType === 'organic'
            ? '<span style="font-size:10px;font-weight:600;background:#f0fdfa;border:1px solid #99f6e4;border-radius:20px;padding:2px 8px;color:#0f766e;white-space:nowrap">Organic Pause</span>'
            : '<span style="font-size:10px;font-weight:600;background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:2px 8px;color:#1d4ed8;white-space:nowrap">VoD</span>';
          var TD = 'padding:10px 10px;font-size:12px;font-weight:500;color:var(--text);border-bottom:1px solid var(--border)';
          return '<tr onmouseenter="this.querySelectorAll(\'td\').forEach(function(td){td.style.background=\'#FAFAF8\'})" onmouseleave="this.querySelectorAll(\'td\').forEach(function(td){td.style.background=\'\'})"> '
            + '<td style="' + TD + ';white-space:nowrap">' + s.moment + '</td>'
            + '<td style="' + TD + '">' + chBadge + '</td>'
            + '<td style="' + TD + '">' + typeBadge + '</td>'
            + '<td style="' + TD + ';text-align:right">' + (s.pods || '—') + '</td>'
            + '<td style="' + TD + ';text-align:right">' + s.cpm + '</td>'
            + '<td style="' + TD + ';text-align:right">' + s.impressions + '</td>'
            + '<td style="' + TD + ';text-align:right">' + estDollar + '</td>'
            + '<td style="padding:6px 6px;border-bottom:1px solid var(--border);text-align:center">'
            +   '<button style="' + DELBTN + '" onclick="aiDeleteSuggestion(' + idx + ')" onmouseenter="this.style.color=\'#e11d8f\'" onmouseleave="this.style.color=\'var(--faint)\'">×</button>'
            + '</td>'
            + '</tr>';
        }).join('')
    +   '</tbody>'
    +   '<tfoot style="position:sticky;bottom:0;z-index:1">'
    +     '<tr>'
    +       '<td style="' + TOT + '">Total</td>'
    +       '<td style="' + TOT + '"></td>'
    +       '<td style="' + TOT + '"></td>'
    +       '<td style="' + TOT + '"></td>'
    +       '<td style="' + TOT + ';text-align:right">Avg $' + avgCpm + '</td>'
    +       '<td style="' + TOT + ';text-align:right">' + fmtImpr + '</td>'
    +       '<td style="' + TOT + ';text-align:right">' + fmtDollar + '</td>'
    +       '<td style="' + TOT + '"></td>'
    +     '</tr>'
    +   '</tfoot>'
    +   '</table>'
    + '</div>'
    + '</div>'  // card
    + '<div style="padding-top:12px;flex-shrink:0;display:flex;align-items:center;gap:8px">'

    // ── Add to Plan Builder — standalone secondary button ──
    +   (function(){ var _lk=_mp2IsLocked(); return '<button ' + (_lk ? 'disabled ' : '') + 'onclick="aiAddToPlanBuilder()" style="flex-shrink:0;height:36px;padding:0 13px;display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border-md);border-radius:9px;background:transparent;color:' + (_lk ? 'var(--faint)' : 'var(--text)') + ';font-size:12px;font-weight:500;cursor:' + (_lk ? 'not-allowed' : 'pointer') + ';font-family:inherit;white-space:nowrap;opacity:' + (_lk ? '.4' : '1') + ';transition:background .13s,border-color .13s"' + (_lk ? '' : ' onmouseenter="this.style.background=\'var(--bg)\';this.style.borderColor=\'var(--border-md)\'" onmouseleave="this.style.background=\'transparent\';this.style.borderColor=\'var(--border-md)\'"') + '><svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/></svg>Add to Plan Builder</button>'; })()

    // ── Vertical divider ──
    +   '<div style="width:1px;height:22px;background:var(--border-md);flex-shrink:0"></div>'

    // ── Input + Save as Media Plan in a pill ──
    +   '<div style="flex:1;display:flex;align-items:center;border:1px solid var(--border-md);border-radius:9px;overflow:hidden;background:#fff;height:36px">'

    // Input with grey pencil icon on the right
    +     '<div style="flex:1;min-width:0;position:relative;display:flex;align-items:center">'
    +       '<input id="ai-plan-name" class="ai-input" placeholder="Name this media plan…" style="flex:1;height:36px;border:none;border-radius:0;padding:0 28px 0 10px;background:transparent;outline:none;font-size:12px;transition:border-color .15s,box-shadow .15s">'
    +       '<span id="ai-plan-name-err" style="display:none;position:absolute;bottom:calc(100% + 4px);left:10px;font-size:10px;color:#ef4444;background:#fff;border:1px solid #fca5a5;border-radius:5px;padding:3px 8px;white-space:nowrap;z-index:10;pointer-events:none;box-shadow:0 2px 6px rgba(239,68,68,.12)"></span>'
    +       '<button onclick="aiGeneratePlanName()" title="Generate name with AI" style="position:absolute;right:7px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;color:var(--faint);transition:color .13s" onmouseover="this.style.color=\'var(--text)\'" onmouseout="this.style.color=\'var(--faint)\'"><svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"/></svg></button>'
    +     '</div>'

    // Vertical divider
    +     '<div style="width:1px;height:22px;background:var(--border-md);flex-shrink:0"></div>'

    // Save as Media Plan
    +     (function(){ var _lk=_mp2IsLocked(); return '<button ' + (_lk ? 'disabled ' : '') + 'onclick="aiSaveAIMediaPlan()" style="flex-shrink:0;height:100%;padding:0 13px;display:inline-flex;align-items:center;gap:6px;border:none;background:transparent;color:' + (_lk ? 'var(--faint)' : 'var(--text)') + ';font-size:12px;font-weight:500;cursor:' + (_lk ? 'not-allowed' : 'pointer') + ';font-family:inherit;white-space:nowrap;opacity:' + (_lk ? '.4' : '1') + ';transition:background .13s"' + (_lk ? '' : ' onmouseenter="this.style.background=\'var(--bg)\'" onmouseleave="this.style.background=\'transparent\'"') + '><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2h8l2 2v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.4"/><path d="M5 13V8h4v5M4 2v3h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>Save Moments Group</button>'; })()

    +   '</div>'
    + '</div>'
    + '</div>'  // right column
    + '</div>';  // single card

  setTimeout(function() { aiInitPlanScatter(); }, 0);
}

function aiDeleteSuggestion(idx) {
  _aiSuggestions.splice(idx, 1);
  aiRenderResultsPanel();
}

function aiAddToPlanBuilder() {
  // mp2SelectedMoments is keyed by moment name (value = true)
  _aiSuggestions.forEach(function(s) {
    if (s.moment) mp2SelectedMoments[s.moment] = true;
  });
  // Open the Build Media Plan sidebar and re-render it
  var strip = document.getElementById('mp2-asset-strip');
  if (!strip || strip.style.display !== 'flex') mp2ToggleSidebar('plan');
  else {
    var zonePlan = document.getElementById('mp2-strip-plan');
    var zoneList = document.getElementById('mp2-strip-list');
    if (zonePlan) zonePlan.style.display = 'flex';
    if (zoneList) zoneList.style.display = 'none';
    mp2SidebarMode = 'plan';
    var btnPlan = document.getElementById('mp2-asset-toggle');
    var btnList = document.getElementById('mp2-list-toggle');
    if (btnPlan) { btnPlan.dataset.act = '1'; btnPlan.style.background = 'var(--bg)'; btnPlan.style.color = 'var(--text)'; }
    if (btnList) { btnList.dataset.act = ''; btnList.style.background = 'transparent'; btnList.style.color = 'var(--muted)'; }
  }
  mp2RenderMomentsMediaPlan();
}

function aiGeneratePlanName() {
  var names = _aiSuggestions.map(function(s) { return s.moment; });
  var camp  = (mp2SelectedCampaign && mp2SelectedCampaign.name) ? mp2SelectedCampaign.name : '';
  var month = new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  var momentPart = names.length === 1 ? names[0]
    : names.length === 2 ? names[0] + ' & ' + names[1]
    : names.length > 2   ? names[0] + ' +' + (names.length - 1) + ' moments'
    : 'AI Moments Plan';
  var generated = (camp ? camp + ' — ' : '') + momentPart + ' · ' + month;
  var input = document.getElementById('ai-plan-name');
  if (input) {
    input.value = generated;
    input.focus();
    input.style.color = 'var(--accent)';
    setTimeout(function() { input.style.color = ''; }, 800);
  }
}

// ── Shared DB persistence helper ─────────────────────────────────────────────
function mp2SavePlanToDB(planId, planName, moments, onDone) {
  if (!_mp2LastAnalysisId) { if (onDone) onDone(null); return; }
  fetch('/api/media-plans-add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      analysis_id:    _mp2LastAnalysisId,
      media_plan_id:  planId,
      media_plan_name: planName,
      moments:        moments,
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) { if (onDone) onDone(data); })
  .catch(function(err) { console.warn('mp2SavePlanToDB error:', err); if (onDone) onDone(null); });
}

// ── Inline validation helper ──────────────────────────────────────────────────
function mp2ShowInputError(inputEl, msgEl, message) {
  if (!inputEl) return;
  inputEl.style.borderColor = '#ef4444';
  inputEl.style.boxShadow   = '0 0 0 2px rgba(239,68,68,.15)';
  if (msgEl) { msgEl.textContent = message; msgEl.style.display = 'block'; }
  // Clear on next keystroke
  function clear() {
    inputEl.style.borderColor = '';
    inputEl.style.boxShadow   = '';
    if (msgEl) msgEl.style.display = 'none';
    inputEl.removeEventListener('input', clear);
  }
  inputEl.addEventListener('input', clear);
  inputEl.focus();
}

function aiSaveAIMediaPlan() {
  var nameInput = document.getElementById('ai-plan-name');
  var errEl     = document.getElementById('ai-plan-name-err');
  var planName  = nameInput ? nameInput.value.trim() : '';

  // ── Validation ──
  if (!planName) {
    mp2ShowInputError(nameInput, errEl, 'Please enter a name for this media plan');
    return;
  }

  var now     = new Date();
  var dateStr = now.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()] + ' ' + now.getFullYear();
  var unEl    = document.getElementById('un');
  var author  = (unEl && unEl.textContent.trim()) || 'Bruna';
  var totalImpr = _aiSuggestions.reduce(function(s, r) { return s + parseFloat(r.impressions) * (r.impressions.indexOf('M') >= 0 ? 1000000 : 1000); }, 0);
  var fmtImpr   = totalImpr >= 1000000 ? (totalImpr/1000000).toFixed(1) + 'M' : Math.round(totalImpr/1000) + 'K';
  var avgCpm    = Math.round(_aiSuggestions.reduce(function(s, r) { return s + parseInt(r.cpm.replace(/[^0-9]/g,'')); }, 0) / (_aiSuggestions.length || 1));

  // ── Build DB payload ──
  var _momSrc = mp2AnalysisMoments || MOCK_MOMENTS_API || [];
  var dbMoments = _aiSuggestions.map(function(s) {
    var mockM  = _momSrc.find(function(x) { return x.moment_name === s.moment; }) || {};
    var impNum = parseFloat(s.impressions) * (s.impressions.indexOf('M') >= 0 ? 1000000 : 1000);
    var cpmNum = parseFloat(s.cpm.replace(/[^0-9.]/g, ''));
    var typeMap = { 'live': 'Live', 'organic': 'Organic Pause', 'ads': 'VoD' };
    return {
      moment_id:               mockM.moment_id  || null,
      moment_name:             s.moment,
      moment_type:             typeMap[s.type]  || 'VoD',
      moment_est_impr:         impNum           || null,
      moment_est_cpm:          cpmNum           || null,
      moment_est_dollar_value: s.est_dollar_value || Math.round(impNum * cpmNum / 1000),
      moment_pods:             s.pods           || null,
      moment_channels:         s.channels       || [],
      moment_taxonomies:       mockM.taxonomies || null,
    };
  });

  var planId = 'MP-' + Date.now();

  // ── Push to current analysis in-memory list ──
  _mp2CurrentAnalysisPlans.push({
    id:          planId,
    name:        planName,
    date:        dateStr,
    author:      author,
    source:      'ai',
    inputType:   'text',
    moments:     _aiSuggestions.slice(),
    impressions: fmtImpr,
    avgCpm:      '$' + avgCpm,
    programs:    [],
    episodes:    [],
    _dbRaw:      { media_plan_id: planId, media_plan_name: planName, moments: dbMoments }
  });

  var newIdx = _mp2CurrentAnalysisPlans.length - 1;

  // ── Persist to DB ──
  mp2SavePlanToDB(planId, planName, dbMoments, function(res) {
    if (res && res.ok) {
      console.log('Media plan saved to DB:', planId);
    } else {
      console.warn('Media plan DB save failed (kept in memory)');
    }
  });

  // ── UI feedback: always open list panel ──
  mp2OpenSidebarList(newIdx);
  if (nameInput) nameInput.value = '';
}

// ── Save from Build Media Plan sidebar ───────────────────────────────────────
function mp2SaveBuilderMediaPlan() {
  var nameInput = document.getElementById('mp2-plan-name-input');
  var errEl     = document.getElementById('mp2-plan-name-err');
  var planName  = nameInput ? nameInput.value.trim() : '';

  // ── Validation ──
  if (!planName) {
    mp2ShowInputError(nameInput, errEl, 'Please enter a name for this media plan');
    return;
  }

  var names = Object.keys(mp2SelectedMoments).filter(function(n) { return mp2SelectedMoments[n]; });
  if (!names.length) return;

  var now     = new Date();
  var dateStr = now.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()] + ' ' + now.getFullYear();
  var unEl    = document.getElementById('un');
  var author  = (unEl && unEl.textContent.trim()) || 'Bruna';

  var _momSrc = mp2AnalysisMoments || MOCK_MOMENTS_API || [];
  var dbMoments = names.map(function(name) {
    var m = _momSrc.find(function(x) { return x.moment_name === name; }) || {};
    return {
      moment_id:               m.moment_id         || null,
      moment_name:             name,
      moment_type:             m.moment_type        || null,
      moment_est_impr:         m.est_impressions    || null,
      moment_est_cpm:          m.est_cpm            || null,
      moment_est_dollar_value: m.est_dollar_value   || null,
      moment_pods:             m.pods               || null,
      moment_channels:         m.channels           || [],
      moment_taxonomies:       m.taxonomies         || null,
    };
  });

  var totalImpM = dbMoments.reduce(function(s, m) { return s + (m.moment_est_impr || 0); }, 0) / 1000000;
  var fmtImpr   = totalImpM >= 1 ? totalImpM.toFixed(1) + 'M' : Math.round(totalImpM * 1000) + 'K';
  var planId    = 'MP-' + Date.now();

  // ── Push to current analysis in-memory list ──
  _mp2CurrentAnalysisPlans.push({
    id:          planId,
    name:        planName,
    date:        dateStr,
    author:      author,
    source:      'builder',
    inputType:   'text',
    moments:     dbMoments,
    impressions: fmtImpr,
    programs:    [],
    episodes:    [],
    _dbRaw:      { media_plan_id: planId, media_plan_name: planName, moments: dbMoments }
  });

  var newIdx = _mp2CurrentAnalysisPlans.length - 1;

  // ── Persist to DB ──
  mp2SavePlanToDB(planId, planName, dbMoments, function(res) {
    if (res && res.ok) {
      console.log('Builder media plan saved to DB:', planId);
    } else {
      console.warn('Builder media plan DB save failed (kept in memory)');
    }
  });

  // ── UI feedback ──
  if (nameInput) nameInput.value = '';
  var btn = document.querySelector('#mp2-strip-plan button[onclick="mp2SaveBuilderMediaPlan()"]');
  if (btn) {
    var orig = btn.textContent;
    btn.textContent = '✓ Saved';
    btn.style.background = '#16a34a';
    setTimeout(function() { btn.textContent = orig; btn.style.background = 'var(--accent)'; }, 1800);
  }
  // Always open the list sidebar to show the new card
  setTimeout(function() { mp2OpenSidebarList(newIdx); }, 400);
}

function mp2ShowConfirmModal(title, message, onConfirm) {
  var existing = document.getElementById('mp2-confirm-modal');
  if (existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'mp2-confirm-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.42);display:flex;align-items:center;justify-content:center;animation:mp2FadeIn .12s ease';
  modal.innerHTML =
    '<style>@keyframes mp2FadeIn{from{opacity:0}to{opacity:1}}</style>'
    + '<div onclick="event.stopPropagation()" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.18);padding:24px 24px 20px;width:360px;max-width:calc(100vw - 32px)">'
    +   '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:8px">' + title + '</div>'
    +   '<div style="font-size:12px;color:var(--muted);line-height:1.55;margin-bottom:20px">' + message + '</div>'
    +   '<div style="display:flex;gap:8px;justify-content:flex-end">'
    +     '<button onclick="document.getElementById(\'mp2-confirm-modal\').remove()" style="height:34px;padding:0 14px;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--text);font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;transition:background .12s" onmouseenter="this.style.background=\'var(--bg)\'" onmouseleave="this.style.background=\'transparent\'">Cancel</button>'
    +     '<button id="mp2-confirm-ok-btn" style="height:34px;padding:0 14px;border:none;border-radius:8px;background:#ef4444;color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .12s" onmouseenter="this.style.opacity=\'.85\'" onmouseleave="this.style.opacity=\'1\'">Delete</button>'
    +   '</div>'
    + '</div>';
  modal.addEventListener('click', function() { modal.remove(); });
  document.body.appendChild(modal);
  document.getElementById('mp2-confirm-ok-btn').addEventListener('click', function() {
    modal.remove();
    onConfirm();
  });
}

function mp2DeleteAnalysisPlan(idx, e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  var plan = _mp2CurrentAnalysisPlans[idx];
  if (!plan) return;
  mp2ShowConfirmModal(
    'Delete media plan?',
    'Are you sure you want to delete <strong>' + plan.name.replace(/</g,'&lt;') + '</strong>? This cannot be undone.',
    function() {
      _mp2CurrentAnalysisPlans.splice(idx, 1);
      mp2RenderStripList();
      // PATCH DB with remaining plans
      if (_mp2LastAnalysisId) {
        var remaining = _mp2CurrentAnalysisPlans.map(function(p) {
          return p._dbRaw || { media_plan_id: p.id, media_plan_name: p.name, moments: [] };
        });
        fetch('/api/moments-match?moments_match_analysis_id=' + _mp2LastAnalysisId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media_plans: remaining })
        }).catch(function(err) { console.warn('mp2DeleteAnalysisPlan DB error:', err); });
      }
    }
  );
}

// ── Plan detail modal (eye icon) ─────────────────────────────────────────────
function mp2OpenPlanDetailModal(idx, event) {
  if (event) event.stopPropagation();
  var mp = _mp2CurrentAnalysisPlans[idx];
  if (!mp) return;

  var srcMoments = (mp._dbRaw && mp._dbRaw.moments) ? mp._dbRaw.moments : (mp.moments || []);
  var momCount   = srcMoments.length;
  var totalImpr  = srcMoments.reduce(function(s, m) { return s + (Number(m.moment_est_impr) || 0); }, 0);
  var totalDollar= srcMoments.reduce(function(s, m) { return s + (Number(m.moment_est_dollar_value) || 0); }, 0);
  var fmtImpr    = totalImpr >= 1000000 ? (totalImpr/1000000).toFixed(1)+'M imp.' : totalImpr >= 1000 ? Math.round(totalImpr/1000)+'K imp.' : '';
  var fmtDollar  = totalDollar >= 1000000 ? '$'+(totalDollar/1000000).toFixed(1)+'M' : totalDollar >= 1000 ? '$'+Math.round(totalDollar/1000)+'K' : totalDollar ? '$'+totalDollar : '';
  var flightStr  = (mp.flightStart && mp.flightEnd) ? mp.flightStart + ' → ' + mp.flightEnd : '';

  var MERGE_ICO = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/></svg>';

  var overlay = document.createElement('div');
  overlay.id = 'mp2-plan-detail-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1200;display:flex;align-items:center;justify-content:center';

  var momRows = srcMoments.slice(0, 6).map(function(m) {
    var impr = Number(m.moment_est_impr) || 0;
    var fmt  = impr >= 1000000 ? (impr/1000000).toFixed(1)+'M' : impr >= 1000 ? Math.round(impr/1000)+'K' : impr || '—';
    return '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)">'
      + '<div style="flex:1;font-size:12px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (m.moment_name || m.show || '—').replace(/</g,'&lt;') + '</div>'
      + '<div style="font-size:11px;color:var(--faint);flex-shrink:0">' + fmt + ' imp.</div>'
      + '</div>';
  }).join('');

  if (srcMoments.length > 6) {
    momRows += '<div style="font-size:11px;color:var(--faint);padding-top:6px;text-align:center">+ ' + (srcMoments.length - 6) + ' more moments</div>';
  }

  overlay.innerHTML =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;width:420px;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 8px 36px rgba(0,0,0,.2);font-family:inherit;overflow:hidden">'
    // header
    + '<div style="display:flex;align-items:flex-start;padding:20px 20px 14px;gap:10px;border-bottom:1px solid var(--border)">'
    +   '<div style="flex:1;min-width:0">'
    +     '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + mp.name.replace(/</g,'&lt;') + '</div>'
    +     '<div style="font-size:11px;color:var(--faint)">'
    +       momCount + ' moment' + (momCount !== 1 ? 's' : '')
    +       (fmtImpr   ? ' · ' + fmtImpr   : '')
    +       (fmtDollar ? ' · ' + fmtDollar : '')
    +       (flightStr ? ' · ' + flightStr  : '')
    +     '</div>'
    +   '</div>'
    +   '<button onclick="document.getElementById(\'mp2-plan-detail-overlay\').remove()" style="flex-shrink:0;border:none;background:none;cursor:pointer;color:var(--faint);font-size:17px;line-height:1;padding:1px 3px;margin-top:-2px" onmouseover="this.style.color=\'var(--text)\'" onmouseout="this.style.color=\'var(--faint)\'">×</button>'
    + '</div>'
    // body
    + '<div style="flex:1;overflow-y:auto;padding:14px 20px">'
    +   (srcMoments.length
        ? '<div style="font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Moments</div>' + momRows
        : '<div style="padding:20px 0;text-align:center;color:var(--faint);font-size:12px">No moments in this plan.</div>')
    + '</div>'
    // footer CTA
    + '<div style="padding:14px 20px;border-top:1px solid var(--border)">'
    +   '<button onclick="mp2SelectDistributePlan(' + idx + ')" style="width:100%;height:38px;display:flex;align-items:center;justify-content:center;gap:8px;background:#0f172a;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .13s" onmouseover="this.style.opacity=\'.88\'" onmouseout="this.style.opacity=\'1\'">'
    +     MERGE_ICO
    +     'Select this Media Plan and Distribute to DSP'
    +   '</button>'
    + '</div>'
    + '</div>';

  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function mp2SelectDistributePlan(idx) {
  _mp2DistributePlanIdx = (_mp2DistributePlanIdx === idx) ? null : idx; // toggle
  var overlay = document.getElementById('mp2-plan-detail-overlay');
  if (overlay) overlay.remove();
  mp2RenderStripList();
}

function mp2SaveAndDistribute() {
  if (_mp2DistributePlanIdx === null) return;
  var plan         = _mp2CurrentAnalysisPlans[_mp2DistributePlanIdx];
  var campaignDbId = mp2SelectedCampaign && mp2SelectedCampaign.dbId;

  // If no campaign linked, fall back to DSP modal
  if (!campaignDbId || !plan) {
    mp2ActivateDSP(_mp2DistributePlanIdx);
    return;
  }

  // Link selected creatives to the campaign
  var creativeIds = (mp2LibrarySelectedItems || []).map(function(c) {
    return c.dbId ? parseInt(c.dbId)
      : (c.id    ? parseInt(String(c.id).replace('dbcr', '')) : null);
  }).filter(function(id) { return id && !isNaN(id); });

  if (creativeIds.length) {
    fetch('/api/creatives-link', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ campaign_id: campaignDbId, creative_ids: creativeIds })
    }).catch(function(e) { console.warn('creatives-link error:', e); });
  }

  // Pre-populate draft creatives for Campaign Manager
  if (typeof _cmDraftCreatives !== 'undefined' && mp2LibrarySelectedItems && mp2LibrarySelectedItems.length) {
    _cmDraftCreatives = mp2LibrarySelectedItems.map(function(cr, i) {
      return {
        id:        'pending-' + i,
        libId:     cr.id || '',
        dbId:      cr.dbId || null,
        name:      cr.name || '—',
        thumb:     cr.thumb || '',
        fileType:  cr.fileType || '',
        mediaType: cr.mediaType || '',
        templates: cr.templates || []
      };
    });
  }

  // Navigate to Campaign Manager with pre-populated state
  _cmPendingCampaignDbId = campaignDbId;
  _cmPendingAnalysisId   = _mp2LastAnalysisId;
  _cmPendingMpId         = (plan._dbRaw && (plan._dbRaw.moments_group_id || plan._dbRaw.media_plan_id)) || plan.id || null;
  if (typeof setPage === 'function') {
    setPage('campaign-management', 'Campaign Management', true);
  }
}

function mp2RenderStripList(highlightIdx) {
  var zone = document.getElementById('mp2-strip-list');
  if (!zone) return;

  // Auto-select first plan if nothing is selected yet and plans exist
  if (_mp2DistributePlanIdx === null && _mp2CurrentAnalysisPlans.length > 0) {
    _mp2DistributePlanIdx = 0;
  }

  var EYE_ICO = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
  var CHECK_ICO = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  var MERGE_ICO = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/></svg>';

  var _noCampaign = !mp2SelectedCampaign;
  // Button is active whenever a plan is selected — no campaign = falls back to DSP modal
  var hasSelected = (_mp2DistributePlanIdx !== null) && !_mp2IsLocked();

  var distributeBtn = '<div style="flex-shrink:0;padding:10px 12px;border-top:1px solid var(--border)">'
    + '<button onclick="mp2SaveAndDistribute()" '
    + (hasSelected ? '' : 'disabled ')
    + 'style="width:100%;height:36px;display:flex;align-items:center;justify-content:center;gap:7px;background:' + (hasSelected ? '#0f172a' : 'var(--bg)') + ';color:' + (hasSelected ? '#fff' : 'var(--faint)') + ';border:1px solid ' + (hasSelected ? '#0f172a' : 'var(--border)') + ';border-radius:8px;font-size:12px;font-weight:600;cursor:' + (hasSelected ? 'pointer' : 'not-allowed') + ';font-family:inherit;transition:opacity .13s" '
    + (hasSelected ? 'onmouseover="this.style.opacity=\'.85\'" onmouseout="this.style.opacity=\'1\'"' : '')
    + '>'
    + MERGE_ICO
    + 'Save and Distribute'
    + '</button>'
    + (_noCampaign ? '<div style="text-align:center;font-size:9px;color:var(--faint);margin-top:5px;line-height:1.3">No campaign associated to this analysis yet</div>' : '')
    + '<div style="text-align:center;margin-top:6px"><button onclick="mp2OpenDistributeModal()" style="background:none;border:none;padding:0;font-size:10px;color:var(--muted);cursor:pointer;font-family:inherit;text-decoration:underline;text-underline-offset:2px" onmouseover="this.style.color=\'var(--text)\'" onmouseout="this.style.color=\'var(--muted)\'">save and distribute temp modal</button></div>'
    + '</div>';

  var header = '<div style="flex-shrink:0;padding:16px 16px 10px"><div style="font-size:12px;font-weight:600;color:var(--text)">Saved Moments Groups</div></div>';

  if (_mp2CurrentAnalysisPlans.length === 0) {
    zone.innerHTML = header
      + '<div style="flex:1;overflow-y:auto;padding:0 16px 16px;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--faint);font-size:12px">No saved media plans yet</div>'
      + distributeBtn;
    return;
  }

  zone.innerHTML = header
    + '<div style="flex:1;overflow-y:auto;padding:0 12px 8px;display:flex;flex-direction:column;gap:6px">'
    + _mp2CurrentAnalysisPlans.map(function(mp, i) {
        var isNew      = (i === highlightIdx);
        var isSelected = (i === _mp2DistributePlanIdx);
        var bgNew      = isNew ? 'var(--accent-light)' : 'var(--bg)';
        var borderNew  = isNew ? 'var(--accent)' : (isSelected ? '#0f172a' : 'var(--border)');

        // Use _dbRaw moments for accurate stats (UI format loses some fields)
        var srcMoments = (mp._dbRaw && mp._dbRaw.moments) ? mp._dbRaw.moments : (mp.moments || []);
        var momCount = srcMoments.length;
        var totalImpr = srcMoments.reduce(function(s, m) { return s + (Number(m.moment_est_impr) || 0); }, 0);
        var totalDollar = srcMoments.reduce(function(s, m) { return s + (Number(m.moment_est_dollar_value) || 0); }, 0);
        var fmtImprCard = totalImpr >= 1000000 ? (totalImpr / 1000000).toFixed(1) + 'M'
          : totalImpr >= 1000 ? Math.round(totalImpr / 1000) + 'K' : '';
        var fmtDollar = totalDollar >= 1000000 ? '$' + (totalDollar / 1000000).toFixed(1) + 'M'
          : totalDollar >= 1000 ? '$' + Math.round(totalDollar / 1000) + 'K'
          : totalDollar ? '$' + totalDollar : '';
        var statsStr = momCount + ' moment' + (momCount !== 1 ? 's' : '')
          + (fmtImprCard ? ' · ' + fmtImprCard + ' imp.' : '')
          + (fmtDollar   ? ' · ' + fmtDollar : '');

        return '<div'
          + ' id="mp2-strip-plan-' + i + '"'
          + (isNew ? ' data-new="1"' : '')
          + ' style="position:relative;padding:9px 10px;background:' + bgNew + ';border:1px solid ' + borderNew + ';border-radius:8px;cursor:pointer;transition:background .13s,border-color .13s"'
          + ' onclick="mp2SelectDistributePlan(' + i + ')"'
          + ' onmouseenter="this.style.background=\'var(--surface)\';this.querySelectorAll(\'.mp2-hover-btn\').forEach(function(b){b.style.opacity=\'1\'})" onmouseleave="this.style.background=\'' + bgNew + '\';this.querySelectorAll(\'.mp2-hover-btn\').forEach(function(b){b.style.opacity=\'0\'})">'

          // × delete button (rightmost)
          + '<button class="mp2-hover-btn mp2-x-btn" onclick="mp2DeleteAnalysisPlan(' + i + ',event)" title="Delete"'
          +   ' style="position:absolute;top:5px;right:5px;border:none;background:none;cursor:pointer;color:var(--faint);font-size:14px;line-height:1;padding:1px 3px;opacity:0;transition:opacity .12s,color .12s;font-family:inherit"'
          +   ' onmouseenter="this.style.color=\'var(--text)\'" onmouseleave="this.style.color=\'var(--faint)\'">×</button>'

          // 👁 eye button (left of ×)
          + '<button class="mp2-hover-btn mp2-eye-btn" onclick="mp2OpenPlanDetailModal(' + i + ',event)" title="View details"'
          +   ' style="position:absolute;top:5px;right:24px;border:none;background:none;cursor:pointer;color:var(--faint);display:flex;align-items:center;justify-content:center;width:18px;height:18px;padding:0;opacity:0;transition:opacity .12s,color .12s"'
          +   ' onmouseenter="this.style.color=\'var(--text)\'" onmouseleave="this.style.color=\'var(--faint)\'">'+EYE_ICO+'</button>'

          // plan name
          + '<div style="font-size:11px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:40px;margin-bottom:3px">' + mp.name + '</div>'
          // stats
          + '<div style="font-size:10px;color:var(--faint);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + statsStr + '</div>'
          // badges row
          + '<div style="display:flex;align-items:center;gap:5px;margin-top:4px">'
          +   (isNew ? '<span style="font-size:9px;font-weight:600;color:var(--accent);background:var(--accent-light);border:1px solid var(--accent-muted);border-radius:20px;padding:1px 6px">New</span>' : '')
          +   (isSelected ? '<span style="display:inline-flex;align-items:center;gap:3px;font-size:9px;font-weight:600;color:#fff;background:#0f172a;border-radius:20px;padding:2px 6px">' + CHECK_ICO + 'Selected</span>' : '')
          + '</div>'
          + '</div>';
      }).join('')
    + '</div>'
    + distributeBtn;

  // Fade highlight after 2s
  if (highlightIdx !== undefined) {
    setTimeout(function() {
      var card = document.getElementById('mp2-strip-plan-' + highlightIdx);
      if (card && card.dataset.new) {
        card.style.background   = _mp2DistributePlanIdx === highlightIdx ? 'var(--bg)' : 'var(--bg)';
        card.style.borderColor  = _mp2DistributePlanIdx === highlightIdx ? '#0f172a' : 'var(--border)';
        var newBadge = card.querySelector('span[style*="accent"]');
        if (newBadge) newBadge.style.opacity = '0';
      }
    }, 2000);
  }
}

function mp2RenderAIPlansPanel(highlightIdx) {
  var panel = document.getElementById('tx2-home-panel-plans');
  if (!panel) return;

  if (savedMediaPlansV2.length === 0) {
    panel.innerHTML = '<div style="padding:40px 0;text-align:center;color:var(--faint);font-size:12px">No saved media plans yet.</div>';
    return;
  }

  panel.innerHTML = savedMediaPlansV2.map(function(mp, i) {
    var isNew = (i === highlightIdx);
    var inputIco =
      mp.inputType === 'video'
        ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M11 7l4-2v6l-4-2V7z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>'
        : mp.inputType === 'document'
        ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 2h5l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 2v3h3M5 8h6M5 11h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
    var momentsCount = mp.source === 'ai'
      ? (mp.moments || []).length
      : (mp.programs || []).length + (mp.episodes || []).length;
    var cpmStr = mp.avgCpm ? ' &nbsp;·&nbsp; Avg. CPM ' + mp.avgCpm : (mp.dollars ? ' &nbsp;·&nbsp; ' + mp.dollars : '');
    return '<div id="mp2-ai-plan-card-' + i + '" class="tx2-lib-row" onclick="mp2ShowMediaPlanDetail(' + i + ')" style="align-items:center;transition:background .4s,border-color .4s' + (isNew ? ';background:var(--accent-light);border-left:3px solid var(--accent)' : '') + '">'
      + '<div class="tx2-lib-icon" style="flex-shrink:0">' + inputIco + '</div>'
      + '<div style="flex:1;min-width:0">'
      +   '<div style="font-size:12px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + mp.name + '</div>'
      +   '<div style="font-size:11px;color:var(--faint);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'
      +     mp.date
      +     (mp.author ? ' &nbsp;·&nbsp; ' + mp.author : '')
      +     (mp.impressions ? ' &nbsp;·&nbsp; ' + mp.impressions + ' imp.' : '')
      +     cpmStr
      +     ' &nbsp;·&nbsp; Moments: ' + momentsCount
      +   '</div>'
      + '</div>'
      + (isNew ? '<span style="font-size:10px;font-weight:600;color:var(--accent);background:var(--accent-light);border:1px solid var(--accent-muted);border-radius:20px;padding:2px 8px;flex-shrink:0">New</span>' : '')
      + '</div>';
  }).join('');

  // Fade out highlight after 1.8s
  if (highlightIdx !== undefined) {
    setTimeout(function() {
      var card = document.getElementById('mp2-ai-plan-card-' + highlightIdx);
      if (card) {
        card.style.background = '';
        card.style.borderLeft = '';
        var badge = card.querySelector('span[style*="New"]');
        if (badge) badge.style.opacity = '0';
      }
    }, 1800);
  }
  mp2FixAiPanelHeight();
}

function aiAddMoreFromInventory() {
  // Match suggestions to INV_PROGRAMS by title prefix
  _aiSuggestions.forEach(function(s) {
    var showKey = s.show.split(' — ')[0].toLowerCase();
    INV_PROGRAMS.forEach(function(p) {
      if (p.title.toLowerCase().indexOf(showKey) === 0 || showKey.indexOf(p.title.split(' — ')[0].toLowerCase()) === 0) {
        invSelected[p.id] = true;
      }
    });
  });
  invMediaPlanVisible = true;
  mp2SubTab('moments');
}

function csTx2GenerateAIMediaPlan() {
  var panel = document.getElementById('tx2-sub-content-ai-media-plan');
  if (!panel) return;
  panel.innerHTML =
    '<div style="display:flex;flex-direction:column;flex:1;min-height:0;padding:10px">'
    + '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:14px;background:var(--surface);border-radius:10px;border:1px solid var(--border)">'
    + '<div style="width:36px;height:36px;border:3px solid var(--border);border-top-color:#e11d8f;border-radius:50%;animation:cs-spin .7s linear infinite"></div>'
    + '<div style="font-size:12px;color:var(--muted)">Generating your AI media plan…</div>'
    + '</div>'
    + '</div>';
  setTimeout(function() {
    aiInitPlanVariantsFromAPI();   // load/refresh from MOCK_AI_MEDIA_PLANS
    aiRenderResultsPanel();
  }, 1800);
}


var invCurrentView      = 'gallery';
var invSelected         = {};
var invSelectedEpisodes = {};   // keyed by epId, value: { show, episode, channel, scene, imgSeed }
var inv2FilterChannels   = [];
var inv2FilterCategories = [];
var inv2FilterDayparts   = [];
var inv2FilterScore      = 0;
var inv2FilterPanelOpen  = false;
var inv2MediaPlanVisible = false;
var inv2AccordionOpen    = { channel: false, category: false, daypart: false, score: true };

function inv2GetFiltered() {
  return INV_PROGRAMS_V2.filter(function(p) {
    if (inv2FilterChannels.length   > 0 && inv2FilterChannels.indexOf(p.channel)   < 0) return false;
    if (inv2FilterCategories.length > 0 && inv2FilterCategories.indexOf(p.category) < 0) return false;
    if (inv2FilterDayparts.length   > 0 && inv2FilterDayparts.indexOf(p.daypart)    < 0) return false;
    if (p.match < inv2FilterScore) return false;
    return true;
  });
}

// ── Filter panel ──

// Returns the correct filter panel element depending on context.
// In drill-down mode the panel has id="inv-drill-filter-panel" to avoid
// colliding with the pods sub-tab's "inv-filter-panel" which lives in
// the same DOM tree and would otherwise be returned first by getElementById.
function inv2GetFilterPanel() {
  if (document.getElementById('tx-drill-table-wrap')) {
    return document.getElementById('inv-drill-filter-panel') || document.getElementById('inv-filter-panel');
  }
  return document.getElementById('inv-filter-panel');
}

function inv2ToggleFilterPanel() {
  if (inv2FilterPanelOpen) { inv2CloseFilterPanel(); } else { inv2OpenFilterPanel(); }
}

function inv2OpenFilterPanel() {
  inv2FilterPanelOpen = true;
  var panel = inv2GetFilterPanel();
  if (!panel) return;
  inv2BuildFilterPanel();
  var btn = document.getElementById('inv-filter-btn');

  // In drill-down mode, overflow on ancestors clips position:absolute panels.
  // Move the panel to document.body with position:fixed anchored to the button.
  if (document.getElementById('tx-drill-table-wrap')) {
    var r = btn ? btn.getBoundingClientRect() : { bottom: 60, right: window.innerWidth };
    panel.style.position = 'fixed';
    panel.style.top      = (r.bottom + 4) + 'px';
    panel.style.right    = (window.innerWidth - r.right) + 'px';
    panel.style.left     = 'auto';
    panel.style.maxHeight = (window.innerHeight - r.bottom - 20) + 'px';
    document.body.appendChild(panel);
  }

  panel.style.display = 'flex';
  setTimeout(function() {
    document.addEventListener('click', function _outside(e) {
      if (panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) {
        inv2CloseFilterPanel();
        document.removeEventListener('click', _outside);
      }
    });
  }, 0);
}

function inv2CloseFilterPanel() {
  inv2FilterPanelOpen = false;
  var panel = inv2GetFilterPanel();
  if (panel) panel.style.display = 'none';
}

function inv2BuildFilterPanel() {
  var panel = inv2GetFilterPanel();
  if (!panel) return;
  var channels   = INV_PROGRAMS_V2.map(function(p){ return p.channel; }).filter(function(v,i,a){ return a.indexOf(v)===i; });
  var categories = INV_PROGRAMS_V2.map(function(p){ return p.category; }).filter(function(v,i,a){ return a.indexOf(v)===i; });
  var dayparts   = INV_PROGRAMS_V2.map(function(p){ return p.daypart; }).filter(function(v,i,a){ return a.indexOf(v)===i; });
  var totalActive = inv2FilterChannels.length + inv2FilterCategories.length + inv2FilterDayparts.length + (inv2FilterScore > 0 ? 1 : 0);

  function accSection(key, label, bodyHtml) {
    var open = !!inv2AccordionOpen[key];
    return '<div class="inv-fp-acc">'
      + '<div class="inv-fp-acc-hdr" onclick="inv2ToggleAccordion(\'' + key + '\')">'
      +   '<span>' + label + '</span>'
      +   '<svg class="inv-fp-chevron' + (open ? ' open' : '') + '" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '</div>'
      + '<div id="inv-fp-body-' + key + '" style="' + (open ? '' : 'display:none') + '">'
      +   bodyHtml
      + '</div>'
      + '</div>';
  }

  var channelBody =
    '<input class="inv-fp-search" placeholder="Search…" oninput="inv2FpSearch(this,\'channel\')">'
    + '<div id="inv-fp-opts-channel">'
    + channels.map(function(c) {
        return '<label class="inv-fp-opt"><input type="checkbox"' + (inv2FilterChannels.indexOf(c)>=0?' checked':'') + ' onchange="inv2ToggleFilterCheckbox(\'channel\',\'' + c + '\',this.checked)"><span>' + c + '</span></label>';
      }).join('')
    + '</div>';

  var categoryBody =
    '<input class="inv-fp-search" placeholder="Search…" oninput="inv2FpSearch(this,\'category\')">'
    + '<div id="inv-fp-opts-category">'
    + categories.map(function(c) {
        return '<label class="inv-fp-opt"><input type="checkbox"' + (inv2FilterCategories.indexOf(c)>=0?' checked':'') + ' onchange="inv2ToggleFilterCheckbox(\'category\',\'' + c + '\',this.checked)"><span>' + c + '</span></label>';
      }).join('')
    + '</div>';

  var daypartBody =
    '<div id="inv-fp-opts-daypart">'
    + dayparts.map(function(d) {
        return '<label class="inv-fp-opt"><input type="checkbox"' + (inv2FilterDayparts.indexOf(d)>=0?' checked':'') + ' onchange="inv2ToggleFilterCheckbox(\'daypart\',\'' + d + '\',this.checked)"><span>' + d + '</span></label>';
      }).join('')
    + '</div>';

  var scoreBody =
    '<div style="padding:4px 0 10px">'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:10px">'
    +   '<span style="font-size:11px;color:var(--muted)">Minimum match score</span>'
    +   '<span id="inv-fp-score-val" style="font-size:11px;font-weight:600;color:var(--text)">' + (inv2FilterScore > 0 ? inv2FilterScore + '%' : '—') + '</span>'
    + '</div>'
    + '<input type="range" min="0" max="100" value="' + inv2FilterScore + '" style="width:100%;accent-color:var(--accent)" oninput="document.getElementById(\'inv-fp-score-val\').textContent=this.value>0?this.value+\'%\':\'—\'" onchange="inv2ToggleFilterCheckbox(\'score\',this.value,true)">'
    + '<div style="display:flex;justify-content:space-between;margin-top:4px"><span style="font-size:10px;color:var(--faint)">0%</span><span style="font-size:10px;color:var(--faint)">100%</span></div>'
    + '</div>';

  panel.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-shrink:0">'
    +   '<span style="font-size:13px;font-weight:600;color:var(--text)">Filters</span>'
    +   '<div style="display:flex;gap:10px;align-items:center">'
    +     (totalActive > 0 ? '<span style="font-size:11px;color:var(--faint);cursor:pointer" onclick="inv2ClearAllFilters()">Clear all</span>' : '')
    +     '<button onclick="inv2CloseFilterPanel()" style="background:none;border:none;cursor:pointer;color:var(--faint);font-size:20px;line-height:1;padding:0 2px">×</button>'
    +   '</div>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;min-height:0">'
    +   accSection('channel',  'Channel',  channelBody)
    +   accSection('category', 'Category', categoryBody)
    +   accSection('daypart',  'Daypart',  daypartBody)
    +   accSection('score',    'Min Score', scoreBody)
    + '</div>';
}

function inv2ToggleAccordion(key) {
  inv2AccordionOpen[key] = !inv2AccordionOpen[key];
  var body = document.getElementById('inv-fp-body-' + key);
  if (body) {
    body.style.display = inv2AccordionOpen[key] ? '' : 'none';
    var hdr = body.previousElementSibling;
    if (hdr) {
      var chev = hdr.querySelector('.inv-fp-chevron');
      if (chev) chev.classList.toggle('open', inv2AccordionOpen[key]);
    }
  }
}

function inv2FpSearch(input, type) {
  var q = input.value.toLowerCase();
  var opts = document.querySelectorAll('#inv-fp-opts-' + type + ' .inv-fp-opt');
  opts.forEach(function(opt) {
    var txt = opt.querySelector('span').textContent.toLowerCase();
    opt.style.display = txt.indexOf(q) >= 0 ? '' : 'none';
  });
}

function inv2ToggleFilterCheckbox(type, val, checked) {
  if (type === 'channel') {
    if (checked && inv2FilterChannels.indexOf(val) < 0) inv2FilterChannels.push(val);
    else if (!checked) inv2FilterChannels = inv2FilterChannels.filter(function(v){ return v !== val; });
  } else if (type === 'category') {
    if (checked && inv2FilterCategories.indexOf(val) < 0) inv2FilterCategories.push(val);
    else if (!checked) inv2FilterCategories = inv2FilterCategories.filter(function(v){ return v !== val; });
  } else if (type === 'daypart') {
    if (checked && inv2FilterDayparts.indexOf(val) < 0) inv2FilterDayparts.push(val);
    else if (!checked) inv2FilterDayparts = inv2FilterDayparts.filter(function(v){ return v !== val; });
  } else if (type === 'score') {
    inv2FilterScore = parseInt(val) || 0;
  }
  inv2UpdateFilterBar();
  inv2RenderInventory();
}

function inv2RemoveFilterChip(type, val) {
  if (type === 'channel')  inv2FilterChannels   = inv2FilterChannels.filter(function(v){ return v !== val; });
  if (type === 'category') inv2FilterCategories = inv2FilterCategories.filter(function(v){ return v !== val; });
  if (type === 'daypart')  inv2FilterDayparts   = inv2FilterDayparts.filter(function(v){ return v !== val; });
  if (type === 'score')    inv2FilterScore      = 0;
  inv2UpdateFilterBar();
  inv2RenderInventory();
  if (inv2FilterPanelOpen) inv2BuildFilterPanel();
}

function inv2ClearAllFilters() {
  inv2FilterChannels = []; inv2FilterCategories = []; inv2FilterDayparts = []; inv2FilterScore = 0;
  inv2UpdateFilterBar();
  inv2RenderInventory();
  if (inv2FilterPanelOpen) inv2BuildFilterPanel();
}

function inv2UpdateFilterBar() {
  var totalActive = inv2FilterChannels.length + inv2FilterCategories.length + inv2FilterDayparts.length + (inv2FilterScore > 0 ? 1 : 0);
  var badge = document.getElementById('inv-filter-badge');
  if (badge) { badge.textContent = totalActive; badge.style.display = totalActive > 0 ? 'flex' : 'none'; }
  var chips = document.getElementById('inv-filter-chips');
  if (!chips) return;

  var allChips = []
    .concat(inv2FilterChannels.map(function(v)  { return { label: v,              action: 'inv2RemoveFilterChip(\'channel\',\'' + v + '\')' }; }))
    .concat(inv2FilterCategories.map(function(v) { return { label: v,              action: 'inv2RemoveFilterChip(\'category\',\'' + v + '\')' }; }))
    .concat(inv2FilterDayparts.map(function(v)   { return { label: v,              action: 'inv2RemoveFilterChip(\'daypart\',\'' + v + '\')' }; }))
    .concat(inv2FilterScore > 0                  ? [{ label: '≥' + inv2FilterScore + '%', action: 'inv2RemoveFilterChip(\'score\',\'\')' }] : []);

  var MAX = 3;
  var visible = allChips.slice(0, MAX);
  var overflow = allChips.length - visible.length;

  chips.innerHTML =
    visible.map(function(c) {
      return '<span class="inv-chip">' + c.label + ' <span onclick="' + c.action + '" style="cursor:pointer">×</span></span>';
    }).join('')
    + (overflow > 0 ? '<span class="inv-chip" style="cursor:default;color:var(--muted)">+' + overflow + ' more</span>' : '');
}

function inv2RenderFilters() {
  var wrap = document.getElementById('inv-filters-wrap');
  if (!wrap) return;
  wrap.innerHTML =
    // Left: filter button + chips
    '<button id="inv-filter-btn" onclick="inv2ToggleFilterPanel()" style="display:flex;align-items:center;gap:6px;padding:5px 10px;border:1px solid var(--border);border-radius:7px;background:var(--surface);color:var(--muted);cursor:pointer;font-size:12px;flex-shrink:0;position:relative">'
    +   '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
    +   'Filters'
    +   '<span id="inv-filter-badge" style="display:none;position:absolute;top:-5px;right:-5px;width:16px;height:16px;background:var(--accent);color:#fff;border-radius:50%;font-size:9px;font-weight:700;align-items:center;justify-content:center">0</span>'
    + '</button>'
    + '<div id="inv-filter-chips" style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;flex:1"></div>'
    // Right: view toggles + media plan icon
    + '<div style="display:flex;gap:4px;flex-shrink:0">'
    +   '<button id="inv-view-gallery" class="inv-view-btn inv-view-btn--act" onclick="inv2ToggleView(\'gallery\')" title="Gallery view">'
    +     '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/></svg>'
    +   '</button>'
    +   '<button id="inv-view-table" class="inv-view-btn" onclick="inv2ToggleView(\'table\')" title="Table view">'
    +     '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
    +   '</button>'
    +   '<div style="width:1px;background:var(--border);margin:2px 2px"></div>'
    +   '<button id="inv-mp-btn" class="inv-view-btn" onclick="inv2ToggleMediaPlan()" title="Media Plan">'
    +     '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M4 5h6M4 7.5h4M4 10h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
    +   '</button>'
    + '</div>';
}

function inv2ToggleView(mode) {
  invCurrentView = mode;
  var gBtn = document.getElementById('inv-view-gallery');
  var tBtn = document.getElementById('inv-view-table');
  if (gBtn) gBtn.className = 'inv-view-btn' + (mode === 'gallery' ? ' inv-view-btn--act' : '');
  if (tBtn) tBtn.className = 'inv-view-btn' + (mode === 'table'   ? ' inv-view-btn--act' : '');
  inv2RenderInventory();
}

function inv2ToggleMediaPlan() {
  inv2MediaPlanVisible = !inv2MediaPlanVisible;
  var mpBtn = document.getElementById('inv-mp-btn');
  if (mpBtn) mpBtn.className = 'inv-view-btn' + (inv2MediaPlanVisible ? ' inv-view-btn--act' : '');
  inv2RenderMediaPlan();
}

function inv2ToggleSelect(id) {
  if (invSelected[id]) { delete invSelected[id]; } else { invSelected[id] = true; }
  var el = document.getElementById('inv-item-' + id);
  if (el) el.classList.toggle('inv-item--sel', !!invSelected[id]);
  var cb = document.getElementById('inv-cb-' + id);
  if (cb) cb.checked = !!invSelected[id];
  // auto-open media plan on first selection
  var anySelected = Object.keys(invSelected).length > 0;
  if (anySelected && !inv2MediaPlanVisible) { inv2MediaPlanVisible = true; }
  inv2RenderMediaPlan();
}

function inv2ClearSelection() {
  invSelected = {};
  invSelectedEpisodes = {};
  document.querySelectorAll('.inv-item--sel').forEach(function(el){ el.classList.remove('inv-item--sel'); });
  document.querySelectorAll('[id^="inv-cb-"]').forEach(function(cb){ cb.checked = false; });
  document.querySelectorAll('[id^="inv-ep-cb-"]').forEach(function(cb){ cb.checked = false; });
  inv2RenderMediaPlan();
}

function inv2ToggleSelectEpisode(epId, show, episode, channel, scene, imgSeed, impressionsNum) {
  if (invSelectedEpisodes[epId]) {
    delete invSelectedEpisodes[epId];
  } else {
    invSelectedEpisodes[epId] = { show: show, episode: episode, channel: channel, scene: scene, imgSeed: imgSeed, impressionsNum: impressionsNum || 0 };
    if (!inv2MediaPlanVisible) inv2MediaPlanVisible = true;
  }
  var cb = document.getElementById('inv-ep-cb-' + epId);
  if (cb) cb.checked = !!invSelectedEpisodes[epId];
  inv2RenderMediaPlan();
}

function inv2RenderMediaPlan() {
  var panel = document.getElementById('inv-media-plan');
  if (!panel) return;
  // update mp button state
  var mpBtn = document.getElementById('inv-mp-btn');
  if (mpBtn) mpBtn.className = 'inv-view-btn' + (inv2MediaPlanVisible ? ' inv-view-btn--act' : '');
  if (!inv2MediaPlanVisible) { panel.style.display = 'none'; return; }
  panel.style.display = 'flex';
  var selPrograms = INV_PROGRAMS_V2.filter(function(p){ return invSelected[p.id]; });
  var selEpKeys   = Object.keys(invSelectedEpisodes);
  var totalItems  = selPrograms.length + selEpKeys.length;
  if (totalItems === 0) {
    panel.innerHTML =
      '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:12px;flex-shrink:0">Media Plan</div>'
      + '<div style="flex:1;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--faint);font-size:12px;padding:20px">Select shows or episodes to build your media plan</div>';
    return;
  }
  var totalImp = selPrograms.reduce(function(s,p){ return s + p.impressionsNum; }, 0)
              + selEpKeys.reduce(function(s,k){ return s + (invSelectedEpisodes[k].impressionsNum || 0); }, 0);
  var totalDollars = selPrograms.reduce(function(s,p){ return s + p.impressionsNum * 1000 * ({'Prime Time':25,'Daytime':15,'Late Night':18,'Morning':12,'Early Fringe':20}[p.daypart] || 20); }, 0)
                   + selEpKeys.reduce(function(s,k){ return s + (invSelectedEpisodes[k].impressionsNum || 0) * 1000 * 20; }, 0);
  panel.innerHTML =
    '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">'
    +   '<span>Media Plan <span style="font-size:10px;background:var(--accent);color:#fff;border-radius:20px;padding:1px 7px;margin-left:4px">' + totalItems + '</span></span>'
    +   '<span style="font-size:10px;color:var(--faint);cursor:pointer;font-weight:400" onclick="inv2ClearSelection()">Clear all</span>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;min-height:0;display:flex;flex-direction:column;gap:7px">'
    + selPrograms.map(function(p){
        var idx = INV_PROGRAMS_V2.indexOf(p);
        var seed = 'tvshow' + (idx + 1);
        var parts = p.title.split(' — ');
        var showName = parts[0];
        var epLabel  = parts[1] || '';
        var meta = [epLabel, p.impressionsLabel ? p.impressionsLabel + ' imp.' : '', inv2EstDollars(p.impressionsNum, p.daypart)].filter(Boolean).join(' · ');
        return '<div style="display:flex;gap:8px;align-items:center;padding:8px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">'
          + '<div style="width:38px;height:22px;border-radius:3px;overflow:hidden;flex-shrink:0">'
          +   '<img src="https://picsum.photos/seed/' + seed + '/640/360" style="width:100%;height:100%;object-fit:cover">'
          + '</div>'
          + '<div style="flex:1;min-width:0">'
          +   '<div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + showName + '</div>'
          +   '<div style="font-size:10px;color:var(--faint);margin-top:1px">' + meta + '</div>'
          + '</div>'
          + '<span style="font-size:14px;color:var(--faint);cursor:pointer;flex-shrink:0;line-height:1" onclick="inv2ToggleSelect(' + p.id + ')">×</span>'
          + '</div>';
      }).join('')
    + selEpKeys.map(function(epId){
        var ep = invSelectedEpisodes[epId];
        var meta = [ep.episode, ep.channel, ep.impressionsNum ? inv2FmtDollars(ep.impressionsNum * 1000 * 20) : ''].filter(Boolean).join(' · ');
        return '<div style="display:flex;gap:8px;align-items:center;padding:8px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">'
          + '<div style="width:38px;height:22px;border-radius:3px;overflow:hidden;flex-shrink:0">'
          +   '<img src="https://picsum.photos/seed/' + ep.imgSeed + '/128/72" style="width:100%;height:100%;object-fit:cover">'
          + '</div>'
          + '<div style="flex:1;min-width:0">'
          +   '<div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + ep.show + '</div>'
          +   '<div style="font-size:10px;color:var(--faint);margin-top:1px">' + meta + '</div>'
          + '</div>'
          + '<span style="font-size:14px;color:var(--faint);cursor:pointer;flex-shrink:0;line-height:1" onclick="inv2ToggleSelectEpisode(\'' + epId.replace(/'/g,"\\'") + '\')">×</span>'
          + '</div>';
      }).join('')
    + '</div>'
    + '<div style="border-top:1px solid var(--border);padding-top:11px;margin-top:8px;flex-shrink:0">'
    +   '<div style="display:flex;justify-content:space-between;margin-bottom:5px">'
    +     '<span style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">Total Items</span>'
    +     '<span style="font-size:13px;font-weight:700;color:var(--text)">' + totalItems + '</span>'
    +   '</div>'
    + (totalImp > 0
        ? '<div style="display:flex;justify-content:space-between;margin-bottom:4px">'
          +   '<span style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">Est. Impressions</span>'
          +   '<span style="font-size:12px;font-weight:700;color:var(--text)">' + (totalImp >= 1 ? totalImp.toFixed(1) + 'M' : Math.round(totalImp * 1000) + 'K') + '</span>'
          + '</div>'
        : '')
    + (totalDollars > 0
        ? '<div style="display:flex;justify-content:space-between">'
          +   '<span style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">Est. Dollars</span>'
          +   '<span style="font-size:12px;font-weight:700;color:var(--accent)">' + inv2FmtDollars(totalDollars) + '</span>'
          + '</div>'
        : '')
    + '</div>'
    // ── Save box ──
    + '<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:8px;flex-shrink:0">'
    +   '<div style="display:flex;gap:6px">'
    +     '<input id="inv-mp-save-name" type="text" placeholder="Plan name…"'
    +       ' style="flex:1;min-width:0;height:30px;border:1px solid var(--border-md);border-radius:6px;padding:0 9px;font-size:12px;font-family:inherit;color:var(--text);background:var(--bg);outline:none"/>'
    +     '<button onclick="inv2SaveMediaPlan()"'
    +       ' style="height:30px;padding:0 11px;border-radius:6px;border:none;background:var(--accent);color:#fff;font-size:12px;font-weight:500;cursor:pointer;flex-shrink:0;font-family:inherit">Save</button>'
    +   '</div>'
    + '</div>';
}

function inv2SaveMediaPlan() {
  var selPrograms = INV_PROGRAMS_V2.filter(function(p){ return invSelected[p.id]; });
  var selEpKeys   = Object.keys(invSelectedEpisodes);
  var totalItems  = selPrograms.length + selEpKeys.length;
  if (totalItems === 0) return;
  var nameInput = document.getElementById('mp2-plan-name-input') || document.getElementById('inv-mp-save-name');
  var planName  = (nameInput && nameInput.value.trim()) || ('Media Plan ' + (savedMediaPlansV2.length + 1));
  var now       = new Date();
  var dateStr   = now.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()] + ' ' + now.getFullYear();
  var CPM_MAP = { 'Prime Time': 25, 'Daytime': 15, 'Late Night': 18, 'Morning': 12, 'Early Fringe': 20 };
  var totalImp     = selPrograms.reduce(function(s,p){ return s + p.impressionsNum; }, 0)
                   + selEpKeys.reduce(function(s,k){ return s + (invSelectedEpisodes[k].impressionsNum || 0); }, 0);
  var totalDollars = selPrograms.reduce(function(s,p){ return s + p.impressionsNum * 1000 * (CPM_MAP[p.daypart] || 20); }, 0)
                   + selEpKeys.reduce(function(s,k){ return s + (invSelectedEpisodes[k].impressionsNum || 0) * 1000 * 20; }, 0);
  var unEl = document.getElementById('un');
  var author = unEl ? unEl.textContent.trim() : 'Product';
  savedMediaPlansV2.push({
    name:        planName,
    date:        dateStr,
    author:      author,
    programs:    selPrograms.map(function(p){ return { title: p.title.split(' — ')[0], channel: p.channel, impressionsLabel: p.impressionsLabel, id: p.id, impressionsNum: p.impressionsNum, daypart: p.daypart }; }),
    episodes:    selEpKeys.map(function(k){ return invSelectedEpisodes[k]; }),
    totalItems:  totalItems,
    impressions: totalImp > 0 ? (totalImp >= 1 ? totalImp.toFixed(1) + 'M' : Math.round(totalImp * 1000) + 'K') : null,
    dollars:     totalDollars > 0 ? inv2FmtDollars(totalDollars) : null
  });
  if (nameInput) nameInput.value = '';
  // Flash confirm
  var btn = document.querySelector('#inv-media-plan button[onclick="inv2SaveMediaPlan()"]');
  if (btn) { btn.textContent = '✓'; setTimeout(function(){ btn.textContent = 'Save'; }, 1200); }
}

function inv2ShowMomentsModal(id) {
  var prog = INV_PROGRAMS_V2.filter(function(p){ return p.id === id; })[0];
  if (!prog) return;
  var modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2000;display:flex;align-items:center;justify-content:center';
  modal.onclick = function(e){ if (e.target === modal) modal.remove(); };
  modal.innerHTML =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:24px;width:460px;max-width:90vw;max-height:75vh;display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(0,0,0,.18)">'
    + '<div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:18px;flex-shrink:0">'
    +   '<div>'
    +     '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:2px">' + prog.title + '</div>'
    +     '<div style="font-size:11px;color:var(--faint)">' + prog.moments.length + ' matched moments</div>'
    +   '</div>'
    +   '<button onclick="this.closest(\'[style*=fixed]\').remove()" style="background:none;border:none;cursor:pointer;color:var(--faint);font-size:20px;line-height:1;padding:0 4px">×</button>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;min-height:0;display:flex;flex-direction:column;gap:9px">'
    + prog.moments.map(function(m){
        var c = m.score >= 85 ? '#16a34a' : m.score >= 70 ? '#d97706' : 'var(--accent)';
        return '<div style="display:flex;align-items:center;gap:12px">'
          + '<div style="flex:1;font-size:12px;color:var(--text);font-weight:500">' + m.label + '</div>'
          + '<div style="width:110px;height:5px;background:var(--bg);border-radius:3px;overflow:hidden">'
          +   '<div style="height:100%;width:' + m.score + '%;background:' + c + ';border-radius:3px"></div>'
          + '</div>'
          + '<div style="font-size:12px;font-weight:600;color:' + c + ';min-width:28px;text-align:right">' + m.score + '</div>'
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>';
  document.body.appendChild(modal);
}

function inv2ScoreColor(s)  { return s >= 90 ? '#16a34a' : s >= 80 ? '#d97706' : s >= 70 ? 'var(--accent)' : 'var(--faint)'; }
function inv2ScoreBg(s)     { return s >= 90 ? '#f0fdf4' : s >= 80 ? '#fffbeb' : s >= 70 ? '#eff6ff' : '#f8f8f8'; }
function inv2ScoreBorder(s) { return s >= 90 ? '#bbf7d0' : s >= 80 ? '#fde68a' : s >= 70 ? '#bfdbfe' : '#e5e5e5'; }

function inv2FmtDollars(d) {
  if (d >= 1000000) return '$' + (d / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  return '$' + Math.round(d / 1000) + 'K';
}
function inv2EstDollars(impressionsNum, daypart) {
  var CPM = { 'Prime Time': 25, 'Daytime': 15, 'Late Night': 18, 'Morning': 12, 'Early Fringe': 20 };
  var cpm = CPM[daypart] || 20;
  return inv2FmtDollars(impressionsNum * 1000 * cpm);
}

function inv2RenderInventory() {
  if (document.getElementById('tx-drill-table-wrap')) {
    if (typeof txRefreshDrillDownTable === 'function') txRefreshDrillDownTable();
    return;
  }
  var wrap = document.getElementById('inv-content-wrap');
  if (!wrap) return;
  var progs = inv2GetFiltered();
  var TH = 'padding:9px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);border-bottom:1px solid var(--border);text-align:left';
  var TD = 'padding:10px 12px;font-size:12px;color:var(--text);border-bottom:1px solid var(--border-md);vertical-align:middle';

  if (progs.length === 0) {
    wrap.innerHTML = '<div style="padding:40px;text-align:center;color:var(--faint);font-size:13px">No programs match the current filters.</div>';
    return;
  }

  if (invCurrentView === 'gallery') {
    wrap.innerHTML =
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding-bottom:8px">'
      + progs.map(function(p) {
          var idx  = INV_PROGRAMS_V2.indexOf(p);
          var seed = 'tvshow' + (idx + 1);
          var sel  = !!invSelected[p.id];
          var previewMoments = p.moments.slice(0, 2).map(function(m){
            return '<span style="font-size:10px;background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:2px 7px;color:var(--muted)">' + m.label + '</span>';
          }).join('');
          return '<div id="inv-item-' + p.id + '" class="inv-card' + (sel ? ' inv-item--sel' : '') + '" onclick="inv2ToggleSelect(' + p.id + ')" style="cursor:pointer">'
            // thumbnail
            + '<div style="position:relative;width:100%;padding-top:56.25%">'
            +   '<img src="https://picsum.photos/seed/' + seed + '/640/360" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">'
            // checkbox top-left — stopPropagation to avoid double-firing with card onclick
            +   '<label onclick="event.stopPropagation()" style="position:absolute;top:8px;left:8px;z-index:2;cursor:pointer;width:18px;height:18px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.88);border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.2)">'
            +     '<input type="checkbox" id="inv-cb-' + p.id + '"' + (sel ? ' checked' : '') + ' onchange="inv2ToggleSelect(' + p.id + ')" style="width:13px;height:13px;accent-color:var(--accent);cursor:pointer;margin:0">'
            +   '</label>'
            // channel badge (shifted right to avoid checkbox overlap)
            +   '<div style="position:absolute;top:8px;left:34px;background:rgba(0,0,0,.62);border-radius:4px;padding:2px 7px;font-size:10px;font-weight:600;color:#fff;letter-spacing:.3px">' + p.channel + '</div>'
            +   '<div style="position:absolute;top:8px;right:8px;background:' + inv2ScoreBg(p.match) + ';border:1px solid ' + inv2ScoreBorder(p.match) + ';border-radius:20px;padding:2px 8px;font-size:10px;font-weight:700;color:' + inv2ScoreColor(p.match) + '">' + p.match + '% match</div>'
            +   '<div style="position:absolute;bottom:7px;left:7px;background:rgba(0,0,0,.55);border-radius:4px;padding:2px 8px;font-size:10px;color:rgba(255,255,255,.85)">' + p.category + '</div>'
            +   (sel ? '<div style="position:absolute;inset:0;border:2px solid var(--accent);border-radius:0;pointer-events:none"></div>' : '')
            + '</div>'
            // body
            + '<div style="padding:11px 12px 13px">'
            +   '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:9px;line-height:1.3">' + p.title + '</div>'
            +   '<div style="margin-bottom:8px">'
            +     '<div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:3px">Suggested Scene</div>'
            +     '<div style="font-size:11px;color:var(--muted);line-height:1.35">' + p.scenes[0] + '</div>'
            +   '</div>'
            +   '<div style="display:flex;gap:16px;margin-bottom:10px">'
            +     '<div>'
            +       '<div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:3px">Est. Impressions</div>'
            +       '<div style="font-size:13px;font-weight:700;color:var(--text)">' + p.impressionsLabel + '</div>'
            +     '</div>'
            +     '<div>'
            +       '<div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:3px">Est. Dollars</div>'
            +       '<div style="font-size:13px;font-weight:700;color:var(--text)">' + inv2EstDollars(p.impressionsNum, p.daypart) + '</div>'
            +     '</div>'
            +   '</div>'
            +   '<div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center">'
            +     previewMoments
            +     (p.moments.length > 2 ? '<span onclick="inv2ShowMomentsModal(' + p.id + ')" style="font-size:10px;color:var(--accent);cursor:pointer;white-space:nowrap">+' + (p.moments.length - 2) + ' more →</span>' : '')
            +   '</div>'
            + '</div>'
            + '</div>';
        }).join('')
      + '</div>';
  } else {
    wrap.innerHTML =
      '<table style="width:100%;border-collapse:collapse">'
      + '<thead><tr>'
      +   '<th style="' + TH + ';width:28px;padding-right:0"></th>'
      +   '<th style="' + TH + '">Program</th>'
      +   '<th style="' + TH + '">Channel</th>'
      +   '<th style="' + TH + '">Category</th>'
      +   '<th style="' + TH + '">Match</th>'
      +   '<th style="' + TH + '">Suggested Scene</th>'
      +   '<th style="' + TH + '">Est. Impressions</th>'
      +   '<th style="' + TH + '">Est. Dollars</th>'
      +   '<th style="' + TH + '">Moments</th>'
      + '</tr></thead><tbody>'
      + progs.map(function(p) {
          var idx  = INV_PROGRAMS_V2.indexOf(p);
          var seed = 'tvshow' + (idx + 1);
          var sel  = !!invSelected[p.id];
          var rowBg = sel ? 'background:color-mix(in srgb,var(--accent) 6%,transparent)' : '';
          return '<tr id="inv-item-' + p.id + '" class="' + (sel ? 'inv-item--sel' : '') + '" style="cursor:pointer;' + rowBg + '" onclick="inv2ToggleSelect(' + p.id + ')">'
            + '<td style="' + TD + ';padding-right:4px;width:28px" onclick="event.stopPropagation()">'
            +   '<input type="checkbox" id="inv-cb-' + p.id + '"' + (sel ? ' checked' : '') + ' onchange="inv2ToggleSelect(' + p.id + ')" style="cursor:pointer;accent-color:var(--accent)">'
            + '</td>'
            + '<td style="' + TD + '">'
            +   '<div style="display:flex;align-items:center;gap:9px">'
            +     '<div style="width:54px;height:30px;border-radius:4px;overflow:hidden;flex-shrink:0">'
            +       '<img src="https://picsum.photos/seed/' + seed + '/640/360" style="width:100%;height:100%;object-fit:cover">'
            +     '</div>'
            +     '<span style="font-weight:500">' + p.title + '</span>'
            +   '</div>'
            + '</td>'
            + '<td style="' + TD + ';color:var(--muted)">' + p.channel + '</td>'
            + '<td style="' + TD + ';color:var(--muted)">' + p.category + '</td>'
            + '<td style="' + TD + '">'
            +   '<span style="font-size:11px;font-weight:700;color:' + inv2ScoreColor(p.match) + ';background:' + inv2ScoreBg(p.match) + ';border:1px solid ' + inv2ScoreBorder(p.match) + ';border-radius:20px;padding:3px 9px">' + p.match + '%</span>'
            + '</td>'
            + '<td style="' + TD + ';color:var(--muted);font-size:11px">' + p.scenes[0] + '</td>'
            + '<td style="' + TD + ';font-weight:600">' + p.impressionsLabel + '</td>'
            + '<td style="' + TD + ';font-weight:600">' + inv2EstDollars(p.impressionsNum, p.daypart) + '</td>'
            + '<td style="' + TD + '">'
            +   '<span onclick="event.stopPropagation();inv2ShowMomentsModal(' + p.id + ')" style="font-size:11px;color:var(--accent);cursor:pointer;white-space:nowrap">' + p.moments.length + ' moments →</span>'
            + '</td>'
            + '</tr>';
        }).join('')
      + '</tbody></table>';
  }
}

// ── By Moments: card grid (v2 only) ──────────────────────────────────────────

function mp2InjectMomentStyles() {
  if (document.getElementById('mp2-moment-styles')) return;
  var s = document.createElement('style');
  s.id = 'mp2-moment-styles';
  s.textContent = [
    '.mp2-mcard{background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;transition:border-color .15s,box-shadow .15s}',
    '.mp2-mcard:hover{border-color:var(--border-md);box-shadow:0 2px 8px rgba(0,0,0,.07)}',
    '.mp2-mBtn{flex:1;padding:5px 8px;font-size:11px;font-family:inherit;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--text-2);cursor:pointer;white-space:nowrap;transition:background .12s,color .12s}',
    '.mp2-mBtn:hover{background:var(--bg);color:var(--text)}',
    '.mp2-mBtn--magenta{border-color:transparent;color:var(--text-2);background:var(--bg);font-weight:500}',
    '.mp2-mBtn--magenta:hover{background:var(--bg);color:var(--accent);border-color:transparent}',
    '.mp2-mBtn--ico{flex:none;width:26px;height:26px;padding:0;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-md);border-radius:6px;background:var(--surface);color:var(--faint);cursor:pointer;transition:background .12s,color .12s,border-color .12s}',
    '.mp2-mBtn--ico:hover{background:var(--bg);color:var(--text);border-color:var(--border-md)}',
    '.mp2-sec-hd{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;padding:2px 0 10px;display:flex;align-items:center;gap:7px}',
    '.mp2-mcard--sel{border-color:var(--accent) !important;box-shadow:0 0 0 2px rgba(237,0,94,.1) !important}',
    '.mp2-filter-btn{padding:4px 11px;font-size:11px;font-weight:500;font-family:inherit;border:1px solid var(--border-md);border-radius:20px;background:var(--bg);color:var(--text-2);cursor:pointer;transition:background .12s,color .12s,border-color .12s;line-height:1.4}',
    '.mp2-filter-btn:hover{background:var(--border-md);color:var(--text)}',
    '.mp2-filter-btn--act{background:var(--border-md);border-color:var(--border-md);color:var(--text);font-weight:600}',
    // skeleton shimmer
    '@keyframes mp2Shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}',
    '.mp2-skel{background:linear-gradient(90deg,var(--bg) 25%,var(--border) 50%,var(--bg) 75%);background-size:200% 100%;animation:mp2Shimmer 1.3s infinite linear;border-radius:4px}',
    // dual-range slider thumbs
    '.mp2-dual-range input[type=range]{pointer-events:none}',
    '.mp2-dual-range input[type=range]::-webkit-slider-thumb{pointer-events:all;-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:var(--accent);cursor:pointer;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.22);margin-top:-6px}',
    '.mp2-dual-range input[type=range]::-moz-range-thumb{pointer-events:all;width:14px;height:14px;border-radius:50%;background:var(--accent);cursor:pointer;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.22)}',
    '.mp2-dual-range input[type=range]::-webkit-slider-runnable-track{height:2px;background:transparent}',
    '.mp2-dual-range input[type=range]::-moz-range-track{height:2px;background:transparent}',
  ].join('');
  document.head.appendChild(s);
}

// ── Moment card deterministic attributes (used both for rendering and filtering) ─
function mp2MomentCardAttrs(c) {
  var seed = c.name.split('').reduce(function(a, ch) { return a + ch.charCodeAt(0); }, 0);
  var cpm  = 12 + ((c.score + seed) % 24);
  var ALL_CH = ['NBC','Fox','ABC','CBS','HBO','Peacock','Bravo','Discovery','ESPN','TNT','TBS','AMC'];
  var numCh  = 4 + (seed % 7);
  var channels = ALL_CH.slice().sort(function(a,b){ return ((seed*7+a.charCodeAt(0)*3)%13)-((seed*7+b.charCodeAt(0)*3)%13); }).slice(0, numCh);
  return {
    seed:     seed,
    cpm:      cpm,
    type:     seed % 2 === 0 ? 'Live' : 'VOD',
    platform: ['Roku','Vizio','Pluto'][seed % 3],
    channels: channels,
  };
}

function mp2RenderMoments() {
  mp2InjectMomentStyles();
  var momPanel = document.getElementById('tx2-sub-content-moments');
  if (!momPanel) return;

  momPanel.style.display       = 'flex';
  momPanel.style.flexDirection = 'column';
  momPanel.style.overflowY     = 'hidden';

  var selCount = Object.keys(mp2SelectedMoments).length;
  var segBase = 'border:none;padding:4px 12px;border-radius:16px;font-size:11px;font-weight:500;font-family:inherit;cursor:pointer;transition:background .12s,color .12s,box-shadow .12s;white-space:nowrap;line-height:1.4';
  var segAct  = segBase + ';background:var(--surface);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.1)';
  var segOff  = segBase + ';background:transparent;color:var(--faint)';
  var mfActive = (mp2MfScore !== 'all' ? 1 : 0) + mp2MfChannels.length + (mp2MfCpmMin > 0 || mp2MfCpmMax < 50 ? 1 : 0) + mp2MfPlatforms.length;
  var headerHtml =
    '<div style="display:flex;align-items:center;gap:8px;padding-bottom:10px;flex-shrink:0;position:relative">'
    + '<div style="display:flex;background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:2px;gap:0">'
    +   '<button style="' + (mp2MomentType === 'ads'     ? segAct : segOff) + '" onclick="mp2SetMomentType(\'ads\')">VoD</button>'
    +   '<button style="' + (mp2MomentType === 'organic' ? segAct : segOff) + '" onclick="mp2SetMomentType(\'organic\')">Organic Pause</button>'
    +   '<button style="' + (mp2MomentType === 'live'    ? segAct : segOff) + '" onclick="mp2SetMomentType(\'live\')">Live</button>'
    + '</div>'
    + '<div style="flex:1"></div>'
    + '<button id="mp2-mf-btn" onclick="mp2ToggleMfPanel()" style="display:flex;align-items:center;gap:5px;height:28px;padding:0 10px;border:1px solid ' + (mfActive > 0 ? 'var(--accent)' : 'var(--border-md,var(--border))') + ';border-radius:8px;background:' + (mfActive > 0 ? 'var(--accent-bg,#fdf2f8)' : 'var(--surface)') + ';color:' + (mfActive > 0 ? 'var(--accent)' : 'var(--muted)') + ';font-size:11px;font-weight:500;font-family:inherit;cursor:pointer;white-space:nowrap;transition:border-color .12s,background .12s;flex-shrink:0">'
    +   '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
    +   'Filters'
    +   (mfActive > 0 ? '<span style="background:var(--accent);color:#fff;border-radius:10px;padding:0 5px;font-size:9px;font-weight:700;min-width:14px;text-align:center;line-height:16px;display:inline-block">' + mfActive + '</span>' : '')
    + '</button>'
    + '</div>';

  momPanel.innerHTML = headerHtml + '<div id="mp2-moments-scroll" style="overflow-y:auto;flex:1;min-height:0"></div>';
  var scrollWrap = document.getElementById('mp2-moments-scroll');

  // Base pool: use DB snapshot if available, otherwise live MOCK_MOMENTS_API
  var _momentsSource = mp2AnalysisMoments || MOCK_MOMENTS_API || [];
  var typeFilter = mp2MomentType === 'live' ? 'Live' : mp2MomentType === 'organic' ? 'Organic Pause' : 'VoD';
  var cats = _momentsSource.map(function(m) {
    return { name: m.moment_name, score: m.moment_score || 0, assets: m.pods || 0 };
  }).filter(function(c) {
    var m = _momentsSource.find(function(x) { return x.moment_name === c.name; }) || {};
    if (m.moment_type !== typeFilter) return false;
    var a = mp2MomentCardAttrs(c);
    if (mp2MfScore === 'high'     && c.score <  75) return false;
    if (mp2MfScore === 'standard' && c.score >= 75) return false;
    if (mp2MfChannels.length > 0 && !(m.channels || []).some(function(ch){ return mp2MfChannels.indexOf(ch) >= 0; })) return false;
    if (mp2MfCpmMin > 0  && (m.est_cpm || 0) < mp2MfCpmMin)  return false;
    if (mp2MfCpmMax < 50 && (m.est_cpm || 0) > mp2MfCpmMax)  return false;
    if (mp2MfTypes.length     > 0 && mp2MfTypes.indexOf(a.type) < 0)     return false;
    if (mp2MfPlatforms.length > 0 && mp2MfPlatforms.indexOf(a.platform) < 0) return false;
    return true;
  });

  var GRID = 'display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding-bottom:16px';

  // Pre-compute which moments are in the selected plan (used when analysis is locked)
  var _locked = _mp2IsLocked();
  var _lockedPlanMoments = {};
  if (_locked && _mp2CurrentAnalysisPlans && _mp2CurrentAnalysisPlans.length) {
    var _selIdx = (_mp2DistributePlanIdx !== null && _mp2DistributePlanIdx >= 0)
      ? _mp2DistributePlanIdx
      : 0;
    var _selPlan = _mp2CurrentAnalysisPlans[_selIdx] || _mp2CurrentAnalysisPlans[0];
    if (_selPlan) {
      (_selPlan.moments || []).forEach(function(m) {
        if (m.moment) _lockedPlanMoments[m.moment] = true;
      });
    }
  }

  var renderCard = function(c) {
    var safeN    = c.name.replace(/'/g, "\\'");
    var safeId   = c.name.replace(/[^a-zA-Z0-9]/g, '-');
    var imgId    = 'mp2-img-' + safeId;
    var attrs    = mp2MomentCardAttrs(c);
    var seed     = attrs.seed;
    var refined  = mp2RefinedStats[c.name];
    var isHigh   = mockIsHigh;
    var badgeCol = isHigh ? '#166534' : '#92400e';
    var badgeBg  = isHigh ? '#dcfce7' : '#fef9c3';
    var badgeBd  = isHigh ? '#bbf7d0' : '#fde68a';
    // All stats from moments source (DB snapshot if loaded, else MOCK_MOMENTS_API)
    var mockM      = _momentsSource.find(function(x) { return x.moment_name === c.name; }) || {};
    var mockScore  = (mockM.moment_score !== undefined && mockM.moment_score !== null) ? mockM.moment_score : null;
    var mockIsHigh = mockScore !== null && mockScore >= 75;
    var dispImpM   = mockM.est_impressions ? (mockM.est_impressions / 1000000).toFixed(1) : '—';
    var dispImpStr = mockM.est_impressions ? dispImpM + 'M' : '—';
    var dispCpm    = mockM.est_cpm         ? '$' + mockM.est_cpm.toFixed(2) : '—';
    var dispPods   = mockM.pods            ? mockM.pods.toLocaleString()     : '—';
    var mockChannels = Array.isArray(mockM.channels) ? mockM.channels : [];
    var inlineBadge = mockScore !== null
      ? '<span style="display:inline-block;font-size:9px;font-weight:600;letter-spacing:.3px;border-radius:20px;padding:1px 6px;margin-left:5px;flex-shrink:0;vertical-align:middle;'
        + (mockIsHigh ? 'background:#dcfce7;color:#166534' : 'background:#f3f4f6;color:#6b7280')
        + '">' + (mockIsHigh ? 'High' : 'Standard') + '</span>'
      : '';
    // Supply type badge from MOCK_MOMENTS_API
    var mType = mockM.moment_type || '';
    var supplyBadge = mType === 'Live'
      ? '<span style="background:#fef2f2;border:1px solid #fecaca;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:700;color:#dc2626;display:flex;align-items:center;gap:3px"><span style="width:5px;height:5px;border-radius:50%;background:#ef4444;flex-shrink:0;box-shadow:0 0 4px #ef4444"></span>Live</span>'
      : mType === 'Organic Pause'
      ? '<span style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:700;color:#0f766e">Organic Pause</span>'
      : mType === 'VoD'
      ? '<span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:700;color:#1d4ed8">VoD</span>'
      : '';
    var LABEL = 'font-size:9px;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);margin-bottom:2px';
    var VALUE = 'font-size:12px;font-weight:700;color:var(--text)';

    // Channels from MOCK_MOMENTS_API (fallback to deterministic attrs)
    var cardCh    = mockChannels.length ? mockChannels : attrs.channels;
    var visibleCh = cardCh.slice(0, 3);
    var extraCh   = cardCh.slice(3);
    var chHtml = visibleCh.map(function(ch){
      return '<span style="font-size:10px;color:var(--text);font-weight:500">' + ch + '</span>';
    }).join('<span style="color:var(--faint);font-size:10px;margin:0 1px">·</span>');
    if (extraCh.length) {
      var fullList = cardCh.map(function(ch){ return '<div style="font-size:11px;font-weight:500;color:var(--text);padding:2px 0">' + ch + '</div>'; }).join('');
      chHtml += '<span onclick="event.stopPropagation()" onmouseenter="this.querySelector(\'.mp2-ch-hover-tt\').style.display=\'block\'" onmouseleave="this.querySelector(\'.mp2-ch-hover-tt\').style.display=\'none\'" style="position:relative;display:inline-flex;align-items:center;margin-left:3px">'
        + '<span style="font-size:9px;font-weight:600;color:var(--muted);background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:0px 5px;white-space:nowrap;cursor:default">+' + extraCh.length + '</span>'
        + '<span class="mp2-ch-hover-tt" style="display:none;position:absolute;bottom:calc(100% + 5px);left:50%;transform:translateX(-50%);background:var(--surface);border:1px solid var(--border-md);border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.13);padding:8px 12px;min-width:120px;z-index:9999;white-space:nowrap">'
        +   '<div style="font-size:9px;font-weight:600;color:var(--faint);text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">Channels included</div>'
        +   fullList
        + '</span>'
        + '</span>';
    }

    var isSel = _locked ? !!_lockedPlanMoments[c.name] : !!mp2SelectedMoments[c.name];
    return '<div id="mp2-mcard-' + safeId + '" class="mp2-mcard' + (isSel ? ' mp2-mcard--sel' : '') + '" ' + (!_locked ? 'onclick="mp2ToggleMomentCard(\'' + safeN + '\')"' : '') + ' style="cursor:' + (_locked ? 'default' : 'pointer') + '">'
      // thumbnail
      + '<div style="position:relative;width:100%;padding-top:44%">'
      +   '<div id="' + imgId + '" style="position:absolute;inset:0;width:100%;height:100%;background-color:var(--border);display:flex;align-items:center;justify-content:center;overflow:hidden">'
      +     (mockM.img_url
              ? '<img src="' + mockM.img_url + '" style="width:100%;height:100%;object-fit:cover;display:block" />'
              : '<svg width="20" height="20" viewBox="0 0 16 16" fill="none" style="opacity:.25;flex-shrink:0"><rect x="1" y="4" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M11 7l4-2v6l-4-2V7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>')
      +   '</div>'
      +   (_locked
            ? (isSel
                ? '<label style="position:absolute;top:6px;left:6px;z-index:2;width:16px;height:16px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.88);border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.2)">'
                  + '<input type="checkbox" checked disabled style="width:11px;height:11px;accent-color:var(--accent);margin:0">'
                  + '</label>'
                : '')  // no checkbox for locked moments not in any plan
            : '<label onclick="event.stopPropagation()" style="position:absolute;top:6px;left:6px;z-index:2;cursor:pointer;width:16px;height:16px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.88);border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.2)">'
              + '<input type="checkbox" id="mp2-cb-' + safeId + '"' + (isSel ? ' checked' : '') + ' onchange="mp2ToggleMomentCard(\'' + safeN + '\')" style="width:11px;height:11px;accent-color:var(--accent);cursor:pointer;margin:0">'
              + '</label>')
      +   '<div style="position:absolute;top:6px;right:6px;display:flex;align-items:center;gap:3px">'
      +     (refined ? '<span style="background:rgba(237,0,94,.9);color:#fff;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:700">Refined</span>' : '')
      +     supplyBadge
      +     '<span style="background:' + badgeBg + ';border:1px solid ' + badgeBd + ';border-radius:20px;padding:1px 7px;font-size:9px;font-weight:700;color:' + badgeCol + '">' + (isHigh ? 'High' : 'Standard') + '</span>'
      +   '</div>'
      +   '<div style="position:absolute;bottom:0;left:0;right:0;height:28px;background:linear-gradient(to top,rgba(0,0,0,.4),transparent)"></div>'
      + '</div>'
      // body
      + '<div style="padding:9px 10px 11px;position:relative">'
      +   '<div style="font-size:11px;font-weight:600;color:var(--text);margin-bottom:8px;line-height:1.3">' + c.name + '</div>'
      +   '<div style="display:flex;flex-direction:column;gap:5px;margin-bottom:10px">'
      +     '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">'
      +       '<div><div style="' + LABEL + '">Est. Impr.</div><div id="mp2-kv-imp-' + safeId + '" style="' + VALUE + '">' + dispImpStr + '</div></div>'
      +       '<div><div style="' + LABEL + '">CPM</div><div id="mp2-kv-cpm-' + safeId + '" style="' + VALUE + '">' + dispCpm + '</div></div>'
      +       '<div><div style="' + LABEL + '">PODs</div><div id="mp2-kv-inv-' + safeId + '" style="' + VALUE + '">' + dispPods + '</div></div>'
      +     '</div>'
      +     '<div>'
      +       '<div style="' + LABEL + '">Channels</div>'
      +       '<div style="display:flex;align-items:center;flex-wrap:nowrap;gap:2px;margin-top:1px;position:relative">' + chHtml + '</div>'
      +     '</div>'
      +   '</div>'
      +   (refined ? '<button class="mp2-kpi-reset-btn" onclick="event.stopPropagation();mp2ResetCard(\'' + safeN + '\')" title="Reset to original" style="position:absolute;top:8px;right:8px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>' : '')
      +   '<div style="display:flex;align-items:center;gap:5px">'
      +     '<button class="mp2-mBtn mp2-mBtn--magenta" style="font-size:10px;padding:4px 8px;flex:1;display:flex;align-items:center;justify-content:center;gap:5px" onclick="event.stopPropagation();mp2OpenMomentModal(\'' + safeN + '\',' + c.score + ',' + c.assets + ')">'
      +       '<svg width="11" height="11" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
      +       'Refine Taxonomies'
      +     '</button>'
      +     '<button class="mp2-mBtn--ico" title="Show examples" onclick="event.stopPropagation();mp2ShowExamples(\'' + safeN + '\',' + c.score + ',' + c.assets + ',this)">'
      +       '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M11 7l4-2v6l-4-2V7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>'
      +     '</button>'
      +   '</div>'
      + '</div>'
      + '</div>';
  };

  scrollWrap.innerHTML = '<div style="' + GRID + '">' + cats.map(renderCard).join('') + '</div>';

  mp2FetchMomentImages(cats);
  mp2RenderMomentsMediaPlan();
}

function mp2FetchMomentImages(categories) {
  var TV_QUERIES = {
    'Sports Comeback Moment':       'stadium crowd sports celebration game',
    'Morning Coffee Ritual':        'coffee cup morning lifestyle cozy',
    'Family Movie Night':           'family couch living room watching tv popcorn',
    'Holiday Shopping Rush':        'shopping mall christmas gifts festive crowd',
    'Outdoor Adventure Escape':     'hiking nature mountain outdoor adventure',
    'Tech Unboxing Reveal':         'technology gadget unboxing modern device',
    'Cooking Competition Finals':   'cooking competition chef kitchen contest',
    'Late Night Comedy Punchline':  'comedy stage microphone audience laughing',
    'Pet Rescue Heartwarming':      'dog cat rescue animal shelter adoption',
    'Thriller Chase Scene':         'city night chase dramatic action scene',
    'Fitness & Workout Grind':      'gym workout fitness training exercise',
    'Breaking News Alert':          'news broadcast television studio anchor',
    'Kids Birthday Celebration':    'kids birthday party balloons cake celebration',
    'Luxury Car Commercial':        'luxury car driving highway elegant',
    'Nature Documentary Sunrise':   'sunrise nature wildlife landscape documentary',
    'Wedding Day Ceremony':         'wedding ceremony bride groom romantic',
    'College Game Day':             'college football stadium crowd game day',
    'Real Estate House Tour':       'modern house interior real estate home',
    'Music Award Show':             'music award show stage performer spotlight',
    'Beach Summer Vacation':        'beach summer ocean sunset vacation',
    'Hospital Drama Cliffhanger':   'hospital emergency room drama medical',
    'Grocery Store Discovery':      'grocery store supermarket fresh food aisle',
    'Travel Airport Departure':     'airport travel departure gate adventure',
    'Political Debate Showdown':    'political debate stage microphone podium',
    'Wine & Dining Experience':     'wine restaurant fine dining elegant table',
    'Newborn Baby Arrival':         'newborn baby hospital family tender moment',
    'Superhero Action Sequence':    'action hero dramatic explosion cityscape',
    'Back to School Season':        'school backpack students classroom autumn',
    'Crime Investigation Reveal':   'detective mystery crime scene investigation',
    'Graduation Day Celebration':   'graduation cap gown diploma celebration'
  };

  // Source array we can mutate in memory (to add img_url)
  var source = mp2AnalysisMoments || MOCK_MOMENTS_API || [];
  var pending = [];   // categories that still need a fetch
  var newlyFetched = 0;

  categories.forEach(function(c) {
    var srcEntry = source.find(function(x) { return x.moment_name === c.name; });
    // If img_url already cached in DB snapshot, image is already rendered — skip fetch
    if (srcEntry && srcEntry.img_url) return;
    pending.push(c);
  });

  if (!pending.length) return; // all images already cached

  var settled = 0;
  pending.forEach(function(c) {
    var imgId = 'mp2-img-' + c.name.replace(/[^a-zA-Z0-9]/g, '-');
    var query = (TV_QUERIES[c.name] || c.name + ' television show scene');
    fetch('/api/unsplash?q=' + encodeURIComponent(query))
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function(data) {
        if (data.thumb) {
          // Render into DOM
          var el = document.getElementById(imgId);
          if (el) {
            var img = new Image();
            img.onload = function() {
              el.innerHTML = '<img src="' + data.thumb + '" style="width:100%;height:100%;object-fit:cover;display:block" />';
            };
            img.onerror = function() {};
            img.src = data.thumb;
          }
          // Cache img_url in memory
          var srcEntry = source.find(function(x) { return x.moment_name === c.name; });
          if (srcEntry) { srcEntry.img_url = data.thumb; newlyFetched++; }
        }
      })
      .catch(function(e) { console.warn('mp2 img fetch failed for "' + c.name + '":', e); })
      .finally(function() {
        settled++;
        // Once all pending fetches settle, PATCH the DB with updated img_url values
        if (settled === pending.length && newlyFetched > 0 && _mp2LastAnalysisId) {
          fetch('/api/moments-match?moments_match_analysis_id=' + _mp2LastAnalysisId, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moments: source })
          }).catch(function(e) { console.warn('mp2 img PATCH failed:', e); });
        }
      });
  });
}

function mp2ShowChannels(channels, btn) {
  document.querySelectorAll('.mp2-ch-tt').forEach(function(el) { el.remove(); });
  var tt = document.createElement('div');
  tt.className = 'mp2-ch-tt';
  tt.style.cssText = 'position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border-md);border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.14);padding:12px 14px;min-width:160px;';
  tt.innerHTML = '<div style="font-size:10px;font-weight:600;color:var(--faint);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">All Channels</div>'
    + channels.map(function(ch) {
        return '<div style="font-size:12px;font-weight:500;color:var(--text);padding:3px 0">' + ch + '</div>';
      }).join('');
  tt.style.visibility = 'hidden';
  document.body.appendChild(tt);
  var r = btn.getBoundingClientRect();
  var ttH = tt.offsetHeight, ttW = tt.offsetWidth;
  tt.style.top  = (r.bottom + 6 + ttH > window.innerHeight ? r.top - ttH - 6 : r.bottom + 6) + 'px';
  tt.style.left = Math.max(8, Math.min(r.left, window.innerWidth - ttW - 8)) + 'px';
  tt.style.visibility = '';
  setTimeout(function() {
    document.addEventListener('click', function h() { tt.remove(); document.removeEventListener('click', h); });
  }, 0);
}

function mp2ShowExamples(momentName, score, assets, btn) {
  // Toggle: if this button already has the popup open, close it
  if (btn.dataset.ttOpen === '1') {
    document.querySelectorAll('.mp2-examples-tt').forEach(function(el) { el.remove(); });
    btn.dataset.ttOpen = '';
    return;
  }
  document.querySelectorAll('.mp2-examples-tt').forEach(function(el) { el.remove(); });
  document.querySelectorAll('[data-tt-open]').forEach(function(el) { el.dataset.ttOpen = ''; });
  btn.dataset.ttOpen = '1';

  // Deterministic relevance score per program based on moment name seed
  var seed = 0;
  for (var k = 0; k < momentName.length; k++) seed += momentName.charCodeAt(k);
  var top5 = INV_PROGRAMS_V2.map(function(p, i) {
    var s = 58 + ((seed * 7 + i * 31 + seed % (i + 3)) % 40);
    var showName = p.title.replace(/\s*[—–-]+\s*Ep\..*$/i, '').trim();
    return { title: showName, channel: p.channel, score: Math.min(s, 97) };
  }).sort(function(a, b) { return b.score - a.score; }).slice(0, 5);

  var ttLabel = function(s) { return s >= 80 ? 'High'    : 'Standard'; };
  var ttColor = function(s) { return s >= 80 ? '#16a34a' : '#d97706'; };
  var ttBg    = function(s) { return s >= 80 ? '#f0fdf4' : '#fffbeb'; };
  var ttBd    = function(s) { return s >= 80 ? '#bbf7d0' : '#fde68a'; };

  var tt = document.createElement('div');
  tt.className = 'mp2-examples-tt';
  tt.style.cssText = 'position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border-md);border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.14);padding:14px;min-width:260px;max-width:320px;';
  tt.innerHTML =
    '<div style="display:flex;align-items:center;margin-bottom:10px">'
    +   '<span style="font-size:10px;font-weight:600;color:var(--faint);text-transform:uppercase;letter-spacing:.5px;flex:1">Top shows — ' + momentName + '</span>'
    +   '<button onclick="this.closest(\'.mp2-examples-tt\').remove();document.querySelectorAll(\'[data-tt-open]\').forEach(function(e){e.dataset.ttOpen=\'\';})" style="border:none;background:none;cursor:pointer;color:var(--faint);font-size:14px;line-height:1;padding:0 0 0 8px;display:flex;align-items:center" onmouseenter="this.style.color=\'var(--text)\'" onmouseleave="this.style.color=\'var(--faint)\'">×</button>'
    + '</div>'
    + top5.map(function(p, i) {
        return '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;' + (i < 4 ? 'border-bottom:1px solid var(--border)' : '') + '">'
          + '<span style="font-size:10px;font-weight:600;color:var(--faint);min-width:14px">' + (i + 1) + '</span>'
          + '<div style="flex:1;min-width:0">'
          +   '<div style="font-size:12px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + p.title + '</div>'
          + '</div>'
          + '<span style="font-size:11px;font-weight:600;padding:1px 7px;border-radius:20px;background:' + ttBg(p.score) + ';color:' + ttColor(p.score) + ';border:1px solid ' + ttBd(p.score) + ';flex-shrink:0">' + ttLabel(p.score) + '</span>'
          + '</div>';
      }).join('')
    + (function() {
        var _ot = typeof _appCurrentOrgType === 'function' ? _appCurrentOrgType() : null;
        var _hidePodsBtn = (_ot === 'Brand' || _ot === 'Agency');
        return '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">'
          + (!_hidePodsBtn
              ? '<button onclick="this.closest(\'.mp2-examples-tt\').remove();txShowAssetsView(\'' + momentName.replace(/'/g, "\\'") + '\',' + score + ',' + assets + ')" style="width:100%;padding:7px 10px;font-size:11px;font-weight:500;font-family:inherit;border:1px solid var(--border-md);border-radius:7px;background:var(--bg);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background .12s;margin-bottom:8px" onmouseenter="this.style.background=\'var(--surface)\'" onmouseleave="this.style.background=\'var(--bg)\'"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 12.5v1M10.5 12.5v1M3.5 13.5h9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M4.5 7.5h7M4.5 5.5h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".6"/></svg>See full pods</button>'
              : '')
          + '<div style="font-size:9px;color:var(--faint);text-align:center;line-height:1.4">Example shows, not guaranteed</div>'
          + '</div>';
      })()

  var r = btn.getBoundingClientRect();
  // Append first (hidden) so we can measure height
  tt.style.visibility = 'hidden';
  document.body.appendChild(tt);
  var ttH = tt.offsetHeight;
  var ttW = tt.offsetWidth;
  // Vertical: open above if not enough space below
  var spaceBelow = window.innerHeight - r.bottom - 8;
  var spaceAbove = r.top - 8;
  if (spaceBelow >= ttH) {
    tt.style.top = (r.bottom + 6) + 'px';
  } else if (spaceAbove >= ttH) {
    tt.style.top = (r.top - ttH - 6) + 'px';
  } else {
    // Not enough space either way — pin to bottom of viewport with scroll
    tt.style.top = Math.max(8, window.innerHeight - ttH - 8) + 'px';
  }
  // Horizontal: keep inside viewport
  var left = Math.max(8, Math.min(r.left, window.innerWidth - ttW - 8));
  tt.style.left = left + 'px';
  tt.style.visibility = '';

  setTimeout(function() {
    document.addEventListener('click', function h() {
      tt.remove();
      btn.dataset.ttOpen = '';
      document.removeEventListener('click', h);
    });
  }, 0);
}

// ── Per-moment IAB taxonomy data ─────────────────────────────────────────────
var MP2_MOMENT_TAXONOMIES = {
  'Family Dinner Time': {
    emotion: [
      { taxonomy:'Emotion > Positive > Warmth',                 score:97 },
      { taxonomy:'Emotion > Social > Togetherness',             score:95 },
      { taxonomy:'Emotion > Positive > Comfort',                score:91 },
      { taxonomy:'Emotion > Social > Belonging',                score:87 },
      { taxonomy:'Emotion > Positive > Joy',                    score:83 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:76 },
      { taxonomy:'Emotion > Calm > Contentment',                score:70 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Dining Room', score:98 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:95 },
      { taxonomy:'Location > Domestic > Exterior > Garden',     score:72 },
      { taxonomy:'Location > Domestic > Interior > Living Room',score:68 },
      { taxonomy:'Location > Domestic > Interior > Open-Plan',  score:65 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Prepared > Family Meal',     score:97 },
      { taxonomy:'Objects > Kitchenware > Tableware > Plates',  score:93 },
      { taxonomy:'Objects > Food > Fresh > Vegetables',         score:88 },
      { taxonomy:'Objects > Kitchenware > Cookware > Casserole',score:82 },
      { taxonomy:'Objects > Kitchenware > Utensils > Cutlery',  score:78 },
      { taxonomy:'Objects > Beverage > Non-Alcoholic > Water',  score:65 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Warm & Wholesome',     score:98 },
      { taxonomy:'Sentiment > Social > Family-Oriented',        score:96 },
      { taxonomy:'Sentiment > Positive > Comforting',           score:92 },
      { taxonomy:'Sentiment > Positive > Aspirational',         score:80 },
      { taxonomy:'Sentiment > Neutral > Everyday',              score:60 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Cooking',               score:97 },
      { taxonomy:'IAB25 > Family & Parenting > Family Life',    score:96 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:93 },
      { taxonomy:'IAB8 > Food & Drink > Healthy Eating',        score:85 },
      { taxonomy:'IAB9 > Home & Garden > Home Cooking',         score:80 },
      { taxonomy:'IAB7 > Health > Nutrition',                   score:70 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:99 },
      { taxonomy:'Brand Safety > Safe > Food Safe',             score:99 },
    ],
  },
  'Grocery Shopping': {
    emotion: [
      { taxonomy:'Emotion > Positive > Anticipation',           score:88 },
      { taxonomy:'Emotion > Positive > Satisfaction',           score:85 },
      { taxonomy:'Emotion > Social > Comfort',                  score:80 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:78 },
      { taxonomy:'Emotion > Positive > Excitement',             score:72 },
      { taxonomy:'Emotion > Positive > Pride',                  score:65 },
    ],
    location: [
      { taxonomy:'Location > Retail > Grocery > Supermarket',   score:99 },
      { taxonomy:'Location > Retail > Grocery > Fresh Produce Aisle', score:96 },
      { taxonomy:'Location > Retail > Grocery > Checkout',      score:88 },
      { taxonomy:'Location > Retail > Market > Farmers Market', score:75 },
      { taxonomy:'Location > Retail > Grocery > Parking Lot',   score:62 },
    ],
    objects: [
      { taxonomy:'Objects > Retail > Grocery > Shopping Cart',  score:97 },
      { taxonomy:'Objects > Food > Fresh > Produce',            score:95 },
      { taxonomy:'Objects > Food > Packaged > Branded Goods',   score:92 },
      { taxonomy:'Objects > Retail > Grocery > Shelving',       score:88 },
      { taxonomy:'Objects > Retail > Payment > Shopping Bag',   score:82 },
      { taxonomy:'Objects > Electronics > Mobile > Smartphone', score:65 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Convenient',           score:93 },
      { taxonomy:'Sentiment > Positive > Reassuring',           score:90 },
      { taxonomy:'Sentiment > Positive > Value-Driven',         score:87 },
      { taxonomy:'Sentiment > Social > Family-Oriented',        score:82 },
      { taxonomy:'Sentiment > Neutral > Everyday',              score:75 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:99 },
      { taxonomy:'IAB8 > Food & Drink > Food Shopping',         score:97 },
      { taxonomy:'IAB8 > Food & Drink > Organic & Natural',     score:82 },
      { taxonomy:'IAB25 > Family & Parenting > Family Budget',  score:78 },
      { taxonomy:'IAB13 > Personal Finance > Budgeting',        score:70 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
  'Healthy Eating': {
    emotion: [
      { taxonomy:'Emotion > Positive > Vitality',               score:94 },
      { taxonomy:'Emotion > Positive > Pride',                  score:90 },
      { taxonomy:'Emotion > Motivational > Determination',      score:86 },
      { taxonomy:'Emotion > Positive > Satisfaction',           score:83 },
      { taxonomy:'Emotion > Positive > Hope',                   score:78 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:72 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:95 },
      { taxonomy:'Location > Domestic > Interior > Dining Area',score:88 },
      { taxonomy:'Location > Retail > Grocery > Fresh Aisle',   score:82 },
      { taxonomy:'Location > Outdoor > Garden > Vegetable Patch',score:68 },
      { taxonomy:'Location > Retail > Health Food > Store',     score:65 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Fresh > Leafy Greens',       score:97 },
      { taxonomy:'Objects > Food > Fresh > Fruit',              score:95 },
      { taxonomy:'Objects > Food > Fresh > Vegetables',         score:94 },
      { taxonomy:'Objects > Food > Grains > Whole Grain',       score:85 },
      { taxonomy:'Objects > Kitchenware > Cookware > Steamer',  score:78 },
      { taxonomy:'Objects > Beverage > Smoothie',               score:72 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Healthy & Vibrant',    score:97 },
      { taxonomy:'Sentiment > Positive > Aspirational',         score:93 },
      { taxonomy:'Sentiment > Positive > Empowering',           score:89 },
      { taxonomy:'Sentiment > Positive > Wholesome',            score:87 },
      { taxonomy:'Sentiment > Neutral > Educational',           score:72 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Healthy Eating',        score:99 },
      { taxonomy:'IAB7 > Health > Nutrition',                   score:97 },
      { taxonomy:'IAB8 > Food & Drink > Organic & Natural',     score:91 },
      { taxonomy:'IAB7 > Health > Wellness',                    score:88 },
      { taxonomy:'IAB8 > Food & Drink > Cooking',               score:82 },
      { taxonomy:'IAB25 > Family & Parenting > Family Health',  score:75 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Health-Positive',       score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
    ],
  },
  'Meal Prep & Cooking': {
    emotion: [
      { taxonomy:'Emotion > Positive > Creativity',             score:93 },
      { taxonomy:'Emotion > Positive > Satisfaction',           score:91 },
      { taxonomy:'Emotion > Positive > Pride',                  score:88 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:85 },
      { taxonomy:'Emotion > Motivational > Focus',              score:80 },
      { taxonomy:'Emotion > Positive > Calm',                   score:72 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:99 },
      { taxonomy:'Location > Domestic > Interior > Counter-top',score:95 },
      { taxonomy:'Location > Domestic > Interior > Pantry',     score:78 },
      { taxonomy:'Location > Retail > Grocery > Supermarket',   score:70 },
      { taxonomy:'Location > Domestic > Exterior > BBQ Area',   score:62 },
    ],
    objects: [
      { taxonomy:'Objects > Kitchenware > Cookware > Pots & Pans', score:98 },
      { taxonomy:'Objects > Kitchenware > Utensils > Chef Knife',  score:95 },
      { taxonomy:'Objects > Food > Fresh > Ingredients',           score:94 },
      { taxonomy:'Objects > Kitchenware > Appliance > Blender',    score:85 },
      { taxonomy:'Objects > Kitchenware > Appliance > Oven',       score:82 },
      { taxonomy:'Objects > Kitchenware > Storage > Meal Prep Container', score:76 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Skilled & Crafted',    score:95 },
      { taxonomy:'Sentiment > Positive > Wholesome',            score:93 },
      { taxonomy:'Sentiment > Positive > Satisfying',           score:90 },
      { taxonomy:'Sentiment > Positive > Inspiring',            score:82 },
      { taxonomy:'Sentiment > Neutral > Instructional',         score:76 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Cooking',               score:99 },
      { taxonomy:'IAB8 > Food & Drink > Recipes',               score:97 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:90 },
      { taxonomy:'IAB9 > Home & Garden > Cooking Techniques',   score:87 },
      { taxonomy:'IAB8 > Food & Drink > Healthy Eating',        score:82 },
      { taxonomy:'IAB25 > Family & Parenting > Home Skills',    score:72 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:99 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:99 },
    ],
  },
  'Fresh Produce': {
    emotion: [
      { taxonomy:'Emotion > Sensory > Visual Appeal',           score:96 },
      { taxonomy:'Emotion > Positive > Freshness',              score:94 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:90 },
      { taxonomy:'Emotion > Positive > Vitality',               score:86 },
      { taxonomy:'Emotion > Positive > Satisfaction',           score:80 },
      { taxonomy:'Emotion > Positive > Joy',                    score:72 },
    ],
    location: [
      { taxonomy:'Location > Retail > Grocery > Produce Section', score:98 },
      { taxonomy:'Location > Retail > Market > Farmers Market', score:94 },
      { taxonomy:'Location > Outdoor > Farm > Field',           score:85 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:80 },
      { taxonomy:'Location > Retail > Grocery > Organic Aisle', score:76 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Fresh > Fruit',              score:99 },
      { taxonomy:'Objects > Food > Fresh > Vegetables',         score:99 },
      { taxonomy:'Objects > Food > Fresh > Leafy Greens',       score:96 },
      { taxonomy:'Objects > Food > Fresh > Herbs',              score:88 },
      { taxonomy:'Objects > Retail > Grocery > Display Basket', score:82 },
      { taxonomy:'Objects > Food > Organic > Produce',          score:78 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Fresh & Natural',      score:98 },
      { taxonomy:'Sentiment > Positive > Healthy',              score:96 },
      { taxonomy:'Sentiment > Positive > Vibrant',              score:93 },
      { taxonomy:'Sentiment > Positive > Authentic',            score:85 },
      { taxonomy:'Sentiment > Positive > Sustainable',          score:78 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:98 },
      { taxonomy:'IAB8 > Food & Drink > Organic & Natural',     score:96 },
      { taxonomy:'IAB8 > Food & Drink > Healthy Eating',        score:93 },
      { taxonomy:'IAB7 > Health > Nutrition',                   score:87 },
      { taxonomy:'IAB6 > Environment > Sustainability',         score:75 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Health-Positive',       score:100 },
    ],
  },
  'Weekend BBQ': {
    emotion: [
      { taxonomy:'Emotion > Positive > Joy',                    score:95 },
      { taxonomy:'Emotion > Social > Togetherness',             score:94 },
      { taxonomy:'Emotion > Social > Celebration',              score:90 },
      { taxonomy:'Emotion > Positive > Relaxation',             score:87 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:84 },
      { taxonomy:'Emotion > Social > Belonging',                score:78 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Exterior > Backyard',   score:98 },
      { taxonomy:'Location > Domestic > Exterior > Patio / Deck', score:95 },
      { taxonomy:'Location > Outdoor > Park > Picnic Area',     score:82 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:70 },
      { taxonomy:'Location > Outdoor > Beach > Coastal',        score:65 },
    ],
    objects: [
      { taxonomy:'Objects > Equipment > Outdoor > BBQ Grill',   score:99 },
      { taxonomy:'Objects > Food > Meat > Grilled',             score:97 },
      { taxonomy:'Objects > Food > Fresh > Corn & Vegetables',  score:90 },
      { taxonomy:'Objects > Kitchenware > Utensils > Tongs',    score:85 },
      { taxonomy:'Objects > Beverage > Soft Drink > Canned',    score:80 },
      { taxonomy:'Objects > Tableware > Outdoor > Paper Plates',score:74 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Social > Celebratory',            score:96 },
      { taxonomy:'Sentiment > Positive > Warm & Welcoming',     score:94 },
      { taxonomy:'Sentiment > Social > Family-Oriented',        score:91 },
      { taxonomy:'Sentiment > Positive > Relaxed',              score:88 },
      { taxonomy:'Sentiment > Positive > Fun',                  score:84 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > BBQ & Grilling',        score:99 },
      { taxonomy:'IAB8 > Food & Drink > Cooking',               score:94 },
      { taxonomy:'IAB25 > Family & Parenting > Family Life',    score:90 },
      { taxonomy:'IAB9 > Home & Garden > Outdoor Living',       score:85 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:80 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:99 },
    ],
  },
  'Quick & Easy Meals': {
    emotion: [
      { taxonomy:'Emotion > Positive > Relief',                 score:93 },
      { taxonomy:'Emotion > Positive > Satisfaction',           score:91 },
      { taxonomy:'Emotion > Positive > Confidence',             score:86 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:83 },
      { taxonomy:'Emotion > Positive > Practicality',           score:80 },
      { taxonomy:'Emotion > Positive > Joy',                    score:72 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:97 },
      { taxonomy:'Location > Domestic > Interior > Dining Area',score:88 },
      { taxonomy:'Location > Retail > Grocery > Supermarket',   score:78 },
      { taxonomy:'Location > Domestic > Interior > Pantry',     score:72 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Packaged > Convenience Meal',score:95 },
      { taxonomy:'Objects > Kitchenware > Appliance > Microwave',score:90 },
      { taxonomy:'Objects > Food > Fresh > Ingredients',        score:87 },
      { taxonomy:'Objects > Kitchenware > Cookware > Pan',      score:84 },
      { taxonomy:'Objects > Kitchenware > Storage > Container', score:76 },
      { taxonomy:'Objects > Electronics > Mobile > Smartphone', score:65 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Convenient',           score:97 },
      { taxonomy:'Sentiment > Positive > Practical',            score:94 },
      { taxonomy:'Sentiment > Positive > Time-Saving',          score:92 },
      { taxonomy:'Sentiment > Positive > Satisfying',           score:87 },
      { taxonomy:'Sentiment > Neutral > Everyday',              score:78 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Quick Meals & Recipes', score:98 },
      { taxonomy:'IAB8 > Food & Drink > Cooking',               score:93 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:90 },
      { taxonomy:'IAB25 > Family & Parenting > Busy Parents',   score:85 },
      { taxonomy:'IAB8 > Food & Drink > Healthy Eating',        score:75 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
  'Home Cooking': {
    emotion: [
      { taxonomy:'Emotion > Positive > Creativity',             score:94 },
      { taxonomy:'Emotion > Positive > Pride',                  score:92 },
      { taxonomy:'Emotion > Positive > Nostalgia',              score:88 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:85 },
      { taxonomy:'Emotion > Positive > Comfort',                score:83 },
      { taxonomy:'Emotion > Social > Warmth',                   score:78 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:99 },
      { taxonomy:'Location > Domestic > Interior > Dining Room',score:85 },
      { taxonomy:'Location > Domestic > Interior > Open-Plan',  score:80 },
      { taxonomy:'Location > Domestic > Interior > Pantry',     score:70 },
    ],
    objects: [
      { taxonomy:'Objects > Kitchenware > Cookware > Pots & Pans', score:97 },
      { taxonomy:'Objects > Food > Fresh > Ingredients',        score:95 },
      { taxonomy:'Objects > Kitchenware > Utensils > Chef Knife', score:90 },
      { taxonomy:'Objects > Kitchenware > Appliance > Oven',    score:87 },
      { taxonomy:'Objects > Kitchenware > Tableware > Plates',  score:82 },
      { taxonomy:'Objects > Food > Pantry > Herbs & Spices',    score:76 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Homely',               score:97 },
      { taxonomy:'Sentiment > Positive > Comforting',           score:95 },
      { taxonomy:'Sentiment > Positive > Wholesome',            score:92 },
      { taxonomy:'Sentiment > Social > Family-Oriented',        score:86 },
      { taxonomy:'Sentiment > Positive > Nostalgic',            score:80 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Cooking',               score:99 },
      { taxonomy:'IAB8 > Food & Drink > Recipes',               score:96 },
      { taxonomy:'IAB9 > Home & Garden > Kitchen',              score:90 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:85 },
      { taxonomy:'IAB8 > Food & Drink > Healthy Eating',        score:78 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
  'Family Life': {
    emotion: [
      { taxonomy:'Emotion > Social > Togetherness',             score:97 },
      { taxonomy:'Emotion > Positive > Love',                   score:95 },
      { taxonomy:'Emotion > Positive > Joy',                    score:93 },
      { taxonomy:'Emotion > Positive > Warmth',                 score:90 },
      { taxonomy:'Emotion > Social > Belonging',                score:87 },
      { taxonomy:'Emotion > Positive > Pride',                  score:80 },
      { taxonomy:'Emotion > Positive > Nostalgia',              score:72 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Living Room',score:95 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:93 },
      { taxonomy:'Location > Domestic > Interior > Dining Room',score:90 },
      { taxonomy:'Location > Domestic > Exterior > Backyard',   score:82 },
      { taxonomy:'Location > Retail > Grocery > Supermarket',   score:74 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Prepared > Home Meal',       score:92 },
      { taxonomy:'Objects > Kitchenware > Tableware > Family Set', score:88 },
      { taxonomy:'Objects > People > Family > Multi-Generation',score:95 },
      { taxonomy:'Objects > Domestic > Furniture > Dining Table',score:85 },
      { taxonomy:'Objects > Retail > Grocery > Shopping Bag',   score:72 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Social > Family-Oriented',        score:99 },
      { taxonomy:'Sentiment > Positive > Warm & Wholesome',     score:97 },
      { taxonomy:'Sentiment > Social > Inclusive',              score:93 },
      { taxonomy:'Sentiment > Positive > Comforting',           score:90 },
      { taxonomy:'Sentiment > Positive > Trustworthy',          score:86 },
    ],
    iab: [
      { taxonomy:'IAB25 > Family & Parenting > Family Life',    score:99 },
      { taxonomy:'IAB8 > Food & Drink > Family Meals',          score:95 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:90 },
      { taxonomy:'IAB25 > Family & Parenting > Parenting',      score:85 },
      { taxonomy:'IAB9 > Home & Garden > Home Life',            score:78 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
  'Snack & Entertaining': {
    emotion: [
      { taxonomy:'Emotion > Positive > Fun',                    score:94 },
      { taxonomy:'Emotion > Social > Celebration',              score:92 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:90 },
      { taxonomy:'Emotion > Social > Togetherness',             score:86 },
      { taxonomy:'Emotion > Positive > Excitement',             score:82 },
      { taxonomy:'Emotion > Positive > Indulgence',             score:78 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Living Room',score:95 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:90 },
      { taxonomy:'Location > Domestic > Interior > Dining Room',score:85 },
      { taxonomy:'Location > Domestic > Exterior > Patio',      score:78 },
      { taxonomy:'Location > Retail > Grocery > Snack Aisle',   score:72 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Snacks > Chips & Crisps',    score:96 },
      { taxonomy:'Objects > Food > Snacks > Dips & Spreads',    score:92 },
      { taxonomy:'Objects > Beverage > Soft Drink > Sparkling', score:88 },
      { taxonomy:'Objects > Food > Snacks > Cheese & Crackers', score:85 },
      { taxonomy:'Objects > Kitchenware > Tableware > Serving Board', score:80 },
      { taxonomy:'Objects > Food > Snacks > Fruit Platter',     score:74 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Social > Celebratory',            score:95 },
      { taxonomy:'Sentiment > Positive > Fun & Playful',        score:93 },
      { taxonomy:'Sentiment > Social > Hospitable',             score:89 },
      { taxonomy:'Sentiment > Positive > Indulgent',            score:82 },
      { taxonomy:'Sentiment > Positive > Relaxed',              score:78 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Snacks & Convenience',  score:98 },
      { taxonomy:'IAB8 > Food & Drink > Entertaining at Home',  score:95 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:90 },
      { taxonomy:'IAB25 > Family & Parenting > Hosting',        score:82 },
      { taxonomy:'IAB8 > Food & Drink > Party Food',            score:78 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:99 },
    ],
  },
  'Budget Living': {
    emotion: [
      { taxonomy:'Emotion > Positive > Empowerment',            score:92 },
      { taxonomy:'Emotion > Positive > Satisfaction',           score:90 },
      { taxonomy:'Emotion > Positive > Relief',                 score:88 },
      { taxonomy:'Emotion > Positive > Pride',                  score:84 },
      { taxonomy:'Emotion > Motivational > Practicality',       score:80 },
      { taxonomy:'Emotion > Positive > Confidence',             score:75 },
    ],
    location: [
      { taxonomy:'Location > Retail > Grocery > Supermarket',   score:96 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:90 },
      { taxonomy:'Location > Retail > Grocery > Sale Aisle',    score:86 },
      { taxonomy:'Location > Domestic > Interior > Pantry',     score:78 },
      { taxonomy:'Location > Retail > Market > Discount Market',score:70 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Packaged > Value Range',     score:95 },
      { taxonomy:'Objects > Retail > Payment > Coupons',        score:90 },
      { taxonomy:'Objects > Food > Fresh > Seasonal Produce',   score:87 },
      { taxonomy:'Objects > Retail > Grocery > Price Tag',      score:82 },
      { taxonomy:'Objects > Electronics > Mobile > Grocery App',score:75 },
      { taxonomy:'Objects > Kitchenware > Storage > Containers',score:68 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Value-Driven',         score:97 },
      { taxonomy:'Sentiment > Positive > Empowering',           score:95 },
      { taxonomy:'Sentiment > Positive > Practical',            score:92 },
      { taxonomy:'Sentiment > Positive > Trustworthy',          score:86 },
      { taxonomy:'Sentiment > Neutral > Informative',           score:78 },
    ],
    iab: [
      { taxonomy:'IAB13 > Personal Finance > Budgeting',        score:97 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:95 },
      { taxonomy:'IAB8 > Food & Drink > Budget Cooking',        score:92 },
      { taxonomy:'IAB25 > Family & Parenting > Family Budget',  score:88 },
      { taxonomy:'IAB8 > Food & Drink > Meal Planning',         score:83 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
  'Lifestyle & Wellness': {
    emotion: [
      { taxonomy:'Emotion > Positive > Vitality',               score:93 },
      { taxonomy:'Emotion > Calm > Serenity',                   score:90 },
      { taxonomy:'Emotion > Positive > Balance',                score:87 },
      { taxonomy:'Emotion > Positive > Hope',                   score:83 },
      { taxonomy:'Emotion > Positive > Confidence',             score:80 },
      { taxonomy:'Emotion > Motivational > Determination',      score:74 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:88 },
      { taxonomy:'Location > Domestic > Interior > Home Gym',   score:82 },
      { taxonomy:'Location > Outdoor > Park > Walking Path',    score:79 },
      { taxonomy:'Location > Retail > Health Food > Store',     score:74 },
      { taxonomy:'Location > Domestic > Interior > Dining Area',score:70 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Fresh > Superfoods',         score:94 },
      { taxonomy:'Objects > Food > Fresh > Vegetables',         score:92 },
      { taxonomy:'Objects > Beverage > Smoothie > Healthy',     score:88 },
      { taxonomy:'Objects > Kitchenware > Appliance > Blender', score:83 },
      { taxonomy:'Objects > Food > Packaged > Organic Range',   score:78 },
      { taxonomy:'Objects > Apparel > Athletic > Activewear',   score:70 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Balanced & Mindful',   score:95 },
      { taxonomy:'Sentiment > Positive > Inspirational',        score:92 },
      { taxonomy:'Sentiment > Positive > Healthy',              score:90 },
      { taxonomy:'Sentiment > Positive > Aspirational',         score:85 },
      { taxonomy:'Sentiment > Neutral > Educational',           score:74 },
    ],
    iab: [
      { taxonomy:'IAB7 > Health > Wellness',                    score:98 },
      { taxonomy:'IAB8 > Food & Drink > Healthy Eating',        score:96 },
      { taxonomy:'IAB7 > Health > Nutrition',                   score:92 },
      { taxonomy:'IAB9 > Fitness > Healthy Lifestyle',          score:88 },
      { taxonomy:'IAB8 > Food & Drink > Organic & Natural',     score:83 },
      { taxonomy:'IAB25 > Family & Parenting > Family Health',  score:76 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Health-Positive',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
    ],
  },
  'Food Discovery': {
    emotion: [
      { taxonomy:'Emotion > Positive > Curiosity',              score:95 },
      { taxonomy:'Emotion > Positive > Excitement',             score:92 },
      { taxonomy:'Emotion > Sensory > Appetite',                score:90 },
      { taxonomy:'Emotion > Positive > Surprise',               score:85 },
      { taxonomy:'Emotion > Positive > Joy',                    score:80 },
      { taxonomy:'Emotion > Positive > Adventurousness',        score:75 },
    ],
    location: [
      { taxonomy:'Location > Retail > Grocery > New Products Aisle', score:92 },
      { taxonomy:'Location > Retail > Market > Specialty Market', score:88 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:83 },
      { taxonomy:'Location > Retail > Grocery > World Foods',   score:78 },
      { taxonomy:'Location > Outdoor > Market > Street Food',   score:72 },
    ],
    objects: [
      { taxonomy:'Objects > Food > International > Global Cuisine', score:93 },
      { taxonomy:'Objects > Food > Specialty > Artisan Products', score:90 },
      { taxonomy:'Objects > Food > Fresh > Exotic Produce',     score:87 },
      { taxonomy:'Objects > Food > Packaged > New Products',    score:84 },
      { taxonomy:'Objects > Electronics > Mobile > Food App',   score:75 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Positive > Curious & Adventurous',score:96 },
      { taxonomy:'Sentiment > Positive > Exciting',             score:93 },
      { taxonomy:'Sentiment > Positive > Inspiring',            score:89 },
      { taxonomy:'Sentiment > Positive > Authentic',            score:83 },
      { taxonomy:'Sentiment > Neutral > Informative',           score:75 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > World Cuisine',         score:96 },
      { taxonomy:'IAB8 > Food & Drink > Food Trends',           score:94 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:88 },
      { taxonomy:'IAB8 > Food & Drink > Specialty Foods',       score:85 },
      { taxonomy:'IAB9 > Arts & Entertainment > Food Culture',  score:78 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
  'Kids & Family': {
    emotion: [
      { taxonomy:'Emotion > Positive > Joy',                    score:97 },
      { taxonomy:'Emotion > Social > Togetherness',             score:95 },
      { taxonomy:'Emotion > Positive > Love',                   score:92 },
      { taxonomy:'Emotion > Positive > Playfulness',            score:89 },
      { taxonomy:'Emotion > Social > Belonging',                score:86 },
      { taxonomy:'Emotion > Positive > Wonder',                 score:80 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:93 },
      { taxonomy:'Location > Domestic > Interior > Dining Room',score:92 },
      { taxonomy:'Location > Domestic > Exterior > Backyard',   score:85 },
      { taxonomy:'Location > Retail > Grocery > Supermarket',   score:80 },
      { taxonomy:'Location > Domestic > Interior > Living Room',score:78 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Kids > Healthy Kids Meal',   score:97 },
      { taxonomy:'Objects > People > Children > School Age',    score:95 },
      { taxonomy:'Objects > Food > Fresh > Colourful Produce',  score:90 },
      { taxonomy:'Objects > Kitchenware > Kids > Child-Safe',   score:85 },
      { taxonomy:'Objects > Food > Snacks > Healthy Snacks',    score:82 },
      { taxonomy:'Objects > Food > Packaged > Kids Range',      score:76 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Social > Family-Oriented',        score:99 },
      { taxonomy:'Sentiment > Positive > Playful & Joyful',     score:97 },
      { taxonomy:'Sentiment > Positive > Wholesome',            score:95 },
      { taxonomy:'Sentiment > Social > Nurturing',              score:90 },
      { taxonomy:'Sentiment > Positive > Fun',                  score:86 },
    ],
    iab: [
      { taxonomy:'IAB25 > Family & Parenting > Children',       score:99 },
      { taxonomy:'IAB8 > Food & Drink > Kids Meals',            score:97 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:90 },
      { taxonomy:'IAB25 > Family & Parenting > Family Life',    score:88 },
      { taxonomy:'IAB8 > Food & Drink > Healthy Kids Food',     score:85 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Child Safe',            score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
    ],
  },
  'Community & Local': {
    emotion: [
      { taxonomy:'Emotion > Social > Belonging',                score:93 },
      { taxonomy:'Emotion > Positive > Pride',                  score:91 },
      { taxonomy:'Emotion > Social > Togetherness',             score:88 },
      { taxonomy:'Emotion > Positive > Trust',                  score:85 },
      { taxonomy:'Emotion > Social > Connection',               score:82 },
      { taxonomy:'Emotion > Positive > Gratitude',              score:75 },
    ],
    location: [
      { taxonomy:'Location > Retail > Market > Local Market',   score:94 },
      { taxonomy:'Location > Retail > Grocery > Neighborhood Store', score:92 },
      { taxonomy:'Location > Community > Public > Local Square',score:85 },
      { taxonomy:'Location > Outdoor > Market > Street Market', score:80 },
      { taxonomy:'Location > Community > Event > Local Event',  score:74 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Local > Artisan Products',   score:93 },
      { taxonomy:'Objects > Food > Fresh > Local Produce',      score:91 },
      { taxonomy:'Objects > People > Community > Neighbours',   score:88 },
      { taxonomy:'Objects > Retail > Signage > Local Brand',    score:82 },
      { taxonomy:'Objects > Food > Fresh > Seasonal & Regional',score:76 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Social > Community-Driven',       score:97 },
      { taxonomy:'Sentiment > Positive > Trustworthy',          score:95 },
      { taxonomy:'Sentiment > Positive > Authentic',            score:92 },
      { taxonomy:'Sentiment > Social > Inclusive',              score:88 },
      { taxonomy:'Sentiment > Positive > Proud',                score:83 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:93 },
      { taxonomy:'IAB8 > Food & Drink > Local & Artisan',       score:91 },
      { taxonomy:'IAB10 > Community & Society > Local Community',score:88 },
      { taxonomy:'IAB8 > Food & Drink > Organic & Natural',     score:80 },
      { taxonomy:'IAB6 > Environment > Sustainability',         score:72 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
  'Seasonal Celebrations': {
    emotion: [
      { taxonomy:'Emotion > Social > Celebration',              score:96 },
      { taxonomy:'Emotion > Positive > Joy',                    score:95 },
      { taxonomy:'Emotion > Positive > Nostalgia',              score:91 },
      { taxonomy:'Emotion > Social > Togetherness',             score:89 },
      { taxonomy:'Emotion > Positive > Anticipation',           score:85 },
      { taxonomy:'Emotion > Positive > Warmth',                 score:82 },
    ],
    location: [
      { taxonomy:'Location > Domestic > Interior > Dining Room',score:95 },
      { taxonomy:'Location > Domestic > Interior > Kitchen',    score:92 },
      { taxonomy:'Location > Retail > Grocery > Seasonal Aisle',score:88 },
      { taxonomy:'Location > Domestic > Exterior > Garden',     score:80 },
      { taxonomy:'Location > Community > Event > Seasonal Event',score:72 },
    ],
    objects: [
      { taxonomy:'Objects > Food > Seasonal > Holiday Feast',   score:97 },
      { taxonomy:'Objects > Food > Baking > Seasonal Treats',   score:94 },
      { taxonomy:'Objects > Decor > Seasonal > Holiday Decor',  score:90 },
      { taxonomy:'Objects > Kitchenware > Tableware > Holiday Set', score:85 },
      { taxonomy:'Objects > Food > Fresh > Seasonal Produce',   score:82 },
      { taxonomy:'Objects > Food > Packaged > Seasonal Range',  score:76 },
    ],
    sentiment: [
      { taxonomy:'Sentiment > Social > Celebratory',            score:98 },
      { taxonomy:'Sentiment > Positive > Joyful & Festive',     score:96 },
      { taxonomy:'Sentiment > Social > Family-Oriented',        score:93 },
      { taxonomy:'Sentiment > Positive > Nostalgic',            score:88 },
      { taxonomy:'Sentiment > Positive > Warm & Welcoming',     score:85 },
    ],
    iab: [
      { taxonomy:'IAB8 > Food & Drink > Seasonal Cooking',      score:97 },
      { taxonomy:'IAB25 > Family & Parenting > Holidays',       score:96 },
      { taxonomy:'IAB8 > Food & Drink > Grocery & Supermarket', score:92 },
      { taxonomy:'IAB8 > Food & Drink > Entertaining at Home',  score:88 },
      { taxonomy:'IAB8 > Food & Drink > Baking',                score:84 },
    ],
    brandsafety: [
      { taxonomy:'Brand Safety > Safe > Family Friendly',       score:100 },
      { taxonomy:'Brand Safety > Safe > Positive Messaging',    score:100 },
      { taxonomy:'Brand Safety > Safe > Non-Violent',           score:100 },
      { taxonomy:'Brand Safety > Safe > Clean Language',        score:100 },
    ],
  },
};

function mp2GetMomentTaxonomy(momentName, tab) {
  var data = MP2_MOMENT_TAXONOMIES[momentName];
  if (data && data[tab]) return data[tab];
  // Fallback to global TX_MOMENT_DATA
  return TX_MOMENT_DATA[tab] || [];
}

// ── Refined stats store ───────────────────────────────────────────────────────
var mp2RefinedStats    = {}; // { momentName: { pods, cpm, impM } }
var mp2SelectedMoments = {}; // { momentName: true }
var mp2AnalysisMoments = null; // moments snapshot loaded from DB (array); null = use MOCK_MOMENTS_API
var mp2MomentType      = 'ads';  // 'ads' | 'organic'

// ── Moments filter state ──────────────────────────────────────────────────────
var mp2MfScore         = 'all';  // 'all' | 'high' | 'standard'
var mp2MfChannels      = [];     // selected channel names; [] = all
var mp2MfCpmMin        = 0;
var mp2MfCpmMax        = 50;
var mp2MfTypes         = [];     // [] = all; items: 'Live','VOD'
var mp2MfPlatforms     = [];     // [] = all; items: 'Roku','Vizio','Pluto'
var mp2MfPanelOpen     = false;
var mp2MfAccOpen       = { score:true, channel:false, cpm:false, type:false, platform:false };

// ── Refine modal ──────────────────────────────────────────────────────────────
var mp2ModalRefinements = {}; // { 'tab::taxonomy': 'up'|'down' }
var mp2ModalCurrentTab  = 'emotion';
var mp2ModalName = '';

function mp2InjectRefineStyles() {
  if (document.getElementById('mp2-refine-styles')) return;
  var s = document.createElement('style');
  s.id = 'mp2-refine-styles';
  s.textContent = [
    '.mp2-ref-row{display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid var(--border)}',
    '.mp2-ref-row:last-child{border-bottom:none}',
    '.mp2-ref-row:hover{background:var(--bg)}',
    '.mp2-thumb{width:26px;height:26px;border-radius:6px;border:1px solid var(--border-md);background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:background .12s,border-color .12s;flex-shrink:0;line-height:1}',
    '.mp2-thumb:hover{background:var(--bg)}',
    '.mp2-thumb--up.mp2-thumb--act{background:#f0fdf4;border-color:#86efac}',
    '.mp2-thumb--down.mp2-thumb--act{background:#fff1f2;border-color:#fca5a5}',
    '.mp2-rchip{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 6px 0 8px;border-radius:20px;font-size:11px;max-width:200px}',
    '.mp2-rchip--up{background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d}',
    '.mp2-rchip--down{background:#fff1f2;border:1px solid #fecaca;color:#b91c1c}',
    '.mp2-rchip-x{display:flex;align-items:center;justify-content:center;width:14px;height:14px;border:none;background:none;cursor:pointer;color:inherit;opacity:.6;padding:0;flex-shrink:0;border-radius:50%}',
    '.mp2-rchip-x:hover{opacity:1}',
    '.mp2-ref-section-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}',
    '.mp2-ref-section-label--up{color:#15803d}',
    '.mp2-ref-section-label--down{color:#b91c1c}',
    '@keyframes mp2KpiFlash{0%{color:var(--accent);transform:scale(1.12)}60%{color:var(--accent)}100%{color:var(--text);transform:scale(1)}}',
    '@keyframes mp2KpiResetFlash{0%{opacity:1}40%{opacity:.2}100%{opacity:1}}',
    '.mp2-kpi-flash{animation:mp2KpiFlash .55s cubic-bezier(.22,1,.36,1) both}',
    '.mp2-kpi-reset-flash{animation:mp2KpiResetFlash .35s ease-in-out both}',
    '.mp2-kpi-reset-btn{flex-shrink:0;margin-left:6px;align-self:flex-end;margin-bottom:1px;width:20px;height:20px;border:none;background:none;cursor:pointer;color:var(--faint);display:flex;align-items:center;justify-content:center;border-radius:50%;transition:color .12s,background .12s;padding:0}',
    '.mp2-kpi-reset-btn:hover{color:var(--text);background:var(--bg)}',
    '.mp2-ch-wrap:hover .mp2-ch-hover-tt{display:block!important}',
  ].join('');
  document.head.appendChild(s);
}

var MP2_REFINE_MOMENT_LABELS = ['Grocery Haul','Family Dinner','Healthy Eating','Fresh Produce','Meal Prep','Weekend BBQ','Snack Time','Baking & Sweets','Beverages','Quick & Easy'];

function mp2InitRefineScatter(momentName) {
  txLoadHighcharts(function() {
    var container = document.getElementById('mp2-refine-scatter-chart');
    if (!container) return;
    var nm = momentName.toLowerCase();
    var selIdx = 0;
    for (var i = 0; i < MP2_REFINE_MOMENT_LABELS.length; i++) {
      var words = MP2_REFINE_MOMENT_LABELS[i].toLowerCase().split(' ');
      if (words.some(function(w) { return nm.indexOf(w) !== -1; })) { selIdx = i; break; }
    }
    function bp(x,y,z,n) {
      var g=y>=80;
      return {x:x,y:y,z:z,name:n,color:g?'rgba(34,197,94,0.55)':'rgba(234,179,8,0.55)',marker:{lineColor:g?'#16a34a':'#ca8a04',lineWidth:1.5}};
    }
    var bubbleData = [
      bp(0,94,14,'Grocery & Supermarket'),bp(0,88,12,'Food & Drink'),       bp(0,82,11,'Family Meals'),
      bp(1,91,14,'Cooking'),              bp(1,86,13,'Food & Drink'),        bp(1,78,11,'Healthy Living'),
      bp(2,95,14,'Healthy Eating'),       bp(2,90,13,'Grocery & Supermarket'),bp(2,83,12,'Nutrition'),bp(2,74,10,'Fitness'),
      bp(3,93,14,'Grocery & Supermarket'),bp(3,87,13,'Produce'),             bp(3,81,12,'Organic Food'),
      bp(4,89,13,'Cooking'),              bp(4,84,12,'Meal Planning'),       bp(4,76,11,'Food & Drink'),
      bp(5,85,13,'Outdoor Dining'),       bp(5,79,11,'Grilling'),            bp(5,68,10,'Summer Food'),
      bp(6,80,12,'Snacks'),               bp(6,72,10,'Beverages'),           bp(6,65,9,'Convenience Food'),
      bp(7,88,13,'Baking'),               bp(7,82,12,'Desserts'),            bp(7,70,10,'Cooking'),
      bp(8,92,14,'Beverages'),            bp(8,86,13,'Grocery & Supermarket'),bp(8,78,11,'Healthy Drinks'),
      bp(9,90,14,'Cooking'),              bp(9,83,12,'Food & Drink'),        bp(9,73,10,'Quick Meals')
    ];
    Highcharts.chart('mp2-refine-scatter-chart', {
      chart:{type:'bubble',backgroundColor:'transparent',plotBorderWidth:0,height:null,margin:[10,12,72,12],animation:{duration:400},style:{fontFamily:'inherit'}},
      title:{text:null},legend:{enabled:false},credits:{enabled:false},exporting:{enabled:false},
      xAxis:{
        categories:MP2_REFINE_MOMENT_LABELS,
        gridLineWidth:1,gridLineColor:'#f1f5f9',lineWidth:0,tickLength:0,title:{text:null},
        labels:{style:{fontSize:'8px',color:'#5A6578'},rotation:-45,y:12},
        plotBands:[]
      },
      yAxis:{min:55,max:100,gridLineWidth:1,gridLineColor:'#f1f5f9',title:{text:null},labels:{enabled:false}},
      tooltip:{
        useHTML:true,backgroundColor:'#1e293b',borderColor:'#334155',borderRadius:8,
        style:{color:'#e2e8f0',fontSize:'11px'},
        formatter:function(){
          return '<b style="color:#f8fafc">'+this.point.name+'</b><br/>'
            +'<span style="color:#94a3b8">Moment: </span>'+MP2_REFINE_MOMENT_LABELS[this.x]+'<br/>'
            +'<span style="color:#94a3b8">Relevance: </span><b style="color:'+(this.y>=80?'#4ade80':'#fbbf24')+'">'+(this.y>=80?'High':'Standard')+'</b>';
        }
      },
      plotOptions:{bubble:{minSize:4,maxSize:16,sizeBy:'width',marker:{fillOpacity:0.6,lineWidth:1.5},states:{hover:{halo:{size:3}}},dataLabels:{enabled:false}}},
      series:[{name:'IAB Taxonomy',data:bubbleData,color:'#ED005E',marker:{lineColor:'#ED005E'}}]
    });
  });
}

function mp2OpenMomentModal(name, score, assets) {
  if (document.getElementById('tx-moment-modal')) return;
  mp2InjectRefineStyles();
  mp2ModalRefinements = {};
  mp2ModalCurrentTab  = 'objects';
  mp2ModalName        = name;

  var tabsHtml = TX_MODAL_TABS.map(function(t) {
    return '<div class="tx-mtab' + (t.id === 'objects' ? ' tx-mtab--act' : '') + '" id="tx-mtab-' + t.id + '" onclick="mp2RefineTab(\'' + t.id + '\')">' + t.label + '</div>';
  }).join('');

  var modal = document.createElement('div');
  modal.id = 'tx-moment-modal';
  modal.className = 'tx-modal-overlay';
  modal.innerHTML =
    '<div class="tx-modal" onclick="event.stopPropagation()" style="width:1100px;max-width:calc(100vw - 32px)">'

    // Header
    + '<div class="tx-modal-header">'
    +   '<div>'
    +     '<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:3px">Refine Moment</div>'
    +     '<div class="tx-modal-title">' + name + '</div>'
    +   '</div>'
    +   '<button class="tx-modal-close" onclick="txCloseMomentModal()">'
    +     '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    +   '</button>'
    + '</div>'

    // Body — 2 columns, fixed height = 10 rows (~48px each) + tab nav (~42px)
    + '<div style="display:grid;grid-template-columns:1fr 220px;height:520px;overflow:hidden;border-bottom:1px solid var(--border)">'

    //   Left: tab nav + [scatter chart | taxonomy list]
    +   '<div style="display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--border)">'
    +     '<div class="tx-mtabs-nav">' + tabsHtml + '</div>'
    +     '<div style="display:flex;flex:1;min-height:0;overflow:hidden">'
    +       '<div style="width:370px;flex-shrink:0;border-right:1px solid var(--border);height:100%;display:flex;flex-direction:column">'
    +         '<div id="mp2-refine-scatter-chart" style="width:100%;flex:1;min-height:0"></div>'
    +       '</div>'
    +       '<div style="flex:1;overflow-y:auto;min-height:0" id="mp2-refine-body"></div>'
    +     '</div>'
    +   '</div>'

    //   Right: refinements panel
    +   '<div style="display:flex;flex-direction:column;padding:14px;overflow-y:auto;gap:0">'
    +     '<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:10px">Your Refinements</div>'
    +     '<div id="mp2-refine-chips-empty" style="font-size:12px;color:var(--faint);text-align:center;padding:20px 0;line-height:1.7">Rate taxonomies<br>to refine this moment</div>'
    +     '<div id="mp2-refine-chips" style="display:none"></div>'
    +   '</div>'
    + '</div>'

    // Footer
    + '<div style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">'
    +   '<button onclick="mp2ResetRefinements()" style="font-size:12px;font-family:inherit;border:none;background:none;color:var(--faint);cursor:pointer;padding:4px 8px;border-radius:6px;transition:color .12s" onmouseenter="this.style.color=\'var(--text)\'" onmouseleave="this.style.color=\'var(--faint)\'">Reset all</button>'
    +   '<button onclick="mp2SubmitRefinements(\'' + name.replace(/'/g, "\\'") + '\',' + score + ',' + assets + ')" style="height:34px;padding:0 18px;font-size:12px;font-weight:500;font-family:inherit;background:var(--accent);color:#fff;border:none;border-radius:8px;cursor:pointer;transition:opacity .13s" onmouseenter="this.style.opacity=\'.88\'" onmouseleave="this.style.opacity=\'1\'">Apply Refinement</button>'
    + '</div>'

    + '</div>';

  modal.addEventListener('click', txCloseMomentModal);
  document.body.appendChild(modal);
  setTimeout(function() {
    modal.classList.add('tx-modal-overlay--in');
    mp2RefineTab('objects');
    mp2InitRefineScatter(name);
  }, 10);
}

function mp2RefineTab(tab) {
  mp2ModalCurrentTab = tab;
  TX_MODAL_TABS.forEach(function(t) {
    var el = document.getElementById('tx-mtab-' + t.id);
    if (el) el.className = 'tx-mtab' + (t.id === tab ? ' tx-mtab--act' : '');
  });
  var rows = mp2GetMomentTaxonomy(mp2ModalName, tab).slice().sort(function(a, b) { return b.score - a.score; });
  var body = document.getElementById('mp2-refine-body');
  if (!body) return;
  body.innerHTML = rows.map(function(r) {
    var key   = tab + '::' + r.taxonomy;
    var state = mp2ModalRefinements[key] || '';
    return '<div class="mp2-ref-row">'
      + '<div style="flex:1;min-width:0">'
      +   '<div style="font-size:12px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + r.taxonomy + '</div>'
      + '</div>'
      + '<div style="flex-shrink:0">' + (r.score >= 70 ? '<span style="background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:700">High Match</span>' : '<span style="background:#fffbeb;border:1px solid #fde68a;color:#d97706;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:700">Standard Match</span>') + '</div>'
      + '<button class="mp2-thumb mp2-thumb--up' + (state === 'up' ? ' mp2-thumb--act' : '') + '" onclick="mp2ToggleRefinement(\'' + tab + '\',\'' + r.taxonomy.replace(/'/g, "\\'") + '\',\'up\')" title="Boost"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></button>'
      + '<button class="mp2-thumb mp2-thumb--down' + (state === 'down' ? ' mp2-thumb--act' : '') + '" onclick="mp2ToggleRefinement(\'' + tab + '\',\'' + r.taxonomy.replace(/'/g, "\\'") + '\',\'down\')" title="Exclude"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg></button>'
      + '</div>';
  }).join('');
}

function mp2ToggleRefinement(tab, taxonomy, dir) {
  var key = tab + '::' + taxonomy;
  mp2ModalRefinements[key] = (mp2ModalRefinements[key] === dir) ? '' : dir;
  mp2RefineTab(tab);
  mp2RenderRefineChips();
}

function mp2RenderRefineChips() {
  var empty   = document.getElementById('mp2-refine-chips-empty');
  var content = document.getElementById('mp2-refine-chips');
  if (!empty || !content) return;

  var ups   = [];
  var downs = [];
  Object.keys(mp2ModalRefinements).forEach(function(key) {
    var val = mp2ModalRefinements[key];
    if (!val) return;
    var parts    = key.split('::');
    var tab      = parts[0];
    var taxonomy = parts.slice(1).join('::');
    var segs     = taxonomy.split('>').map(function(s) { return s.trim(); });
    var chipLabel = segs.length > 1 ? segs[0] + ' › ' + segs[segs.length - 1] : segs[0];
    var entry    = { key: key, leaf: chipLabel };
    if (val === 'up')   ups.push(entry);
    else                downs.push(entry);
  });

  if (!ups.length && !downs.length) {
    empty.style.display   = '';
    content.style.display = 'none';
    content.innerHTML     = '';
    return;
  }
  empty.style.display   = 'none';
  content.style.display = '';

  var renderGroup = function(items, cls, sectionCls, icon) {
    if (!items.length) return '';
    return '<div style="margin-bottom:12px">'
      + '<div class="mp2-ref-section-label mp2-ref-section-label--' + sectionCls + '">' + icon + ' ' + (sectionCls === 'up' ? 'Boost' : 'Exclude') + '</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:5px">'
      + items.map(function(e) {
          return '<div class="mp2-rchip mp2-rchip--' + cls + '">'
            + '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + e.leaf + '</span>'
            + '<button class="mp2-rchip-x" onclick="mp2RemoveRefinement(\'' + e.key.replace(/'/g, "\\'") + '\')" title="Remove">'
            + '<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
            + '</button>'
            + '</div>';
        }).join('')
      + '</div>'
      + '</div>';
  };

  var icoUp   = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>';
  var icoDn   = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>';
  content.innerHTML = renderGroup(ups, 'up', 'up', icoUp) + renderGroup(downs, 'down', 'down', icoDn);
}

function mp2RemoveRefinement(key) {
  delete mp2ModalRefinements[key];
  mp2RefineTab(mp2ModalCurrentTab);
  mp2RenderRefineChips();
}

function mp2ResetRefinements() {
  mp2ModalRefinements = {};
  mp2RefineTab(mp2ModalCurrentTab);
  mp2RenderRefineChips();
}

function mp2SubmitRefinements(name, score, assets) {
  var seed    = name.split('').reduce(function(a, ch) { return a + ch.charCodeAt(0); }, 0);
  var baseCpm = 12 + ((score + seed) % 24);
  var baseImp = 1.5 + ((seed * 3 + score * 7) % 85) / 10;

  var boosts   = Object.values(mp2ModalRefinements).filter(function(v) { return v === 'up'; }).length;
  var excludes = Object.values(mp2ModalRefinements).filter(function(v) { return v === 'down'; }).length;

  if (!boosts && !excludes) { txCloseMomentModal(); return; }

  var invFactor = 1 + boosts * 0.07 - excludes * 0.09;
  var cpmFactor = 1 - boosts * 0.025 + excludes * 0.04;
  var impFactor = 1 + boosts * 0.09  - excludes * 0.11;

  mp2RefinedStats[name] = {
    pods: Math.round(assets * Math.max(invFactor, 0.1)),
    cpm:       Math.round(Math.max(baseCpm * cpmFactor, 5)),
    impM:      Math.max(baseImp * impFactor, 0.1).toFixed(1),
    boosts:    boosts,
    excludes:  excludes
  };

  txCloseMomentModal();
  mp2RenderMoments();
  // Animate updated KPI values
  var safeId = name.replace(/[^a-zA-Z0-9]/g, '-');
  setTimeout(function() {
    ['mp2-kv-inv-', 'mp2-kv-imp-', 'mp2-kv-cpm-'].forEach(function(prefix) {
      var el = document.getElementById(prefix + safeId);
      if (!el) return;
      el.classList.remove('mp2-kpi-flash');
      void el.offsetWidth; // force reflow to restart animation
      el.classList.add('mp2-kpi-flash');
    });
  }, 30);
}

function mp2SetMomentType(type) {
  if (mp2MomentType === type) return;
  mp2MomentType = type;

  // Update toggle button styles immediately (no wait for full re-render)
  var segBase = 'border:none;padding:4px 12px;border-radius:16px;font-size:11px;font-weight:500;font-family:inherit;cursor:pointer;transition:background .12s,color .12s,box-shadow .12s;white-space:nowrap;line-height:1.4';
  var segAct  = segBase + ';background:var(--surface);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.1)';
  var segOff  = segBase + ';background:transparent;color:var(--faint)';
  ['ads','organic','live'].forEach(function(t) {
    var btn = document.querySelector('[onclick="mp2SetMomentType(\'' + t + '\')"]');
    if (btn) btn.style.cssText = t === type ? segAct : segOff;
  });

  // Show skeleton loader in scroll area
  var scrollWrap = document.getElementById('mp2-moments-scroll');
  if (scrollWrap) scrollWrap.innerHTML = mp2MomentSkeletonHtml(type);

  // After brief delay, full re-render with new supply
  setTimeout(mp2RenderMoments, 520);
}

function mp2MomentSkeletonHtml(type) {
  var n = type === 'live' ? 6 : type === 'ads' ? 10 : 16;
  var GRID = 'display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding-bottom:16px';
  var card =
    '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden">'
    + '<div style="width:100%;padding-top:44%;position:relative"><div class="mp2-skel" style="position:absolute;inset:0;border-radius:0"></div></div>'
    + '<div style="padding:9px 10px 11px">'
    +   '<div class="mp2-skel" style="height:11px;width:65%;margin-bottom:14px"></div>'
    +   '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">'
    +     '<div class="mp2-skel" style="height:28px"></div>'
    +     '<div class="mp2-skel" style="height:28px"></div>'
    +     '<div class="mp2-skel" style="height:28px"></div>'
    +   '</div>'
    +   '<div class="mp2-skel" style="height:26px;border-radius:6px"></div>'
    + '</div>'
    + '</div>';
  var cards = '';
  for (var i = 0; i < n; i++) cards += card;
  return '<div style="' + GRID + '">' + cards + '</div>';
}

// ── Moments filter panel ──────────────────────────────────────────────────────
var MP2_MF_ALL_CHANNELS  = ['NBC','Fox','ABC','CBS','HBO','Peacock','Bravo','Discovery','ESPN','TNT','TBS','AMC'];
var MP2_MF_ALL_PLATFORMS = ['Roku','Vizio','Pluto'];

function mp2ToggleMfPanel() {
  if (mp2MfPanelOpen) { mp2CloseMfPanel(); } else { mp2OpenMfPanel(); }
}

function mp2OpenMfPanel() {
  mp2MfPanelOpen = true;
  var btn = document.getElementById('mp2-mf-btn');
  if (!btn) return;

  var existing = document.getElementById('mp2-mf-panel');
  if (existing) existing.remove();

  var panel = document.createElement('div');
  panel.id = 'mp2-mf-panel';
  panel.style.cssText = 'position:fixed;width:264px;background:var(--surface);border:1px solid var(--border-md,var(--border));border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.14);padding:14px;z-index:9999;display:flex;flex-direction:column;max-height:520px;overflow:hidden';
  document.body.appendChild(panel);

  var r = btn.getBoundingClientRect();
  panel.style.top   = (r.bottom + 4) + 'px';
  panel.style.right = (window.innerWidth - r.right) + 'px';
  panel.style.left  = 'auto';
  panel.style.maxHeight = (window.innerHeight - r.bottom - 20) + 'px';

  mp2BuildMfPanel(panel);

  setTimeout(function() {
    document.addEventListener('click', function _mfOut(e) {
      var p = document.getElementById('mp2-mf-panel');
      var b = document.getElementById('mp2-mf-btn');
      if (p && !p.contains(e.target) && b && !b.contains(e.target)) {
        mp2CloseMfPanel();
        document.removeEventListener('click', _mfOut);
      }
    });
  }, 0);
}

function mp2CloseMfPanel() {
  mp2MfPanelOpen = false;
  var panel = document.getElementById('mp2-mf-panel');
  if (panel) panel.remove();
}

function mp2BuildMfPanel(panel) {
  if (!panel) panel = document.getElementById('mp2-mf-panel');
  if (!panel) return;

  var activeCount = (mp2MfScore !== 'all' ? 1 : 0) + mp2MfChannels.length + (mp2MfCpmMin > 0 || mp2MfCpmMax < 50 ? 1 : 0) + mp2MfPlatforms.length;

  function acc(key, label, bodyHtml) {
    var open = !!mp2MfAccOpen[key];
    return '<div style="border-bottom:1px solid var(--border)">'
      + '<div onclick="mp2ToggleMfAcc(\'' + key + '\')" style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;cursor:pointer;user-select:none">'
      +   '<span style="font-size:11px;font-weight:600;color:var(--text)">' + label + '</span>'
      +   '<svg style="transform:rotate(' + (open ? '180' : '0') + 'deg);transition:transform .15s;flex-shrink:0" id="mp2-mf-chev-' + key + '" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '</div>'
      + '<div id="mp2-mf-body-' + key + '" style="' + (open ? 'padding-bottom:10px' : 'display:none') + '">'
      +   bodyHtml
      + '</div>'
      + '</div>';
  }

  // Match Score — radio group
  var scoreBody = ['all','high','standard'].map(function(v) {
    var lbl = v === 'all' ? 'All' : v === 'high' ? 'High Match' : 'Standard Match';
    return '<label style="display:flex;align-items:center;gap:7px;padding:3px 0;cursor:pointer;font-size:12px;color:var(--text)">'
      + '<input type="radio" name="mp2mfscore" value="' + v + '"' + (mp2MfScore === v ? ' checked' : '') + ' onchange="mp2MfSetScore(\'' + v + '\')" style="accent-color:var(--accent);cursor:pointer">'
      + lbl + '</label>';
  }).join('');

  // Channel — search + checkboxes
  var channelBody =
    '<input id="mp2-mf-ch-search" class="inv-fp-search" placeholder="Search…" oninput="mp2MfSearch(this,\'channel\')" style="margin-bottom:6px">'
    + '<div id="mp2-mf-opts-channel" style="max-height:120px;overflow-y:auto">'
    + '<label style="display:flex;align-items:center;gap:7px;padding:3px 0;cursor:pointer;font-size:12px;color:var(--text)">'
    +   '<input type="checkbox"' + (mp2MfChannels.length === 0 ? ' checked' : '') + ' onchange="mp2MfSetAllChannels()" style="accent-color:var(--accent);cursor:pointer">All</label>'
    + MP2_MF_ALL_CHANNELS.map(function(ch) {
        return '<label class="mp2-mf-ch-opt" style="display:flex;align-items:center;gap:7px;padding:3px 0;cursor:pointer;font-size:12px;color:var(--text)">'
          + '<input type="checkbox"' + (mp2MfChannels.indexOf(ch) >= 0 ? ' checked' : '') + ' onchange="mp2MfToggleCh(\'' + ch + '\',this.checked)" style="accent-color:var(--accent);cursor:pointer">'
          + ch + '</label>';
      }).join('')
    + '</div>';

  // CPM dual-thumb slider
  var pctMin = (mp2MfCpmMin / 50) * 100;
  var pctMax = (mp2MfCpmMax / 50) * 100;
  var cpmBody =
    '<div style="padding:4px 0 10px">'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:14px">'
    +   '<span style="font-size:11px;color:var(--muted)">CPM Range</span>'
    +   '<span id="mp2-mf-cpm-label" style="font-size:11px;font-weight:600;color:var(--text)">$' + mp2MfCpmMin + ' – $' + mp2MfCpmMax + '</span>'
    + '</div>'
    + '<div class="mp2-dual-range" style="position:relative;height:18px;margin:0 2px">'
    +   '<div style="position:absolute;top:50%;left:0;right:0;height:2px;background:var(--border);border-radius:2px;transform:translateY(-50%);z-index:0"></div>'
    +   '<div id="mp2-cpm-fill" style="position:absolute;top:50%;left:' + pctMin + '%;width:' + (pctMax - pctMin) + '%;height:2px;background:var(--accent);border-radius:2px;transform:translateY(-50%);z-index:1;pointer-events:none"></div>'
    +   '<input id="mp2-cpm-min" type="range" min="0" max="50" value="' + mp2MfCpmMin + '" oninput="mp2MfDualSlider(\'min\',this.value)" onchange="mp2MfCpmCommit()" style="position:absolute;inset:0;width:100%;appearance:none;-webkit-appearance:none;background:transparent;margin:0;z-index:2;pointer-events:none">'
    +   '<input id="mp2-cpm-max" type="range" min="0" max="50" value="' + mp2MfCpmMax + '" oninput="mp2MfDualSlider(\'max\',this.value)" onchange="mp2MfCpmCommit()" style="position:absolute;inset:0;width:100%;appearance:none;-webkit-appearance:none;background:transparent;margin:0;z-index:2;pointer-events:none">'
    + '</div>'
    + '<div style="display:flex;justify-content:space-between;margin-top:6px"><span style="font-size:10px;color:var(--faint)">$0</span><span style="font-size:10px;color:var(--faint)">$50</span></div>'
    + '</div>';

  // Platform checkboxes
  var platformBody =
    '<div style="display:flex;flex-direction:column;gap:4px">'
    + '<label style="display:flex;align-items:center;gap:7px;padding:3px 0;cursor:pointer;font-size:12px;color:var(--text)">'
    +   '<input type="checkbox"' + (mp2MfPlatforms.length === 0 ? ' checked' : '') + ' onchange="mp2MfSetAllPlatforms()" style="accent-color:var(--accent);cursor:pointer">All</label>'
    + MP2_MF_ALL_PLATFORMS.map(function(p) {
        return '<label style="display:flex;align-items:center;gap:7px;padding:3px 0;cursor:pointer;font-size:12px;color:var(--text)">'
          + '<input type="checkbox"' + (mp2MfPlatforms.indexOf(p) >= 0 ? ' checked' : '') + ' onchange="mp2MfTogglePlatform(\'' + p + '\',this.checked)" style="accent-color:var(--accent);cursor:pointer">'
          + p + '</label>';
      }).join('')
    + '</div>';

  panel.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-shrink:0">'
    +   '<span style="font-size:13px;font-weight:600;color:var(--text)">Filters</span>'
    +   '<div style="display:flex;gap:10px;align-items:center">'
    +     (activeCount > 0 ? '<span style="font-size:11px;color:var(--faint);cursor:pointer" onclick="mp2MfClearAll()">Clear all</span>' : '')
    +     '<button onclick="mp2CloseMfPanel()" style="background:none;border:none;cursor:pointer;color:var(--faint);font-size:20px;line-height:1;padding:0 2px">×</button>'
    +   '</div>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;min-height:0">'
    +   acc('score',    'Match Score', scoreBody)
    +   acc('channel',  'Channel',     channelBody)
    +   acc('cpm',      'CPM',         cpmBody)
    +   acc('platform', 'Platform',    platformBody)
    + '</div>';
}

function mp2ToggleMfAcc(key) {
  mp2MfAccOpen[key] = !mp2MfAccOpen[key];
  var body = document.getElementById('mp2-mf-body-' + key);
  var chev = document.getElementById('mp2-mf-chev-' + key);
  if (body) { body.style.display = mp2MfAccOpen[key] ? '' : 'none'; if (mp2MfAccOpen[key]) body.style.paddingBottom = '10px'; }
  if (chev) chev.style.transform = 'rotate(' + (mp2MfAccOpen[key] ? 180 : 0) + 'deg)';
}

function mp2MfSearch(input, type) {
  var q = input.value.toLowerCase();
  if (type === 'channel') {
    document.querySelectorAll('.mp2-mf-ch-opt').forEach(function(el) {
      el.style.display = el.querySelector('input').value.toLowerCase().indexOf(q) >= 0 || el.textContent.trim().toLowerCase().indexOf(q) >= 0 ? '' : 'none';
    });
  }
}

function mp2MfSetScore(val) {
  mp2MfScore = val;
  mp2RenderMoments();
  mp2BuildMfPanel();
}

function mp2MfToggleCh(ch, checked) {
  if (checked && mp2MfChannels.indexOf(ch) < 0) mp2MfChannels.push(ch);
  else if (!checked) mp2MfChannels = mp2MfChannels.filter(function(v){ return v !== ch; });
  mp2RenderMoments();
  mp2BuildMfPanel();
}
function mp2MfSetAllChannels() { mp2MfChannels = []; mp2RenderMoments(); mp2BuildMfPanel(); }

function mp2MfDualSlider(which, val) {
  val = parseInt(val) || 0;
  if (which === 'min') {
    mp2MfCpmMin = Math.min(val, mp2MfCpmMax);
    var inp = document.getElementById('mp2-cpm-min');
    if (inp) inp.value = mp2MfCpmMin;
  } else {
    mp2MfCpmMax = Math.max(val, mp2MfCpmMin);
    var inp = document.getElementById('mp2-cpm-max');
    if (inp) inp.value = mp2MfCpmMax;
  }
  var lbl  = document.getElementById('mp2-mf-cpm-label');
  var fill = document.getElementById('mp2-cpm-fill');
  if (lbl)  lbl.textContent = '$' + mp2MfCpmMin + ' – $' + mp2MfCpmMax;
  if (fill) { fill.style.left = (mp2MfCpmMin / 50 * 100) + '%'; fill.style.width = ((mp2MfCpmMax - mp2MfCpmMin) / 50 * 100) + '%'; }
}
function mp2MfCpmCommit() {
  mp2RenderMoments();
}

function mp2MfToggleType(t, checked) {
  if (checked && mp2MfTypes.indexOf(t) < 0) mp2MfTypes.push(t);
  else if (!checked) mp2MfTypes = mp2MfTypes.filter(function(v){ return v !== t; });
  mp2RenderMoments(); mp2BuildMfPanel();
}
function mp2MfSetAllTypes() { mp2MfTypes = []; mp2RenderMoments(); mp2BuildMfPanel(); }

function mp2MfTogglePlatform(p, checked) {
  if (checked && mp2MfPlatforms.indexOf(p) < 0) mp2MfPlatforms.push(p);
  else if (!checked) mp2MfPlatforms = mp2MfPlatforms.filter(function(v){ return v !== p; });
  mp2RenderMoments(); mp2BuildMfPanel();
}
function mp2MfSetAllPlatforms() { mp2MfPlatforms = []; mp2RenderMoments(); mp2BuildMfPanel(); }

function mp2MfClearAll() {
  mp2MfScore = 'all'; mp2MfChannels = []; mp2MfCpmMin = 0; mp2MfCpmMax = 50; mp2MfTypes = []; mp2MfPlatforms = [];
  mp2RenderMoments(); mp2BuildMfPanel();
}

function mp2ToggleMomentCard(name) {
  if (_mp2IsLocked()) return;
  if (mp2SelectedMoments[name]) {
    delete mp2SelectedMoments[name];
  } else {
    mp2SelectedMoments[name] = true;
    // Auto-open the sidebar cart if closed
    var strip = document.getElementById('mp2-asset-strip');
    if (strip && strip.style.display !== 'flex') mp2ToggleSidebar('plan');
  }
  var safeId = name.replace(/[^a-zA-Z0-9]/g, '-');
  var card = document.getElementById('mp2-mcard-' + safeId);
  if (card) card.classList.toggle('mp2-mcard--sel', !!mp2SelectedMoments[name]);
  var cb = document.getElementById('mp2-cb-' + safeId);
  if (cb) cb.checked = !!mp2SelectedMoments[name];
  mp2UpdateMomentMpBadge();
  mp2RenderMomentsMediaPlan();
}

function mp2UpdateMomentMpBadge() {
  var badge = document.getElementById('mp2-mp-badge');
  var count = Object.keys(mp2SelectedMoments).length;
  if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline' : 'none'; }
}

function mp2ToggleMomentMediaPlan() {
  mp2ToggleAssetStrip();
}

function mp2RenderMomentsMediaPlan() {
  var body = document.getElementById('mp2-strip-plan-body');
  if (!body) return;
  mp2UpdateMomentMpBadge();
  var names = Object.keys(mp2SelectedMoments).filter(function(n) { return mp2SelectedMoments[n]; });

  if (names.length === 0) {
    body.innerHTML =
      '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:12px">Build Moments Group</div>'
      + '<div style="display:flex;align-items:center;justify-content:center;text-align:center;color:var(--faint);font-size:12px;padding:20px 8px">Click a moment card to add it to your media plan</div>';
    var totalsEl = document.getElementById('mp2-strip-plan-totals');
    if (totalsEl) totalsEl.style.display = 'none';
    return;
  }

  // ── Look up all moments from DB snapshot (or MOCK_MOMENTS_API if not loaded) ──
  var _mSrc = mp2AnalysisMoments || MOCK_MOMENTS_API || [];
  var momentData = names.map(function(n) {
    var m = _mSrc.find(function(x) { return x.moment_name === n; }) || {};
    var score = (m.moment_score !== undefined && m.moment_score !== null) ? m.moment_score : null;
    var isHigh = score !== null && score >= 75;
    return {
      name:     m.moment_name || n,
      score:    score,
      isHigh:   isHigh,
      impM:     m.est_impressions ? (m.est_impressions / 1000000).toFixed(1) + 'M' : '—',
      cpm:      m.est_cpm        ? '$' + m.est_cpm.toFixed(2)                       : '—',
      pods:     m.pods           ? m.pods.toLocaleString()                           : '—',
      totalImp: m.est_impressions || 0,
    };
  });

  var totalImpM = momentData.reduce(function(s, d) { return s + d.totalImp; }, 0) / 1000000;

  function statCell(label, val) {
    return '<div>'
      + '<div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);margin-bottom:1px">' + label + '</div>'
      + '<div style="font-size:11px;font-weight:600;color:var(--text)">' + val + '</div>'
      + '</div>';
  }

  // ── Render moment cards in body ──
  body.innerHTML =
    '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:10px;display:flex;align-items:center;justify-content:space-between">'
    + '<span>Build Moments Group <span style="font-size:10px;background:var(--accent);color:#fff;border-radius:20px;padding:1px 7px;margin-left:4px">' + names.length + '</span></span>'
    + '<span style="font-size:10px;color:var(--faint);cursor:pointer;font-weight:400" onclick="mp2ClearMomentSelection()">Clear all</span>'
    + '</div>'
    + '<div style="display:flex;flex-direction:column;gap:7px">'
    + momentData.map(function(d) {
        var scoreBadge = d.score !== null
          ? '<span style="display:inline-block;font-size:9px;font-weight:600;letter-spacing:.3px;border-radius:20px;padding:1px 5px;margin-left:5px;flex-shrink:0;'
            + (d.isHigh
                ? 'background:#dcfce7;color:#166534'
                : 'background:var(--border);color:var(--faint)')
            + '">' + (d.isHigh ? 'High' : 'Standard') + '</span>'
          : '';
        return '<div style="padding:8px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">'
          + '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px">'
          +   '<div style="display:flex;align-items:center;flex:1;min-width:0;gap:0;overflow:hidden">'
          +     '<span style="font-size:11px;font-weight:600;color:var(--text);line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + d.name + '</span>'
          +     scoreBadge
          +   '</div>'
          +   '<span style="font-size:14px;color:var(--faint);cursor:pointer;flex-shrink:0;line-height:1;margin-left:6px" onclick="mp2ToggleMomentCard(\'' + d.name.replace(/'/g, "\\'") + '\')">×</span>'
          + '</div>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">'
          +   statCell('Impr.', d.impM)
          +   statCell('CPM',   d.cpm)
          +   statCell('Pods',  d.pods)
          + '</div>'
          + '</div>';
      }).join('')
    + '</div>';

  // ── Totals in sticky footer slot ──
  var totalsEl = document.getElementById('mp2-strip-plan-totals');
  if (totalsEl) {
    totalsEl.style.display = 'block';
    totalsEl.innerHTML =
      '<div style="display:flex;justify-content:space-between;margin-bottom:4px">'
      +   '<span style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">Total Moments</span>'
      +   '<span style="font-size:12px;font-weight:700;color:var(--text)">' + names.length + '</span>'
      + '</div>'
      + '<div style="display:flex;justify-content:space-between">'
      +   '<span style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">Est. Impressions</span>'
      +   '<span style="font-size:12px;font-weight:700;color:var(--text)">' + totalImpM.toFixed(1) + 'M</span>'
      + '</div>';
  }

  // ── Unsplash thumbnails (background fetch, stored for future use) ──
  momentData.forEach(function(d) {
    fetch('/api/unsplash?q=' + encodeURIComponent(d.name + ' tv moment'))
      .then(function(r) { return r.ok ? r.json() : null; })
      .catch(function() { return null; });
  });
}

function mp2GeneratePlanName() {
  var names  = Object.keys(mp2SelectedMoments).filter(function(n) { return mp2SelectedMoments[n]; });
  var camp   = (mp2SelectedCampaign && mp2SelectedCampaign.name) ? mp2SelectedCampaign.name : '';
  var month  = new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  var momentPart = '';
  if (names.length === 1) {
    momentPart = names[0];
  } else if (names.length === 2) {
    momentPart = names[0] + ' & ' + names[1];
  } else if (names.length > 2) {
    momentPart = names[0] + ' +' + (names.length - 1) + ' moments';
  } else {
    momentPart = 'Moments Plan';
  }

  var generated = (camp ? camp + ' — ' : '') + momentPart + ' · ' + month;

  var input = document.getElementById('mp2-plan-name-input');
  if (input) {
    input.value = generated;
    input.focus();
    // Brief flash to signal it was filled
    input.style.borderColor = 'var(--accent)';
    setTimeout(function() { input.style.borderColor = 'var(--border-md)'; }, 800);
  }
}

function mp2ClearMomentSelection() {
  mp2SelectedMoments = {};
  // Re-render only the Plan Builder sidebar, not the whole Moments panel
  mp2RenderMomentsMediaPlan();
  // Also update any visible moment card selection states without a full re-render
  document.querySelectorAll('.mp2-mcard--sel').forEach(function(el) {
    el.classList.remove('mp2-mcard--sel');
  });
  document.querySelectorAll('.mp2-mcard-cb').forEach(function(cb) {
    cb.checked = false;
  });
}

function mp2ResetCard(name) {
  // Flash-out animation on current values, then re-render
  var safeId = name.replace(/[^a-zA-Z0-9]/g, '-');
  ['mp2-kv-inv-', 'mp2-kv-imp-', 'mp2-kv-cpm-'].forEach(function(prefix) {
    var el = document.getElementById(prefix + safeId);
    if (el) el.classList.add('mp2-kpi-reset-flash');
  });
  setTimeout(function() {
    delete mp2RefinedStats[name];
    mp2RenderMoments();
  }, 320);
}

// ── Ad Analysis (v2 only) ─────────────────────────────────────────────────────

var txAdAnalysisJsonOpen = false;
var txAdModalIabHtml     = '';
var txAdModalCompHtml    = '';
var txAdModalObjectsHtml = '';
var txAdModalJsonStr     = '';

var TX_AD_FRAMES = [
  { time: '00:02',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=480&h=270&fit=crop&q=80',
    objects: [{ n:'Grocery Store', c:100 }, { n:'Supermarket', c:100 }, { n:'Shelf', c:99 }, { n:'Produce', c:99 }, { n:'Vegetables', c:98 }, { n:'Indoors', c:100 }],
    boxes: [{ t:5,l:2,w:35,h:88 }, { t:5,l:40,w:35,h:88 }, { t:8,l:6,w:28,h:42 }] },
  { time: '00:08',
    img: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=480&h=270&fit=crop&q=80',
    objects: [{ n:'Fruit', c:100 }, { n:'Produce', c:99 }, { n:'Food', c:100 }, { n:'Market', c:97 }, { n:'Grocery Store', c:96 }, { n:'Colorful', c:94 }],
    boxes: [{ t:10,l:4,w:40,h:78 }, { t:10,l:48,w:24,h:50 }, { t:12,l:74,w:22,h:48 }] },
  { time: '00:13',
    img: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=480&h=270&fit=crop&q=80',
    objects: [{ n:'Woman', c:100 }, { n:'Adult', c:100 }, { n:'Shopping Cart', c:99 }, { n:'Smile', c:100 }, { n:'Happy', c:100 }, { n:'Portrait', c:100 }, { n:'Face', c:100 }],
    boxes: [{ t:3,l:24,w:52,h:90 }, { t:3,l:28,w:40,h:48 }, { t:55,l:18,w:60,h:40 }] },
  { time: '00:18',
    img: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=480&h=270&fit=crop&q=80',
    objects: [{ n:'Chicken', c:100 }, { n:'Meat', c:100 }, { n:'Poultry', c:99 }, { n:'Raw Food', c:98 }, { n:'Grocery Store', c:96 }, { n:'Package', c:97 }],
    boxes: [{ t:10,l:5,w:38,h:70 }, { t:10,l:46,w:38,h:70 }, { t:12,l:8,w:30,h:32 }, { t:12,l:50,w:30,h:32 }] },
  { time: '00:22',
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=480&h=270&fit=crop&q=80',
    objects: [{ n:'Cooking', c:100 }, { n:'Kitchen', c:99 }, { n:'Knife', c:97 }, { n:'Cutting Board', c:96 }, { n:'Vegetables', c:98 }, { n:'Meal Prep', c:94 }],
    boxes: [{ t:30,l:8,w:60,h:62 }, { t:32,l:10,w:28,h:20 }, { t:28,l:42,w:20,h:28 }] },
  { time: '00:27',
    img: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=480&h=270&fit=crop&q=80',
    objects: [{ n:'Family', c:100 }, { n:'Woman', c:100 }, { n:'Man', c:99 }, { n:'Child', c:98 }, { n:'Food', c:100 }, { n:'Meal', c:97 }, { n:'Happy', c:100 } ],
    boxes: [{ t:5,l:5,w:28,h:85 }, { t:5,l:36,w:28,h:85 }, { t:5,l:66,w:28,h:85 }, { t:48,l:18,w:62,h:38 }] }
];

var TX_AD_DATA = {
  video_id: 'KROGER_30s',
  duration_in_seconds: 30.089,
  type: 'mp4',
  fps: 23.976,
  ad_approval_data: {
    advertiser: 'Kroger',
    adomain: 'kroger.com',
    primary_language: 'English',
    brand_safety_100: {},
    brand_safety_75: {}
  },
  video_metadata: {
    iab_taxonomy: [
      { id:'140', name:'Grocery & Supermarket', confidence:0.92, count:21, screen_time:24.1, screen_time_percentage:0.801 },
      { id:'142', name:'Food & Drink',           confidence:0.85, count:14, screen_time:17.6, screen_time_percentage:0.585 },
      { id:'143', name:'Cooking',                confidence:0.76, count:9,  screen_time:11.3, screen_time_percentage:0.376 }
    ],
    garm_category: [],
    sentiment_analysis: [
      { id:'S1', name:'Mostly Positive', confidence:0.94, count:17, screen_time:21.4, screen_time_percentage:0.711 },
      { id:'S3', name:'Neutral',         confidence:0.88, count:5,  screen_time:6.2,  screen_time_percentage:0.206 }
    ]
  },
  total_scenes: 6,
  Scenes: [
    { scene:0, startTimecode:'00:00:00.000', endTimecode:'00:00:04.000', lengthInSeconds:4,  iab_taxonomy:[], garm_category:[], audio_transcript:'' },
    { scene:1, startTimecode:'00:00:04.000', endTimecode:'00:00:09.000', lengthInSeconds:5,  iab_taxonomy:[{id:'140',name:'Grocery & Supermarket',confidence:0.94,considered:[]}], garm_category:[] },
    { scene:2, startTimecode:'00:00:09.000', endTimecode:'00:00:14.000', lengthInSeconds:5,  iab_taxonomy:[{id:'142',name:'Food & Drink',confidence:0.88,considered:['Cooking','Recipes']}], garm_category:[] },
    { scene:3, startTimecode:'00:00:14.000', endTimecode:'00:00:20.000', lengthInSeconds:6,  iab_taxonomy:[{id:'140',name:'Grocery & Supermarket',confidence:0.96,considered:[]}], garm_category:[] },
    { scene:4, startTimecode:'00:00:20.000', endTimecode:'00:00:25.000', lengthInSeconds:5,  iab_taxonomy:[{id:'143',name:'Cooking',confidence:0.79,considered:['Food & Drink','Recipes & Meal Ideas']}], garm_category:[] },
    { scene:5, startTimecode:'00:00:25.000', endTimecode:'00:00:30.089', lengthInSeconds:5,  iab_taxonomy:[{id:'140',name:'Grocery & Supermarket',confidence:0.91,considered:['Food & Drink']}], garm_category:[], audio_transcript:'Fresh for everyone. Only at Kroger.' }
  ],
  metadata: {
    logos: ['Kroger', 'Simple Truth'],
    object_labels: [
      {Name:'Supermarket',Confidence:1},{Name:'Grocery_Store',Confidence:1},
      {Name:'Shelf',Confidence:1},{Name:'Food',Confidence:1},
      {Name:'Person',Confidence:1},{Name:'Woman',Confidence:1},
      {Name:'Adult',Confidence:1},{Name:'Face',Confidence:1},
      {Name:'Smile',Confidence:1},{Name:'Happy',Confidence:1},
      {Name:'Indoors',Confidence:1},{Name:'Shopping_Cart',Confidence:0.99},
      {Name:'Produce',Confidence:0.99},{Name:'Vegetables',Confidence:0.99},
      {Name:'Fruit',Confidence:0.98},{Name:'Meat',Confidence:0.97},
      {Name:'Chicken',Confidence:0.96},{Name:'Dairy',Confidence:0.95},
      {Name:'Bread',Confidence:0.94},{Name:'Package',Confidence:0.99},
      {Name:'Man',Confidence:0.98},{Name:'Child',Confidence:0.97},
      {Name:'Family',Confidence:0.96},{Name:'Portrait',Confidence:1},
      {Name:'Glasses',Confidence:0.88},{Name:'Coat',Confidence:0.85},
      {Name:'Bag',Confidence:0.91},{Name:'Refrigerator',Confidence:0.93},
      {Name:'Freezer_Section',Confidence:0.87},{Name:'Kitchen',Confidence:0.90},
      {Name:'Cooking',Confidence:0.88},{Name:'Pot',Confidence:0.84},
      {Name:'Knife',Confidence:0.81},{Name:'Alcohol',Confidence:0.68},{Name:'Cutting_Board',Confidence:0.83},
      {Name:'Salad',Confidence:0.86},{Name:'Bowl',Confidence:0.89},
      {Name:'Plate',Confidence:0.91},{Name:'Beverage',Confidence:0.87},
      {Name:'Bottle',Confidence:0.85},{Name:'Can',Confidence:0.82},
      {Name:'Advertisement',Confidence:0.90},{Name:'Logo',Confidence:0.95},
      {Name:'Solo_Performance',Confidence:0.88},{Name:'Photography',Confidence:1},
      {Name:'Mobile_Phone',Confidence:0.76},{Name:'Credit_Card',Confidence:0.72},
      {Name:'Sitting',Confidence:0.84},{Name:'Standing',Confidence:0.91},
      {Name:'Black_Hair',Confidence:0.93},{Name:'Flower',Confidence:0.78}
    ]
  }
};

var TX_AD_SENSITIVE_LABELS = ['Dynamite','Weapon','Gun','Grenade','Smoke','Violence','Drugs','Knife','Alcohol'];

function txToggleAdAnalysisJson() {} // legacy — no-op

function txCopyAdJson() {
  var pre = document.getElementById('tx-ad-modal-json-pre');
  if (!pre) return;
  try { navigator.clipboard.writeText(pre.textContent); } catch(e) {}
  var btn = document.getElementById('tx-ad-modal-copy-btn');
  if (btn) { btn.textContent = 'Copied!'; setTimeout(function(){ btn.textContent = 'Copy'; }, 1500); }
}

function txOpenAdModal(type, panelType) {
  var existing = document.getElementById('tx-ad-modal');
  if (existing) existing.remove();
  var title   = type === 'iab' ? 'IAB Taxonomies' : type === 'objects' ? 'Objects Detected' : 'Ad Compliance';
  var content = type === 'iab' ? txAdModalIabHtml : type === 'objects' ? txAdModalObjectsHtml : txAdModalCompHtml;
  var showJson = panelType === 'json';
  var showOd   = panelType === 'objects';
  var MHEAD = 'display:flex;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border);flex-shrink:0;gap:6px';
  var IBTN  = 'display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:1px solid var(--border);border-radius:6px;background:transparent;cursor:pointer;color:var(--muted);transition:background .15s,color .15s';
  var overlay = document.createElement('div');
  overlay.id = 'tx-ad-modal';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(15,23,42,0.45);display:flex;align-items:center;justify-content:center';
  overlay.onclick = function(e) { if (e.target === overlay) txCloseAdModal(); };
  overlay.innerHTML =
    '<div style="background:#fff;border-radius:12px;width:960px;max-width:94vw;height:80vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.18);overflow:hidden">'
    + '<div style="' + MHEAD + '">'
    +   '<span style="font-size:13px;font-weight:600;color:var(--text)">' + title + '</span>'
    +   '<div style="flex:1"></div>'
    +   (type === 'objects'
        ? '<div style="display:flex;border:1px solid var(--border);border-radius:7px;overflow:hidden;margin-right:8px">'
          + '<button id="tx-ad-modal-od-btn" title="Object Detection" onclick="txToggleAdModalOd()" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:26px;border:none;border-right:1px solid var(--border);cursor:pointer;transition:background .15s,color .15s;background:' + (showOd ? 'var(--bg)' : 'transparent') + ';color:' + (showOd ? 'var(--text)' : 'var(--muted)') + '" onmouseenter="this.style.background=\'var(--bg)\';this.style.color=\'var(--text)\'" onmouseleave="if(document.getElementById(\'tx-ad-modal-od\').style.display===\'none\'){this.style.background=\'transparent\';this.style.color=\'var(--muted)\'}">'
          + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1.5 4V2H3.5M10.5 2H12.5V4M12.5 10V12H10.5M3.5 12H1.5V10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="7" r="1.8" stroke="#d946ef" stroke-width="1.2"/></svg>'
          + '</button>'
          + '<button id="tx-ad-modal-json-btn" title="View JSON" onclick="txToggleAdModalJson()" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:26px;border:none;cursor:pointer;transition:background .15s,color .15s;background:' + (showJson ? 'var(--bg)' : 'transparent') + ';color:' + (showJson ? 'var(--text)' : 'var(--muted)') + '" onmouseenter="this.style.background=\'var(--bg)\';this.style.color=\'var(--text)\'" onmouseleave="if(document.getElementById(\'tx-ad-modal-json\').style.display===\'none\'){this.style.background=\'transparent\';this.style.color=\'var(--muted)\'}">'
          + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M4 4L1.5 7 4 10M10 4l2.5 3L10 10M7.5 2.5l-1 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          + '</button>'
          + '</div>'
        : '<div style="display:flex;border:1px solid var(--border);border-radius:7px;overflow:hidden;margin-right:8px">'
          + '<button id="tx-ad-modal-json-btn" title="View JSON" onclick="txToggleAdModalJson()" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:26px;border:none;cursor:pointer;transition:background .15s,color .15s;background:' + (showJson ? 'var(--bg)' : 'transparent') + ';color:' + (showJson ? 'var(--text)' : 'var(--muted)') + '" onmouseenter="this.style.background=\'var(--bg)\';this.style.color=\'var(--text)\'" onmouseleave="if(document.getElementById(\'tx-ad-modal-json\').style.display===\'none\'){this.style.background=\'transparent\';this.style.color=\'var(--muted)\'}">'
          + '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M4 4L1.5 7 4 10M10 4l2.5 3L10 10M7.5 2.5l-1 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          + '</button>'
          + '</div>')
    +   '<button title="Close" onclick="txCloseAdModal()" style="' + IBTN + ';font-size:15px;font-family:inherit" onmouseenter="this.style.background=\'var(--bg)\'" onmouseleave="this.style.background=\'transparent\'">×</button>'
    + '</div>'
    + '<div style="display:flex;flex:1;min-height:0;overflow:hidden">'
    +   '<div style="flex:1;min-width:0;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px">' + content + '</div>'
    +   '<div id="tx-ad-modal-json" style="display:' + (showJson ? 'flex' : 'none') + ';flex-direction:column;width:300px;flex-shrink:0;background:#14161a;border-left:1px solid #2a2d35">'
    +     '<div style="display:flex;align-items:center;padding:9px 12px;border-bottom:1px solid #2a2d35;flex-shrink:0;gap:6px">'
    +       '<span style="font-size:11px;font-weight:600;color:#e2e4e9">JSON</span><div style="flex:1"></div>'
    +       '<button id="tx-ad-modal-copy-btn" onclick="txCopyAdJson()" style="border:1px solid #2a2d35;background:#1e2028;color:#8b8fa8;font-size:10px;font-family:inherit;border-radius:5px;padding:2px 8px;cursor:pointer">Copy</button>'
    +     '</div>'
    +     '<pre id="tx-ad-modal-json-pre" style="margin:0;padding:12px;font-size:10px;line-height:1.55;overflow:auto;flex:1;color:#c9d1d9;font-family:\'SF Mono\',\'Fira Code\',monospace;white-space:pre">' + txAdModalJsonStr.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre>'
    +   '</div>'
    +   '<div id="tx-ad-modal-od" style="display:' + (showOd ? 'flex' : 'none') + ';flex-direction:column;width:300px;flex-shrink:0;background:#14161a;border-left:1px solid #2a2d35">'
    +     '<div style="display:flex;align-items:center;padding:9px 12px;border-bottom:1px solid #2a2d35;flex-shrink:0;gap:6px">'
    +       '<svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M1.5 4V2H3.5M10.5 2H12.5V4M12.5 10V12H10.5M3.5 12H1.5V10" stroke="#d946ef" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="7" r="1.8" stroke="#d946ef" stroke-width="1.2"/></svg>'
    +       '<span style="font-size:11px;font-weight:600;color:#e2e4e9">Object Detection</span>'
    +     '</div>'
    +     '<div style="overflow-y:auto;flex:1;padding:12px">' + txBuildOdPanelHtml() + '</div>'
    +   '</div>'
    + '</div>'
    + '</div>';
  document.body.appendChild(overlay);
}

function txCloseAdModal() {
  var m = document.getElementById('tx-ad-modal');
  if (m) m.remove();
}

function txToggleAdModalJson() {
  var jp  = document.getElementById('tx-ad-modal-json');
  var btn = document.getElementById('tx-ad-modal-json-btn');
  if (!jp) return;
  var open = jp.style.display !== 'none';
  var od = document.getElementById('tx-ad-modal-od');
  var odb = document.getElementById('tx-ad-modal-od-btn');
  if (od) { od.style.display = 'none'; }
  if (odb) { odb.style.background = 'transparent'; odb.style.color = 'var(--muted)'; odb.style.borderColor = 'var(--border)'; }
  jp.style.display = open ? 'none' : 'flex';
  if (btn) {
    btn.style.background  = open ? 'transparent' : 'var(--bg)';
    btn.style.color       = open ? 'var(--muted)' : 'var(--text)';
    btn.style.borderColor = open ? 'var(--border)' : 'var(--border-md)';
  }
}

function txToggleAdModalOd() {
  var od  = document.getElementById('tx-ad-modal-od');
  var btn = document.getElementById('tx-ad-modal-od-btn');
  if (!od) return;
  var open = od.style.display !== 'none';
  var jp  = document.getElementById('tx-ad-modal-json');
  var jpb = document.getElementById('tx-ad-modal-json-btn');
  if (jp) { jp.style.display = 'none'; }
  if (jpb) { jpb.style.background = 'transparent'; jpb.style.color = 'var(--muted)'; jpb.style.borderColor = 'var(--border)'; }
  od.style.display = open ? 'none' : 'flex';
  if (btn) {
    btn.style.background  = open ? 'transparent' : 'var(--bg)';
    btn.style.color       = open ? 'var(--muted)' : 'var(--text)';
    btn.style.borderColor = open ? 'var(--border)' : 'var(--border-md)';
  }
}

function txBuildOdPanelHtml() {
  var S = '#d946ef';

  // SVG filter for neon glow — self-contained, not clipped by overflow:hidden
  var DEFS = '<defs><filter id="od-glow" x="-40%" y="-40%" width="180%" height="180%">'
    + '<feGaussianBlur in="SourceGraphic" stdDeviation="1" result="b1"/>'
    + '<feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b2"/>'
    + '<feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>'
    + '</filter></defs>';

  // 9-point organic polygon from bounding box, in viewBox "0 0 100 56.25"
  function bpoly(b) {
    var l=b.l, t=b.t*.5625, w=b.w, h=b.h*.5625, r=l+w, bo=t+h;
    return [
      [l+w*.08, t+h*.16], [l+w*.32, t+h*.01], [l+w*.64, t],
      [r-w*.03, t+h*.15], [r,       t+h*.54],
      [r-w*.07, bo-h*.09],[l+w*.58, bo],       [l+w*.15, bo-h*.03],
      [l,       t+h*.62]
    ].map(function(p){ return p[0].toFixed(2)+','+p[1].toFixed(2); }).join(' ');
  }

  return TX_AD_FRAMES.map(function(f, i) {
    // Max 2 polygons per frame
    var polysHtml = f.boxes.slice(0,2).map(function(b) {
      return '<polygon points="'+bpoly(b)+'" fill="rgba(217,70,239,0.07)" stroke="'+S
        +'" stroke-width="1.4" vector-effect="non-scaling-stroke" filter="url(#od-glow)"/>';
    }).join('');

    var svgHtml = '<svg style="position:absolute;inset:0;width:100%;height:100%"'
      +' viewBox="0 0 100 56.25" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">'
      + DEFS + polysHtml + '</svg>';

    var objsHtml = f.objects.map(function(o) {
      var col = o.c >= 95 ? '#4ade80' : o.c >= 80 ? '#fbbf24' : '#94a3b8';
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid #2a2d35">'
        + '<span style="font-size:11px;color:#c9d1d9">' + o.n + '</span>'
        + '<span style="font-size:10px;font-weight:600;color:' + col + '">' + o.c + '%</span>'
        + '</div>';
    }).join('');

    return '<div style="margin-bottom:'+(i < TX_AD_FRAMES.length-1 ? '16' : '0')+'px">'
      + '<div style="position:relative;width:100%;padding-bottom:56.25%;background:#0a0c10;border-radius:6px;overflow:hidden;margin-bottom:8px">'
      +   '<img src="'+f.img+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.85" loading="lazy"/>'
      +   svgHtml
      +   '<span style="position:absolute;bottom:5px;left:7px;font-size:10px;font-weight:600;color:#f8fafc;background:rgba(0,0,0,0.65);padding:1px 6px;border-radius:4px;font-family:monospace">'+f.time+'</span>'
      + '</div>'
      + objsHtml
      + '</div>';
  }).join('');
}

function txRenderAdAnalysis() {
  var panel = document.getElementById('tx2-sub-content-ad-analysis');
  if (!panel) return;
  var d    = TX_AD_DATA;
  var LSUB = 'font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:6px';
  function secTitle(t) { return '<div style="' + LSUB + '">' + t + '</div>'; }
  function iabColor(conf) { return conf >= 0.85 ? '#16a34a' : conf >= 0.70 ? '#d97706' : 'var(--muted)'; }

  // ── IAB Taxonomies ──────────────────────────────────────────────────────────
  var aggHtml = '<div>'
    + secTitle('IAB Taxonomy')
    + '<div style="display:flex;flex-wrap:wrap;gap:6px">'
    + d.video_metadata.iab_taxonomy.slice(0, 3).map(function(cat) {
        var pct = Math.round(cat.confidence * 100);
        var col = iabColor(cat.confidence);
        var bg  = cat.confidence >= 0.85 ? '#f0fdf4' : cat.confidence >= 0.70 ? '#fffbeb' : 'var(--bg)';
        var bd  = cat.confidence >= 0.85 ? '#bbf7d0' : cat.confidence >= 0.70 ? '#fde68a' : 'var(--border)';
        return '<div style="display:flex;align-items:center;gap:6px;padding:5px 10px;background:' + bg + ';border:1px solid ' + bd + ';border-radius:7px">'
          + '<span style="font-size:11px;font-weight:500;color:var(--text)">' + cat.name + '</span>'
          + '<span style="font-size:10px;font-weight:600;color:' + col + '">' + pct + '%</span>'
          + '</div>';
      }).join('')
    + '</div></div>';

  var scenesWithIab = d.Scenes.filter(function(s) { return s.iab_taxonomy && s.iab_taxonomy.length > 0; });
  var scenesHtml = '<div>' + secTitle('Per Scene')
    + scenesWithIab.map(function(s) {
        var tc  = s.startTimecode.slice(0,8);
        var t   = s.iab_taxonomy[0];
        var pct = Math.round(t.confidence * 100);
        var col = iabColor(t.confidence);
        var bg  = t.confidence >= 0.85 ? '#f0fdf4' : t.confidence >= 0.70 ? '#fffbeb' : 'var(--bg)';
        var bd  = t.confidence >= 0.85 ? '#bbf7d0' : t.confidence >= 0.70 ? '#fde68a' : 'var(--border)';
        var consideredHtml = (t.considered && t.considered.length)
          ? '<div style="margin-top:3px;display:flex;align-items:center;flex-wrap:wrap;gap:3px">'
            + '<span style="font-size:9px;color:var(--faint)">Considered:</span>'
            + t.considered.map(function(c) { return '<span style="font-size:10px;color:var(--muted)">' + c + '</span>'; }).join('<span style="font-size:9px;color:var(--faint)">,</span>')
            + '</div>'
          : '';
        return '<div style="display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">'
          + '<span style="font-size:10px;color:var(--faint);font-family:monospace;white-space:nowrap;min-width:52px;flex-shrink:0;padding-top:1px">' + tc + '</span>'
          + '<div style="min-width:0;flex:1">'
          +   '<div style="display:flex;align-items:baseline;gap:6px">'
          +     '<span style="font-size:11px;font-weight:500;color:var(--text)">' + t.name + '</span>'
          +     '<span style="font-size:10px;font-weight:600;color:' + col + ';background:' + bg + ';border:1px solid ' + bd + ';border-radius:20px;padding:1px 6px;white-space:nowrap">' + pct + '%</span>'
          +   '</div>'
          +   consideredHtml
          + '</div>'
          + '</div>';
      }).join('')
    + '</div>';

  var iabColHtml = aggHtml + scenesHtml;

  // ── Ad Compliance (logos + sensitive labels only) ───────────────────────────
  var logos        = (d.metadata && d.metadata.logos) || [];
  var allLabels    = (d.metadata && d.metadata.object_labels) || [];
  var sensitiveHit = allLabels.filter(function(l) { return TX_AD_SENSITIVE_LABELS.indexOf(l.Name) >= 0; });

  var logosHtml = '<div>' + secTitle('Detected Logos')
    + '<div style="display:flex;flex-wrap:wrap;gap:5px">'
    + (logos.length
        ? logos.map(function(l) {
            return '<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:var(--bg);border:1px solid var(--border-md);border-radius:20px;font-size:11px;font-weight:500;color:var(--text)">'
              + '<svg width="9" height="9" viewBox="0 0 10 10" fill="none"><rect x="1" y="1" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M3 5h4M3 7h2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>'
              + l + '</span>';
          }).join('')
        : '<span style="font-size:11px;color:var(--faint)">None detected</span>')
    + '</div></div>';

  var sensitiveHtml = '<div>' + secTitle('Sensitive Labels')
    + (sensitiveHit.length
        ? '<div style="padding:10px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:9px">'
          + '<div style="display:flex;align-items:center;gap:5px;margin-bottom:6px">'
          +   '<svg width="12" height="12" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" fill="#d97706" opacity=".2"/><path d="M6.5 4v3.5" stroke="#d97706" stroke-width="1.4" stroke-linecap="round"/><circle cx="6.5" cy="9.5" r=".7" fill="#d97706"/></svg>'
          +   '<span style="font-size:11px;font-weight:600;color:#92400e">Review recommended</span>'
          + '</div>'
          + '<div style="font-size:10px;color:#92400e;margin-bottom:7px;line-height:1.5">May be false positives (tools/packaging misclassified).</div>'
          + '<div style="display:flex;flex-wrap:wrap;gap:4px">'
          + sensitiveHit.map(function(l) {
              return '<span style="padding:2px 8px;background:#fef3c7;border:1px solid #fde68a;border-radius:20px;font-size:11px;font-weight:500;color:#92400e">'
                + l.Name.replace(/_/g,' ') + ' <span style="opacity:.65">' + Math.round(l.Confidence*100) + '%</span></span>';
            }).join('')
          + '</div></div>'
        : '<div style="padding:9px 12px;background:var(--bg);border:1px solid var(--border);border-radius:9px;font-size:11px;color:var(--faint)">None detected</div>')
    + '</div>';

  var compColHtml = logosHtml + sensitiveHtml;

  // ── Objects Detected (grouped by confidence, grey chips) ───────────────────
  var objectLabels = allLabels.filter(function(l) { return TX_AD_SENSITIVE_LABELS.indexOf(l.Name) < 0; })
                              .sort(function(a,b) { return b.Confidence - a.Confidence; });

  var objGroups = {};
  objectLabels.forEach(function(l) {
    var pct = Math.round(l.Confidence * 100);
    if (!objGroups[pct]) objGroups[pct] = [];
    objGroups[pct].push(l.Name.replace(/_/g,' '));
  });
  var sortedObjPcts = Object.keys(objGroups).map(Number).sort(function(a,b){ return b-a; });
  var objectsHtml = sortedObjPcts.map(function(pct) {
    var badgeCol = pct >= 80 ? '#16a34a' : pct >= 10 ? '#d97706' : 'var(--muted)';
    var badgeBg  = pct >= 80 ? '#f0fdf4'  : pct >= 10 ? '#fffbeb'  : 'var(--bg)';
    var badgeBd  = pct >= 80 ? '#bbf7d0'  : pct >= 10 ? '#fde68a'  : 'var(--border)';
    var chipsHtml = objGroups[pct].map(function(name) {
      return '<span style="padding:2px 9px;background:var(--bg);border:1px solid var(--border);border-radius:20px;font-size:11px;color:var(--text);white-space:nowrap">' + name + '</span>';
    }).join('');
    return '<div style="padding:6px 0;border-bottom:1px solid var(--border)">'
      + '<span style="font-size:10px;font-weight:600;color:' + badgeCol + ';background:' + badgeBg + ';border:1px solid ' + badgeBd + ';border-radius:20px;padding:1px 7px;display:inline-block;margin-bottom:6px">' + pct + '%</span>'
      + '<div style="display:flex;flex-wrap:wrap;gap:4px">' + chipsHtml + '</div>'
      + '</div>';
  }).join('');

  // ── Modal data ──────────────────────────────────────────────────────────────
  txAdModalIabHtml     = iabColHtml;
  txAdModalCompHtml    = compTwoColHtml;
  txAdModalObjectsHtml = objectsHtml;
  txAdModalJsonStr     = JSON.stringify(TX_AD_DATA, null, 2);

  // ── Layout ──────────────────────────────────────────────────────────────────
  var PANEL = 'display:flex;flex-direction:column;background:#fff;border:1px solid var(--border);border-radius:10px;overflow:hidden';
  var PHEAD = 'display:flex;align-items:center;padding:9px 12px;border-bottom:1px solid var(--border);flex-shrink:0';
  var PBODY = 'flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:14px';
  var IBTN  = 'display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:1px solid var(--border);border-radius:5px;background:transparent;cursor:pointer;color:var(--muted);transition:background .15s,color .15s';
  var IBTNHOV = 'onmouseenter="this.style.background=\'var(--surface)\';this.style.color=\'var(--text)\'" onmouseleave="this.style.background=\'transparent\';this.style.color=\'var(--muted)\'"';

  function cardHeader(title, type) {
    return '<div style="' + PHEAD + '">'
      + '<span style="font-size:11px;font-weight:600;color:var(--text)">' + title + '</span>'
      + '<div style="flex:1"></div>'
      + '<button title="View JSON" onclick="txOpenAdModal(\'' + type + '\',\'json\')" style="' + IBTN + ';margin-right:4px" ' + IBTNHOV + '>'
      +   '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M4 4L1.5 7 4 10M10 4l2.5 3L10 10M7.5 2.5l-1 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '</button>'
      + '<button title="Expand" onclick="txOpenAdModal(\'' + type + '\',null)" style="' + IBTN + '" ' + IBTNHOV + '>'
      +   '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1.5 5.5V2H5M9 2h3.5V5.5M12.5 8.5V12H9M5 12H1.5V8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '</button>'
      + '</div>';
  }


  // ── Ad Compliance two-column content (rosy theme) ──────────────────────────
  var CTAG = 'display:inline-flex;align-items:center;gap:5px;padding:3px 9px;background:var(--bg);border:1px solid var(--border-md);border-radius:20px;font-size:11px;font-weight:500;color:var(--text)';
  var CLBL = 'font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:4px;font-weight:600';
  var compTwoColHtml =
    '<div style="display:flex;gap:12px;align-items:flex-start">'
    // Logos column — narrow so chips stack
    + '<div style="width:130px;flex-shrink:0">'
    +   '<div style="' + CLBL + '">Detected Logos</div>'
    +   '<div style="display:flex;flex-direction:column;gap:4px">'
    +   (logos.length
        ? logos.map(function(l) {
            return '<span style="' + CTAG + '">'
              + '<svg width="9" height="9" viewBox="0 0 10 10" fill="none"><rect x="1" y="1" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M3 5h4M3 7h2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>'
              + l + '</span>';
          }).join('')
        : '<span style="font-size:11px;color:var(--faint)">None detected</span>')
    +   '</div>'
    + '</div>'
    // Sensitive Labels column — flex:1, more space, no title
    + '<div style="flex:1;min-width:0">'
    +   (sensitiveHit.length
        ? '<div style="padding:6px 9px;background:#fff7ed;border:1px solid #fed7aa;border-radius:9px">'
          + '<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">'
          +   '<svg width="12" height="12" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" fill="#ea580c" opacity=".18"/><path d="M6.5 4v3.5" stroke="#ea580c" stroke-width="1.4" stroke-linecap="round"/><circle cx="6.5" cy="9.5" r=".7" fill="#ea580c"/></svg>'
          +   '<span style="font-size:11px;font-weight:600;color:#9a3412">Review recommended sensitive labels</span>'
          + '</div>'
          + '<div style="font-size:10px;color:#c2410c;margin-bottom:4px;line-height:1.3">May be false positives in food/kitchen context.</div>'
          + '<div style="display:flex;flex-wrap:wrap;gap:4px">'
          + sensitiveHit.map(function(l) {
              return '<span style="padding:2px 8px;background:#ffedd5;border:1px solid #fed7aa;border-radius:20px;font-size:11px;font-weight:500;color:#9a3412">'
                + l.Name.replace(/_/g,' ') + ' <span style="opacity:.65">' + Math.round(l.Confidence*100) + '%</span></span>';
            }).join('')
          + '</div>'
          + '</div>'
        : '<div style="padding:6px 9px;background:var(--bg);border:1px solid var(--border);border-radius:9px;font-size:11px;color:var(--faint)">None detected</div>')
    + '</div>'
    + '</div>';

  var IBTN_C  = 'display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:1px solid #fda4af;border-radius:5px;background:transparent;cursor:pointer;color:#e11d48;transition:background .15s';
  var IBTNHOV_C = 'onmouseenter="this.style.background=\'#fff1f2\'" onmouseleave="this.style.background=\'transparent\'"';

  panel.innerHTML =
    // Outer: horizontal — left column (IAB+Objects+Compliance) | Highcharts
    '<div style="display:flex;gap:14px;flex:1;min-height:0;overflow:hidden">'

    // ── Left column: IAB top, Objects middle, Compliance bottom ─────────────
    + '<div style="display:flex;flex-direction:column;gap:14px;width:534px;flex-shrink:0;min-height:0;overflow:hidden">'

    +   '<div style="display:flex;gap:14px;flex:1;min-height:0;overflow:hidden">'

    +     '<div style="width:280px;flex-shrink:0;' + PANEL + '">'
    +       cardHeader('IAB Taxonomies', 'iab')
    +       '<div style="' + PBODY + '">' + iabColHtml + '</div>'
    +     '</div>'

    +     '<div style="flex:1;min-width:0;' + PANEL + '">'
    +       '<div style="' + PHEAD + '">'
    +         '<span style="font-size:11px;font-weight:600;color:var(--text)">Objects Detected</span>'
    +         '<span style="margin-left:6px;font-size:10px;color:var(--faint)">' + objectLabels.length + '</span>'
    +         '<div style="flex:1"></div>'
    +         '<button title="Object Detection" onclick="txOpenAdModal(\'objects\',\'objects\')" style="' + IBTN + ';margin-right:4px" ' + IBTNHOV + '>'
    +           '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1.5 4V2H3.5M10.5 2H12.5V4M12.5 10V12H10.5M3.5 12H1.5V10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="7" r="1.8" stroke="#d946ef" stroke-width="1.2"/></svg>'
    +         '</button>'
    +         '<button title="Expand" onclick="txOpenAdModal(\'objects\',null)" style="' + IBTN + '" ' + IBTNHOV + '>'
    +           '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1.5 5.5V2H5M9 2h3.5V5.5M12.5 8.5V12H9M5 12H1.5V8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +         '</button>'
    +       '</div>'
    +       '<div style="' + PBODY + ';gap:0">' + objectsHtml + '</div>'
    +     '</div>'

    +   '</div>'

    // Ad Compliance — full width of left column, compact height
    +   '<div style="flex-shrink:0;display:flex;flex-direction:column;background:#fff;border:1px solid var(--border);border-radius:10px;overflow:hidden">'
    +     '<div style="display:flex;align-items:center;padding:5px 10px;border-bottom:1px solid var(--border);flex-shrink:0">'
    +       '<svg width="11" height="11" viewBox="0 0 14 14" fill="none" style="margin-right:6px;flex-shrink:0"><path d="M7 1.5L1.5 4v3c0 3 2.5 5.2 5.5 6 3-.8 5.5-3 5.5-6V4L7 1.5z" stroke="var(--muted)" stroke-width="1.3" stroke-linejoin="round"/></svg>'
    +       '<span style="font-size:11px;font-weight:600;color:var(--text)">Ad Compliance</span>'
    +       '<div style="flex:1"></div>'
    +       '<button title="View JSON" onclick="txOpenAdModal(\'compliance\',\'json\')" style="' + IBTN + ';margin-right:4px" ' + IBTNHOV + '>'
    +         '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M4 4L1.5 7 4 10M10 4l2.5 3L10 10M7.5 2.5l-1 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       '</button>'
    +       '<button title="Expand" onclick="txOpenAdModal(\'compliance\',null)" style="' + IBTN + '" ' + IBTNHOV + '>'
    +         '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1.5 5.5V2H5M9 2h3.5V5.5M12.5 8.5V12H9M5 12H1.5V8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +       '</button>'
    +     '</div>'
    +     '<div style="padding:7px 10px">' + compTwoColHtml + '</div>'
    +   '</div>'

    + '</div>'

    // ── Right: Highcharts — full height, unaffected ──────────────────────────
    + '<div style="flex:1;min-width:0;display:flex;flex-direction:column;background:#fff;border:1px solid var(--border);border-radius:10px;overflow:hidden">'
    +   '<div style="' + PHEAD + ';justify-content:space-between">'
    +     '<span style="font-size:11px;font-weight:600;color:var(--text)">Moments × IAB Relevance</span>'
    +     '<span style="font-size:10px;color:var(--faint)">hover for details</span>'
    +   '</div>'
    +   '<div id="tx-ad-bubble-chart" style="width:100%;flex:1"></div>'
    + '</div>'

    + '</div>';

  txLoadHighcharts(function() {
    var momentLabels = ['Grocery Haul','Family Dinner','Healthy Eating','Fresh Produce','Meal Prep','Weekend BBQ','Snack Time','Baking & Sweets','Beverages','Quick & Easy'];
    function bp(x, y, z, name) {
      var green = y >= 80;
      return { x:x, y:y, z:z, name:name,
        color: green ? 'rgba(34,197,94,0.55)' : 'rgba(234,179,8,0.55)',
        marker: { lineColor: green ? '#16a34a' : '#ca8a04', lineWidth:1.5 }
      };
    }
    var bubbleData = [
      bp(0,94,14,'Grocery & Supermarket'), bp(0,88,12,'Food & Drink'),        bp(0,82,11,'Family Meals'),
      bp(1,91,14,'Cooking'),               bp(1,86,13,'Food & Drink'),         bp(1,78,11,'Healthy Living'),
      bp(2,95,14,'Healthy Eating'),        bp(2,90,13,'Grocery & Supermarket'),bp(2,83,12,'Nutrition'),       bp(2,74,10,'Fitness'),
      bp(3,93,14,'Grocery & Supermarket'), bp(3,87,13,'Produce'),              bp(3,81,12,'Organic Food'),
      bp(4,89,13,'Cooking'),               bp(4,84,12,'Meal Planning'),        bp(4,76,11,'Food & Drink'),
      bp(5,85,13,'Outdoor Dining'),        bp(5,79,11,'Grilling'),             bp(5,68,10,'Summer Food'),
      bp(6,80,12,'Snacks'),                bp(6,72,10,'Beverages'),            bp(6,65,9,'Convenience Food'),
      bp(7,88,13,'Baking'),                bp(7,82,12,'Desserts'),             bp(7,70,10,'Cooking'),
      bp(8,92,14,'Beverages'),             bp(8,86,13,'Grocery & Supermarket'),bp(8,78,11,'Healthy Drinks'),
      bp(9,90,14,'Cooking'),               bp(9,83,12,'Food & Drink'),         bp(9,73,10,'Quick Meals')
    ];
    var container = document.getElementById('tx-ad-bubble-chart');
    if (!container) return;
    Highcharts.chart('tx-ad-bubble-chart', {
      chart: { type:'bubble', backgroundColor:'transparent', plotBorderWidth:0, height:null, margin:[10,20,72,14], animation:{duration:600}, style:{fontFamily:'inherit'} },
      title: { text:null }, legend:{enabled:false}, credits:{enabled:false}, exporting:{enabled:false},
      xAxis: { categories:momentLabels, gridLineWidth:1, gridLineColor:'#f1f5f9', lineWidth:0, tickLength:0, title:{text:null}, labels:{style:{fontSize:'9px',color:'#5A6578'},rotation:-35,y:16} },
      yAxis: { min:55, max:100, gridLineWidth:1, gridLineColor:'#f1f5f9', title:{text:null}, labels:{enabled:false} },
      tooltip: {
        useHTML:true, backgroundColor:'#1e293b', borderColor:'#334155', borderRadius:8,
        style:{color:'#e2e8f0',fontSize:'11px'},
        formatter: function() {
          return '<div style="padding:2px 4px"><b style="color:#f8fafc">' + this.point.name + '</b><br/>'
            + '<span style="color:#94a3b8">Moment: </span><span>' + momentLabels[this.x] + '</span><br/>'
            + '<span style="color:#94a3b8">Relevance: </span><b style="color:' + (this.y >= 80 ? '#4ade80' : '#fbbf24') + '">' + (this.y >= 80 ? 'High' : 'Standard') + '</b></div>';
        }
      },
      plotOptions: { bubble: { minSize:5, maxSize:20, sizeBy:'width', marker:{fillOpacity:0.6,lineWidth:1.5}, states:{hover:{halo:{size:4}}}, dataLabels:{enabled:false} } },
      series: [{ name:'IAB Taxonomy', data:bubbleData, color:'#ED005E', marker:{lineColor:'#ED005E'} }]
    });
  });
}

function txLoadHighcharts(cb) {
  if (window.Highcharts) { cb(); return; }
  var s = document.createElement('script');
  s.src = 'https://code.highcharts.com/highcharts.js';
  s.onload = function() {
    var s2 = document.createElement('script');
    s2.src = 'https://code.highcharts.com/highcharts-more.js';
    s2.onload = cb;
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
}


// overview.js

function _ovParseNum(str) {
  if (!str || str === '—') return 0;
  var s = String(str).replace(/[$,]/g, '').trim();
  var mult = 1;
  if (/M$/i.test(s)) { mult = 1e6; s = s.slice(0, -1); }
  else if (/K$/i.test(s)) { mult = 1e3; s = s.slice(0, -1); }
  var n = parseFloat(s);
  return isNaN(n) ? 0 : n * mult;
}

function _ovFormatMoney(n) {
  if (n >= 1e6) return '$' + (Math.round(n / 1e5) / 10) + 'M';
  if (n >= 1e3) return '$' + (Math.round(n / 100) / 10) + 'K';
  return '$' + Math.round(n);
}

function _ovFormatNum(n) {
  if (n >= 1e6) return (Math.round(n / 1e5) / 10) + 'M';
  if (n >= 1e3) return (Math.round(n / 100) / 10) + 'K';
  return String(Math.round(n));
}

function _ovKpiRow() {
  var campaigns = (typeof CM_CAMPAIGNS !== 'undefined') ? CM_CAMPAIGNS : [];
  var liveStatuses = (typeof _cmTabGroups !== 'undefined') ? _cmTabGroups.live : ['pacing', 'underpacing', 'error'];
  var activeCampaigns = campaigns.filter(function(c) { return liveStatuses.indexOf(c.status) !== -1; });

  var totalBudget = 0, totalSpent = 0, totalDelivered = 0, totalGoal = 0;
  campaigns.forEach(function(c) {
    totalBudget    += _ovParseNum(c.budget);
    totalSpent     += _ovParseNum(c.spent);
    totalDelivered += _ovParseNum(c.impressions);
    totalGoal      += _ovParseNum(c.goal);
  });
  var spentPct    = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0;
  var deliveryPct = totalGoal ? Math.round((totalDelivered / totalGoal) * 100) : 0;

  var advertiserCount = (typeof _appDbAdvertisers !== 'undefined' && _appDbAdvertisers.length)
    ? _appDbAdvertisers.length
    : (typeof APP_ADVERTISERS !== 'undefined' ? APP_ADVERTISERS.length : 0);

  var kpis = [
    UI.cardStat({
      value: activeCampaigns.length,
      label: 'Active campaigns',
      badge: UI.badge(campaigns.length + ' total', 'var(--muted)', 'var(--subtle)')
    }),
    UI.cardStat({
      value: _ovFormatMoney(totalSpent),
      label: 'Spent of ' + _ovFormatMoney(totalBudget) + ' total budget',
      badge: UI.badge(spentPct + '%', spentPct > 90 ? '#2EAD4B' : '#0284C7', 'var(--subtle)'),
      bar: [{ color: spentPct > 90 ? '#2EAD4B' : '#0284C7', pct: Math.min(spentPct, 100), label: 'Spent' }]
    }),
    UI.cardStat({
      value: deliveryPct + '%',
      label: _ovFormatNum(totalDelivered) + ' of ' + _ovFormatNum(totalGoal) + ' impression goal',
      bar: [{ color: deliveryPct > 90 ? '#2EAD4B' : deliveryPct > 30 ? '#0284C7' : '#E5A100', pct: Math.min(deliveryPct, 100), label: 'Delivered' }]
    }),
    UI.cardStat({
      value: advertiserCount,
      label: 'Active advertisers'
    })
  ];

  return '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px">' + kpis.join('') + '</div>';
}

function _ovCampaignTable() {
  var campaigns = (typeof CM_CAMPAIGNS !== 'undefined') ? CM_CAMPAIGNS : [];
  var top = campaigns.slice().sort(function(a, b) {
    return _ovParseNum(b.budget) - _ovParseNum(a.budget);
  }).slice(0, 5);

  var rowsHtml = top.map(function(c) {
    return UI.tr([
      '<span style="font-weight:500;color:var(--text)">' + c.name + '</span>',
      c.advertiser,
      c.partners && c.partners.length ? c.partners[0] + (c.partners.length > 1 ? ' +' + (c.partners.length - 1) : '') : '—',
      UI.progressBarStatus(c.pacing, c.pacing + '%'),
      c.budget
    ], { onclick: "setPage('campaign-management','Campaign Manager')" });
  }).join('');

  return '<div style="margin-bottom:20px">'
    + '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:10px">Top Campaigns by Budget</div>'
    + UI.table([
        { label: 'Campaign' },
        { label: 'Advertiser' },
        { label: 'Partner' },
        { label: 'Pacing', width: '160px' },
        { label: 'Budget', align: 'right' }
      ], rowsHtml)
    + '</div>';
}

function _ovContentSnapshot() {
  var liveChannels  = (typeof LS_CHANNELS !== 'undefined') ? LS_CHANNELS.filter(function(c) { return c.status === 'on-air'; }).length : 0;
  var totalChannels = (typeof LS_CHANNELS !== 'undefined') ? LS_CHANNELS.length : 0;

  var tiles = [
    UI.cardStat({ value: '847', label: 'Content fully processed' }),
    UI.cardStat({ value: '1,240h', label: 'Total duration analysed' }),
    UI.cardStat({ value: liveChannels + ' / ' + totalChannels, label: 'Livestream channels on-air' })
  ];

  return '<div style="margin-bottom:20px">'
    + '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:10px">Content Library</div>'
    + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">' + tiles.join('') + '</div>'
    + '</div>';
}

function _ovPartnerStrip() {
  var campaigns = (typeof CM_CAMPAIGNS !== 'undefined') ? CM_CAMPAIGNS : [];
  var seen = {};
  var partners = [];
  campaigns.forEach(function(c) {
    (c.partners || []).forEach(function(p) {
      if (!seen[p]) { seen[p] = true; partners.push(p); }
    });
  });

  var logos = partners.map(function(p) {
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:64px">'
      + (typeof _dspLogoHtml === 'function' ? _dspLogoHtml(p, 40) : '')
      + '<span style="font-size:10px;color:var(--muted);text-align:center;line-height:1.2">' + p + '</span>'
      + '</div>';
  }).join('');

  return '<div style="margin-bottom:20px">'
    + '<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:10px">Connected DSP / SSP Partners</div>'
    + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px 24px;display:flex;gap:20px;flex-wrap:wrap">'
    + (logos || '<div style="font-size:12px;color:var(--faint)">No partners connected yet.</div>')
    + '</div>'
    + '</div>';
}

function _ovCertifications() {
  return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px 24px;display:flex;align-items:center;gap:14px">'
    + '<div style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);white-space:nowrap">Certified by</div>'
    + '<div style="display:flex;align-items:center;gap:18px">'
    +   '<img src="/public/compliance-badge/AICPA-SOC-II-logo.webp" alt="SOC 2 Compliant" title="SOC 2 Compliant" style="height:32px;width:auto;object-fit:contain"/>'
    +   '<img src="/public/compliance-badge/tpn_shield_gold_logo.webp" alt="TPN Gold Status" title="TPN Gold Status" style="height:32px;width:auto;object-fit:contain"/>'
    + '</div>'
    + '</div>';
}

function renderOverview() {
  return UI.pageHeader({ title: 'Overview', subtitle: 'Platform summary and key metrics' })
    + _ovKpiRow()
    + _ovCampaignTable()
    + _ovContentSnapshot()
    + _ovPartnerStrip()
    + _ovCertifications();
}

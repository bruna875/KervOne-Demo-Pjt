// js/ui-kit.js — Kerv Design System
// Single source of truth for all reusable UI primitives.
// All helpers return HTML strings except openDrawer / closeDrawer / openCentreModal.
// Global prefix: UI

var UI = (function () {

  // ─────────────────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────────────────

  function esc(s) {
    return (s == null ? '' : String(s))
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Style tokens  (canonical — extracted from admin-users.js)
  // ─────────────────────────────────────────────────────────────────────────

  // Base input / select / textarea style
  var IF = [
    'width:100%','box-sizing:border-box','padding:8px 11px','font-size:12px',
    'border:1px solid var(--border-md)','border-radius:5px',
    'background:var(--surface)','color:var(--text)',
    'outline:none','font-family:inherit','transition:border-color .15s'
  ].join(';');

  // Label (uppercase, small)
  var LB = [
    'font-size:10px','font-weight:600','text-transform:uppercase',
    'letter-spacing:.5px','color:var(--muted)','display:block','margin-bottom:5px'
  ].join(';');

  // ── Design tokens — color constants ─────────────────────────────────────
  var TOKENS = {
    // Brand
    accent:             '#ED005E',
    accentFg:           '#ffffff',
    accentHover:        '#d4005a',
    accentRgb:          '237,0,94',
    accentLight:        '#FDF0F4',
    accentMuted:        '#F8C0D4',
    // Input
    input:              'rgba(0,0,0,0.12)',
    inputBg:            '#ffffff',
    inputFg:            '#0D1E36',
    inputPlaceholder:   '#A8A8A0',
    inputFocus:         '#ED005E',
    inputFocusRing:     'rgba(237,0,94,0.1)',
    inputRadius:        '8px',
    // Secondary — navy dark
    secondary:          '#0f172a',
    secondaryHover:     '#1e293b',
    secondaryFg:        '#ffffff',
    // Text hierarchy
    text:               '#0D1E36',
    muted:              '#6B6B65',
    faint:              '#A8A8A0',
    // Backgrounds
    surface:            '#ffffff',
    bg:                 '#F3F5F8',
    hover:              'rgba(0,0,0,0.04)',
    subtle:             '#FDF0F4',
    // Sidebar
    sidebar:            '#ffffff',
    sidebarFg:          '#0D1E36',
    sidebarPrimary:     '#ED005E',
    sidebarPrimaryFg:   '#ffffff',
    sidebarSecondary:   '#0f172a',
    sidebarSecondaryFg: '#ffffff',
    sidebarAccent:      '#F2F2EF',
    sidebarAccentFg:    '#0D1E36',
    sidebarBorder:      'rgba(0,0,0,0.08)',
    sidebarRing:        '#ED005E',
  };

  // Select chevron data-URI
  var ARW = "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23A8A8A0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

  // Shared focus/blur handlers (string — embedded in returned HTML)
  var FOC = "onfocus=\"this.style.borderColor='var(--accent)'\" onblur=\"this.style.borderColor='var(--border-md)'\"";


  // ─────────────────────────────────────────────────────────────────────────
  // Form: field wrapper
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Wraps any inputHtml with an uppercase label.
   * @param {string} label
   * @param {string} inputHtml
   * @param {boolean} [required]
   * @param {string}  [mb='14px']  margin-bottom
   */
  function field(label, inputHtml, required, mb) {
    var req = required ? ' <span style="color:#E5243B">*</span>' : '';
    return '<div style="margin-bottom:' + (mb || '14px') + '">'
      + '<label style="' + LB + '">' + esc(label) + req + '</label>'
      + inputHtml
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Form: input
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * @param {string} id
   * @param {string} [type='text']
   * @param {string} [placeholder]
   * @param {string} [value]
   * @param {string} [extraStyle]  extra CSS appended after base IF
   */
  function input(id, type, placeholder, value, extraStyle) {
    return '<input id="' + esc(id) + '" type="' + (type || 'text') + '" '
      + 'placeholder="' + esc(placeholder || '') + '" '
      + 'value="' + esc(value || '') + '" '
      + 'style="' + IF + ';height:36px' + (extraStyle ? ';' + extraStyle : '') + '" '
      + FOC + '>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Form: textarea
  // ─────────────────────────────────────────────────────────────────────────

  function textarea(id, placeholder, value, rows) {
    return '<textarea id="' + esc(id) + '" '
      + 'placeholder="' + esc(placeholder || '') + '" '
      + 'rows="' + (rows || 3) + '" '
      + 'style="' + IF + ';resize:vertical;line-height:1.5" '
      + FOC + '>'
      + esc(value || '')
      + '</textarea>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Form: select
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * @param {string} id
   * @param {Array<{val:string, label:string}>} options
   * @param {string} selectedVal
   */
  function select(id, options, selectedVal) {
    var opts = options.map(function (o) {
      return '<option value="' + esc(String(o.val)) + '"'
        + (String(o.val) === String(selectedVal) ? ' selected' : '')
        + '>' + esc(o.label) + '</option>';
    }).join('');
    return '<select id="' + esc(id) + '" style="' + IF + ';height:36px;cursor:pointer;'
      + 'appearance:none;-webkit-appearance:none;'
      + 'background-image:' + ARW + ';background-repeat:no-repeat;background-position:right 10px center" '
      + FOC + '>' + opts + '</select>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Form: custom select  (div-based, matches app style exactly)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fully custom dropdown — same look as the app's Theme / Status selectors.
   * Returns a hidden <input id="{id}"> whose .value is updated on pick.
   *
   * @param {string} id
   * @param {Array<{val:string, label:string}>} options
   * @param {string} selectedVal
   * @param {string} [onChangeFn]  name of global function called with (val)
   */
  function customSelect(id, options, selectedVal, onChangeFn) {
    var panelId = id + '-panel';

    // Find selected label / html
    var selLabel = '';
    var selContent = '';
    var selFound = false;
    for (var i = 0; i < options.length; i++) {
      if (String(options[i].val) === String(selectedVal)) {
        selLabel   = options[i].label;
        selContent = options[i].html || esc(options[i].label);
        selFound   = true;
        break;
      }
    }

    var trigStyle = [
      'width:100%', 'box-sizing:border-box', 'padding:0 36px 0 11px',
      'font-size:12px', 'border:1px solid var(--border-md)', 'border-radius:5px',
      'background-color:var(--surface)',
      'color:var(--text)', 'outline:none', 'font-family:inherit',
      'transition:border-color .15s', 'height:36px', 'display:flex',
      'align-items:center', 'justify-content:flex-start', 'cursor:pointer',
      'position:relative'
    ].join(';');

    var changePart = onChangeFn ? ',\'' + esc(onChangeFn) + '\'' : '';

    var isEmpty = !selFound || !selLabel;

    // Items support optional .html for rich content (e.g. avatar chips)
    // Items with divider:true render as a non-interactive separator line
    var items = options.map(function(o) {
      if (o.divider) {
        return '<div style="height:1px;background:var(--border);margin:4px 2px"></div>';
      }
      var isSel    = String(o.val) === String(selectedVal);
      var content  = o.html || esc(o.label);
      return '<div data-val="' + esc(String(o.val)) + '" data-cs-sel="' + (isSel ? '1' : '') + '" '
        + 'onclick="UI._csPick(\'' + esc(id) + '\',\'' + esc(String(o.val)) + '\',\'' + esc(o.label) + '\'' + changePart + ')" '
        + 'style="padding:7px 10px;font-size:12px;cursor:pointer;color:var(--text);border-radius:6px;'
        + 'transition:background .1s' + (isSel ? ';background:var(--subtle);font-weight:500' : '') + '" '
        + 'onmouseenter="this.style.background=\'var(--subtle)\'" '
        + 'onmouseleave="if(this.getAttribute(\'data-cs-sel\')==\'1\')this.style.background=\'var(--subtle)\';else this.style.background=\'\'">'
        + content + '</div>';
    }).join('');

    var chevron = '<svg width="10" height="6" viewBox="0 0 10 6" fill="none" '
      + 'style="position:absolute;right:11px;top:50%;transform:translateY(-50%);pointer-events:none;flex-shrink:0" '
      + 'xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M1 1l4 4 4-4" stroke="#A8A8A0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
      + '</svg>';

    return '<div style="position:relative" id="' + esc(id) + '-wrap">'
      + '<button type="button" id="' + esc(id) + '-btn" '
      + 'onclick="UI._csToggle(\'' + esc(id) + '\')" '
      + 'style="' + trigStyle + '" '
      + 'onfocus="this.style.borderColor=\'var(--accent)\'" onblur="this.style.borderColor=\'var(--border-md)\'">'
      + '<span id="' + esc(id) + '-lbl" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;'
      + (isEmpty ? 'color:var(--faint)' : '') + '">'
      + (isEmpty ? '' : selContent) + '</span>'
      + chevron
      + '</button>'
      + '<input type="hidden" id="' + esc(id) + '" value="' + esc(String(selectedVal || '')) + '">'
      + '<div id="' + esc(panelId) + '" class="tb-admin-dd" '
      + 'style="top:calc(100% + 4px);right:0;left:0;min-width:0;padding:4px;max-height:220px;overflow-y:auto">'
      + items
      + '</div>'
      + '</div>';
  }

  /** Toggle open/close the custom-select panel — uses fixed positioning to escape overflow containers */
  function _csToggle(id) {
    var panel = document.getElementById(id + '-panel');
    var btn   = document.getElementById(id + '-btn');
    if (!panel) return;
    var opening = !panel.classList.contains('open');
    if (opening && btn) {
      var rect       = btn.getBoundingClientRect();
      var panelMaxH  = 300; // conservative estimate (search + items)
      var spaceBelow = window.innerHeight - rect.bottom - 8;
      var spaceAbove = rect.top - 8;
      panel.style.position = 'fixed';
      panel.style.left     = rect.left + 'px';
      panel.style.right    = 'auto';
      panel.style.minWidth = rect.width + 'px';
      panel.style.zIndex   = '9999';
      if (spaceBelow < panelMaxH && spaceAbove > spaceBelow) {
        // Flip upward
        panel.style.top    = 'auto';
        panel.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
      } else {
        panel.style.top    = (rect.bottom + 4) + 'px';
        panel.style.bottom = 'auto';
      }
    }
    panel.classList.toggle('open', opening);
    if (btn) btn.style.borderColor = opening ? 'var(--accent)' : 'var(--border-md)';
    if (opening) {
      setTimeout(function() {
        document.addEventListener('click', function _close(e) {
          var wrap = document.getElementById(id + '-wrap');
          if (wrap && wrap.contains(e.target)) return;
          panel.classList.remove('open');
          if (btn) btn.style.borderColor = 'var(--border-md)';
          document.removeEventListener('click', _close);
        });
      }, 0);
    }
  }

  /** Pick an option in a custom-select. Supports rich HTML options (avatar chips, etc.) */
  function _csPick(id, val, label, onChangeFn) {
    var input = document.getElementById(id);
    var lblEl = document.getElementById(id + '-lbl');
    var panel = document.getElementById(id + '-panel');
    var btn   = document.getElementById(id + '-btn');
    if (input) input.value = val;
    if (panel) {
      panel.classList.remove('open');
      var selInner = null;
      panel.querySelectorAll('[data-val]').forEach(function(it) {
        var sel = it.getAttribute('data-val') === val;
        it.setAttribute('data-cs-sel', sel ? '1' : '');
        it.style.background = sel ? 'var(--subtle)' : '';
        it.style.fontWeight  = sel ? '500' : 'normal';
        if (sel) selInner = it.innerHTML;
      });
      if (lblEl) {
        if (selInner !== null) { lblEl.innerHTML = selInner; lblEl.style.color = ''; }
        else                   { lblEl.textContent = label;  lblEl.style.color = 'var(--text)'; }
      }
    }
    if (btn) btn.style.borderColor = 'var(--border-md)';
    if (onChangeFn && window[onChangeFn]) window[onChangeFn](val);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Section divider (inside a drawer / form body)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * @param {string} title
   * @param {string} [rightHtml]  optional right-side actions
   */
  function section(title, rightHtml) {
    return '<div style="border-top:1px solid var(--border);padding-top:18px;margin-top:6px;'
      + 'margin-bottom:14px;display:flex;align-items:center;justify-content:space-between">'
      + '<div style="font-size:13px;font-weight:600;color:var(--text);letter-spacing:-.2px">'
      + esc(title) + '</div>'
      + (rightHtml ? '<div>' + rightHtml + '</div>' : '')
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Section label  (standalone uppercase label — page / content sections)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Uppercase small muted label for content sections.
   * Different from UI.section() which adds a border-top separator.
   * Use for inline area headings: "DESCRIPTION", "ACTIVITY", "TEAM".
   *
   * @param {string} text
   * @param {string} [mb='8px']
   */
  function sectionLabel(text, mb) {
    return '<div style="' + LB + ';margin-bottom:' + (mb || '8px') + '">' + esc(text) + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Buttons
  // ─────────────────────────────────────────────────────────────────────────

  /** Primary (filled accent) */
  function btnPrimary(label, onclick, id) {
    return '<button' + (id ? ' id="' + esc(id) + '"' : '') + ' onclick="' + onclick + '" '
      + 'style="display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;background:var(--accent);color:#fff;border:none;'
      + 'border-radius:5px;font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;transition:opacity .15s" '
      + 'onmouseenter="this.style.opacity=\'.85\'" onmouseleave="this.style.opacity=\'1\'">'
      + label + '</button>';
  }

  /** Cancel / secondary (ghost with border) */
  function btnCancel(label, onclick) {
    return '<button onclick="' + onclick + '" '
      + 'style="height:34px;padding:0 16px;background:none;border:1px solid var(--border-md);'
      + 'border-radius:5px;font-size:13px;font-family:inherit;color:var(--muted);cursor:pointer;transition:border-color .15s">'
      + label + '</button>';
  }

  /** Danger / destructive (red outline) */
  function btnDanger(label, onclick) {
    return '<button onclick="' + onclick + '" '
      + 'style="height:34px;padding:0 14px;background:none;border:1px solid #E5243B;'
      + 'border-radius:5px;font-size:13px;font-family:inherit;color:#E5243B;cursor:pointer;transition:opacity .15s" '
      + 'onmouseenter="this.style.opacity=\'.75\'" onmouseleave="this.style.opacity=\'1\'">'
      + label + '</button>';
  }

  /** Icon button (28×28, borderless — used inside table rows / drawers) */
  function btnIcon(onclick, title, svgHtml, baseColor, hoverColor, hoverBg) {
    var bc = baseColor  || 'var(--faint)';
    var hc = hoverColor || 'var(--accent)';
    var hb = hoverBg    || 'rgba(237,0,94,.07)';
    return '<button onclick="' + onclick + '" title="' + esc(title) + '" '
      + 'style="width:28px;height:28px;border:none;border-radius:6px;background:none;'
      + 'color:' + bc + ';cursor:pointer;display:inline-flex;align-items:center;'
      + 'justify-content:center;transition:color .12s,background .12s" '
      + 'onmouseenter="this.style.color=\'' + hc + '\';this.style.background=\'' + hb + '\'" '
      + 'onmouseleave="this.style.color=\'' + bc + '\';this.style.background=\'none\'">'
      + svgHtml + '</button>';
  }

  /**
   * Bordered square icon button (default 36×36).
   * Use for toolbar actions: Filter, Export, Settings.
   * @param {string} onclick
   * @param {string} title     tooltip
   * @param {string} svgHtml
   * @param {number} [size=36]
   */
  function btnIconBordered(onclick, title, svgHtml, size) {
    var sz = (size || 34) + 'px';
    return '<button onclick="' + onclick + '" title="' + esc(title) + '" '
      + 'style="width:' + sz + ';height:' + sz + ';border:1px solid var(--border-md);'
      + 'border-radius:5px;background:var(--surface);color:var(--muted);cursor:pointer;'
      + 'display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;'
      + 'transition:border-color .12s,color .12s,background .12s" '
      + 'onmouseenter="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\';this.style.background=\'rgba(237,0,94,.04)\'" '
      + 'onmouseleave="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\';this.style.background=\'var(--surface)\'">'
      + svgHtml + '</button>';
  }

  /**
   * Secondary / neutral button — "Tools ▾" style.
   * Muted text at rest; accent on hover. Use for auxiliary toolbar actions.
   */
  function btnSecondary(label, onclick, id) {
    return '<button' + (id ? ' id="' + esc(id) + '"' : '') + ' onclick="' + onclick + '" '
      + 'style="display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 13px;'
      + 'background:var(--surface);color:var(--muted);border:1px solid var(--border-md);'
      + 'border-radius:5px;font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;'
      + 'transition:border-color .15s,color .15s" '
      + 'onmouseenter="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" '
      + 'onmouseleave="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'">'
      + label + '</button>';
  }

  /**
   * Slim button (11 px font, surface bg, hover subtle).
   * Use for secondary row-level actions: "Copy form link", "+ Add Idea".
   * @param {string} label  can include an SVG icon before the text
   */
  function btnSlim(label, onclick, id) {
    return '<button' + (id ? ' id="' + esc(id) + '"' : '') + ' onclick="' + onclick + '" '
      + 'style="display:inline-flex;align-items:center;gap:5px;flex-shrink:0;'
      + 'padding:5px 12px;font-size:11px;font-weight:500;font-family:inherit;'
      + 'border:1px solid var(--border-md);border-radius:5px;background:var(--surface);'
      + 'color:var(--text);cursor:pointer;transition:background .12s" '
      + 'onmouseenter="this.style.background=\'var(--subtle)\'" '
      + 'onmouseleave="this.style.background=\'var(--surface)\'">'
      + label + '</button>';
  }

  /**
   * Text-only button — no border, no background. Just colored label.
   * Ideal for inline actions: "+ Add", "Clear all", "View all".
   * @param {string} label       — can include an SVG icon
   * @param {string} onclickFn   — JS expression
   * @param {string} [color]     — defaults to var(--accent)
   * @param {string} [id]
   */
  function btnText(label, onclickFn, color, id) {
    var c = color || 'var(--accent)';
    return '<button type="button"'
      + (id ? ' id="' + esc(id) + '"' : '')
      + (onclickFn ? ' onclick="' + onclickFn + '"' : '')
      + ' style="background:none;border:none;color:' + c + ';font-size:11px;font-weight:600;'
      + 'cursor:pointer;font-family:inherit;padding:0;letter-spacing:.1px;'
      + 'display:inline-flex;align-items:center;gap:4px;line-height:1;'
      + 'transition:opacity .15s"'
      + ' onmouseenter="this.style.opacity=\'.65\'"'
      + ' onmouseleave="this.style.opacity=\'1\'">'
      + label
      + '</button>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Badge
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * @param {string} label
   * @param {string} [color]  text color (CSS value)
   * @param {string} [bg]     background color (CSS value)
   */
  function badge(label, color, bg) {
    return '<span style="display:inline-flex;align-items:center;'
      + 'font-size:11px;font-weight:500;padding:2px 8px;border-radius:5px;white-space:nowrap;'
      + 'color:' + (color || 'var(--muted)') + ';'
      + 'background:' + (bg || 'var(--subtle)') + '">'
      + esc(label) + '</span>';
  }

  /**
   * Counter badge — small numeric pill (18px circle / auto-width for 2+ digits).
   * Uses var(--subtle) bg + var(--muted) text by default.
   * Pass count=0 or count='' to return '' (nothing rendered).
   * @param {number|string} count
   * @param {string} [bg]     background CSS value
   * @param {string} [color]  text CSS value
   */
  function counterBadge(count, bg, color) {
    if (count == null || count === '' || count === 0) return '';
    return '<span style="display:inline-flex;align-items:center;justify-content:center;'
      + 'min-width:18px;height:18px;padding:0 5px;border-radius:999px;box-sizing:border-box;'
      + 'font-size:10px;font-weight:600;line-height:1;flex-shrink:0;'
      + 'background:' + (bg || 'var(--subtle)') + ';'
      + 'color:' + (color || 'var(--muted)') + '">'
      + esc(String(count))
      + '</span>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Status chip  (delivery status — uses ds-* classes from style.css)
  // ─────────────────────────────────────────────────────────────────────────

  var _STATUS_DEFS = {
    'draft':       { label: 'Draft',       cls: 'ds-gray'   },
    'planned':     { label: 'Planned',     cls: 'ds-blue'   },
    'pacing':      { label: 'Pacing',      cls: 'ds-green'  },
    'underpacing': { label: 'Underpacing', cls: 'ds-yellow' },
    'error':       { label: 'Error',       cls: 'ds-red'    },
    'completed':   { label: 'Completed',   cls: 'ds-indigo' },
    'complete':    { label: 'Complete',    cls: 'ds-green'  },
    'incomplete':  { label: 'Incomplete',  cls: 'ds-pink'   },
  };

  /**
   * Delivery-status pill. Uses sc-badge + ds-* from style.css.
   * @param {string} val  'not-started'|'on-track'|'at-risk'|'delayed'|'on-hold'|'delivered'
   */
  function statusChip(val) {
    var s = _STATUS_DEFS[val] || { label: val || '—', cls: 'ds-gray' };
    return '<span class="sc-badge ' + s.cls + '">' + esc(s.label) + '</span>';
  }

  /** Array of all status values (useful for building select options) */
  var STATUS_OPTS = Object.keys(_STATUS_DEFS).map(function (k) {
    return { val: k, label: _STATUS_DEFS[k].label };
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Driver chip
  // Same palette & hash logic as kervDriverColor() in app.js.
  // Defined here so ui-kit.js is self-contained (loaded before app.js).
  // ─────────────────────────────────────────────────────────────────────────

  var _DRIVER_PALETTE = [
    '#6366F1','#06B6D4','#10B981','#F59E0B','#EF4444',
    '#EC4899','#8B5CF6','#14B8A6','#F97316','#3B82F6',
    '#84CC16','#A855F7'
  ];
  var _DRIVER_OVERRIDES = {
    'Retention and Expansion': '#E6A800'
  };
  function _driverColor(name) {
    if (!name || name === '—') return '#8E8E93';
    if (_DRIVER_OVERRIDES[name]) return _DRIVER_OVERRIDES[name];
    var h = 0;
    for (var i = 0; i < name.length; i++) { h = (h * 31 + name.charCodeAt(i)) >>> 0; }
    return _DRIVER_PALETTE[h % _DRIVER_PALETTE.length];
  }

  /**
   * Driver chip — coloured rounded pill used in the Product Roadmap driver column.
   * Color is determined deterministically from the driver name (same algorithm as
   * kervDriverColor in app.js, plus explicit overrides).
   * @param {string} name  e.g. 'Revenue Generating', 'Strategic', …
   */
  function driverChip(name) {
    if (!name) return '';
    var c = _driverColor(name);
    return '<span class="sc-badge" style="background:' + c + '18;color:' + c + '">' + esc(name) + '</span>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Department chip  (fixed colour-coded pill per department)
  // ─────────────────────────────────────────────────────────────────────────

  var _DEPT_COLORS = {
    'Product':            { text: '#D97706', bg: 'rgba(217,119,6,.12)'   },  // amber
    'Tech':               { text: '#4F46E5', bg: 'rgba(79,70,229,.1)'    },  // indigo
    'Design':             { text: '#7C3AED', bg: 'rgba(124,58,237,.1)'   },  // violet
    'Marketing':          { text: '#DB2777', bg: 'rgba(219,39,119,.1)'   },  // pink
    'Sales':              { text: '#059669', bg: 'rgba(5,150,105,.1)'    },  // emerald
    'Strategy':           { text: '#0EA5E9', bg: 'rgba(14,165,233,.1)'   },  // sky
    'People & Culture':   { text: '#E11D48', bg: 'rgba(225,29,72,.1)'    },  // rose
    'Operations':         { text: '#0891B2', bg: 'rgba(8,145,178,.1)'    },  // cyan
    'Finance':            { text: '#16A34A', bg: 'rgba(22,163,74,.1)'    }   // green
  };

  /**
   * Department chip — fixed colour per department name.
   * Falls back to a neutral badge for unknown departments.
   * @param {string} name  e.g. 'Product', 'Tech', 'Design', …
   */
  function deptChip(name) {
    if (!name) return '';
    var c = _DEPT_COLORS[name] || { text: 'var(--muted)', bg: 'var(--subtle)' };
    return '<span class="sc-badge" style="background:' + c.bg + ';color:' + c.text + '">' + esc(name) + '</span>';
  }

  /**
   * Small department chip — same colours, reduced size (10px / 1px 5px).
   * Use inside compact components like avatarChip / userTile.
   * @param {string} name
   */
  function deptChipSm(name) {
    if (!name) return '';
    var c = _DEPT_COLORS[name] || { text: 'var(--muted)', bg: 'var(--subtle)' };
    return '<span style="display:inline-block;font-size:9.5px;font-weight:500;'
      + 'padding:1px 6px;border-radius:20px;'
      + 'background:' + c.bg + ';color:' + c.text + ';line-height:1.5;white-space:nowrap">'
      + esc(name) + '</span>';
  }

  /** All canonical departments as select options with chip html */
  var DEPT_OPTS = [
    'Product','Tech','Design','Marketing','Sales',
    'Strategy','People & Culture','Operations','Finance'
  ].map(function(d) {
    return { val: d, label: d, html: deptChip(d) };
  });

  /** The five canonical Kerv drivers, ready for cellCustomSelect or any picker */
  var DRIVER_OPTS = [
    'Revenue Generating',
    'Operational Efficiency',
    'Retention and Expansion',
    'Strategic',
    'Tech Scaling'
  ].map(function(d) {
    return { val: d, label: d, html: driverChip(d) };
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Pills navigation  (.tabnav / .tabitem / .tabitem.act from style.css)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * @param {Array<{id:string, label:string, count?:number|null}>} tabs
   * @param {string} activeId
   * @param {string} onClickFn  name of the JS function to call with (tabId)
   */
  function pills(tabs, activeId, onClickFn) {
    var DIVIDER = '<span style="width:1px;height:16px;background:var(--border-md);'
      + 'margin:0 6px;display:inline-flex;align-self:center;flex-shrink:0"></span>';
    return '<div class="tabnav">'
      + tabs.map(function (t) {
          var countHtml = (t.count != null)
            ? ' ' + counterBadge(t.count)
            : '';
          var btn = '<button class="tabitem' + (t.id === activeId ? ' act' : '') + '" '
            + 'onclick="' + onClickFn + '(\'' + esc(t.id) + '\')">'
            + esc(t.label) + countHtml + '</button>';
          return (t.dividerBefore ? DIVIDER : '') + btn;
        }).join('')
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Tab nav  — underline style (accent bottom border on active tab)
  //
  // Usage:
  //   UI.tabNav([{ id: 'a', label: 'Tab A' }, ...], activeId, 'myFn')
  //
  // Wrap in a div with a stable id to re-render on switch:
  //   '<div id="my-tabs">' + UI.tabNav(tabs, active, 'fn') + '</div>'
  //   document.getElementById('my-tabs').innerHTML = UI.tabNav(tabs, newActive, 'fn');
  // ─────────────────────────────────────────────────────────────────────────

  function tabNav(tabs, activeId, onClickFn) {
    var DIVIDER = '<span style="width:1px;height:14px;background:var(--border-md);margin:0 4px;display:inline-flex;align-self:center;flex-shrink:0"></span>';
    return '<div class="ul-tabnav">'
      + tabs.map(function(t) {
          var btn = '<button class="ul-tabitem' + (t.id === activeId ? ' act' : '') + '" '
            + 'onclick="' + onClickFn + '(\'' + esc(t.id) + '\')">'
            + esc(t.label) + '</button>';
          return (t.dividerBefore ? DIVIDER : '') + btn;
        }).join('')
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Year nav  (← 2026 →)
  // Exact pixel values from ovxYearNav in overview-product.js
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * @param {number}   year
   * @param {number[]} availableYears  sorted array of years from DB
   * @param {string}   changeFn        name of function called with (+1 or -1)
   */
  function yearNav(year, availableYears, changeFn) {
    var list    = availableYears || [year];
    var idx     = list.indexOf(year);
    var hasPrev = idx > 0;
    var hasNext = idx < list.length - 1;
    var BASE = 'width:22px;height:22px;border-radius:5px;border:1px solid var(--border);'
      + 'background:var(--surface);cursor:pointer;display:inline-flex;align-items:center;'
      + 'justify-content:center;font-size:12px;line-height:1;color:var(--text)';
    var DIS = BASE + ';opacity:.3;cursor:default;pointer-events:none';
    return '<div style="display:inline-flex;align-items:center;gap:6px">'
      + '<button type="button" onclick="' + changeFn + '(-1)" style="' + (hasPrev ? BASE : DIS) + '">&#8592;</button>'
      + '<span style="font-size:11px;font-weight:600;color:var(--text);min-width:32px;text-align:center">'
      + year + '</span>'
      + '<button type="button" onclick="' + changeFn + '(1)" style="' + (hasNext ? BASE : DIS) + '">&#8594;</button>'
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Quarter / generic small pills  (Q1 Q2 Q3 Q4 Backlog)
  // Same wrapper as pills() but convenience alias
  // ─────────────────────────────────────────────────────────────────────────

  function quarterPills(quarters, activeQ, onClickFn) {
    return pills(
      quarters.map(function (q) { return { id: q, label: q }; }),
      activeQ, onClickFn
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Drawer (right slide-in panel)
  // ─────────────────────────────────────────────────────────────────────────

  function _closeBtn(closeFn) {
    return '<button onclick="' + closeFn + '()" '
      + 'style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;'
      + 'border:1px solid var(--border-md);border-radius:5px;background:none;cursor:pointer;'
      + 'color:var(--muted);transition:border-color .15s,color .15s;flex-shrink:0" '
      + 'onmouseenter="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" '
      + 'onmouseleave="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'">'
      + '<svg width="12" height="12" viewBox="0 0 14 14" fill="none">'
      + '<path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
      + '</svg></button>';
  }

  /**
   * Creates and appends a right-side slide-in drawer.
   *
   * opts: {
   *   id          : string   overlay element id
   *   width       : string   e.g. '520px'  (default)
   *   title       : string
   *   subtitle    : string   optional
   *   closeFn     : string   name of the global close function
   *   bodyHtml    : string
   *   footerLeft  : string   HTML for left side (e.g. Delete btn), default ''
   *   footerRight : string   HTML for right side (Cancel + Save), default ''
   * }
   *
   * Returns the overlay element.
   */
  function openDrawer(opts) {
    var existing = document.getElementById(opts.id);
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var overlay = document.createElement('div');
    overlay.id  = opts.id;
    // Backdrop only — no flex layout needed since panel is self-positioned
    overlay.style.cssText = 'position:fixed;inset:0;z-index:600;pointer-events:auto';

    var bd = document.createElement('div');
    bd.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0);transition:background .28s ease;cursor:pointer';
    bd.onclick = function () { if (window[opts.closeFn]) window[opts.closeFn](); };

    var w = opts.width || '520px';
    var panel = document.createElement('div');
    panel.style.cssText = [
      // position:fixed + right animation avoids transform entirely.
      // transform would create a containing block for position:fixed descendants
      // (custom-select panels), trapping their viewport coordinates.
      'position:fixed',
      'top:0',
      'right:-100vw',
      'width:' + w,
      'max-width:95vw',
      'height:100%',
      'background:var(--surface)',
      'box-shadow:-6px 0 40px rgba(0,0,0,.13)',
      'display:flex',
      'flex-direction:column',
      'z-index:601',
      'transition:right .3s cubic-bezier(.4,0,.2,1)',
      'font-family:inherit'
    ].join(';');

    var hdr = document.createElement('div');
    hdr.style.cssText = 'padding:18px 28px;border-bottom:1px solid var(--border);'
      + 'display:flex;align-items:center;justify-content:space-between;flex-shrink:0';
    hdr.innerHTML = '<div>'
      + '<div style="font-size:15px;font-weight:600;letter-spacing:-.3px;color:var(--text)">'
      + (opts.title || '') + '</div>'
      + (opts.subtitle
          ? '<div style="font-size:12px;color:var(--faint);margin-top:2px">' + opts.subtitle + '</div>'
          : '')
      + '</div>'
      + _closeBtn(opts.closeFn);

    var body = document.createElement('div');
    body.style.cssText = 'flex:1;overflow-y:auto;padding:24px 28px';
    body.innerHTML = opts.bodyHtml || '';

    var ftr = document.createElement('div');
    ftr.style.cssText = 'padding:14px 28px;border-top:1px solid var(--border);'
      + 'display:flex;justify-content:space-between;align-items:center;flex-shrink:0;background:var(--surface)';
    ftr.innerHTML = (opts.footerLeft || '<span></span>')
      + '<div style="display:flex;gap:8px">' + (opts.footerRight || '') + '</div>';

    panel.appendChild(hdr);
    panel.appendChild(body);
    panel.appendChild(ftr);
    overlay.appendChild(bd);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bd.style.background = 'rgba(0,0,0,.28)';
        panel.style.right   = '0';
      });
    });

    return overlay;
  }

  function closeDrawer(id) {
    var ov = document.getElementById(id);
    if (!ov) return;
    var bd    = ov.firstElementChild;
    var panel = ov.lastElementChild;
    if (bd)    bd.style.background = 'rgba(0,0,0,0)';
    if (panel) panel.style.right   = '-100vw';
    setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 300);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Centre modal  — centered dialog, scale animation, backdrop click to close
  //
  // Distinct from Drawer (which slides from the right, full-height).
  // Use Modal for: confirmations, quick forms, short edits.
  // Use Drawer for: detailed forms, multi-step flows, complex editing.
  //
  // Same opts API as openDrawer:
  //   id, width, title, subtitle, closeFn, bodyHtml, footerLeft, footerRight
  // ─────────────────────────────────────────────────────────────────────────

  function openModal(opts) {
    var existing = document.getElementById(opts.id);
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var overlay = document.createElement('div');
    overlay.id  = opts.id;
    overlay.style.cssText = 'position:fixed;inset:0;z-index:600;display:flex;align-items:center;'
      + 'justify-content:center;background:rgba(0,0,0,0);transition:background .22s';
    overlay.onclick = function (e) {
      if (e.target === overlay && opts.closeFn && window[opts.closeFn]) window[opts.closeFn]();
    };

    var box = document.createElement('div');
    box.style.cssText = [
      'background:var(--surface)',
      'border:1px solid var(--border)',
      'border-radius:10px',
      'width:' + (opts.width || '480px'),
      'max-width:95vw',
      'max-height:90vh',
      'display:flex',
      'flex-direction:column',
      'box-shadow:0 12px 48px rgba(0,0,0,.18)',
      'font-family:inherit',
      'transform:scale(.96)',
      'opacity:0',
      'transition:transform .22s cubic-bezier(.4,0,.2,1),opacity .22s'
    ].join(';');

    var hdr = document.createElement('div');
    hdr.style.cssText = 'padding:18px 24px 16px;border-bottom:1px solid var(--border);'
      + 'display:flex;align-items:flex-start;justify-content:space-between;flex-shrink:0';
    hdr.innerHTML = '<div>'
      + '<div style="font-size:15px;font-weight:600;letter-spacing:-.3px;color:var(--text)">'
      + (opts.title || '') + '</div>'
      + (opts.subtitle
          ? '<div style="font-size:12px;color:var(--faint);margin-top:2px">' + opts.subtitle + '</div>'
          : '')
      + '</div>'
      + _closeBtn(opts.closeFn);

    var body = document.createElement('div');
    body.style.cssText = 'flex:1;overflow-y:auto;padding:20px 24px';
    body.innerHTML = opts.bodyHtml || '';

    var ftr = document.createElement('div');
    ftr.style.cssText = 'padding:14px 24px;border-top:1px solid var(--border);'
      + 'display:flex;justify-content:space-between;align-items:center;flex-shrink:0;'
      + 'background:var(--surface);border-radius:0 0 10px 10px';
    ftr.innerHTML = (opts.footerLeft || '<span></span>')
      + '<div style="display:flex;gap:8px">' + (opts.footerRight || '') + '</div>';

    box.appendChild(hdr);
    box.appendChild(body);
    box.appendChild(ftr);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.style.background = 'rgba(0,0,0,.32)';
        box.style.transform = 'scale(1)';
        box.style.opacity   = '1';
      });
    });

    return overlay;
  }

  function closeModal(id) {
    var ov  = document.getElementById(id);
    if (!ov) return;
    var box = ov.firstElementChild;
    ov.style.background = 'rgba(0,0,0,0)';
    if (box) { box.style.transform = 'scale(.96)'; box.style.opacity = '0'; }
    setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 230);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Inline cell components  (ghost style — used inside table rows)
  // ─────────────────────────────────────────────────────────────────────────
  //
  // "Ghost" = transparent border at rest → border-md on hover → accent on focus.
  // Matches the _autoTI / _autoSEL / rnxCustomSel patterns from settings-neon / roadmap-neon.

  /** Ghost text input — auto-saves on blur (pass onBlurFn name string) */
  /**
   * Read-only cell — static counterpart to all ghost cell variants
   * (cellInput, cellCustomSelect, cellOutlinedInput, cellOutlinedSelect).
   *
   * Renders content in the identical box/font of a ghost cell permanently
   * at rest: same 2 px 5 px inner padding, same 11 px font, same min-height.
   * Pass any HTML — plain text, UI.badge(), UI.deptChip(), avatar chips, etc.
   *
   * Null / undefined / '' → renders an em-dash in var(--faint).
   */
  function cellReadOnly(content) {
    var inner = (content !== null && content !== undefined && String(content) !== '')
      ? content
      : '<span style="color:var(--faint)">—</span>';
    return '<div style="padding:2px 5px;font-size:11px;color:var(--text);'
      + 'font-family:inherit;min-height:22px;display:flex;align-items:center;line-height:1.4">'
      + inner + '</div>';
  }

  function cellInput(id, value, placeholder, onBlurFn) {
    var GHI = 'width:100%;box-sizing:border-box;padding:2px 5px;font-size:11px;'
      + 'border:1px solid transparent;border-radius:4px;background:transparent;'
      + 'color:var(--text);outline:none;font-family:inherit;'
      + 'transition:border-color .12s,background .12s,box-shadow .12s';
    var fo  = 'this.style.borderColor=\'var(--accent)\';this.style.background=\'var(--bg)\';'
      + 'this.style.boxShadow=\'0 0 0 3px rgba(237,0,94,.08)\'';
    var bl  = 'this.style.borderColor=\'transparent\';this.style.background=\'transparent\';'
      + 'this.style.boxShadow=\'none\'';
    var hov = 'if(document.activeElement!==this){'
      + 'this.style.borderColor=\'var(--border-md)\';this.style.background=\'var(--bg)\'}';
    var unHov = 'if(document.activeElement!==this){'
      + 'this.style.borderColor=\'transparent\';this.style.background=\'transparent\'}';
    return '<input type="text" id="' + esc(id) + '" value="' + esc(value || '') + '" '
      + 'placeholder="' + esc(placeholder || '') + '" '
      + 'style="' + GHI + '" '
      + 'onmouseenter="' + hov + '" '
      + 'onmouseleave="' + unHov + '" '
      + 'onfocus="' + fo + '" '
      + 'onblur="' + bl + (onBlurFn ? ';' + onBlurFn : '') + '">';
  }

  /**
   * Outlined cell input — always-visible border (solid at rest, accent on focus).
   * Two variants via optional `helper` param:
   *   UI.cellOutlinedInput('id', value, 'placeholder', 'saveFn()')
   *   UI.cellOutlinedInput('id', value, 'placeholder', 'saveFn()', 'FTE')  // right-side label
   *
   * helper can be any string: 'FTE', '$', '%', 'hrs', etc.
   */
  function cellOutlinedInput(id, value, placeholder, onBlurFn, helper) {
    var wid = esc(id) + '-w';
    var fo  = 'document.getElementById(\'' + wid + '\').style.borderColor=\'var(--accent)\';'
      + 'document.getElementById(\'' + wid + '\').style.boxShadow=\'0 0 0 3px rgba(237,0,94,.08)\'';
    var bl  = 'document.getElementById(\'' + wid + '\').style.borderColor=\'var(--border-md)\';'
      + 'document.getElementById(\'' + wid + '\').style.boxShadow=\'none\''
      + (onBlurFn ? ';' + onBlurFn : '');
    var helperHtml = helper
      ? '<span id="' + esc(id) + '-helper" style="padding:0 9px;font-size:11px;font-weight:500;color:var(--faint);'
        + 'border-left:1px solid var(--border);white-space:nowrap;'
        + 'align-self:stretch;display:flex;align-items:center">' + esc(String(helper)) + '</span>'
      : '';
    return '<div id="' + wid + '" style="display:inline-flex;align-items:center;width:100%;'
      + 'border:1px solid var(--border-md);border-radius:6px;background:var(--surface);'
      + 'overflow:hidden;transition:border-color .15s,box-shadow .15s">'
      + '<input type="text" id="' + esc(id) + '" value="' + esc(value || '') + '" '
      + 'placeholder="' + esc(placeholder || '') + '" '
      + 'style="flex:1;min-width:0;border:none;background:transparent;padding:4px 8px;'
      + 'font-size:12px;color:var(--text);outline:none;font-family:inherit" '
      + 'onfocus="' + fo + '" '
      + 'onblur="' + bl + '">'
      + helperHtml
      + '</div>';
  }

  /** Ghost custom select (simple option lists — Quarter, Role, etc.) */
  function cellSelect(id, options, selectedVal, onChangeFn) {
    var opts = options.map(function(o) {
      var v = (o.val !== undefined) ? o.val : o;
      var l = o.label || String(v);
      return { val: v, label: l };
    });
    return cellCustomSelect(id, opts, selectedVal, onChangeFn);
  }

  /**
   * Ghost custom-dropdown cell — transparent at rest, shows panel on click.
   * Identical to UI.customSelect() but with ghost trigger styling (no solid border).
   * Use for Status, Driver, Theme, Quarter columns in Roadmap Table View.
   *
   * Options can include {val, label, html} where html is rendered inside both
   * the panel item and the trigger label (e.g. status chip, colored badge).
   *
   * @param {string} id
   * @param {Array<{val:string, label:string, html?:string}>} options
   * @param {string} selectedVal
   * @param {string} [onChangeFn]
   */
  function cellCustomSelect(id, options, selectedVal, onChangeFn) {
    var panelId = id + '-panel';

    var selHtml = '<span style="color:var(--faint)">—</span>';
    for (var i = 0; i < options.length; i++) {
      if (String(options[i].val) === String(selectedVal)) {
        selHtml = options[i].html || esc(options[i].label);
        break;
      }
    }

    var changePart = onChangeFn ? ',\'' + esc(onChangeFn) + '\'' : '';

    var items = options.map(function (o) {
      var isSel = String(o.val) === String(selectedVal);
      var content = o.html || esc(o.label);
      return '<div data-val="' + esc(String(o.val)) + '" data-cs-sel="' + (isSel ? '1' : '') + '" '
        + 'onclick="UI._cscPick(\'' + esc(id) + '\',\'' + esc(String(o.val)) + '\',\'' + esc(o.label) + '\'' + changePart + ')" '
        + 'style="padding:6px 9px;cursor:pointer;border-radius:5px;font-size:11px;'
        + 'transition:background .1s' + (isSel ? ';background:var(--subtle)' : '') + '" '
        + 'onmouseenter="this.style.background=\'var(--bg)\'" '
        + 'onmouseleave="if(this.getAttribute(\'data-cs-sel\')==\'1\')this.style.background=\'var(--subtle)\';else this.style.background=\'\'">'
        + content + '</div>';
    }).join('');

    var trigStyle = [
      'width:100%', 'box-sizing:border-box', 'padding:2px 22px 2px 5px',
      'font-size:11px', 'border:1px solid transparent', 'border-radius:4px',
      'background-color:transparent',
      'color:var(--text)', 'outline:none', 'font-family:inherit',
      'transition:border-color .12s,background .12s,box-shadow .12s',
      'height:26px', 'display:flex', 'align-items:center', 'justify-content:flex-start',
      'cursor:pointer', 'position:relative'
    ].join(';');

    // Inline SVG chevron — same approach as customSelect, always visible
    var cscChevron = '<svg width="8" height="5" viewBox="0 0 10 6" fill="none" '
      + 'style="position:absolute;right:5px;top:50%;transform:translateY(-50%);pointer-events:none;flex-shrink:0" '
      + 'xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M1 1l4 4 4-4" stroke="#A8A8A0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
      + '</svg>';

    return '<div style="position:relative" id="' + esc(id) + '-wrap">'
      + '<button type="button" id="' + esc(id) + '-btn" '
      + 'onclick="UI._cscToggle(\'' + esc(id) + '\')" '
      + 'style="' + trigStyle + '" '
      + 'onmouseenter="if(!document.getElementById(\'' + esc(id) + '-panel\').classList.contains(\'open\')){this.style.borderColor=\'var(--border-md)\';this.style.background=\'var(--bg)\'}" '
      + 'onmouseleave="if(!document.getElementById(\'' + esc(id) + '-panel\').classList.contains(\'open\')){this.style.borderColor=\'transparent\';this.style.background=\'transparent\'}">'
      + '<span id="' + esc(id) + '-lbl" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left">' + selHtml + '</span>'
      + cscChevron
      + '</button>'
      + '<input type="hidden" id="' + esc(id) + '" value="' + esc(String(selectedVal || '')) + '">'
      + '<div id="' + esc(panelId) + '" class="tb-admin-dd" '
      + 'style="top:calc(100% + 2px);right:0;left:0;min-width:150px;padding:4px;max-height:200px;overflow-y:auto">'
      + items
      + '</div>'
      + '</div>';
  }

  function _cscClose(panel, btn) {
    panel.classList.remove('open');
    // Restore panel to its original parent (was moved to body to escape stacking contexts)
    if (panel._cscOrigParent) {
      try { panel._cscOrigParent.appendChild(panel); } catch(e) {}
      panel._cscOrigParent = null;
    }
    if (btn) { btn.style.borderColor = 'transparent'; btn.style.background = 'transparent'; btn.style.boxShadow = 'none'; }
  }

  function _cscToggle(id) {
    var panel = document.getElementById(id + '-panel');
    var btn   = document.getElementById(id + '-btn');
    if (!panel) return;
    var opening = !panel.classList.contains('open');
    if (opening && btn) {
      // Move panel to <body> so it escapes any ancestor stacking context
      // (position:sticky + z-index on frozen table columns creates stacking contexts
      // that trap position:fixed descendants regardless of their z-index)
      if (!panel._cscOrigParent) {
        panel._cscOrigParent = panel.parentNode;
        document.body.appendChild(panel);
      }
      var rect = btn.getBoundingClientRect();
      panel.style.position = 'fixed';
      panel.style.top      = (rect.bottom + 2) + 'px';
      panel.style.left     = rect.left + 'px';
      panel.style.right    = 'auto';
      panel.style.width    = Math.max(rect.width, 150) + 'px';
      panel.style.zIndex   = '9999';
    }
    panel.classList.toggle('open', opening);
    if (btn) {
      if (opening) {
        btn.style.borderColor = 'var(--accent)';
        btn.style.background  = 'var(--bg)';
        btn.style.boxShadow   = '0 0 0 3px rgba(237,0,94,.08)';
      } else {
        _cscClose(panel, btn);
      }
    }
    if (opening) {
      setTimeout(function () {
        document.addEventListener('click', function _close(e) {
          var wrap = document.getElementById(id + '-wrap');
          // Ignore clicks inside the trigger wrap OR inside the panel itself
          if (wrap && wrap.contains(e.target)) return;
          if (panel.contains(e.target)) return;
          _cscClose(panel, btn);
          document.removeEventListener('click', _close);
        });
      }, 0);
    }
  }

  function _cscPick(id, val, label, onChangeFn) {
    var input = document.getElementById(id);
    var lblEl = document.getElementById(id + '-lbl');
    var panel = document.getElementById(id + '-panel');
    var btn   = document.getElementById(id + '-btn');
    if (input) input.value = val;
    if (panel) {
      var rows = panel.querySelectorAll('[data-val]');
      for (var i = 0; i < rows.length; i++) {
        var isSel = rows[i].getAttribute('data-val') === val;
        rows[i].setAttribute('data-cs-sel', isSel ? '1' : '');
        rows[i].style.background = isSel ? 'var(--subtle)' : '';
        if (isSel && lblEl) lblEl.innerHTML = rows[i].innerHTML;
      }
      _cscClose(panel, btn);
    }
    if (onChangeFn) {
      if (typeof window[onChangeFn] === 'function') { window[onChangeFn](val); }
      else { try { (0, eval)(onChangeFn); } catch(e) {} }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Outlined cell select  (always-visible border — mirrors cellOutlinedInput)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Custom dropdown for table cells with a permanent outlined border.
   * Visually matches cellOutlinedInput — use together in the same row.
   *
   * @param {string}  id
   * @param {Array<{val:string, label:string, html?:string}>} options
   * @param {string}  selectedVal
   * @param {string}  [onChangeFn]  Global fn name called with selected value
   */
  function cellOutlinedSelect(id, options, selectedVal, onChangeFn) {
    var panelId = id + '-panel';

    var selHtml = '<span style="color:var(--faint)">—</span>';
    for (var i = 0; i < options.length; i++) {
      if (String(options[i].val) === String(selectedVal)) {
        selHtml = options[i].html || esc(options[i].label);
        break;
      }
    }

    var changePart = onChangeFn ? ',\'' + esc(onChangeFn) + '\'' : '';

    var items = options.map(function(o) {
      var isSel = String(o.val) === String(selectedVal);
      var content = o.html || esc(o.label);
      return '<div data-val="' + esc(String(o.val)) + '" data-cos-sel="' + (isSel ? '1' : '') + '" '
        + 'onclick="UI._cosPick(\'' + esc(id) + '\',\'' + esc(String(o.val)) + '\',\'' + esc(o.label) + '\'' + changePart + ')" '
        + 'style="padding:6px 9px;cursor:pointer;border-radius:5px;font-size:11px;'
        + 'transition:background .1s' + (isSel ? ';background:var(--subtle)' : '') + '" '
        + 'onmouseenter="this.style.background=\'var(--bg)\'" '
        + 'onmouseleave="if(this.getAttribute(\'data-cos-sel\')==\'1\')this.style.background=\'var(--subtle)\';else this.style.background=\'\'">'
        + content + '</div>';
    }).join('');

    var chevron = '<svg width="8" height="5" viewBox="0 0 10 6" fill="none" '
      + 'style="position:absolute;right:5px;top:50%;transform:translateY(-50%);pointer-events:none;flex-shrink:0">'
      + '<path d="M1 1l4 4 4-4" stroke="#A8A8A0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
      + '</svg>';

    var trigStyle = [
      'width:100%', 'box-sizing:border-box', 'padding:2px 22px 2px 7px',
      'font-size:11px', 'border:1px solid var(--border-md)', 'border-radius:6px',
      'background-color:var(--surface)',
      'color:var(--text)', 'outline:none', 'font-family:inherit',
      'transition:border-color .12s,box-shadow .12s',
      'height:26px', 'display:flex', 'align-items:center',
      'cursor:pointer', 'position:relative'
    ].join(';');

    return '<div style="position:relative" id="' + esc(id) + '-wrap">'
      + '<button type="button" id="' + esc(id) + '-btn" '
      + 'onclick="UI._cosToggle(\'' + esc(id) + '\')" '
      + 'style="' + trigStyle + '">'
      + '<span id="' + esc(id) + '-lbl" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left">' + selHtml + '</span>'
      + chevron
      + '</button>'
      + '<input type="hidden" id="' + esc(id) + '" value="' + esc(String(selectedVal || '')) + '">'
      + '<div id="' + esc(panelId) + '" class="tb-admin-dd" '
      + 'style="top:calc(100% + 2px);right:0;left:0;min-width:150px;padding:4px;max-height:200px;overflow-y:auto">'
      + items
      + '</div>'
      + '</div>';
  }

  function _cosClose(panel, btn) {
    panel.classList.remove('open');
    if (panel._cosOrigParent) {
      try { panel._cosOrigParent.appendChild(panel); } catch(e) {}
      panel._cosOrigParent = null;
    }
    if (btn) { btn.style.borderColor = 'var(--border-md)'; btn.style.boxShadow = 'none'; }
  }

  function _cosToggle(id) {
    var panel = document.getElementById(id + '-panel');
    var btn   = document.getElementById(id + '-btn');
    if (!panel) return;
    var opening = !panel.classList.contains('open');
    if (opening && btn) {
      // Move to body to escape overflow:hidden and stacking contexts
      if (!panel._cosOrigParent) {
        panel._cosOrigParent = panel.parentNode;
        document.body.appendChild(panel);
      }
      var rect = btn.getBoundingClientRect();
      panel.style.position = 'fixed';
      panel.style.top      = (rect.bottom + 2) + 'px';
      panel.style.left     = rect.left + 'px';
      panel.style.right    = 'auto';
      panel.style.width    = Math.max(rect.width, 150) + 'px';
      panel.style.zIndex   = '9999';
    }
    panel.classList.toggle('open', opening);
    if (btn) {
      if (opening) {
        btn.style.borderColor = 'var(--accent)';
        btn.style.boxShadow   = '0 0 0 3px rgba(237,0,94,.08)';
      } else {
        _cosClose(panel, btn);
      }
    }
    if (opening) {
      setTimeout(function() {
        document.addEventListener('click', function _close(e) {
          var wrap = document.getElementById(id + '-wrap');
          if (wrap && wrap.contains(e.target)) return;
          if (panel.contains(e.target)) return;
          _cosClose(panel, btn);
          document.removeEventListener('click', _close);
        });
      }, 0);
    }
  }

  function _cosPick(id, val, label, onChangeFn) {
    var input = document.getElementById(id);
    var lblEl = document.getElementById(id + '-lbl');
    var panel = document.getElementById(id + '-panel');
    var btn   = document.getElementById(id + '-btn');
    if (input) input.value = val;
    if (panel) {
      var rows = panel.querySelectorAll('[data-val]');
      for (var i = 0; i < rows.length; i++) {
        var isSel = rows[i].getAttribute('data-val') === val;
        rows[i].setAttribute('data-cos-sel', isSel ? '1' : '');
        rows[i].style.background = isSel ? 'var(--subtle)' : '';
        if (isSel && lblEl) lblEl.innerHTML = rows[i].innerHTML;
      }
      _cosClose(panel, btn);
    }
    if (onChangeFn) {
      if (typeof window[onChangeFn] === 'function') { window[onChangeFn](val); }
      else { try { (0, eval)(onChangeFn); } catch(e) {} }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Progress Bars
  //   progressBarStatus(pct)          — colour driven by delivery %
  //   progressBarFlat(pct, color)     — flat single colour, caller picks
  //   progressBarCapacity(pct)        — green / yellow / red by load %
  // All accept 0-100 (capacity can exceed 100; bar is capped visually).
  // ─────────────────────────────────────────────────────────────────────────

  // Inject progress-bar keyframe once (CSS-driven animation, no JS timing needed)
  (function() {
    if (typeof document !== 'undefined' && !document.getElementById('ui-pb-kf')) {
      var s = document.createElement('style');
      s.id = 'ui-pb-kf';
      s.textContent = '@keyframes pb-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}';
      (document.head || document.documentElement).appendChild(s);
    }
  })();

  function _progressBar(pct, color, displayPct, label) {
    var p    = Math.max(0, Math.min(100, pct || 0));
    var show = displayPct !== undefined ? displayPct : pct || 0;
    // Width set directly; CSS @keyframes pb-grow handles the fill-in animation.
    var row = '<div style="display:flex;align-items:center;gap:8px">'
      + '<div style="flex:1;height:6px;background:var(--border);border-radius:999px;overflow:hidden">'
      +   '<div style="height:100%;width:' + p + '%;background:' + color + ';border-radius:999px;transform-origin:left center;animation:pb-grow .55s ease both"></div>'
      + '</div>'
      + '<span style="font-size:11px;color:var(--muted);min-width:30px;text-align:right;flex-shrink:0">' + Math.round(show) + '%</span>'
      + '</div>';
    if (!label) return row;
    return '<div style="display:flex;flex-direction:column;gap:3px">'
      + row
      + '<span style="font-size:10px;color:var(--faint)">' + esc(label) + '</span>'
      + '</div>';
  }

  /**
   * No-op kept for API compatibility — animation is now CSS-driven.
   * @param {Element} [scope]
   */
  function progressBarAnimate(scope) { /* no-op: CSS @keyframes pb-grow handles animation */ }

  /**
   * Status Progress Bar — colour changes by delivery percentage.
   *   0%        → Not Started  (#8E8E93 gray)
   *   1%–30%    → At Risk      (#E5A100 yellow)
   *   31%–90%   → In Progress  (#0284C7 blue)
   *   91%–100%  → Delivered    (#2EAD4B green)
   */
  function progressBarStatus(pct, label) {
    var p = Math.max(0, Math.min(100, pct || 0));
    var color = p === 0   ? '#8E8E93'
              : p <= 30   ? '#E5A100'
              : p <= 90   ? '#0284C7'
              :              '#2EAD4B';
    return _progressBar(p, color, undefined, label);
  }

  /**
   * Flat Progress Bar — same colour from 0% to 100%.
   * @param {number} pct    0–100
   * @param {string} color  any CSS colour value
   */
  function progressBarFlat(pct, color, label) {
    return _progressBar(Math.max(0, Math.min(100, pct || 0)), color || 'var(--accent)', undefined, label);
  }

  /**
   * Capacity Progress Bar — colour by load level.
   *   0%–75%   → green  (#2EAD4B)
   *   76%–100% → yellow (#E5A100)
   *   >100%    → red    (#E5243B) — bar fills to 100%, label shows real value
   */
  function progressBarCapacity(pct, label) {
    var raw  = pct || 0;
    var fill = Math.min(100, raw);
    var color = raw <= 75  ? '#2EAD4B'
              : raw <= 100 ? '#E5A100'
              :               '#E5243B';
    return _progressBar(fill, color, raw, label);
  }

  /**
   * ROI cell — two states:
   *   empty  (value null/undefined/'') → dashed "Calculate est. ROI" button
   *   filled (value string/number)     → coloured value + recalculate icon
   *
   * @param {string|number|null} value  e.g. '+45%' / '-12%' / null
   * @param {string} [onCalcFn]         onclick handler string
   */
  function cellRoi(value, onCalcFn) {
    var CALC = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" style="display:block">'
      + '<rect x="2.5" y="1.5" width="11" height="13" rx="1.5" stroke="currentColor" stroke-width="1.3"/>'
      + '<rect x="4.5" y="3.5" width="7" height="2.5" rx=".5" stroke="currentColor" stroke-width="1.1"/>'
      + '<circle cx="5.5" cy="9"  r=".85" fill="currentColor"/>'
      + '<circle cx="8"   cy="9"  r=".85" fill="currentColor"/>'
      + '<circle cx="10.5" cy="9" r=".85" fill="currentColor"/>'
      + '<circle cx="5.5" cy="12" r=".85" fill="currentColor"/>'
      + '<circle cx="8"   cy="12" r=".85" fill="currentColor"/>'
      + '<circle cx="10.5" cy="12" r=".85" fill="currentColor"/>'
      + '</svg>';
    var click = onCalcFn ? 'onclick="' + esc(onCalcFn) + '"' : '';
    if (value === null || value === undefined || value === '') {
      return '<button type="button" ' + click + ' '
        + 'style="padding:3px 10px;font-size:11px;font-weight:500;color:var(--accent);'
        + 'border:1px dashed var(--accent);border-radius:6px;background:transparent;'
        + 'cursor:pointer;font-family:inherit;white-space:nowrap;transition:background .12s" '
        + 'onmouseenter="this.style.background=\'rgba(237,0,94,.06)\'" '
        + 'onmouseleave="this.style.background=\'transparent\'">Calculate est. ROI</button>';
    }
    var val   = String(value);
    var color = parseFloat(val) < 0 ? '#E5243B' : '#2EAD4B';
    return '<div style="display:inline-flex;align-items:center;gap:4px">'
      + '<span style="font-size:12px;font-weight:600;color:' + color + '">' + esc(val) + '</span>'
      + '<button type="button" ' + click + ' title="Recalculate ROI" '
      + 'style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;'
      + 'border:none;background:transparent;cursor:pointer;color:var(--faint);border-radius:4px;'
      + 'flex-shrink:0;transition:color .12s,background .12s" '
      + 'onmouseenter="this.style.color=\'var(--text)\';this.style.background=\'var(--subtle)\'" '
      + 'onmouseleave="this.style.color=\'var(--faint)\';this.style.background=\'transparent\'">'
      + CALC + '</button>'
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Avatar  (standalone + table-cell variants)
  // ─────────────────────────────────────────────────────────────────────────

  var _AV_COLORS = ['#6366F1','#0EA5E9','#2EAD4B','#E5A100','#C2410C','#8B5CF6','#EC4899','#14B8A6'];

  function _avatarColor(name) {
    var hash = 0;
    for (var i = 0; i < (name || '').length; i++) {
      hash = ((hash << 5) - hash) + (name || '').charCodeAt(i);
      hash |= 0;
    }
    return _AV_COLORS[Math.abs(hash) % _AV_COLORS.length];
  }

  /**
   * Standalone avatar — circle (initials or photo) + name + optional subtitle.
   * Designed for cards, drawers, profile rows — anywhere outside a table cell.
   *
   * @param {string} name
   * @param {string} [subtitle]       e.g. "Engineering Lead"
   * @param {object} [opts]
   * @param {number} [opts.size=36]   circle diameter in px
   * @param {string} [opts.imgSrc]    photo URL — renders <img> instead of initials
   * @param {number} [opts.gap=10]    gap between circle and text block in px
   */
  function avatar(name, subtitle, opts) {
    opts = opts || {};
    var sz  = opts.size || 34;
    var gap = opts.gap  || 10;
    var n   = (name || '?').trim();
    var ini = n.split(/\s+/).map(function(w) { return w[0] || ''; }).join('').toUpperCase().slice(0, 2);
    var bg  = _avatarColor(n);
    var fs  = Math.max(10, Math.round(sz * 0.36));

    var circle = opts.imgSrc
      ? '<div style="width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;flex-shrink:0;'
        + 'overflow:hidden;background:var(--border)">'
        + '<img src="' + esc(opts.imgSrc) + '" style="width:100%;height:100%;object-fit:cover" alt="' + esc(n) + '">'
        + '</div>'
      : '<div style="width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;background:' + bg
        + ';flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;'
        + 'font-size:' + fs + 'px;font-weight:600;color:#fff;letter-spacing:.3px">' + esc(ini) + '</div>';

    var nameSize = sz >= 32 ? '14px' : '13px';
    var subSize  = sz >= 32 ? '12px' : '11px';

    return '<div style="display:inline-flex;align-items:center;gap:' + gap + 'px">'
      + circle
      + '<div>'
      + '<div style="font-size:' + nameSize + ';font-weight:500;color:var(--text);line-height:1.3">' + esc(n) + '</div>'
      + (subtitle ? '<div style="font-size:' + subSize + ';color:var(--muted);line-height:1.3">' + esc(subtitle) + '</div>' : '')
      + '</div>'
      + '</div>';
  }

  /**
   * Returns the inner HTML for an Avatar + Name (+ optional subtitle) cell.
   * Used inside UI.tr() cells.
   *
   * @param {string} name
   * @param {string} [subtitle]  e.g. role or department
   */
  function avatarCell(name, subtitle) {
    var n = (name || '?').trim();
    var ini = n.split(/\s+/).map(function (w) { return w[0] || ''; }).join('').toUpperCase().slice(0, 2);
    var bg = _avatarColor(n);
    return '<div style="display:flex;align-items:center;gap:9px">'
      + '<div style="width:26px;height:26px;border-radius:50%;background:' + bg + ';flex-shrink:0;'
      + 'display:inline-flex;align-items:center;justify-content:center;'
      + 'font-size:10px;font-weight:600;color:#fff;letter-spacing:.3px">' + esc(ini) + '</div>'
      + '<div>'
      + '<div style="font-size:13px;font-weight:500;color:var(--text);line-height:1.3">' + esc(n) + '</div>'
      + (subtitle ? '<div style="font-size:11px;color:var(--muted);line-height:1.3">' + esc(subtitle) + '</div>' : '')
      + '</div></div>';
  }

  /**
   * User Tile — bordered card: circular avatar + bold name + department chip + subtitle.
   * @param {string} name
   * @param {string} [dept]       department label — coloured via deptChip()
   * @param {string} [subtitle]   role / title shown below the name row
   * @param {object} [opts]
   *   opts.size    {number}  avatar diameter in px (default 26)
   *   opts.imgSrc  {string}  photo URL — falls back to initials if absent
   */
  /**
   * Avatar + inline chip + optional subtitle.
   * Like avatar() but places a chip HTML element inline with the name on the same line.
   * @param {string} name
   * @param {string} [chipHtml]   pre-rendered chip HTML (e.g. deptChip('Product'))
   * @param {string} [subtitle]
   * @param {object} [opts]       same as avatar() — size, imgSrc, gap
   */
  function avatarChip(name, chipHtml, subtitle, opts) {
    opts = opts || {};
    var sz  = opts.size || 26;
    var gap = opts.gap  || 10;
    var n   = (name || '?').trim();
    var ini = n.split(/\s+/).map(function(w) { return w[0] || ''; }).join('').toUpperCase().slice(0, 2);
    var bg  = _avatarColor(n);
    var fs  = Math.max(10, Math.round(sz * 0.36));
    var nameSize = sz >= 32 ? '14px' : '13px';
    var subSize  = sz >= 32 ? '12px' : '11px';

    var circle = opts.imgSrc
      ? '<div style="width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;flex-shrink:0;overflow:hidden;background:var(--border)">'
        + '<img src="' + esc(opts.imgSrc) + '" style="width:100%;height:100%;object-fit:cover" alt="' + esc(n) + '">'
        + '</div>'
      : '<div style="width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;background:' + bg
        + ';flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;'
        + 'font-size:' + fs + 'px;font-weight:600;color:#fff;letter-spacing:.3px">' + esc(ini) + '</div>';

    return '<div style="display:inline-flex;align-items:center;gap:' + gap + 'px">'
      + circle
      + '<div>'
      + '<div style="display:flex;align-items:center;gap:6px' + (subtitle ? ';margin-bottom:2px' : '') + '">'
      + '<span style="font-size:' + nameSize + ';font-weight:500;color:var(--text);line-height:1.2">' + esc(n) + '</span>'
      + (chipHtml || '')
      + '</div>'
      + (subtitle ? '<div style="font-size:' + subSize + ';color:var(--muted);line-height:1.3">' + esc(subtitle) + '</div>' : '')
      + '</div>'
      + '</div>';
  }

  /**
   * User Tile — bordered card wrapping avatarChip().
   * @param {string} name
   * @param {string} [dept]      department label — rendered as deptChip inline with name
   * @param {string} [subtitle]
   * @param {object} [opts]      size, imgSrc
   */
  function userTile(name, dept, subtitle, opts) {
    opts = opts || {};
    var avOpts = { size: opts.size || 26 };
    if (opts.imgSrc) avOpts.imgSrc = opts.imgSrc;
    return '<div style="display:inline-flex;align-items:center;padding:10px 14px;'
      + 'background:var(--surface);border:1px solid var(--border);border-radius:10px">'
      + avatarChip(name, dept ? deptChipSm(dept) : '', subtitle, avOpts)
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Table
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * @param {Array<{label:string, width?:string, align?:string}>} cols
   * @param {string} rowsHtml  <tr>…</tr> HTML
   * @param {string} [tbodyId]
   */
  function table(cols, rowsHtml, tbodyId) {
    var thead = '<thead><tr style="border-bottom:1px solid var(--border);background:var(--bg)">'
      + cols.map(function (c) {
          return '<th style="padding:10px 16px;text-align:' + (c.align || 'left') + ';'
            + 'font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;'
            + 'color:var(--faint)' + (c.width ? ';width:' + c.width : '') + '">'
            + esc(c.label) + '</th>';
        }).join('')
      + '</tr></thead>';
    var tbodyAttr = tbodyId ? ' id="' + esc(tbodyId) + '"' : '';
    return '<div style="overflow-x:auto;border-radius:10px;border:1px solid var(--border);background:var(--surface)">'
      + '<table style="width:100%;border-collapse:collapse">'
      + thead
      + '<tbody' + tbodyAttr + '>' + (rowsHtml || '') + '</tbody>'
      + '</table></div>';
  }

  /** Standard table row — cells: array of HTML strings */
  function tr(cells, opts) {
    opts = opts || {};
    var rowStyle = 'border-bottom:1px solid var(--border)' + (opts.style ? ';' + opts.style : '');
    var evts = opts.onclick
      ? ' onclick="' + opts.onclick + '" style="' + rowStyle + ';cursor:pointer;transition:background .1s"'
        + ' onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'\'"'
      : ' style="' + rowStyle + '"';
    return '<tr' + evts + '>'
      + cells.map(function (c) { return '<td style="padding:10px 16px">' + c + '</td>'; }).join('')
      + '</tr>';
  }

  /**
   * Read-only table row — pixel-identical to tr() / Table View Generic.
   * Pair with cellReadOnly() for static cells. No edit affordances.
   * Hover + cursor pointer only when opts.onclick is provided.
   */
  function trReadOnly(cells, opts) {
    opts = opts || {};
    var rowStyle = 'border-bottom:1px solid var(--border)' + (opts.style ? ';' + opts.style : '');
    var evts = opts.onclick
      ? ' onclick="' + opts.onclick + '" style="' + rowStyle + ';cursor:pointer;transition:background .1s"'
        + ' onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'\'"'
      : ' style="' + rowStyle + '"';
    return '<tr' + evts + '>'
      + cells.map(function(c) { return '<td style="padding:8px 16px;font-size:11px;color:var(--text)">' + c + '</td>'; }).join('')
      + '</tr>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Table: scrollable variant  (horizontal scroll + frozen columns)
  // ─────────────────────────────────────────────────────────────────────────

  var _tblScrollCount = 0;

  function _injectStyle(id, css) {
    if (document.getElementById(id)) return;
    var el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    (document.head || document.documentElement).appendChild(el);
  }

  /** Called via onscroll — adds/removes shadow class on frozen column */
  function _tblScroll(el) {
    el.classList.toggle('tbl-scrolled', el.scrollLeft > 4);
  }

  /**
   * Horizontally scrollable table with optional frozen (sticky) left columns.
   * Identical thead style to UI.table(); adds overflow-x:auto wrapper.
   *
   * @param {Array<{label:string, width?:string, align?:string}>} cols
   *        For frozen cols, width MUST be specified (e.g. '180px') so offsets are correct.
   * @param {string} rowsHtml
   * @param {string} [tbodyId]
   * @param {number} [frozenCols=0]  how many left columns to keep sticky
   */
  function tableScroll(cols, rowsHtml, tbodyId, frozenCols, footHtml, opts) {
    opts = opts || {};
    var fc  = frozenCols || 0;
    var wid = tbodyId ? (tbodyId + '-wrap') : ('tw-' + (++_tblScrollCount));

    if (fc > 0) {
      var css  = '';
      var left = 0;
      for (var i = 0; i < fc; i++) {
        var w = parseInt(String(cols[i].width || '160').replace(/[^0-9]/g, '')) || 160;
        css += '#' + wid + ' table th:nth-child(' + (i + 1) + '),'
             + '#' + wid + ' table td:nth-child(' + (i + 1) + ')'
             + '{position:sticky;left:' + left + 'px;z-index:2;background:var(--surface)}';
        css += '#' + wid + ' table thead th:nth-child(' + (i + 1) + ')'
             + '{background:var(--bg);z-index:4}';
        left += w;
      }
      // Drop-shadow on the rightmost frozen column when table is scrolled
      css += '#' + wid + '.tbl-scrolled table th:nth-child(' + fc + '),'
           + '#' + wid + '.tbl-scrolled table td:nth-child(' + fc + ')'
           + '{box-shadow:3px 0 8px rgba(0,0,0,.08);border-right:1px solid rgba(0,0,0,.15)}';
      _injectStyle(wid + '-css', css);
    }

    var thead = '<thead><tr style="border-bottom:1px solid var(--border);background:var(--bg)">'
      + cols.map(function (c) {
          return '<th style="padding:8px 16px;text-align:' + (c.align || 'left') + ';'
            + 'font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;'
            + 'color:var(--faint)' + (c.width ? ';width:' + c.width + ';min-width:' + c.width : '') + '">'
            + (c.html !== undefined ? c.html : esc(c.label)) + '</th>';
        }).join('')
      + '</tr></thead>';

    var tbodyAttr = tbodyId ? ' id="' + esc(tbodyId) + '"' : '';

    var wrapStyle = opts.inCard
      ? 'overflow-x:auto;overflow-y:hidden;background:var(--surface)'
      : 'overflow-x:auto;overflow-y:hidden;border-radius:10px;border:1px solid var(--border);background:var(--surface)';

    return '<div id="' + esc(wid) + '"'
      + (fc > 0 ? ' onscroll="UI._tblScroll(this)"' : '')
      + ' style="' + wrapStyle + '">'
      + '<table style="width:100%;border-collapse:collapse;font-size:11px' + (opts.tableLayout ? ';table-layout:' + opts.tableLayout : '') + '">'
      + thead
      + '<tbody' + tbodyAttr + '>' + (rowsHtml || '') + '</tbody>'
      + (footHtml ? '<tfoot style="position:sticky;bottom:0;z-index:2;box-shadow:0 -1px 0 var(--border)">' + footHtml + '</tfoot>' : '')
      + '</table></div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Accordion
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Renders a stacked accordion list inside a bordered card.
   *
   * @param {Array<{
   *   id:       string|number,   // unique item id
   *   title:    string,          // bold row title
   *   meta?:    string,          // muted text shown right of title (author · date · tags)
   *   right?:   string,          // arbitrary HTML on the far right (priority, badge, etc.)
   *   body?:    string,          // HTML injected in the expanded panel
   *   open?:    boolean          // whether this item is currently expanded
   * }>} items
   * @param {object} [opts]
   *   opts.toggleFn  {string}  JS function name called with (id) on header click
   */
  function accordion(items, opts) {
    opts = opts || {};
    var toggleFn = opts.toggleFn || '';

    var rows = (items || []).map(function(item, idx) {
      var isOpen  = !!item.open;
      var isFirst = idx === 0;

      // Chevron — right-pointing, rotates down when open
      var chevron = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"'
        + ' style="flex-shrink:0;transition:transform .15s;transform:' + (isOpen ? 'rotate(90deg)' : 'rotate(0deg)') + '">'
        + '<path d="M3 2l4 3-4 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
        + '</svg>';

      var clickAttr = toggleFn ? ' onclick="' + esc(toggleFn) + '(' + esc(String(item.id)) + ')"' : '';

      var header = '<div' + clickAttr
        + ' style="display:flex;align-items:center;gap:12px;padding:11px 16px;'
        + (toggleFn ? 'cursor:pointer;' : '')
        + (isFirst ? '' : 'border-top:1px solid var(--border);')
        + 'transition:background .1s"'
        + (toggleFn ? ' onmouseenter="this.style.background=\'var(--bg)\'" onmouseleave="this.style.background=\'\'"' : '')
        + '>'
        + chevron
        + '<span style="font-size:13px;font-weight:600;color:var(--text);flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">'
        + esc(item.title || '') + '</span>'
        + (item.meta
            ? '<span style="font-size:11px;color:var(--muted);white-space:nowrap;flex-shrink:0">' + item.meta + '</span>'
            : '')
        + (item.right
            ? '<span style="flex-shrink:0;display:inline-flex;align-items:center;gap:6px">' + item.right + '</span>'
            : '')
        + '</div>';

      var body = isOpen && item.body
        ? '<div style="padding:16px 16px 16px 38px;border-top:1px solid var(--border)">' + item.body + '</div>'
        : '';

      return '<div>' + header + body + '</div>';
    }).join('');

    return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">'
      + rows
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Stepper — horizontal
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * @param {Array<{label:string, sublabel?:string, status:'done'|'active'|'pending'}>} steps
   */
  function stepperH(steps) {
    return '<div style="display:flex;align-items:flex-start">'
      + steps.map(function (s, i) {
          var done   = s.status === 'done';
          var active = s.status === 'active';
          var dotC   = (done || active) ? 'var(--accent)' : 'var(--border-md)';
          var lblC   = active ? 'var(--text)' : done ? 'var(--muted)' : 'var(--faint)';
          var lineL  = done ? 'var(--accent)' : 'var(--border)';
          var isLast = i === steps.length - 1;

          return '<div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:0">'
            + '<div style="display:flex;align-items:center;width:100%">'
            +   (i > 0
                  ? '<div style="flex:1;height:1px;background:' + lineL + '"></div>'
                  : '<div style="flex:1"></div>')
            +   '<div style="width:24px;height:24px;border-radius:50%;background:' + dotC + ';'
            +       'display:flex;align-items:center;justify-content:center;flex-shrink:0">'
            +     (done
                    ? '<svg width="10" height="10" viewBox="0 0 12 12" fill="none">'
                      + '<path d="M2 6l3 3 5-5" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
                      + '</svg>'
                    : '<div style="width:8px;height:8px;border-radius:50%;background:'
                      + (active ? '#fff' : 'var(--border)') + '"></div>')
            +   '</div>'
            +   (!isLast ? '<div style="flex:1;height:1px;background:var(--border)"></div>' : '<div style="flex:1"></div>')
            + '</div>'
            + '<div style="margin-top:7px;text-align:center;padding:0 4px">'
            +   '<div style="font-size:11px;font-weight:' + (active ? '600' : '400') + ';color:' + lblC + ';'
            +       'white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(s.label) + '</div>'
            +   (s.sublabel
                  ? '<div style="font-size:9px;color:var(--faint);margin-top:1px">' + esc(s.sublabel) + '</div>'
                  : '')
            + '</div>'
            + '</div>';
        }).join('')
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Stepper — vertical
  // ─────────────────────────────────────────────────────────────────────────

  function stepperV(steps) {
    return '<div style="display:flex;flex-direction:column;gap:0">'
      + steps.map(function (s, i) {
          var done   = s.status === 'done';
          var active = s.status === 'active';
          var dotC   = (done || active) ? 'var(--accent)' : 'var(--border-md)';
          var lblC   = active ? 'var(--text)' : done ? 'var(--muted)' : 'var(--faint)';
          var isLast = i === steps.length - 1;

          return '<div style="display:flex;gap:12px">'
            + '<div style="display:flex;flex-direction:column;align-items:center">'
            +   '<div style="width:20px;height:20px;border-radius:50%;background:' + dotC + ';'
            +       'display:flex;align-items:center;justify-content:center;flex-shrink:0">'
            +     (done
                    ? '<svg width="9" height="9" viewBox="0 0 12 12" fill="none">'
                      + '<path d="M2 6l3 3 5-5" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
                      + '</svg>'
                    : '<div style="width:7px;height:7px;border-radius:50%;background:'
                      + (active ? '#fff' : 'var(--border)') + '"></div>')
            +   '</div>'
            +   (!isLast ? '<div style="flex:1;width:1px;background:var(--border);margin:3px 0"></div>' : '')
            + '</div>'
            + '<div style="padding-bottom:' + (isLast ? '0' : '18px') + ';padding-top:1px">'
            +   '<div style="font-size:12px;font-weight:' + (active ? '600' : '400') + ';color:' + lblC + '">'
            +     esc(s.label) + '</div>'
            +   (s.sublabel
                  ? '<div style="font-size:11px;color:var(--faint);margin-top:2px">' + esc(s.sublabel) + '</div>'
                  : '')
            + '</div>'
            + '</div>';
        }).join('')
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Dropdown trigger + panel  (tb-admin-dd style — opacity/transform)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Renders the dropdown panel (hidden by default — add class "open" to show).
   * @param {string} ddId
   * @param {Array<{label:string, svgHtml?:string, onclick:string}|'divider'>} items
   */
  function ddPanel(ddId, items) {
    var inner = items.map(function (it) {
      if (it === 'divider') return '<div style="height:1px;background:var(--border);margin:4px 0"></div>';
      return '<div class="tb-admin-dd-item" onclick="' + it.onclick + '">'
        + (it.svgHtml || '') + esc(it.label) + '</div>';
    }).join('');
    return '<div class="tb-admin-dd" id="' + esc(ddId) + '">' + inner + '</div>';
  }

  /**
   * Generic toggle helper — call from onclick of the trigger button.
   * @param {string} ddId
   * @param {string} [btnId]  if provided, click-outside skips this element
   */
  function ddToggle(ddId, btnId) {
    var dd = document.getElementById(ddId);
    if (!dd) return;
    var opening = !dd.classList.contains('open');
    dd.classList.toggle('open', opening);
    if (opening) {
      setTimeout(function () {
        document.addEventListener('click', function _close(e) {
          var btn = btnId ? document.getElementById(btnId) : null;
          if ((btn && btn.contains(e.target)) || dd.contains(e.target)) return;
          dd.classList.remove('open');
          document.removeEventListener('click', _close);
        });
      }, 0);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Search + checkbox dropdown  (used in Initiatives panel & Jira modal)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Renders a searchable multi-select dropdown panel (hidden by default).
   *
   * opts: {
   *   id          : string   element id for the panel
   *   placeholder : string   search placeholder
   *   items       : [{val:string, label:string, checked:boolean}]
   *   onChangeFn  : string   called as onChangeFn(val, checked) on each toggle
   * }
   */
  function searchCheckboxPanel(opts) {
    var rows = (opts.items || []).map(function (it) {
      return '<label class="ui-sc-row" data-val="' + esc(String(it.val)) + '" '
        + 'data-lbl="' + esc(it.label.toLowerCase()) + '" '
        + 'style="display:flex;align-items:center;gap:8px;padding:7px 12px;cursor:pointer;'
        + 'border-radius:6px;transition:background .1s;font-size:12px;color:var(--text)" '
        + 'onmouseenter="this.style.background=\'var(--subtle)\'" onmouseleave="this.style.background=\'none\'">'
        + '<input type="checkbox" value="' + esc(String(it.val)) + '" '
        + (it.checked ? 'checked' : '')
        + ' onchange="' + opts.onChangeFn + '(this.value,this.checked)" '
        + 'style="width:13px;height:13px;accent-color:var(--accent);cursor:pointer;flex-shrink:0">'
        + esc(it.label)
        + '</label>';
    }).join('');

    return '<div id="' + esc(opts.id) + '" class="tb-admin-dd" '
      + 'style="left:0;right:0;max-height:280px;display:flex;flex-direction:column;padding:0">'
      + '<div style="padding:8px 8px 4px">'
      +   '<input type="text" placeholder="' + esc(opts.placeholder || 'Search…') + '" '
      +   'oninput="UI._scFilter(\'' + esc(opts.id) + '\',this.value)" '
      +   'style="width:100%;box-sizing:border-box;height:30px;padding:0 9px;border:1px solid var(--border-md);'
      +   'border-radius:6px;font-size:12px;font-family:inherit;color:var(--text);'
      +   'background:var(--bg);outline:none" '
      +   'onfocus="this.style.borderColor=\'var(--accent)\'" onblur="this.style.borderColor=\'var(--border-md)\'">'
      + '</div>'
      + '<div style="overflow-y:auto;padding:4px 4px 6px">' + rows + '</div>'
      + '</div>';
  }

  // Internal: filter rows by search query
  function _scFilter(panelId, query) {
    var panel = document.getElementById(panelId);
    if (!panel) return;
    var q = query.toLowerCase().trim();
    panel.querySelectorAll('.ui-sc-row').forEach(function (row) {
      var lbl = row.getAttribute('data-lbl') || '';
      row.style.display = (!q || lbl.indexOf(q) !== -1) ? '' : 'none';
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Jira epic select panel  (search + checkbox, pre-styled for Jira epics)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Searchable multi-select panel pre-styled for Jira epics.
   * Each row shows: checkbox · accent key · title · right-aligned status.
   *
   * opts: {
   *   id          : string
   *   placeholder : string   default 'Filter epics…'
   *   items       : [{
   *                   val         : string   (e.g. epic id)
   *                   key         : string   (e.g. 'SDT-8')
   *                   title       : string   (e.g. 'Content Library')
   *                   status      : string   (e.g. 'In corso')
   *                   statusColor : string   CSS color, default var(--faint)
   *                   checked     : boolean
   *                 }]
   *   onChangeFn  : string   called as onChangeFn(val, checked)
   * }
   */
  function jiraSelectPanel(opts) {
    var rows = (opts.items || []).map(function (it) {
      var sc = it.statusColor || 'var(--faint)';
      return '<label class="ui-sc-row" data-val="' + esc(String(it.val)) + '" '
        + 'data-lbl="' + esc((it.key + ' ' + it.title).toLowerCase()) + '" '
        + 'style="display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;'
        + 'border-bottom:1px solid var(--border);transition:background .1s" '
        + 'onmouseenter="this.style.background=\'var(--bg)\'" onmouseleave="this.style.background=\'\'">'
        + '<input type="checkbox" value="' + esc(String(it.val)) + '" '
        + (it.checked ? 'checked' : '')
        + ' onchange="' + (opts.onChangeFn || '_kbNoop2') + '(this.value,this.checked)" '
        + 'style="width:14px;height:14px;accent-color:var(--accent);cursor:pointer;flex-shrink:0">'
        + '<span style="flex:1;min-width:0;display:flex;align-items:baseline;gap:7px;overflow:hidden">'
        +   '<span style="font-size:12px;font-weight:600;color:var(--accent);flex-shrink:0">' + esc(it.key) + '</span>'
        +   '<span style="font-size:12px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(it.title) + '</span>'
        + '</span>'
        + (it.status
            ? '<span style="font-size:12px;color:' + sc + ';white-space:nowrap;flex-shrink:0">' + esc(it.status) + '</span>'
            : '')
        + '</label>';
    }).join('');

    return '<div id="' + esc(opts.id) + '" class="tb-admin-dd" '
      + 'style="left:0;right:0;max-height:320px;display:flex;flex-direction:column;padding:0">'
      + '<div style="padding:8px 8px 6px;border-bottom:1px solid var(--border)">'
      +   '<input type="text" placeholder="' + esc(opts.placeholder || 'Filter epics…') + '" '
      +   'oninput="UI._scFilter(\'' + esc(opts.id) + '\',this.value)" '
      +   'style="width:100%;box-sizing:border-box;height:32px;padding:0 10px;border:1px solid var(--border-md);'
      +   'border-radius:7px;font-size:12px;font-family:inherit;color:var(--text);'
      +   'background:var(--bg);outline:none" '
      +   'onfocus="this.style.borderColor=\'var(--accent)\'" onblur="this.style.borderColor=\'var(--border-md)\'">'
      + '</div>'
      + '<div style="overflow-y:auto">' + rows + '</div>'
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Chips Nav — Large  (Settings "Teams & Capacity" style)
  // Tall pill buttons (~36px), accent-filled active, border inactive
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Large pill navigation (Settings team-tabs style).
   * Active chip is accent-filled; inactive chips have a border and muted text.
   * An optional dashed "+ Add" button can appear at the end.
   *
   * @param {Array<{id:string, label:string}>} chips
   * @param {string}  activeId
   * @param {string}  onClickFn   name of global fn called with (chipId)
   * @param {string}  [onAddFn]   name of global fn for "+ Add" button; omit to hide
   * @param {string}  [addLabel]  default '+ Add'
   */
  function chipsNavLg(chips, activeId, onClickFn, onAddFn, addLabel) {
    var items = chips.map(function (c) {
      var act = c.id === activeId;
      return '<button onclick="' + onClickFn + '(\'' + esc(c.id) + '\')" '
        + 'style="display:inline-flex;align-items:center;height:28px;padding:0 14px;'
        + 'border-radius:14px;font-size:12px;font-weight:' + (act ? '500' : '400') + ';'
        + 'font-family:inherit;cursor:pointer;white-space:nowrap;transition:all .15s;'
        + 'background:' + (act ? 'var(--accent)' : 'transparent') + ';'
        + 'color:' + (act ? '#fff' : 'var(--muted)') + ';'
        + 'border:1px solid ' + (act ? 'var(--accent)' : 'var(--border-md)') + '" '
        + (act ? '' :
            'onmouseenter="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" '
          + 'onmouseleave="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'"')
        + '>' + esc(c.label) + '</button>';
    }).join('');

    var addBtn = onAddFn
      ? '<button onclick="' + onAddFn + '()" '
        + 'style="display:inline-flex;align-items:center;height:28px;padding:0 14px;'
        + 'border-radius:14px;font-size:12px;font-family:inherit;cursor:pointer;white-space:nowrap;'
        + 'background:transparent;color:var(--faint);'
        + 'border:1.5px dashed var(--border-md);transition:all .15s" '
        + 'onmouseenter="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" '
        + 'onmouseleave="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--faint)\'">'
        + esc(addLabel || '+ Add') + '</button>'
      : '';

    return '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">'
      + items + addBtn + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Chips Nav — Small  (Product Roadmap "Group by" style)
  // Compact pills (~28px), same accent/border pattern at smaller scale
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Small pill navigation (Product Roadmap "Group by" style).
   * Same accent/border logic as chipsNavLg but 28px height, 12px font.
   *
   * @param {Array<{id:string, label:string}>} chips
   * @param {string} activeId
   * @param {string} onClickFn
   */
  function chipsNavSm(chips, activeId, onClickFn) {
    return '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">'
      + chips.map(function (c) {
          var act = c.id === activeId;
          return '<button onclick="' + onClickFn + '(\'' + esc(c.id) + '\')" '
            + 'style="display:inline-flex;align-items:center;height:24px;padding:0 10px;'
            + 'border-radius:12px;font-size:11px;font-weight:' + (act ? '500' : '400') + ';'
            + 'font-family:inherit;cursor:pointer;white-space:nowrap;transition:all .15s;'
            + 'background:' + (act ? 'var(--accent)' : 'transparent') + ';'
            + 'color:' + (act ? '#fff' : 'var(--muted)') + ';'
            + 'border:1px solid ' + (act ? 'var(--accent)' : 'var(--border-md)') + '" '
            + (act ? '' :
                'onmouseenter="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" '
              + 'onmouseleave="this.style.borderColor=\'var(--border-md)\';this.style.color=\'var(--muted)\'"')
            + '>' + esc(c.label) + '</button>';
        }).join('')
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Page nav bar  — pills + chips with centralised spacing
  //
  // Owns the vertical rhythm between header → pills → chips → content so
  // individual pages never hard-code margins for these transitions.
  //
  // Spacing contract (baked in, never delegated to the page):
  //   pageHeader  ──[mb:28px, owned by pageHeader]──
  //   pills       ──[12px if chips follow, 20px if last]──
  //   chips       ──[20px]──
  //   content
  //
  // opts: {
  //   tabs       : Array<{id, label}>   required
  //   activeTab  : string
  //   onTabFn    : string               global fn name called with (tabId)
  //   pillsId    : string               stable id for re-render (default 'page-nav-pills')
  //
  //   chips      : Array<{id, label}>   optional — omit if no secondary filter
  //   activeChip : string
  //   onChipFn   : string
  //   chipsId    : string               stable id for re-render (default 'page-nav-chips')
  // }
  // ─────────────────────────────────────────────────────────────────────────

  function pageNavBar(opts) {
    opts = opts || {};
    var hasChips = !!(opts.chips && opts.chips.length);
    // margin-top pulls back the default 28px header gap to a tighter 16px
    // so pages never need to override pageHeader mb just because nav follows it
    var out = '<div style="margin-top:-12px">';
    if (opts.tabs && opts.tabs.length) {
      var pillsMb = hasChips ? '12px' : '20px';
      out += '<div id="' + esc(opts.pillsId || 'page-nav-pills') + '" style="margin-bottom:' + pillsMb + '">'
        + pills(opts.tabs, opts.activeTab || '', opts.onTabFn || '')
        + '</div>';
    }
    if (hasChips) {
      out += '<div id="' + esc(opts.chipsId || 'page-nav-chips') + '" style="margin-bottom:20px">'
        + chipsNavSm(opts.chips, opts.activeChip || '', opts.onChipFn || '')
        + '</div>';
    }
    out += '</div>';
    return out;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Drawer / page-level tab nav  (.tabnav / .tabitem CSS classes)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Renders the pill-style tab bar used in drawer/page views (Settings, etc.).
   * Uses shared CSS classes: .tabnav + .tabitem + .act.
   *
   * @param {Array<{id:string, label:string}>} tabs
   * @param {string}  activeId    Currently selected tab id
   * @param {string}  onClickFn  Global fn name — called with the tab id on click
   */
  function drawerNav(tabs, activeId, onClickFn) {
    return '<div class="tabnav">'
      + tabs.map(function(t) {
          return '<button class="tabitem' + (t.id === activeId ? ' act' : '') + '"'
            + ' onclick="' + onClickFn + '(\'' + esc(t.id) + '\')">'
            + esc(t.label) + '</button>';
        }).join('')
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Tooltip  (hover popover wrapping any trigger element)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Wraps `triggerHtml` in a relative container and shows a dark tooltip on hover.
   *
   * @param {string} triggerHtml  The element that triggers the tooltip
   * @param {string} text         Tooltip label (plain text — auto-escaped)
   * @param {object} [opts]
   *   @param {string} [opts.pos='top']  'top' | 'bottom' | 'left' | 'right'
   *   @param {string} [opts.maxWidth]   e.g. '200px' for multi-word labels
   */
  function tooltip(triggerHtml, text, opts) {
    opts = opts || {};
    var pos = opts.pos || 'top';
    var mw  = opts.maxWidth ? 'max-width:' + opts.maxWidth + ';white-space:normal;text-align:center;' : 'white-space:nowrap;';
    var id  = 'tt-' + Math.random().toString(36).slice(2, 8);
    var base = 'position:absolute;z-index:9999;pointer-events:none;'
      + 'background:rgba(24,24,27,.92);color:#fff;font-size:11px;font-family:inherit;'
      + 'padding:5px 9px;border-radius:6px;line-height:1.4;'
      + 'opacity:0;transition:opacity .15s;' + mw;
    var posStyle = pos === 'bottom' ? 'top:calc(100% + 6px);left:50%;transform:translateX(-50%)'
                : pos === 'right'  ? 'left:calc(100% + 6px);top:50%;transform:translateY(-50%)'
                : pos === 'left'   ? 'right:calc(100% + 6px);top:50%;transform:translateY(-50%)'
                :                    'bottom:calc(100% + 6px);left:50%;transform:translateX(-50%)';
    return '<div style="position:relative;display:inline-flex;align-items:center"'
      + ' onmouseenter="var t=document.getElementById(\'' + id + '\');if(t)t.style.opacity=\'1\'"'
      + ' onmouseleave="var t=document.getElementById(\'' + id + '\');if(t)t.style.opacity=\'0\'">'
      + triggerHtml
      + '<div id="' + id + '" style="' + base + posStyle + '">' + esc(text) + '</div>'
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Breadcrumb
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Renders a breadcrumb trail.
   * @param {Array<{label:string, href?:string, onclick?:string}>} items
   *        Last item is the current page (no link, full text colour).
   */
  function breadcrumb(items) {
    return '<div style="display:flex;align-items:center;gap:4px">'
      + items.map(function (it, i) {
          var isLast = i === items.length - 1;
          var sep    = !isLast
            ? '<span style="color:var(--faint);font-size:11px;margin:0 2px">›</span>'
            : '';
          var lbl;
          if (isLast) {
            lbl = '<span style="font-size:11px;color:var(--muted);font-weight:500">' + esc(it.label) + '</span>';
          } else if (it.href) {
            lbl = '<a href="' + esc(it.href) + '" '
              + 'style="font-size:11px;color:var(--faint);text-decoration:none;transition:color .12s" '
              + 'onmouseenter="this.style.color=\'var(--accent)\'" onmouseleave="this.style.color=\'var(--faint)\'">'
              + esc(it.label) + '</a>';
          } else if (it.onclick) {
            lbl = '<button type="button" onclick="' + it.onclick + '" '
              + 'style="font-size:11px;color:var(--faint);background:none;border:none;cursor:pointer;'
              + 'font-family:inherit;padding:0;transition:color .12s" '
              + 'onmouseenter="this.style.color=\'var(--accent)\'" onmouseleave="this.style.color=\'var(--faint)\'">'
              + esc(it.label) + '</button>';
          } else {
            lbl = '<span style="font-size:11px;color:var(--faint)">' + esc(it.label) + '</span>';
          }
          return lbl + sep;
        }).join('')
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Page header  (Breadcrumb + Title + optional right slot + Subtitle)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Full page / section header block.
   *
   * opts: {
   *   breadcrumb  : Array<{label, href?, onclick?}>   optional breadcrumb items
   *   title       : string
   *   titleRight  : string   optional HTML in the right of the title row (e.g. yearNav)
   *   subtitle    : string   optional subtitle text
   *   mb          : string   margin-bottom (default '28px')
   * }
   */
  function pageHeader(opts) {
    opts = opts || {};
    var crumb = opts.breadcrumb && opts.breadcrumb.length
      ? '<div style="margin-bottom:6px">' + breadcrumb(opts.breadcrumb) + '</div>'
      : '';
    var titleRow = '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">'
      + '<h1 style="font-size:22px;font-weight:700;letter-spacing:-.5px;color:var(--text);line-height:1.2;margin:0">'
      + (opts.title || '') + '</h1>'
      + (opts.titleRight ? '<div style="flex-shrink:0">' + opts.titleRight + '</div>' : '')
      + '</div>';
    var sub = opts.subtitle
      ? '<div style="font-size:13px;color:var(--muted);margin-top:5px;line-height:1.4">' + esc(opts.subtitle) + '</div>'
      : '';
    return '<div style="margin-bottom:' + (opts.mb || '20px') + '">'
      + crumb + titleRow + sub + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Page Header — with inline year navigator
  // Like pageHeader but renders a UI.yearNav inline to the right of the h1.
  // opts: same as pageHeader plus:
  //   yearNavHtml : string  — pre-rendered yearNav HTML (already wraps a stable id div)
  // ─────────────────────────────────────────────────────────────────────────

  function pageHeaderWithYear(opts) {
    opts = opts || {};
    var crumb = opts.breadcrumb && opts.breadcrumb.length
      ? '<div style="margin-bottom:6px">' + breadcrumb(opts.breadcrumb) + '</div>'
      : '';
    var titleRow = '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">'
      + '<div style="display:flex;align-items:center;gap:12px;min-width:0">'
      + '<h1 style="font-size:22px;font-weight:700;letter-spacing:-.5px;color:var(--text);line-height:1.2;margin:0;white-space:nowrap">'
      + (opts.title || '') + '</h1>'
      + (opts.yearNavHtml ? '<div style="flex-shrink:0">' + opts.yearNavHtml + '</div>' : '')
      + '</div>'
      + (opts.titleRight ? '<div style="flex-shrink:0">' + opts.titleRight + '</div>' : '')
      + '</div>';
    var sub = opts.subtitle
      ? '<div style="font-size:13px;color:var(--muted);margin-top:5px;line-height:1.4">' + esc(opts.subtitle) + '</div>'
      : '';
    return '<div style="margin-bottom:' + (opts.mb || '20px') + '">'
      + crumb + titleRow + sub + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Card — base (plain white surface card)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Simple white surface card with border and rounded corners.
   *
   * opts: {
   *   bodyHtml  : string
   *   padding   : string   default '20px 24px'
   *   style     : string   extra CSS on the wrapper
   * }
   */
  function card(opts) {
    opts = opts || {};
    return '<div style="background:var(--surface);border:1px solid var(--border);'
      + 'border-radius:12px;overflow:hidden;padding:' + (opts.padding || '20px 24px') + ';'
      + (opts.style || '') + '">'
      + (opts.bodyHtml || '')
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Card — stat / KPI  (big number + badge + text + optional stacked bar)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Stat card for KPIs, quarter progress summaries, etc.
   *
   * opts: {
   *   value     : string|number   large bold figure (e.g. '35')
   *   label     : string          description below the figure
   *   badge     : string          optional badge HTML (e.g. UI.badge(…))
   *   bar       : [{color:string, pct:number, label:string}]   stacked bar segments
   *   stats     : [{color:string, label:string, value:string|number}]   dot list below bar
   *   padding   : string
   *   style     : string
   * }
   */
  function cardStat(opts) {
    opts = opts || {};

    var header = '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px">'
      + '<div>'
      + '<div style="font-size:36px;font-weight:700;letter-spacing:-1.5px;color:var(--text);line-height:1">'
      + esc(String(opts.value != null ? opts.value : '—')) + '</div>'
      + (opts.label ? '<div style="font-size:12px;color:var(--muted);margin-top:5px;line-height:1.3">' + esc(opts.label) + '</div>' : '')
      + '</div>'
      + (opts.badge ? '<div style="flex-shrink:0;margin-top:2px">' + opts.badge + '</div>' : '')
      + '</div>';

    var barHtml = '';
    if (opts.bar && opts.bar.length) {
      var segs = opts.bar.map(function (s) {
        return '<div title="' + esc(s.label || '') + '" style="flex:' + (s.pct || 0) + ';height:100%;'
          + 'background:' + (s.color || '#94A3B8') + ';'
          + 'transition:flex .4s ease"></div>';
      }).join('');
      barHtml = '<div style="height:7px;border-radius:999px;overflow:hidden;background:var(--border);'
        + 'display:flex;margin:14px 0 10px">' + segs + '</div>';
    }

    var statsHtml = '';
    if (opts.stats && opts.stats.length) {
      statsHtml = '<div style="display:flex;flex-direction:column;gap:5px">'
        + opts.stats.map(function (s) {
            return '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">'
              + '<div style="display:flex;align-items:center;gap:7px">'
              + '<span style="width:8px;height:8px;border-radius:50%;background:' + (s.color || '#94A3B8') + ';flex-shrink:0"></span>'
              + '<span style="font-size:12px;color:var(--muted)">' + esc(s.label) + '</span>'
              + '</div>'
              + '<span style="font-size:12px;font-weight:500;color:var(--text)">' + esc(String(s.value != null ? s.value : '')) + '</span>'
              + '</div>';
          }).join('')
        + '</div>';
    }

    return '<div style="background:var(--surface);border:1px solid var(--border);'
      + 'border-radius:12px;padding:' + (opts.padding || '20px 24px') + ';'
      + (opts.style || '') + '">'
      + header + barHtml + statsHtml
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Card — collapsable
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Collapsable card with animated chevron and smooth height transition.
   *
   * opts: {
   *   id          : string   unique id (required)
   *   title       : string
   *   subtitle    : string   optional — shown in header row after title
   *   bodyHtml    : string
   *   defaultOpen : boolean  (default false)
   *   padding     : string   body padding (default '16px 24px 20px')
   * }
   */
  function cardCollapsable(opts) {
    opts = opts || {};
    var id   = opts.id || ('cc-' + Math.random().toString(36).slice(2, 7));
    var open = opts.defaultOpen ? true : false;
    var bodyId = id + '-body';
    var icoId  = id + '-ico';

    var hdr = '<div onclick="UI._ccToggle(\'' + esc(id) + '\')" '
      + 'style="display:flex;align-items:center;justify-content:space-between;'
      + 'padding:14px 20px;cursor:pointer;user-select:none;transition:background .12s;border-radius:'
      + (open ? '12px 12px 0 0' : '12px') + '" '
      + 'id="' + esc(id) + '-hdr" '
      + 'onmouseenter="this.style.background=\'var(--bg)\'" '
      + 'onmouseleave="this.style.background=\'transparent\'">'
      + '<div style="display:flex;align-items:center;gap:10px">'
      + '<div style="font-size:13px;font-weight:600;color:var(--text)">' + esc(opts.title || '') + '</div>'
      + (opts.subtitle ? '<div style="font-size:12px;color:var(--faint)">' + esc(opts.subtitle) + '</div>' : '')
      + '</div>'
      + '<svg id="' + esc(icoId) + '" width="12" height="12" viewBox="0 0 10 6" fill="none" '
      + 'style="transition:transform .22s;transform:rotate(' + (open ? '0' : '-90') + 'deg);flex-shrink:0;color:var(--faint)">'
      + '<path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
      + '</svg>'
      + '</div>';

    var body = '<div id="' + esc(bodyId) + '" '
      + 'style="overflow:hidden;max-height:' + (open ? '9999px' : '0') + ';'
      + 'transition:max-height .28s cubic-bezier(.4,0,.2,1);'
      + 'border-top:' + (open ? '1px solid var(--border)' : 'none') + '">'
      + '<div style="padding:' + (opts.padding || '16px 24px 20px') + '">'
      + (opts.bodyHtml || '')
      + '</div></div>';

    return '<div id="' + esc(id) + '" '
      + 'style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden">'
      + hdr + body + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Card — with header  (same look as cardCollapsable but always open, no chevron)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Card with a titled header bar + body — identical visual to cardCollapsable
   * but static (no toggle, no chevron).
   *
   * opts: {
   *   title       : string
   *   subtitle    : string   optional
   *   headerRight : string   optional HTML in the right of the header row
   *   bodyHtml    : string
   *   padding     : string   body padding (default '16px 24px 20px')
   *   style       : string   extra CSS on the wrapper
   * }
   */
  function cardHeader(opts) {
    opts = opts || {};
    var _cardHdrLeft = opts.titleHtml
      ? opts.titleHtml
      : '<div style="font-size:13px;font-weight:600;color:var(--text)">' + esc(opts.title || '') + '</div>'
        + (opts.subtitle ? '<div style="font-size:12px;color:var(--faint)">' + esc(opts.subtitle) + '</div>' : '');
    var hdr = '<div style="display:flex;align-items:center;justify-content:space-between;'
      + 'padding:14px 20px;border-bottom:1px solid var(--border);border-radius:12px 12px 0 0">'
      + '<div style="display:flex;align-items:center;gap:10px">'
      + _cardHdrLeft
      + '</div>'
      + (opts.headerRight ? '<div style="flex-shrink:0">' + opts.headerRight + '</div>' : '')
      + '</div>';

    var body = '<div style="padding:' + (opts.padding || '16px 24px 20px') + '">'
      + (opts.bodyHtml || '')
      + '</div>';

    return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;'
      + (opts.style || '') + '">'
      + hdr + body + '</div>';
  }

  // ── OKR Progress Ring ─────────────────────────────────────────────────────
  // Circular progress ring used in OKR objective headers.
  // pct   : 0-100
  // color : stroke colour (e.g. '#6366F1')
  // size  : diameter in px (default 52)
  function okrProgressRing(pct, color, size) {
    size = size || 52;
    var r    = (size - 8) / 2;
    var circ = 2 * Math.PI * r;
    var dash = (pct / 100) * circ;
    return '<div style="position:relative;width:' + size + 'px;height:' + size + 'px">'
      + '<svg width="' + size + '" height="' + size + '" style="transform:rotate(-90deg)">'
      +   '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + r + '" fill="none" stroke="var(--border)" stroke-width="5"/>'
      +   '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + dash + ' ' + (circ - dash) + '"/>'
      + '</svg>'
      + '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:' + Math.round(size * 0.22) + 'px;font-weight:700;color:var(--text)">' + pct + '%</div>'
      + '</div>';
  }

  // ── OKR Objective Header ───────────────────────────────────────────────────
  // Compact header row for an OKR objective card (used in both "All" and dept
  // views). Returns the inner header <div> only — wrap it in a card container.
  //
  // opts = {
  //   index      : number   — 0-based; displayed as 'O(index+1)'
  //   color      : string   — accent colour  e.g. '#6366F1'
  //   lightBg    : string   — tinted bg      e.g. 'rgba(99,102,241,.08)'
  //   title      : string   — plain text (escaped internally)
  //   description: string   — optional plain text
  //   pct        : number   — 0-100 progress shown in ring
  //   ringLabel  : string   — label under ring (default 'overall')
  //   editBtn    : string   — optional HTML appended after title (not escaped)
  //   ringSize   : number   — ring diameter in px (default 52)
  //   padding    : string   — CSS padding (default '20px 24px')
  // }
  function okrObjectiveHeader(opts) {
    opts = opts || {};
    var color   = opts.color   || 'var(--accent)';
    var lightBg = opts.lightBg || 'var(--subtle)';
    var index   = opts.index  !== undefined ? opts.index : 0;
    var pct     = opts.pct    !== undefined ? opts.pct   : 0;
    var size    = opts.ringSize || 52;
    var pad     = opts.padding  || '20px 24px';
    var label   = opts.ringLabel !== undefined ? opts.ringLabel : 'overall';
    var editBtn = opts.editBtn || '';

    return '<div style="padding:' + pad + ';border-bottom:1px solid var(--border);'
      + 'display:flex;align-items:flex-start;justify-content:space-between;gap:16px;'
      + 'border-left:4px solid ' + color + '">'
      + '<div style="flex:1;min-width:0">'
      +   '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">'
      +     '<span style="font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;'
      +       'color:' + color + ';background:' + lightBg + ';padding:2px 8px;border-radius:4px">O' + (index + 1) + '</span>'
      +     '<span style="font-size:15px;font-weight:600;color:var(--text);letter-spacing:-.2px">' + esc(opts.title || '') + '</span>'
      +     editBtn
      +   '</div>'
      +   (opts.description ? '<div style="font-size:12px;color:var(--muted);line-height:1.5;margin-top:2px">' + esc(opts.description) + '</div>' : '')
      + '</div>'
      + '<div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:4px">'
      +   okrProgressRing(pct, color, size)
      +   '<span style="font-size:9px;color:var(--faint);white-space:nowrap">' + esc(label) + '</span>'
      + '</div>'
      + '</div>';
  }

  // ── Page Header — inline-edit title ──────────────────────────────────────
  // Same as pageHeader but pencil next to the h1 → click edits inline.
  // Enter / ✓ to save (calls onSaveFn(newTitle)), Esc to cancel.
  function pageHeaderEditable(opts) {
    opts = opts || {};
    var id  = esc(opts.id || ('phe-' + Math.random().toString(36).slice(2, 7)));
    var sfn = opts.onSaveFn ? ',\'' + esc(opts.onSaveFn) + '\'' : '';
    var PENCIL = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
    var CHECK  = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 8l3 3 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var btnPen = '<button onclick="UI._cheEdit(\'' + id + '\')" title="Rename" '
      + 'style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;'
      + 'border:none;background:transparent;cursor:pointer;color:var(--faint);border-radius:5px;'
      + 'flex-shrink:0;transition:color .12s,background .12s" '
      + 'onmouseenter="this.style.color=\'var(--text)\';this.style.background=\'var(--subtle)\'" '
      + 'onmouseleave="this.style.color=\'var(--faint)\';this.style.background=\'transparent\'">'
      + PENCIL + '</button>';
    var btnSave = '<button onclick="UI._cheSave(\'' + id + '\'' + sfn + ')" title="Save" '
      + 'style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;'
      + 'border:none;background:var(--accent);color:#fff;cursor:pointer;border-radius:5px;'
      + 'flex-shrink:0;transition:opacity .12s" '
      + 'onmouseenter="this.style.opacity=\'.8\'" onmouseleave="this.style.opacity=\'1\'">'
      + CHECK + '</button>';
    var dispHtml = '<div id="' + id + '-disp" style="display:flex;align-items:center;gap:8px">'
      + '<h1 id="' + id + '-txt" style="font-size:22px;font-weight:700;letter-spacing:-.5px;color:var(--text);line-height:1.2;margin:0">' + esc(opts.title || '') + '</h1>'
      + btnPen
      + '</div>';
    var editHtml = '<div id="' + id + '-edit" style="display:none;align-items:center;gap:8px">'
      + '<input id="' + id + '-inp" type="text" value="' + esc(opts.title || '') + '" '
      + 'style="font-size:22px;font-weight:700;letter-spacing:-.5px;padding:2px 10px;'
      + 'border:1px solid var(--accent);border-radius:7px;background:var(--bg);'
      + 'color:var(--text);outline:none;font-family:inherit;min-width:200px;'
      + 'box-shadow:0 0 0 3px rgba(237,0,94,.08)" '
      + 'onkeydown="if(event.key===\'Enter\'){event.preventDefault();UI._cheSave(\'' + id + '\'' + sfn + ')}'
      + 'else if(event.key===\'Escape\')UI._cheCancel(\'' + id + '\')">'
      + btnSave
      + '</div>';
    var crumb = opts.breadcrumb && opts.breadcrumb.length
      ? '<div style="margin-bottom:6px">' + breadcrumb(opts.breadcrumb) + '</div>' : '';
    var titleRow = '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">'
      + '<div style="display:flex;align-items:center;gap:0">' + dispHtml + editHtml + '</div>'
      + (opts.titleRight ? '<div style="flex-shrink:0">' + opts.titleRight + '</div>' : '')
      + '</div>';
    var sub = opts.subtitle
      ? '<div style="font-size:13px;color:var(--muted);margin-top:5px;line-height:1.4">' + esc(opts.subtitle) + '</div>' : '';
    return '<div style="margin-bottom:' + (opts.mb || '20px') + '">' + crumb + titleRow + sub + '</div>';
  }

  // ── Page Header — modal-edit title ────────────────────────────────────────
  // Pencil next to the h1 → calls opts.onEditFn (opens a drawer or modal).
  function pageHeaderModal(opts) {
    opts = opts || {};
    var PENCIL = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
    var btnPen = '<button onclick="' + esc(opts.onEditFn || '') + '" title="Edit" '
      + 'style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;'
      + 'border:none;background:transparent;cursor:pointer;color:var(--faint);border-radius:5px;'
      + 'flex-shrink:0;transition:color .12s,background .12s" '
      + 'onmouseenter="this.style.color=\'var(--text)\';this.style.background=\'var(--subtle)\'" '
      + 'onmouseleave="this.style.color=\'var(--faint)\';this.style.background=\'transparent\'">'
      + PENCIL + '</button>';
    var crumb = opts.breadcrumb && opts.breadcrumb.length
      ? '<div style="margin-bottom:6px">' + breadcrumb(opts.breadcrumb) + '</div>' : '';
    var titleRow = '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">'
      + '<div style="display:flex;align-items:center;gap:8px">'
      + '<h1 style="font-size:22px;font-weight:700;letter-spacing:-.5px;color:var(--text);line-height:1.2;margin:0">' + esc(opts.title || '') + '</h1>'
      + btnPen
      + '</div>'
      + (opts.titleRight ? '<div style="flex-shrink:0">' + opts.titleRight + '</div>' : '')
      + '</div>';
    var sub = opts.subtitle
      ? '<div style="font-size:13px;color:var(--muted);margin-top:5px;line-height:1.4">' + esc(opts.subtitle) + '</div>' : '';
    return '<div style="margin-bottom:' + (opts.mb || '20px') + '">' + crumb + titleRow + sub + '</div>';
  }

  // ── Shared helpers for inline-edit (used by pageHeaderEditable) ───────────
  function _cheEdit(id) {
    var d = document.getElementById(id + '-disp');
    var e = document.getElementById(id + '-edit');
    var i = document.getElementById(id + '-inp');
    if (!d || !e) return;
    d.style.display = 'none';
    e.style.display = 'flex';
    if (i) { i.focus(); i.select(); }
  }

  function _cheSave(id, fn) {
    var d   = document.getElementById(id + '-disp');
    var e   = document.getElementById(id + '-edit');
    var txt = document.getElementById(id + '-txt');
    var i   = document.getElementById(id + '-inp');
    if (!d || !e) return;
    var val = i ? i.value.trim() : '';
    if (val && txt) txt.textContent = val;
    d.style.display = 'flex';
    e.style.display = 'none';
    if (fn && window[fn]) window[fn](val || (txt ? txt.textContent : ''));
  }

  function _cheCancel(id) {
    var d   = document.getElementById(id + '-disp');
    var e   = document.getElementById(id + '-edit');
    var txt = document.getElementById(id + '-txt');
    var i   = document.getElementById(id + '-inp');
    if (!d || !e) return;
    if (i && txt) i.value = txt.textContent;
    d.style.display = 'flex';
    e.style.display = 'none';
  }

  /** Toggle a cardCollapsable open/closed */
  function _ccToggle(id) {
    var body = document.getElementById(id + '-body');
    var hdr  = document.getElementById(id + '-hdr');
    var ico  = document.getElementById(id + '-ico');
    if (!body) return;
    var isOpen = body.style.maxHeight !== '0px' && body.style.maxHeight !== '0';
    if (isOpen) {
      body.style.maxHeight   = '0';
      body.style.borderTop   = 'none';
      if (ico) ico.style.transform = 'rotate(-90deg)';
      if (hdr) hdr.style.borderRadius = '12px';
    } else {
      body.style.maxHeight   = '9999px';
      body.style.borderTop   = '1px solid var(--border)';
      if (ico) ico.style.transform = 'rotate(0deg)';
      if (hdr) hdr.style.borderRadius = '12px 12px 0 0';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Alert banner
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Inline alert banner.
   * @param {'error'|'success'|'info'|'warning'} type
   * @param {string} title
   * @param {string} [message]
   * @param {string} [closeFn]  global function name called on dismiss click
   */
  /**
   * Alert banner — three display variants controlled by `title` and `noIcon`:
   *
   *   Full     UI.alertBanner('error', 'Title',  'Message')          icon + bold title + small message
   *   Icon+txt UI.alertBanner('error', '',        'Message')          icon + normal-weight text, vertically centred
   *   Text     UI.alertBanner('error', '',        'Message', null, true)  no icon — text only
   *
   * @param {'error'|'success'|'info'|'warning'} type
   * @param {string}  title    — empty/null for compact variants
   * @param {string}  message
   * @param {string}  [closeFn]
   * @param {boolean} [noIcon] — true hides the icon entirely
   */
  function alertBanner(type, title, message, closeFn, noIcon) {
    var cfgMap = {
      error:   { bg:'#FFF0F0', br:'rgba(229,36,59,.18)',   tx:'#C0152A',
        icon:'<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
      success: { bg:'#F0FDF4', br:'rgba(16,185,129,.18)',  tx:'#166534',
        icon:'<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
      info:    { bg:'#EFF6FF', br:'rgba(59,130,246,.18)',  tx:'#1D4ED8',
        icon:'<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 7v5M8 5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
      warning: { bg:'#FFFBEB', br:'rgba(245,158,11,.18)',  tx:'#92400E',
        icon:'<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2.5L14 13.5H2L8 2.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 6.5v3.5M8 11.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' }
    };
    var c = cfgMap[type] || cfgMap.info;
    var hasTitle = !!(title && title.length);
    var align = (hasTitle && message) ? 'flex-start' : 'center';

    var closeHtml = closeFn
      ? '<button onclick="' + esc(closeFn) + '" title="Dismiss"'
        + ' style="flex-shrink:0;width:18px;height:18px;display:flex;align-items:center;justify-content:center;'
        + 'border:none;background:none;cursor:pointer;color:' + c.tx + ';border-radius:3px;opacity:.5;font-size:15px;line-height:1;'
        + 'transition:opacity .12s" onmouseenter="this.style.opacity=\'1\'" onmouseleave="this.style.opacity=\'.5\'">×</button>'
      : '';

    var iconHtml = noIcon ? '' :
      '<span style="flex-shrink:0;color:' + c.tx + ';display:flex">' + c.icon + '</span>';

    var bodyHtml = hasTitle
      ? '<div style="font-size:12px;font-weight:600;color:' + c.tx + ';line-height:1.4">' + esc(title) + '</div>'
        + (message ? '<div style="font-size:11px;color:' + c.tx + ';opacity:.8;margin-top:2px;line-height:1.5">' + esc(message) + '</div>' : '')
      : '<span style="font-size:12px;color:' + c.tx + ';line-height:1.4">' + esc(message || '') + '</span>';

    return '<div style="display:flex;align-items:' + align + ';gap:10px;padding:8px 12px;'
      + 'border-radius:7px;border:1px solid ' + c.br + ';background:' + c.bg + '">'
      + iconHtml
      + '<div style="flex:1;min-width:0">' + bodyHtml + '</div>'
      + closeHtml
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Formula card  ("How it works" inline explanation panel)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Inline explanation panel — subtle pink bg, formula code blocks, optional dismiss.
   * Pair with a "ⓘ How it works" trigger button that toggles visibility.
   *
   * @param {string}   title
   * @param {string}   description
   * @param {string[]} formulas      Array of formula strings rendered in monospace boxes
   * @param {string}   [closeFn]     Global fn name called on dismiss (×) click
   */
  function formulaCard(title, description, formulas, closeFn) {
    var INFO_SVG = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none">'
      + '<circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/>'
      + '<path d="M8 7v5M8 5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'
      + '</svg>';
    var closeBtn = closeFn
      ? '<button onclick="' + esc(closeFn) + '" title="Dismiss"'
        + ' style="flex-shrink:0;width:20px;height:20px;display:flex;align-items:center;'
        + 'justify-content:center;border:none;background:none;cursor:pointer;'
        + 'color:var(--muted);font-size:16px;line-height:1;border-radius:4px;'
        + 'transition:color .12s" onmouseenter="this.style.color=\'var(--text)\'"'
        + ' onmouseleave="this.style.color=\'var(--muted)\'">×</button>'
      : '';
    var formulasHtml = (formulas || []).map(function(f) {
      return '<div style="margin-top:6px;background:var(--surface);border:1px solid var(--border);'
        + 'border-radius:6px;padding:7px 10px;font-family:\'SFMono-Regular\',Consolas,monospace;'
        + 'font-size:11px;color:var(--text);line-height:1.5">' + esc(f) + '</div>';
    }).join('');
    return '<div style="background:var(--subtle);border:1px solid rgba(237,0,94,.14);border-radius:8px;padding:10px 12px">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">'
      +   '<div style="display:flex;align-items:center;gap:6px">'
      +     '<span style="color:var(--accent);flex-shrink:0;display:flex">' + INFO_SVG + '</span>'
      +     '<span style="font-size:12px;font-weight:600;color:var(--text);line-height:1.3">' + esc(title) + '</span>'
      +   '</div>'
      +   closeBtn
      + '</div>'
      + (description
          ? '<div style="font-size:11px;color:var(--muted);margin-top:5px;line-height:1.5">' + esc(description) + '</div>'
          : '')
      + formulasHtml
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AI Insights banner
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * AI Insights banner — subtle pink bg + left accent border.
   * Items render in a responsive CSS grid (up to 5 columns).
   *
   * @param {Array<{icon:string, html?:string, text?:string}>} items
   *   icon  — emoji string (e.g. '⚠️', '💡')
   *   html  — safe HTML for the insight text (use esc() for untrusted values)
   *   text  — plain-text alternative (auto-escaped)
   * @param {object} [opts]
   *   opts.label       {string}  badge label (default 'AI INSIGHTS')
   *   opts.quarter     {string}  e.g. 'Q2 2026'
   *   opts.minColWidth {number}  min column width in px for auto-fill (default 220)
   */
  function aiInsights(items, opts) {
    opts = opts || {};
    var label      = opts.label !== undefined ? opts.label : 'AI INSIGHTS';
    var quarter    = opts.quarter    || '';
    var minColW    = opts.minColWidth || 220;

    var sparkle = '<svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M5 0L5.95 3.55 10 5 5.95 6.45 5 10 4.05 6.45 0 5 4.05 3.55 5 0Z"/>'
      + '</svg>';

    var badgeHtml = '<span style="display:inline-flex;align-items:center;gap:5px;font-size:10px;'
      + 'font-weight:700;letter-spacing:.7px;color:var(--accent);'
      + 'background:rgba(237,0,94,.08);padding:2px 8px 2px 7px;border-radius:4px">'
      + sparkle + esc(label) + '</span>';

    var header = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'
      + badgeHtml
      + (quarter ? '<span style="font-size:12px;color:var(--muted)">· ' + esc(quarter) + '</span>' : '')
      + '</div>';

    var grid = '<div style="display:grid;'
      + 'grid-template-columns:repeat(auto-fill,minmax(' + minColW + 'px,1fr));'
      + 'gap:8px 24px">'
      + (items || []).map(function(it) {
          var txt = it.html !== undefined ? it.html : esc(it.text || '');
          return '<div style="display:flex;align-items:flex-start;gap:7px">'
            + '<span style="font-size:14px;flex-shrink:0;line-height:1.5">' + (it.icon || '') + '</span>'
            + '<span style="font-size:13px;color:var(--text);line-height:1.5">' + txt + '</span>'
            + '</div>';
        }).join('')
      + '</div>';

    return '<div style="background:var(--subtle);border-left:3px solid var(--accent);'
      + 'border-radius:10px;padding:14px 18px">'
      + header + grid
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Filter dropdown  (for filter bars — 30px height, muted→accent on select)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Single filter dropdown pill — used inside filtersBar().
   * Renders with muted text at rest; turns accent-bordered when a value is active.
   * @param {string} id
   * @param {string} placeholder   e.g. "All Drivers"
   * @param {Array<{val,label}>} options
   * @param {string} [onChangeFn]  called as window[onChangeFn](val)
   */
  function filterDd(id, placeholder, options, onChangeFn) {
    var panelId = id + '-fp';
    var changePart = onChangeFn ? ',\'' + esc(onChangeFn) + '\'' : '';

    var clearItem = '<div data-val="" onclick="UI._fdPick(\'' + esc(id) + '\',\'\',\'' + esc(placeholder) + '\'' + changePart + ')"'
      + ' style="padding:7px 14px;font-size:12px;cursor:pointer;white-space:nowrap;color:var(--muted)"'
      + ' onmouseenter="this.style.background=\'rgba(237,0,94,.06)\'"'
      + ' onmouseleave="this.style.background=\'\'">'
      + esc(placeholder) + '</div>';

    var items = options.map(function(o) {
      return '<div data-val="' + esc(String(o.val)) + '"'
        + ' onclick="UI._fdPick(\'' + esc(id) + '\',\'' + esc(String(o.val)) + '\',\'' + esc(o.label) + '\'' + changePart + ')"'
        + ' style="padding:7px 14px;font-size:12px;cursor:pointer;white-space:nowrap;color:var(--text)"'
        + ' onmouseenter="this.style.background=\'rgba(237,0,94,.06)\';this.style.color=\'var(--accent)\'"'
        + ' onmouseleave="this.style.background=\'\';this.style.color=\'\'">'
        + esc(o.label) + '</div>';
    }).join('');

    var chev = '<svg id="' + esc(id) + '-chev" width="10" height="6" viewBox="0 0 10 6" fill="none"'
      + ' style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;transition:transform .15s">'
      + '<path d="M1 1l4 4 4-4" stroke="#A8A8A0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
      + '</svg>';

    return '<div id="' + esc(id) + '-wrap" data-value="" style="position:relative;display:inline-block">'
      + '<button type="button" id="' + esc(id) + '-btn"'
      + ' onclick="UI._fdToggle(\'' + esc(id) + '\')"'
      + ' style="height:30px;min-width:120px;max-width:200px;padding:0 26px 0 10px;'
      + 'border:1px solid var(--border-md);border-radius:7px;font-size:12px;font-family:inherit;'
      + 'color:var(--muted);background:var(--surface);cursor:pointer;text-align:left;'
      + 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;outline:none;'
      + 'transition:border-color .15s,color .15s,box-shadow .15s;position:relative"'
      + ' onmouseenter="if(!document.getElementById(\'' + esc(id) + '-wrap\').dataset.value){this.style.borderColor=\'var(--border-strong,#c0c0c0)\'}"'
      + ' onmouseleave="if(!document.getElementById(\'' + esc(id) + '-wrap\').dataset.value){this.style.borderColor=\'var(--border-md)\'}">'
      + '<span id="' + esc(id) + '-lbl">' + esc(placeholder) + '</span>'
      + chev
      + '</button>'
      + '<input type="hidden" id="' + esc(id) + '" value="">'
      + '<div id="' + esc(panelId) + '" style="display:none;position:absolute;top:calc(100% + 4px);left:0;'
      + 'min-width:100%;max-height:220px;overflow-y:auto;background:var(--surface);'
      + 'border:1px solid var(--border-md);border-radius:8px;'
      + 'box-shadow:0 4px 20px rgba(0,0,0,.13);z-index:9100;padding:4px 0">'
      + clearItem
      + items
      + '</div>'
      + '</div>';
  }

  function _fdToggle(id) {
    var panel = document.getElementById(id + '-fp');
    var btn   = document.getElementById(id + '-btn');
    var chev  = document.getElementById(id + '-chev');
    var wrap  = document.getElementById(id + '-wrap');
    if (!panel) return;
    var isOpen = panel.style.display !== 'none';
    if (isOpen) {
      panel.style.display = 'none';
      if (chev) chev.style.transform = 'translateY(-50%)';
      if (btn && !(wrap && wrap.dataset.value)) { btn.style.borderColor = 'var(--border-md)'; btn.style.boxShadow = 'none'; }
    } else {
      panel.style.display = 'block';
      if (btn) { btn.style.borderColor = 'var(--accent)'; btn.style.boxShadow = '0 0 0 3px rgba(237,0,94,.08)'; }
      if (chev) chev.style.transform = 'translateY(-50%) rotate(180deg)';
      setTimeout(function() {
        function _close(e) {
          if (wrap && wrap.contains(e.target)) return;
          panel.style.display = 'none';
          if (chev) chev.style.transform = 'translateY(-50%)';
          if (btn && !(wrap && wrap.dataset.value)) { btn.style.borderColor = 'var(--border-md)'; btn.style.boxShadow = 'none'; }
          document.removeEventListener('click', _close);
        }
        document.addEventListener('click', _close);
      }, 0);
    }
  }

  function _fdPick(id, val, label, onChangeFn) {
    var wrap  = document.getElementById(id + '-wrap');
    var inp   = document.getElementById(id);
    var lbl   = document.getElementById(id + '-lbl');
    var btn   = document.getElementById(id + '-btn');
    var chev  = document.getElementById(id + '-chev');
    var panel = document.getElementById(id + '-fp');
    if (wrap) wrap.dataset.value = val;
    if (inp)  inp.value = val;
    if (lbl)  lbl.textContent = label;
    if (panel) panel.style.display = 'none';
    if (chev) chev.style.transform = 'translateY(-50%)';
    if (btn) {
      btn.style.boxShadow = 'none';
      if (val) { btn.style.borderColor = 'var(--accent)'; btn.style.color = 'var(--text)'; }
      else     { btn.style.borderColor = 'var(--border-md)'; btn.style.color = 'var(--muted)'; }
    }
    if (onChangeFn && window[onChangeFn]) window[onChangeFn](val);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Filters Bar  (search + filter dropdowns + reset)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Assembles a full filters bar with optional search, N filter dropdowns, and a Reset button.
   *
   * @param {object} opts
   * @param {string}  [opts.searchId]          id for the search input (omit to hide search)
   * @param {string}  [opts.searchPlaceholder] defaults to 'Search…'
   * @param {string}  [opts.onSearchFn]        JS expression on each keystroke
   * @param {number}  [opts.searchWidth]       px width of search box, default 200
   * @param {Array}   [opts.filters]           [{id, placeholder, options, onChangeFn}, …]
   * @param {string}  [opts.resetFn]           JS expression; omit to hide Reset button
   */
  function filtersBar(opts) {
    opts = opts || {};
    var parts = '';

    if (opts.searchId !== undefined) {
      var sw = opts.searchWidth || 200;
      var ico = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none">'
        + '<circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.4"/>'
        + '<path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'
        + '</svg>';
      parts += '<div style="position:relative;width:' + sw + 'px;flex-shrink:0">'
        + '<span style="position:absolute;left:9px;top:50%;transform:translateY(-50%);'
        + 'pointer-events:none;color:var(--faint);display:flex">' + ico + '</span>'
        + '<input' + (opts.searchId ? ' id="' + esc(opts.searchId) + '"' : '') + ' type="text"'
        + ' placeholder="' + esc(opts.searchPlaceholder || 'Search…') + '"'
        + (opts.onSearchFn ? ' oninput="' + opts.onSearchFn + '"' : '')
        + ' style="width:100%;box-sizing:border-box;height:30px;padding:0 10px 0 28px;'
        + 'border:1px solid var(--border-md);border-radius:7px;background:var(--surface);'
        + 'color:var(--text);font-size:12px;font-family:inherit;outline:none;transition:border-color .15s"'
        + ' onfocus="this.style.borderColor=\'var(--accent)\'"'
        + ' onblur="this.style.borderColor=\'var(--border-md)\'">'
        + '</div>';
    }

    (opts.filters || []).forEach(function(f) {
      parts += filterDd(f.id, f.placeholder, f.options || [], f.onChangeFn);
    });

    if (opts.resetFn !== undefined) {
      parts += '<button type="button" onclick="' + (opts.resetFn || '') + '"'
        + ' style="height:30px;padding:0 12px;border:1px solid var(--border-md);border-radius:7px;'
        + 'font-size:12px;font-family:inherit;color:var(--muted);background:none;cursor:pointer;'
        + 'flex-shrink:0;transition:color .15s,border-color .15s"'
        + ' onmouseenter="this.style.color=\'var(--accent)\';this.style.borderColor=\'var(--accent)\'"'
        + ' onmouseleave="this.style.color=\'var(--muted)\';this.style.borderColor=\'var(--border-md)\'">Reset</button>';
    }

    return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px">'
      + parts
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Search Bar
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Search input with leading icon.
   * @param {string} id
   * @param {string} [placeholder='Search…']
   * @param {string} [oninputFn]   JS expression fired on each keystroke
   * @param {string} [value='']
   */
  function searchBar(id, placeholder, oninputFn, value) {
    var ico = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none">'
      + '<circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.4"/>'
      + '<path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'
      + '</svg>';
    return '<div style="position:relative;display:inline-block;width:100%">'
      + '<span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);'
      + 'pointer-events:none;color:var(--faint);display:flex">' + ico + '</span>'
      + '<input' + (id ? ' id="' + esc(id) + '"' : '') + ' type="text"'
      + ' placeholder="' + esc(placeholder || 'Search…') + '"'
      + ' value="' + esc(value || '') + '"'
      + (oninputFn ? ' oninput="' + oninputFn + '"' : '')
      + ' style="width:100%;box-sizing:border-box;height:34px;padding:0 12px 0 32px;'
      + 'border:1px solid var(--border-md);border-radius:8px;background:var(--surface);'
      + 'color:var(--text);font-size:13px;font-family:inherit;outline:none;transition:border-color .15s"'
      + ' onfocus="this.style.borderColor=\'var(--accent)\'"'
      + ' onblur="this.style.borderColor=\'var(--border-md)\'">'
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Checkbox
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * @param {string}  id
   * @param {string}  label
   * @param {boolean} [checked=false]
   * @param {string}  [onchangeFn]
   * @param {boolean} [disabled=false]
   */
  function checkbox(id, label, checked, onchangeFn, disabled) {
    var cur = disabled ? 'default' : 'pointer';
    return '<label style="display:inline-flex;align-items:center;gap:8px;cursor:' + cur + ';user-select:none">'
      + '<input type="checkbox"' + (id ? ' id="' + esc(id) + '"' : '')
      + (checked  ? ' checked'  : '')
      + (disabled ? ' disabled' : '')
      + (onchangeFn ? ' onchange="' + onchangeFn + '"' : '')
      + ' style="width:15px;height:15px;accent-color:var(--accent);cursor:' + cur + ';flex-shrink:0'
      + (disabled ? ';opacity:.4' : '') + '">'
      + '<span style="font-size:12px;color:' + (disabled ? 'var(--faint)' : 'var(--text)') + ';line-height:1.3">'
      + esc(label) + '</span>'
      + '</label>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Radio button
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * @param {string}  id
   * @param {string}  name       radio group name
   * @param {string}  label
   * @param {string}  value
   * @param {boolean} [checked=false]
   * @param {string}  [onchangeFn]
   * @param {boolean} [disabled=false]
   */
  function radio(id, name, label, value, checked, onchangeFn, disabled) {
    var cur = disabled ? 'default' : 'pointer';
    return '<label style="display:inline-flex;align-items:center;gap:8px;cursor:' + cur + ';user-select:none">'
      + '<input type="radio"' + (id ? ' id="' + esc(id) + '"' : '')
      + (name  ? ' name="'  + esc(name)  + '"' : '')
      + (value !== undefined ? ' value="' + esc(String(value)) + '"' : '')
      + (checked  ? ' checked'  : '')
      + (disabled ? ' disabled' : '')
      + (onchangeFn ? ' onchange="' + onchangeFn + '"' : '')
      + ' style="width:15px;height:15px;accent-color:var(--accent);cursor:' + cur + ';flex-shrink:0'
      + (disabled ? ';opacity:.4' : '') + '">'
      + '<span style="font-size:12px;color:' + (disabled ? 'var(--faint)' : 'var(--text)') + ';line-height:1.3">'
      + esc(label) + '</span>'
      + '</label>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Permission Table
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Builds a permissions matrix table with checkboxes (enable/disable) and
   * radio buttons (permission level) per row.
   * Section header rows use var(--bg) to match the consolidated table header colour.
   *
   * @param {Array}  sections      [{label, rows}]
   *   row: { id, label, checked, radioValue, onCheckFn, onRadioFn,
   *          sub?: [{id, label, checked, radioValue, onCheckFn, onRadioFn}] }
   * @param {Array}  radioLabels   column header strings, e.g. ['View','Edit']
   *                               length determines number of radio columns
   */
  function permissionTable(sections, radioLabels) {
    // radioLabels accepts both plain strings and {val, label} objects
    var cols  = (radioLabels || []).map(function(c) {
      return typeof c === 'string' ? { val: c, label: c } : c;
    });
    var nCols = cols.length;
    var TD      = 'padding:9px 14px;border-bottom:1px solid var(--border);vertical-align:middle';
    var TH_CENT = TD + ';text-align:center;font-size:10px;font-weight:600;'
                + 'text-transform:uppercase;letter-spacing:.5px;color:var(--faint)';

    var cg = '<colgroup><col>'
      + cols.map(function() { return '<col style="width:68px">'; }).join('')
      + '</colgroup>';

    var thead = '<thead><tr>'
      + '<th style="' + TD + ';font-size:10px;font-weight:600;text-transform:uppercase;'
      + 'letter-spacing:.5px;color:transparent;background:transparent"></th>'
      + cols.map(function(c) {
          return '<th style="' + TH_CENT + '">' + esc(c.label) + '</th>';
        }).join('')
      + '</tr></thead>';

    function _radioCell(rowId, colVal, rowVal, onRadioFn, disabled) {
      var isChk = String(rowVal) === String(colVal);
      var radId = rowId + '-' + esc(colVal);
      return '<td style="' + TD + ';text-align:center">'
        + radio(radId, rowId + '-perm', '', colVal, isChk, onRadioFn || null, disabled)
        + '</td>';
    }

    var bodyRows = '';
    (sections || []).forEach(function(sec) {
      bodyRows += '<tr>'
        + '<td colspan="' + (nCols + 1) + '" style="' + TD
        + ';background:var(--bg);font-size:10px;font-weight:500;'
        + 'text-transform:uppercase;letter-spacing:.5px;color:var(--faint)">'
        + esc(sec.label) + '</td></tr>';

      (sec.rows || []).forEach(function(row) {
        var parentEnabled = row.checked;
        bodyRows += '<tr>'
          + '<td style="' + TD + '">'
          + checkbox(row.id + '-chk', row.label, row.checked, row.onCheckFn || null)
          + '</td>'
          + cols.map(function(c) {
              return _radioCell(row.id, c.val, row.radioValue, row.onRadioFn, !parentEnabled);
            }).join('')
          + '</tr>';

        (row.sub || []).forEach(function(sub) {
          bodyRows += '<tr>'
            + '<td style="' + TD + ';padding-left:40px">'
            + checkbox(sub.id + '-chk', sub.label, sub.checked, sub.onCheckFn || null, !parentEnabled)
            + '</td>'
            + cols.map(function(c) {
                return _radioCell(sub.id, c.val, sub.radioValue, sub.onRadioFn, !parentEnabled);
              }).join('')
            + '</tr>';
        });
      });
    });

    return '<div style="background:var(--surface);border:1px solid var(--border);'
      + 'border-radius:12px;overflow:hidden">'
      + '<table style="width:100%;border-collapse:collapse">'
      + cg + thead
      + '<tbody>' + bodyRows + '</tbody>'
      + '</table>'
      + '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────────────
  // Chart Color Palettes
  // ─────────────────────────────────────────────────────────────────────────

  // Medium-saturation palette — 24 chart-ready colors (good readability on white,
  // no neon, no pastel). Hues distributed ~15° apart across the full wheel.
  var CHART_COLORS_FULL = [
    '#F47843', // Warm Orange   — rgb(244,120,67)
    '#F4A234', // Amber         — rgb(244,162,52)
    '#F0C030', // Yellow        — rgb(240,192,48)
    '#AACC38', // Yellow-Lime   — rgb(170,204,56)
    '#8CC440', // Lime          — rgb(140,196,64)
    '#48BC6C', // Green         — rgb(72,188,108)
    '#2AAC88', // Emerald       — rgb(42,172,136)
    '#30B4B0', // Seafoam       — rgb(48,180,176)
    '#38BCBC', // Teal          — rgb(56,188,188)
    '#50C0D4', // Cyan          — rgb(80,192,212)
    '#5AACD8', // Sky           — rgb(90,172,216)
    '#5890D4', // Blue          — rgb(88,144,212)
    '#6878CC', // Cornflower    — rgb(104,120,204)
    '#7868CC', // Indigo        — rgb(120,104,204)
    '#9870CC', // Violet        — rgb(152,112,204)
    '#B860C8', // Purple        — rgb(184,96,200)
    '#CC4CA4', // Magenta       — rgb(204,76,164)
    '#E04CA0', // Hot Pink      — rgb(224,76,160)
    '#E44878', // Rose          — rgb(228,72,120)
    '#E84848', // Red           — rgb(232,72,72)
    '#F06042', // Coral         — rgb(240,96,66)
    '#E88840', // Orange-Amber  — rgb(232,136,64)
    '#98C840', // Yellow-Green  — rgb(152,200,64)
    '#40C0A0'  // Mint          — rgb(64,192,160)
  ];

  var CHART_COLORS_FULL_RGB = [
    '244,120,67',  '244,162,52',  '240,192,48',  '170,204,56',
    '140,196,64',  '72,188,108',  '42,172,136',  '48,180,176',
    '56,188,188',  '80,192,212',  '90,172,216',  '88,144,212',
    '104,120,204', '120,104,204', '152,112,204', '184,96,200',
    '204,76,164',  '224,76,160',  '228,72,120',  '232,72,72',
    '240,96,66',   '232,136,64',  '152,200,64',  '64,192,160'
  ];

  // Same hues — lighter tints (~88–92% lightness) for fills, area charts, badge backgrounds
  var CHART_COLORS_LIGHT = [
    '#FDE4D4', // Warm Orange   — rgb(253,228,212)
    '#FDEACC', // Amber         — rgb(253,234,204)
    '#FDF4C0', // Yellow        — rgb(253,244,192)
    '#EAF5C0', // Yellow-Lime   — rgb(234,245,192)
    '#E0F0C0', // Lime          — rgb(224,240,192)
    '#C8F0D4', // Green         — rgb(200,240,212)
    '#C0EEE4', // Emerald       — rgb(192,238,228)
    '#C0EEEC', // Seafoam       — rgb(192,238,236)
    '#C0ECEC', // Teal          — rgb(192,236,236)
    '#C0F2F8', // Cyan          — rgb(192,242,248)
    '#C4E8F8', // Sky           — rgb(196,232,248)
    '#C8DCF8', // Blue          — rgb(200,220,248)
    '#CDD0F4', // Cornflower    — rgb(205,208,244)
    '#D0CCF4', // Indigo        — rgb(208,204,244)
    '#DDD0F4', // Violet        — rgb(221,208,244)
    '#EAD0F4', // Purple        — rgb(234,208,244)
    '#F4D0EC', // Magenta       — rgb(244,208,236)
    '#F8D0EC', // Hot Pink      — rgb(248,208,236)
    '#FAD0E0', // Rose          — rgb(250,208,224)
    '#FAD0D0', // Red           — rgb(250,208,208)
    '#FDD8CC', // Coral         — rgb(253,216,204)
    '#FDE4BC', // Orange-Amber  — rgb(253,228,188)
    '#E8F4C0', // Yellow-Green  — rgb(232,244,192)
    '#C8F4E8'  // Mint          — rgb(200,244,232)
  ];

  var CHART_COLORS_LIGHT_RGB = [
    '253,228,212', '253,234,204', '253,244,192', '234,245,192',
    '224,240,192', '200,240,212', '192,238,228', '192,238,236',
    '192,236,236', '192,242,248', '196,232,248', '200,220,248',
    '205,208,244', '208,204,244', '221,208,244', '234,208,244',
    '244,208,236', '248,208,236', '250,208,224', '250,208,208',
    '253,216,204', '253,228,188', '232,244,192', '200,244,232'
  ];

  return {
    // Tokens (for inline use)
    IF: IF, LB: LB, TOKENS: TOKENS,
    // Utils
    esc: esc,
    // Fields
    field: field, input: input, textarea: textarea, select: select,
    customSelect: customSelect, _csToggle: _csToggle, _csPick: _csPick,
    // Layout
    section: section, sectionLabel: sectionLabel,
    // Buttons
    btnPrimary: btnPrimary, btnCancel: btnCancel, btnDanger: btnDanger,
    btnIcon: btnIcon,
    btnIconBordered: btnIconBordered, btnSecondary: btnSecondary, btnSlim: btnSlim,
    btnText: btnText,
    // Badge
    badge: badge, counterBadge: counterBadge,
    // Status chip
    statusChip: statusChip, STATUS_OPTS: STATUS_OPTS,
    driverChip: driverChip, DRIVER_OPTS: DRIVER_OPTS, _driverColor: _driverColor,
    deptChip: deptChip, deptChipSm: deptChipSm, DEPT_OPTS: DEPT_OPTS,
    // Navigation
    pills: pills, tabNav: tabNav, yearNav: yearNav, quarterPills: quarterPills,
    // Overlays
    openDrawer: openDrawer, closeDrawer: closeDrawer,
    openModal: openModal, closeModal: closeModal,
    // Inline cell components (ghost style — for table rows)
    cellReadOnly: cellReadOnly,
    cellInput: cellInput, cellOutlinedInput: cellOutlinedInput, cellSelect: cellSelect,
    cellCustomSelect: cellCustomSelect, _cscToggle: _cscToggle, _cscPick: _cscPick,
    cellOutlinedSelect: cellOutlinedSelect, _cosToggle: _cosToggle, _cosPick: _cosPick, _cosClose: _cosClose,
    cellRoi: cellRoi,
    progressBarStatus: progressBarStatus, progressBarFlat: progressBarFlat, progressBarCapacity: progressBarCapacity, progressBarAnimate: progressBarAnimate,
    // Table
    table: table, tr: tr, trReadOnly: trReadOnly,
    permissionTable: permissionTable,
    tableScroll: tableScroll, _tblScroll: _tblScroll,
    avatar: avatar, avatarCell: avatarCell, avatarChip: avatarChip, _avatarColor: _avatarColor,
    userTile: userTile,
    // Accordion
    accordion: accordion,
    // Steppers
    stepperH: stepperH, stepperV: stepperV,
    // Dropdowns
    ddPanel: ddPanel, ddToggle: ddToggle,
    searchCheckboxPanel: searchCheckboxPanel, _scFilter: _scFilter,
    jiraSelectPanel: jiraSelectPanel,
    // Chips Nav + Drawer Nav
    chipsNavLg: chipsNavLg, chipsNavSm: chipsNavSm, drawerNav: drawerNav,
    pageNavBar: pageNavBar,
    // Tooltip
    tooltip: tooltip,
    // Breadcrumb & Page Header
    breadcrumb: breadcrumb, pageHeader: pageHeader, pageHeaderWithYear: pageHeaderWithYear,
    pageHeaderEditable: pageHeaderEditable, pageHeaderModal: pageHeaderModal,
    _cheEdit: _cheEdit, _cheSave: _cheSave, _cheCancel: _cheCancel,
    // Cards
    card: card, cardStat: cardStat, cardCollapsable: cardCollapsable, _ccToggle: _ccToggle,
    cardHeader: cardHeader,
    okrProgressRing: okrProgressRing, okrObjectiveHeader: okrObjectiveHeader,
    // Alerts + AI Insights
    alertBanner: alertBanner, formulaCard: formulaCard, aiInsights: aiInsights,
    // Chart palettes
    CHART_COLORS_FULL: CHART_COLORS_FULL,
    CHART_COLORS_FULL_RGB: CHART_COLORS_FULL_RGB,
    CHART_COLORS_LIGHT: CHART_COLORS_LIGHT,
    CHART_COLORS_LIGHT_RGB: CHART_COLORS_LIGHT_RGB,
    // Filter bar
    filterDd: filterDd, _fdToggle: _fdToggle, _fdPick: _fdPick,
    filtersBar: filtersBar,
    // Form inputs
    searchBar: searchBar, checkbox: checkbox, radio: radio
  };

})();

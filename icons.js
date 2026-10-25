/*
  Inline SVG line icons (Demo Project Generation Standard 5.5).
  Replaces the former Font Awesome CDN: every <i class="fas fa-NAME"> in the HTML or in
  JS-rendered markup gets the matching 24x24 line icon injected inside it. The <i> element
  and its classes are kept, so existing CSS selectors and JS hooks keep working.
*/
(function () {
  var I = {
    'arrow-right': '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    'bars': '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    'bell': '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    'bolt': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    'box': '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><polyline points="3 8 12 13 21 8"/><line x1="12" y1="13" x2="12" y2="21"/>',
    'box-open': '<path d="M3 8l9 5 9-5"/><path d="M3 8v8l9 5 9-5V8"/><path d="M3 8l4-4 9 5"/><path d="M21 8l-4-4-5 3"/>',
    'boxes': '<rect x="8" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
    'chart-bar': '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    'chart-pie': '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    'check': '<polyline points="20 6 9 17 4 12"/>',
    'check-circle': '<circle cx="12" cy="12" r="10"/><polyline points="16 9 10.5 15 8 12.5"/>',
    'check-double': '<polyline points="17 6 8 15 4 11"/><polyline points="22 6 13 15 11.5 13.5"/>',
    'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
    'clipboard-check': '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><polyline points="9 14 11 16 15 12"/>',
    'clipboard-list': '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="15" y2="15"/>',
    'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'cloud-upload-alt': '<path d="M20 16.6A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>',
    'cog': '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/><circle cx="12" cy="12" r="7"/>',
    'columns': '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/>',
    'crown': '<path d="M3 18h18l-2-11-4.5 4L12 5l-2.5 6L5 7z"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    'edit': '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    'exchange-alt': '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    'exclamation-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    'exclamation-triangle': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    'file-csv': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><rect x="8" y="12" width="8" height="6"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="8" y1="15" x2="16" y2="15"/>',
    'file-invoice': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>',
    'file-invoice-dollar': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 11v8"/><path d="M14.5 12.5h-3.25a1.25 1.25 0 0 0 0 2.5h1.5a1.25 1.25 0 0 1 0 2.5H9.5"/>',
    'history': '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><polyline points="3 3 3 8 8 8"/><polyline points="12 7 12 12 15 14"/>',
    'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    'info-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    'key': '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3L21 2"/><path d="M16 7l3 3"/><path d="M18.5 4.5l2 2"/>',
    'list-alt': '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="7.01" y2="8"/><line x1="11" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="7.01" y2="12"/><line x1="11" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="7.01" y2="16"/><line x1="11" y1="16" x2="17" y2="16"/>',
    'lock': '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'minus-circle': '<circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>',
    'money-bill-wave': '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><line x1="6" y1="12" x2="6.01" y2="12"/><line x1="18" y1="12" x2="18.01" y2="12"/>',
    'not-equal': '<line x1="5" y1="9" x2="19" y2="9"/><line x1="5" y1="15" x2="19" y2="15"/><line x1="16" y1="4" x2="8" y2="20"/>',
    'paper-plane': '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    'paperclip': '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
    'plus': '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    'plus-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
    'ruler': '<path d="M21.3 8.7L8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4z"/><path d="M7.5 10.5l2 2"/><path d="M10.5 7.5l2 2"/><path d="M13.5 4.5l2 2"/><path d="M4.5 13.5l2 2"/>',
    'save': '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    'search': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    'shield-alt': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    'sign-in-alt': '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>',
    'sign-out-alt': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    'sliders-h': '<line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="18" x2="16" y2="22"/>',
    'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    'store': '<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M9 20v-6h6v6"/>',
    'tag': '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    'tags': '<path d="M18.6 13.4l-6.2 6.2a2 2 0 0 1-2.8 0L2 12V3h9l7.6 7.6a2 2 0 0 1 0 2.8z"/><path d="M14 3l7.6 7.6a2 2 0 0 1 0 2.8L19 16"/><line x1="6.5" y1="7.5" x2="6.51" y2="7.5"/>',
    'times': '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    'times-circle': '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
    'trash': '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 6V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/>',
    'trash-alt': '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 6V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
    'truck': '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'user-tie': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><polyline points="12 15 10.5 17 12 21 13.5 17 12 15"/>'
  };
  var SKIP = /^(fa-solid|fa-regular|fa-fw|fa-lg|fa-xs|fa-sm|fa-2x|fa-3x)$/;

  function iconName(el) {
    var cls = (el.getAttribute('class') || '').split(/\s+/);
    for (var i = 0; i < cls.length; i++) {
      var c = cls[i];
      if (c.indexOf('fa-') === 0 && !SKIP.test(c)) return c.slice(3);
    }
    return null;
  }

  function render(el) {
    var name = iconName(el);
    if (!name || el.getAttribute('data-ico') === name) return;
    var body = I[name];
    if (!body) { if (window.console) console.warn('icons.js: no icon for fa-' + name); return; }
    el.setAttribute('data-ico', name);
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">' + body + '</svg>';
  }

  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.tagName === 'I') render(root);
    var list = root.querySelectorAll('i[class*="fa-"]');
    for (var i = 0; i < list.length; i++) render(list[i]);
  }

  var css = document.createElement('style');
  css.textContent = 'i[data-ico]{display:inline-flex;align-items:center;justify-content:center;line-height:1;font-style:normal}' +
    'i[data-ico] svg{display:block;width:1em;height:1em}';
  document.head.appendChild(css);

  function start() {
    scan(document.body);
    new MutationObserver(function (muts) {
      for (var m = 0; m < muts.length; m++) {
        var mu = muts[m];
        if (mu.type === 'attributes') { render(mu.target); continue; }
        for (var n = 0; n < mu.addedNodes.length; n++) scan(mu.addedNodes[n]);
      }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

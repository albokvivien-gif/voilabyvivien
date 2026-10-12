/* Voila by Vivi — vacsoraest megjelenítő. Az est adatai: estek/<azonosító>.js (window.EST) */
(function () {
  var id = new URLSearchParams(location.search).get('e') || '';
  var meta = (window.ESTEK || []).find(function (x) { return x && x.id === id; });
  if (!meta || !/^[a-z0-9-]+$/.test(id)) { location.replace('vacsoraestek.html'); return; }
  var sc = document.createElement('script');
  sc.src = 'estek/' + id + '.js';
  sc.onload = function () { render(window.EST || {}, meta); };
  sc.onerror = function () { location.replace('vacsoraestek.html'); };
  document.head.appendChild(sc);
})();

function render(EST, META) {
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var KEY = 'voila-est-' + META.id, S = {};
  try { S = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { S = {}; }
  S.chk = S.chk || {}; S.g = S.g || EST.vendeg || 1;
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  var glass = '<svg viewBox="0 0 14 18" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M3 1h8l-1 6a3 3 0 0 1-6 0L3 1zM7 10v6M4 17h6"/></svg>';

  document.title = META.cim + ' – Vacsoraestek – Voila by Vivi';
  $('#kicker').textContent = EST.kicker || META.jelleg || '';
  $('#title').innerHTML = EST.titleHtml || esc(META.cim);
  $('#sub').textContent = EST.sub || '';
  $('#facts').innerHTML = (EST.facts || []).map(function (f) { return '<li><b>' + esc(f[0]) + '</b>' + esc(f[1]) + '</li>'; }).join('');

  /* Az est */
  $('#menu').innerHTML = '<div class="mt">Menü</div><div class="mh">' + esc(EST.menuCim || META.cim) + '</div>' +
    (EST.fogasok || []).map(function (c) {
      return '<div class="course"><div class="lab">' + (c.bor ? glass : '') + esc(c.cimke) + '</div>' +
        (c.nev ? '<div class="nm">' + esc(c.nev) + '</div>' : '') +
        '<div class="dishes">' + (c.etelek || []).map(function (d) { return '<span>' + esc(d) + '</span>'; }).join('') + '</div>' +
        (c.megj ? '<div class="note">' + esc(c.megj) + '</div>' : '') +
        (c.alt ? '<span class="alt">' + esc(c.alt) + '</span>' : '') + '</div>';
    }).join('');
  var side = '';
  (EST.dobozok || []).forEach(function (b) {
    side += '<div class="ebox"><h3>' + esc(b.cim) + '</h3><ul>' + (b.tetelek || []).map(function (t) {
      if (Array.isArray(t)) return '<li>' + esc(t[0]) + '<span class="pill ' + (t[1] ? 'ok' : 'todo') + '">' + (t[1] ? 'megvan' : 'beszerzendő') + '</span></li>';
      return '<li>' + esc(t) + '</li>';
    }).join('') + '</ul>' + (b.megj ? '<p class="enote">' + esc(b.megj) + '</p>' : '') + '</div>';
  });
  $('#side').innerHTML = side;

  /* Időterv */
  var ido = EST.ido || { napok: [] }, tid = 0;
  $('#idoSub').textContent = ido.sub || '';
  $('#timeline').innerHTML = ido.napok.length ? ido.napok.map(function (d) {
    return '<div class="day"><div class="dayh"><b>' + esc(d.nap) + '</b><span>' + esc(d.cimke || '') + '</span></div><ul class="tl">' +
      d.tetelek.map(function (t) {
        var k = 'i' + (tid++);
        return '<li class="' + (t[3] ? 'key' : '') + '"><label class="chk"><input type="checkbox" data-k="' + k + '"' + (S.chk[k] ? ' checked' : '') + '>' +
          (t[0] ? '<span class="tm">' + esc(t[0]) + '</span>' : '') + '<span class="tx">' + esc(t[1]) + (t[2] ? '<small>' + esc(t[2]) + '</small>' : '') + '</span></label></li>';
      }).join('') + '</ul></div>';
  }).join('') : '<p class="eempty">Az időterv még készül.</p>';
  if (!ido.napok.length) $('.prog').style.display = 'none';

  /* Bevásárlás */
  var bev = EST.bev || [];
  function fmt(n, u) {
    if (u === 'g' && n >= 1000) return (Math.round(n / 100) / 10 + '').replace('.', ',') + ' kg';
    if (u === 'ml' && n >= 1000) return (Math.round(n / 100) / 10 + '').replace('.', ',') + ' l';
    var v = ['üveg', 'db', 'csomag'].indexOf(u) >= 0 ? Math.ceil(n) : (n >= 100 ? Math.round(n / 10) * 10 : Math.round(n * 10) / 10);
    return (v + '').replace('.', ',') + ' ' + u;
  }
  function qty(t, r) { return t[1] ? fmt(t[3] ? t[1][0] : t[1][0] * r, t[1][1]) : ''; }
  function drawShop() {
    var sid = 0, r = S.g / (EST.vendeg || 1);
    $('#gN').textContent = S.g;
    $('#shop').innerHTML = bev.length ? bev.map(function (g) {
      return '<div class="ebox"><h3>' + esc(g.resz) + '<small>' + g.tetelek.length + ' tétel</small></h3><ul>' + g.tetelek.map(function (t) {
        var k = 'b' + (sid++);
        return '<li class="' + (S.chk[k] ? 'done' : '') + '"><label class="chk"><input type="checkbox" data-k="' + k + '"' + (S.chk[k] ? ' checked' : '') + '><span class="tx">' + esc(t[0]) +
          '<span class="q">' + qty(t, r) + '</span>' + (t[2] ? '<small>' + esc(t[2]) + '</small>' : '') + '</span></label></li>';
      }).join('') + '</ul></div>';
    }).join('') : '<p class="eempty">A bevásárlólista még készül.</p>';
  }
  if (!bev.length) { $('.shopbar').style.display = 'none'; $('#copyBtn').hidden = true; }
  drawShop();

  function counts() {
    var a = document.querySelectorAll('#timeline input'), b = document.querySelectorAll('#shop input');
    var d1 = [].filter.call(a, function (i) { return i.checked; }).length, d2 = [].filter.call(b, function (i) { return i.checked; }).length;
    $('#idoBar').style.width = a.length ? (100 * d1 / a.length) + '%' : '0';
    $('#idoTxt').textContent = d1 + ' / ' + a.length + ' kész';
    $('#nIdo').textContent = a.length ? d1 + '/' + a.length : '';
    $('#nBev').textContent = b.length ? (b.length - d2) : '';
  }
  document.addEventListener('change', function (e) {
    var k = e.target.dataset && e.target.dataset.k; if (!k) return;
    S.chk[k] = e.target.checked; save();
    var li = e.target.closest('li'); if (li && k.charAt(0) === 'b') li.classList.toggle('done', e.target.checked);
    counts();
  });
  counts();
  $('#gMinus').onclick = function () { if (S.g > 1) { S.g--; save(); drawShop(); counts(); } };
  $('#gPlus').onclick = function () { S.g++; save(); drawShop(); counts(); };
  $('#seg').onclick = function (e) {
    var b = e.target.closest('button'); if (!b) return;
    [].forEach.call($('#seg').querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
    $('#shop').classList.toggle('hidedone', b.dataset.f === 'todo');
  };

  /* Receptek */
  var rec = EST.receptek || [], R = window.RECEPTEK || [];
  $('#recs').innerHTML = rec.length ? rec.map(function (r) {
    var hit = r.fajl && R.find(function (x) { return x.fajl === r.fajl + '.html'; });
    if (hit) return '<a class="rc" href="recept.html?r=' + encodeURIComponent(hit.fajl) + '"><div class="ph">' + (hit.kep ? '<img src="receptek/' + encodeURI(hit.kep) + '" alt="" loading="lazy">' : '') + '</div><div class="b"><div class="c">' + esc(hit.kategoria) + '</div><div class="t">' + esc(hit.cim) + '</div><div class="w">' + esc(r.hol || '') + '</div></div></a>';
    return '<div class="rc soon"><div class="ph">Hamarosan</div><div class="b"><div class="c">' + esc(r.kat || '') + '</div><div class="t">' + esc(r.cim) + '</div><div class="w">' + esc(r.hol ? r.hol + ' · ' : '') + 'még nincs megírva</div></div></div>';
  }).join('') : '<p class="eempty">A receptek hamarosan felkerülnek.</p>';

  /* További esték */
  $('#evstrip').innerHTML = (window.ESTEK || []).map(function (e) {
    return '<a class="evchip" href="est.html?e=' + encodeURIComponent(e.id) + '"' + (e.id === META.id ? ' aria-current="page"' : '') + '>' + esc(e.cim) + '</a>';
  }).join('') + '<a class="evchip" href="vacsoraestek.html">Összes est →</a>';

  /* Fülek */
  var tabs = document.querySelectorAll('.etab');
  [].forEach.call(tabs, function (t) {
    t.onclick = function () {
      [].forEach.call(tabs, function (x) { x.setAttribute('aria-selected', x === t); });
      [].forEach.call(document.querySelectorAll('.epanel'), function (p) { p.classList.toggle('on', p.id === 'p-' + t.dataset.t); });
      try { localStorage.setItem(KEY + '-tab', t.dataset.t); } catch (e) {}
    };
  });
  try { var last = localStorage.getItem(KEY + '-tab'); if (last) document.querySelector('.etab[data-t="' + last + '"]').click(); } catch (e) {}

  /* Lista másolása */
  function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('on'); setTimeout(function () { t.classList.remove('on'); }, 1800); }
  $('#copyBtn').onclick = function () {
    var r = S.g / (EST.vendeg || 1), i = 0;
    var txt = META.cim + ' – bevásárlólista (' + S.g + ' fő)\n\n' + bev.map(function (g) {
      var rows = g.tetelek.map(function (t) { var k = 'b' + (i++); if (S.chk[k]) return null; var q = qty(t, r); return '☐ ' + t[0] + (q ? ' – ' + q : ''); }).filter(Boolean);
      return rows.length ? g.resz.toUpperCase() + '\n' + rows.join('\n') : '';
    }).filter(Boolean).join('\n\n');
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { toast('A hiányzó tételek a vágólapon'); }, function () { toast('A másolás itt nem érhető el'); });
    else toast('A másolás itt nem érhető el');
  };
}

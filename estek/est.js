/* Voila by Vivi — vacsoraest megjelenítő. Az est adatai: estek/<azonosító>.js (window.EST)
   Egységes felépítés minden estnél: Menü (+ italajánlás) · Teendők (előző nap + az est napja) · Bevásárlás · Receptek (minden fogáshoz) */
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
  var REC = EST.receptek || [], RID = {};
  REC.forEach(function (r) { RID[r.id] = r; });
  var SITE = window.RECEPTEK || [];

  document.title = META.cim + ' – Vacsoraestek – Voila by Vivi';
  $('#kicker').textContent = EST.kicker || META.jelleg || '';
  $('#title').innerHTML = EST.titleHtml || esc(META.cim);
  $('#sub').textContent = EST.sub || '';
  $('#facts').innerHTML = (EST.facts || []).map(function (f) { return '<li><b>' + esc(f[0]) + '</b>' + esc(f[1]) + '</li>'; }).join('');

  /* ---------- Menü ---------- */
  function dish(d) {
    if (typeof d === 'string') return '<span>' + esc(d) + '</span>';
    var inner = esc(d.n) + (d.alt ? '<em class="dalt">halmentesen: ' + esc(d.alt) + '</em>' : '');
    return d.r && RID[d.r] ? '<span><a class="mlink" href="#r-' + d.r + '" data-r="' + d.r + '">' + inner + '</a></span>' : '<span>' + inner + '</span>';
  }
  $('#menu').innerHTML = '<div class="mt">Menü</div><div class="mh">' + esc(EST.menuCim || META.cim) + '</div>' +
    (EST.fogasok || []).map(function (c) {
      return '<div class="course"><div class="lab">' + (c.ital ? glass : '') + esc(c.cimke) + '</div>' +
        (c.ital ? '<div class="nm">' + esc(c.ital) + '</div>' : '') +
        '<div class="dishes">' + (c.etelek || []).map(dish).join('') + '</div></div>';
    }).join('') + '<p class="mhint">A fogásokra kattintva a recepthez jutsz.</p>';

  var side = '';
  if (EST.italok && EST.italok.length) {
    side += '<div class="ebox"><h3>Italajánlás</h3><ul class="drinks">' + EST.italok.map(function (i) {
      return '<li>' + (i.mihez ? '<span class="dk">' + esc(i.mihez) + '</span>' : '') + '<b>' + esc(i.ital) + '</b>' + (i.megj ? '<small>' + esc(i.megj) + '</small>' : '') + '</li>';
    }).join('') + '</ul>' + (EST.italMegj ? '<p class="enote">' + esc(EST.italMegj) + '</p>' : '') + '</div>';
  }
  (EST.tudnivalok || []).forEach(function (b) {
    side += '<div class="ebox"><h3>' + esc(b.cim) + '</h3><ul>' + b.tetelek.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' + (b.megj ? '<p class="enote">' + esc(b.megj) + '</p>' : '') + '</div>';
  });
  $('#side').innerHTML = side;

  /* ---------- Teendők (2 nap) ---------- */
  var napok = (EST.teendok || []).slice(0, 2), tid = 0;
  $('#timeline').innerHTML = napok.map(function (d, di) {
    return '<div class="day"><div class="dayh"><b>' + (di === 0 ? 'Előző nap' : 'Az est napja') + '</b><span>' + esc(d.cimke || '') + '</span></div><ul class="tl">' +
      d.tetelek.map(function (t) {
        var k = 'i' + (tid++);
        return '<li class="' + (t[3] ? 'key' : '') + '"><label class="chk"><input type="checkbox" data-k="' + k + '"' + (S.chk[k] ? ' checked' : '') + '>' +
          (t[0] ? '<span class="tm">' + esc(t[0]) + '</span>' : '') + '<span class="tx">' + esc(t[1]) + (t[2] ? '<small>' + esc(t[2]) + '</small>' : '') + '</span></label></li>';
      }).join('') + '</ul></div>';
  }).join('');

  /* ---------- Bevásárlás ---------- */
  var bev = EST.bev || [];
  function fmt(n, u) {
    if (u === 'g' && n >= 1000) return (Math.round(n / 100) / 10 + '').replace('.', ',') + ' kg';
    if (u === 'ml' && n >= 1000) return (Math.round(n / 100) / 10 + '').replace('.', ',') + ' l';
    var v = ['üveg', 'db', 'csomag', 'csokor', 'gerezd', 'fej'].indexOf(u) >= 0 ? Math.ceil(n) : (n >= 100 ? Math.round(n / 10) * 10 : Math.round(n * 10) / 10);
    return (v + '').replace('.', ',') + ' ' + u;
  }
  function qty(t, r) { return t[1] ? fmt(t[3] ? t[1][0] : t[1][0] * r, t[1][1]) : ''; }
  function drawShop() {
    var sid = 0, r = S.g / (EST.vendeg || 1);
    $('#gN').textContent = S.g;
    $('#shop').innerHTML = bev.map(function (g) {
      return '<div class="ebox"><h3>' + esc(g.resz) + '<small>' + g.tetelek.length + ' tétel</small></h3><ul>' + g.tetelek.map(function (t) {
        var k = 'b' + (sid++);
        return '<li class="' + (S.chk[k] ? 'done' : '') + '"><label class="chk"><input type="checkbox" data-k="' + k + '"' + (S.chk[k] ? ' checked' : '') + '><span class="tx">' + esc(t[0]) +
          '<span class="q">' + qty(t, r) + '</span>' + (t[2] ? '<small>' + esc(t[2]) + '</small>' : '') + '</span></label></li>';
      }).join('') + '</ul></div>';
    }).join('');
  }
  drawShop();
  if (!bev.some(function (g) { return g.tetelek.some(function (t) { return t[1]; }); })) { $('.guests').style.display = 'none'; [].forEach.call(document.querySelectorAll('.shopbar .enote'), function (n) { n.style.display = 'none'; }); }

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

  /* ---------- Receptek ---------- */
  var groups = [];
  REC.forEach(function (r) { var g = groups.find(function (x) { return x.f === r.fogas; }); if (!g) groups.push(g = { f: r.fogas, l: [] }); g.l.push(r); });
  $('#recs').innerHTML = groups.map(function (g) {
    return '<div class="rgroup"><h3 class="rgh">' + esc(g.f) + '</h3>' + g.l.map(function (r) {
      var site = r.link && SITE.find(function (x) { return x.fajl === r.link + '.html'; });
      var body = '';
      if (r.alap) body += '<p class="ralap">Alap: ' + r.alap.map(function (a) { return RID[a] ? '<a href="#r-' + a + '" data-r="' + a + '">' + esc(RID[a].cim) + '</a>' : esc(a); }).join(', ') + '</p>';
      if (r.hozz && r.hozz.length) body += '<div class="rcols"><div><h4>Hozzávalók</h4><ul class="ring">' + r.hozz.map(function (h) {
        return Array.isArray(h) ? '<li>' + (h[0] ? '<b>' + esc(h[0]) + '</b> ' : '') + esc(h[1]) + (h[2] ? ' <i>(' + esc(h[2]) + ')</i>' : '') + '</li>' : '<li class="rsub">' + esc(h) + '</li>';
      }).join('') + '</ul></div><div><h4>Elkészítés</h4><ol class="rsteps">' + (r.lep || []).map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ol></div></div>';
      if (!(r.hozz && r.hozz.length) && !(r.lep && r.lep.length) && !r.link) body += '<p class="eempty" style="padding:4px 0 0;font-size:18px">A recept hamarosan érkezik.</p>';
      if (r.tipp) body += '<p class="rtip">' + r.tipp + '</p>';
      if (site) body += '<a class="rsite" href="recept.html?r=' + encodeURIComponent(site.fajl) + '">' + (site.kep ? '<img src="receptek/' + encodeURI(site.kep) + '" alt="" loading="lazy">' : '') + '<span><small>A teljes recept a weboldalon</small>' + esc(site.cim) + ' →</span></a>';
      return '<details class="rec" id="r-' + r.id + '"><summary><span class="rt">' + esc(r.cim) + '</span>' + (r.adag ? '<span class="ra">' + esc(r.adag) + '</span>' : (!(r.hozz && r.hozz.length) && !r.link ? '<span class="ra">hamarosan</span>' : '')) + '</summary><div class="rbody">' + body + '</div></details>';
    }).join('') + '</div>';
  }).join('');

  /* ---------- Fülek és ugrás a recepthez ---------- */
  var tabs = document.querySelectorAll('.etab');
  function openTab(t) {
    [].forEach.call(tabs, function (x) { x.setAttribute('aria-selected', x.dataset.t === t); });
    [].forEach.call(document.querySelectorAll('.epanel'), function (p) { p.classList.toggle('on', p.id === 'p-' + t); });
    try { localStorage.setItem(KEY + '-tab', t); } catch (e) {}
  }
  [].forEach.call(tabs, function (t) { t.onclick = function () { openTab(t.dataset.t); }; });
  try { var last = localStorage.getItem(KEY + '-tab'); if (last && document.querySelector('.etab[data-t="' + last + '"]')) openTab(last); } catch (e) {}
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-r]'); if (!a) return;
    e.preventDefault();
    openTab('rec');
    var d = document.getElementById('r-' + a.dataset.r); if (!d) return;
    d.open = true;
    setTimeout(function () { d.scrollIntoView({ behavior: 'smooth', block: 'start' }); d.classList.add('flash'); setTimeout(function () { d.classList.remove('flash'); }, 1600); }, 30);
  });

  /* ---------- További esték ---------- */
  $('#evstrip').innerHTML = (window.ESTEK || []).map(function (e) {
    return '<a class="evchip" href="est.html?e=' + encodeURIComponent(e.id) + '"' + (e.id === META.id ? ' aria-current="page"' : '') + '>' + esc(e.cim) + '</a>';
  }).join('') + '<a class="evchip" href="vacsoraestek.html">Összes est →</a>';

  /* ---------- Lista másolása ---------- */
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
/* nyomtatáskor minden recept nyitva */
window.addEventListener('beforeprint', function () { [].forEach.call(document.querySelectorAll('details.rec'), function (d) { d.open = true; }); });

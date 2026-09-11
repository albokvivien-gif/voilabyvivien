// Voila by Vivi – érdeklődő űrlap beküldése a Supabase-be
(function () {
  var form = document.getElementById('urlapForm');
  if (!form) return;
  var err = document.getElementById('ferr');
  var btn = form.querySelector('button[type=submit]');
  var cfg = window.VV_SUPABASE || {};
  var sb = (cfg.url && cfg.anonKey && window.supabase) ? window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: false } }) : null;

  // Az oldal megnyitása egyben "életjel" a Supabase-nek (az ingyenes projekt így nem alszik el).
  if (sb) { sb.rpc('ping').then(function () {}, function () {}); }

  function hiba(uzenet) {
    err.textContent = uzenet;
    err.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Üzenet küldése';
  }

  function ertek(nev) { var el = form.elements[nev]; return el && el.value ? el.value.trim() : ''; }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    err.hidden = true;
    if (ertek('bot-field')) { location.href = 'koszonjuk.html'; return; }   // spam-csapda
    if (!sb) { hiba('Az űrlap még nincs bekötve. Kérlek, írj Instagramon: @voila.by.vivi'); return; }

    btn.disabled = true;
    btn.textContent = 'Küldés…';
    try {
      var kepUt = null;
      var fajl = form.elements['kep'] && form.elements['kep'].files[0];
      if (fajl) {
        if (fajl.size > 8 * 1024 * 1024) { hiba('A kép legfeljebb 8 MB lehet. Kérlek, válassz kisebbet, vagy küldd el kép nélkül.'); return; }
        var kiterj = (fajl.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'jpg';
        kepUt = new Date().toISOString().slice(0, 10) + '/' + (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2)) + '.' + kiterj;
        var fel = await sb.storage.from('inspiracio').upload(kepUt, fajl, { contentType: fajl.type || 'image/' + kiterj, upsert: false });
        if (fel.error) throw fel.error;
      }
      var desszertek = Array.prototype.map.call(form.querySelectorAll('.picks input:checked'), function (c) {
        return c.parentNode.querySelector('span').textContent.trim();
      });
      var sor = {
        nev: ertek('nev'),
        email: ertek('email'),
        telefon: ertek('telefon') || null,
        alkalom: ertek('alkalom') || null,
        datum: ertek('datum') || null,
        letszam: ertek('letszam') ? parseInt(ertek('letszam'), 10) : null,
        desszertek: desszertek,
        uzenet: ertek('uzenet'),
        kep: kepUt,
        hozzajarulas: form.elements['adatkezeles'].checked
      };
      var be = await sb.from('erdeklodesek').insert(sor);
      if (be.error) throw be.error;
      location.href = 'koszonjuk.html';
    } catch (x) {
      if (window.console) console.error(x);
      hiba('Nem sikerült elküldeni az üzenetet. Kérlek, próbáld újra pár perc múlva, vagy írj Instagramon: @voila.by.vivi');
    }
  });
})();

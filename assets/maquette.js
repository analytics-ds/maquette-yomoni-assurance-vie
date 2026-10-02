(function () {
  // Taux : performance annualisée depuis lancement, AV Yomoni Vie gestion classique, au 25/09/2026
  var RATES = [2.1, 2.7, 3.1, 3.5, 3.8, 4.0, 5.1, 6.3, 7.3, 9.3];
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return Math.round(n).toLocaleString('fr-FR').replace(/ /g, ' ') + ' €'; };
  var num = function (el) { return parseInt(String(el.value).replace(/\D/g, ''), 10) || 0; };

  function paintRange(el) {
    var p = (el.value - el.min) / (el.max - el.min) * 100;
    el.style.setProperty('--p', p + '%');
  }

  function sim() {
    if (!$('s-init')) return;
    var init = num($('s-init')), mens = num($('s-mens'));
    var years = +$('s-duree').value, prof = +$('s-prof').value;
    var r = RATES[prof - 1] / 100, rm = Math.pow(1 + r, 1 / 12) - 1;
    $('o-duree').textContent = years + (years > 1 ? ' ans' : ' an');
    $('r-years').textContent = $('o-duree').textContent;
    $('o-prof').textContent = 'Profil ' + prof;
    $('o-rate').textContent = 'Performance annualisée du profil ' + prof + ' depuis son lancement : +' + RATES[prof - 1].toString().replace('.', ',') + ' % par an, nette de frais.';
    var cap = init, vers = init, ptsC = [cap], ptsV = [vers];
    for (var m = 1; m <= years * 12; m++) {
      cap = cap * (1 + rm) + mens; vers += mens;
      if (m % 12 === 0) { ptsC.push(cap); ptsV.push(vers); }
    }
    $('r-cap').textContent = fmt(cap);
    $('r-vers').textContent = fmt(vers);
    $('r-gain').textContent = fmt(cap - vers);
    draw(ptsV, ptsC, years);
    ['s-duree', 's-prof'].forEach(function (i) { paintRange($(i)); });
  }

  function draw(v, c, years) {
    var W = 600, H = 280, pl = 8, pr = 8, pt = 16, pb = 28;
    var max = Math.max.apply(null, c) * 1.08 || 1;
    var x = function (i) { return pl + i * (W - pl - pr) / Math.max(1, v.length - 1); };
    var y = function (val) { return pt + (H - pt - pb) * (1 - val / max); };
    var area = function (arr) {
      var d = 'M' + x(0) + ' ' + y(0);
      arr.forEach(function (val, i) { d += ' L' + x(i) + ' ' + y(val); });
      return d + ' L' + x(arr.length - 1) + ' ' + y(0) + ' Z';
    };
    var line = function (arr) { return arr.map(function (val, i) { return (i ? 'L' : 'M') + x(i) + ' ' + y(val); }).join(' '); };
    var grid = '';
    for (var g = 1; g <= 4; g++) { var gy = pt + (H - pt - pb) * g / 4; grid += '<line x1="0" x2="' + W + '" y1="' + gy + '" y2="' + gy + '" stroke="#f0e5dc"/>'; }
    var labels = '<text x="' + pl + '" y="' + (H - 6) + '" font-size="12" fill="#524b47">Aujourd\'hui</text>' +
      '<text x="' + (W - pr) + '" y="' + (H - 6) + '" font-size="12" fill="#524b47" text-anchor="end">Dans ' + years + (years > 1 ? ' ans' : ' an') + '</text>';
    $('r-chart').innerHTML = '<defs><linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b68568" stop-opacity=".9"/><stop offset="1" stop-color="#b68568" stop-opacity=".25"/></linearGradient></defs>' +
      grid + '<path d="' + area(c) + '" fill="url(#gC)"/><path d="' + line(c) + '" fill="none" stroke="#3c2619" stroke-width="2"/>' +
      '<path d="' + area(v) + '" fill="#e7d6cb" opacity=".95"/>' + labels;
  }

  function money(el) {
    el.addEventListener('input', function () {
      var n = num(el); el.value = n ? n.toLocaleString('fr-FR').replace(/ /g, ' ') : ''; sim();
    });
  }

  function toc() {
    var list = $('dsk-toc'); if (!list) return;
    var hs = document.querySelectorAll('.dsk-art h3[id]');
    hs.forEach(function (h) {
      var li = document.createElement('li'); var a = document.createElement('a');
      a.href = '#' + h.id; a.textContent = h.textContent; li.appendChild(a); list.appendChild(li);
    });
    var links = list.querySelectorAll('a');
    window.addEventListener('scroll', function () {
      var cur = -1;
      hs.forEach(function (h, i) { if (h.getBoundingClientRect().top < 140) cur = i; });
      links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if ($('s-init')) {
      money($('s-init')); money($('s-mens'));
      ['s-duree', 's-prof'].forEach(function (i) { $(i).addEventListener('input', sim); });
      sim();
    }
    toc();
    var t = $('dsk-toggle');
    if (t) t.addEventListener('click', function () {
      var hide = document.body.classList.toggle('dsk-hide-tags');
      t.textContent = hide ? 'Afficher les annotations' : 'Masquer les annotations';
    });
    // Liens "Simuler mon projet" de la page : renvoient vers le simulateur intégré
    document.querySelectorAll('main a[href*="souscription.yomoni.fr/projet"]').forEach(function (a) {
      if (!a.closest('.dsk')) a.setAttribute('href', '#simulateur');
    });
  });
})();

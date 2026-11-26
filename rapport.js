(function () {
  var lignes = Array.prototype.slice.call(document.querySelectorAll('table.constats tbody tr'));
  var corps = document.querySelector('table.constats tbody');
  var compte = document.getElementById('compte');
  var champRecherche = document.getElementById('recherche');
  function filtrer() {
    var g = Array.prototype.slice.call(document.querySelectorAll('input[name=gravite]:checked')).map(function (c) { return c.value; });
    var dom = document.getElementById('domaine').value;
    var q = champRecherche ? champRecherche.value.trim().toLowerCase() : '';
    var n = 0;
    lignes.forEach(function (l) {
      var texte = q ? l.textContent.toLowerCase() : '';
      var vis = g.indexOf(l.dataset.gravite) >= 0 && (!dom || l.dataset.domaine === dom) && (!q || texte.indexOf(q) >= 0);
      l.hidden = !vis; if (vis) { n++; }
    });
    compte.textContent = n + ' constat(s) affiché(s) sur ' + lignes.length;
  }
  document.querySelectorAll('input[name=gravite], #domaine').forEach(function (el) { el.addEventListener('change', filtrer); });
  if (champRecherche) { champRecherche.addEventListener('input', filtrer); }
  document.querySelectorAll('th button[data-tri]').forEach(function (b) {
    b.addEventListener('click', function () {
      var th = b.parentNode, cle = b.dataset.tri;
      var sens = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
      document.querySelectorAll('table.constats th').forEach(function (t) { t.removeAttribute('aria-sort'); });
      th.setAttribute('aria-sort', sens);
      var f = sens === 'ascending' ? 1 : -1;
      lignes.sort(function (a, c) {
        var x = a.dataset[cle], y = c.dataset[cle];
        if (cle === 'ordre' || cle === 'nombre') { return (Number(x) - Number(y)) * f || Number(a.dataset.ordre) - Number(c.dataset.ordre); }
        return x.localeCompare(y, 'fr') * f || Number(a.dataset.ordre) - Number(c.dataset.ordre);
      });
      lignes.forEach(function (l) { corps.appendChild(l); });
    });
  });
  document.querySelectorAll('.champ').forEach(function (c) {
    c.setAttribute('role', 'textbox');
    c.setAttribute('tabindex', '0');
    var etiquette = c.closest('dd') ? 'Effort estimé' : 'Budget';
    c.setAttribute('aria-label', etiquette + ' (à remplir)');
  });
  var details = Array.prototype.slice.call(document.querySelectorAll('main details'));
  var tout = document.getElementById('tout');
  tout.addEventListener('click', function () {
    var ouvrir = details.every(function (d) { return !d.open; });
    details.forEach(function (d) { d.open = ouvrir; });
    tout.textContent = ouvrir ? 'Tout replier' : 'Tout déplier';
  });
  document.querySelectorAll('.nav-sec a, .liste-sommaire a').forEach(function (lien) {
    lien.addEventListener('click', function () {
      var id = lien.getAttribute('href');
      if (id && id.charAt(0) === '#') {
        var sec = document.querySelector(id + ' details');
        if (sec) { sec.open = true; }
      }
    });
  });
  var etatAvant = [];
  window.addEventListener('beforeprint', function () { etatAvant = details.map(function (d) { return d.open; }); details.forEach(function (d) { d.open = true; }); });
  window.addEventListener('afterprint', function () { details.forEach(function (d, i) { d.open = etatAvant[i]; }); });
  document.getElementById('imprimer').addEventListener('click', function () { window.print(); });
  filtrer();
})();
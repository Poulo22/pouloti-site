(function () {
  document.documentElement.classList.add('js-actif');

  // 1. En-tête collant et menu mobile accessible
  var entete = document.getElementById('entete');
  var menuBouton = document.getElementById('menu-bouton');
  var navZone = document.getElementById('nav-zone');

  function fermerMenu() {
    if (!menuBouton || !navZone) return;
    menuBouton.setAttribute('aria-expanded', 'false');
    navZone.classList.remove('ouvert');
  }

  if (menuBouton && navZone) {
    menuBouton.addEventListener('click', function () {
      var ouvert = menuBouton.getAttribute('aria-expanded') === 'true';
      menuBouton.setAttribute('aria-expanded', ouvert ? 'false' : 'true');
      navZone.classList.toggle('ouvert', !ouvert);
    });
    navZone.querySelectorAll('a').forEach(function (lien) {
      lien.addEventListener('click', fermerMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fermerMenu();
    });
  }

  if (entete) {
    window.addEventListener('scroll', function () {
      entete.classList.toggle('haut-defile', window.scrollY > 12);
    }, { passive: true });
  }

  // 2. Apparition fluide des sections (IntersectionObserver)
  var aReveler = document.querySelectorAll('.reveler');
  if ('IntersectionObserver' in window && aReveler.length > 0) {
    var obsReveler = new IntersectionObserver(function (entrees, obs) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          entree.target.classList.add('visible');
          obs.unobserve(entree.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    aReveler.forEach(function (el) { obsReveler.observe(el); });
  } else {
    aReveler.forEach(function (el) { el.classList.add('visible'); });
  }

  // 3. Indicateur de section active dans la navigation (scrollspy)
  var liensNav = document.querySelectorAll('nav a[href^="#"]');
  if ('IntersectionObserver' in window && liensNav.length > 0) {
    var carteLiens = {};
    var sectionsSuivies = [];
    liensNav.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec) {
        carteLiens[id] = a;
        sectionsSuivies.push(sec);
      }
    });
    var obsNav = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          liensNav.forEach(function (l) { l.removeAttribute('data-actif'); });
          var lienActif = carteLiens[entree.target.id];
          if (lienActif) lienActif.setAttribute('data-actif', 'true');
        }
      });
    }, { rootMargin: '-28% 0px -58% 0px' });
    sectionsSuivies.forEach(function (s) { obsNav.observe(s); });
  }

  // 4. Présélection interactive du besoin depuis les cartes de forfaits
  var champBesoin = document.getElementById('besoin');
  var champNom = document.getElementById('nom');
  document.querySelectorAll('[data-choisir-besoin]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var valeur = btn.getAttribute('data-choisir-besoin');
      if (champBesoin && valeur) {
        for (var i = 0; i < champBesoin.options.length; i++) {
          if (champBesoin.options[i].text === valeur) {
            champBesoin.selectedIndex = i;
            break;
          }
        }
      }
      setTimeout(function () {
        if (champNom) champNom.focus({ preventScroll: true });
      }, 350);
    });
  });

  // 5. Envoi asynchrone du formulaire (Formspree + pot de miel anti-pourriel)
  var form = document.getElementById('formulaire');
  var message = document.getElementById('message');
  var bouton = document.getElementById('bouton-envoi');
  if (!form || !message) return;
  form.noValidate = true;

  function afficherErreurEnvoi() {
    message.className = 'message erreur';
    message.textContent = '';
    message.appendChild(document.createTextNode('L’envoi a échoué. Écrivez-moi directement à '));
    var lien = document.createElement('a');
    lien.href = 'mailto:daouda.sow@pouloti.com';
    lien.textContent = 'daouda.sow@pouloti.com';
    message.appendChild(lien);
    message.appendChild(document.createTextNode('.'));
  }

  form.addEventListener('submit', function (evt) {
    evt.preventDefault();
    message.className = 'message';
    message.textContent = '';

    var pot = document.getElementById('site_web');
    if (pot && pot.value.trim() !== '') {
      message.className = 'message erreur';
      message.textContent = 'Envoi refusé par le filtre anti-pourriel.';
      return;
    }

    var champs = ['nom', 'organisation', 'courriel', 'employes'];
    for (var i = 0; i < champs.length; i++) {
      var el = document.getElementById(champs[i]);
      if (!el || !el.value.trim() || (el.type === 'email' && !el.checkValidity())) {
        message.className = 'message erreur';
        var etiquette = document.querySelector('label[for="' + champs[i] + '"]');
        message.textContent = 'Veuillez remplir le champ « ' + (etiquette ? etiquette.textContent : champs[i]) + ' ».';
        if (el) el.focus();
        return;
      }
    }

    var urlAction = (form.getAttribute('action') || '').trim();
    if (!urlAction) {
      afficherErreurEnvoi();
      return;
    }

    if (bouton) bouton.disabled = true;
    fetch(urlAction, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function (reponse) {
      if (bouton) bouton.disabled = false;
      if (reponse.ok) {
        form.reset();
        message.className = 'message succes';
        message.textContent = 'Merci, je vous réponds sous 1 jour ouvrable.';
      } else {
        afficherErreurEnvoi();
      }
    }).catch(function () {
      if (bouton) bouton.disabled = false;
      afficherErreurEnvoi();
    });
  });
})();

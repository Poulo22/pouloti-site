(function () {
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
    if (!urlAction || urlAction.indexOf('VOTRE_ID_FORMSPREE') !== -1) {
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

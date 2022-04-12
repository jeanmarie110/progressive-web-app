(function (window) {
  'use strict';

  var bgSyncTextElement = document.querySelector('.bg-sync__text');
  var bgSyncElement = document.querySelector('.custom__button-bg');
  var bgSyncBtnElement = document.querySelector('.turn-on-sync');

  bgSyncBtnElement.addEventListener('click', function () {
    window.registerBGSync();
  });

 //Pour enregistrer `BG Sync` et vérifier la prise en charge de la 'notification push'
  //Exposer `registerSync()` globalement à des fins de développement uniquement
  window.registerBGSync = function() {
    //Si `serviceWorker` est enregistré et prêt
    navigator.serviceWorker.ready
      .then(function (registration) {
       //Enregistrement de l'événement `synchronisation en arrière-plan`
        return registration.sync.register('github') //`github` est le nom de la balise de synchronisation
          .then(function (rs) {
            console.info('Background sync registered!');
            bgSyncElement.classList.add('hide');
            bgSyncTextElement.removeAttribute('hidden'); //Afficher le texte enregistré à l'utilisateur
          }, function () {
            console.error('Background sync registered failed.');
          });

      });
  }
})(window);

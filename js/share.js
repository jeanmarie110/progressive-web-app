(function () {
  'use strict';
   // Vérifiez si l'API de partage est prise en charge ou non
   if (navigator.share !== undefined) {
    document.addEventListener('DOMContentLoaded', function() {
      var shareBtn = document.querySelector('.share');
       //Partager l'écouteur d'événement du bouton
       shareBtn.addEventListener('click', function(event) {
         // API de partage Web
        navigator.share({
          title: document.title,
          text: "Un pwa simple qui fonctionne hors ligne, s'ajoute à l'écran d'accueil et dispose d'un écran de démarrage, de notifications push, de synchronisation bg, etc",
          url: window.location.href
        })
        .then(function() {
          console.info('Shared successfully.');
        })
        .catch(function (error) {
          console.error('Error in sharing: ', error);
        })
      });
    });
  }
})();
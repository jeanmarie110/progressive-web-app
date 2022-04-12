(function () {
  // Si serviceWorker prend en charge, enregistrez-le.
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register('./serviceWorker.js', { scope: "./" })  //définition de la portée de sw
    .then(function(registration) {
      console.info('Service worker is registered!');
      checkForPageUpdate(registration); // Pour vérifier si le nouveau contenu est mis à jour ou non
    })
    .catch(function(error) {
      console.error('Service worker failed ', error);
    });
  }

 // Pour mettre à jour le contenu lors du changement d'état du service worker
  function checkForPageUpdate(registration) {
    // onupdatefound se déclenchera lors de la première installation et lorsque le fichier serviceWorker.js changera        
    registration.addEventListener("updatefound", function() {
        // Pour vérifier si le service worker est déjà installé et contrôle la page ou non
      if (navigator.serviceWorker.controller) {
        var installingSW = registration.installing;
        installingSW.onstatechange = function() {
          console.info("Service Worker State :", installingSW.state);
          switch(installingSW.state) {
            case 'installed':
             // Maintenant, de nouveaux contenus seront ajoutés au cache et les anciens contenus seront supprimés afin
              // c'est le moment idéal pour montrer à l'utilisateur que le contenu de la page est mis à jour.
              toast('Site is updated. Refresh the page.', 5000);
              break;
            case 'redundant':
              throw new Error('The installing service worker became redundant.');
          }
        }
      }
    });
  }
})();

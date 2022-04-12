//Cache polyfil pour prendre en charge cacheAPI dans tous les navigateurs
importScripts('./cache-polyfill.js');

var cacheName = 'cache-v4';

//Fichiers à sauvegarder en cache
var files = [
  './',
  './index.html?utm=homescreen', //SW traite la chaîne de requête comme une nouvelle requête
  'https://fonts.googleapis.com/css?family=Roboto:200,300,400,500,700', //mise en cache du contenu tiers
  './images/icons/android-chrome-192x192.png',
  './images/push-on.png',
  './images/push-off.png',
  './images/icons/favicon-16x16.png',
  './images/icons/favicon-32x32.png',
  './js/main.js',
  './js/app.js',
  './js/offline.js',
  './js/push.js',
  './js/sync.js',
  './js/toast.js',
  './js/share.js',
  './js/menu.js',
  './manifest.json'
];

//Ajout de l'écouteur d'événement `install`
self.addEventListener('install', (event) => {
  console.info('Event: Install');

  event.waitUntil(
    caches.open(cacheName)
    .then((cache) => {
      //[] des fichiers à mettre en cache et si l'un des fichiers n'est pas présent, `addAll` échouera
      return cache.addAll(files)
      .then(() => {
        console.info('All files are cached');
        return self.skipWaiting();//Pour forcer le service worker en attente à devenir le service worker actif
      })
      .catch((error) =>  {
        console.error('Failed to cache', error);
      })
    })
  );
});

/*
  FETCH EVENT : déclenché pour chaque requête effectuée par la page d'index, après l'installation.
*/


//Ajout de l'écouteur d'événement `fetch`
self.addEventListener('fetch', (event) => {
  console.info('Event: Fetch');

  var request = event.request;
  var url = new URL(request.url);
  if (url.origin === location.origin) {
    // Cache des fichiers statiques
    event.respondWith(cacheFirst(request));
  } else {
      // Cache d'API dynamique
    event.respondWith(networkFirst(request));
  }

  // // Vérification de la réponse de préchargement de la navigation
  // si (event.preloadResponse) {
  // console.info('Utilisation du préchargement de la navigation');
  // renvoie la réponse ;
  // }
});

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  return cachedResponse || fetch(request);
}

async function networkFirst(request) {
  const dynamicCache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    // Cache la réponse dynamique de l'API
    dynamicCache.put(request, networkResponse.clone()).catch((err) => {
      console.warn(request.url + ': ' + err.message);
    });
    return networkResponse;
  } catch (err) {
    const cachedResponse = await dynamicCache.match(request);
    return cachedResponse;
  }
}

/*
  ÉVÉNEMENT ACTIVÉ : déclenché une fois après l'enregistrement, également utilisé pour nettoyer les caches.
*/


//Ajout de l'écouteur d'événement `activate`
self.addEventListener('activate', (event) => {
  console.info('Event: Activate');
  // Le préchargement de la navigation nous aide à faire une demande parallèle pendant le démarrage du service worker.
  //Activer - chrome://flags/#enable-service-worker-navigation-preload
  //Support - Chrome 57 beta (derrière le drapeau)
  //Plus d'informations - https://developers.google.com/web/updates/2017/02/navigation-preload#the-problem

  // Vérifie si navigationPreload est supporté ou non
  // if (self.registration.navigationPreload) { 
  //   self.registration.navigationPreload.enable();
  // }
  // else if (!self.registration.navigationPreload) { 
  //   console.info('Your browser does not support navigation preload.');
  // }

  //Suppression des caches anciens et indésirables
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== cacheName) {
            return caches.delete(cache); //Suppression de l'ancien cache (cache v1)
          }
        })
      );
    })
    .then(function () {
      console.info("Old caches are cleared!");
     // Pour dire au service worker d'activer celui en cours
      // au lieu d'attendre que l'ancien se termine.
      return self.clients.claim(); 
    }) 
  );
});

/*
  ÉVÉNEMENT PUSH : déclenché à chaque fois, lorsqu'une notification push est reçue.
*/

//Ajout d'un écouteur d'événement `push`
self.addEventListener('push', (event) => {
  console.info('Event: Push');

  var title = 'Push notification demo';
  var body = {
    'body': 'click to return to application',
    'tag': 'demo',
    'icon': './images/icons/apple-touch-icon.png',
    'badge': './images/icons/apple-touch-icon.png',
      //Boutons d'actions personnalisées
    'actions': [
      { 'action': 'yes', 'title': 'I ♥ this app!'},
      { 'action': 'no', 'title': 'I don\'t like this app'}
    ]
  };

  event.waitUntil(self.registration.showNotification(title, body));
});


/*
  ÉVÉNEMENT DE SYNCHRONISATION EN ARRIÈRE-PLAN : se déclenche après l'enregistrement de `bg sync` et la page dispose d'une connexion réseau.
  Il essaiera de récupérer le nom d'utilisateur github, s'il est satisfait, la synchronisation est terminée. S'il échoue,
  une autre synchronisation est programmée pour réessayer (attendra également la connexion réseau)
*/

self.addEventListener('sync', (event) => {
  console.info('Event: Sync');

 // Vérifier le nom de synchronisation enregistré ou la synchronisation émulée à partir de devTools
  if (event.tag === 'github' || event.tag === 'test-tag-from-devtools') {
    event.waitUntil(
// Pour vérifier tous les onglets ouverts et envoyer postMessage à ces onglets
      self.clients.matchAll().then((all) => {
        return all.map((client) => {
          return client.postMessage('online');  // Pour faire une demande de récupération, vérifiez app.js - ligne no : 122
        })
      })
      .catch((error) => {
        console.error(error);
      })
    );
  }
});

/*
  ÉVÉNEMENT DE NOTIFICATION : déclenché lorsque l'utilisateur clique sur la notification.
*/

//Ajout de l'écouteur d'événement de clic `notification`
self.addEventListener('notificationclick', (event) => {
  var url = 'https://demopwa.in/';

   //Écoutez les boutons d'action personnalisés dans la notification push

  if (event.action === 'yes') {
    console.log('I ♥ this app!');
  }
  else if (event.action === 'no') {
    console.warn('I don\'t like this app');
  }

  event.notification.close(); //Ferme la notification
  
  //Pour ouvrir l'application après avoir cliqué sur la notification
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    })
    .then((clients) => {
      for (var i = 0; i < clients.length; i++) {
        var client = clients[i];
        // Si le site est ouvert, focus sur le site
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      //Si le site ne peut pas être ouvert, ouvrir dans une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
    .catch((error) => {
      console.error(error);
    })
  );
});

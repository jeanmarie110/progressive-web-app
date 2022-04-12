(function (window) {
  'use strict';

  // Bouton de notification push
 var fabPushElement = document.querySelector('.fab__push');
  var fabPushImgElement = document.querySelector('.fab__image');
  
 //Pour vérifier que la `notification push` est prise en charge ou non
 function isPushSupported() {
     //Pour vérifier l'autorisation de `notification push` est refusée par l'utilisateur
     if (Notification.permission === 'denied') {
      console.warn('User has blocked push notification.');
      return;
    }

   // Vérifier que la `notification push` est prise en charge ou non
   if (!('PushManager' in window)) {
      console.error('Push notification isn\'t supported in your browser.');
      return;
    }
  //Obtenir l'abonnement à la "notification push"
    //Si `serviceWorker` est enregistré et prêt
    navigator.serviceWorker.ready
      .then(function (registration) {
        registration.pushManager.getSubscription()
        .then(function (subscription) {
         // Si l'accès est déjà accordé, activez l'état du bouton-poussoir
          if (subscription) {
            changePushStatus(true);
          }
          else {
            changePushStatus(false);
          }
        })
        .catch(function (error) {
          console.error('Error occurred while enabling push ', error);
        });
      });
  }

  //Pour s'abonner à la `notification push`
  function subscribePush() {
    navigator.serviceWorker.ready.then(function(registration) {
      if (!registration.pushManager) {
        alert('Your browser doesn\'t support push notification.');
        return false;
      }

       //Pour s'abonner à la "notification push" du gestionnaire de push
      registration.pushManager.subscribe({
        userVisibleOnly: true//Toujours afficher la notification lorsqu'elle est reçue
      })
      .then(function (subscription) {
        toast('Subscribed successfully.');
        console.info('Push notification subscribed.');
        changePushStatus(true);
        sendPushNotification();
      })
      .catch(function (error) {
        changePushStatus(false);
        console.error('Push notification subscription error: ', error);
      });
    })
  }

  //Pour se désinscrire `notification push`
  function unsubscribePush() {
    navigator.serviceWorker.ready
    .then(function(registration) {
       //Obtenir `push abonnement`
      registration.pushManager.getSubscription()
      .then(function (subscription) {
          // S'il n'y a pas de `push subscription`, alors retourne
        if(!subscription) {
          console.error('Unable to unregister push notification.');
          return;
        }

       //Désinscription `notification push`
        subscription.unsubscribe()
          .then(function () {
            toast('Unsubscribed successfully.');
            console.info('Push notification unsubscribed.');
            changePushStatus(false);
          })
          .catch(function (error) {
            console.error(error);
          });
      })
      .catch(function (error) {
        console.error('Failed to unsubscribe push notification.');
      });
    })
  }

 //Pour changer de statut
  function changePushStatus(status) {
    fabPushElement.dataset.checked = status;
    fabPushElement.checked = status;
    if (status) {
      fabPushElement.classList.add('active');
      fabPushImgElement.src = '../images/push-on.png';
    }
    else {
     fabPushElement.classList.remove('active');
     fabPushImgElement.src = '../images/push-off.png';
    }
  }

  //Cliquez sur l'événement pour la poussée d'abonnement
  fabPushElement.addEventListener('click', function () {
    var isSubscribed = (fabPushElement.dataset.checked === 'true');
    if (isSubscribed) {
      unsubscribePush();
    }
    else {
      subscribePush();
    }
  });

  //Données du formulaire avec les informations à envoyer au serveur
  function sendPushNotification() {
    navigator.serviceWorker.ready
      .then(function(registration) {
         //Obtenir `push abonnement`
        registration.pushManager.getSubscription().then(function (subscription) {
           //Envoyer `push notification` - source pour l'url ci-dessous `server.js`
          fetch('https://progressive-web-application.herokuapp.com/send_notification', {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription)
          })
          .then(function(response) {
            return response.json();
          })
        })
      })
  }

  isPushSupported(); //Vérifier la prise en charge des notifications push
})(window);

(function () {
  'use strict';

  var cardElement = document.querySelector('.card');
  var addCardBtnElement = document.querySelector('.add__btn');
  var addCardInputElement = document.querySelector('.add__input');
  var spinnerElement = document.querySelector('.card__spinner');
  var bgSyncTextElement = document.querySelector('.bg-sync__text');
  var bgSyncElement = document.querySelector('.custom__button-bg');

  //Ajouter les données utilisateur github à la carte
  function addGitUserCard() {
    var userInput = addCardInputElement.value;
    if (userInput === '') return;
    addCardInputElement.value = '';
    localStorage.setItem('request', userInput);
    fetchGitUserInfo(userInput);
  }
  //Ajouter un événement de clic de carte
  addCardBtnElement.addEventListener('click', addGitUserCard, false);
 
 //Pour obtenir les données utilisateur github via `Fetch API`
  function fetchGitUserInfo(username, requestFromBGSync) {
    var name = username || 'grafikart';
    var url = 'https://api.github.com/users/' + name;

    spinnerElement.classList.add('show'); // afficher la roulette


    fetch(url, { method: 'GET' })
    .then(function(fetchResponse){ return fetchResponse.json() })
      .then(function(response) {
        if (!requestFromBGSync) {
          localStorage.removeItem('request'); // Une fois l'API réussie, supprimez les données de la demande de localStorage
        }
        cardElement.querySelector('.card__title').textContent = response.name;
        cardElement.querySelector('.card__desc').textContent = response.bio;
        cardElement.querySelector('.card__img').setAttribute('src', response.avatar_url);
        cardElement.querySelector('.card__following span').textContent = response.following;
        cardElement.querySelector('.card__followers span').textContent = response.followers;
        cardElement.querySelector('.card__temp span').textContent = response.company;
        spinnerElement.classList.remove('show');  //cacher la roulette
      } )
      .catch(function (error) {
        // Si l'utilisateur est hors ligne et a envoyé une demande, stockez-la dans localStorage
        // Une fois que l'utilisateur est en ligne, déclenchez la récupération de la synchronisation bg à partir de l'onglet de l'application pour effectuer la demande ayant échoué

        localStorage.setItem('request', name);
        spinnerElement.classList.remove('show'); //cacher la roulette
        console.error(error);
      });
  }

  fetchGitUserInfo(localStorage.getItem('request')); // Récupérer les données des utilisateurs de github

  // Écoutez postMessage lorsque la `synchronisation en arrière-plan` est déclenchée
  navigator.serviceWorker.addEventListener('message', function (event) {
    console.info('From background sync: ', event.data);
    fetchGitUserInfo(localStorage.getItem('request'), true);
    bgSyncElement.classList.remove('hide'); // Une fois l'événement de synchronisation déclenché, affichez le bouton bascule de registre
    bgSyncTextElement.setAttribute('hidden', true);  // Une fois l'événement de synchronisation déclenché, supprimez l'étiquette enregistréel
  });
})();

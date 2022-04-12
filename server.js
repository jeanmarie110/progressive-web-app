'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var gcm = require('node-gcm');
var app = express();
const https = require('https');
const fs = require('fs');

// Ici, nous configurons express pour utiliser body-parser comme middleware.

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Vers les ressources statiques du serveur dans le répertoire racine
app.use(express.static(__dirname));

//Pour autoriser la demande d'origine croisée
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

//Vers la page index.html du serveur
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

//Pour recevoir une requête push du client
app.post('/send_notification', function (req, res) {
  if (!req.body) {
    res.status(400);
  }

  var message = new gcm.Message();
  var temp = req.body.endpoint.split('/');
  var regTokens = [temp[temp.length - 1]];

  var sender = new gcm.Sender('AIzaSyCjrU5SqotSg2ybDLK_7rMMt9Rv0dMusvY'); //Remplacer par votre clé API GCM


  // Maintenant, l'expéditeur peut être utilisé pour envoyer des messages
  sender.send(message, { registrationTokens: regTokens }, function (error, response) {
  	if (error) {
      console.error(error);
      res.status(400);
    }
  	else {
     	console.log(response);
      res.status(200);
    }
  });
});

app.listen(process.env.PORT || 4500, function() {
  console.log('Local Server : http://localhost:4500');
});

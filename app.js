"use strict";

// Disable email system
var justContinue = true; // Put to false if you want to skip sending emails at the moment.
/* DO NOT EDIT ANYTHING BEYOND THIS POINT - unless you know what you are doing ;) */

// Requirements of Modules
//  Trello module
var Trello = require("node-trello");
var async = require("async");
var nodemailer = require("nodemailer");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mailnotifiersForTrello');

// Loading config
var config = require('./config/config');

// Notifier Schema for mails
var NotifierSchema = new mongoose.Schema({
  project: String,
  email: String,
  board: String,
  lists: [{ list: 'string' }],
  updated_at: { type: Date, default: Date.now }
});

// Setting the Schema as a Model in Mongoose
var Notifier = mongoose.model('Notifier', NotifierSchema);

//  Making the "t" object (this object access the api at trello) (based on Trello module) - with token key and secret key from Trello
var t = new Trello(config.trelloApplicationKey, config.trelloUserToken);

// Creating a transporter for sending mails through nodemailer
var transporter = nodemailer.createTransport(config.settingsForTransporter);

// This is for understanding aliens when they try to communicate with you.
app.use(bodyParser.urlencoded({ extended: false }));

// Same goes for the JSON aliens
app.use(bodyParser.json());

// Using our static client front-end system (look at index.html and scripts.js for more info about this)
app.use(express.static('./client'));

// Requiring the controller of notifier and including the app and Notifier model.
require('./controller/notifier')(app, null, Notifier);

// Requiring the controller of mailer.
var mailer = require('./controller/mailer');

// Get request of getting all boards owned by user at trello.
app.get("/getBoards", function (req, res) {
  // Creating a Board class.
  var Board = function(id, name){
    this.id = id;
    this.name = name;
  };

  // Array of Boards
  var boardArray = [];

  // init counter and boardSize
  var counter = 0;
  var boardSize = 0;

  // Get all board ids out
  t.get("/1/members/me", function (err, data) {
    if (err) {
       throw err;
    }

    // Setting the boardSize to the length of all boards
    boardSize = data.idBoards.length;

    // forEach on each board of all boards accessable by user
    data.idBoards.forEach(function (aBoard){

      // Setting the boardPath to /1/boards/aBoard (aBoard is a id of one of all boards)
      // The purpose of this function is to get all names of all boards and put it into a array, and send this array back
      // to the client end
      var boardPath = "/1/boards/" + aBoard;
        t.get(boardPath, function(err, theBoard) {
          counter++;
              if (err) throw err;
              var currentBoard = new Board(theBoard.id, theBoard.name);
              boardArray.push(currentBoard);
              if(counter === boardSize){
                res.send(boardArray);
              }
        });
      }
    );
  });
});

// Getting all lists appointed to a board and sending all the lists back to client-end
app.get("/getLists/:boardId", function (req, res){
  var boardId = req.params.boardId;
  if(boardId !== "none" || boardId === undefined){
    t.get("/1/boards/" + boardId + "/lists", function(err, data){
      if(data === undefined){
        res.status(400).send("No lists was found!");
      } else {
        res.send(data);
      }
    });
  }
  else {
    res.status(400).send("No board id was specified");
  }
});


// CRONJOB for sending mails (please define how often this should happend in the config file)
var CronJob = require('cron').CronJob;

// running the cronjob, at a specificed time (config.crontime)
new CronJob(config.crontime, function(){
    runCronJob();
}, null, true, config.crontimezone);

// for all notifiers in our mongodb database, we run sendMail method from mailer.
var runCronJob = function(){
  Notifier.find({}, function(err, notifiers){

      notifiers.forEach(function(user){
        var myLists = [];

        user.lists.forEach(function(list){
          myLists.push(""+list._id+"");
        })

        mailer.sendMail(user.email, user.board, myLists, async, t, config.daysBetweenNotifiers, transporter, config.myName, config.myEmail);
      });

    });
}

var server = app.listen(config.serverport, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Server is running at http://%s:%s", host, port);
});

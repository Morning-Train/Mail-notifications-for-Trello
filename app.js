"use strict";

/*==================================================================
=            Trello-Tran NodeJs Application Description            =
====================================================================

1. Purpose of Trello Train.
The purpose of this application is to "notice" changes on a Trello
board and send a email to a customer with the changes (only card name).
How this application notices changes is by checking out when there
have been activity on a single card. If the activity is within a
certain amount of days (default: 7), it will be a stored in a list and
at last sent to a specified email (often a client email-address).

As an requirement we also included an interface for Trello webhooks,
this is for having an easy way to see what kind of webhooks you have,
more for updating/deleting and maintaing the trello webhooks.

We started out with having a user-interface (presentation) handled by
php. PHP was sending GET requests to a NodeJS server, and the NodeJS
server was talking with Trello API, and sending was doing the logic
for sending the emails out, this became a bit messy and we realised
soon that it would be more performance wise and easy to handle to
just keep everything into one language: JavaScript.

Please keep in mind, that we are not experts at NodeJS and Trello-Train
was not made with security in mind, but made with the perspective of
"ease of use" - anything that is an issue or unwisely handled for an
example: functions, methods, datastructures, etc. Please report them
to us or make a pull request. (Suggestions are always welcome!).

2. Front-end description and informations.
For getting information about how the presentation part works, please
read the "Front-End" documentation at /client/XXXXX.

3. Everything beyond this point....
We tried documenting as much as possible, if there is something that
does not fit your eyes or use - then contact us or make a pull-request
and we can figure something out :)

4. Setting up Trello-Train.
4.1. You need to have NodeJS installed, you can read how to here:
XXXXXXXXXXX
4.2. You need to have MongoDB installed, you can read how to here:
XXXXXXXXXXX
4.3. You need the following modules:
- Node Trello,
- Async,
- NodeMailer,
- Express,
- Body Parser,
- Mongoose.

Read how to install modules here:
XXXXXXXX

Need to do this before initial release!
// SMTP Settings
// Cronjob settings
// Check if WebHook exists.

Can do whenever we got time
// Sort Webhooks by updated_at.


You are always welcome to give us feedback, suggestions and information.
Beyond this point (so you have installed the neccessary things?), you
will be setting up the configurations.

-------  End of Trello-Tran NodeJs Application Description  -------*/

/*=====================================================
=            Configuration of Trello-Train            =
=====================================================*/
/* Numbers between days of changes (in Trello Lists) */
var daysBetweenNotifiers = 7; // Default is 7

/* Trello API Access */
var trelloApplicationKey = "ef463438274bb639009b76098f83b026" // Read https://trello.com/docs/gettingstarted/index.html#getting-an-application-key
var trelloUserToken = "d0deb23a479200f4274823ca7e9432fcb00306278c4fb1b59bb2d4ad9bbce836" // Read https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user

/* SMTP Settings (For outgoing mail)*/


/*-----  End of Configuration of Trello-Train  ------*/

// Disable email system
var justContinue = true; // Put to false if you want to skip sending emails at the moment.

/* WARNING WARNING WARNING WARNING */
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
mongoose.connect('mongodb://localhost/test3');

// Connect to the db

var NotifierSchema = new mongoose.Schema({
  project: String,
  email: String,
  board: String,
  lists: [{ list: 'string' }],
  updated_at: { type: Date, default: Date.now }
});

var Notifier = mongoose.model('Notifier', NotifierSchema);

var WebHooksSchema = new mongoose.Schema({
  idModel: String,
  description: String,
  callbackURL: String,
  updated_at: { type: Date, default: Date.now },
  active: Boolean
});

var WebHook = mongoose.model("WebHook", WebHooksSchema);

//  Making the "t" object (this object access the api at trello) (based on Trello module) - with token key and secret key from Trello
var t = new Trello(trelloApplicationKey, trelloUserToken);

var transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
      user: "fireflexy@gmail.com",
      pass: "bluetime2a"
  }
});

// This is for understanding aliens when they try to communicate with you.
app.use(bodyParser.urlencoded({ extended: false }));

// Same goes for the JSON aliens
app.use(bodyParser.json());

app.use(express.static('./client'));

require('./controller/notifier')(app, null, Notifier);

require('./controller/webhooks')(app, async, WebHook, t);

var mailer = require('./controller/mailer');

// We don't use this in the client part anylongere
app.get("/getBoards", function (req, res) {
  var Board = function(id, name){
    this.id = id;
    this.name = name;
  };

  var boardArray = [];

  var counter = 0;
  var boardSize = 0;

  // Get all board ids out
  t.get("/1/members/me", function (err, data) {
    if (err) {
       throw err;
    }
  //console.log("============REQUEST FOR BOARDLISTS===========")

    boardSize = data.idBoards.length;
    data.idBoards.forEach(function (datax){
      var boardPath = "/1/boards/" + datax;
        t.get(boardPath, function(err, data) {
          counter++;
              if (err) throw err;
              //console.log("+ Board name: " + data.name + " ID: " + data.id);
              var currentBoard = new Board(data.id, data.name);
              boardArray.push(currentBoard);

              if(counter === boardSize){
                res.send(boardArray);
                //console.log("============REQUEST END==============")
              }
        });
      }
    );
  });
});


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


// CRONJOB
var CronJob = require('cron').CronJob;

new CronJob('10 * * * * *', function(){
    runCronJob();
}, null, true, "America/Los_Angeles");


var runCronJob = function(){
  Notifier.find({}, function(err, notifiers){

      notifiers.forEach(function(user){
        var myLists = [];
        console.log(user.email);
        console.log(user.board);
        user.lists.forEach(function(list){
          myLists.push(""+list._id+"");
        })
        console.log(myLists);
        mailer.sendMail(user.email, user.board, myLists, async, t, daysBetweenNotifiers, transporter);
      });

    });
}


// var myListToSend = ['5336dfadbcd0bb19728f2310'];

// mailer.sendMail("Rubatharisan@gmail.com", "5336dfadbcd0bb19728f230d", myListToSend, async, t, daysBetweenNotifiers, nodemailer);

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});

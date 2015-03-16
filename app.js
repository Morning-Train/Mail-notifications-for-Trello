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

  // Get week number. (Remember to move this away or outside this post request)
  Date.prototype.getWeek = function() {
        var onejan = new Date(this.getFullYear(),0,1);
        return Math.ceil((((this - onejan) / 86400000) + onejan.getDay())/7);
  };

  // Search for needle in an object by a property
  function arrayObjectIndexOf(myArray, searchTerm, property) {
          for(var i = 0, len = myArray.length; i < len; i++) {
              if (myArray[i][property] === searchTerm) return i;
          }
          return -1;
  }

  // Search for needle in an hay-array
  function arrayIndexOf(myArray, searchTerm){
          for(var i = 0, len = myArray.length; i < len; i++){
            if(myArray[i] === searchTerm) return i;
          }
          return -1;
  }

  // Handling error and send it to me
  function errorHandling (err) {
    console.error(err);
  }


var updateNotifier = function(){
	console.log("Update Notifier");
};

var removeNotifier = function(){
	console.log("Remove Notifier");
}

// This is for understanding aliens when they try to communicate with you.
app.use(bodyParser.urlencoded({ extended: false }));

// Same goes for the JSON aliens
app.use(bodyParser.json());

app.use(express.static('./client'));

app.post("/mongies/post", function (req, res){
    var continueThis = true;
    var project_name, email, board;
    var lists = [];

    if(req.body.project_name === "" || req.body.project_name === undefined && continueThis){
      res.status(418);
      res.send("<center><strong>Empty project name</strong></center>");
      continueThis = false;
    }

    if(req.body.email === undefined || req.body.email === "" && continueThis){
      res.status(418);
      res.send("<center><strong>Empty email</strong></center>");
      continueThis = false;
    }

    //res.send(req);
    if(req.body.board === undefined && continueThis){
      res.status(418);
      res.send("<center><strong>No board selected!</strong></center>");
      continueThis = false;
    }

    if(req.body.lists === undefined && continueThis){
      res.status(418);
      res.send("<center><strong>No lists chosen</strong></center>");
      continueThis = false;
    }

    if(continueThis){
      project_name = req.body.project_name;
      email = req.body.email;
      board = req.body.board;
      lists = req.body.lists;

      var myNotifier = new Notifier();
      myNotifier.project = project_name;
      myNotifier.email = email;
      myNotifier.board = board;


      if( typeof req.body.lists === "string"){
        myNotifier.lists.push(lists);
      } else {
        req.body.lists.forEach(function(entry){
          myNotifier.lists.push(entry);
          console.log(entry);
        });
      }

      res.status(200);
      res.send(myNotifier);

      myNotifier.save();

    }
});

app.post("/mongies/updateOne/", function(req, res){
  console.log(req.body);

  Notifier.findOne({ _id : req.body.notifier_id }, function (err, notifier){
    notifier.board = req.body.board;
    notifier.project = req.body.project_name;
    notifier.email = req.body.email;
    notifier.lists = [];

    if(typeof req.body.lists === "string"){
      notifier.lists.push(req.body.lists);
    } else {
      req.body.lists.forEach(function(entry){
        notifier.lists.push(entry);
      });
    }
    res.status(200);
    res.send("Updated");
    notifier.save();
  });


});

app.post("/mongies/removeOne", function(req, res){
    Notifier.findOne({ _id : req.body.notifier_id }, function (err, notifier){
      notifier.remove();
      notifier.save();
      res.status(200);
      res.send("Deleted!");
    });
});

app.get("/mongies/all/", function(req, res){
  Notifier.find({}, function(err, notifiers){
    var notifierMap = {};

    notifiers.forEach(function(user){
      notifierMap[user._id] = user;
    });

    res.send(notifierMap);
  });
});

app.get("/mongies/findOne/:id", function(req,res){
  Notifier.find({_id : req.params.id}, function(err, notifier){
    res.send(notifier);
  });
});

app.get("mongies/deleteAll/", function(req, res){
  Notifier.remove({}, function(err){
    res.send('collection removed');
  });
});



// This is the fun part, here is the "POST" method, that handles the email send to customers. Btw, it also includes alot of other stuff - read on.
app.post("/sendMail/", function (req, res){

// console.log(req.body);

// Defining userEmail, userBoard and WantedLists, from the request body. (Sent to us through JSON)
  var userEmail = req.body.email;
  var userBoard = req.body.board;
  var wantedLists = req.body.lists;

// console.log(req.body.lists);

  if(justContinue){

    // Is Email, BoardID and ListID defined? (['*'] = all lists) - the star hack does only work with directly sent requestes.
    if(userEmail === undefined || userBoard === undefined || wantedLists === undefined){
      errorHandling("Email, BoardID or ListID is not specificed");
      res.status(400);
      res.send("None shall pass");
    } else {
      // 5.semester : 54497be50bfa1518de532d19
      // BoardID + Path defined
      // BoardLists array init'd
      // and ofc the boardName variable is init'd

        var boardId = userBoard;
        var boardPath = "/1/boards/" + boardId;
        var boardLists = [];
        var boardName = "";

      // List class defined - makes list objects (I heard this should be big?)
        var List = function(id, name){
          this._id = id;
          this._name = name;
          this._cards = [];
        };

        // Init'd emailContent
        var emailContent = "";

        // This variable is set for checking up on if there should be sent an email or not.
        // If there is no changes in the specified lists,
        // for the last 7 days, then this script will run with boolSendMail as false. (Result: no mail sent)
        // If this is set to true, the content in emailContent will be sent to a user. (Will tell more about it later)

        var boolSendMail = false;

          // Simple greetings to everyone :)
          console.log("(.*.) Greetings (.*.)");

          // This is the famous async calls, read up on series and waterfall - heavy shit.
          async.series([
            function(callback){
              // code a
              // Console.log for linebreak and indicating where in the script we are.
              console.log();
              console.log("|a|");

              // Connection to trello object and trello api, and try getout the specified boardId name.
              t.get(boardPath, function(err, data) {
                if (err) throw err;
                // console.log("+ Board name: " +data.name);
                console.log(" |a| OK");
                boardName = data.name;
                // Saying continue after this point - to the next function in line
                callback(null, "a");
              });
            },
            function(callback){
            // code b
            // Console.log for linebreak and indicating where in the script we are.
              console.log();
              console.log("|ab|");

            // Connection to trello object and trello api, and try fetch the lists inside board.
              t.get("/1/boards/" + boardId + "/lists", function(err, data){
                // for each list returned, make a new list object with list id and name, thereafter push into boardLists array (array of objects).
                    data.forEach(function(item){
                      var addMe = new List(item.id, item.name);
                      // console.log(" + List: " + item.name + " " + item.id);
                      boardLists.push(addMe);
                    });
                    console.log(" |ab|  OK");
                    callback(null, "b");
              });
            },
            function(callback){
              // code c
            // Console.log for linebreak and indicating where in the script we are.

              console.log();
              console.log("|abc|");

              // Init' counter
              var counter = 0;
              var doublecounter = 0;
              var continueThis = false;
              // console.log(" +++ " + boardLists.length);

              function appendCards(position, card, cardActivity){
                var theCard = [card, cardActivity];
                boardLists[position]._cards.push(theCard);
              }

              var date = new Date();

              // function for checking out the days between today and the date the card has last activity.
              var numDaysBetween = function(d1, d2) {
                      var diff = Math.abs(d1.getTime() - d2.getTime());
                      return diff / (1000 * 60 * 60 * 24);
              };

              // For loop for all lists containing in board, checking out it's cards and activity.
              for(var i = 0, len = boardLists.length; i < len; i++){

                t.get("/1/lists/" + boardLists[i]._id + "/cards", function(err, data){
                  counter++;

                  // for loop for all cards in list
                  for (var k = 0, len = data.length; k < len; k++) {
                    doublecounter++;
                    //console.log("-- " + data[k].name);
                    //console.log("-- - " + data[k].idList);

                    // get position in an array of which lists this card is a member of
                    var posi = arrayObjectIndexOf(boardLists, data[k].idList, "_id");

                    //console.log(data[k])

                    var dateActivity = data[k].dateLastActivity.split("T");
                    var theDate = dateActivity[0].split("-");
                    var myTime = new Date(theDate[0], theDate[1]-1, theDate[2]);

                    // If days are more than "7" (default), then appendCard to array of objects of lists - append to ._cards of Lists
                    if(numDaysBetween(date, myTime) < daysBetweenNotifiers){
                      appendCards(posi, data[k].name);
                    }

                    // If everything is cool, just continue (all cards have been checked).
                    if(doublecounter == data.length){
                      continueThis = true;
                    }
                  }

                  // If all cards have been checked, and all lists have been checked - continue.
                  if(counter == boardLists.length && continueThis){
                      //console.log("Call me Callback");
                      //console.log(boardLists[2]);
                      console.log(" |abc|  OK");
                      callback(null, "c");
                  }
                });
              }

              //console.log(boardLists);
            },
            function(callback){
              // code d
              console.log();
              console.log("|abcd|");
              var styleColor = "";

              emailContent += "Morning Train arbejder på projektet " + boardName;
              emailContent += "<br> Dette er sket i sidste uge:";

              boardLists.forEach(function(entry){
                switch(entry._name.toLowerCase()){
                  case "done":
                    styleColor = "green";
                    break;
                  case "to do":
                    styleColor = "";
                    break;
                  case "doing":
                    styleColor = "#FFBF00";
                    break;
                  default:
                    styleColor = "";
                    break;
                }

                if(arrayIndexOf(wantedLists, entry._id) != -1 || wantedLists[0] == "*"){
                  if(entry._cards.length !== 0){
                    boolSendMail = true;
                    // console.log(" - " + entry._name);
                    emailContent += "<h2><font color='" + styleColor + "'>" + entry._name + "</font></h2>";
                    emailContent += "<ul>";
                    entry._cards.forEach(function(cards){
                      // console.log(" -- " + cards[0]);
                      emailContent += "<li><font color='" + styleColor + "'>" + cards[0] + "</font></li>";
                    });
                    emailContent += "</ul>";

                  }
                }
              });

                    emailContent += "<br>";
                    emailContent += "Med venlig hilsen <br>";
                    emailContent += "<img src='http://morningtrain.dk/wp-content/uploads/2014/09/webbureau-odense-programmering.png' alt='Morning Train Technologies'>";
              console.log(" |abcd|  OK");
              callback(null, "d");
            }],
            // optional callback
            function (err, results){
              // results is ['a', 'b', 'c', 'd']
              // final callback code
              console.log();
              console.log("|abcd-f|");
              var transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "fireflexy@gmail.com",
                    pass: "bluetime2a"
                }
              });

              var today = new Date();
              var weekno = today.getWeek();
              var year = today.getFullYear();

              // NB! No need to recreate the transporter object. You can use
              // the same transporter object for all e-mails

              // setup e-mail data with unicode symbols
              var mailOptions = {
                  from: "Fred Foo ✔ <fireflexy@gmail.com>", // sender address
                  to: "rubatharisan thirumathyam, " + userEmail, // list of receivers
                  subject: "Statusrapport  U" + weekno + " - " + year, // Subject line
                  text: "Hello world ✔", // plaintext body
                  html: emailContent // html body
              };

              if(boolSendMail){
                // send mail with defined transport object
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                    }else{
                        console.log("Message sent: " + info.response);
                    }
                });
              }

              console.log(emailContent);
              console.log();
              console.log("(.*.) Farewell! Thank you for being a part of this mess.... (.*.)");
              res.send("Bye!");

              console.log(err);
              console.log(results);
            }
          );
    }
  } else {
    res.status(418);
    res.send("Sorry, we are closed today");
    console.log("Sorry, we are closed today");
  }

});

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

  t.get("/1/boards/" + boardId + "/lists", function(err, data){
      res.send(data);
  });
});

// WebHooks API

app.post("/mongies/webhooks/post", function (req, res){
  // console.log(req.body);
  var continueThis = true;

  console.log(req.body);

  if(req.body.idModel == "none" || req.body.idModel == undefined){
    res.status(418);
    res.send("Pick a board");
    continueThis = false;
  }

  else if(req.body.desc_area === undefined || req.body.desc_area == ""){
    res.status(418);
    res.send("Please write a description");
    continueThis = false;
  }

  else if(req.body.callback_area === undefined || req.body.callback_area == ""){
    res.status(418);
    res.send("Please write a callback URL");
    continueThis = false;
  }

  if(continueThis){
    var myWebHook = new WebHook();

    if(typeof req.body.idModel != undefined){
      myWebHook.idModel = req.body.idModel;
    } else {
      myWebHook.idModel = req.body.board;
    }

    myWebHook.callbackURL = req.body.callback_area;
    myWebHook.description = req.body.desc_area;

    var webHookState = "";

    async.series([
      function(callback){
        t.post("/1/webhooks/", { description: myWebHook.description, callbackURL: myWebHook.callbackURL, idModel: myWebHook.idModel }, function (req, res) {
            webHookState = res;
            callback(null, "a");
        });
      },
      function(callback){
          // console.log(webHookState);
          callback(null, "b");
      },
      function(callback){
          if(typeof webHookState === 'object'){
            // console.log("is an object");
            // console.log(webHookState);
            if(webHookState.active === true){
              myWebHook._id = webHookState.id;
              myWebHook.active = webHookState.active;
              myWebHook.save();
              // console.log(myWebHook);
              res.sendStatus(200);
            } else {
              res.status(400).send("Status: Something went wrong....");
            }
          } else if(typeof webHookState === 'string'){
            res.status(400).send("Status: " + webHookState);
          }
      }
    ]);
  }


});

app.get("/mongies/webhooks/deleteAll", function (req, res){
  WebHook.remove({}, function(err){
    res.send('Ok!');
  });
});


app.get("/mongies/webhooks/all", function (req, res){
var counter = 0;

  WebHook.find({}, function(err, webhooks){
    var webHookMap = {};
  async.series([
    function(callback){
      webhooks.forEach(function(webhook){
        t.get("/1/webhooks/" + webhook.id, function (req, res) {
          counter++;
          console.log(res);
          if(res.active === true){
              webHookMap[webhook._id] = webhook;
          } else {
              webhook.active = false;
              webHookMap[webhook._id] = webhook;
              setWebHookToFalse(webhook);
          }
          if(counter === webhooks.length){
              console.log("Continuing");
              callback(null, "a");
          }
        });
      });
      console.log(webhooks.length);
    },
    function(callback){

      var output = [];

      for (var key in webHookMap) {
          webHookMap[key].key = key;   // save key so you can access it from the array (will modify original data)
          output.push(webHookMap[key]);
      }

      output.sort(function(a,b) {
          return(a.updated_at - b.updated_at);
      });

      res.send(output);
      callback(null, "b");
    }
    ]);

    //checkIfWebHookExistsAtTrello(webHookMap);
  });
});

var dynamicSort = function(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

var setWebHookToTrue = function(webHookId){
  WebHook.findOne({_id : webHookId}, function(err, webhook){
            //console.log("The WebHook from Local (unmodified):");
            // console.log(webhook);
            webhook.active = true;
            webhook.save();
            //console.log(webhook);
  });
}

var setWebHookToFalse = function(webhookId){
  WebHook.findOne({_id : webhookId}, function(err, webhook){
            //console.log("The WebHook from Local (unmodified):");
            // console.log(webhook);
            webhook.active = false;
            webhook.save();
            //console.log(webhook);
  });
}

app.get("/mongies/webhooks/findOne/:id", function(req,res){
  // Check if the WebHook exists at Trello! (Todo)
  WebHook.find({_id : req.params.id}, function(err, webhook){
    res.send(webhook);
  });
});

app.post("/mongies/webhooks/updateOne/", function (req, res){
  //console.log(req.body);
  var responseFromTrello = "";


  async.series([
      function(callback){
          // t.get("/1/webhooks/" + req.body.webhooks_id, function (req, res) {
          //   console.log(res);
          //   callback(null, "a");
          // });

          t.put("/1/webhooks/" + req.body.webhooks_id, { description: req.body.desc_area, callbackURL: req.body.callback_area, idModel: req.body.idModel }, function (req, res) {
            responseFromTrello = res;
            callback(null, "a");
          });
      },

      function(callback){
        if(typeof responseFromTrello === 'object'){
          var theWebHook;
          WebHook.findOne({_id : req.body.webhooks_id}, function(err, webhook){
            //console.log("The WebHook from Local (unmodified):");
            // console.log(webhook);
            webhook.callbackURL = responseFromTrello.callbackURL;
            webhook.idModel = responseFromTrello.idModel;
            webhook.description = responseFromTrello.description;
            webhook.save();
          });
          res.status(200).send("it worked!");
        } else if(typeof responseFromTrello === 'string'){
          res.status(418).send(responseFromTrello);
        }
      }
    ])
});

app.post("/mongies/webhooks/removeOne", function(req, res){
  var responseFromTrello = "";
  // console.log(req.body);
  async.series([
      function(callback){
          // t.get("/1/webhooks/" + req.body.webhooks_id, function (req, res) {
          //   console.log(res);
          //   callback(null, "a");
          // });

          t.del("/1/webhooks/" + req.body.webhooks_id, function (req, res) {
            responseFromTrello = res;
            callback(null, "a");
          });
      },

      function(callback){
        if(typeof responseFromTrello === 'object'){
          // console.log(responseFromTrello);
            WebHook.findOne({ _id : req.body.webhooks_id }, function (err, webhook){
              webhook.remove();
              webhook.save();
              res.status(200);
              res.send("Deleted!");
            });
        } else if(typeof responseFromTrello === 'string'){
          // console.log(responseFromTrello);
          res.status(418).send(responseFromTrello);
        }
      }
    ]);


    // WebHook.findOne({ _id : req.body.notifier_id }, function (err, notifier){
    //   notifier.remove();
    //   notifier.save();
    //   res.status(200);
    //   res.send("Deleted!");
    // });
});





var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);

});

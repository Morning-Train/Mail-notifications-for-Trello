"use strict";

// Requirements of Modules
//  Trello module
var Trello = require("node-trello");
var async = require("async");
var nodemailer = require("nodemailer");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");


//  Making the "t" object (based on Trello module) - with token key and secret key from Trello
var t = new Trello("ef463438274bb639009b76098f83b026", "d0deb23a479200f4274823ca7e9432fcb00306278c4fb1b59bb2d4ad9bbce836");

// Get all board ids out
// t.get("/1/members/me", function (err, data) {
//   if (err) {
//      throw err;
//   }
//   data.idBoards.forEach(function (datax){
//       console.log(datax);
//     }
//   );
// });

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:8888");

    // Request methods you wish to allow
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/sendMail/", function (req, res){

  var userEmail = req.body.email;
  var userBoard = req.body.board;
  var wantedLists = req.body.lists;

  var justContinue = true;

  res.send("OK");

  // Get week number.
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

  // Search for needle in an array
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

  if(justContinue){

    // Is Email, BoardID and ListID defined? (* = all lists)
    if(userEmail === undefined || userBoard === undefined || wantedLists === undefined){
      errorHandling("Email, BoardID or ListID is not specificed");
      process.exit(1);

    } else {
      // 5.semester : 54497be50bfa1518de532d19
      // BoardID + Path defined
      // BoardLists array init'd
        var boardId = userBoard;
        var boardPath = "/1/boards/" + boardId;
        var boardLists = [];

        var boardName = "";

      // List Object init'd
        var list = function(id, name){
          this._id = id;
          this._name = name;
          this._cards = [];
        };

        // Defined the lists wanted (Remember *= means all lists)
       // var wantedLists = process.argv[4].split("=");
      // console.log(wantedLists);

        // Init'd emailContent
        var emailContent = "";
        var boolSendMail = false;
        /* t.get(boardPath, function(err, data) {
          if (err) throw err;
          console.log(data);
        }); */

          // Simple greetings to everyone :)
          console.log("(.*.) Greetings (.*.)");

          async.series([
            function(callback){
              // code a
              console.log();
              console.log("|a|");
              t.get(boardPath, function(err, data) {
                if (err) throw err;
                console.log("+ Board name: " +data.name);
                boardName = data.name;
                callback(null, "a");
              });
            },
            function(callback){
              // code b
              console.log();
              console.log("|ab|");
              t.get("/1/boards/" + boardId + "/lists", function(err, data){
                    data.forEach(function(item){
                      var addMe = new list(item.id, item.name);
                      console.log(" + List: " + item.name);
                      boardLists.push(addMe);
                    });
                    callback(null, "b");
              });
            },
            function(callback){
              // code c
              console.log();
              console.log("|abc|");
              var counter = 0;
              var doublecounter = 0;
              var continueThis = false;
              // console.log(" +++ " + boardLists.length);

              function appendCards(position, card, cardActivity){
                var theCard = [card, cardActivity];
                boardLists[position]._cards.push(theCard);
              }

              var date = new Date();

              var numDaysBetween = function(d1, d2) {
                      var diff = Math.abs(d1.getTime() - d2.getTime());
                      return diff / (1000 * 60 * 60 * 24);
              };

              for(var i = 0, len = boardLists.length; i < len; i++){


                t.get("/1/lists/" + boardLists[i]._id + "/cards", function(err, data){
                  counter++;

                  for (var k = 0, len = data.length; k < len; k++) {
                    doublecounter++;
                    //console.log("-- " + data[k].name);
                    //console.log("-- - " + data[k].idList)
                    var posi = arrayObjectIndexOf(boardLists, data[k].idList, "_id");
                    //console.log(data[k])

                    var dateActivity = data[k].dateLastActivity.split("T");
                    var theDate = dateActivity[0].split("-");
                    var myTime = new Date(theDate[0], theDate[1]-1, theDate[2]);

                    if(numDaysBetween(date, myTime) < 7){
                      appendCards(posi, data[k].name);
                    }


                    if(doublecounter == data.length){
                      continueThis = true;
                    }
                  }


                  if(counter == boardLists.length && continueThis){
                      //console.log("Call me Callback");
                      //console.log(boardLists[2]);
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
                    console.log(" - " + entry._name);
                    emailContent += "<h2><font color='" + styleColor + "'>" + entry._name + "</font></h2>";
                    emailContent += "<ul>";
                    entry._cards.forEach(function(cards){
                      console.log(" -- " + cards[0]);
                      emailContent += "<li><font color='" + styleColor + "'>" + cards[0] + "</font></li>";
                    });
                    emailContent += "</ul>";
                  }
                }
              });

                    emailContent += "<br>";
                    emailContent += "Med venlig hilsen <br>";
                    emailContent += "<img src='http://morningtrain.dk/wp-content/uploads/2014/09/webbureau-odense-programmering.png' alt='Morning Train Technologies'>";
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
              console.log("<DEBUGGING AREA>");
              console.log();

              console.log(weekno + " : " + year);

              console.log();
              console.log("(.*.) Farewell! Thank you for being a part of this mess.... (.*.)");

            }
          );
    }
  } else if(process.argv[2] === "getBoards") {
    var board = function(id, name){
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

      boardSize = data.idBoards.length;
      data.idBoards.forEach(function (datax){
        var boardPath = "/1/boards/" + datax;
          t.get(boardPath, function(err, data) {
            counter++;
                if (err) throw err;
                console.log("+ Board name: " + data.name + " ID: " + data.id);
                var currentBoard = new board(data.id, data.name);
                boardArray.push(currentBoard);

                if(counter === boardSize){
                  console.log(boardArray);
                }
          });
        }
      );
    });

  } else {
    console.log("Nothing specified...");
  }

});

app.get('/getBoards', function (req, res) {
  var board = function(id, name){
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

    boardSize = data.idBoards.length;
    data.idBoards.forEach(function (datax){
      var boardPath = "/1/boards/" + datax;
      var boardId = "";
        t.get(boardPath, function(err, data) {
          counter++;
              if (err) throw err;
              console.log("+ Board name: " + data.name + " ID: " + data.id);
              var currentBoard = new board(data.id, data.name);
              boardArray.push(currentBoard);
              var boardId = data.id;

              if(counter === boardSize){
                res.send(boardArray);
              }
        });
      }
    );
  });
});


app.get('/getLists/:boardId', function (req, res){
  var boardId = req.params.boardId;
  var lists = [];

  t.get("/1/boards/" + boardId + "/lists", function(err, data){
      res.send(data);
  });
})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port);

});
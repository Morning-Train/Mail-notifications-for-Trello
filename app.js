/*jslint node: true */
"use strict";

/* DO NOT EDIT ANYTHING BEYOND THIS POINT - unless you know what you are doing ;) */
var boardData = [];
var listNames = [];
// Array of Boards
var boardArray = [];

// Requirements of Modules
//  Trello module
var Trello = require("node-trello");
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
    email: Array,
    board: String,
    lists: [{
        list: 'string'
    }],
    daysBetweenNotify: Number,
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Setting the Schema as a Model in Mongoose
var Notifier = mongoose.model('Notifier', NotifierSchema);

//  Making the "t" object (this object access the api at trello) (based on Trello module) - with token key and secret key from Trello
var t = new Trello(config.trelloApplicationKey, config.trelloUserToken);

// Creating a transporter for sending mails through nodemailer
var transporter = nodemailer.createTransport(config.settingsForTransporter);

// This is for understanding aliens when they try to communicate with you.
app.use(bodyParser.urlencoded({
    extended: false
}));

// Same goes for the JSON aliens
app.use(bodyParser.json());

// Using our static client front-end system (look at index.html and scripts.js for more info about this)
app.use(express.static('./client'));

// Requiring the controller of notifier and including the app and Notifier model.
require('./controller/notifier')(app, null, Notifier);


/*=============================
=            Utils            =
=============================*/

// Get today date.
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var year = today.getFullYear();
var combinedDate = dd + "" + mm + "" + year;


// Search array for a needle
function arrayContains(needle, arrhaystack) {
    return (arrhaystack.indexOf(needle) > -1);
}

// Days between dates
var numDaysBetween = function(d1, d2) {
    var diff = Math.abs(d1.getTime() - d2.getTime());
    return diff / (1000 * 60 * 60 * 24);
};

// Set a prototype of Date called getWeek
Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()) / 7);
};

// Get week number for this week
var weekno = today.getWeek();



/*======================================
=            Server startup            =
======================================*/

var server = app.listen(config.serverport, function() {

    var host = server.address().address;
    var port = server.address().port;

    console.log("Server is running at http://%s:%s", host, port);
});


/*=====================================
=            HTTP Requests            =
=====================================*/

// Run cronjob
app.post("/runNewCronJob", function(req, res) {
    runNewCronJob(req.body.id);
    // sendEmailToUser("Testing", "Rubatharisan@gmail.com");
    res.send("Ok your request is getting processed");
});

// Get request of getting all boards owned by user at trello.
app.get("/getBoards", function(req, res) {
    getAllBoards(req, res);
});

// Getting all lists appointed to a board and sending all the lists back to client-end
app.get("/getLists/:boardId", function(req, res) {
    var boardId = req.params.boardId;
    if (boardId !== "none" || boardId === undefined) {
        t.get("/1/boards/" + boardId + "/lists", function(err, data) {
            if (data === undefined) {
                res.status(400).send("No lists were found!");
            } else {
                res.send(data);
            }
        });
    } else {
        res.status(400).send("No board id was specified");
    }
});


/*===================================================
=            Functions for Sending Mails            =
===================================================*/

// runNewCronJob
var runNewCronJob = function(notifierid) {
    var Boards = [];
    // myNotifiers are the notifiers that the cronjob should handle
    var myNotifiers = [];
    Notifier.find({}, function(err, notifiers) {

        notifiers.forEach(function(notify) {

            console.log(notifierid + " " + notify._id);
            if (notify._id == notifierid) {
                myNotifiers.push(notify);
                Boards.push(notify.board);
            } else if (notifierid === undefined) {
                //if (!arrayContains(notify.board, Boards)) {
                myNotifiers.push(notify);
                Boards.push(notify.board);
                //}   
            }
        });

        var counterX = 0;

        Boards.forEach(function(board, index) {
            t.get("/1/boards/" + board + "/cards?fields=name,idList,url,dateLastActivity", function(err, data) {
                var theBoard = {
                    boardId: board,
                    lists: [],
                    cards: []
                };

                data.forEach(function(entry, index) {
                    if (!arrayContains(entry.idList, theBoard.lists)) {

                        theBoard.lists.push(entry.idList);

                    }

                    // Here we got all boards, and their cards and lists.
                    theBoard.cards.push(entry);

                });
                boardData.push(theBoard);
                counterX++;

                if (counterX === Boards.length) {
                    console.log("|A| Got all boards and their cards");
                    getAllCardsForEachUser(myNotifiers);
                }
            });
        });

    });
    boardData = [];
};

// getAllCardsForEachUser
var getAllCardsForEachUser = function(notifiers) {
    var userArray = [];

    // console.log(notifiers.length);
    var counter = 0;

    notifiers.forEach(function(notify) {
        var user = {
            usermail: notify.email,
            boardId: notify.board,
            lists: []
        };

        notify.lists.forEach(function(list) {
            var myCards = getAllCardsWithListId(notify.board, list._id);

            var aList = {
                listId: list._id,
                cards: myCards
            };

            if (myCards.length > 0) {
                user.lists.push(aList);
            }

        });

        counter++;
        userArray.push(user);

        if (counter === notifiers.length) {
            console.log("|B| Sorted all lists based on listId in each card + removed cards that are outside limit");
            removeEmptyLists(userArray);
        }
    });

};

var getAllCardsWithListId = function(boardId, listId) {
    var cards = [];

    boardData.forEach(function(board) {
        if (board.boardId == boardId) {

            board.cards.forEach(function(card) {

                if (card.idList == listId) {

                    var cardActivityTime = card.dateLastActivity.split("T")[0].split('-');
                    cardActivityTime = new Date(cardActivityTime[0], cardActivityTime[1] - 1, cardActivityTime[2]);

                    if (numDaysBetween(today, cardActivityTime) < config.daysBetweenNotifiers) {
                        cards.push(card.name);
                    }

                }
            });
        }
    });

    return cards;

};


// Remove Empty Lists
var removeEmptyLists = function(userArray) {
    var counter = 0;
    var listsInTotal = 0;
    userArray.forEach(function(user) {

        user.lists.forEach(function(list, index) {

            if (list.cards.length === 0) {
                delete user.lists[index];
            } else {
                listsInTotal++;
            }

        });

        counter++;

        if (counter == userArray.length) {
            console.log("|C| Removed lists with no cards");
            fetchListNames(userArray, listsInTotal);
        }
    });

};


// Fetch list names
var fetchListNames = function(userArray, listsInTotal) {
    var counter = 0;
    userArray.forEach(function(user) {
        user.lists.forEach(function(list) {
            t.get("/1/lists/" + list.listId + "?fields=name", function(err, data) {

                var listObject = {
                    listName: data.name,
                    listId: data.id
                };

                listNames.push(listObject);

                counter++;

                if (counter == listsInTotal) {
                    console.log("|D| Fetched names for the remaining lists (with cards)");
                    fetchBoardNames(userArray);
                }
            });
        });
    });


};


// Fetch board names
var fetchBoardNames = function(userArray) {
    var boardSize;
    var counter = 0;

    var Board = function(id, name) {
        this.id = id;
        this.name = name;
    };

    // Get all board ids out
    t.get("/1/members/me", function(err, data) {
        if (err) {
            throw err;
        }

        // Setting the boardSize to the length of all boards
        boardSize = data.idBoards.length;

        // forEach on each board of all boards accessable by user
        data.idBoards.forEach(function(aBoard) {

            // Setting the boardPath to /1/boards/aBoard (aBoard is a id of one of all boards)
            // The purpose of this function is to get all names of all boards and put it into a array, and send this array back
            // to the client end
            var boardPath = "/1/boards/" + aBoard;
            t.get(boardPath, function(err, theBoard) {
                counter++;
                if (err) throw err;
                var currentBoard = new Board(theBoard.id, theBoard.name);
                boardArray.push(currentBoard);
                if (counter === boardSize) {
                    console.log("|E| Fetched board names");
                    setupEmailTemplate(userArray);
                }
            });
        });
    });

};

// Setup Email Template
var setupEmailTemplate = function(userArray, res) {

    userArray.forEach(function(user) {
        var emailContent = '';

        if (user.lists.length > 0) {

            emailContent += "<meta charset='UTF-8'>";
            emailContent += "<div style='width: 100%; background-color: #F3F3F3; padding-bottom: 5%; padding-top: 5%;'>";
            emailContent += "<table align='center' style='font-family: arial,sans-serif; background-color:#fff; margin: 0 auto; max-width: 950px;width: 95%; border-radius: 10px;'>";
            emailContent += "<tbody style='background-color: #fff; margin: 0 auto; border: 1px solid #dadada;'>";
            emailContent += "<th align='center' style='background-color: #0E74AF; width: 100%; margin:0 auto; border-top-left-radius: 10px; border-top-right-radius: 10px; border: 25px solid #0E74AF;'><h1 style='  margin: 0 !important; color:#fff; font-size: 12px; text-transform: uppercase; padding-bottom: 7px; font-size: 20px;'>Email-Notifier</h1><h2 style='   margin: 0 !important; padding-top: 7px;  color: #fff;font-size: 10px; text-transform: uppercase;'>Your notifier from your Trello boards</h2></th>";
            emailContent += "<tr>";
            emailContent += "<td align='center' style='padding-top: 50px; padding-bottom: 5px; padding-left: 5%; padding-right: 5%;'>" + config.myName + " is working at " + getBoardName(user.boardId) + "</td>";
            emailContent += "</tr>";
            emailContent += "<tr>";
            emailContent += "<td align='center' style='padding-top: 5px; padding-bottom: 5px; padding-left: 5%; padding-right: 5%;'>Here is a overview of what have changed:</td>";
            emailContent += "</tr>";

            var styleColor = "";

            // emailContent += user.usermail;
            user.lists.forEach(function(list) {
                emailContent += "<tr><td style='padding-top: 15px; padding-bottom: 15px; padding-left: 5%; padding-right: 5%;'>";
                emailContent += "<h2 style='  letter-spacing: 1px; text-transform: uppercase;  font-size: 14px;   border-bottom: 1px solid #F0F0F0; padding-bottom: 7px;'><font color='" + styleColor + "'>" + getListName(list.listId) + "</font></h2>";
                emailContent += "<ul style='  margin-top: 30px;'>";

                list.cards.forEach(function(card) {

                    emailContent += "<li style='margin-top: 10px; margin-bottom:10px; font-size: 14px; list-style-type: circle;'><font color='" + styleColor + "'>" + card + "</font></li>";

                });

                emailContent += "</ul>";

            });

            emailContent += "</td></tr>";

            emailContent += "</tbody>";
            emailContent += "<tr align='center'><td style=' background-color: #0e74af; color: #fff; padding-bottom: 20px;padding-top: 20px;border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;   font-size: 11px;'>Thank you for using our plugin</td></tr>";
            emailContent += "</table>";
            emailContent += "</div>";

            // users += user.lists;

            sendEmailToUser(emailContent, user.usermail);

        }

    });

};


// Send the email to the user
var sendEmailToUser = function(emailContent, email) {

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: "" + config.myName + " <" + config.myEmail + ">", // sender address
        to: "" + email, // list of receivers
        subject: "Changes in week: " + weekno + " - " + year, // Subject line
        html: emailContent // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(email);
            console.log(error);
        } else {
            console.log("Message sent to: " + email + ", " + info.response);
        }
    });

};


/*====================================
=            UI Functions            =
====================================*/

var getAllBoards = function(req, res) {
    // Creating a Board class.
    var boardArray = [];

    var Board = function(id, name) {
        this.id = id;
        this.name = name;
    };

    // init counter and boardSize
    var counter = 0;
    var boardSize = 0;

    // Get all board ids out
    t.get("/1/members/me", function(err, data) {
        if (err) {
            throw err;
        }

        // Setting the boardSize to the length of all boards
        boardSize = data.idBoards.length;

        // forEach on each board of all boards accessable by user
        data.idBoards.forEach(function(aBoard) {

            // Setting the boardPath to /1/boards/aBoard (aBoard is a id of one of all boards)
            // The purpose of this function is to get all names of all boards and put it into a array, and send this array back
            // to the client end
            var boardPath = "/1/boards/" + aBoard;
            t.get(boardPath, function(err, theBoard) {
                counter++;
                if (err) throw err;
                var currentBoard = new Board(theBoard.id, theBoard.name);
                boardArray.push(currentBoard);
                if (counter === boardSize) {
                    res.send(boardArray);
                }
            });
        });
    });
};


var getListName = function(listIdx) {
    var theName;

    for (var i = 0; i < listNames.length; i++) {
        if (listIdx == listNames[i].listId) {
            theName = listNames[i].listName;
            break;
        }
    }

    return theName;

};

var getBoardName = function(boardId) {
    var theName;

    for (var i = 0; i < boardArray.length; i++) {
        if (boardArray[i].id === boardId) {
            theName = boardArray[i].name;
            break;
        }
    }

    return theName;

};
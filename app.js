/*jslint node: true */
"use strict";

/* DO NOT EDIT ANYTHING BEYOND THIS POINT - unless you know what you are doing ;) */
var boardData = [];
var listNames = [];
// Array of Boards
var boardArray = [];

// Requirements of Modules
var Trello = require("./controller/trello.js");
var nodemailer = require("nodemailer");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require('mongoose');

var connectionString = "mongodb://localhost/mailnotifiersForTrello";
mongoose.connect(connectionString);
var db = mongoose.connection;
db.once('open', function () { console.log('MongoDB connection successful.'); });

var http = require("https");

var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(50, 10000);

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');

var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

// Loading config
var config = require('./config/config');

// Notifier Schema for mails
var NotifierSchema = new mongoose.Schema({
    project: String,
    email: Array,
    board: String,
    togglProject: String,
    billableHours: Boolean,
    rounding: Boolean,
    lists: [{
        list: 'string'
    }],
    daysBetweenNotify: Number,
    notifyDay: Number,
    lastNotified: Date,
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Setting the Schema as a Model in Mongoose
var Notifier = mongoose.model('Notifier', NotifierSchema);

//  Making the "t" object (this object access the api at trello) - with token key and secret key from Trello
var t = new Trello(config.trelloApplicationKey, config.trelloUserToken);

// Creating a transporter for sending mails through nodemailer
var transporter = nodemailer.createTransport(config.settingsForTransporter);

// This is for understanding aliens when they try to communicate with you.
app.use(bodyParser.urlencoded({
    extended: false
}));

// Same goes for the JSON aliens
app.use(bodyParser.json());

var isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/login");
    }
}

app.use(expressSession({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Using our static client front-end system (look at index.html and scripts.js for more info about this)
app.use("/login", express.static("./login"));
app.use("/admin", [isAuthenticated, express.static("./client")]);

// Requiring the controller of notifier and including the app and Notifier model.
require('./controller/notifier')(app, null, Notifier, isAuthenticated);

/*=============================
=            Utils            =
=============================*/

// Set a prototype of Date called getWeek
Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// Get today's date
var today, dd, mm, year, combinedDate, weekno;
var updateTodaysDate = function() {
    today = new Date();
    dd = today.getDate();
    mm = today.getMonth() + 1; //January is 0!
    year = today.getFullYear();
    combinedDate = dd + "-" + mm + "-" + year;
    weekno = today.getWeek();
    console.log(today);
}

// Search array for a needle
function arrayContains(needle, arrhaystack) {
    return (arrhaystack.indexOf(needle) > -1);
}

// Days between dates
var numDaysBetween = function(d1, d2) {
    var diff = Math.abs(d1.getTime() - d2.getTime());
    return diff / (1000 * 60 * 60 * 24);
};

// Return appropriate daysBetweenNotify variable (either notify value or config value)
var getDaysBetweenNotifiers = function(notify) {
    if (notify.daysBetweenNotify === undefined || notify.daysBetweenNotify === null) {
        return config.daysBetweenNotifiers;
    } else {
        return notify.daysBetweenNotify;
    }
}

/*======================================
=            Server startup            =
======================================*/

var server = app.listen(config.serverport, function() {

    var host = server.address().address;
    var port = server.address().port;

    console.log("Server is running at http://%s:%s", host, port);
});

// Set today's date on initialization
updateTodaysDate();


/*=====================================
=          Passport & Bcrypt         =
=====================================*/

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

var UserSchema = mongoose.Schema;
var UserDetail = new UserSchema({
    username: String,
    password: String
}, {
    collection: 'userInfo'
});
var UserDetails = mongoose.model('userInfo', UserDetail);

UserDetail.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

passport.use(new LocalStrategy(function(username, password, done) {
    process.nextTick(function() {
        UserDetails.findOne({
            'username': username,
        }, function(err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false);
            }

            bcrypt.compare(password, user.password, function(err, res) {
                if (res === true) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        });
    });
}));

// Recreate admin login
UserDetails.remove({},
    function(err, results) {
        var admin = new UserDetails({
            username: config.username,
            password: config.password
        });

        admin.save(function(error, data) {
            if (error) console.log(error);
            else console.log('Admin login created succesfully');
        });
    });

/*=====================================
=            HTTP Requests            =
=====================================*/
app.get("/", function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/admin")
    } else {
        res.redirect("/login");
    }
});

app.post("/login",
    passport.authenticate("local", {
        successRedirect: "/admin",
        failureRedirect: "/login"
    })
);

// Run cronjob
app.post("/runNewCronJob",
    passport.authenticate("local", {
        session: false
    }),
    function(req, res) {
        // sendEmailToUser("Testing", "Rubatharisan@gmail.com");
        runNewCronJob(req.body.id);
        res.send("Ok your request is getting processed");
    });

// Run cronjob for specific ID
app.post("/runNewCronJobId", isAuthenticated, function(req, res) {
    if(req.body.id != undefined) {
        runNewCronJob(req.body.id);
        res.send("Ok your request is getting processed");
    } else {
        res.send("Couldn't find the ID..")
    }
});

// Get request of getting all boards owned by user at trello.
app.get("/getBoards", isAuthenticated, function(req, res) {
    getAllBoards(req, res);
});

// Getting all lists appointed to a board and sending all the lists back to client-end
app.get("/getLists/:boardId", isAuthenticated, function(req, res) {
    var boardId = req.params.boardId;
    if (boardId !== "none" || boardId === undefined) {
        t.get("/1/boards/" + boardId + "/lists", function(err, data) {
            if (err) {
                throw err;
            }

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

// Get all toggl projects for the toggl user
app.get("/getTogglProjects", isAuthenticated, function(req, res) {
    getTogglProjects(res);
});


/*===================================================
=            Functions for Sending Mails            =
===================================================*/

// runNewCronJob
var runNewCronJob = function(notifierid) {
    console.log("Received runNewCronJob(" + notifierid + ") request");
    // Update today's date
    updateTodaysDate();

    var Boards = [];
    // myNotifiers are the notifiers that the cronjob should handle
    var myNotifiers = [];
    Notifier.find({}, function(err, notifiers) {

        notifiers.forEach(function(notify) {
            // Handle the specified notify (resend functionality)
            if (notify._id == notifierid) {
                notify["resend"] = true;
                myNotifiers.push(notify);
                Boards.push(notify.board);
            }

            // Handle all notifies
            else if (notifierid === undefined) {
                // Handle notify if notifyDay is set to automatic (7) or the current day of the week (0-6)
                if (notify.notifyDay === 7 || notify.notifyDay === today.getDay()) {
                    // Handle notify if it doesn't have a last notification date
                    if (notify.lastNotified === undefined) {
                        myNotifiers.push(notify);
                        Boards.push(notify.board);
                    }
                    // Handle notify if days since lastNotified is greater or equal to daysBetweenNotify
                    else if (Math.round(numDaysBetween(today, notify.lastNotified)) >= getDaysBetweenNotifiers(notify)) {
                        myNotifiers.push(notify);
                        Boards.push(notify.board);
                    }
                }
            }
        });

        var counterX = 0;

        Boards = Boards.filter(function(elem, pos) {
            return Boards.indexOf(elem) == pos;
        });
        
        Boards.forEach(function(board) {
            limiter.removeTokens(1, function() {
                t.get("/1/boards/" + board + "/cards?fields=name,idList,url,dateLastActivity,idChecklists", function(err, data) {
                    if (err) {
                        throw err;
                    }

                    var theBoard = {
                        boardId: board,
                        lists: [],
                        cards: [],
                        checklists: []
                    };

                    data.forEach(function(entry) {
                        if (!arrayContains(entry.idList, theBoard.lists)) {
                            theBoard.lists.push(entry.idList);
                        }

                        // Here we got all boards, and their cards and lists.
                        theBoard.cards.push(entry);

                        // Pushing the array of checklists to theBoard.
                        theBoard.checklists.push(entry.idChecklists)

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
    });

    boardData = [];
};

// getAllCardsForEachUser
var getAllCardsForEachUser = function(notifiers) {
    var userArray = [];

    var counter = 0;

    notifiers.forEach(function(notify) {
        getTogglProjectSummary(notify, function(togglProject) {
            var d = new Date();
            d.setDate(today.getDate() - getDaysBetweenNotifiers(notify));
            var since = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();

            var user = {
                _id: notify._id,
                usermail: notify.email,
                boardId: notify.board,
                since: since,
                lists: []
            };

            // If notify includes a toggle project
            if (togglProject != null) {
                user["overallTime"] = togglProject.time;
            }

            if (notify.resend === true) {
                user["resend"] = true;
            }

            notify.lists.forEach(function(list) {
                var myCards = getAllCardsWithListId(notify, list._id);

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

    });

};

var getAllCardsWithListId = function(notify, listId) {
    var cards = [];
    var boardId = notify.board;

    boardData.forEach(function(board) {
        if (board.boardId == boardId) {

            board.cards.forEach(function(card) {

                if (card.idList == listId) {

                    var cardActivityTime = card.dateLastActivity.split("T")[0].split('-');
                    cardActivityTime = new Date(cardActivityTime[0], cardActivityTime[1] - 1, cardActivityTime[2]);

                    // Add card to list if days since cardActivityTime is less than daysBetweenNotify
                    if (numDaysBetween(today, cardActivityTime) < getDaysBetweenNotifiers(notify)) {
                        var myCard = {
                            name: card.name,
                            checklists: []
                        }

                        card.idChecklists.forEach(function(checklistId, i) {
                            fetchChecklist(checklistId, function(checklist) {
                                myCard.checklists.push(checklist);
                            });
                        });

                        cards.push(myCard);
                    }
                }
            });
        }
    });

    return cards;

};

// Fetch checklist data from checklistId
var fetchChecklist = function(checklistId, callback) {
    limiter.removeTokens(1, function() {
        t.get("/1/checklists/" + checklistId, function(err, data) {
            if (err) {
                throw err;
            }

            var checklist = {
                id: data.id,
                name: data.name,
                checkItems: []
            }

            data.checkItems.forEach(function(dataCheckItem) {
                var checkItem = {
                    id: dataCheckItem.id,
                    name: dataCheckItem.name,
                    state: dataCheckItem.state
                }
                checklist.checkItems.push(checkItem);
            });

            return callback(checklist);
        });
    });
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
            limiter.removeTokens(1, function() {
                t.get("/1/lists/" + list.listId + "?fields=name", function(err, data) {
                    if (err) {
                        throw err;
                    }

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
    limiter.removeTokens(1, function() {
        t.get("/1/members/me?fields=username,fullName,url&boards=all&board_fields=name", function(err, data) {
            if (err) {
                throw err;
            }

            // Setting the boardSize to the length of all boards
            boardSize = data.boards.length;

            // forEach on each board of all boards accessable by user
            data.boards.forEach(function(aBoard) {
                // Setting the boardPath to /1/boards/aBoard (aBoard is a id of one of all boards)
                // The purpose of this function is to get all names of all boards and put it into a array, and send this array back
                // to the client end
                counter++;
                var currentBoard = new Board(aBoard.id, aBoard.name);
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
            emailContent += "<table style='width: 100%; background-color: #F3F3F3; padding-bottom: 5%; padding-top: 5%;'><tr><td>";
            emailContent += "<table align='center' style='font-family: Helvetica,Arial,sans-serif; background-color: #fff; font-size: 14px; margin: 0 auto; width: 580px; border-radius: 10px;'>";
            emailContent += "<tbody style='background-color: #fff; margin: 0 auto; border: 1px solid #dadada;'>";
            emailContent += "<tr style='height: 125px;'>"
            emailContent += "<th align='center' style='background-color: #0E74AF; width: 100%; margin:0 auto; border-top-left-radius: 10px; border-top-right-radius: 10px; border: 25px solid #0E74AF;'><h1 style='margin: 0 !important; color:#fff; font-size: 12px; text-transform: uppercase; padding-bottom: 7px; font-size: 20px;'>" + getBoardName(user.boardId) + "</h1><h2 style='margin: 0 !important; padding-top: 7px; color: #fff;font-size: 10px; text-transform: uppercase;'>Changes performed by Mail Notifications for Trello</h2></th></tr>";
            emailContent += "<tr>";
            emailContent += "<td align='center' style='padding-top: 15px; padding-bottom: 15px; padding-left: 5%; padding-right: 5%;'><br>Here is an overview of the changes committed in your Trello boards.</td>";
            emailContent += "</tr>";

            if (user.overallTime != null) {
                var x = user.overallTime / 1000;
                x /= 60;
                var minutes = x % 60 | 0;
                x /= 60;
                var hours = x | 0;
                emailContent += "<tr>";
                emailContent += "<td align='center' style='padding-top: 5px; padding-bottom: 5px; padding-left: 5%; padding-right: 5%;'>Time spent in Toggl: <b>" + hours + " hours and " + minutes + " minutes.</b></td>";
                emailContent += "</tr>";
            }

            var styleColor = "#000000";

            user.lists.forEach(function(list) {
                emailContent += "<tr><td style='padding-top: 15px; padding-bottom: 15px; padding-left: 5%; padding-right: 5%;'>";
                emailContent += "<h2 style='letter-spacing: 1px; text-transform: uppercase; font-size: 14px; border-bottom: 1px solid #F0F0F0; padding-bottom: 7px; color: " + styleColor + "'>" + getListName(list.listId) + "</h2>";
                emailContent += "<ul>";

                list.cards.forEach(function(card) {
                    emailContent += "<li style='margin-top: 10px; margin-bottom: 10px; font-size: 14px; list-style-type: circle; color: " + styleColor + "'>" + card.name + "</li>";

                    card.checklists.forEach(function(checklist) {
                        emailContent += "<table style='width: 100%; margin-top: 5px;'>";
                        emailContent += "<tr><td style='font-family: Helvetica,Arial,sans-serif; font-size: 14px; margin: 0; padding-left: 2.5%; color: " + styleColor + ";'>" + checklist.name + "</td></tr>"
                        checklist.checkItems.forEach(function(checkItem) {
                            var state = "&#9633;";
                            if (checkItem.state === "complete") {
                                state = "&#10003;";
                            }
                            emailContent += "<tr><td style='font-family: Helvetica,Arial,sans-serif; font-size: 14px; padding: 5px 0px 5px 5%;'>" + state + " " + checkItem.name + "</td></tr>";
                        });
                        emailContent += "</table>";
                    });
                });
                emailContent += "</ul></td></tr>";
            });

            emailContent += "<br>";
            emailContent += "</tbody>";
            emailContent += "<tr align='center'><td style=' background-color: #0E74AF; color: #fff; padding-bottom: 20px;padding-top: 20px;border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; font-size: 11px;'><strong>Thank you for using our plugin</td></tr>";
            emailContent += "</table>";

            sendEmailToUser(emailContent, user.usermail, user._id, user.resend);

        }
    });
};

// Update lastNotify in notify when sending emails
var updateLastNotified = function(userId) {
    Notifier.findOne({
        _id: userId
    }, function(err, notifier) {
        if (notifier === undefined || notifier === null) {
            console.log("Failed to update lastNotified");
        } else {
            notifier.lastNotified = new Date();
            notifier.save();
            console.log("lastNotified updated for id: " + userId);
        }
    });
}


// Send the email to the user
var sendEmailToUser = function(emailContent, email, userId, resend) {

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
            if (resend != true) {
                updateLastNotified(userId);
            }
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
    t.get("/1/members/me?fields=username,fullName,url&boards=all&board_fields=name", function(err, data) {
        if (err) {
            throw err;
        }

        // Setting the boardSize to the length of all boards
        boardSize = data.boards.length;

        // forEach on each board of all boards accessable by user
        data.boards.forEach(function(aBoard) {
            counter++;
            var currentBoard = new Board(aBoard.id, aBoard.name);
            boardArray.push(currentBoard);
            if (counter === boardSize) {
                res.send(boardArray);
            }
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

/*===================================================
=            Functions for Toggl Projects            =
===================================================*/

var getTogglProjects = function(callback) {
    var options = {
        "method": "GET",
        "hostname": "toggl.com",
        "path": "/api/v8/me?user_agent=mailnotifiersForTrello&workspace_id=" + config.togglWorkspaceId + "&with_related_data=true",
        "headers": {
            "authorization": "Basic " + new Buffer(config.togglApplicationKey + ":" + "api_token").toString("base64")
        }
    };

    var req = http.request(options, function(res) {
        if (res.statusCode == 404 || res.statusCode == 403) {
            console.log(res.statusCode + ": Toggl api FAILED!");
            req.abort();
        } else {
            var chunks = [];

            res.on("data", function(chunk) {
                chunks.push(chunk);
            });

            var projects = [];
            res.on("end", function() {
                var body = Buffer.concat(chunks);
                var json = JSON.parse(body);
                json.data.projects.forEach(function(entry) {
                    var project = {
                        'id': entry.id,
                        'name': entry.name
                    }
                    projects.push(project);
                });
                callback.send(projects);
            });
        }
    });

    req.on("error", function(e) {
        console.log(e);
    });

    req.on("timeout", function() {
        console.log("toggl api timed out");
        req.abort();
    });

    req.setTimeout(30000);
    req.end();
};

var getTogglProjectSummary = function(notify, callback) {
    if (notify.togglProject === undefined || notify.togglProject === "none") {
        return callback(null);
    } else {
        var d = new Date();
        d.setDate(today.getDate() - getDaysBetweenNotifiers(notify));
        var since = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

        var options = {
            "method": "GET",
            "hostname": "toggl.com",
            "path": "/reports/api/v2/summary?user_agent=mailnotifiersForTrello&workspace_id=" + config.togglWorkspaceId +
                "&project_ids=" + notify.togglProject + "&since=" + since + "",
            "headers": {
                "authorization": "Basic " + new Buffer(config.togglApplicationKey + ":" + "api_token").toString("base64")
            }
        };

        if (notify.billableHours === true) {
            options["path"] += "&billable=yes";
        }
        if (notify.rounding === true) {
            options["path"] += "&rounding=on";
        }

        var req = http.request(options, function(res) {
            if (res.statusCode == 404 || res.statusCode == 403) {
                console.log(res.statusCode + ": Toggl api FAILED!");
                req.abort();
            } else {
                var chunks = [];

                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });

                var projects = [];
                res.on("end", function() {
                    var body = Buffer.concat(chunks);
                    var json = JSON.parse(body);
                    json.data.forEach(function(entry) {
                        var project = {
                            'id': entry.id,
                            'title': entry.title.project,
                            'time': entry.time
                        }
                        projects.push(project);
                    })
                    if (projects.length === 1) {
                        return callback(projects[0]);
                    } else {
                        return callback(null);
                    }
                });
            }
        });

        req.on("error", function(e) {
            console.log(e);
        });

        req.on("timeout", function() {
            console.log("timeout");
            req.abort();
        });

        req.setTimeout(30000);
        req.end();
    };
};
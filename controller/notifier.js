module.exports = function(app, db, Notifier, isAuthenticated) {

    // Function for creating a new notifier
    var createNewNotifier = function(req, res) {

        // Setting up internal vars (projectname, email, board)
        var project_name, board;
        var email = [];
        var lists = [];
        var continueThis;
        // Number of days between email notifications. Will use global config value if null
        var daysBetweenNotify;
        var togglProject, billableHours, rounding;
        var notifyDay;

        // letMeContinue saves the notifier to our mongodb server - this will only happend if continueThis is true.
        // This is my best example of a callback function
        var letMeContinue = function(continueThis) {
                if (continueThis) {
                    project_name = req.body.project_name;
                    email = req.body.email;
                    daysBetweenNotify = req.body.daysBetweenNotify;
                    notifyDay = parseInt(req.body.notifyDay);
                    board = req.body.board;

                    if (req.body.togglProject === undefined) {
                        togglProject = "none";
                    } else {
                        togglProject = req.body.togglProject;
                    }

                    billableHours = req.body.billableHours;
                    rounding = req.body.rounding;
                    lists = req.body.lists;

                    // Creating a Notifier object. Setting project, email and boardId - made from the webform
                    var myNotifier = new Notifier();
                    myNotifier.project = project_name;
                    myNotifier.email = email;
                    myNotifier.daysBetweenNotify = daysBetweenNotify;
                    myNotifier.notifyDay = notifyDay;
                    myNotifier.board = board;
                    myNotifier.togglProject = togglProject;
                    myNotifier.billableHours = billableHours;
                    myNotifier.rounding = rounding;

                    // If type of req.body.lists is only one (only one list checked), then push that into a array lists in notifier object
                    if (typeof req.body.lists === "string") {
                        myNotifier.lists.push(lists);
                    } else {
                        // If type of req.body.lists is not string, it is probably a array, so everthing in this array should be pushed into
                        // notifier objects array.
                        req.body.lists.forEach(function(entry) {
                            myNotifier.lists.push(entry);
                            //console.log(entry);
                        });
                    }
                    // Send back response about everything is okay (to the client).
                    res.status(200);
                    // Send also the object back.
                    res.send(myNotifier);

                    // Save the object internally.
                    myNotifier.save();

                }
            }
            // ContinueThis is equal to checking the notifier body (by request), there is specificed a 
            // letMeContinue callback, if this is set to true - the above function will be run.
        continueThis = checkNotifierBody(req, res, letMeContinue);
    }

    // Function of removing a notifier
    var removeNotifier = function(req, res) {
        Notifier.findOne({
            _id: req.body.notifier_id
        }, function(err, notifier) {
            if (notifier === undefined || notifier === null) {
                res.status(400).send("Notifier does not exist");
            } else {
                notifier.remove();
                notifier.save();
                res.status(200);
                res.send("Deleted!");
            }
        });
    }

    // Function of checking up on the notifier body
    var checkNotifierBody = function(req, res, callback) {
        if (req.body.project_name === "" || req.body.project_name === undefined && continueThis) {
            res.status(418);
            res.send("<center><strong>Empty project name</strong></center>");
            return false;
        } else if (req.body.email === undefined || req.body.email === "") {
            res.status(418);
            res.send("<center><strong>Empty email</strong></center>");
            return false;
        }

        //res.send(req);
        else if (req.body.board === undefined) {
            res.status(418);
            res.send("<center><strong>No board selected!</strong></center>");
            return false;
        } else if (req.body.lists === undefined) {
            res.status(418);
            res.send("<center><strong>No lists chosen</strong></center>");
            return false;
        } else {
            callback(true);
        }
    }

    // Function of updating a notifier (locally - no post / set or anything alike is sent to Trello)
    var updateNotifier = function(req, res) {
        var continueThis;

        var letMeContinue = function(continueThis) {
            if (continueThis === true) {
                Notifier.findOne({
                    _id: req.body.notifier_id
                }, function(err, notifier) {
                    if (notifier === undefined || notifier === null) {
                        res.status(400).send("Notifier does not exist");
                    } else {
                        notifier.board = req.body.board;
                        notifier.project = req.body.project_name;
                        notifier.email = req.body.email;
                        notifier.daysBetweenNotify = req.body.daysBetweenNotify;
                        notifier.notifyDay = parseInt(req.body.notifyDay);
                        notifier.togglProject = req.body.togglProject;
                        notifier.billableHours = req.body.billableHours;
                        notifier.rounding = req.body.rounding;
                        notifier.lists = [];

                        if (typeof req.body.lists === "string") {
                            notifier.lists.push(req.body.lists);
                        } else {
                            req.body.lists.forEach(function(entry) {
                                notifier.lists.push(entry);
                            });
                        }

                        res.status(200);
                        res.send("Updated");
                        notifier.save();
                    }
                });
            }

        }

        continueThis = checkNotifierBody(req, res, letMeContinue);
    }

    // Function of getting all Notifiers
    var getAllNotifiers = function(req, res) {
        Notifier.find({}, function(err, notifiers) {
            var notifierMap = {};

            notifiers.forEach(function(user) {
                notifierMap[user._id] = user;
            });

            res.send(notifierMap);
        });
    }

    // Function of getting a single notifier (used when Modal box pops up)
    var getOneNotifier = function(req, res) {
        //console.log(req.params);
        Notifier.findOne({
            _id: req.params.id
        }, function(err, notifier) {
            if (notifier === undefined || notifier === null) {
                res.status(400).send("Notifier not found");
            } else {
                res.status(200).send(notifier);
            }
        });
    }

    // Post request of making a notifier
    app.post("/mongies/notifiers/post", isAuthenticated, function(req, res) {
        createNewNotifier(req, res);
    });
    // Post request of removing one notifier
    app.post("/mongies/notifiers/removeOne", isAuthenticated, function(req, res) {
        removeNotifier(req, res);
    });

    // Post request of updating one notifier
    app.post("/mongies/notifiers/updateOne", isAuthenticated, function(req, res) {
        updateNotifier(req, res);
    });

    // Get request of all notifiers (locally)
    app.get("/mongies/notifiers/all", isAuthenticated, function(req, res) {
        getAllNotifiers(req, res);
    });

    // Get request on a single notifier by ID
    app.get("/mongies/notifiers/:id", isAuthenticated, function(req, res) {
        getOneNotifier(req, res);
    });

};
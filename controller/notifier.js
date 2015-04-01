module.exports = function (app, db, Notifier) {

	// Function for creating a new notifier
	var createNewNotifier = function(req, res){

	// Setting up internal vars (projectname, email, board)
	var project_name, email, board;
	var lists = [];
	var continueThis;

	    // letMeContinue saves the notifier to our mongodb server - this will only happend if continueThis is true.
	    // This is my best example of a callback function
	    var letMeContinue = function(continueThis){
		    if(continueThis){
		      project_name = req.body.project_name;
		      email = req.body.email;
		      board = req.body.board;
		      lists = req.body.lists;

			// Creating a Notifier object. Setting project, email and boardId - made from the webform
		      var myNotifier = new Notifier();
		      myNotifier.project = project_name;
		      myNotifier.email = email;
		      myNotifier.board = board;

			// If type of req.body.lists is only one (only one list checked), then push that into a array lists in notifier object
		      if( typeof req.body.lists === "string"){
		        myNotifier.lists.push(lists);
		      } else {
		      	// If type of req.body.lists is not string, it is probably a array, so everthing in this array should be pushed into
		      	// notifier objects array.
		        req.body.lists.forEach(function(entry){
		          myNotifier.lists.push(entry);
		          console.log(entry);
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
		
	    continueThis = checkNotifierBody(req, res, letMeContinue);
	}

	var removeNotifier = function(req, res){
		Notifier.findOne({ _id : req.body.notifier_id }, function (err, notifier){
  			if(notifier === undefined || notifier === null){
				res.status(400).send("Notifier does not exist");
			} else {
			     notifier.remove();
			     notifier.save();
			     res.status(200);
			     res.send("Deleted!");
			}
	    });
	}

	var checkNotifierBody = function(req, res, callback){
		if(req.body.project_name === "" || req.body.project_name === undefined && continueThis){
	      res.status(418);
	      res.send("<center><strong>Empty project name</strong></center>");
	      return false;
	    }

	    else if(req.body.email === undefined || req.body.email === ""){
	      res.status(418);
	      res.send("<center><strong>Empty email</strong></center>");
	      return false;
	    }

	    //res.send(req);
	    else if(req.body.board === undefined){
	      res.status(418);
	      res.send("<center><strong>No board selected!</strong></center>");
	      return false;
	    }

	    else if(req.body.lists === undefined){
	      res.status(418);
	      res.send("<center><strong>No lists chosen</strong></center>");
	      return false;
	    }

	    else {
	    	callback(true);
	    }
	}

	var updateNotifier = function (req, res){
	  	var continueThis;

	  	var letMeContinue = function(continueThis) {
	  		if(continueThis === true){
		  		Notifier.findOne({ _id : req.body.notifier_id }, function (err, notifier){
		  			if(notifier === undefined || notifier === null){
		  				res.status(400).send("Notifier does not exist");
		  			} else {
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
				    }
		  		});
	  		}

		}

		continueThis = checkNotifierBody(req, res, letMeContinue);
	}

	var getAllNotifiers = function(req, res){
		Notifier.find({}, function(err, notifiers){
			var notifierMap = {};

			notifiers.forEach(function(user){
			  notifierMap[user._id] = user;
			});

			res.send(notifierMap);
		});
	}

	var getOneNotifier = function (req, res){
		console.log(req.params);
		Notifier.findOne({_id : req.params.id}, function(err, notifier){
  			if(notifier === undefined || notifier === null){
  				res.status(400).send("Notifier not found");
  			} else {
  				console.log("Hello!");
  				res.status(200).send(notifier);
  			}
		});
	}


    app.get('/users', function(req, res, next) {
        myFunction();
        res.send("Hello!");
    });

    app.post("/mongies/notifiers/post", function (req, res){
	    createNewNotifier(req, res);
	});

	app.post("/mongies/notifiers/removeOne", function (req, res){
	    removeNotifier(req, res);
	});


	app.post("/mongies/notifiers/updateOne", function (req, res){
		updateNotifier(req, res);
	});

	app.get("/mongies/notifiers/all", function(req, res){
		getAllNotifiers(req, res);
	});

	app.get("/mongies/notifiers/:id", function(req,res){
		getOneNotifier(req, res);
	});

	app.get("mongies/notifiers/deleteAll", function(req, res){
		Notifier.remove({}, function(err){
			res.send('collection removed');
		});
	});




};

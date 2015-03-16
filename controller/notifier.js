module.exports = function (app, db, Notifier) {

	var createNewNotifier = function(req, res){
		var project_name, email, board;
	    var lists = [];

	    var letMeContinue = function(continueThis){
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
		}

	    continueThis = checkNotifierBody(req, res, letMeContinue);
	}

	var removeNotifier = function(req, res){
		Notifier.findOne({ _id : req.body.notifier_id }, function (err, notifier){
			if(notifier === undefined){
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




    app.get('/users', function(req, res, next) {
        myFunction();
        res.send("Hello!");
    });

    app.post("/mongies/notifiers/post", function (req, res){
	    createNewNotifier(req, res);
	});

	app.post("/mongies/notifiers/remove", function (req, res){
	    removeNotifier(req, res);
	});

};

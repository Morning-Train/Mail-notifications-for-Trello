module.exports = function (app, db, Notifier) {

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

}
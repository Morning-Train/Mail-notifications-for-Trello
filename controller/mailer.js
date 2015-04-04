  // This is the fun part, here is the "POST" method, that handles the email send to customers. Btw, it also includes alot of other stuff - read on.
  exports.sendMail = function(pEmail, pBoard, pLists, async, t, daysBetweenNotifiers, transporter, myName, myEmail){
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
    
      // Handling error and send it to me (we don't really use this yet)
      function errorHandling (err) {
        console.error(err);
      }

      // Boolean state for continuing sending an email
      var justContinue = true;
      
      // Defining userEmail, userBoard and WantedLists, from the request body. (Sent to us through JSON)
      var userEmail = pEmail;
      var userBoard = pBoard;
      var wantedLists = pLists;

      if(justContinue){

            // Is Email, BoardID and ListID defined? (['*'] = all lists) - the star hack does only work with directly sent requestes.
            if(userEmail === undefined || userBoard === undefined || wantedLists === undefined){
            errorHandling("Email, BoardID or ListID is not specificed");
      } else {
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

          // Init'd emailContent (this variable at final will be sent to a user ("userEmail")
          var emailContent = "";

          // This variable is set for checking up on if there should be sent an email or not.
          // If there is no changes in the specified lists,
          // for the last 7 days, then this script will run with boolSendMail as false. (Result: no mail sent)
          // If this is set to true, the content in emailContent will be sent to a user. (Will tell more about it later)

          var boolSendMail = false;

            // This is the famous async calls, read up on series and waterfall - heavy shit.
            async.series([
              function(callback){
                // code a
                // Console.log for linebreak and indicating where in the script we are.
                console.log("|a|");

                // Connection to trello object and trello api, and try getout the specified boardId name.
                t.get(boardPath, function(err, data) {
                  if(err){
                    console.log(err);
                  } else {
                    boardName = data.name;
                    // Saying continue after this point - to the next function in line
                    callback(null, "a");
                  }
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
                        //console.log(data[k].name);
                      }

                      // If everything is cool, just continue (all cards have been checked).
                      if(doublecounter == data.length){
                        continueThis = true;
                      }
                    }

                    // If all cards have been checked, and all lists have been checked - continue.
                    if(counter == boardLists.length && continueThis){
                        console.log(" |abc|  OK");
                        callback(null, "c");
                    }
                  });
                }

                //console.log(boardLists);
              },
              function(callback){
                // code d
                // console.log();
                // console.log("|abcd|");
                var styleColor = "";

                // Email content starts from here
                emailContent += "<meta charset='UTF-8'>";
                emailContent += "<div style='width: 100%; background-color: #F3F3F3; padding-bottom: 5%; padding-top: 5%;'>";
                emailContent += "<table align='center' style='font-family: arial,sans-serif; background-color:#fff; margin: 0 auto; max-width: 950px;width: 95%; border-radius: 10px;'>";
                emailContent += "<tbody style='background-color: #fff; margin: 0 auto; border: 1px solid #dadada;'>";
                emailContent += "<th align='center' style='background-color: #0E74AF; width: 100%; margin:0 auto; border-top-left-radius: 10px; border-top-right-radius: 10px; border: 25px solid #0E74AF;'><h1 style='  margin: 0 !important; color:#fff; font-size: 12px; text-transform: uppercase; padding-bottom: 7px; font-size: 20px;'>Email-Notifier</h1><h2 style='   margin: 0 !important; padding-top: 7px;  color: #fff;font-size: 10px; text-transform: uppercase;'>Your notifier from your Trello boards</h2></th>";
                emailContent += "<tr>";
                emailContent += "<td align='center' style='padding-top: 50px; padding-bottom: 5px; padding-left: 5%; padding-right: 5%;'>"+ myName +" is working at " + boardName + "</td>";
                emailContent += "</tr>";
                emailContent += "<tr>";
                emailContent += "<td align='center' style='padding-top: 5px; padding-bottom: 5px; padding-left: 5%; padding-right: 5%;'>Here is a overview of what have changed:</td>";
                emailContent += "</tr>";

                boardLists.forEach(function(entry){
                  emailContent += "<tr><td style='padding-top: 15px; padding-bottom: 15px; padding-left: 5%; padding-right: 5%;'>";

                if(arrayIndexOf(wantedLists, entry._id) !== -1 || wantedLists[0] === "*"){
                    if(entry._cards.length !== 0){
                      boolSendMail = true;
                      // console.log(" - " + entry._name);
                      emailContent += "<h2 style='  letter-spacing: 1px; text-transform: uppercase;  font-size: 14px;   border-bottom: 1px solid #F0F0F0; padding-bottom: 7px;'><font color='" + styleColor + "'>" + entry._name + "</font></h2>";
                      emailContent += "<ul style='  margin-top: 30px;'>";
                      entry._cards.forEach(function(cards){
                        // console.log(" -- " + cards[0]);
                        emailContent += "<li style='margin-top: 10px; margin-bottom:10px; font-size: 14px; list-style-type: circle;'><font color='" + styleColor + "'>" + cards[0] + "</font></li>";
                      });
                      emailContent += "</ul>";

                    }
                  }



                  //console.log(arrayIndexOf(wantedLists, entry._id));
                  // entry._name == listname
                  // cards 0 = cardname
                     emailContent += "</td></tr>";
                });

                // emailContent += "<br>";
                // emailContent += "Med venlig hilsen <br>";
                // emailContent += "<img src='http://morningtrain.dk/wp-content/uploads/2014/09/webbureau-odense-programmering.png' alt='Morning Train Technologies'>";
                emailContent += "</tbody>";
                emailContent += "<tr align='center'><td style=' background-color: #0e74af; color: #fff; padding-bottom: 20px;padding-top: 20px;border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;   font-size: 11px;'>Thank you for using our plugin</td></tr>";
                emailContent += "</table>";
                emailContent += "</div>";

                // console.log(" |abcd|  OK");
                callback(null, "d");
              }],
              // optional callback
              function (err, results){
                // results is ['a', 'b', 'c', 'd']
                // final callback code
                // console.log();
                // console.log("|abcd-f|");

                var today = new Date();
                var weekno = today.getWeek();
                var year = today.getFullYear();

                // NB! No need to recreate the transporter object. You can use
                // the same transporter object for all e-mails

                // setup e-mail data with unicode symbols
                var mailOptions = {
                    from: "" + myName + " <" + myEmail + ">", // sender address
                    to: "" + userEmail, // list of receivers
                    subject: "Changes in week: " + weekno + " - " + year, // Subject line
                    html: emailContent // html body
                };

                if(boolSendMail){
                  // send mail with defined transport object
                  transporter.sendMail(mailOptions, function(error, info){
                      if(error){
                          console.log(userEmail);
                          console.log(error);
                      }else{
                          console.log("Message sent to: " + userEmail + ", " + info.response);
                      }
                  });
                }

                // console.log(emailContent);
                // console.log();

                // console.log(err);
                // console.log(results);
              }
            );
      }
    } else {
      console.log("Sorry, we are closed today");
    }

  }

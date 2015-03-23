
/*=====================================================
=            Configuration of Trello-Train            =
=====================================================*/

var config = {};

/* Numbers between days of changes (in Trello Lists) */
config.daysBetweenNotifiers = 7; // Default is 7

/* Trello API Access */
config.trelloApplicationKey = "<<INSERT YOUR APPLICATION KEY>>" // Read https://trello.com/docs/gettingstarted/index.html#getting-an-application-key
config.trelloUserToken = "<<INSERT YOUR TRELLO USER TOKEN>>" // Read https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user

/* Email settings */
config.myEmail = "<<INSERT YOUR EMAIL>>";
config.myName = "<<INSERT YOUR NAME>>";

/* SMTP Settings (For outgoing mail)*/
config.settingsForTransporter = {
  service: "<<INSERT YOUR MAIL SERVICE>>",
  auth: {
      user: "<<INSERT YOUR MAIL USER>>",
      pass: "<<INSERT YOUR MAIL PASS>>"
  }
}

/*-----  End of Configuration of Trello-Train  ------*/
module.exports = config;
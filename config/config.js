
/*=====================================================
=            Configuration of Trello-Train            =
=====================================================*/

var config = {};

/* Numbers between days of changes (in Trello Lists) */
config.daysBetweenNotifiers = 30; // Default is 7

/* Trello API Access */
config.trelloApplicationKey = "<< Application Key >>"; // Read https://trello.com/docs/gettingstarted/index.html#getting-an-application-key
config.trelloUserToken = "<< User Token >>"; // Read https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user

/* Email settings */
config.myEmail = "<< Your email >>";
config.myName = "<< Your name >>";

/* SMTP Settings (For outgoing mail)*/
config.settingsForTransporter = {
  service: "<< Your service >>",
  auth: {
      user: "<< Your service email >>",
      pass: "<< Your service pass >>"
  }
};

config.serverport = 3000;

/*-----  End of Configuration of Trello-Train  ------*/
module.exports = config;

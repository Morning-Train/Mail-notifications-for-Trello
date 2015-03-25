
/*=====================================================
=            Configuration of Trello-Train            =
=====================================================*/

var config = {};

/* Numbers between days of changes (in Trello Lists) */
config.daysBetweenNotifiers = 7; // Default is 7

/* Trello API Access */
config.trelloApplicationKey = "b7a8480d496fa90c36f9f2d02020e25b" // Read https://trello.com/docs/gettingstarted/index.html#getting-an-application-key
config.trelloUserToken = "0bf31a4ea7b08e514839f76a0dda3c5bcb6f133a6a85e6954d4bdb9b03eabc88" // Read https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user

// Secs & Mins & Hours & Day of Month & Months & Day of Week (Read more here: https://github.com/ncb000gt/node-cron)
config.crontime = '* * 08 * * 1';
config.crontimezone = "Europe/Copenhagen";


/* Email settings */
config.myEmail = "<< Your email >>";
config.myName = "<< Your name >>";

/* SMTP Settings (For outgoing mail)*/
config.settingsForTransporter = {
  service: "<< Your service SMTP provider >>",
  auth: {
      user: "<< SMTP user >>",
      pass: "<< SMTP pass >>"
  }
}

config.serverport = 3000;

/*-----  End of Configuration of Trello-Train  ------*/
module.exports = config;
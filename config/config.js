
/*=====================================================
=            Configuration of Trello-Train            =
=====================================================*/

var config = {};

/* Numbers between days of changes (in Trello Lists) */
config.daysBetweenNotifiers = 7; // Default is 7

/* Trello API Access */
config.trelloApplicationKey = "<<Insert your Application Key>>" // Read https://trello.com/docs/gettingstarted/index.html#getting-an-application-key
config.trelloUserToken = "<<Insert your user Token>>" // Read https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user

// Secs & Mins & Hours & Day of Month & Months & Day of Week (Read more here: https://github.com/ncb000gt/node-cron)
config.crontime = '* * 08 * * 1'; // Default is monday morning at 8
config.crontimezone = "Denmark/Copenhagen";

/* Email settings */
config.myEmail = "<< Insert your email >>";
config.myName = "<< Insert your name >>";

/* SMTP Settings (For outgoing mail)*/
config.settingsForTransporter = {
  service: "<< SMTP service >>",
  auth: {
      user: "<< SMTP user >>",
      pass: "<< SMTP pass >>"
  }
}

config.serverport = 3002;

/*-----  End of Configuration of Trello-Train  ------*/
module.exports = config;
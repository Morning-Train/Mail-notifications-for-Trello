
/*=====================================================
=            Configuration of Trello-Train            =
=====================================================*/

var config = {};

/* Numbers between days of changes (in Trello Lists) */
config.daysBetweenNotifiers = 7; // Default is 7

/* Trello API Access */
config.trelloApplicationKey = "ef463438274bb639009b76098f83b026" // Read https://trello.com/docs/gettingstarted/index.html#getting-an-application-key
config.trelloUserToken = "f0349e689cc7a6bcee4d0200367129217c09ef21fb1ebd77b6573e3a0cad735a" // Read https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user

// Secs & Mins & Hours & Day of Month & Months & Day of Week (Read more here: https://github.com/ncb000gt/node-cron)
config.crontime = '10 * * * * *';
config.crontimezone = "Europe/Copenhagen";


/* Email settings */
config.myEmail = "mail@morningtrain.dk";
config.myName = "Morning Train";

/* SMTP Settings (For outgoing mail)*/
config.settingsForTransporter = {
  service: "Gmail",
  auth: {
      user: "fireflexy@gmail.com",
      pass: "playtime2a"
  }
}

config.serverport = 3000;

/*-----  End of Configuration of Trello-Train  ------*/
module.exports = config;
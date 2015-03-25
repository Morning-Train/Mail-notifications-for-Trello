
/*=====================================================
=            Configuration of Trello-Train            =
=====================================================*/

var config = {};

/* Numbers between days of changes (in Trello Lists) */
config.daysBetweenNotifiers = 7; // Default is 7

/* Trello API Access */
config.trelloApplicationKey = "ef463438274bb639009b76098f83b026" // Read https://trello.com/docs/gettingstarted/index.html#getting-an-application-key
config.trelloUserToken = "555e85a99d6528985a682d42d5efa992b9e3e1b447ffc69f06893377f633adfb" // Read https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user

// Secs & Mins & Hours & Day of Month & Months & Day of Week (Read more here: https://github.com/ncb000gt/node-cron)
config.crontime = '* * 08 * * 1';
config.crontimezone = "Europe/Copenhagen";


/* Email settings */
config.myEmail = "mail@morningtrain.dk";
config.myName = "Rubatharisan Thirumathyam";

/* SMTP Settings (For outgoing mail)*/
config.settingsForTransporter = {
  service: "Mandrill",
  auth: {
      user: "mail@morningtrain.dk",
      pass: ""
  }
}

config.serverport = 3000;

/*-----  End of Configuration of Trello-Train  ------*/
module.exports = config;

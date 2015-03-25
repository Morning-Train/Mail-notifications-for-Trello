
/*=====================================================
=            Configuration of Trello-Train            =
=====================================================*/

var config = {};

/* Numbers between days of changes (in Trello Lists) */
config.daysBetweenNotifiers = 7; // Default is 7

/* Trello API Access */
config.trelloApplicationKey = "<< Insert your application key >>" // Read https://trello.com/docs/gettingstarted/index.html#getting-an-application-key
config.trelloUserToken = "<< Insert your user token >>" // Read https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user

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

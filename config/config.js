
/*=====================================================
=            Configuration of Trello-Train            =
=====================================================*/

var config = {};

/* Numbers between days of changes (in Trello Lists) */
config.daysBetweenNotifiers = 7; // Default is 7

/* Trello API Access */
config.trelloApplicationKey = "ef463438274bb639009b76098f83b026" // Read https://trello.com/docs/gettingstarted/index.html#getting-an-application-key
config.trelloUserToken = "d0deb23a479200f4274823ca7e9432fcb00306278c4fb1b59bb2d4ad9bbce836" // Read https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user

// Secs & Mins & Hours & Day of Month & Months & Day of Week (Read more here: https://github.com/ncb000gt/node-cron)
config.crontime = '10 * * * * *';
config.crontimezone = "America/Los_Angeles";


/* Email settings */
config.myEmail = "mail@morningtrain.dk";
config.myName = "Morning Train";

/* SMTP Settings (For outgoing mail)*/
config.settingsForTransporter = {
  service: "Gmail",
  auth: {
      user: "fireflexy@gmail.com",
      pass: "bluetime2a"
  }
}

config.serverport = 3000;

/*-----  End of Configuration of Trello-Train  ------*/
module.exports = config;
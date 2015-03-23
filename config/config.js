
/*=====================================================
=            Configuration of Trello-Train            =
=====================================================*/

var config = {};

/* Numbers between days of changes (in Trello Lists) */
config.daysBetweenNotifiers = 7; // Default is 7

/* Trello API Access */
config.trelloApplicationKey = "ef463438274bb639009bX76098f83b026" // Read https://trello.com/docs/gettingstarted/index.html#getting-an-application-key
config.trelloUserToken = "d0deb23a479200f4274823ca7e9432fcb00306278c4fb1b59bb2d4ad9bbce836" // Read https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user

/* Email settings */
config.myEmail = "mail@morningtrain.dk";
config.myName = "Morning Train";

/* SMTP Settings (For outgoing mail)*/
config.settingsForTransporter = {
  service: "Mandrill",
  auth: {
      user: "mail@morningtrain.dk",
      pass: "neRUPd59dMEp4CxwaVgfeA"
  }
}

/*-----  End of Configuration of Trello-Train  ------*/
module.exports = config;
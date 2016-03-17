
/*=================================================================
=            Configuration of Mail notifier for Trello            =
==================================================================*/

var config = {};

/* Username for Baisc Auth */
config.username = "<< Your username >>";

/* Password for Basic Auth */
config.password = "<< Your password >>";

/* Numbers between days of changes (in Trello Lists) */
config.daysBetweenNotifiers = 7; // Default is 7

/* Trello API Access */
config.trelloApplicationKey = "<< Application Key >>"; // Read https://trello.com/docs/gettingstarted/index.html#getting-an-application-key
config.trelloUserToken = "<< User Token >>"; // Read https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user

/* Toggl API Access */
config.togglApplicationKey = "<< Application Token"; // Read https://support.toggl.com/my-profile/
config.togglWorkspaceId = "<< Workspace Id >>"; // Read https://support.toggl.com/workspace/

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

/* Express Session Secret */
config.sessionSecret = "mySecretKey";

config.serverport = 3000;

/*-----  End of Configuration of Trello-Train  ------*/
module.exports = config;

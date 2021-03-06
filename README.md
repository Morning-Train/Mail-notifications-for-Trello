## Mail notifications for Trello
###### Notify your customers when changes happens in your Trello boards with optional Toggl support for tracking time spent on your projects.

This was coded on an early [morningtrain.dk](http://morningtrain.dk/)


### The purpose of Mail notifications for Trello
The purpose of this application is to "notice" changes on a Trello
board, and send a email to a customer with the changes (only card name).
How this application notices changes is by checking out when there
has been activity on a single card. If the activity is within a
certain amount of days (default: 7), it will be a stored in a list and
at last sent to a specified email (often a client email-address). This is perfect for client projects where you can inform them of weekly changes automatically.

### Images of Mail notifications for Trello
#### Adding a notification
![alt text](https://morningtrain.dk/img/MailNotifier3-v2.png "Add Notifier Overview")
#### Overview of all notification setups
![alt text](https://morningtrain.dk/img/MailNotifier1-v2.png "All Notifiers Overview")
#### Edit a notification (modal box)
![alt text](https://morningtrain.dk/img/MailNotifier2-v2.png "Edit Notifier Modal box")
#### Email of a notification
![alt text](https://morningtrain.dk/img/MailNotifier4-v2.png "Email of Notification")

### Setting up Mail notifications for Trello
#### 1 Getting NodeJS:
You need to have NodeJS installed, you can get it here:
https://nodejs.org/download/

#### 2 Getting MongoDB:
You need to have MongoDB installed, you can get it here:
http://www.mongodb.org/downloads

#### 3 Cloning Mail notifications for Trello repository:
In your terminal write:


    $ git clone https://github.com/Morning-Train/Mail-notifications-for-Trello.git
    $ cd Mail-notifications-for-Trello
    $ npm install


The following modules will be installed:

- body-parser, 1.12.0

- bson, 0.2.21

- express, 4.12.2

- express-session, 1.13.0 

- mongodb, 1.4.34

- mongoose, 3.8.25

- node-trello, 1.0.1

- nodemailer, 1.3.1

- limiter, 1.1.0

- passport, 0.3.2

- passport-local, 1.0.0

- bcrypt, 0.8.5

#### 4 Setting up config file:
When your modules is installed, you need to open up config/config.js.
Inside here you need to set:

    config.username = "<<Insert your admin username>>"
    config.password = "<<Insert your admin password>>"
    config.sessionSecret = "<<Insert your session secret>>"



    config.trelloApplicationKey = "<<Insert your application key>>";
Read https://trello.com/docs/gettingstarted/index.html#getting-an-application-key for how to find your application key.



    config.trelloUserToken = "<<Insert your user token>>";
Read https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user for how to get a usertoken from with your application key.



    config.togglApplicationKey = "<<Insert your application token>>";
Read https://support.toggl.com/my-profile for how to find your application token. Note: this is optional.



    config.togglWorkspaceId = "<<Insert your Toggl Workspace Id>>";
Read https://support.toggl.com/workspace/ for how to setup workspaces. Your ID will be in the URL of the Workspace settings/reports. Note: this is optional.



	config.crontimezone = "Europe/Copenhagen";
Read https://github.com/ncb000gt/node-cron on how to set this.
Visit http://momentjs.com/timezone/ for finding your timezone.


	config.daysBetweenNotifiers = 7;
This will be the default number of days that should be between checking for changes (from today and the last 7 days). This can be any number you want.



	config.myEmail = "mail@morningtrain.dk";
Set this to your email or company email



	config.myName = "Morning Train";
Set this to your name or company name



	config.settingsForTransporter = {
	  service: "<<SMTP provider example: Gmail>>",
	  auth: {
	      user: "<<SMTP user>>",
	      pass: "<<SMTP password>>"
	  }
	}
Set this to your SMTP service provider, and SMTP user and SMTP pass. Read more here: https://github.com/andris9/Nodemailer

### Browser support

- IE10+
- Opera
- Chrome
- Firefox
- Safari

### Disclaimer
Please keep in mind, that we are not experts at NodeJS and "Mail notifications for Trello"
was not made with security in mind, but made with the perspective of
"ease of use" - anything that is an issue or unwisely handled for an
example: functions, methods, datastructures, etc. Please report them
to us or make a pull request. (Suggestions are always welcome!).

Please notice that we are not affiliated, associated, authorized, endorsed by or in any way officially connected to Trello, Inc. (www.trello.com) or Toggl (www.toggl.com).
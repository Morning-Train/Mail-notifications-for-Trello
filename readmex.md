## Trello-Train
###### Notify your customers when changes happens in your Trello boards.

### The purpose of Trello Train
The purpose of this application is to "notice" changes on a Trello
board, and send a email to a customer with the changes (only card name).
How this application notices changes is by checking out when there
has been activity on a single card. If the activity is within a
certain amount of days (default: 7), it will be a stored in a list and
at last sent to a specified email (often a client email-address). This is perfect for client projects where you can inform them of weekly changes automatically.

Please keep in mind, that we are not experts at NodeJS and Trello-Train
was not made with security in mind, but made with the perspective of
"ease of use" - anything that is an issue or unwisely handled for an
example: functions, methods, datastructures, etc. Please report them
to us or make a pull request. (Suggestions are always welcome!).


### Setting up Trello-Train
#### 1:
You need to have NodeJS installed, you can get it here:
https://nodejs.org/download/

#### 2:
You need to have MongoDB installed, you can get it here:
http://www.mongodb.org/downloads

#### 3:
In your terminal write:


    $ git clone git@github.com:Morning-Train/Trello-Train.git
    $ cd trellotrain
    $ npm install


The following modules will be installed:
- async, 0.9.0
- body-parser, 1.12.0
- bson, 0.2.21
- cron, 1.0.9
- express, 4.12.2
- mongodb, 1.4.34
- mongoose, 3.8.25
- node-trello, 1.0.1
- nodemailer, 1.3.1

### Browser support

- IE10+
- Opera
- Chrome
- Firefox
- Safari

### Disclaimer
Please keep in mind, that we are not experts at NodeJS and "Webhooks for Trello"
was not made with security in mind, but made with the perspective of
"ease of use" - anything that is an issue or unwisely handled for an
example: functions, methods, datastructures, etc. Please report them
to us or make a pull request. (Suggestions are always welcome!).

Please notice that we are not affiliated, associated, authorized, endorsed by or in any way officially connected to Trello, Inc. (www.trello.com).
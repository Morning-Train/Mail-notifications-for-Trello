# Trello-Train
###### Notify your customers, or use webhooks to perform specific actions, when changes happen in your Trello boards.

![image of dashboard]
(http://i62.tinypic.com/30idj87.jpg)

## The purpose of Trello Train
The purpose of this application is to "notice" changes on a Trello
board, and send a email to a customer with the changes (only card name).
How this application notices changes is by checking out when there
has been activity on a single card. If the activity is within a
certain amount of days (default: 7), it will be a stored in a list and
at last sent to a specified email (often a client email-address). This is perfect for client projects where you can inform them of weekly changes automatically.

We also included an interface for Trello webhooks,
this allows you to easily add a webhook to your Trello board, and make cool things happen when the board is changed.

Please keep in mind, that we are not experts at NodeJS and Trello-Train
was not made with security in mind, but made with the perspective of
"ease of use" - anything that is an issue or unwisely handled for an
example: functions, methods, datastructures, etc. Please report them
to us or make a pull request. (Suggestions are always welcome!).


## Setting up Trello-Train
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
- Node Trello
- Async
- NodeMailer
- Express
- Body Parser
- Mongoose

## Browser support

- IE10+
- Opera
- Chrome
- Firefox
- Safari
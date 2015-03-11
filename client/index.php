<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Trello-Train</title>
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <link href='http://fonts.googleapis.com/css?family=Titillium+Web:400,700,600,300italic' rel='stylesheet' type='text/css'>
</head>
<body>
    <div id="loader">
    </div>

    <!-- Notify Modal Box -->
    <div class="modal-wrap notify">
        <div class="modalbox">
            <div class="close-btn">X</div>
            <form id="modal-form" class="modal-form" action="#update-mail-notifier" method="POST">
                <input type="hidden" name="notifier_id" id="modal-notifier-id">
                <fieldset>
                    <label for="project">Projectname:</label>
                    <input type="text" placeholder="Super awesome project" name="project_name" id="modal-project" autocomplete="off">
                </fieldset>

                <fieldset>
                    <label for="email">Email:</label>
                    <input type="email" placeholder="email@example.com" name="email" id="modal-email" autocomplete="off">
                </fieldset>

                <fieldset>
                    <label for="board">Boardname:</label>
                        <select name="board" id="mySoloBoards">

                        </select>
                </fieldset>

                <fieldset id="radio-btn">
                    <h3>Listnames:</h3>
                    <input type="checkbox" name="title" id="testing" value="Testing"><label for="testing">Testing</label>
                    <input type="checkbox" name="titles" id="this" value="This"><label for="this">This</label>
                    <input type="checkbox" name="title" id="testing" value="Testing"><label for="testing">Testing</label>
                    <input type="checkbox" name="titles" id="this" value="This"><label for="this">This</label>
                    <input type="checkbox" name="title" id="testing" value="Testing"><label for="testing">Testing</label>
                    <input type="checkbox" name="titles" id="this" value="This"><label for="this">This</label>
                    <input type="checkbox" name="title" id="testing" value="Testing"><label for="testing">Testing</label>
                    <input type="checkbox" name="titles" id="this" value="This"><label for="this">This</label>
                    <input type="checkbox" name="titles" id="this" value="This"><label for="this">This</label>
                </fieldset>

                <input type="submit" value="Update" id="modal-submit">
                <input type="submit" value="Remove" id="modal-rmv" class="remove-record">
                <input type="hidden" name="submitted" value="true">
            </form>
        </div>
    </div>

    <!-- Webhooks Modal Box -->
    <div class="modal-wrap webhooks">
        <div class="modalbox web-box">
            <div class="close-btn web-btn">X</div>
            <form class="modal-form modal-web" action="#submit-answer" method="POST">
                <input type="hidden" id="webhooks_id">
                <fieldset>
                    <label for="board">Board:</label>
                        <select class="mySoloBoards">
                        </select>
                </fieldset>

                <fieldset>
                    <label for="modal-desc">Description:</label>
                    <textarea name="desc-area" id="modal-desc" autocomplete="off"></textarea>
                </fieldset>

                <fieldset>
                    <label for="modal-url">Callback URL:</label>
                    <input type="textarea" name="callback-area" id="modal-url" autocomplete="off">
                </fieldset>

                <input type="submit" value="Update" id="modal-webhooks-submit">
                <input type="submit" value="Remove" id="modal-webhooks-rmv">
                <input type="hidden" name="submitted" value="true">
            </form>
        </div>
    </div>

    <header>
        <h1>Trello-train</h1>
    </header>

    <!-- Submit divs with error/success -->
    <div id="submit-success">
        <h3>Successfully created new record!</h3>
    </div>

    <div id="submit-error">
        <h3>Error occured in creating new record!</h3>
    </div>

    <!-- Content tabs -->
    <div class="tab green">
        <div class="tab-desc">
        <p>Email Notify</p>
        </div>
        <div class="tab-img">
        <img src="img/mail.svg" alt="mail">
        </div>
    </div>
    <div class="tab blue">
        <div class="tab-desc">
        <p>Webhooks</p>
        </div>
        <div class="tab-img">
        <img src="img/w.svg" alt="webhooks">
        </div>
    </div>
    <div class="clearfix"></div>

    <!-- NOTIFY EMAIL CONTENT START -->
    <div id="notify-content">
        <h1>Email Notify</h1>
        <!-- Add new mail notify -->
        <form id="new-custom-frm" action="#submit-answer" method="POST">
            <label for="board">Board:</label>
            <select id="myBoards">
                <option value="none">None chosen</option>
            </select>
                <fieldset id="new-radio-btn" style="display: none">
                    <div id="lists">
                    </div>
                </fieldset>

            <label for="project">Projectname:</label>
            <input type="text" placeholder="Super awesome project" id="project" name="project_name" autocomplete="off">

            <label for="email">Email:</label>
            <input type="email" placeholder="email@example.com" id="email" name="email" autocomplete="off">

            <input type="submit" value="Submit" id="frm-submit">
            <input type="hidden" name="submitted" value="true">
        </form>

        <div id="submit-answer"></div>

        <!-- Display all mail notifiers -->
        <form id="sub-frm" class="clearfix">
            <h2>Current Email Notifiers</h2>
            <div id="field-info" class="clearfix">
                <div class="field-info-item"><p>Projectname</p></div>
                <div class="field-info-item res-hide"><p>Email</p></div>
                <div class="field-info-item"><p>Boardname</p></div>
                <div class="edit"><p>Edit</p></div>
            </div>

            <div class="space"></div> 
        </form>

        <div class="space"></div>
    </div>

    <!-- WEBHOOKS CONTENT START -->
    <div id="webhooks-content">
        <h1>Webhooks</h1> 
        <!-- Add new webhook -->
        <form id="web-custom-frm" action="#web-answer" method="POST">
            <label for="board">Board:</label>
            <select class="mySoloBoards">
            </select>

            <label for="web-desc res-hide">Description:</label>
            <textarea name="desc-area" id="web-desc" autocomplete="off" placeholder="The purpose of this awesome webhook"></textarea>

            <label for="callback-url">Callback URL:</label>
            <input type="textarea" name="callback-area" id="callback-url" autocomplete="off" placeholder="example: http://morningtrain.dk/script-with-superpower">

            <input type="submit" value="Submit" id="web-submit">
            <input type="hidden" name="submitted" value="true">
        </form>

        <div id="web-answer"></div>

        <!-- Display all webhooks -->
        <form id="web-sub-frm" class="clearfix">
            <h2>Current Webhooks</h2>
            <div id="web-field-info" class="clearfix">
                <div class="field-info-item"><p>Boardname</p></div>
                <div class="field-info-item res-hide"><p>Description</p></div>
                <div class="field-info-item"><p>Created Time</p></div>
                <div class="edit"><p>Edit</p></div>
            </div>
            <fieldset class="current_webhooks" disabled>
                <input type="text" class="field-info-item board-name" value="TrelloTrain">
                <input type="text" class="field-info-item board-desc res-hide" value="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Similique quos autem vero et ad cupiditate">
                <input type="text" class="field-info-item callback-name" value="24/02/90 - 11:55">
                <div class="edit edit-web">
                    <img class="img-swap" src="img/edit.svg" alt="edit" width="20%" />
                </div>
            </fieldset>

            <div class="space"></div> 
        </form>

        <div class="space"></div>
    </div>

    <script src="//code.jquery.com/jquery-1.11.2.min.js"></script>
    <script src="//code.jquery.com/jquery-migrate-1.2.1.min.js"></script>
    <script src="scripts.js"></script>
</body>
</html>
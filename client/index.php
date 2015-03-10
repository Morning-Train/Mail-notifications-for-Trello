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

    <div class="modal-wrap">
        <div id="modalbox">
            <div class="close-btn">X</div>
            <form id="modal-form" action="#submit-answer" method="POST">
                <fieldset>
                    <label for="project">Projektnavn:</label>
                    <input type="text" placeholder="eks. Inwatec" name="project_name" id="modal-project" autocomplete="off">
                </fieldset>

                <fieldset>
                    <label for="email">Email:</label>
                    <input type="email" placeholder="email@example.com" name="email" id="modal-email" autocomplete="off">
                </fieldset>

                <fieldset>
                    <label for="board">Boardnavn:</label>
                    <select>
                        <option value="volvo">Volvo</option>
                        <option value="saab">Saab</option>
                        <option value="mercedes">Mercedes</option>
                        <option value="audi">Audi</option>
                    </select>
                </fieldset>

                <fieldset id="radio-btn">
                    <h3>Listenavne:</h3>
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
                <input type="hidden" name="submitted" value="true">
            </form>
        </div>
    </div>

    <div id="submit-success">
        <h3>Successfully created new record!</h3>
    </div>

    <div id="submit-error">
        <h3>Error occured in creating new record!</h3>
    </div>

    <h1>Trello-Train</h1>

    <!-- Add new mail notify -->
    <form id="new-custom-frm" action="#submit-answer" method="POST">
        <label for="project">Projektnavn</label>
        <input type="text" placeholder="eks. Inwatec" id="project" name="project_name" autocomplete="off">

        <label for="email">Email:</label>
        <input type="email" placeholder="email@example.com" id="email" name="email" autocomplete="off">

        <label for="board">Board:</label>
        <select onChange="fetchLists()" id="myBoards">
            <option value="none">None chosen</option>
        </select>

        <fieldset id="new-radio-btn" style="display: none">
            <div id="lists">
                <h3>Listenavne:</h3>
            </div>
        </fieldset>

        <input type="submit" value="Submit" id="frm-submit">
        <input type="hidden" name="submitted" value="true">
    </form>

    <div id="submit-answer"></div>

    <!-- Display all mail notifiers -->
    <form id="sub-frm" class="clearfix">
        <h2>Current email notifiers</h2>
        <div id="field-info" class="clearfix">
            <div class="field-info-item"><p>Projektnavn</p></div>
            <div class="field-info-item"><p>Email</p></div>
            <div class="field-info-item"><p>Boardnavn</p></div>
            <div class="edit"><p>Edit</p></div>
        </div>

        <div class="space"></div> 
    </form>

    <div class="space"></div>

<script src="//code.jquery.com/jquery-1.11.2.min.js"></script>
<script src="//code.jquery.com/jquery-migrate-1.2.1.min.js"></script>
<script src="scripts.js"></script>
</body>
</html>
$(document).ready(function() {

    // Global variables
    var body = $('body');

    // Notify specific variables
    var notify = $('.notify');
    var newNotifyForm = $('#new-custom-frm');

    // New Checkbox selections and old ones for modal update/remove. List to display all check btns
    var checkBtn = $('#check-btn');
    var newCheckBtn = $('#new-check-btn');
    var list = $('#lists');

    // Error handling
    var recordSuccess = $('#submit-success');
    var recordError = $('#submit-error');
    var submitAnswer = $('#submit-answer');

    // Alert Choice
    var approve = $('#approve-wrap');
    var yes = $('#yes');
    var no = $('#no');

    var resend = $('#resend-wrap');
    var yesResend = $('#yes-resend');
    var noResend = $('#no-resend');

    // Create new record form
    function getNameOfBoard(myArray, searchTerm) {
        for (var i = 0, len = myArray.length; i < len; i++) {
            if (myArray[i].id === searchTerm) return myArray[i].name;
        }
        return -1;
    }

    // Empty variable for inserting object later
    var boards = {};

    // Get all boards from Trello
    var getAllBoards = $.get('/getBoards', function(data) {
        boards = data;
        for (i = 0; i < boards.length; i++) {
            $('#myBoards').append('<option value="' + boards[i].id + '">' + boards[i].name + '</option>');
            $('.mySoloBoards').append('<option value="' + boards[i].id + '">' + boards[i].name + '</option>');
        }
    }).done(function() {
        $('#loader').fadeOut('slow');
        body.removeClass('no-scroll');
        getAllNotifiers();
    });

    getAllBoards.fail(function(jqXHR, textStatus, errorThrown) {
        if (textStatus == 'timeout')
            console.log('The server is not responding');

        if (textStatus == 'error')
            alert('NodeJS server not responding.... Please refresh the page (we should make a reconnect function)');
    });

    // Alert box on remove click in Email Notifiers Modal box
    $('#modal-rmv').click(function(e) {
        e.preventDefault();
        approve.show();
    });

    // if yes
    yes.click(function(e) {
        e.preventDefault();

        var data = $('#modal-form').serialize();
        var theURL = 'mongies/notifiers/removeOne';

        $.ajax({
            type: 'POST',
            url: theURL,
            // Remember to change this.
            data: data
        }).
        success(function(res) {}).
        fail(function(err) {
            // Error feedback
            recordError.empty();
            recordError.append('<h3>Error in deleting the record!</h3>');
            recordError.fadeIn(400).delay(800).fadeOut(800);
        }).
        done(function(err) {
            // Success feedback
            recordSuccess.empty();
            recordSuccess.append('<h3>Record deleted!</h3>');
            recordSuccess.fadeIn(400).delay(800).fadeOut(800);

            // Remove blue bg from remove btn's
            yes.removeClass('blue-bg');
            no.removeClass('blue-bg');

            $('#fieldset-info').remove();
            // Update notifier list (on frontpage)
            approve.hide();
            notify.hide();
            body.removeClass('no-scroll');
        }).
        always(function() {
            getAllNotifiers();
        });
    });

    // if no
    no.click(function() {
        approve.hide();

        // Remove blue bg from remove btn's
        $(this).removeClass('blue-bg');
        yes.removeClass('blue-bg');
    });

    // Close modal box on close click
    $('.close-btn').click(function() {
        notify.hide();
        body.removeClass('no-scroll');
    });

    // Add new mail notifier
    newNotifyForm.submit(function(e) {
        e.preventDefault();

        // Ajax call to php/post.php
        $.ajax({
            type: 'POST',
            url: 'mongies/notifiers/post',
            data: newNotifyForm.serialize()
        }).
        success(function(res) {}).
        fail(function(err) {
            // Error feedback
            recordError.empty();
            recordError.append('<h3>Error in creating a new record!</h3>');
            recordError.fadeIn(400).delay(800).fadeOut(800);
            submitAnswer.html(err.responseText);
        }).
        done(function(err) {
            // Success Feedback
            recordSuccess.empty();
            recordSuccess.append('<h3>Created new record!</h3>');
            recordSuccess.fadeIn(400).delay(800).fadeOut(800);

            // Reset form on submit
            newNotifyForm[0].reset();

            // Hide lists
            newCheckBtn.hide();

            // Response from submit answer will be emptified.
            submitAnswer.empty();
        }).
        always(function() {
            // Update notifier list (on frontpage)
            getAllNotifiers();
        });
    });

    // Modal submit - change this to modal-update-notifier
    $('#modal-submit').click(function(e) {
        e.preventDefault();
        var data = $('#modal-form').serialize();
        // Ajax call to php/update.php with the right data (all data from the single notifier).
        $.ajax({
            type: 'POST',
            url: 'mongies/notifiers/updateOne',
            // Remember to change this.
            data: data
        }).
        success(function() {}).
        fail(function(err) {
            // Error feedback
            recordError.empty();
            recordError.append('<h3>Error in updating the record!</h3>');
            recordError.fadeIn(400).delay(800).fadeOut(800);
        }).
        done(function() {
            // Success feedback
            recordSuccess.empty();
            recordSuccess.append('<h3>Updated record!</h3>');
            recordSuccess.fadeIn(400).delay(800).fadeOut(800);
        }).
        always(function() {
            // Update notifier list (on frontpage)
            getAllNotifiers();
        });
    });

    var getAllNotifiers = function() {
        // Get freshData just gets fresh data (notifiers) from database.
        $.get('mongies/notifiers/all/', function(data) {
            $('.current_notifiers').remove();
            $('#fieldset-info').remove();
            //console.log(data);
            $.each(data, function(i, val) {
                var textToInsert = '';
                textToInsert += "<fieldset class='current_notifiers'>";
                textToInsert += "<input type='hidden' class='field-info-item notifier-id' name='id' value='" + val._id + "' disabled>";
                textToInsert += "<input type='text' class='field-info-item project-name' value='" + val.project + "' disabled>";
                textToInsert += "<input type='text' class='field-info-item email-name res-hide' value='" + val.email + "' disabled>";
                textToInsert += "<input type='text' class='field-info-item board-name' value='" + getNameOfBoard(boards, val.board) + "' disabled>";
                textToInsert += "<div class='edit edit-this'><img class='img-swap' src='img/edit.svg' alt='edit' /></div>";
                textToInsert += "<div class='resend resend-this'><img class='img-swap' src='img/resend.svg' alt='resend' /></div></fieldset>";
                $('#field-info').after(textToInsert);
            });

        }).done(function() {
            $('.board-name').each(function(index) {
                // console.log( index + ": " + $( this ).val() );
            });
        });
    };
    // Success + Failure skal også laves!

    // Edit / Save fieldsets -> Mail notify
    $('#sub-frm').on('click', 'div.edit-this', function(e) {
        notify.show();
        body.addClass('no-scroll');

        var currentId = $(this).parent('fieldset').find('.notifier-id').val();
        $('#mySoloBoards').empty();
        $('#my-emails-edit').empty();
        $('#modal-last-notified').empty();

        $.get('mongies/notifiers/' + currentId, function(data) {

            $('#modal-notifier-id').val(data._id);
            $('#modal-project').val(data.project);

            for (var i = 0; i < data.email.length; i++) {
                $('#my-emails-edit').append('<div><input type="email" placeholder="email@example.com" name="email" id="modal-email" autocomplete="off"></div>');
                $('div #modal-email').last().val(data.email[i]);
                if (i === 0) {
                    // Add another email field button
                    $('#my-emails-edit div').last().append('<button type="button" id="add-email-button" class="email-button">&#43;</button>');
                } else {
                    // Remove email field button
                    $('#my-emails-edit div').last().append('<button type="button" id="rem-email-button" class="email-button">&#45;</button>');
                }
            }

            $('#modal-days-between-notify').val(data.daysBetweenNotify);
            var lastNotified = data.lastNotified;
            if (data.lastNotified === undefined) {
                lastNotified = "None";
            } else {
                myDate = new Date(data.lastNotified);
                lastNotified = myDate.toLocaleString()
            }
            $('#modal-last-notified').append('<label id="last-email">Last email notification: ' + lastNotified + '</label>');

            var $options = $('#myBoards > option').clone();
            $('#mySoloBoards').append($options);
            $('#mySoloBoards').val(data.board);
        }, 'json').done(function(data) {

            var myCheckedLists = [];

            data.lists.forEach(function(entry) {
                myCheckedLists.push(entry._id);
            })

            function arrayIndexOf(searchTerm) {
                for (var i = 0, len = myCheckedLists.length; i < len; i++) {
                    if (myCheckedLists[i] === searchTerm) return true;
                }
                return false;
            }


            checkBtn.html('<h3>Listnames:</h3>');
            $.get('/getLists/' + data.board, function(data) {
                arr = data;
                //console.log(" done of getSolo ");
                //console.log(data);
                for (i = 0; i < arr.length; i++) {
                    if (arrayIndexOf(arr[i].id)) {
                        checkBtn.append('<div class="checkbox"><label><input name="lists" type="checkbox" value="' + arr[i].id + '" checked> ' + arr[i].name + '</label></div>');
                    } else {
                        checkBtn.append('<div class="checkbox"><label><input name="lists" type="checkbox" value="' + arr[i].id + '"> ' + arr[i].name + '</label></div>');
                    }

                }
            });
        });
    });

    // Edit / Save fieldsets -> Add another email input field
    $('#my-emails-edit').on('click', '#add-email-button', function(e) {
        e.preventDefault();
        $('#my-emails-edit').append('<div><input type="email" placeholder="email@example.com" id="email" name="email" autocomplete="off"><button type="button" id="rem-email-button" class="email-button">&#45;</button></div>');
        $('#my-emails-edit [type=email]:last').focus();
    });

    // Edit / Save fieldsets -> Remove extra email input field
    $('#my-emails-edit').on('click', '#rem-email-button', function(e) {
        e.preventDefault();
        $(this).parent('div').remove();
    });

    // Fetching the list items inside the selected board on change
    $('#myBoards').change(function() {
        $('#boardIdInForm').remove();
        list.empty();

        $.get('/getLists/' + $('#myBoards').val(), function(data) {
            list.html('<h3>Listnames:</h3>');
            newCheckBtn.show();
            $('#project').val($('#myBoards option:selected').text());
            arr = data;
            for (i = 0; i < arr.length; i++) {
                list.append('<div class="checkbox"><label><input name="lists" type="checkbox" value="' + arr[i].id + '"> ' + arr[i].name + '</label></div>');
            }
            newNotifyForm.append('<input id="boardIdInForm" type="hidden" name="board" value="' + $('#myBoards').val() + '">');

        });
    });

    // Append the fetched list items to html
    $('#mySoloBoards').change(function() {
        checkBtn.empty();
        checkBtn.html('<h3>Listnames:</h3>');
        $.get('/getLists/' + $('#mySoloBoards').val(), function(data) {
            arr = data;
            for (i = 0; i < arr.length; i++) {
                checkBtn.append('<label><input name="lists" type="checkbox" value="' + arr[i].id + '">' + arr[i].name + '</label>');
            }
        });
    });

    // Add another email input field
    $('#add-email-button').click(function(e) {
        e.preventDefault();
        $('#myEmails').append('<div><input type="email" placeholder="email@example.com" id="email" name="email" autocomplete="off"><button type="button" id="rem-email-button" class="email-button">&#45;</button></div>');
        $('[type=email]:last').focus();
    });

    // User clicks remove on email input field
    $('#myEmails').on('click', '#rem-email-button', function(e) {
        e.preventDefault();
        $(this).parent('div').remove();
    });

    // Resend individual notify
    $('#sub-frm').on('click', 'div.resend-this', function(e) {
        e.preventDefault();
        resend.show();
    });

    // if yes
    yesResend.click(function(e) {
        e.preventDefault();
        var currentId = $(this).parent('fieldset').find('.notifier-id').val();
        $.post("/runNewCronJob", {
            id: currentId
        })
            .done(function(data) {
                // Success Feedback
                recordSuccess.empty();
                recordSuccess.append('<h3>Succesfully re-sent mail!</h3>');
                recordSuccess.fadeIn(400).delay(800).fadeOut(800);
            })
            .fail(function(data) {
                // Error feedback
                recordError.empty();
                recordError.append('<h3>Error in re-sending the email.</h3>');
                recordError.fadeIn(400).delay(800).fadeOut(800);
            });
    });

    // if no
    noResend.click(function() {
        resend.hide();

        // Remove blue bg from remove btn's
        $(this).removeClass('blue-bg');
        yesResend.removeClass('blue-bg');
    });

});
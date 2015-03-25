$(document).ready(function() {

    //
    //
    // ******* Global changes ********
    //
    //

    function getNameOfBoard(myArray, searchTerm){
          for(var i = 0, len = myArray.length; i < len; i++){
            if(myArray[i].id === searchTerm) return myArray[i].name;
          }
          return -1;
    }

    var boards = {};

    // Get all boards from Trello
    var getAllBoards = $.get( '/getBoards', function( data ) {
        boards = data;
        for(i = 0; i < boards.length; i++) {
            $('#myBoards').append('<option value="'+boards[i].id+'">'+boards[i].name+'</option>');
            $('.mySoloBoards').append('<option value="'+boards[i].id+'">'+boards[i].name+'</option>');
        }
    }).done(function(){
        $('#loader').fadeOut('slow');
        $('body').removeClass('no-scroll');
        getAllNotifiers();
    });

    getAllBoards.fail(function(jqXHR, textStatus, errorThrown){
        if (textStatus == 'timeout')
            console.log('The server is not responding');

        if (textStatus == 'error')
            alert('NodeJS server not responding.... Please refresh the page (we should make a reconnect function)');
    });

    // Alert box on remove click in Email Notifiers Modal box
    $('#modal-rmv').click(function(e){
        e.preventDefault();
        $('#approve-wrap').show();
    });

    // if yes
    $('#yes').click(function(e){
        e.preventDefault();

        var data = $('#modal-form').serialize();
        var theURL = 'mongies/notifiers/removeOne';

        $.ajax({
            type: 'POST',
            url: theURL,
            // Remember to change this.
            data: data
        }).
        success(function(res) {
        }).
        fail(function(err) {
            // Error feedback
            $('#submit-error').empty();
            $('#submit-error').append('<h3>Error in deleting the record!</h3>');
            $('#submit-error').fadeIn(400).delay(800).fadeOut(800);
        }).
        done(function(err) {
            // Success feedback
            $('#submit-success').empty();
            $('#submit-success').append('<h3>Record deleted!</h3>');
            $('#submit-success').fadeIn(400).delay(800).fadeOut(800);

            // Remove blue bg from remove btn's
            $('#yes').removeClass('blue-bg');
            $('#no').removeClass('blue-bg');

            $('#fieldset-info').remove();
            // Update notifier list (on frontpage)
            $('#approve-wrap').hide();
            $('.notify').hide();
            $('body').removeClass('no-scroll');
        }).
        always(function(){
            getAllNotifiers();
        });
    });

    // if no
    $('#no').click(function(){
        $('#approve-wrap').hide();

        // Remove blue bg from remove btn's
        $(this).removeClass('blue-bg');
        $('#yes').removeClass('blue-bg');
    });

    // Close modal box on close click
    $('.close-btn').click(function() {
        $('.notify').hide();
        $('body').removeClass('no-scroll');
    });

    //
    //
    // ******* Email Notifiers code starts ********
    //
    //

    // Add new mail notifier
    $('#new-custom-frm').submit(function(e) {
        e.preventDefault();
        //console.log($('#new-custom-frm').serialize());

        // Ajax call to php/post.php
        $.ajax({
            type: 'POST',
            url:'mongies/notifiers/post',
            data: $('#new-custom-frm').serialize()
        }).
        success(function(res) {
        }).
        fail(function(err) {
            // Error feedback
            $('#submit-error').empty();
            $('#submit-error').append('<h3>Error in creating a new record!</h3>');
            $('#submit-error').fadeIn(400).delay(800).fadeOut(800);
            $('#submit-answer').html(err.responseText);
        }).
        done(function(err) {
            // Success Feedback
            $('#submit-succes').empty();
            $('#submit-success').append('<h3>Created new record!</h3>');
            $('#submit-success').fadeIn(400).delay(800).fadeOut(800);

            // Reset form on submit
            $('#new-custom-frm')[0].reset();

            // Hide lists! :)
            $('#new-check-btn').hide();
            //console.log(res);

            // Response from submit answer will be emptified.
             $('#submit-answer').empty();
        }).
        always(function(){
            // Update notifier list (on frontpage)
            getAllNotifiers();
        });
    });

    // Modal submit - change this to modal-update-notifier
    $('#modal-submit').click(function(e){
        e.preventDefault();
        var data = $('#modal-form').serialize();
        // Ajax call to php/update.php with the right data (all data from the single notifier).
        $.ajax({
            type: 'POST',
            url:'mongies/notifiers/updateOne',
            // Remember to change this.
            data: data
        }).
        success(function() {
        }).
        fail(function(err) {
            // Error feedback
            $('#submit-error').empty();
            $('#submit-error').append('<h3>Error in updating the record!</h3>');
            $('#submit-error').fadeIn(400).delay(800).fadeOut(800);
        }).
        done(function(){
            // Success feedback
            $('#submit-success').empty();
            $('#submit-success').append('<h3>Updated record!</h3>');
            $('#submit-success').fadeIn(400).delay(800).fadeOut(800);
        }).
        always(function(){
            // Update notifier list (on frontpage)
            getAllNotifiers();
        });
    });

    var getAllNotifiers = function() {
        // Get freshData just gets fresh data (notifiers) from database.
        $.get( 'mongies/notifiers/all/', function( data ) {
            $('.current_notifiers').remove();
            $('#fieldset-info').remove();
            //console.log(data);
            $.each(data, function(i, val){
                var textToInsert = '';
                textToInsert += "<fieldset class='current_notifiers'>";
                textToInsert += "<input type='hidden' class='field-info-item notifier-id' name='id' value='"+ val._id +"' disabled>";
                textToInsert += "<input type='text' class='field-info-item project-name' value='" + val.project + "' disabled>";
                textToInsert += "<input type='text' class='field-info-item email-name res-hide' value='"+ val.email +"' disabled>";
                textToInsert += "<input type='text' class='field-info-item board-name' value='"+ getNameOfBoard(boards, val.board) +"' disabled>";
                textToInsert += "<div class='edit edit-this'><img class='img-swap' src='img/edit.svg' alt='edit' /></div></fieldset>";
                $('#field-info').after(textToInsert);
            });

        }).done(function(){
            $('.board-name').each(function( index ) {
              // console.log( index + ": " + $( this ).val() );
            });
        });
    };
    // Success + Failure skal også laves!

    // Edit / Save fieldsets -> Mail notify
    $('#sub-frm').on('click', 'div.edit-this', function(e) {
        $('.notify').show();
        $('body').addClass('no-scroll');

        var currentId = $(this).parent('fieldset').find('.notifier-id').val();
        $('#mySoloBoards').empty();

        $.get( 'mongies/notifiers/' + currentId, function( data ) {

        //console.log(data);
          $('#modal-notifier-id').val(data._id);
          $('#modal-project').val(data.project);
          $('#modal-email').val(data.email);
          var $options = $('#myBoards > option').clone();
          $('#mySoloBoards').append($options);
          $('#mySoloBoards').val(data.board);
          //console.log(data);
        }, 'json').done(function(data){

            var myCheckedLists = [];

            data.lists.forEach(function(entry){
                myCheckedLists.push(entry._id);
            })

            function arrayIndexOf(searchTerm){
                      for(var i = 0, len = myCheckedLists.length; i < len; i++){
                        if(myCheckedLists[i] === searchTerm) return true;
                      }
                      return false;
            }


            $('#check-btn').html('<h3>Listnames:</h3>');
            $.get( '/getLists/' + data.board, function( data ) {
                arr = data;
                //console.log(" done of getSolo ");
                //console.log(data);
                for(i = 0; i < arr.length; i++) {
                    if(arrayIndexOf(arr[i].id)){
                        $('#check-btn').append('<div class="checkbox"><input name="lists" type="checkbox" value="'+arr[i].id+'" checked> '+arr[i].name+'</div>');
                    } else {
                        $('#check-btn').append('<div class="checkbox"><input name="lists" type="checkbox" value="'+arr[i].id+'"> '+arr[i].name+'</div>');
                    }

                }
            });
        });
    });

    // Fetching the list items inside the selected board on change
    $('#myBoards').change(function() {
        $('#boardIdInForm').remove();
        $('#lists').empty();

        $.get( '/getLists/' + $('#myBoards').val(), function( data ) {
            $('#lists').html('<h3>Listnames:</h3>');
            $('#new-check-btn').show();
            $('#project').val($('#myBoards option:selected').text());
            arr = data;
            for(i = 0; i < arr.length; i++) {
                $('#lists').append('<div class="checkbox"><input name="lists" type="checkbox" value="'+arr[i].id+'"> '+arr[i].name+'</div>');
            }
            $('#new-custom-frm').append('<input id="boardIdInForm" type="hidden" name="board" value="'+$('#myBoards').val()+'">');

        });
    });

    // Append the fetched list items to html
    $('#mySoloBoards').change(function() {
        $('#check-btn').empty();
        $('#check-btn').html('<h3>Listnames:</h3>');
        $.get( '/getLists/' + $('#mySoloBoards').val(), function( data ) {
            arr = data;
            for(i = 0; i < arr.length; i++) {
                $('#check-btn').append('<input name="lists" type="checkbox" value="'+arr[i].id+'"> <label>'+arr[i].name+'</label>');
            }
        });
    });
});
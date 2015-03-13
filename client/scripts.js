$(document).ready(function() {
    var whereAmI = "notifiers";


    var getAllBoards = $.get( "http://localhost:3000/getBoards", function( data ) {
        var elements = $();
        $("#myBoards").empty();
        arr = data;

        for(i = 0; i < arr.length; i++) {
            $("#myBoards").append('<option value="'+arr[i].id+'">'+arr[i].name+'</option>');
        }

    }).done(function(){
        $('#loader').fadeOut('slow');
        $('body').removeClass('no-scroll');
    });



    getAllBoards.fail(function(jqXHR, textStatus, errorThrown){
        if (textStatus == 'timeout')
            console.log('The server is not responding');

        if (textStatus == 'error')
            alert("NodeJS server not responding.... Please refresh the page (we should make a reconnect function)");
    });

    // Select tab
    $('.green').click(function() {
        $('#webhooks-content').hide();
        $('#notify-content').show();
        whereAmI = 'notifiers';
    });

    $('.blue').click(function() {
        $('#notify-content').hide();
        $('#webhooks-content').show();
        var $options = $("#myBoards > option").clone();
        console.log($("#myBoards > option"));
        $('.mySoloBoards').append($options);
        whereAmI = 'webhooks';
    });




/*==========  Webhooks API Calls  ==========*/
/**

    TODO:
    - /mongies/webhooks/post
    - /mongies/webhooks/get
    - /mongies/webhooks/update
    - /mongies/webhooks/delete

**/



/* Webhooks API POST */
$('#web-submit').click(function(e){
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url:'mongies/webhooks/post',
        data: $('#web-custom-frm').serialize()
    }).
    success(function(res) {
        $('#submit-success').fadeIn(400).delay(800).fadeOut(800);
        $('#submit-answer').html(res);

        // Reset form on submit
        $('#web-custom-frm')[0].reset();
        console.log(res);
        // Refresh current list of mail notifiers.
        getAllWebHooks();

    }).
    fail(function(err) {
        $('#submit-error').fadeIn(400).delay(800).fadeOut(800);
        //$('#submit-answer').html(err.responseText);
        console.log(err.responseText);
    });
})


var getAllWebHooks = function(){
    $.get( "mongies/webhooks/all", function( data ) {
            //$( ".current_webhooks" ).remove();
            //$("#web-field-info").remove();

            console.log(data);
            $.each(data, function(i, val){
                var textToInsert = "";
                textToInsert += "<fieldset class='current_webhooks' disabled>";
                textToInsert += "<input type='hidden' class='field-info-item webhook-id' name='id' value='"+ val._id +"'>";
                textToInsert += "<input type='text' class='field-info-item board-name' value='" + val.idModel + "'>";
                textToInsert += "<input type='text' class='field-info-item webhook-desc res-hide' value='"+ val.description +"'>";
                textToInsert += "<input type='text' class='field-info-item webhook-last-updated' value='"+ val.updated_at +"'>";
                textToInsert += "<div class='edit-web rm-dis'><img class='img-swap' src='img/edit.svg' alt='edit' /></div></fieldset>";
                $("#web-field-info").after(textToInsert);
            });

        }).done(function(){
            $( ".board-name" ).each(function( index ) {
              // console.log( index + ": " + $( this ).val() );
            });
    });
}

getAllWebHooks();


    // Submit new mail notifier
    $('#new-custom-frm').submit(function(e) {
        e.preventDefault();
        //console.log($('#new-custom-frm').serialize());

        // Ajax call to php/post.php
        $.ajax({
            type: 'POST',
            url:'mongies/post',
            data: $('#new-custom-frm').serialize()
        }).
        success(function(res) {
            // Success Feedback
            $('#submit-succes').empty();
            $('#submit-success').append('<h3>Created new record!</h3>');
            $('#submit-success').fadeIn(400).delay(800).fadeOut(800);

            // Reset form on submit
            $('#new-custom-frm')[0].reset();

            // Hide lists! :)
            $('#new-check-btn').hide();
            //console.log(res);

            // Refresh current list of mail notifiers.
            getFreshData();

        }).
        fail(function(err) {
            // Error feedback
            $('#submit-error').empty();
            $('#submit-error').append('<h3>Error in creating a new record!</h3>');
            $('#submit-error').fadeIn(400).delay(800).fadeOut(800);
            $('#submit-answer').html(err.responseText);
        });
    });

    // update mail notifier
    $('#update-mail-notifier').submit(function(e) {
        e.preventDefault();
        console.log($('#update-mail-notifier').serialize());
    });

    // Modal submit - change this to modal-update-notifier
    $('#modal-submit').click(function(e){
        e.preventDefault();
        var data = $('#modal-form').serialize();
        console.log(data);
        // Ajax call to php/update.php with the right data (all data from the single notifier).
        $.ajax({
            type: 'POST',
            url:'mongies/updateOne',
            // Remember to change this.
            data: data
        }).
        success(function(res) {
            console.log(res);
            // Success feedback
            $('#submit-success').empty();
            $('#submit-success').append('<h3>Updated record!</h3>');
            $('#submit-success').fadeIn(400).delay(800).fadeOut(800);

            // Update notifier list (on frontpage)
            getFreshData();

        }).
        fail(function(err) {
            // Error feedback
            $('#submit-error').empty();
            $('#submit-error').append('<h3>Error in updating the record!</h3>');
            $('#submit-error').fadeIn(400).delay(800).fadeOut(800);
        });
    });

    var getFreshData = function() {
        // Get freshData just gets fresh data (notifiers) from database.
        $.get( "mongies/all/", function( data ) {
            $( ".current_notifiers" ).remove();
            $("#fieldset-info").remove();

            //console.log(data);
            $.each(data, function(i, val){
                var textToInsert = "";
                textToInsert += "<fieldset class='current_notifiers' disabled>";
                textToInsert += "<input type='hidden' class='field-info-item notifier-id' name='id' value='"+ val._id +"'>";
                textToInsert += "<input type='text' class='field-info-item project-name' value='" + val.project + "'>";
                textToInsert += "<input type='text' class='field-info-item email-name res-hide' value='"+ val.email +"'>";
                textToInsert += "<input type='text' class='field-info-item board-name' value='"+ val.board +"'>";
                textToInsert += "<div class='edit rm-dis'><img class='img-swap' src='img/edit.svg' alt='edit' /></div></fieldset>";
                $("#field-info").after(textToInsert);
            });

        }).done(function(){
            $( ".board-name" ).each(function( index ) {
              // console.log( index + ": " + $( this ).val() );
            });
        });
    };

    getFreshData();

    // Edit / Save fieldsets -> Mail notify
    $( "#sub-frm" ).on( "click", ".rm-dis", function() {
        $('.notify').show();
        $('body').addClass('no-scroll');

        var currentId = $(this).parent('fieldset').find('.notifier-id').val();
        $('#mySoloBoards').empty();

        $.get( "mongies/findOne/" + currentId, function( data ) {

        //console.log(data);
          $('#modal-notifier-id').val(data[0]._id);
          $('#modal-project').val(data[0].project);
          $('#modal-email').val(data[0].email);
          var $options = $("#myBoards > option").clone();
          $('#mySoloBoards').append($options);
          $('#mySoloBoards').val(data[0].board);
          //console.log(data);
        }, "json").done(function(data){

            var myCheckedLists = [];

            data[0].lists.forEach(function(entry){
                myCheckedLists.push(entry._id);
            })

            function arrayIndexOf(searchTerm){
                      for(var i = 0, len = myCheckedLists.length; i < len; i++){
                        if(myCheckedLists[i] === searchTerm) return true;
                      }
                      return false;
            }


            $("#check-btn").html("<h3>Listnames:</h3>");
            $.get( "http://localhost:3000/getLists/" + data[0].board, function( data ) {
                arr = data;
                //console.log(" done of getSolo ");
                //console.log(data);
                for(i = 0; i < arr.length; i++) {
                    if(arrayIndexOf(arr[i].id)){
                        $("#check-btn").append('<div class="checkbox"><input name="lists" type="checkbox" value="'+arr[i].id+'" checked> '+arr[i].name+'</div>');
                    } else {
                        $("#check-btn").append('<div class="checkbox"><input name="lists" type="checkbox" value="'+arr[i].id+'"> '+arr[i].name+'</div>');
                    }

                }
            });
        });
    });

    // Edit / Save fieldsets -> Webhooks
    $( "#web-sub-frm" ).on( "click", ".edit-web", function() {
        $('.webhooks').show();
        $('body').addClass('no-scroll');

        // Set currentId (from the pressed notifier)
        var currentId = $(this).parent('fieldset').find('.webhook-id').val();
        var boardId = "";
        // Empty the Edit->Modal->Board Selection
        $('#mySoloBoards').empty();

        // Get information about the notifier you want to edit
        $.get( "mongies/webhooks/findOne/" + currentId, function( data ) {
            console.log(data);
        // Set the values for id + project name + email + board (we are still)
          $('#webhooks_id').val(data[0]._id);
          console.log(data[0].id);
          $('#modal-desc').val(data[0].description);
          $('#modal-url').val(data[0].callbackURL);
          var $options = $("#myBoards > option").clone();
          $('#mySoloBoards').append($options);
          $('#mySoloBoards').val(data[0].idModel);
        }, "json").done(function(data){

        });

    });

    // Alert box on remove click in Modal box
    $('#modal-rmv').click(function(e){
        e.preventDefault();
        $('#approve-wrap').show();
    });

    $('#modal-webhooks-rmv').click(function(e){
        // Add blue bg to remove btn's
        $('#yes').addClass('blue-bg');
        $('#no').addClass('blue-bg');

        // Show remove approval
        e.preventDefault();
        $('#approve-wrap').show();
    });

    // if yes
    $('#yes').click(function(e){
        e.preventDefault();
        var data = $('#modal-form').serialize();
        console.log(data);
        // Ajax call to php/update.php with the right data (all data from the single notifier).
        $.ajax({
            type: 'POST',
            url:'mongies/removeOne',
            // Remember to change this.
            data: data
        }).
        success(function(res) {
            // Success feedback
            $('#submit-success').empty();
            $('#submit-success').append('<h3>Record deleted!</h3>');
            $('#submit-success').fadeIn(400).delay(800).fadeOut(800);

            // Remove blue bg from remove btn's
            $('#yes').removeClass('blue-bg');
            $('#no').removeClass('blue-bg');

            console.log(res);
            $("#fieldset-info").remove();
            // Update notifier list (on frontpage)
            getFreshData();
            $('#approve-wrap').hide();
            $('.notify').hide();
            $('.webhooks').hide();
            $('body').removeClass('no-scroll');

        }).
        fail(function(err) {
            // Error feedback
            $('#submit-error').empty();
            $('#submit-error').append('<h3>Error in deleting the record!</h3>');
            $('#submit-error').fadeIn(400).delay(800).fadeOut(800);
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
        $('.webhooks').hide();
        $('body').removeClass('no-scroll');
    });

    $("#myBoards").change(function() {
        $("#boardIdInForm").remove();

        $("#lists").html("<h3>Listenavne:</h3>");
        $.get( "http://localhost:3000/getLists/" + $("#myBoards").val(), function( data ) {
            $("#new-check-btn").show();
            $("#project").val($("#myBoards option:selected").text());
            arr = data;
            for(i = 0; i < arr.length; i++) {
                $("#lists").append('<div class="checkbox"><input name="lists" type="checkbox" value="'+arr[i].id+'"> '+arr[i].name+'</div>');
            }
            $("#new-custom-frm").append('<input id="boardIdInForm" type="hidden" name="board" value="'+$("#myBoards").val()+'">');

        });
    });

    $("#mySoloBoards").change(function() {
        $("#check-btn").empty();
        $("#check-btn").html("<h3>Listenavne:</h3>");
        $.get( "http://localhost:3000/getLists/" + $("#mySoloBoards").val(), function( data ) {
            arr = data;
            for(i = 0; i < arr.length; i++) {
                $("#check-btn").append('<input name="lists" type="checkbox" value="'+arr[i].id+'"> <label>'+arr[i].name+'</label>');
            }
        });
    });
});
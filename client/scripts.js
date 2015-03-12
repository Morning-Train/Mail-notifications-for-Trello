$(document).ready(function() {


    var getAllBoards = $.get( "http://localhost:3000/getBoards", function( data ) {
        var elements = $();
        arr = data;

        for(i = 0; i < arr.length; i++) {
            $("#myBoards").append('<option value="'+arr[i].id+'">'+arr[i].name+'</option>');
        }

        // console.log(data);
    }).done(function(){
        $('#loader').fadeOut('slow');
    });

    getAllBoards.fail(function(jqXHR, textStatus, errorThrown){
        if (textStatus == 'timeout')
            console.log('The server is not responding');

        if (textStatus == 'error')
            alert("NodeJS server not responding.... Please refresh the page (we should make a reconnect function)");
    });

    // Loader

    // Select tab
    $('.green').click(function() {
        $('#webhooks-content').hide();
        $('#notify-content').show();
    });

    $('.blue').click(function() {
        $('#notify-content').hide();
        $('#webhooks-content').show();
    });

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
            $('#submit-success').fadeIn(400).delay(800).fadeOut(800);
            $('#submit-answer').html(res);

            // Reset form on submit
            $('#new-custom-frm')[0].reset();

            // Hide lists! :)
            $('#new-radio-btn').hide();
            //console.log(res);

            // Refresh current list of mail notifiers.
            getFreshData();

        }).
        fail(function(err) {
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

            // Update notifier list (on frontpage)
            getFreshData();

        }).
        fail(function(err) {
            // Setup fail handling! (We need this someday)
        });
    });

    $('#modal-rmv').click(function(e){
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
            console.log(res);
            // Update notifier list (on frontpage)
            getFreshData();

        }).
        fail(function(err) {
            // Setup fail handling! (We need this someday)
        });
    });

    var getFreshData = function() {
        // Get freshData just gets fresh data (notifiers) from database.
        $.get( "mongies/all/", function( data ) {
            $( ".current_notifiers" ).empty();
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


            $("#radio-btn").html("<h3>Listnames:</h3>");
            $.get( "http://localhost:3000/getLists/" + data[0].board, function( data ) {
                arr = data;
                //console.log(" done of getSolo ");
                //console.log(data);
                for(i = 0; i < arr.length; i++) {
                    if(arrayIndexOf(arr[i].id)){
                        $("#radio-btn").append('<div class="checkbox"><input name="lists" type="checkbox" value="'+arr[i].id+'" checked> '+arr[i].name+'</div>');
                    } else {
                        $("#radio-btn").append('<div class="checkbox"><input name="lists" type="checkbox" value="'+arr[i].id+'"> '+arr[i].name+'</div>');
                    }

                }
            });
        });
    });

    // Edit / Save fieldsets -> Webhooks
    $( "#web-sub-frm" ).on( "click", ".edit-web", function() {
        $('.webhooks').show();

        // Set currentId (from the pressed notifier)
        var currentId = $(this).parent('fieldset').find('.notifier-id').val();
        var boardId = "";
        // Empty the Edit->Modal->Board Selection
        $('#mySoloBoards').empty();

        // Get information about the notifier you want to edit
        $.get( "php/getSolo.php?id=" + currentId, function( data ) {
        // Set the values for id + project name + email + board (we are still)
          $('#modal-notifier-id').val(data[0].id);
          console.log(data[0].id);
          $('#modal-project').val(data[0].project);
          $('#modal-email').val(data[0].email);
          var $options = $("#myBoards > option").clone();
          $('#mySoloBoards').append($options);
          $('#mySoloBoards').val(data[0].board);
          console.log("Boar ID: " + data[0].board);
        }, "json").done(function(data){

            console.log(" done of getSolo ");

            var myCheckedLists = [];

            data[0].lists.forEach(function(entry){
                myCheckedLists.push(entry.listId);
            })
            console.log("myCheckedLists");

            function arrayIndexOf(searchTerm){
                      for(var i = 0, len = myCheckedLists.length; i < len; i++){
                        if(myCheckedLists[i] === searchTerm) return true;
                      }
                      return false;
            }


            $("#radio-btn").html("<h3>Listnames:</h3>");
            $.get( "http://localhost:3000/getLists/" + data[0].board, function( data ) {
                arr = data;
                console.log(" done of getSolo ");
                console.log(data);
                for(i = 0; i < arr.length; i++) {
                    if(arrayIndexOf(arr[i].id)){
                        $("#radio-btn").append('<input name="lists" type="checkbox" value="'+arr[i].id+'" checked> <label>'+arr[i].name+'</label>');
                    } else {
                        $("#radio-btn").append('<input name="lists" type="checkbox" value="'+arr[i].id+'"> <label>'+arr[i].name+'</label>');
                    }

                }
            });
        });

    });


    // Close modal box on close click
    $('.close-btn').click(function() {
        $('.notify').hide();
        $('.webhooks').hide();
    });

    $("#myBoards").change(function() {
        $("#boardIdInForm").remove();

        $("#lists").html("<h3>Listenavne:</h3>");
        $.get( "http://localhost:3000/getLists/" + $("#myBoards").val(), function( data ) {
            $("#new-radio-btn").show();
            $("#project").val($("#myBoards option:selected").text());
            arr = data;
            for(i = 0; i < arr.length; i++) {
                $("#lists").append('<div class="checkbox"><input name="lists" type="checkbox" value="'+arr[i].id+'"> '+arr[i].name+'</div>');
            }
            $("#new-custom-frm").append('<input id="boardIdInForm" type="hidden" name="board" value="'+$("#myBoards").val()+'">');

        });
    });

    $("#mySoloBoards").change(function() {
        $("#radio-btn").empty();
        $("#radio-btn").html("<h3>Listenavne:</h3>");
        $.get( "http://localhost:3000/getLists/" + $("#mySoloBoards").val(), function( data ) {
            arr = data;
            for(i = 0; i < arr.length; i++) {
                $("#radio-btn").append('<input name="lists" type="checkbox" value="'+arr[i].id+'"> <label>'+arr[i].name+'</label>');
            }
        });
    });
});
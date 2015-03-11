$(document).ready(function() {
    // Loader
    $('#loader').fadeOut('slow');

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
        console.log($('#new-custom-frm').serialize());

        // Ajax call to php/post.php
        $.ajax({
            type: 'POST',
            url:'php/post.php',
            data: $('#new-custom-frm').serialize()
        }).
        success(function(res) {
            $('#submit-success').fadeIn(400).delay(800).fadeOut(800);
            $('#submit-answer').html(res);

            // Reset form on submit
            $('#new-custom-frm')[0].reset();

            // Hide lists! :)
            $('#new-radio-btn').hide();
            console.log(res);

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

        // Ajax call to php/update.php with the right data (all data from the single notifier).
        $.ajax({
            type: 'POST',
            url:'php/update.php',
            // Remember to change this.
            data: $('#modal-form').serialize()
        }).
        success(function(res) {
            console.log(res);

            // Update notifier list (on frontpage)
            getFreshData();

        }).
        fail(function(err) {
            // Setup fail handling! (We need this someday)
        });
    })

    var getFreshData = function() {
        // Get freshData just gets fresh data (notifiers) from database.
        $.get( "php/get.php", function( data ) {
            $( ".current_notifiers" ).remove();
            $( "#field-info" ).after(data);
        });
    };

    getFreshData();

    // Edit / Save fieldsets
    $( "#sub-frm" ).on( "click", ".rm-dis", function() {
        $('.modal-wrap').toggle();

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
            console.log(myCheckedLists);

            function arrayIndexOf(searchTerm){
                      for(var i = 0, len = myCheckedLists.length; i < len; i++){
                        if(myCheckedLists[i] === searchTerm) return true;
                      }
                      return false;
            }


            $("#radio-btn").html("<h3>Listenavne:</h3>");
            $.get( "http://localhost:3000/getLists/" + data[0].board, function( data ) {
                arr = data;
                console.log(" done of getSolo ");
                console.log(data);
                for(i = 0; i < arr.length; i++) {
                    if(arrayIndexOf(arr[i].id)){
                        $("#radio-btn").append('<div class="checkbox"><input name="lists[]" type="checkbox" value="'+arr[i].id+'" checked> '+arr[i].name+'</div>');
                    } else {
                        $("#radio-btn").append('<div class="checkbox"><input name="lists[]" type="checkbox" value="'+arr[i].id+'"> '+arr[i].name+'</div>');
                    }

                }
            });
        });

    });


    // Close modal box on close click
    $('.close-btn').click(function() {
        $('.modal-wrap').hide();
    });

    var getAllBoards = $.get( "http://localhost:3000/getBoards", function( data ) {
            var elements = $();
            arr = data;
            for(i = 0; i < arr.length; i++) {
                $("#myBoards").append('<option value="'+arr[i].id+'">'+arr[i].name+'</option>');
            }
            // console.log(data);
    });

    getAllBoards.fail(function(jqXHR, textStatus, errorThrown){
        if (textStatus == 'timeout')
            console.log('The server is not responding');

        if (textStatus == 'error')
            alert("NodeJS server not responding.... Please refresh the page (we should make a reconnect function");
    });

    $("#myBoards").change(function() {
        $("#lists").html("<h3>Listenavne:</h3>");
        $.get( "http://localhost:3000/getLists/" + $("#myBoards").val(), function( data ) {
            $("#new-radio-btn").show();
            arr = data;
            for(i = 0; i < arr.length; i++) {
                $("#lists").append('<div class="checkbox"><input name="lists[]" type="checkbox" value="'+arr[i].id+'"> '+arr[i].name+'</div>');
            }
            $("#new-custom-frm").append('<input type="hidden" name="board" value="'+$("#myBoards").val()+'">');
        });
    });

    $("#mySoloBoards").change(function() {
        $("#radio-btn").empty();
        $("#radio-btn").html("<h3>Listenavne:</h3>");
        $.get( "http://localhost:3000/getLists/" + $("#mySoloBoards").val(), function( data ) {
            arr = data;
            for(i = 0; i < arr.length; i++) {
                $("#radio-btn").append('<div class="checkbox"><input name="lists[]" type="checkbox" value="'+arr[i].id+'"> '+arr[i].name+'</div>');
            }
        });
    });


    //  $("#myBoards").change(function fetchLists(state){
    //     if(state == "solo"){
    //         var theFieldSet = document.getElementById("radio-btn");
    //     } else {
    //         var theFieldSet = document.getElementById("new-radio-btn");
    //     }

    //     theFieldSet.setAttribute('style', 'display=block');

    //     var myselect = document.getElementById("myBoards");
    //     var theBoard = myselect.options[myselect.selectedIndex].value;
    //     var select = document.createElement("div");
    //     var xoxo = document.getElementById("lists");
    //     xoxo.innerHTML = "";

    //     var path = "http://localhost:3000/getLists/" + theBoard;
    //     console.log(path);
    //     var xhr = new XMLHttpRequest();
    //     xhr.onreadystatechange = function() {
    //         if (xhr.readyState == 4 && xhr.status == 200) {
    //             var myArr = JSON.parse(xhr.responseText);
    //             myFunction(myArr);
    //             console.log(myArr);
    //         }
    //     }
    //     xhr.open("GET", path, false);
    //     xhr.send();

    //         function myFunction(arr) {

    //             var out = "";
    //             var i;

    //             var board = document.createElement("input");
    //             board.setAttribute('type', 'hidden');
    //             board.setAttribute('value', theBoard);
    //             board.setAttribute('name', 'board');


    //             for(i = 0; i < arr.length; i++) {
    //                 var divBeforeCheckbox = document.createElement("div");
    //                 divBeforeCheckbox.setAttribute("class", "checkbox");
    //                 var opt = arr[i].name;
    //                 var el = document.createElement("input");
    //                 el.setAttribute("name", "lists[]");
    //                 var label = document.createElement("label");
    //                 label.textContent = arr[i].name;
    //                 el.type="checkbox";
    //                 el.value = arr[i].id;
    //                 divBeforeCheckbox.appendChild(el);
    //                 divBeforeCheckbox.appendChild(label);
    //                 divBeforeCheckbox.appendChild(board);
    //                 select.appendChild(divBeforeCheckbox);
    //             }


    //             xoxo.appendChild(select);

    //         }
    //     console.log(xhr.status);
    //     console.log(xhr.statusText);
    // });
    
});

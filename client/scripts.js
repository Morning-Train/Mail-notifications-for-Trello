$(function() {

    //AJAX call for contact form
    $('#new-custom-frm').submit(function(e) {
        e.preventDefault();
        console.log($('#new-custom-frm').serialize());
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
            getFreshData();

        }).
        fail(function(err) {
            $('#submit-error').fadeIn(400).delay(800).fadeOut(800);
            $('#submit-answer').html(err.responseText);
        });
    });

    var getFreshData = function() {
        $.get( "php/get.php", function( data ) {
            $( ".current_notifiers" ).remove();
            $( "#field-info" ).after(data);
        });
    };

    getFreshData();

    // Edit / Save fieldsets
    $( "#sub-frm" ).on( "click", ".rm-dis", function() {
        $('.modal-wrap').toggle();
        var currentId = $(this).parent('fieldset').find('.notifier-id').val();
        $('#mySoloBoards').empty();

        $.get( "php/getSolo.php?id=" + currentId, function( data ) {
          $('#modal-notifier-id').val(data[0].id);
          $('#modal-project').val(data[0].project);
          $('#modal-email').val(data[0].email);
          var $options = $("#myBoards > option").clone();
          $('#mySoloBoards').append($options);
          $('#mySoloBoards').val(data[0].board);
          console.log(data);
        }, "json");
    });

    // Close modal box on close click
    $('.close-btn').click(function() {
        $('.modal-wrap').hide();
    });


    // Loading boards from NodeJS server
    window.onload = function() {
        var select = document.getElementById("myBoards");

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var myArr = JSON.parse(xhr.responseText);
                myFunction(myArr);
                console.log(myArr);
            }
        }
        xhr.open("GET", "http://localhost:3000/getBoards", false);
        xhr.send();

        function myFunction(arr) {
            var out = "";
            var i;
            for(i = 0; i < arr.length; i++) {
                var opt = arr[i].name;
                var el = document.createElement("option");
                el.textContent = opt;
                el.value = arr[i].id;
                select.appendChild(el);
            }
        }
        console.log(xhr.status);
        console.log(xhr.statusText);
    }


});

function fetchLists(){
              var theFieldSet = document.getElementById("new-radio-btn");
              theFieldSet.setAttribute('style', 'display=block');

              var myselect = document.getElementById("myBoards");
              var theBoard = myselect.options[myselect.selectedIndex].value;
              var select = document.createElement("div");
              var xoxo = document.getElementById("lists");
              xoxo.innerHTML = "";

              var path = "http://localhost:3000/getLists/" + theBoard;
              console.log(path);
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        var myArr = JSON.parse(xhr.responseText);
                        myFunction(myArr);
                        console.log(myArr);
                    }
                }
                xhr.open("GET", path, false);
                xhr.send();

                function myFunction(arr) {

                    var out = "";
                    var i;

                    var board = document.createElement("input");
                    board.setAttribute('type', 'hidden');
                    board.setAttribute('value', theBoard);
                    board.setAttribute('name', 'board');


                    for(i = 0; i < arr.length; i++) {
                        var divBeforeCheckbox = document.createElement("div");
                        divBeforeCheckbox.setAttribute("class", "checkbox");
                        var opt = arr[i].name;
                        var el = document.createElement("input");
                        el.setAttribute("name", "lists[]");
                        var label = document.createElement("label");
                        label.textContent = arr[i].name;
                        el.type="checkbox";
                        el.value = arr[i].id;
                        divBeforeCheckbox.appendChild(el);
                        divBeforeCheckbox.appendChild(label);
                        divBeforeCheckbox.appendChild(board);
                        select.appendChild(divBeforeCheckbox);
                    }


                    xoxo.appendChild(select);

                }
                console.log(xhr.status);
                console.log(xhr.statusText);
}

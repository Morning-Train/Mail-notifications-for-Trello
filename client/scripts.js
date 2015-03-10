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
        done(function(res) {
            $('#submit-answer').html(res);

            // Reset form on submit
            $('#new-custom-frm')[0].reset();
        }).
        fail(function(err) {
            $('#submit-answer').html(err.responseText);
        });
    });

    // Edit / Save fieldsets
    $('.rm-dis').click(function() {
        $('.modal-wrap').toggle();
        var currentProject = $(this).find('.project-name').val();
        console.log(currentProject);
        $('#modal-project').val(currentProject);
    });

    // Close modal box on close click
    $('.close-btn').click(function() {
        $('.modal-wrap').toggle();
    })

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
                        var opt = arr[i].name;
                        var el = document.createElement("input");
                        el.setAttribute("name", "lists[]");
                        var label = document.createElement("label");
                        label.textContent = arr[i].name;
                        el.type="checkbox";
                        el.value = arr[i].id;
                        select.appendChild(el);
                        select.appendChild(label);
                        select.appendChild(board);
                    }


                    xoxo.appendChild(select);


                }
                console.log(xhr.status);
                console.log(xhr.statusText);
}

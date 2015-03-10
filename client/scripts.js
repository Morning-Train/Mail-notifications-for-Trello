$(function() {

    //AJAX call for contact form
    $('#new-custom-frm').submit(function(e) {
        e.preventDefault();

        $.ajax({
            type: 'POST',
            url:'php/post.php',
            data: $('#new-custom-frm').serialize()    
        }).
        done(function(res) {
            $('#submit-answer').html(res);
        }).
        fail(function(err) {
            $('#submit-answer').html(err.responseText);
        });
    });

    // Reset form on submit
    $('#frm-submit').click(function() {
        $('#new-custom-frm')[0].reset();
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
});
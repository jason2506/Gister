(function() {
    var gister = new Gister();

    if (gister.accessible())
        window.location.href = 'overview.html';

    $('#form').submit(function() {
        var user = $('#user').val();
        var pwd = $('#pwd').val();
        gister.save(user, pwd);
    });
})();

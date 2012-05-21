(function() {
    var bgPage = chrome.extension.getBackgroundPage();
    var gister = bgPage.gister;

    if (gister.accessible())
        window.location.href = 'overview.html';

    $('#form').submit(function() {
        var user = $('#user').val();
        var pwd = $('#pwd').val();
        gister.save(user, pwd);
    });
})();

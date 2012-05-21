(function() {
    var gister = new Gister();
    const SELECTOR = {
        loginForm: '#form',
        loginUser: '#user',
        loginPwd: '#pwd'
    };

    if (gister.accessible())
        window.location.href = 'overview.html';

    $(SELECTOR.loginForm).submit(function() {
        var user = $(SELECTOR.loginUser).val();
        var pwd = $(SELECTOR.loginPwd).val();
        gister.save(user, pwd);
    });
})();

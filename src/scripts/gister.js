var Gister = (function() {
    var bgPage = chrome.extension.getBackgroundPage();

    var Gister = function() { /* empty */ }
    Gister.prototype = {
        save: function(user, pwd) {
            bgPage.save(user, pwd);
        },
        accessible: function() {
            var jqxhr = this.request({ async: false });
            return jqxhr && jqxhr.status == '204';
        },
        create: function(descr, public, files, callback) {
            this.request({
                type: 'POST',
                uri: '/gists',
                data: JSON.stringify({
                    description: descr,
                    public: public,
                    files: files
                }),
                callback: callback
            });
        },
        update: function(id, descr, files, callback) {
            this.request({
                type: 'PATCH',
                uri: '/gists/' + id,
                data: JSON.stringify({
                    description: descr,
                    files: files
                }),
                callback: callback
            });
        },
        get: function(id, callback) {
            this.request({ uri: '/gists/' + id, callback: callback });
        },
        getAll: function(callback) {
            this.request({ uri: '/gists', callback: callback });
        },
        getStarred: function(callback) {
            this.request({ uri: '/gists/starred', callback: callback });
        },
        request: function(opts) {
            var auth = bgPage.getAuth();
            if (!auth) return;

            return $.ajax({
                type: opts.type || 'GET',
                url: 'https://api.github.com' + (opts.uri || ''),
                headers: { Authorization: 'Basic ' + auth },
                dataType: 'json',
                async: (opts.async != undefined) ? opts.async : true,
                data: opts.data,
                success: opts.callback
            });
        }
    }

    return Gister;
})();

(function() {
    var gister = new Gister();
    const SELECTOR = {
        container: 'body',
        pages: '.page',

        loginForm: '#login-form',
        loginPage: '#login-page',
        loginUser: '#login-user',
        loginPwd: '#login-pwd',

        overviewPage: '#overview-page',
        overviewNewGist: '#overview-new-gist',
        overviewLoading: '#overview-loading',
        overviewGists: '#overview-gists',
        overviewSearch: '#overview-search',
        overviewFilter: '#overview-filters',

        editPage: '#edit-page',
        editForm: '#edit-form',
        editFiles: '#edit-files',
        editAddFile: '#edit-add-file'
    }

    var pages = $(SELECTOR.pages);
    pages.hide();
    if (gister.accessible()) {
        $(SELECTOR.overviewPage).show();
        gister.getAll(function(gists) {
            $(SELECTOR.overviewLoading).remove();
            displayGists(gists);
        });
    }
    else {
        $(SELECTOR.loginPage).show();
    }

    $(SELECTOR.loginForm).submit(function() {
        var user = $(SELECTOR.loginUser).val();
        var pwd = $(SELECTOR.loginPwd).val();
        gister.save(user, pwd);
    });

    $(SELECTOR.overviewPage + ' h1').click(function() {
        openUrl('https://gist.github.com/mine');
    });

    $(SELECTOR.overviewNewGist).click(function() {
        $(SELECTOR.container).addClass('large');
        $(SELECTOR.overviewPage).hide();
        $(SELECTOR.editPage).show();
    });

    $(SELECTOR.overviewSearch).on('input', updateFilter);

    $(SELECTOR.overviewFilter + ' a').click(function() {
        $(SELECTOR.overviewFilter + ' .current').removeClass('current');
        $(this).parent().addClass('current');

        updateFilter();
    });

    $(SELECTOR.editPage + ' h1').click(function() {
        $(SELECTOR.container).removeClass('large');
        $(SELECTOR.editPage).hide();
        $(SELECTOR.overviewPage).show();
    });

    $(SELECTOR.editAddFile).click(function() {
        var file = addFile();
        $(SELECTOR.editFiles).append(file);
        selectFile(file.attr('rel'));

        return false;
    });

    $(SELECTOR.editFiles + ' .file').click(function() {
        var index = $(this).attr('rel');
        selectFile(index);
    });

    function displayGists(gists) {
        var list = $(SELECTOR.overviewGists);
        for (var index = 0; index < gists.length; index++) {
            var item = generateGistItem(gists[index]);
            list.append(item);
        }

        gister.getStarred(function(gists) {
            for (var index = 0; index < gists.length; index++)
                $('#gist-' + gists[index].id).addClass('starred');
        });
    }

    function generateGistItem(gist) {
        var item = $('<li>')
            .addClass(gist.public ? 'public' : 'private')
            .attr('id', 'gist-' + gist.id)
            .attr('rel', gist.html_url)
            .click(function() {
                var url = $(this).attr('rel');
                openUrl(url);
            });

        var itemInfo = $('<span>')
            .addClass('info');
        item.append(itemInfo);

        var itemLink = $('<span>')
            .addClass('id')
            .text('gist:' + gist.id);
        itemInfo.append(itemLink);

        var itemDescr = $('<span>')
            .addClass('descr')
            .attr('title', gist.description)
            .text(gist.description);
        itemInfo.append(itemDescr);

        var itemArrow = $('<span>')
            .addClass('arrow')
        item.append(itemArrow);

        return item;
    }

    function updateFilter() {
        var gistItems = $(SELECTOR.overviewGists + ' li');

        var filterType = $(SELECTOR.overviewFilter + ' .current a').attr('rel');
        if (filterType.length > 0) {
            gistItems.hide();
            gistItems.filter(filterType).show();
        }
        else {
            gistItems.show();
        }

        var filterText = $(SELECTOR.overviewSearch).val().toLowerCase();
        gistItems.each(function() {
            var contained = false;
            var elements = $(this).find('.info > *');
            for (var index = 0; index < elements.length; index++) {
                var element = $(elements[index]);
                if (element.text().toLowerCase().indexOf(filterText) >= 0)
                    return
            }

            $(this).hide();
        });
    }

    function addFile() {
        var lastFile = $(SELECTOR.editFiles + ' .file').last();
        var lastIndex = lastFile.attr('rel');

        var clone = lastFile.clone();
        clone.find('.filename').val('');
        clone.find('.content').val('');
        clone.attr('rel', parseInt(lastIndex) + 1);
        clone.removeClass('removed');
        if (!clone.hasClass('append')) {
            clone.addClass('append');
            var remove = $('<a>')
                .addClass('remove')
                .attr('href', '#')
                .text('remove');
            clone.append(remove);
        }

        clone.find('.remove').click(function() {
            var target = $(this).parent();
            var selected = target;
            do {
                selected = selected.prev();
            } while (selected.hasClass('removed'));

            selectFile(selected.attr('rel'));
            target.addClass('removed');
            target.off('click');

            return false;
        });

        clone.click(function() {
            var index = $(this).attr('rel');
            selectFile(index);
        });

        return clone;
    }

    function selectFile(index) {
        var files = $(SELECTOR.editFiles + ' .file');
        files.removeClass('current');
        $(files[index]).addClass('current');
    }

    function openUrl(url) {
        chrome.tabs.create({ url: url });
        window.close();
    }
})();

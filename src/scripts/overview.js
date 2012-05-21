(function() {
    var gister = new Gister();
    const SELECTOR = {
        container: 'body',

        overviewNewGist: '#new-gist',
        overviewLoading: '#loading',
        overviewGists: '#gists',
        overviewSearch: '#search',
        overviewFilter: '#filters'
    };

    gister.getAll(function(gists) {
        $(SELECTOR.overviewLoading).remove();
        displayGists(gists);
    });

    $('h1').click(function() {
        openUrl('https://gist.github.com/mine');
    });

    $(SELECTOR.overviewNewGist).click(function() {
        window.location.href = 'edit.html';
    });

    $(SELECTOR.overviewSearch).on('input', updateFilter);

    $(SELECTOR.overviewFilter + ' a').click(function() {
        $(SELECTOR.overviewFilter + ' .current').removeClass('current');
        $(this).parent().addClass('current');

        updateFilter();
    });

    function displayGists(gists) {
        var template = _.template($('#tmpl').html());

        var list = $(SELECTOR.overviewGists);
        for (var index = 0; index < gists.length; index++)
            list.append(template(gists[index]));

        $(SELECTOR.overviewGists + ' li').click(function() {
            var url = $(this).attr('rel');
            openUrl(url);
        });

        gister.getStarred(function(gists) {
            for (var index = 0; index < gists.length; index++)
                $('#gist-' + gists[index].id).addClass('starred');
        });
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
                    return;
            }

            $(this).hide();
        });
    }

    function openUrl(url) {
        chrome.tabs.create({ url: url });
        window.close();
    }
})();

(function() {
    var bgPage = chrome.extension.getBackgroundPage();
    var gister = bgPage.gister;

    gister.getAll(function(gists) {
        $('#loading').remove();
        displayGists(gists);
    });

    $('h1').click(function() {
        openUrl('https://gist.github.com/mine');
    });

    $('#new-gist').click(function() {
        window.location.href = 'edit.html';
    });

    $('#search').on('input', updateFilter);

    $('#filters a').click(function() {
        $('#filters .current').removeClass('current');
        $(this).parent().addClass('current');

        updateFilter();
    });

    function displayGists(gists) {
        var template = _.template($('#tmpl').html());

        var list = $('#gists');
        for (var index = 0; index < gists.length; index++)
            list.append(template(gists[index]));

        $('#gists li').click(function() {
            var url = $(this).attr('rel');
            openUrl(url);
        });

        gister.getStarred(function(gists) {
            for (var index = 0; index < gists.length; index++)
                $('#gist-' + gists[index].id).addClass('starred');
        });
    }

    function updateFilter() {
        var gistItems = $('#gists li');

        var filterType = $('#filters .current a').attr('rel');
        if (filterType.length > 0) {
            gistItems.hide();
            gistItems.filter(filterType).show();
        }
        else {
            gistItems.show();
        }

        var filterText = $('#search').val().toLowerCase();
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

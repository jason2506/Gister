(function() {
    var bgPage = chrome.extension.getBackgroundPage();
    var gister = bgPage.gister;

    var Gist = Backbone.Model.extend({ /* empty */ });

    var GistList = Backbone.Collection.extend({
        model: Gist
    });

    var GistView = Backbone.View.extend({
        template: _.template($('#tmpl').html()),
        events: {
            'click li': 'link'
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        link: function(event) {
            openUrl($(event.currentTarget).attr('rel'));
        }
    });

    var GistListView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        render: function() {
            this.collection.forEach(function(gist) {
                var gistView = new GistView({ model: gist });
                this.$el.append(gistView.render().$el);
            }, this);
            return this;
        }
    });

    var OverviewPage = Backbone.View.extend({
        events: {
            'click h1'          : 'linkToHomePage',
            'click #new-gist'   : 'createNewGist',
            'input #search'     : 'updateFilter',
            'click #filters a'  : 'filter'
        },
        initialize: function() {
            var that = this;
            gister.getAll(function(gists) {
                $('#loading').remove();
                that.displayGists(gists);
            });
        },
        displayGists: function(gists) {
            var gistList = new GistList(gists);
            var gistListView = new GistListView({
                el: '#gists',
                collection: gistList
            });

            gister.getStarred(function(gists) {
                for (var index = 0; index < gists.length; index++)
                    $('#gist-' + gists[index].id).addClass('starred');
            });
        },
        linkToHomePage: function() {
            openUrl('https://gist.github.com/mine');
        },
        createNewGist: function() {
            window.location.href = 'edit.html';
        },
        filter: function(event) {
            $('#filters .current').removeClass('current');
            $(event.currentTarget).parent().addClass('current');

            this.updateFilter();
        },
        updateFilter: function() {
            var gistItems = $('#gists li');
            gistItems.show();

            var filterType = $('#filters .current a').attr('rel');
            if (filterType.length > 0)
                gistItems.not(filterType).hide();

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
    });

    function openUrl(url) {
        chrome.tabs.create({ url: url });
        window.close();
    }

    var overviewPage = new OverviewPage({ el: 'body' });
})();

(function() {
    var bgPage = chrome.extension.getBackgroundPage();
    var gister = bgPage.gister;

    var GistFile = Backbone.Model.extend({ /* empty */ });

    var GistFileList = Backbone.Collection.extend({
        model: GistFile
    });

    var GistFileView = Backbone.View.extend({
        tagName: 'div',
        template: _.template($('#tmpl').html()),
        events: {
            'click .remove': 'remove'
        },
        render: function() {
            this.$el.html(this.template({ index: this.attributes.rel }));
            return this;
        },
        remove: function(event) {
            var target = $(event.currentTarget).parent();
            var selected = target;
            do {
                selected = selected.prev();
            } while (selected.hasClass('removed'));

            selectFile(selected.attr('rel'));
            target.addClass('removed');

            return false;
        }
    });

    var GistFileListView = Backbone.View.extend({
        events: {
            'click .file': 'selectFile'
        },
        initialize: function() {
            this.count = 0;
            this.createFile();
        },
        selectFile: function(event) {
            var target = $(event.currentTarget);
            if (target.hasClass('removed'))
                return;

            selectFile(target.attr('rel'));
        },
        createFile: function() {
            var className = 'file current';
            if (this.count !== 0)
                className += ' append';

            var gistFileView = new GistFileView({
                className: className,
                attributes: { rel: this.count++ }
            });
            this.$el.append(gistFileView.render().$el);
            selectFile(this.count - 1);
        }
    });

    var EditPage = Backbone.View.extend({
        events: {
            'click h1'              : 'back',
            'click #add-file'       : 'addFile',
            'click #create-private' : 'createPrivateGist',
            'click #create-public'  : 'createPublicGist',
            'submit #form'          : 'submit'
        },
        initialize: function() {
            $('#error').hide();

            this.gistFileListView = new GistFileListView({ el: '#files' });
        },
        back: function() {
            window.location.href = 'overview.html';
        },
        addFile: function() {
            this.gistFileListView.createFile();
            return false;
        },
        createPrivateGist: function() {
            $.data($('#form')[0], 'public', false);
        },
        createPublicGist: function() {
            $.data($('#form')[0], 'public', true);
        },
        submit: function(event) {
            var isPublic = $.data(event.currentTarget, 'public');
            var info = this.getFiles();
            if (typeof info !== 'undefined' && info !== null)
                gister.create(info.description, isPublic, info.files, function(gist) {
                    window.location.href = 'overview.html';
                });

            return false;
        },
        getFiles: function() {
            var description = $('#files .description').val();
            var files = {};

            var fileList = $('#files .file').not('.removed');
            for (var index = 0; index < fileList.length; index++) {
                var field = $(fileList[index]);
                var filename = field.find('.filename').val();
                var content = field.find('.content').val();
                if (content.length === 0) {
                    $('#error').text('Content should not be empty').show();
                    selectFile(field.attr('rel'));
                    field.find('.content').focus();

                    return null;
                }

                if (filename in files) {
                    $('#error').text('Contents can\'t have duplicate filenames').show();
                    selectFile(field.attr('rel'));
                    field.find('.filename').focus();

                    return null;
                }

                files[filename] = { content: content };
            }

            return { description: description, files: files };
        }
    });

    function selectFile(index) {
        var files = $('#files .file');
        files.removeClass('current');
        $(files[index]).addClass('current');
    }

    var editPage = new EditPage({ el: 'body' });
})();

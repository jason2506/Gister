(function() {
    var bgPage = chrome.extension.getBackgroundPage();
    var gister = bgPage.gister;

    $('h1').click(function() {
        window.location.href = 'overview.html';
    });

    $('#add-file').click(function() {
        var file = addFile();
        $('#files').append(file);
        selectFile(file.attr('rel'));

        return false;
    });

    $('#files .file').click(function() {
        var index = $(this).attr('rel');
        selectFile(index);
    });

    $('#create-private').click(function() {
        $.data($('#form')[0], 'public', false);
    });

    $('#create-public').click(function() {
        $.data($('#form')[0], 'public', true);
    });

    $('#form').submit(function() {
        var isPublic = $.data(this, 'public');
        var info = getFiles();
        if (info)
            gister.create(info.description, isPublic, info.files, function(gist) {
                window.location.href = 'overview.html';
            });

        return false;
    });

    clearFiles();

    function clearFiles() {
        $('#error').hide();
        $('#files .append').remove();

        var file = $('#files');
        file.find('.filename').val('');
        file.find('.content').val('');

        selectFile(0);
    }

    function addFile() {
        var lastFile = $('#files .file').last();
        var lastIndex = lastFile.attr('rel');

        var clone = lastFile.clone();
        clone.find('.filename').val('');
        clone.find('.content').val('');
        clone.attr('rel', parseInt(lastIndex, 10) + 1);
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
        var files = $('#files .file');
        files.removeClass('current');
        $(files[index]).addClass('current');
    }

    function getFiles() {
        var description = $('#files .description').val();
        var files = {};

        var fileFields = $('#files .file');
        for (var index = 0, len = fileFields.length; index < len; index++) {
            var field = $(fileFields[index]);
            if (field.hasClass('removed'))
                continue;

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
})();

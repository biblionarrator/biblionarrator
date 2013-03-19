$(document).ready(function () {
    $('[data-toggle="cookie-view"]').click(function () {
        var target = $($(this).attr('data-target'));
        target.toggle();
        target.trigger('cookietoggle');
        if (target.is(':visible')) {
            jQuery.cookie($(this).attr('data-cookie'), 1);
        } else {
            jQuery.cookie($(this).attr('data-cookie'), 0);
        }
    }).each(function () {
            var target = $($(this).attr('data-target'));
        if (jQuery.cookie($(this).attr('data-cookie')) == 1) {
            $(this).addClass('active');
            target.show();
        } else {
            $(this).removeClass('active');
            target.hide();
        }
    });
});

var tocindex;
var toctree;

function traverseTOC(node, depth) {
    $(node).find('span, a').each(function () {
        if ($(this).attr('data-match')) {
            return;
        }
        var classes = $(this).attr('class').split(' ');
        var closestParentMatch = $(this).parents('a[data-match], span[data-match]').first().attr('data-match');
        var closestParent = $(tocTree).find('li[data-match="' + closestParentMatch + '"] > ul');
        if (closestParent.length > 0) {
            closestParent = closestParent.first();
        } else {
            closestParent = $(tocTree).find('ul').first();
        }
        for (var ii = 0, len = classes.length; ii < len; ++ii) {
            var value = $(this).text();
            if (typeof(fieldlist[classes[ii]]) !== 'undefined' && value.length > 0) {
                $(this).attr('data-match', tocindex);
                closestParent.append('<li aria-labelledby="labelField' + tocindex + '" data-match="' + tocindex + '" class="fieldEntry' + '"><a id="labelField' + tocindex + '" class="toclabel">' + fieldlist[classes[ii]].label + '</a><ul><li><a class="tocvalue">' + value + '</a></li></ul></li>');
            }
        }
        tocindex++;
    });
}

function updateFieldsTOCTree(node) {
    tocindex = 1;
    $('#fieldsTOC').remove();
    tocTree = document.createElement('div');
    $(tocTree).attr('id', 'fieldsTOC');
    $(tocTree).append('<ul></ul>');
    $('#recordContainer span, #recordContainer a').each(function () {
        $(this).removeAttr('data-match');
    });
    traverseTOC($('#recordContainer'), 1);
    $('#table-of-contents').append(tocTree);
    initializeTOC();
}

function initializeTOC() {
    $('#fieldsTOC').jstree({
        "plugins" : [ "themes", "html_data", "types", "ui" ],
        "themes" : { "icons": false },
    });
    $('#fieldsTOC').bind('select_node.jstree', function (e, data) {
        $('#recordContainer span, #recordContainer a').each(function () { $(this).removeClass('highlight') });
        var obj = data.rslt.obj[0];
        while (typeof(obj) !== 'undefined' && !obj.hasAttribute('data-match')) {
            obj = obj.parentNode;
        }
        if (typeof(obj) !== 'undefined' && obj.hasAttribute('data-match')) {
            $('#recordContainer span[data-match="' + obj.getAttribute('data-match') + '"], #recordContainer span[data-match="' + obj.getAttribute('data-match') + '"]').addClass('highlight');
            return false;
        }
    });
    $('#fieldsTOC').bind('deselect_node.jstree', function (e, data) {
        $('#recordContainer span, #recordContainer a').each(function () { $(this).removeClass('highlight') });
    });
}

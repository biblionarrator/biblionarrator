$(document).ready(function () {
    $('[data-toggle="cookie-view"]').click(function () {
        var target = $($(this).attr('data-target'));
        var activeclass = $(this).attr('data-class')
        var isactive;
        if (this.nodeName === 'INPUT') {
            isactive = $(this).prop('checked');
        } else {
            $(this).parent().toggleClass('active');
            isactive = $(this).parent().hasClass('active');
        }

        if (isactive) {
            jQuery.cookie($(this).attr('data-cookie'), '1');
            if (activeclass) {
                target.addClass(activeclass);
            } else {
                target.show();
            }
        } else {
            jQuery.cookie($(this).attr('data-cookie'), '0');
            if (activeclass) {
                target.removeClass(activeclass);
            } else {
                target.hide();
            }
        }
        target.trigger('cookietoggle');
    }).each(function () {
        var target = $($(this).attr('data-target'));
        var activeclass = $(this).attr('data-class')
        if (jQuery.cookie($(this).attr('data-cookie')) == '1') {
            if (this.nodeName == 'INPUT') {
                $(this).prop('checked', true);
            } else {
                $(this).parent().addClass('active');
            }
            if (activeclass) {
                target.addClass(activeclass);
            } else {
                target.show();
            }
        } else {
            if (this.nodeName == 'INPUT') {
                $(this).prop('checked', false);
            } else {
                $(this).parent().removeClass('active');
            }
            if (activeclass) {
                target.removeClass(activeclass);
            } else {
                target.hide();
            }
        }
        target.trigger('cookietoggle');
    });


    $('[data-toggle="confirm"]').click(function () {
        $('#confirmLabel').text($(this).attr('data-confirm-label'));
        $('#confirmBody').text($(this).attr('data-confirm-body'));
        $('#confirmOK').attr('data-callback', $(this).attr('id'));
        $('#confirm').modal('show');
        return false;
    });
    $('#confirm').keydown(function (ev) {
        if (ev.keyCode == 13) {
            $(this).find('.btn-ok').click();
        }
    });
    $('#confirmOK').click(function () {
        if (typeof $(this).attr('data-callback') !== 'undefined' && $(this).attr('data-callback').length > 0) {
            $('#' + $(this).attr('data-callback')).trigger('confirmed');
            $('#confirm').modal('hide');
        }
    });
    $('#confirm').on('hidden', function () {
        $(this).removeAttr('data-callback');
    });
});

var tocindex;
var toctree;

function traverseTOC(node, depth) {
    $(node).find('span, a').each(function () {
        if ($(this).attr('data-match') || typeof $(this).attr('class') === 'undefined') {
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

var attrs = [ 'role', 'itemscope', 'itemtype', 'itemid', 'itemprop', 'itemref' ];
// 'href' also a valid attribute

function html2raw(element) {
    var object, childs = element.childNodes;
    object = {};

    if (childs.length > 0) {
        var children = [];
        for (var i = 0; i < childs.length; i++) {
            if (childs[i].nodeType != 2) {
                children.push(html2raw(childs[i]));
            }
        }
        if (children.length > 0) {
            object['children'] = children;
        }
    }

    if (element.nodeType == 1) {
        var name = element.nodeName.toLowerCase();
        if ((name === 'span' || name === 'a') && typeof fieldlist[element.getAttribute('class')] !== 'undefined') {
            name = element.getAttribute('class');
        }
        for (var i=0, atts=element.attributes, l=atts.length; i<l; i++) {
            if (jQuery.inArray(atts.item(i).nodeName, attrs) >= 0 && atts.item(i).nodeValue.length > 0) {
                object[atts.item(i).nodeName] = atts.item(i).nodeValue;
            }
        }
        var inner = object;
        object = {};
        object[name] = inner;
    } else if (element.nodeType == 3) {
        return element.nodeValue;
    }
    return object;
}

var htmlelements = [ 'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'command', 'datalist', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr' ];

function raw2html(object) {
    var output = '';
    if (typeof object === 'string') {
        output = object;
    } else {
        for (var elem in object) {
            var htmlelem = elem;
            if (typeof object[elem] == 'undefined') {
                continue
            }
            if (jQuery.inArray(elem, htmlelements) < 0) {
                if (typeof object[elem]['link'] === 'undefined') {
                    htmlelem = 'span';
                } else {
                    htmlelem = 'a';
                }
                output += '<' + htmlelem + ' class="' + elem + '"';
            } else {
                output += '<' + elem;
            }
            for (var attr in object[elem]) {
                if (jQuery.inArray(attr, attrs) >= 0 && object[elem][attr].length > 0) {
                    output += ' ' + attr + '="' + object[elem][attr] + '"';
                }
            }
            output += '>';
            for (var child in object[elem]['children']) {
                output += raw2html(object[elem]['children'][child]);
            }
            output += '</' + htmlelem + '>';
        }
    }
    return output;
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

function addQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?|&])" + key + "=.*?(&|$)", "i");
    separator = uri.indexOf('?') !== -1 ? "&" : "?";
    return uri + separator + key + "=" + value;
}

function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?|&])" + key + "=.*?(&|$)", "i");
    separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
        return uri + separator + key + "=" + value;
    }
}

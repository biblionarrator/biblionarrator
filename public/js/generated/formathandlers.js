;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
window = window || {};
window.formatters = window.formatters || require('../lib/formats');

},{"../lib/formats":5}],2:[function(require,module,exports){
var attrs = ['href', 'role', 'itemscope', 'itemtype', 'itemid', 'itemprop', 'itemref'];
var htmlelements = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'command', 'datalist', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'];

var dom2raw = function(element) {
    var object, childs = element.childNodes;
    object = {};
    var i;

    if (childs.length > 0) {
        var children = [];
        for (i = 0; i < childs.length; i++) {
            if (childs[i].nodeType != 2) {
                children.push(dom2raw(childs[i]));
            }
        }
        if (children.length > 0) {
            object.children = children;
        }
    }

    if (element.nodeType == 1) {
        var name = element.nodeName.toLowerCase();
        if ((name === 'span' || name === 'a') && typeof fieldlist[element.getAttribute('class')] !== 'undefined') {
            name = element.getAttribute('class');
        }
        if (typeof fieldlist[name] !== 'undefined' && fieldlist[name].link) {
            object.link = '';
        }
        for (i = 0, atts = element.attributes, l = atts.length; i < l; i++) {
            if (atts.item(i).nodeName === 'href' && typeof fieldlist[name] !== 'undefined' && fieldlist[name].link && atts.item(i).nodeValue.indexOf('/record/') > -1) {
                object.link = atts.item(i).nodeValue.substr(atts.item(i).nodeValue.lastIndexOf('/') + 1);
            } else if (attrs.indexOf(atts.item(i).nodeName) >= 0 && atts.item(i).nodeValue.length > 0) {
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
};

var raw2html = function(object) {
    var output = '';
    if (typeof object === 'string') {
        output = object;
    } else if (typeof object === 'undefined' || object === null) {
        return '';
    } else {
        for (var elem in object) {
            var htmlelem = elem;
            if (typeof object[elem] == 'undefined') {
                continue;
            }
            if (htmlelements.indexOf(elem) < 0) {
                if (typeof object[elem].link === 'undefined' && typeof object[elem].href === 'undefined') {
                    htmlelem = 'span';
                    if (object[elem].link !== '') {
                        object[elem].href = '/record/' + object[elem].link;
                    }
                } else {
                    htmlelem = 'a';
                }
                output += '<' + htmlelem + ' class="' + elem + '"';
            } else {
                output += '<' + elem;
            }
            for (var attr in object[elem]) {
                if (attrs.indexOf(attr) >= 0 && object[elem][attr].length > 0) {
                    output += ' ' + attr + '="' + object[elem][attr] + '"';
                }
            }
            output += '>';
            for (var child in object[elem].children) {
                output += raw2html(object[elem].children[child]);
            }
            output += '</' + htmlelem + '>';
        }
    }
    return output;
};

module.exports.render = function(recorddata) {
    return raw2html(recorddata);
};

module.exports.snippet = function(recorddata) {
    var snippetdata = {
        article: {
            children: []
        }
    };
    for (var idx in recorddata.article.children) {
        snippetdata.article.children.push(recorddata.article.children[idx]);
        if (typeof recorddata.article.children[idx].header !== 'undefined') {
            break;
        }
    }
    return snippetdata;
};

module.exports.indexes = function(recorddata) {};

module.exports.links = function(recorddata) {};

module.exports.decompile = function(htmldom) {
    return dom2raw(htmldom);
};

},{}],3:[function(require,module,exports){
module.exports.render = function(recorddata) {
    var rendered = '<article><header><span class="dc_title">' + recorddata.title + '</span> (<span class="eric_accno">' + recorddata.accno + '</span>)';
    if (recorddata.creators) {
        rendered = rendered + '<div>';
        for (var ii in recorddata.creators) {
            rendered = rendered + '<span class="dc_creator">' + recorddata.creators[ii] + '</span>; ';
        }
        rendered = rendered + '</div>';
    }
    if (recorddata.source) {
        rendered = rendered + '<div><span class="dc_source">' + recorddata.source + '</span>';
        if (recorddata.citation) {
            rendered = rendered + ' <span class="eric_citation">' + recorddata.citation + '</span>';
        }
        rendered = rendered + '</div>';
    }
    if (recorddata.description) {
        rendered = rendered + '<span class="dc_description">' + recorddata.description + '</span>';
    }
    rendered = rendered + '</header>';
    if (recorddata.publisher || recorddata.doi) {
        rendered = rendered + '<section>';
        if (recorddata.publisher) {
            rendered = rendered + '<span class="dc_publisher">' + recorddata.publisher + '</span>. ';
        } 
        if (recorddata.doi) {
            rendered = rendered + '<a href="' + recorddata.doi + '" class="eric_doi">' + recorddata.doi + '</a>';
        } 
        rendered = rendered + '</section>';
    }
    if (recorddata.subjects) {
        rendered = rendered + '<section><em>Subjects:</em><ul>';
        for (var ii in recorddata.subjects) {
            rendered = rendered + '<li><span class="dc_subject">' + recorddata.subjects[ii] + '</span></li>';
        }
        rendered = rendered + '</ul></section>';
    }
    if (recorddata.types) {
        rendered = rendered + '<section><em>Publication type:</em><ul>';
        for (var ii in recorddata.types) {
            rendered = rendered + '<li><span class="dc_type">' + recorddata.types[ii] + '</span></li>';
        }
        rendered = rendered + '</ul></section>';
    }
    rendered = rendered + '</article>';
    return rendered;
};

module.exports.snippet = function(recorddata) {
    var rendered = '<article><header><span class="dc_title">' + recorddata.title + '</span> (<span class="eric_accno">' + recorddata.accno + '</span>)';
    if (recorddata.creator) {
        rendered = rendered + '<div>';
        for (var ii in recorddata.creator) {
            rendered = rendered + '<span class="dc_creator">' + recorddata.creator[ii] + '</span>; ';
        }
        rendered = rendered + '</div>';
    }
    if (recorddata.source) {
        rendered = rendered + '<div><span class="dc_source">' + recorddata.source + '</span>';
        if (recorddata.citation) {
            rendered = rendered + ' <span class="eric_citation">' + recorddata.citation + '</span>';
        }
        rendered = rendered + '</div>';
    }
    if (recorddata.description) {
        rendered = rendered + '<span class="dc_description">' + recorddata.description + '</span>';
    }
    rendered = rendered + '</header></article>';
    return rendered;
};

module.exports.indexes = function(recorddata) {};

module.exports.links = function(recorddata) {};

module.exports.decompile = function(htmldom) {
};


},{}],4:[function(require,module,exports){
module.exports.render = function(recorddata) {
    var rendered = '<article><header><span class="eric_term">' + recorddata.name + '</span>';
    if (recorddata.scope) {
        rendered = rendered + '<span class="eric_scope">' + recorddata.scope + '</span>';
    }
    rendered = rendered + '</header>';
    if (recorddata.narrower) {
        rendered = rendered + '<section><em>Narrower terms:</em><ul>';
        for (var ii in recorddata.narrower) {
            rendered = rendered + '<li><span class="eric_narrower">' + recorddata.narrower[ii] + '</span></li>';
        }
        rendered = rendered + '</ul></section>';
    }
    if (recorddata.broader) {
        rendered = rendered + '<section><em>Broader terms:</em><ul>';
        for (var ii in recorddata.broader) {
            rendered = rendered + '<li><span class="eric_broader">' + recorddata.broader[ii] + '</span></li>';
        }
        rendered = rendered + '</ul></section>';
    }
    if (recorddata.related) {
        rendered = rendered + '<section><em>Related terms:</em><ul>';
        for (var ii in recorddata.related) {
            rendered = rendered + '<li><span class="eric_related">' + recorddata.related[ii] + '</span></li>';
        }
        rendered = rendered + '</ul></section>';
    }
    if (recorddata.preferred) {
        rendered = rendered + '<section><em>Instead of this term, use:</em><ul>';
        for (var ii in recorddata.preferred) {
            rendered = rendered + '<li><span class="eric_preferred">' + recorddata.preferred[ii] + '</span></li>';
        }
        rendered = rendered + '</ul></section>';
    }
    if (recorddata.synonyms) {
        rendered = rendered + '<section><em>Synonyms:</em><ul>';
        for (var ii in recorddata.synonyms) {
            rendered = rendered + '<li><span class="eric_synonyms">' + recorddata.synonyms[ii] + '</span></li>';
        }
        rendered = rendered + '</ul></section>';
    }
    rendered = rendered + '</article>';
    return rendered;
};

module.exports.snippet = function(recorddata) {
    var rendered = '<article><header><span class="eric_term">' + recorddata.name + '</span>';
    if (recorddata.scope) {
        rendered = rendered + '<span class="eric_scope">' + recorddata.scope + '</span>';
    }
    rendered = rendered + '</header></article>';
    return rendered;
};

module.exports.indexes = function(recorddata) {};

module.exports.links = function(recorddata) {};

module.exports.decompile = function(htmldom) {
};

},{}],5:[function(require,module,exports){
module.exports = {
    bnjson: require('./bnjson'),
    ericthesaurus: require('./ericthesaurus'),
    eric: require('./eric')
}

},{"./bnjson":2,"./eric":3,"./ericthesaurus":4}]},{},[1])
;
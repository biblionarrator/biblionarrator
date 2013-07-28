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

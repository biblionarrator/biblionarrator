module.exports.render = function(recorddata) {
    var ii;
    var rendered = '<article><header><span class="dc_title">' + recorddata.title + '</span> (<span class="eric_accno">' + recorddata.accno + '</span>)';
    if (recorddata.creators) {
        rendered = rendered + '<div>';
        for (ii in recorddata.creators) {
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
        for (ii in recorddata.subjects) {
            rendered = rendered + '<li><span class="dc_subject">' + recorddata.subjects[ii] + '</span></li>';
        }
        rendered = rendered + '</ul></section>';
    }
    if (recorddata.types) {
        rendered = rendered + '<section><em>Publication type:</em><ul>';
        for (ii in recorddata.types) {
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

function stringify (object) {
    var string = '';
    if (typeof object !== 'object') {
        return object;
    }
    for (var el in object) {
        string = string + ' ' + stringify(object[el]);
    }
    return string;
}

module.exports.indexes = function(recorddata) {
    return {
        key: recorddata.accno,
        title: recorddata.title,
        source: recorddata.source,
        citation: recorddata.citation,
        description: recorddata.description,
        publisher: recorddata.publisher,
        uri: recorddata.uri,
        keyword: stringify(recorddata)
    };
};


/*jshint unused:false */ /* Not yet implemented */
module.exports.links = function(recorddata) {};

module.exports.decompile = function(htmldom) {
};
/*jshint unused:true */

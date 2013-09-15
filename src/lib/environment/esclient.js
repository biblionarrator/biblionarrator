var ElasticSearchClient = require('elasticsearchclient');

function ESClient(config) {
    var self = this;
    var client;

    if (config.graphconf.engine === 'titan' && config.graphconf.titan["storage.index.search.backend"] === "elasticsearch") {
        client = new ElasticSearchClient({
            host: config.graphconf.titan["storage.index.search.hostname"],
            port: 9200,
            secure: false
        });
    }

    self.search = function () {
        return client.search.apply(client, arguments);
    };

    self.index = { };
    for (var index in config.indexes) {
        self.index[config.indexes[index].id] = index;
    }

    return self;
}

module.exports = ESClient;

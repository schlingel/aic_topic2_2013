var restify = require('restify');

var client = restify.createJsonClient({
    url: 'http://localhost:34555',
    version: '*'
});

client.post('/tasks', { text: 'Test', callback_url: 'http://somehost',
    description: [{name: 'var1', type: 'text'}, {name: 'var2', type: 'numeric'}]}, function(err, req, res, obj) {
        console.log('%d -> %j', res.statusCode, res.headers);
        console.log('%j', obj);
    });

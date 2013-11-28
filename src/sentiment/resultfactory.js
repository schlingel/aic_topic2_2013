var orm = require('./orm.js'),
	Company = orm.Company,
	_ = require('underscore'),
	restify = require('restify'),
	Result = orm.Result,
	$ = require('jquery');
	
var crowdSourcingUrl = 'http://localhost:34555';
var client = restify.createJsonClient({
    url: crowdSourcingUrl,
    version: '*'
});
	

exports.CrowdSourcing = {
	get : function(id) {
		var deferred = $.Deferred();
		
        client.get('/tasks/' + id, function(err, req, res, obj) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(obj);
            }
		});
		
		return deferred.promise();
	},

	addTask : function(text, callbackUrl) {
		var deferred = $.Deferred();
			params = {
				text : text,
				callback_url : callbackUrl,
				description : [
					{ name: 'companies', type: 'text' },
					{ name: 'products', type: 'text' },
					{ name: 'product_scores', type: 'numeric' },
					{ name: 'company_scores', type: 'numeric' }
				]
			};
	
		client.post('/tasks', params, function(err, req, res, obj) {
			if(err) {
				deferred.reject(err);
			} else {
				deferred.resolve(obj);
			}
		});
			
		return deferred.promise();
	}
};

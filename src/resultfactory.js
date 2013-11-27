var orm = require('./orm.js'),
	Company = orm.Company,
	_ = require('underscore'),
	request = require('request'),
	restify = require('restify'),
	Result = orm.Result,
	$ = require('jquery');
	
var crowdSourcingUrl = 'http://localhost:34555/tasks';
	

exports.CrowdSourcing = {
	get : function(id) {
		var deferred = $.Deferred();
		
		request(crowdSourcingUrl + '/' + id, function(error, response, body) {	
			if(!error && response.statusCode == 200) {
				deferred.resolve(body);
			} else {
				deferred.reject(error);
			}
		});
		
		return deferred.promise();
	},

	addTask : function(text, callbackUrl) {
		var client = restify.createJsonClient({
			url: crowdSourcingUrl,
			version: '*'
		});

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
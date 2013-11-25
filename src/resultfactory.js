var orm = require('./orm.js'),
	Company = orm.Company,
	_ = require('underscore'),
	request = require('request'),
	Result = orm.Result,
	$ = require('jquery');
	
var crowdSourcingUrl = 'http://localhost:9876/tasks';
	

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
		
		request({
			method : 'POST',
			uri : crowdSourcingUrl,
			multipart : [{ 
					'content-type' : 'application/json',
					body : JSON.stringify(params)
				}]
		}, function(error, response, body) {
			if(!error && response.statusCode == 200) {
				deferred.resolve(body);
			} else {
				deferred.reject(error);
			}
		});
		
		return deferred.promise();
	}
};
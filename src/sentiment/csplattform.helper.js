var orm = require('./orm.js'),
	Company = orm.Company,
	_ = require('underscore'),
	Job = orm.Job,
	request = require('request'),
	restify = require('restify'),
	Result = orm.Result,
	$ = require('jquery');
	
var crowdSourcingUrl = 'http://localhost:34555/tasks';
	

exports.CrowdSourcing = {
	get : function(id) {
		var deferred = $.Deferred();
		
		Job.sync().success(function() {
			Job.find({ where : { id : id }}).success(function(job) {
				var csId = job.crowd_sourcing_id;
				
				request(crowdSourcingUrl + '/' + csId, function(error, response, body) {	
					if(!error && response.statusCode == 200) {
						deferred.resolve(body);
					} else {
						deferred.reject(error);
					}
				});				
			}).error(function(err) {
				console.log('no job with id ', id);
				deferred.reject(err);
			});
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
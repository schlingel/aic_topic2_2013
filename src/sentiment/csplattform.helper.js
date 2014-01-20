var orm = require('./orm.js'),
	_ = require('underscore'),
	Job = orm.Job,
	restify = require('restify'),
    jsdom = require('jsdom'),
	$ = require('jquery')(jsdom.jsdom().createWindow());
	
var crowdSourcingUrl = 'http://localhost:34555';
var client = restify.createJsonClient({
    url: crowdSourcingUrl,
    version: '*'
});
	

exports.CrowdSourcing = {
	get : function(id) {
		var deferred = $.Deferred();
		
		Job.sync().success(function() {
			Job.find({ where : { id : id }}).success(function(job) {
				var csId = job.crowd_sourcing_id;
				
				client.get('/tasks/' + csId, function(err, req, res, obj) {
		            if (err) {
		                deferred.reject(err);
		            } else {
		                deferred.resolve(obj);
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

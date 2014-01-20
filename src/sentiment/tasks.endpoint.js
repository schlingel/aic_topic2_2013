var orm = require('./orm.js'),
	Paragraph = orm.Paragraph,
	Link = orm.Link,
	Job = orm.Job,
	JobEntity = orm.JobEntity,
	ScoreEntity = orm.ScoreEntity,
	Score = orm.Score,
	JobEntity = orm.JobEntity,
    jsdom = require('jsdom'),
	$ = require('jquery')(jsdom.jsdom().createWindow()),
	_ = require('underscore'),
	csUtils = require('./csplattform.helper.js'),
	CrowdSourcing = csUtils.CrowdSourcing,
	restify = require('restify');
	
var server = restify.createServer();
server.use(restify.bodyParser());
server.use(restify.CORS());

var serverCfg = {
	url : 'http://localhost',
	port : 12345
};

server.get('/result/:taskId', function(req, res, next) {
	var taskId = req.params.taskId;

    function typeFilter(results, filter) {
        return $.map(results, function(result) {
           return result.name !== filter ? undefined : {
                worker_id : result.worker_id,
                value : result.value.split(',')
           };
        });
    }

	CrowdSourcing.get(taskId).always(function(resp) {
		var jobStatus = -1;
		
		resp = (typeof resp == 'string') ? JSON.parse(resp) : resp;
		
		if(resp && resp.success) {
			jobStatus = 2;
		
			var companies = typeFilter(resp.results, 'companies'),
				products = typeFilter(resp.results, 'products'),
				product_scores = typeFilter(resp.results, 'product_scores'),
                company_scores = typeFilter(resp.results, 'company_scores');
	
			company_scores = $.map(company_scores, function(score) { return { worker_id : score.worker_id, value : parseFloat(score.value) }; });
			product_scores = $.map(product_scores, function(score) { return { worker_id : score.worker_id, value : parseFloat(score.value) }; });
	
			function createEntity(index, names, scores, type, job) {
				ScoreEntity.sync().success(function() {
					ScoreEntity.findOrCreate({
						name : names[index],
						type : type
					}).success(function(entity) {
						addToJobToEntityIfNeeded(entity, job);
					
						Score.sync().success(function() {
							Score.create({
								score: scores[index].value,
								entity_id : entity.dataValues.id,
								link_id : job.link_id,
                                worker_id : scores[index].worker_id
							}).success(function(score) {
								console.log('created score!');
							}).error(function(err) {
								console.log(err);
							});
						}).error(function(err) {
							console.log('score sync does not work!', err);
						});
					}).error(function(err) {
						console.log('Could not find or create entity!', err);
					});
				}).error(function(err) {
					console.log('sync does not work!', err);
				});
			};
			
			function addToJobToEntityIfNeeded(entity, job) {
				JobEntity.sync().success(function() {
					JobEntity.findOrCreate({
						job_id : job.id,
						entity_id : entity.id
					}).success(function(jobEntity) {
						console.log('Created link from entity ', entity.id, ' to job ', job.id);
					}).error(function(err) {
						console.log('Could not create link from entity ', entity.id, ' to job ', job.id);
					});
					
				}).error(function(err) {
					console.log('Could not synchronize job entity table!', err);
				});
			};
	
			Job.find({ where : { 'id' : taskId }}).success(function(job) {
				for(var i = 0, len = companies.length; i < len; i++) {
					createEntity(i, companies[i].value, company_scores, 0, job);
				}
				
				for(var i = 0, len = products.length; i < len; i++) {
					createEntity(i, products[i].value, product_scores, 1, job);
				}			
			}).error(function(err) {
				console.log('No job found with id ', taskId)
			});
		} else {
			console.log('Got error', resp);
		}
		
		
		Job.update({ status : jobStatus }, { id : taskId });
	});
	
	res.charSet('UTF-8');
	res.send({ success : true });
	next();
});

server.get('/job/entities/:jobId', function(req, res, next) {
	var jobId = req.params.jobId;
	res.charSet('UTF-8');
	
	JobEntity.sync().success(function() {
		ScoreEntity.sync().success(function() {
			JobEntity.findAll({where : { job_id : jobId }}).success(function(jobentity) {
				
				if(!!jobentity) {
					var entityIds = $.map(jobentity, function(value) { return value.entity_id });
					
					console.log('got entitie ids: ', entityIds);
					
					ScoreEntity.findAll({where: { id : entityIds }}).success(function(entities) {
						console.log('got entities: ', entities);
						
						if(!!entities) {
							res.charSet('UTF-8');
							res.send({
								success : true,
								entities : $.map(entities, function(entity) { return (!!entity) ? entity.dataValues : undefined; })
							});
							
							next();
						} else {
							onError('No entities found');
						}
						
						
					}).error(onError);
				} else {
					onError("job link not found");
				}
			}).error(onError);
		}).error(onError);
	}).error(onError);
	
	function onError(msg) {
		console.log('Error in job entity lookup: ', msg);
		
		res.charSet('UTF-8');
		res.send({
			success : false,
			message : msg
		});
		
		next();
	};
});


server.get('/products', function(req, res, next) {
	ScoreEntity.findAll({ where: { type : 1 } }).success(function(entities) {
		res.charSet('UTF-8');
		res.send({
			success : true,
			products : $.map(entities, function(entity) { return entity.dataValues; })
		});
	
		next();
	});

});

server.get('/companies', function(req, res, next) {
	ScoreEntity.findAll({ where : { type : 0 }}).success(function(entities) {
		res.charSet('UTF-8');
		res.send({
			success : true,
			companies : $.map(entities, function(entity) { return entity.dataValues; })
		});
	
		next();
	});

});

server.get('/entity/scores/:id', function(req, res, next) {
	var entityId = req.params.id;

	Score.sync().success(function() {
		Score.findAll({ where : { entity_id : entityId}}).success(function(scores) {
			res.charSet('UTF-8');
			res.send({
				success : true,
				scores : $.map(scores, function(score) { return score.dataValues; })
			});
			
			next();
		});
	});
});

server.get('/scores', function(req, res, next) {
	Score.sync().success(function() {
		Score.findAll().success(function(scores) {
			res.charSet('UTF-8');
			res.send({
				success : true,
				scores : $.map(scores, function(score) { return score.dataValues; })
			});
			
			next();
		});
	});
});

server.get('/articles/', function(req, res, next) {
	Link.findAll().success(function(links) {
		res.charSet('UTF-8');
		res.send({
			success : true,
			articles : $.map(links, function(link) { return link.dataValues; })
		});
		
		next();
	});
});

server.get('/job/:id', function(req, res, next) {
	var id = req.params.id;
	
	Job.sync().success(function() {
		var jobsHandler = function(jobs) {
			res.charSet('UTF-8');
			res.send({
				success : true,
				tasks : $.map(jobs, function(job) { return job.dataValues; })
			});
			
			next();
		};
		
		Job.findAll({ where : { link_id : id }}).success(jobsHandler);
	});
});

server.get('/job', function(req, res, next) {
	Job.sync().success(function() {
		var jobsHandler = function(jobs) {
			res.charSet('UTF-8');
			res.send({
				success : true,
				tasks : $.map(jobs, function(job) { return job.dataValues; })
			});
			
			next();
		};
		
		Job.findAll().success(jobsHandler);
	});
});

server.post('/job/', function(req, res, next) {
	var params = (req.params.article == undefined) ? JSON.parse(req.body) : req.params,
		article = params.article,
		paragraph = params.paragraph,
		url = serverCfg.url + ':' + serverCfg.port + '/result/';
	
	function csCallback(job, article, parId) {
		return function(result) {
			var status = -1,
				csId = null;
		
			result = (typeof result == 'string') ? JSON.parse(result) : result;
		
			if(!!result && result.success) {
				csId = result.task_id;
				status = 1;
			} else {
				console.log('Got an error while creating Job for paragraph', parId, ' and article ', article.id);
				console.log('    error...', result);
				
			}
			
			job.status = status;
			job.crowd_sourcing_id = csId;
			job.link_id = article.id;
			
			job.save().success(function() {
				console.log('updated job');
			}).error(function(err) {
				console.log('Could not update job!', err);
			});
		};
	};
	
	Job.sync().success(function() {
		Job.create({ link_id : article.id, par_id : paragraph.id }).success(function(job) {
			CrowdSourcing.addTask(paragraph.text, (url + job.id)).always(csCallback(job, article, paragraph.id));
			
			res.charSet('UTF-8');
			res.send({
				success : true,
				job_id : job.id
			});
			
			next();
		});
	});
	
	next();
});

server.get('/pars/:id', function(req, res, next) {
	var linkId = req.params.id,
		linkDeferred = $.Deferred(),
		parDeferred = $.Deferred();
	
	Paragraph.findAll({ where : { link_id : linkId }}).success(function(pars) {			
		var result = {
			success : true,
			pars : $.map(pars, function(par) { return par.dataValues; })
		};
		
		parDeferred.resolve(result);
	});
	
	Link.find({ where : { id : linkId }}).success(function(link) {
		var result = {
			success : true,
			article : link.dataValues
		};
		
		linkDeferred.resolve(result);
	});
	
	$.when(linkDeferred.promise(), parDeferred.promise()).done(function(link, pars) {
		res.charSet('UTF-8');
		res.send({
			success : link.success && pars.success,
			pars : pars.pars,
			article : link.article
		});
	
		next();
	});
});

server.listen(serverCfg.port);

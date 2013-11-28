var orm = require('./orm.js'),
	Paragraph = orm.Paragraph,
	Link = orm.Link,
	Job = orm.Job,
	ScoreEntity = orm.ScoreEntity,
	Score = orm.Score,
	$ = require('jquery'),
	_ = require('underscore'),
	csUtils = require('./resultfactory.js'),
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
	
	CrowdSourcing.get(taskId).always(function(resp) {
		var jobStatus = -1;
		
		resp = (typeof resp == 'string') ? JSON.parse(resp) : resp;
		
		if(resp && resp.success) {
			jobStatus = 2;
		
			var companies = $.map(resp.results, function(result) { return result.name == 'companies' ? result.value.split(',') : undefined; }),
				products = $.map(resp.results, function(result) { return result.name == 'products' ? result.value.split(',') : undefined; }),
				product_scores = $.map(resp.results, function(result) { return result.name == 'product_scores' ? result.value.split(',') : undefined; }),
				company_scores = $.map(resp.results, function(result) { return result.name == 'company_scores' ? result.value.split(',') : undefined; });
	
			company_scores = $.map(company_scores, function(score) { return parseFloat(score); });
			product_scores = $.map(product_scores, function(score) { return parseFloat(score); });
	
			function createEntity(index, names, scores, type, job) {
				ScoreEntity.sync().success(function() {
					ScoreEntity.findOrCreate({
						name : names[index],
						type : type
					}).success(function(entity) {
						console.log('got entity', scores[index], type, names[index]);
						console.log('');
					
						Score.sync().success(function() {
							Score.create({
								score: scores[index],
								entity_id : entity.dataValues.id,
								link_id : job.link_id
							}).success(function(score) {
								console.log('created score!');
							}).error(function(err) {
								console.log(err);
							});
						});
					});
				});
			};
	
			Job.find({ where : { 'id' : taskId }}).success(function(job) {
				for(var i = 0, len = companies.length; i < len; i++) {
					createEntity(i, companies, company_scores, 0, job);
				}
				
				for(var i = 0, len = products.length; i < len; i++) {
					createEntity(i, products, product_scores, 1, job);
				}			
			});
		}
		
		
		Job.update({ status : jobStatus }, { id : taskId });
	});
	
	res.charSet('UTF-8');
	res.send({ success : true });
	next();
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
	
	function csCallback(job, articleId, parId) {
		return function(result) {
			var status = -1,
				csId = null;
		
			console.log('got result', result);
		
			result = (typeof result == 'string') ? JSON.parse(result) : result;
		
			if(!!result && result.success) {
				csId = result.task_id;
				status = 1;
			}
			
			job.status = status;
			job.cs_id = csId;
			job.save().success(function() {
				console.log('updated job');
			});
		};
	};
	
	Job.sync().success(function() {
		Job.create({ link_id : article.id, par_id : paragraph.id }).success(function(job) {
			CrowdSourcing.addTask(paragraph.text, (url + job.id)).always(csCallback(job, article.id, paragraph.id));
			
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

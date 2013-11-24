var orm = require('./orm.js'),
	Paragraph = orm.Paragraph,
	Link = orm.Link,
	$ = require('jquery'),
	_ = require('underscore'),
	restify = require('restify');
	
var server = restify.createServer();
server.use(restify.bodyParser());
server.use(cors);

var serverCfg = {
	url : 'http://localhost',
	port : 12345
};

function cors(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
};

server.get('/result/:taskId', function(req, res, next) {
	var taskId = req.params.taskId;
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
var orm = require('./orm.js'),
	Paragraph = orm.Paragraph,
	Link = orm.Link,
	$ = require('jquery'),
	_ = require('underscore'),
	restify = require('restify');
	
var server = restify.createServer();
server.use(restify.bodyParser());
server.use(cors);

function cors(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
};

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
	var linkId = req.params.id;
	
	Paragraph.findAll({ where : { link_id : linkId }}).success(function(pars) {
			res.charSet('UTF-8');
			res.send({
				success : true,
				pars : $.map(pars, function(par) { return par.dataValues; })
			});
			
			next();
	});
});

server.listen(12345);
var orm = require('./orm.js'),
	Paragraph = orm.Paragraph,
	Link = orm.Link,
	Job = orm.Job,
    jsdom = require('jsdom'),
	$ = require('jquery')(jsdom.jsdom().createWindow()),
	_ = require('underscore'),
	restify = require('restify');
	
var server = restify.createServer();
server.use(restify.bodyParser());
server.use(cors);

var serverCfg = {
	url : 'http://localhost',
	port : 9876
};

function cors(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
};

server.get('/tasks/:taskId', function(req, res, next) {
	function shuffle(v){
		for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);

		return v;
	};
	
	function companyResult() {
		var companies = ['Microsoft', 'Sony', 'VW', 'Google', 'Kurier', 'Hofer', 'Apple'];
	 
		return $.map(shuffle(companies), function(company, i) { return (i < 2) ? company : undefined; }).join(',');
	};
	
	function productResult() {
		var products = ['Playstation', 'Zeitung', 'XBox', 'Chrome', 'Android', 'Galaxy S IV', 'Dominosteine'];
		
		return $.map(shuffle(products), function(product, i) { return (i < 2) ? product : undefined; }).join(',');
	};
	
	function scoreResult() {
		return $.map([1, 2], function() { return Math.random(); }).join(',');
	};
	
	res.charSet('UTF-8');
	res.send({
		success : true,
		results : [
			{ name : 'companies', value : companyResult() },
			{ name : 'products', value : productResult() },
			{ name : 'product_scores', value : scoreResult() },
			{ name : 'company_scores', value: scoreResult() }
		]
	});
	
	next();
});

server.post('/tasks/', function(req, res, next) {
	res.charSet('UTF-8');
	res.send({
		task_id : Math.floor((Math.random()*100)+1),
		success : true
	});
	
	next();
});

server.listen(serverCfg.port);
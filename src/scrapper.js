var request = require('request'),
	$ = require('jquery'),
	restify = require('restify');
	
var server = restify.createServer();
server.use(restify.bodyParser());

server.post('/fetch/:url', function(req, res, next) {
	req.params = req.body;
	handleScrapRequest(req, res, next);
});
server.get('/fetch/:url', handleScrapRequest);

server.listen(12345);

function handleScrapRequest(req, res, next) {
	var uri = decodeURIComponent(req.params.url);
	res.charSet('UTF-8');

	scrapUrl(uri)
		.done(function(paragraphs) {
			res.send({ success : true, url : uri, paragraphs: $.map(paragraphs, function(p) { return $(p).text(); }) });
		})
		.fail(function(cause) {
			res.send({ success : false, url : uri, errors : [cause] });
		})
		.always(function() {
			next();
		});
	
	next();
};
	
function scrapUrl(url) {
	var fetchDeferred = $.Deferred(),
		$fetch = fetchDeferred.promise(),
		fctDeferred = $.Deferred(),
		$promise = fctDeferred.promise();

	$fetch.done(function(body) {
		var $body = $(body),
			paragraphs = $body.find('p'),
			$paragraphs = null,
			maxParagraphsInElement  = 0;
		
		paragraphs.each(function(i, p) {
			var $p = $(p),
				$parent = $p.parent(),
				$paragraphsInParent = $parent.find('p'),
				paragraphsInParent = $paragraphsInParent.length;
			
			if(paragraphsInParent > maxParagraphsInElement) {
				$paragraphs = $paragraphsInParent;
				maxParagraphsInElement = paragraphsInParent
			}
		});
		
		if(maxParagraphsInElement == 0) {
			fctDeferred.reject();
		} else {
			fctDeferred.resolve($paragraphs);
		}
	});

	$fetch.fail(function(error) {
		fctDeferred.reject(error);
	});
		
	if(!url) {
		fctDeferred.reject('invalid url');
	} else {
		request(url, function(error, response, body) {
			if(!error && response.statusCode == 200) {
				fetchDeferred.resolve(body);
			} else {
				fetchDeferred.reject(error);
			}
		});
	}
	
	return $promise;
};
	
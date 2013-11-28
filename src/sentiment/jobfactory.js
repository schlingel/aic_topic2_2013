var orm = require('./orm.js'),
	Paragraph = orm.Paragraph,
	Link = orm.Link,
	_ = require('underscore'),
	request = require('request'),
	$ = require('jquery');
	
var textLenThreshold = 100;
	
Paragraph.sync().then(function() {
	Link.sync().success(function() {
		createParagraphsLoop();
	});
});

function createParagraphsLoop() {
	createParagraphs();
	
	setTimeout(function() {
		createParagraphsLoop();
	}, 10000);
};
	
function createParagraphs() {
	Link.findAll({ status : 0 }).success(function(links) {
		_.each(links, function(link) {
			var row = link.dataValues;
			
			scrapUrl(row.link).done(function($paragraphs) {
				$.map($paragraphs, function(paragraph) {
					var text = $(paragraph).text();
				
					if(text.length >= textLenThreshold) {
						Paragraph.create({
								text : text,
								status : 0,
								link_id : link.id
						});
					}					
				});
			});
		});
	});
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
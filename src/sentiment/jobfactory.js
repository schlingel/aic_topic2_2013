var orm = require('./orm.js'),
	Paragraph = orm.Paragraph,
	Link = orm.Link,
	_ = require('underscore'),
	request = require('request'),
    jsdom = require('jsdom'),
	$ = require('jquery')(jsdom.jsdom().createWindow());
	
var TEXT_THRESHOLD_CHARS = 100,
    INTERVALL_MS = 20000;

Paragraph.sync().then(function() {
	Link.sync().success(function() {
	    createParagraphs();
	});
});

function createParagraphsLoop() {
	createParagraphs().done(function() {
        setTimeout(function() {
            createParagraphsLoop();
        }, INTERVALL_MS);
    });
};

function processUrls(links) {
    var link = links[0];

    console.log('Processing url [' + link.link + ']')

    scrapUrl(link.link).done(function() {
        links = links.slice(1);

        if(links.length > 0) {
            processUrls(links);
        }
    });
};

function createParagraphs() {
    var promises = [],
        parDeferred = $.Deferred();

	Link.findAll({ status : 0 }).success(function(links) {


		_.each(links, function(link) {
			var row = link.dataValues,
                deferred = $.Deferred();

            function onScrapped() {
              deferred.resolve();
            };

            promises.push(deferred.promise());

			scrapUrl(row.link).done(function($paragraphs) {
				$.each($paragraphs, function(i, paragraph) {
					var text = $(paragraph).text();

					if(text.length >= TEXT_THRESHOLD_CHARS) {
						Paragraph.create({
								text : text,
								status : 0,
								link_id : link.id
						}).done(onScrapped).error(onScrapped);
					}
				});

                console.log('did [' + row.link + ']');
			});
		});
	});

    $.when.apply($, promises).done(function() {
       parDeferred.resolve();
    });

    return parDeferred.promise();
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
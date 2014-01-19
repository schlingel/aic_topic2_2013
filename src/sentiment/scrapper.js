var orm = require('./orm.js'),
	$ = require('jquery'),
	_ = require('underscore'),
	request = require('request');
	
var Link = orm.Link,
	rssFeeds = ['http://feeds.finance.yahoo.com/rss/2.0/headline?s=yhoo&region=US&lang=en-US', 'http://pipes.yahoo.com/pipes/pipe.run?_id=025e69973f7f161accf1e9fbe41bdc2d&_render=rss'],
	links = [],
	maxLen = 100;
	
fetchFeeds();
	
function fetchFeeds() {
	_.each(rssFeeds, function(feed) {

		request(feed, function(error, response, body) {
			if(!error && response.statusCode == 200) {
				handleRssFeed(body);
				
				setTimeout(fetchFeeds, 10000);
			} else {
				console.log('got error !', error);
			}
		});
	});		
};
	
function pushToDb(href, title) {
	Link.sync().success(function() {
		Link.create({ 
			status: 0, 
			link : href,
			title : title			
		});
	});
};
	
function handleRssFeed(body) {
	var $body = $(body);
	
	$body.find('item').each(function(i, item) {
		var $item = $(item),
			title = $item.find('title').text(),
			href = $item.find('link').text();
		
		// WTF!? Fixes jQuery bug <-> inserts <link />text instead of <link>text</link>
		if($.trim(href) == "") {
			var match = $item.html().match(/<link \/>.*<description>/);
			
			if(match != null && match[0].indexOf('<link') == 0) {
				href = match[0].substring(8);
				href = href.substring(0, href.length - 13);
			}		
		}

		
		if(!_.contains(links, href) && $.trim(href) !== '') {
			console.log('got href', href);
		
			pushToDb(getArticleLink(href), title);
			
			if(links.length >= maxLen) {
				links = links.reverse();
				links.pop();
				links = links.reverse();
			}
			
			links.push(href);
		}
	});
};

function getArticleLink(href) {
	var separator = href.indexOf('*');

	console.log(href);
	
	if(separator && separator < href.length) {
		href = href.substring(separator + 1);
	}
	
	console.log(href);
	
	return href;
};
var linksUrl = 'http://localhost:12345/articles',
	jobUrl = 'http://localhost:12345/job',
	companiesUrl = 'http://localhost:12345/companies',
	parsUrl = 'http://localhost:12345/pars/:id',
	scoreablesUrl = 'http://localhost:12345/job/entities/:jobId',
	scoresUrl = 'http://localhost:12345/entity/scores/:id';
 
 angular.module('tasks', ['ngRoute', 'ngSanitize']).config(function($routeProvider) {
	$routeProvider
		.when('/links', { templateUrl : './partials/links.html', controller : LinksCtrl })
		.when('/items/:id', { templateUrl : './partials/paragraphs.html', controller : ParsCtrl })
		.when('/tasks/:id', { templateUrl : './partials/jobs.html', controller : JobsCtrl })
		.when('/tasks', { templateUrl : './partials/jobs.html', controller : JobsCtrl })
		.when('/scoreables/:jobId', { templateUrl : './partials/scoreables.html', controller : ScoreablesCtrl })
		.when('/companies', { templateUrl : './partials/companies.html', controller : CompanyCtrl })
		.when('/score/:entityId', { templateUrl : './partials/score.html', controller : ScoresCtrl})
		.otherwise({ redirectTo : '/links' });
 });
 
 ScoreablesCtrl.$inject = ['$scope', '$route', '$http', '$location', '$routeParams'];
 function ScoreablesCtrl($scope, $route, $http, $location, $routeParams) {
 	$scope.$route = $route;
 	$scope.scoreables = [];
 	$scope.showScores = function(scoreable) {
 		$location.path('/score/' + scoreable.id);
 	};
 	$scope.init = function() {
 		var jobId = $routeParams.jobId,
 			url = scoreablesUrl.replace(':jobId', jobId);
 		
 		$http.get(url).success(function(result) {
 			console.log('Got entities', result);
 			
 			if(!!result && result.success) {
 				$scope.scoreables = $.map(result.entities, function(entity) {
 					entity.typeName = entity.type == 1 ? 'product' : 'company';
  					return entity;
  				});
 			}
 		});
 		
 	};
 	
 	$scope.init();
 };
 
 LinksCtrl.$inject = ['$scope', '$route', '$http', '$location'];
 
 function LinksCtrl($scope, $route, $http, $location) {
	$scope.$route = $route;
	$scope.links = [];
	
	$scope.gotoTasks = function(link) {
		$location.path('/tasks/' + link.id);
	};
	$scope.gotoArticles = function(link) {
		if(!!link && !!link.id) {
			$location.path('/items/' + link.id);
		}
	};
	
	$http.get(linksUrl).success(function(result) {
		if(result && result.success) {
			console.log('Got : ', result);
		
			$scope.links = result.articles;
		}
	});
 };
 
 ParsCtrl.$inject = ['$scope', '$http', '$route', '$location', '$routeParams'];
 
 function ParsCtrl($scope, $http, $route, $location, $routeParams) {
	$scope.$route = $route;
	$scope.pars = [];
	$scope.article = null;
	
	$scope.showJobs = function() {
		$location.path('/tasks/' + $scope.article.id);
	};
	$scope.startJobs = function() {
		var jobs = [];
		
		for(var i = 0, length = $scope.pars.length; i < length; i++) {
			jobs.push(createJob(i));
		}
	
		$.when.apply($, jobs).done(function() {
			var results = Array.prototype.slice.call(arguments);
			alert('done!');
		});
	};
	
	function createJob(index) {
		var paragraph = $scope.pars[index],
			deferred = $.Deferred();
			
		$http.post(jobUrl, {
			paragraph : paragraph,
			article : $scope.article
		}).success(function(result) {
			deferred.resolve(result);
		});
		
		return deferred.promise();
	};
	
	$scope.init = function() {
		var id = $routeParams.id,
			url = parsUrl.replace(':id', id);
		
		$http.get(url).success(function(result) {
			if(result && result.success) {
				$scope.pars = result.pars;
				$scope.article = result.article;
			}
		});
	};
	
	$scope.init();
 };
 
 JobsCtrl.$inject = ['$scope', '$http', '$route', '$location', '$routeParams'];

 function JobsCtrl($scope, $http, $route, $location, $routeParams) {
	$scope.$route = $route;
	$scope.tasks = [];
	$scope.gotoArticle = function(id) {
		$location.path('/items/' + id);
	};
	$scope.gotoResult = function(task) {
		console.log('Got task: ', task);
		
		$location.path('/scoreables/' + task.id);
	};
	$scope.init = function() {
		var id = $routeParams.id,
			filter = !!id ? ('/' + id) : '';
	
		$http.get(jobUrl + filter).success(function(result) {
			if(result && result.success) {
				$scope.tasks = result.tasks;
			}
		});
	};
	
	$scope.init();
 };
 
 CompanyCtrl.$inject = ['$scope', '$http', '$route', '$location', '$routeParams'];
 
 function CompanyCtrl($scope, $http, $route, $location, $routeParams) {
	$scope.$route = $route;
	$scope.companies = [];
	$scope.showScores = function(company) {
		$location.path('/score/' + company.id);
	};
	$scope.init = function() {
		$http.get(companiesUrl).success(function(resp) {
			if(resp && resp.success) {
				$scope.companies = $.map(resp.companies, function(company) { return (company.name == null) ? undefined : company; });
			}
		});
	};
	
	$scope.init();
 };
 
 ScoresCtrl.$inject = ['$scope', '$http', '$route', '$location', '$routeParams'];
 
 function ScoresCtrl($scope, $http, $route, $location, $routeParams) {
	$scope.$route = $route;
	$scope.scores = [];
	$scope.score = 0;
	$scope.invalidScores = [];
	$scope.init = function() {
		var id = $routeParams.entityId,
			url = scoresUrl.replace(':id', id);
	
		$http.get(url).success(function(resp) {
			if(resp && resp.success) {
				$scope.scores = $.map(resp.scores, function(score) { return (!!score.score) ? score : undefined; });
				$scope.invalidScores = $.map(resp.scores, function(score) { return (!!score.score) ? undefined : score; });
				
				$scope.score = 0;
				
				$.each($scope.scores, function(i, score) {
					$scope.score += isNaN(score.score) ? 0 : score.score;
					
					console.log('added ', score, ' is now', $scope.score);
					
				});
				
				
				$scope.score = $scope.scores.length == 0 ? 0 : $scope.score / $scope.scores.length;
			}
		});
	};
	
	$scope.init();
 };
 
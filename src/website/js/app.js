var linksUrl = 'http://tasks.dev:12345/articles',
	parsUrl = 'http://tasks.dev:12345/pars/:id';
 
 angular.module('tasks', ['ngRoute', 'ngSanitize']).config(function($routeProvider) {
	$routeProvider
		.when('/links', { templateUrl : './partials/links.html', controller : LinksCtrl })
		.when('/items/:id', { templateUrl : './partials/paragraphs.html', controller : ParsCtrl })
		.otherwise({ redirectTo : '/links' });
 });
 
 LinksCtrl.$inject = ['$scope', '$route', '$http', '$location'];
 
 function LinksCtrl($scope, $route, $http, $location) {
	$scope.$route = $route;
	$scope.links = [];
	$scope.gotoArticles = function(link) {
		if(!!link && !!link.id) {
			console.log('switching location!');
			
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
	$scope.init = function() {
		var id = $routeParams.id,
			url = parsUrl.replace(':id', id);
		
		$http.get(url).success(function(result) {
			if(result && result.success) {
				$scope.pars = result.pars;
			}
		});
	};
	
	$scope.init();
	
 };
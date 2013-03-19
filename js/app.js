
var atosApp = angular.module('atosApp', ['atosApp.Services','atosApp.Filters']).config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider.
                when('/', {templateUrl:"#main"}).
                when('/conferences/details/:id', {
                    templateUrl: '#detailsConference',
                    onActivate: 'select(id)',
                    jqmOptions: {transition:'slide'}
                }).
                when('/conferences', {
                    templateUrl: '#list',
                    jqmOptions: {transition:'slide'}
                }).
                otherwise({redirectTo:'/'});
    }]).config(
        function($compileProvider) {
            $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
        }).config(
        function($locationProvider) {
            $locationProvider.html5Mode(false);
        });

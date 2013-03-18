
var atosApp = angular.module('atosApp', ['atosApp.Services']).config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider.
                when('/conferences', {redirectTo:"/conferences/oConference"}).
                when('/conferences/details/:id', {
                    templateUrl: '#detailsConference', 
                    onActivate: 'select(id)',
                    jqmOptions: {transition:'slide'}
                }).
                when('/conferences/oConference', {
                    templateUrl: '#oConference',
                    jqmOptions: {transition:'slide'}
                }).
                when('/conferences/oDemo', {
                    templateUrl: '#oDemo', 
                    jqmOptions: {transition:'slide'}
                }).
                when('/conferences/oPoster', {
                    templateUrl: '#oPoster', 
                    jqmOptions: {transition:'slide'}
                });
    }]).config(
        function($compileProvider) {
            $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
        }
);


var atosApp = angular.module('atosApp', ['ngResource','atosApp.Services', 'atosApp.Filters']).config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider.
                when('/', { templateUrl: "#main"}).
                when('/conferences/details/:id', {
            templateUrl: '#detailsConference',
            onActivate: 'selectConference(id)',
            jqmOptions: {transition: 'slide'}
        }).
                when('/conferences', {
            templateUrl: '#list',
            jqmOptions: {transition: 'slide'}
        }).
                when('/map', {
            templateUrl: '#map',
            jqmOptions: {transition: 'slide'}
        }).
                when('/feelbacks', {
            templateUrl: '#feelbacks',
            jqmOptions: {transition: 'slide'}
        }).
                otherwise({redirectTo: '/'});
    }]).config(
        function($compileProvider) {
            $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
        }).config(
        function($locationProvider) {
            $locationProvider.html5Mode(false);
        });


//for(var x in localStorage)console.log(x+"="+((localStorage[x].length * 2)/1024/1024).toFixed(2)+" MB");
function printLocalStorage(full) {
    var sum = 0;
    for (var x in localStorage) {
        var val = ((localStorage[x].length * 2) / 1024 / 1024).toFixed(6);
        if (full)
            console.log(x + "=" + val + " MB");
        sum += parseFloat(val);
    }
    console.log("TOTAL: " + sum + " MB");
}

printLocalStorage(false);
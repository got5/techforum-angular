angular.module('atosApp.Filters', []).filter('day', function() {
    return function(input) {
        return input ? '\u2713' : '\u2718';
    };
});


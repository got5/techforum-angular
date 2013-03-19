angular.module('atosApp.Filters', [])
        .filter('range', function() {
    return function(input) {
        var lowBound, highBound;
        switch (input.length) {
            case 1:
                lowBound = 0;
                highBound = parseInt(input[0]) - 1;
                break;
            case 2:
                lowBound = parseInt(input[0]);
                highBound = parseInt(input[1]);
                break;
            default:
                return input;
        }
        var result = [];
        for (var i = lowBound; i <= highBound; i++)
            result.push(i);
        return result;
    };
}).filter('Category', function() {
    return function(input, predicate) {
        if(!predicate) return input;
        var result = new Array();
        for (var index in input) {
            var occ = input[index];
            if (occ.category === predicate)
                result.push(occ);
        }
        return result;
    };
}).filter('Day', function() {
    return function(input, predicate) {
        if(!predicate) return input;
        var result = new Array();
        for (var index in input) {
            var occ = input[index];
            if (occ.day === predicate)
                result.push(occ);
        }
        return result;
    };
});






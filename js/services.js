
angular.module('atosApp.Services', ['ngResource']).
        factory('mConferencesStorage', function($resource) {
            return $resource('data/conferences.json', {});
        });



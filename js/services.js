
var PRODUCTION = true;
var WEBSERVICE_HOST = PRODUCTION ? "http://techforum-mvand.rhcloud.com/" : "http://localhost:8080";

var services = angular.module('atosApp.Services', []);

var Error = {
    NO_RESPONSE: "No response",
    NO_INTERNET: "No Internet",
    NO_LOCAL_DATA: "No Local Data"
};

services.factory('offline', function($resource) {
    return {
        populate: function(fn) {
            $resource('data/conferences.json').query(function(data) {
                fn(data);
            });

        }
    };
});


services.factory('routines', function($http, $q) {
    return {
        get: function(config) {
            $.mobile.loading('show');
            var relativeUrl = config.relativeUrl || '/';
            var localKey = config.localKey;
            var online = config.online;

            var deffered = $q.defer();
            if (!online) {
                var localData = window.localStorage.getItem(localKey);
                if (localData) {
                    console.log("- GET (" + localKey + ") success from local");
                    deffered.resolve(angular.fromJson(localData));
                } else {
                    console.log("- GET (" + localKey + ") fail from local");
                    deffered.reject(Error.NO_LOCAL_DATA);

                }
                $.mobile.loading('hide');
                return deffered.promise;
            } else if (Connection.NONE === navigator.connection.type) {
                console.log("- GET (" + localKey + ") fail from connection");
                deffered.reject(Error.NO_INTERNET);
                $.mobile.loading('hide');
                return deffered.promise;
            } else {
                return $http.get(WEBSERVICE_HOST + relativeUrl).then(
                        function(response) {
                            console.log("- GET (" + localKey + ") success from host");
                            window.localStorage.setItem(localKey, angular.toJson(response.data));
                            $.mobile.loading('hide');
                            return response.data;
                        },
                        function(error) {
                            console.log("- GET (" + localKey + ") fail from host")
                            deffered.reject(Error.NO_RESPONSE);
                            $.mobile.loading('hide');
                            return deffered.promise;
                        }
                );
            }
        },
        post: function(config) {
            var relativeUrl = config.relativeUrl || '/';
            var data = config.data;

            if (navigator.network && navigator.network.connection.type === Connection.NONE) {
                var deffered = $q.defer();
                console.log("- POST fail from connection");
                deffered.reject(Error.NO_INTERNET);
                return deffered.promise;
            } else {
                return $http.post(WEBSERVICE_HOST + relativeUrl, data).then(
                        function(response) {
                            console.log("- POST success from host");
                            return response.data;
                        },
                        function(error) {
                            console.log("- POST fail from host", error);
                            deffered.reject(Error.NO_RESPONSE);
                            return deffered.promise;
                        }
                );
            }
        }
    };
});

services.factory('srvConferences', function(routines) {
    return {
        getAll: function(refresh) {
            return routines.get({
                relativeUrl: '/conferences',
                localKey: 'conferences',
                online: refresh
            });
        },
        get: function(c_id) {
            return routines.get({
                relativeUrl: '/conferences/' + c_id,
                localKey: 'conference_' + c_id,
                online: true
            });
        }
    };
});

services.factory('srvMessages', function(routines) {
    return {
        getFeelbacks: function() {
            return routines.get({
                relativeUrl: '/messages/feelbacks',
                localKey: 'feelbacks',
                online: true
            });
        },
        getComments: function(c_id) {
            return routines.get({
                relativeUrl: '/messages/comments/' + c_id,
                localKey: 'comments_' + c_id,
                online: true
            });
        },
        post: function(data, type) {
            if (type === 'comment') {
                return routines.post({
                    relativeUrl: '/messages/comments',
                    data: data
                });
            } else if (type === 'feelback') {
                return routines.post({
                    relativeUrl: '/messages/feelbacks',
                    data: data
                });
            }
        }
    };
});

/**
 * Wrapper who will queue up PhoneGap API calls if called before deviceready
 * and call them after deviceready fires. Occur normally after.
 */
services.factory('cordovaReady', function() {
    return function(fn) {
        var queue = [];
        var impl = function() {
            queue.push(Array.prototype.slice.call(arguments));
        };

        document.addEventListener('deviceready', function() {
            queue.forEach(function(args) {
                fn.apply(this, args);
            });
            impl = fn;
        }, false);

        return function() {
            return impl.apply(this, arguments);
        };
    };
});
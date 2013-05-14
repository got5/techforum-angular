
atosApp.controller('ConferenceList', function ConferenceList($scope, srvConferences, offline) {
    $scope.daySize = 2;
    $scope.roomSize = 4;

    $scope.Room = function(value) {
        $scope.room = value;
    };
    $scope.Day = function(value) {
        $scope.day = value;
    };

    $scope.update = function(online, verbose) {
        var success = function(data) {
            $scope.conferences = data;
            console.log(data);
            if (verbose) {
                $.mobile.loading('show', {textVisible: true, textonly: true, text: "done"});
                setTimeout(function() {
                    $.mobile.loading('hide')
                }, 1200);
            }
        };
        var error = function(error) {
            if (error === Error.NO_INTERNET) {
                navigator.notification.confirm("You are not connected to internet. Load local data?", function(i) {
                    if (i === 1)
                        $scope.update(false, true);
                });
            } else if (error === Error.NO_LOCAL_DATA) {
                offline.populate(function(data) {
                    $scope.conferences = data;
                });
            } else {
                alert(error);
            }
        };
        srvConferences.getAll(online).then(success, error);
    };

    $scope.activate = function() {
        $scope.Room(1);
        $scope.Day(1);
        $scope.update();
    };
});

atosApp.controller('ConferenceDetails', function ConferenceDetails($scope, srvConferences, srvMessages, offline) {
    $scope.messages = [];
    $scope.update = function() {
        $scope.activate($scope.idConference);
    };

    $scope.activate = function(idConference) {
        $scope.idConference = idConference;
        srvConferences.get(idConference).then(
                function(data) {
                    $scope.offline = false;
                    $scope.selection = data;
                    srvMessages.getComments(data._id).then(function(data) {
                        $scope.messages = data;
                    });
                },
                function() {
                    $scope.offline = true;
                    offline.populate(function(data) {
                        $scope.selection = $.grep(data, function(item) {
                            return item._id === idConference;
                        })[0];
                    });
                });
    };
});

atosApp.controller('MessageForm', function MessageForm($scope, srvMessages) {
    $scope.submit = function(type) {
        var data = {
            "name": $scope.name,
            "msg": $scope.msg,
            "type": type,
            "date": new Date()
        };

        if (type === 'comment')
            data["idConference"] = $scope.$parent.selection._id;

        srvMessages.post(data, type).then(function(data) {
            alert("Message sent, thank you.");
            $scope.$parent.messages.push(data);
            $scope.name = "";
            $scope.msg = "";
        });
    };
});

atosApp.controller('Feelbacks', function Feelbacks($scope, srvMessages, cordovaReady) {
    $scope.messages = [];
    $scope.activate = function() {
        $scope.offline = Connection.NONE === navigator.connection.type;
        srvMessages.getFeelbacks().then(function(data) {
            $scope.offline = false;
            $scope.messages = data;
        }, function() {
            $scope.offline = true;
        });
    };
});

atosApp.controller('Map', function Map($scope) {
    // lat and lng from lille and atos worldline
    var ll = new google.maps.LatLng(50.6333, 3.0667);
    var aw = new google.maps.LatLng(50.566261, 3.035904);

    $scope.from = aw.toString();
    $scope.to = "Atos Worldline, rue de la pointe, Seclin France";

    $scope.mapOptions = {
        center: aw,
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.canvas = document.getElementById("map-canvas");
    $scope.panel = document.getElementById("map-panel");

    $scope.locate = function() {
        $.mobile.loading('show', {text: "Getting your position...", textVisible: true, textonly: true});
        navigator.geolocation.getCurrentPosition(
                function(position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    var pos = new google.maps.LatLng(lat, lng);
                    $scope.markerPos.setPosition(pos);
                    $scope.map.setCenter(pos);
                    $scope.from = pos.toString();
                    //$.mobile.loading('hide');
                    setTimeout(function() {
                        $.mobile.loading('hide');
                    }, 1200);
                },
                function(error) {
                    $.mobile.loading('show', {text: error.message, textVisible: true, textonly: true});
                    setTimeout(function() {
                        $.mobile.loading('hide');
                    }, 1200);
                    var pos = ll;
                    $scope.markerPos.setPosition(pos);
                    $scope.map.setCenter(pos);
                    $scope.from = pos.toString();
                }
        );
    };

    $scope.initialize = function() {
        $scope.map = new google.maps.Map($scope.canvas, $scope.mapOptions);

        $scope.markerPos = new google.maps.Marker({
            map: $scope.map,
            position: aw,
            title: "Atos Worldline"
        });

        $scope.directionsDisplay = new google.maps.DirectionsRenderer({
            map: $scope.map,
            panel: $scope.panel
        });
        $scope.directionsService = new google.maps.DirectionsService();

    };

    $scope.calculate = function() {
        var request = {
            origin: $scope.from,
            destination: $scope.to,
            travelMode: google.maps.TravelMode.DRIVING
        };
        $.mobile.loading('show', {text: "Getting directions...", textVisible: true, textonly: true});
        $scope.directionsService.route(request, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                $scope.directionsDisplay.setDirections(result);
            }
            setTimeout(function() {
                $.mobile.loading('hide');
            }, 1200);
        });
    };

    $scope.initialize();
    $(document).bind('pageshow', function(event) {
        if (event.target.id === "map") {
            google.maps.event.trigger($scope.map, "resize");
            $scope.map.setCenter($scope.markerPos.getPosition());
        }
    });
});
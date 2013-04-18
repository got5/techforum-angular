
atosApp.controller('ConferenceList', function ConferenceList($scope, srvConferences, offline, cordovaReady) {
    $scope.categories = ['conference', 'demo', 'poster'];
    $scope.daySize = 2;
    
    $scope.swipeList = ['conference','demo','poster'];
    $scope.swipeIndex = 0;
    $scope.swipe = function(direction) { 
        if(direction === "right") {
            $scope.Category($scope.swipeList[(++$scope.swipeIndex)%3]);
        } else if(direction === "left") {
            $scope.Category($scope.swipeList[(--$scope.swipeIndex)%3]);
        }
    };

    $scope.Category = function(value) {
        $scope.category = value;
        if ($scope.day)
            $scope.prevDay = $scope.day;
        $scope.Day((value === "conference") ? $scope.prevDay : 0);
    };
    $scope.Day = function(value) {
        $scope.day = value;
    };

    $("#conferenceListPopup").popup();
    $scope.update = function(online) {
        $("#conferenceListPopup").popup("open", {
            transition: "slidedown",
            y: 0
        });

        srvConferences.getAll(online).then(
                function(data) {
                    $scope.conferences = data;
                },
                function(error) {
                    console.log("error: " + error);
                    if (error === Error.NO_LOCAL_DATA) {
                        offline.populate(function(data) {
                            $scope.conferences = data;
                        });
                    }
                }
        );
    };

    $scope.Category("conference");
    $scope.Day(1);
    //$scope.update();
    cordovaReady($scope.update());
});

atosApp.controller('ConferenceDetails', function ConferenceDetails($scope, srvConferences, srvMessages, offline) {
    $scope.messages = [];
    $scope.offline = true;

    $scope.update = function() {
        $scope.selectConference($scope.idConference);
    };

    $scope.selectConference = function(idConference) {
        $scope.idConference = idConference;
        srvConferences.get(idConference).then(
                function(data) {
                    $scope.offline = false;
                    $scope.selection = data;
                    srvMessages.getComments(data._id).then(function(data) {
                        $scope.messages = data;
                    });
                },
                function(error) {
                    offline.populate(function(data) {
                        $scope.offline = true;
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
            //$("#globalPopup").html("<p>Comment saved</p>").popup("open");
            alert("Comment saved");
            $scope.$parent.messages.push(data);
            $scope.name = "";
            $scope.msg = "";
        });
    };
});

atosApp.controller('Feelbacks', function Feelbacks($scope, srvMessages, cordovaReady) {
    $scope.messages = [];
    $scope.offline = true;
    cordovaReady(srvMessages.getFeelbacks().then(function(data) {
        $scope.offline = false;
        $scope.messages = data;
    }, function(error) {
        $scope.offline = true;
    }));
});

atosApp.controller('Map', function Map($scope, cordovaReady) {
    // lat and lng from lille and atos worldline
    var ll = new google.maps.LatLng(50.6333, 3.0667);
    var aw = new google.maps.LatLng(50.566261, 3.035904);

    $scope.from = ll.toString();
    $scope.to = aw.toString();

    $scope.mapOptions = {
        center: aw,
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.canvas = document.getElementById("map-canvas");
    $scope.panel = document.getElementById("map-panel");

    $scope.locate = cordovaReady(function() {
        console.log("Retrieve location data");
        navigator.geolocation.getCurrentPosition(
                function(position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    var pos = new google.maps.LatLng(lat, lng);
                    $scope.markerPos.setPosition(pos);
                    $scope.map.setCenter(pos);
                    $scope.from = pos.toString();
                    console.log($scope.from);
                },
                function(error) {
                    console.log(error.message);
                    var pos = ll;
                    $scope.markerPos.setPosition(pos);
                    $scope.map.setCenter(pos);
                    $scope.from = pos.toString();
                }
        );
    });

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
        $scope.directionsService.route(request, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK)
                $scope.directionsDisplay.setDirections(result);
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
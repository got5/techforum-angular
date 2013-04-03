
atosApp.controller('ConferenceList', function ConferenceList($scope, srvConferences, cordovaReady) {
    $scope.categories = ['conference', 'demo', 'poster'];
    $scope.daySize = 2;

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
                }
        );
    };

    $scope.Category("conference");
    $scope.Day(1);
    $scope.update();
    //cordovaReady($scope.update(false));
});

atosApp.controller('ConferenceDetails', function ConferenceDetails($scope, srvConferences, srvMessages) {
    $scope.messages = [];
    $scope.selectConference = function(idConference) {
        srvConferences.get(idConference).then(function(data) {
            $scope.selection = data;
            srvMessages.getComments(data._id).then(function(data) {
                $scope.messages = data;
            });
        });
    };
});

atosApp.controller('MessageForm', function MessageForm($scope, srvMessages) {
    $scope.submit = function(type) {
        var data = {
            "name": $scope.name,
            "msg": $scope.msg,
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

atosApp.controller('Feelbacks', function Feelbacks($scope, srvMessages) {
    $scope.messages = [];
    srvMessages.getFeelbacks().then(function(data) {
        $scope.messages = data;
    });
});
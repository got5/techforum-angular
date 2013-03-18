
atosApp.controller('ConferencesCTRL',
        function ConferencesCTRL($scope, $location, $compile, mConferencesStorage) {
            // get the day parameter to filter the conference list, day 1 by default
            var parameters = $location.search();
            $scope.dayValue = parameters.day || 1;
            $scope.day = function(value) {
                $scope.dayValue = value;
                $scope.$digest();
            }
            // get the conference list from dedicated service
            $scope.conferences = mConferencesStorage.query();

            // get a specified conference object by id, selected by user
            $scope.select = function(id) {
                console.log("SELECT CALLED");
                $scope.selection = $.grep($scope.conferences, function(item) {
                    return item.id === id;
                })[0];
            };
        });

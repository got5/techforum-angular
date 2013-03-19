
atosApp.controller('ConferencesCTRL',
        function ConferencesCTRL($scope, mConferencesStorage) {
            $scope.categories = ['conference','demo','poster'];
            $scope.daySize = 2;
            $scope.day = 1;
            $scope.Category = function(value) {
                $scope.category = value;
                $scope.displayWhenStart = (value==="conference");
                if($scope.day) $scope.prevDay = $scope.day;
                $scope.day = (value==="conference")?$scope.prevDay:0;
            };
            $scope.Category("conference");
            
            // get the conference list from dedicated service
            $scope.conferences = mConferencesStorage.query();
            // get a specified conference object by id, selected by user
            $scope.select = function(id) {
                $scope.selection = $.grep($scope.conferences, function(item) {
                    return item.id === id;
                })[0];
            };
        });
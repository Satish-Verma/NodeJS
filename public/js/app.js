var app = angular.module('app', []);

app.directive('resize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return { 'h': w[0].screen.height, 'w': w[0].screen.width };
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            scope.style = function () {
                return { 
                    'height': (newValue.h - 100) + 'px',
                    'width': (newValue.w - 100) + 'px' 
                };
            };

        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
});
//Define the `PhoneListController` controller on the `phonecatApp` module
app.controller('HomeController', ['$scope', '$http', '$interval', '$filter', function HomeController($scope, $http, $interval, $filter) {
    var pageSize = 5;
    var currentPage = 0;
    var pageCount;
    var self = this;
    $scope.items = [];
    $scope.selectedRoom = {};
    $scope.selectedRoomStatus = "AVAILABLE";
    $scope.selectedMeeting = {};
    $scope.modals = { availableRooms: false, meetingDetails: false, settingsDetails: false }
    var HOUR_HEIGHT = 80.0;
    $scope.availableItems = [];
    $scope.selectedBookings = {};
    $scope.settings = { serverIp: '', selectedRoomName: '', roomNameList: [] };

    $scope.settings.serverIp = localStorage.getItem('serverIp');

    $scope.setRoomName = function () {
        localStorage.setItem('selectedRoomName', $scope.settings.selectedRoomName);
        for (var i = 0; i < $scope.items.length; ++i) {
            if ($scope.items[i].roomName === $scope.settings.selectedRoomName) {
                $scope.selectedRoom = $scope.items[i];
                break;
            }
        }

    }
    var getRoomStatusCheck = function (room) {
        //var room = $scope.selectedRoom;
        var currTime = Date.now();
        var status = "AVAILABLE"
        if (room.bookings !== undefined) {
            for (var i = 0; i < room.bookings.length; ++i) {
                var b = room.bookings[i];
                if (currTime >= b.startTime && currTime <= b.endTime) {
                    status = "OCCUPIED";
                    break;
                }
                if (currTime < b.startTime) {
                    status = "AVAILABLE";
                    break;
                }
            }
        }
        return status;
    };

    var getAvailableRooms = function () {
        $scope.avaiableItems = [];
        for (var i = 0; i < $scope.items.length; ++i) {
            if (getRoomStatusCheck($scope.items[i]) === "AVAILABLE") {
                $scope.availableItems.push({ "floor": $scope.items[i].floor, "roomName": $scope.items[i].roomName, "personnel": $scope.items[i].personnel })
            }
        }
    }


    $scope.closeModal = function () {
        $scope.modals.availableRooms = false;
        $scope.modals.meetingDetails = false;
        $scope.modals.settingsDetails = false;
        $scope.availableItems = [];
        $scope.meetingDescription = {};
    }
    $scope.showAvailableRooms = function () {
        $scope.closeModal();
        getAvailableRooms();
        $scope.modals.availableRooms = true;
    }
    $scope.showMeetingDetails = function (meeting) {
        $scope.selectedBookings = meeting;
        $scope.closeModal();
        getAvailableRooms();
        $scope.modals.meetingDetails = true;
    }
    $scope.showSettingsDetails = function () {
        $scope.closeModal();

        $scope.modals.settingsDetails = true;
    }

    $scope.getHeight = function (tt) {
        return { "height": (((tt.endTime - tt.startTime) / 3600000.0 * HOUR_HEIGHT) - 2) + "px" };
    }
    $scope.isCurrent = function (tt) {
        var curr = Date.now();
        if (curr >= tt.startTime && curr <= tt.endTime) {
            return 'schedule-meeting-current';
        } else {
            return '';
        }
    }
    var d = new Date();
    //$scope.timeDiff = (570+d.getTimezoneOffset())*360000;
    $scope.getNow = function () {

        return new Date(Date.now());
    }

    var calcTime = function (time, offset) {

        // create Date object for current location
        var date = new Date();

        // convert to msec
        // add local time zone offset 
        // get UTC time in msec
        var utc = time - (offset * 60000);

        // create new Date object for different city
        // using supplied offset
        var newDate = new Date(utc + (60000 * date.getTimezoneOffset()));

        // return time as a string
        return newDate.getTime();
    }

    $scope.selectedDate = $scope.getNow();

    var now = new Date(Date.now()).toLocaleString().split(',')[0] + " 07:00:00"
    var MIN_HOUR = Date.parse(now);
    var MAX_HOUR = Date.parse(new Date(Date.now()).toLocaleString().split(',')[0] + " 22:00:00");
    var TIME_LINE = MAX_HOUR - MIN_HOUR;
    var tempTime = Date.parse(new Date(Date.now()).toLocaleString().split(',')[0] + " 00:30:00");


    var processData = function (data) {
        $scope.settings.selectedRoomName = localStorage.getItem('selectedRoomName');
        $scope.items = [];
        $scope.settings.roomNameList = [];
        for (var k = 0; k < data.staff.length; ++k) {
            var r = { "floor": data.staff[k].floor, "roomName": data.staff[k].roomName, "personnel": data.staff[k].personnel, "roomNamePerson": data.staff[k].roomNamePerson, "bookings": [] };
            var lstStart = tempTime;
            $scope.settings.roomNameList.push(data.staff[k].roomName);
            for (var i = 0; i < data.tasks.length; ++i) {

                var ob = data.tasks[i];
                if (r.roomName === ob.roomName) {
                    var pc1 = ((ob.resvFromDateTime.time - lstStart) / TIME_LINE) * 100;

                    var pc2 = ((ob.resvThruDateTime.time - ob.resvFromDateTime.time) / TIME_LINE) * 100;
                    lstStart = ob.resvThruDateTime.time;

                    var t = {
                        "userName": ob.resvUserName, "floor": ob.floor, "roomName": ob.roomName, "startTime": calcTime(ob.resvFromDateTime.time, ob.resvFromDateTime.timezoneOffset)
                        , "endTime": calcTime(ob.resvThruDateTime.time, ob.resvThruDateTime.timezoneOffset), "personnel": ob.personnel, "paticipantNum": ob.paticipantNum, "place": ob.place,
                        "meetingName": ob.meetingName, "meetingType": ob.meetingType, "meetingDescription": ob.meetingDescription, "openYN": ob.openYN,
                        "resvUserName": ob.resvUserName, "managerInfo": ob.managerInfo, "attendance": ob.attendance
                    };
                    r.bookings.push(t);
                }

            }
            $scope.items.push(r);
            if (r.roomName === $scope.settings.selectedRoomName) {
                $scope.selectedRoom = r;
            }
        }
        if ($scope.settings.selectedRoomName == undefined || $scope.settings.selectedRoomName == null || $scope.settings.selectedRoomName === '') {
            $scope.showSettingsDetails();
        }
    }

    $scope.msToTime = function (duration) {
        var milliseconds = parseInt((duration % 1000) / 100)
            , seconds = parseInt((duration / 1000) % 60)
            , minutes = parseInt((duration / (1000 * 60)) % 60)
            , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + " hour " + minutes + " minutes";
    }
    var getRoomStatus = function (room) {
        //var room = $scope.selectedRoom;
        var currTime = Date.now();
        var status = "AVAILABLE"
        if (room.bookings !== undefined && room.bookings.length > 0) {
            for (var i = 0; i < room.bookings.length; ++i) {
                var b = room.bookings[i];
                if (currTime >= b.startTime && currTime <= b.endTime) {
                    status = "OCCUPIED";
                    $scope.selectedMeeting = b;
                    break;
                }
                if (currTime < b.startTime) {
                    status = "AVAILABLE";
                    $scope.selectedMeeting = b;
                    break;
                }
            }
        }else{
            status = "AVAILABLE";
            $scope.selectedMeeting = {meetingName:"No Meeting", isNoMeeting: true};
        }

        $scope.selectedRoomStatus = status;

    };

    $scope.isTimeInRange = function (t1, t2) {

        var room = $scope.selectedRoom;

        if (room.bookings !== undefined) {
            for (var i = 0; i < room.bookings.length; ++i) {
                var b = room.bookings[i];
                var dStart = new Date(b.startTime);
                if (dStart.getHours() >= t1 && dStart.getHours() < t2) {
                    return b;
                }
            }
        } else {
            return null;
        }
    };

    var getRoomStatusCurrent = function () {
        getRoomStatus($scope.selectedRoom);
    }
    var getData = function () {
        $http.get('http://' + $scope.settings.serverIp + '/api/grnd/' + $filter('date')($scope.selectedDate, "yyyy-MM-dd") + '.json').then(function (response) {
            self.data = response.data;
            processData(response.data);
            getRoomStatus($scope.selectedRoom);
            $interval(getRoomStatusCurrent, 5000);
        });
    }

    $scope.range = function (min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };

    var validateIPaddress = function (ipaddress) {
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
            return (true);
        }

        return (false)
    }
    var init = function () {
        if ($scope.settings.serverIp == undefined || $scope.settings.serverIp == null || $scope.settings.serverIp == "null" || $scope.settings.serverIp === ''
        || !validateIPaddress($scope.settings.serverIp)) {
            $scope.showSettingsDetails();
        } else {
            getData();
        }
    }

    
    $scope.connectServer = function () {
        if(validateIPaddress($scope.settings.serverIp)){
            localStorage.setItem('serverIp', $scope.settings.serverIp);
            getData();
        }else{
            alert('Please enter valid IP address');
        }
        
    }

    //Initialise app
    init();
}]);

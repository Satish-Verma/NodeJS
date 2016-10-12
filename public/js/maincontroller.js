
app.controller("MainController", function MainController($scope, $http){
	var self = this;
	self.imageHandler= "/api/images";
	self.videoHandler= "/api/videos";
	self.docHandler= "/api/docs";
	$scope.testData = [];
	$scope.postIt = function() {
		//alert("posting...");
		// XMLHttpRequest cannot load http://127.0.0.1:1337/. No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'null' is therefore not allowed access. 
		$http.get('http://127.0.0.1:1337/json.json', {msg:'hello from Angular.js!'})
		.success(function onSuccess(response){
	        console.log(response);
//	        $scope.$apply(function(){
//	            $scope.testData = JSON.parse(response);
//	            console.log($scope.testData);
//	        });
	        $scope.testData = response;
	        //$scope.testData = JSON.parse(response);
	    }).error(function onError(){
	        console.log("AJAX failed!");
	    });
    };
    
    
    
    $scope.uploadVideo = function() {
    	var input = document.getElementById('inputVideo');
    	 var formData = new FormData();
         formData.append('file', input.files[0]);
    	$http({
            url: self.videoHandler,
            method: "POST",
            data: formData,
            headers: {'Content-Type': undefined}
        }).success(function (response) {
        	console.log("AJAX failed!"+response);
        });
    };
    
    $scope.uploadDoc = function() {
    	var input = document.getElementById('inputDoc');
    	 var formData = new FormData();
         formData.append('file', input.files[0]);
    	$http({
            url: self.docHandler,
            method: "POST",
            data: formData,
            headers: {'Content-Type': undefined}
        }).success(function (response) {
        	console.log("AJAX failed!"+response);
        });
    };
});	

app.controller('MediaController', function ($uibModal, $scope, $log) {
 
  var $ctrl = this;
  $ctrl.items = ['item1', 'item2', 'item3'];

  $ctrl.animationsEnabled = true;
  $ctrl.mediaType = "";

	
  $ctrl.open = function (size, type) {
	  $ctrl.mediaType = type;
    var modalInstance = $uibModal.open({
      animation: $ctrl.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'media.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: '$ctrl',
      size: size,
      resolve: {
        type: function () {
          return $ctrl.mediaType;
        },
        items: function(){
        	return $ctrl.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $ctrl.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  

  $ctrl.toggleAnimation = function () {
    $ctrl.animationsEnabled = !$ctrl.animationsEnabled;
  };
});

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

app.controller('ModalInstanceCtrl', ["$uibModalInstance", "$http", "type", "items",function ($uibModalInstance, $http, type, items) {
  var $ctrl = this;
  $ctrl.type = type;
  $ctrl.items = items;
  $ctrl.uploadHandler= "/api/";
  $ctrl.selected = {
    item: null
  };

  $ctrl.ok = function () {
    $uibModalInstance.close($ctrl.selected.item);
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
  
  var getList = function(type) {
  	var url = "/uploads/"+type;
  	$http({
          url: url,
          method: "GET",
          headers: {'Content-Type': undefined}
      }).success(function (response) {
      	$ctrl.items = response;
      });
  };
  
  $ctrl.upload = function() {
  	var input = document.getElementById('inputData');
  	 var formData = new FormData();
       formData.append('file', input.files[0]);
  	$http({
          url: $ctrl.uploadHandler+$ctrl.type,
          method: "POST",
          data: formData,
          headers: {'Content-Type': undefined}
      }).success(function (response) {
      	console.log("AJAX failed!"+response);
      	getList($ctrl.type);
      });
  };
  getList($ctrl.type);
}]);


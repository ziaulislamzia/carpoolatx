angular.module('app.controllers', ['ngCordova'])
  
.controller('carpoolCtrl', function($scope, $cordovaGeolocation, $ionicPlatform) {
	var posOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
    };

    $scope.model = {};

	$ionicPlatform.ready(function() {
		
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            var lat  = position.coords.latitude;
            var long = position.coords.longitude;
             
            var myLatlng = new google.maps.LatLng(lat, long);

             
            var mapOptions = {
                center: myLatlng,
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                scrollwheel: false,
                disableDefaultUI: true
            };          
             
            var map = new google.maps.Map(document.getElementById("map"), mapOptions);   
            // Create a marker and set its position.
			var marker = new google.maps.Marker({
			    map: map,
			    position: myLatlng,
			    title: 'Set pickup location'
			});     

            var geocoder = new google.maps.Geocoder;
             
            $scope.map = map;
            $scope.marker = marker;  
            $scope.geocoder = geocoder; 

		  	var destinationAddressInput = /** @type {!HTMLInputElement} */(document.getElementById('destination-address'));
	  	  	var autocompleteDestination = new google.maps.places.Autocomplete(destinationAddressInput);
  			autocompleteDestination.bindTo('bounds', map);

  			autocompleteDestination.addListener('place_changed', function() {
  				var place = autocompleteDestination.getPlace();
  				$scope.model.destinationAddress = place.formatted_address;
  				$scope.changeRoute();
  			});

  			var pickupAddressInput = /** @type {!HTMLInputElement} */(document.getElementById('pickup-address'));
	  	  	var autocompletePickup = new google.maps.places.Autocomplete(pickupAddressInput);
  			autocompletePickup.bindTo('bounds', map);

  			autocompletePickup.addListener('place_changed', function() {
		    	marker.setVisible(false);
			    var place = autocompletePickup.getPlace();
			    if (!place.geometry) {
			      alert("Autocomplete's returned place contains no geometry");
			      return;
			    }
			    map.setCenter(place.geometry.location);
			    marker.setPosition(place.geometry.location);
				marker.setVisible(true);
				$scope.model.pickupAddress = place.formatted_address;
				$scope.changeRoute();
  			});

			var myLocationButton = document.getElementById('myLocation');
			map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(myLocationButton);

			var pickmeButton = document.getElementById('carpool-pickme');
			map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(pickmeButton);

			$scope.directionsService = new google.maps.DirectionsService;
  			$scope.directionsDisplay = new google.maps.DirectionsRenderer;
  			$scope.directionsDisplay.setMap(map);

  			geocoder.geocode({'location': myLatlng}, function(results, status) {
		    	if (status === google.maps.GeocoderStatus.OK) {
			    	if (results[0]) {
			        	$scope.model.pickupAddress = results[0].formatted_address;
			        	pickupAddressInput.value = results[0].formatted_address;
			      	} else {
			        	alert('No results found');
			      	}
			    } else {
			      	alert('Geocoder failed due to: ' + status);
			    }
		  	});

        }, function(err) {
            console.log(err);
        });
	});

	$scope.moveToMyLocation = function() {
		$ionicPlatform.ready(function() {
			var marker = $scope.marker;
			var map = $scope.map;
			var geocoder = $scope.geocoder;

			$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
	            var lat  = position.coords.latitude;
	            var long = position.coords.longitude;
	            var myLatlng = new google.maps.LatLng(lat, long);
			    marker.setVisible(false);
			    map.setCenter(myLatlng);
			    marker.setPosition(myLatlng);
			    marker.setVisible(true);

			    geocoder.geocode({'location': myLatlng}, function(results, status) {
			    	if (status === google.maps.GeocoderStatus.OK) {
				    	if (results[0]) {
				        	$scope.model.pickupAddress = results[0].formatted_address;
				        	var pickupAddressInput = document.getElementById('pickup-address');
				        	pickupAddressInput.value = $scope.model.pickupAddress;
				      	} else {
				        	alert('No results found');
				      	}
				    } else {
				      	alert('Geocoder failed due to: ' + status);
				    }
			  	});

			  	$scope.changeRoute();
	        }, function(err) {
            	console.log(err);
        	});
		});
	};

	$scope.changeRoute = function() {
		if ($scope.model.pickupAddress && $scope.model.destinationAddress) {
			var directionsService = $scope.directionsService;
			var directionsDisplay = $scope.directionsDisplay;
			var map = $scope.map;

			directionsService.route({ 
				origin: $scope.model.pickupAddress,
				destination: $scope.model.destinationAddress,
				travelMode: google.maps.TravelMode.DRIVING
			}, function(response, status) {
		    	if (status === google.maps.DirectionsStatus.OK) {
		      		directionsDisplay.setDirections(response);
		    	} else {
		      		alert('Directions request failed due to ' + status);
		    	}
		  	});
		}
	};

	$scope.disableTap = function(elementId) {
        var container = document.getElementsByClassName('pac-container');
        angular.element(container).attr('data-tap-disabled', 'true');
        var backdrop = document.getElementsByClassName('backdrop');
        angular.element(backdrop).attr('data-tap-disabled', 'true');
        angular.element(container).on("click", function() {
            document.getElementById(elementId).blur();
        });
    };

})
   
.controller('driveCtrl', function($scope, $ionicPlatform, $cordovaGeolocation) {
	$scope.isDriving = false;

	var posOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
    };
    var watchOptions = {
    	timeout : 3000,
    	enableHighAccuracy: false // may cause errors if true
  	};

	$ionicPlatform.ready(function() {
		$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            var lat  = position.coords.latitude;
            var long = position.coords.longitude;
             
            var myLatlng = new google.maps.LatLng(lat, long);

             
            var mapOptions = {
                center: myLatlng,
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                scrollwheel: false,
                disableDefaultUI: true
            };          
             
            var map = new google.maps.Map(document.getElementById("map"), mapOptions);   
            // Create a marker and set its position.
			var marker = new google.maps.Marker({
			    map: map,
			    position: myLatlng,
			    title: 'My location'
			});

			$scope.map = map;
			$scope.marker = marker;

			var startButton = document.getElementById('drive-start');
			var endButton = document.getElementById('drive-end');
			map.controls[google.maps.ControlPosition.LEFT_TOP].push(startButton);
			map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(endButton);

		},function(err) {
        	console.log(err);
    	});

		$scope.startDrive = function() {
			$scope.watch = $cordovaGeolocation.watchPosition(watchOptions);
			$scope.watch.then(
			    null,
			    function(err) {
			     	alert(err);
			    },
			    function(position) {
			     	var lat  = position.coords.latitude;
			     	var long = position.coords.longitude;
			     	var myLatlng = new google.maps.LatLng(lat, long);
			     	$scope.marker.setVisible(false);
			     	$scope.map.setCenter(myLatlng);
			     	$scope.marker.setPosition(myLatlng);
			     	$scope.marker.setVisible(true);
		  	});
		  	$scope.isDriving = true;
		};

		$scope.endDrive = function() {
			$scope.watch.clearWatch();
			$scope.isDriving = false;
		}
		
	});

})
   
.controller('profileCtrl', function($scope) {

})
      
.controller('pickupRequestedCtrl', function($scope) {

})
   
.controller('onMyWayCtrl', function($scope) {

})
   
.controller('onTheWayCtrl', function($scope) {

})
   
.controller('tripCtrl', function($scope) {

})
   
.controller('trip2Ctrl', function($scope) {

})
   
.controller('rateYourTripCtrl', function($scope) {

})
   
.controller('requestingPickupCtrl', function($scope) {

})
   
.controller('welcomeCtrl', function($scope) {

})
   
.controller('signupCtrl', function($scope) {

})
 
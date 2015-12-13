(function () {
      function initialize() {
          var mapOptions = {
              center: { lat: -34.397, lng: 150.644 },
              zoom: 8
          };
          var mapElement = document.getElementById('googleMapFlyer1');
          var map = new google.maps.Map(mapElement,
              mapOptions);
      }
    google.maps.event.addDomListener(window, 'load', initialize);

})

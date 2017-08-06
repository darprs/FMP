
function initAutocomplete() {
    // Link UI to JS objects
    var inputSource = document.getElementById('autoDriveSource');
    var searchBoxSource = new google.maps.places.SearchBox(inputSource);
    var inputDestination = document.getElementById('autoDriveDestination');
    var searchBoxDestination = new google.maps.places.SearchBox(inputDestination);
    //pins
    //var markers = [];

    // map.addListener('bounds_changed', function() {
    //     inputSource.setBounds(map.getBounds());
    // });
    //
    // map.addListener('bounds_changed', function() {
    //     inputDestination.setBounds(map.getBounds());
    // });




    //searchBoxSource.addListener('places_changed', function() {change_place(searchBoxSource)});
    searchBoxSource.addListener('places_changed', function() {
        var places = searchBoxSource.getPlaces();
        //console.log(places);
        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        // markers.forEach(function(marker) {
        //     marker.setMap(null);
        // });
        // markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            // if (!place.geometry) {
            //     console.log("Returned place contains no geometry");
            //     return;
            // }
            // var icon = {
            //     url: place.icon,
            //     size: new google.maps.Size(71, 71),
            //     origin: new google.maps.Point(0, 0),
            //     anchor: new google.maps.Point(17, 34),
            //     scaledSize: new google.maps.Size(25, 25)
            // };
            //
            // // Create a marker for each place.
            // markers.push(new google.maps.Marker({
            //     map: map,
            //     icon: icon,
            //     title: place.name,
            //     position: place.geometry.location
            // }));

            currentSource = place.name;
            console.log("Start: " + place.name);

            // if (place.geometry.viewport) {
            //     // Only geocodes have viewport.
            //     bounds.union(place.geometry.viewport);
            // } else {
            //     bounds.extend(place.geometry.location);
            // }
        });
        //map.fitBounds(bounds);
    });


    searchBoxDestination.addListener('places_changed', function() {
        var places = searchBoxDestination.getPlaces();
        //console.log(places);
        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        // markers.forEach(function(marker) {
        //     marker.setMap(null);
        // });
        // markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            // if (!place.geometry) {
            //     console.log("Returned place contains no geometry");
            //     return;
            // }
            // var icon = {
            //     url: place.icon,
            //     size: new google.maps.Size(71, 71),
            //     origin: new google.maps.Point(0, 0),
            //     anchor: new google.maps.Point(17, 34),
            //     scaledSize: new google.maps.Size(25, 25)
            // };
            //
            // // Create a marker for each place.
            // markers.push(new google.maps.Marker({
            //     map: map,
            //     icon: icon,
            //     title: place.name,
            //     position: place.geometry.location
            // }));

            currentDestination = place.name;
            console.log("Finish: " + place.name);

            // if (place.geometry.viewport) {
            //     // Only geocodes have viewport.
            //     bounds.union(place.geometry.viewport);
            // } else {
            //     bounds.extend(place.geometry.location);
            // }
        });
        // map.fitBounds(bounds);
    });

}





//simulation globals
var global_service = "http://localhost:3000/fms/"
var simRoutes = new Array();
var simLocations =["Tel Aviv-Yafo, Israel","Jerusalem, Israel","Haifa, Israel","Be'er Sheva, Israel","Ashdod, Israel","Tiberias, Israel","Sderot, Israel","Afula, Israel","Shlomi, Israel"];
var simBaseID = "10000000";
var queryFrequency = 10;
var simulationRunning = false;
var timer = 0;

// function test() {
//     var route = new simRoute("Sapirim Industrial Park, Israel","Tel Aviv-Yafo, Israel");
//     route.drawRoute(route);
//     var route = new simRoute("Sapir Parking Square/Brussels, Israel","Ashdod, Israel");
//     route.drawRoute(route);
// }


function getID() {
    return simBaseID++;
}
function getColor(id){
    return '#FFFF' + (id%100 + 10);
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function simRoute(start,end,map) {
    this.log = function (message) {
        console.log("ID:" + this.ID + ": " + message);
    }
    this.start = start;
    this.end = end;
    this.ID = getID();
    this.travelMode = google.maps.DirectionsTravelMode.DRIVING;
    this.directionsResponce = null;
    this.distancePassed = 0;
    this.travelDistance = 0;
    this.speed = 100; // metres per tick
    this.fuelConsamptionPerKM = 11;
    this.rendererOptions = {
        map: map,
        suppressMarkers : true,
        preserveViewport: true
    }
    this.marker;
    this.following = false;
    this.visible = false;
    this.ready = false
    //this.queryRunner = 0;


    this.log("Adding simulation: from " + start + " to " + end);
    this.log("Sim ID: " + this.ID);
    simRoutes.push(this);
    this.log("Simulation route " + this.ID  + " added");
}



simRoute.prototype.getDirections = function (callback) {
    if (this.directionsResponce != null) {
        return this.directionsResponce;
    }
    else {
        directionsService = new google.maps.DirectionsService();
        var r = this;
        var request = {
            origin: this.start,
            destination:this.end,
            travelMode: this.travelMode
        };
        directionsService.route(request,setDirectionsCallback(this,callback));
    }
}

function setDirectionsCallback (sim_route,callback){
    return function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            sim_route.log("Directions received , saving...");
            sim_route.directionsResponce = response;
            callback(sim_route);
        }
    }
}

// simRoute.prototype.initObjects = function (sim_route, next) {
//     sim_route.log("Have directions, putting icons to map");
//     sim_route.route = sim_route.directionsResponce.routes[0];
//     sim_route.startLocation = new Object();
//     sim_route.endLocation = new Object();
//     sim_route.polyline = new google.maps.Polyline({
//         path: [],
//         strokeColor: getColor(sim_route.ID),
//         strokeWeight: 3
//     });
//     sim_route.path = sim_route.directionsResponce.routes[0].overview_path;
//     sim_route.legs = sim_route.directionsResponce.routes[0].legs;
//
//     sim_route.directionsRenderer = new google.maps.DirectionsRenderer(sim_route.rendererOptions);
//     sim_route.directionsRenderer.setMap(map);
//     sim_route.directionsRenderer.setDirections(sim_route.directionsResponce);
//
//     next;
// };

simRoute.prototype.initObjects = function (sim_route,next) {
    //var sim_route = this;
    this.log("init objects");
    sim_route.getDirections(function (sim_route) {
        sim_route.log("got direction initiating");
        sim_route.route = sim_route.directionsResponce.routes[0];
        sim_route.startLocation = new Object();
        sim_route.endLocation = new Object();
        sim_route.polyline = new google.maps.Polyline({
            path: [],
            strokeColor: getColor(sim_route.ID),
            strokeWeight: 3
        });
        //sim_route.travelDistance = this.polyline.Distance()
        sim_route.path = sim_route.directionsResponce.routes[0].overview_path;
        sim_route.legs = sim_route.directionsResponce.routes[0].legs;

        sim_route.directionsRenderer = new google.maps.DirectionsRenderer(sim_route.rendererOptions);
        sim_route.directionsRenderer.setMap(map);
        sim_route.directionsRenderer.setDirections(sim_route.directionsResponce);
        sim_route.ready = true;
        next(sim_route);
    });
};

simRoute.prototype.drawRoute = function (sim_route){

    // function initObjects(sim_route, next) {
    //     sim_route.log("Have directions, putting icons to map");
    //     sim_route.route = sim_route.directionsResponce.routes[0];
    //     sim_route.startLocation = new Object();
    //     sim_route.endLocation = new Object();
    //     sim_route.polyline = new google.maps.Polyline({
    //         path: [],
    //         strokeColor: getColor(sim_route.ID),
    //         strokeWeight: 3
    //     });
    //     sim_route.path = sim_route.directionsResponce.routes[0].overview_path;
    //     sim_route.legs = sim_route.directionsResponce.routes[0].legs;
    //
    //     sim_route.directionsRenderer = new google.maps.DirectionsRenderer(sim_route.rendererOptions);
    //     sim_route.directionsRenderer.setMap(map);
    //     sim_route.directionsRenderer.setDirections(sim_route.directionsResponce);
    //
    //     next(sim_route);
    // };

    function addMarker(sim_route, next) {
        for (i=0;i<sim_route.legs.length;i++){
            if (i == 0) {
                //put marker on start
                sim_route.startLocation.latlng = sim_route.legs[i].start_location;
                sim_route.startLocation.address = sim_route.legs[i].start_address;
                sim_route.marker = createMarker(sim_route.legs[i].start_location,("ID"+ sim_route.ID),sim_route.legs[i].start_address);
            }
            var steps = sim_route.legs[i].steps;
            for (j=0;j<steps.length;j++) {
                var nextSegment = steps[j].path;
                for (k=0;k<nextSegment.length;k++) {
                    sim_route.polyline.getPath().push(nextSegment[k]);
                }

            }
        }
        next;
    };

    function putOnMap(sim_route) {
        sim_route.polyline.setMap(map);
        sim_route.visible = true;
    };

    if(sim_route.ready === false ){
        //sim_route.log("No Directions , getting");
        //sim_route.getDirections(this.drawRoute);
        sim_route.initObjects(sim_route,sim_route.drawRoute);
    }
    else {
            // sim_route.log("Have directions, putting icons to map");
            // sim_route.route = sim_route.directionsResponce.routes[0];
            // sim_route.startLocation = new Object();
            // sim_route.endLocation = new Object();
            // sim_route.polyline = new google.maps.Polyline({
            //     path: [],
            //     strokeColor: getColor(sim_route.ID),
            //     strokeWeight: 3
            // });
            // sim_route.path = sim_route.directionsResponce.routes[0].overview_path;
            // sim_route.legs = sim_route.directionsResponce.routes[0].legs;
            //
            // sim_route.directionsRenderer = new google.maps.DirectionsRenderer(sim_route.rendererOptions);
            // sim_route.directionsRenderer.setMap(map);
            // sim_route.directionsRenderer.setDirections(sim_route.directionsResponce);
            //initObjects(sim_route,addMarker(sim_route,putOnMap(sim_route,null)));

            // //add marker
            // for (i=0;i<sim_route.legs.length;i++){
            //     if (i == 0) {
            //         //put marker on start
            //         sim_route.startLocation.latlng = sim_route.legs[i].start_location;
            //         sim_route.startLocation.address = sim_route.legs[i].start_address;
            //         sim_route.marker = createMarker(sim_route.legs[i].start_location,("ID"+ sim_route.ID),sim_route.legs[i].start_address);
            //     }
            //     var steps = sim_route.legs[i].steps;
            //     for (j=0;j<steps.length;j++) {
            //         var nextSegment = steps[j].path;
            //         for (k=0;k<nextSegment.length;k++) {
            //             sim_route.polyline.getPath().push(nextSegment[k]);
            //         }
            //
            //     }
            // }
            // //put on map
            //
            // sim_route.polyline.setMap(map);
            // sim_route.visible = true;
        addMarker(sim_route,putOnMap(sim_route,null));
    }
};

simRoute.prototype.unDraw = function () {
    // this.markers.forEach(function (mark) {
    //     mark.
    // })
    this.log("undrawing..");
    this.polyline.setMap(null);
    this.polyline.visible = false;
}

simRoute.prototype.getCurrentPosition = function (sim_route) {
    if (sim_route.hasOwnProperty('polyline'))
        return sim_route.polyline.GetPointAtDistance(this.distancePassed);
    else {
        return sim_route.initObjects(sim_route,sim_route.getCurrentPosition);
    }
};

function handleAddSimRouteManual() {
    //var log = document.getElementById('log');
   // var inputSource = document.getElementById('autoDriveSource');
    //var searchBoxSource = new google.maps.places.SearchBox(inputSource);
    //var inputDestination = document.getElementById('autoDriveDestination');
    //var searchBoxDestination = new google.maps.places.SearchBox(inputDestination);
    //var places = searchBoxSource.getPlaces();
    //places.forEach(function(place){

    //alert(document.getElementById('autoDriveSource').textContent);
    //});

    if (!(currentSource == null || currentDestination == null)){
        //log.textContent  = currentSource + " -> " + currentDestination;

        var route = new simRoute(currentSource,currentDestination);

        //startLoc.push(currentSource);
        //endLoc.push(currentDestination);
        //clear currents
        currentDestination = null;
        currentSource = null;
        document.getElementById('autoDriveSource').value = '';
        document.getElementById('autoDriveDestination').value = '';

    }

}

function handleAddSimRouteRandom() {
    var start;
    var end;
    do {
        end = simLocations[getRandomInt(0,simLocations.length)];
        start = simLocations[getRandomInt(0,simLocations.length)];
    }
    while (end == start || end == null || start == null);
    var route = new simRoute(start,end);
    //route.drawRoute(route);
}


function clearData(){
    console.log("All routes removed");
    simRoutes.forEach(function (value) {
        //console.log(value);
        value.unDraw();
    })
    simRoutes = new Array();
}

function createMarker(latlng, label, html) {
// alert("createMarker("+latlng+","+label+","+html+","+color+")");
    var contentString = '<b>'+label+'</b><br>'+html;
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: label,
        zIndex: Math.round(latlng.lat()*-100000)<<5
    });
    marker.myname = label;


    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(contentString);
        infowindow.open(map,marker);
    });
    return marker;
}

function operateSimulation(){
    // simRoutes.forEach(function (route) {
    //     if (route.visible == false ){
    //         route.drawRoute(route);
    //     }
    // });
    if (simulationRunning == true){
        console.log("Pausing simulation");
        simulationRunning = false;
        document.getElementById('sim_operator').value = 'Start';
    }else {
        console.log("Starting simulation");
        simulationRunning = true;
        document.getElementById('sim_operator').value = 'Pause';
    }

    var t = setInterval(function () {
        simStep();
    },1000);
    //setInterval(simStep(),1000);
}

function simStep() {
    if (simulationRunning == true){
        // if (route.visible == false ){
        //     route.drawRoute(route);
        // }
        simRoutes.forEach(function (route) {
            if (route.visible == false ){
                route.drawRoute(route);
            }
            route.move();
        })
    }
}

function pauseSimulation(){
    simulationRunning = false;
}



simRoute.prototype.move = function (){
    //this.log("moving");
    // if (this.following = true){
    //     this.marker.setMap(null);
    // }
    // else{
    //     this.getCarsNear(1000);
    // }

    //check if some one else driving near and not following //, radius kilometer
    //var near = this.getCarsNear(1000);
    //join if your path are similar till break at distance x

    var me = this;
    if (!me.ready){
        try{
            me.initObjects(me,me.move);
        }
        catch (e){
            return;
        }

    }

    try{
        if (me.distancePassed < me.polyline.Distance()) {
            //me.log("moving " + me.speed +"m forward");
            me.distancePassed = me.distancePassed + me.speed;
            var p = me.polyline.GetPointAtDistance(me.distancePassed);
            me.marker.setPosition(p);
        }
    }
    catch (e) {
        //no distance:
        me.log(e);
    }
    // if (!me.hasOwnProperty('servers') && me.distancePassed > 0){me.getServers();}
    //
    //
    // if (me.hasOwnProperty('servers') && !me.following){  //&& this.queryRunner === 0){
    //     me.servers.forEach(function (url) {
    //         //me.log(val);
    //         me.getCars(url);
    //     });
    //     //this.queryRunner = queryFrequency;
    // }
    // // else{
    // //     this.queryRunner--;
    // // }
    //
    // //if (this.distancePassed > 0) {
    // //if (me.hasOwnProperty('polyline')){
    // if (me.polyline.Distance !== null){
    //     //if (me.distancePassed < me.travelDistance) {
    //     if (me.distancePassed < me.polyline.Distance()) {
    //             me.log("moving " + me.speed +"m forward");
    //             me.distancePassed = me.distancePassed + me.speed;
    //             var p = me.polyline.GetPointAtDistance(me.distancePassed);
    //             me.marker.setPosition(p);
    //         }
    //     }
    //
    // else{
    //     me.log("moving without polyline, initiating objects");
    //     me.initObjects(me,me.move);
    // }
    //send to server my loc to server


};

simRoute.prototype.getServers = function () {

    var p = this.getCurrentPosition(this);
    if (p === undefined){
        var me = this;
        $.ajax({
            type: "GET",
            url: global_service + p.lat() + '/' + p.lng(),
            success: function (data) {
                me.log(data);
                me.servers = data;
            },
            failure: function(errMsg) {
                me.log(errMsg);
            }
        });
    }
    else{
        this.log("no position in get servers");

        //this.getServers(this);
    }

};

simRoute.prototype.getCars = function (url) {
    var p = this.getCurrentPosition(this);
    var myCar =  new Object();
    myCar.x = p.lat();
    myCar.y = p.lng();
    myCar.id = this.ID;
    var me = this;

    $.ajax({
        type: "POST",
        url: url,
        data: myCar,
        //contentType: "application/json; charset=utf-8",
        dataType: 'json',
        success: function (data) {
            //add( 'Data: ' + JSON.stringify(data));
            me.cars = data;

        },
        failure: function(errMsg) {
            //add( 'Error: '+  errMsg);
            me.log(errMsg);
        }
    });
};




var rad = function(x) {
    return x * Math.PI / 180;
};

var dist = function(p1, p2) {
    var R = 6378137; // Earth’log mean radius in meter
    var dLat = rad(p2.lat() - p1.lat());
    var dLong = rad(p2.lng() - p1.lng());
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    d = Math.round(d * 100) / 100
    return d; // returns the distance in meter
};

// simRoute.prototype.getCarsNear = function(radiusMeters){
//     var nearMe = new Array();
//     //var myLatlng = this.marker.position;
//     // simRoutes.forEach(function (element) {
//     //     //console.log (myLatlng , element.marker.position);
//     //     if (element.following == false){
//     //         var distance = getDistance(myLatlng,element.marker.position);
//     //         if (distance < radiusMeters ) {
//     //             nearMe.push(element);
//     //         }
//     //     }
//     // });
//     for (i=0;i<simRoutes.length;i++ ){
//         if (simRoutes[i] != this){
//             if (simRoutes[i] .following == false){
//                 var distance = getDistance(this.marker.position,simRoutes[i].marker.position);
//                 if (distance < radiusMeters ) {
//                     this.log(simRoutes[i].ID + " in " + distance + " meter from me.");
//                     //this.log("joining to " + simRoutes[i].ID);
//                     //nearMe.push(simRoutes[i]);
//                     //this.following = true;
//                 }
//             }
//         }
//     }
//     return nearMe;
// };



simRoute.prototype.locNow= function (){
    return this.polyline.GetPointAtDistance(this.distancePassed);
};

simRoute.prototype.locAt= function (meters){
    return this.polyline.GetPointAtDistance(this.distancePassed + meters);
};


simRoute.prototype.locIn= function (ticks){
    return this.polyline.GetPointAtDistance(this.distancePassed + ticks*speed);
};







simRoute.prototype.simRouteTest= function (car2) {
    var car1 = this;
    car1.log("Comparing routes with "+ car2.ID);
    var p1 = car1.locNow();
    var p2 = car2.locNow();
    car1.log("Current distance " + dist(p1,p2));
}


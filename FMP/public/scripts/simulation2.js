
//globals
var distances = range(50,1000,50);


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

var global_service = "http://localhost:3000/fms/";
var simRoutes = new Array();
var simLocations =["Tel Aviv-Yafo, Israel","Jerusalem, Israel","Haifa, Israel","Be'er Sheva, Israel","Ashdod, Israel","Tiberias, Israel","Sderot, Israel","Afula, Israel","Shlomi, Israel"];
var simBaseID = "10000000";
var queryFrequency = 10;
var simulationRunning = false;
var timer = 0;

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
        if (!this.silent)
        console.log("ID:" + this.ID + ": " + message);
    }
    function getDirections(thisRoute, callback) {
        if (thisRoute.directionsResponce != null) {
            return thisRoute.directionsResponce;
        }
        else {
            directionsService = new google.maps.DirectionsService();
            var request = {
                origin: thisRoute.start,
                destination:thisRoute.end,
                travelMode: thisRoute.travelMode
            };
            thisRoute.log("Getting directions");
            directionsService.route(request,setDirectionsCallback(thisRoute,callback));
        }
    }
    function setDirectionsCallback (thisRoute,callback){
        return function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                thisRoute.log("Directions received , saving...");
                thisRoute.directionsResponce = response;
                callback(thisRoute);
            }
        }
    }

    this.drawRoute = function() {
    //toDO - fix Line visualisation
        this.log("Drawing on map");
        function addMarker(sim_route, next) {
            for (i=0;i<sim_route.legs.length;i++){
                if (i == 0) {
                    //put marker on start
                    sim_route.startLocation.latlng = sim_route.legs[i].start_location;
                    sim_route.startLocation.address = sim_route.legs[i].start_address;
                    sim_route.marker = createMarker(sim_route.legs[i].start_location,("ID:"+ sim_route.ID),sim_route.legs[i].start_address);
                    //sim_route.marker = createMarker(sim_route.start +">"+sim_route.end,("ID:"+ sim_route.ID),sim_route.legs[i].start_address);
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

        addMarker(this,putOnMap(this));

        this.visible = true;
    }
    this.move = function() {
        var me = this;
        if (me.distancePassed < me.polyline.Distance()) {
            //me.log("moving " + me.speed +"m forward");
            me.distancePassed = me.distancePassed + me.speed;
            var p = me.polyline.GetPointAtDistance(me.distancePassed);
            me.marker.setPosition(p);
        }
        //this.log("in " + this.getCurrentPosition().toString());
        if (!me.hasOwnProperty('servers')) {
            me.log("Getting servers");
            me.getServers();
        }


        if (me.hasOwnProperty('servers') && !me.following && Object.keys(me.carsAround).length === 0) {  //&& this.queryRunner === 0){
            me.servers.forEach(function (url,id) {
                me.log("Asking cars at: " + url);
                me.getCars(url);
            },me);
        };

        //if we have cars contact them directly and ask their poly
        if (Object.keys(me.carsAround).length > 0 ){
            Object.keys(me.carsAround).forEach(function (key) {
                var car2 = me.carsAround[key]
                // iteration code
                //me.log("comparing to" + car.ID);
                me.simRouteTest(car2);
            })
        }
    }

    this.getServers = function () {
        var p = this.getCurrentPosition();
        var me = this;
            $.ajax({
                type: "GET",
                url: global_service + p.lat() + '/' + p.lng(),
                success: function (data) {
                    //me.log(data);
                    me.servers = data;
                    me.log("Servers received :" + data);
                },
                failure: function(errMsg) {
                    me.log(errMsg);
                }
            });
    };
    this.getCurrentPosition = function () {
        var p = this.polyline.GetPointAtDistance(this.distancePassed);
        return p;
    };

    this.getCars = function (url) {
            var p = this.getCurrentPosition();
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
                    //me.log('Cars data: ' + JSON.stringify(data));
                    me.setCars(data);

                },
                failure: function(errMsg) {
                    //add( 'Error: '+  errMsg);
                    me.log(errMsg);
                }
            });
        };

    this.setCars = function (arr) {
        var me = this;
        if (arr.length >0 ){
            //this.log(arr);
            arr.forEach(function (car) {
                me.log("Car to contact :" + JSON.stringify(car));
                me.contactCar(car.id,function (carObject) {
                    var i = car.id.toString().toUpperCase();
                    me.carsAround[i] = carObject;
                },me);
                //me.carsAround[car.id] = me.contactCar(car.id);
            },me);
        }
    };

    this.start = start;
    this.end = end;
    this.ID = getID();
    this.travelMode = google.maps.DirectionsTravelMode.DRIVING;
    this.directionsResponce = null;
    this.distancePassed = 0;
    this.travelDistance = 0;
    this.speed = 50; // metres per tick
    this.fuelConsamptionPerKM = 11;
    this.rendererOptions = {
        map: map,
        suppressMarkers : true,
        preserveViewport: true
    }
    this.marker = null;
    this.following = false;
    this.visible = false;
    this.readyToDrive = false;
    this.carsAround = {};
    this.silent = true;


    this.log("Adding simulation: from " + start + " to " + end);
    this.log("Sim ID: " + this.ID);
    simRoutes.push(this);
    this.log("Simulation route " + this.ID  + " added");


    getDirections(this,function (thisRoute) {
        thisRoute.log("Have Directions,  initiating objects");
        thisRoute.route = thisRoute.directionsResponce.routes[0];
        thisRoute.startLocation = new Object();
        thisRoute.endLocation = new Object();
        thisRoute.polyline = new google.maps.Polyline({
            path: [],
            strokeColor: getColor(thisRoute.ID),
            strokeWeight: 3
        });
        //sim_route.travelDistance = this.polyline.Distance()
        thisRoute.path = thisRoute.directionsResponce.routes[0].overview_path;
        thisRoute.legs = thisRoute.directionsResponce.routes[0].legs;

        thisRoute.directionsRenderer = new google.maps.DirectionsRenderer(thisRoute.rendererOptions);
        thisRoute.directionsRenderer.setMap(map);
        thisRoute.directionsRenderer.setDirections(thisRoute.directionsResponce);
        thisRoute.log("Initiated, marking to drive");
        thisRoute.readyToDrive = true;

    });

    //toDo - should send info to the server and get info from there
    this.contactCar = function (carID,next) {
        //var car = null;
        var  me = this;
        simRoutes.forEach(function (route) {
            //me.log(route);
            if (route.ID.toString().toUpperCase() === carID.toString().toUpperCase())
            {
                next(route);
            }
        },me);
    };

    this.locationAt = function (meters){
        return this.polyline.GetPointAtDistance(this.distancePassed + meters);
    };


    this.simRouteTest = function (car2) {
        var car1 = this;
        car1.log("Comparing routes with "+ car2.ID);
        var p1 = car1.getCurrentPosition();
        var p2 = car2.getCurrentPosition();
        var distanceBetween = dist(p1,p2);
        car1.log(">"+  car2.ID +" current distance:" + distanceBetween);
        var result = new Array(distances.length);
        for (i = 0; i< distances.length ; i++ ){
            result[i] = dist(car1.locationAt(distances[i]),car2.locationAt(distances[i]));
        }
        //car1.log(result);

        //decisions maker
        if (distanceBetween > 1000){
            car1.log("We are too far...");
            //toDo- remove far car
        }
        else{
            //toDo - calculate SLOPE //currently simple calculation version
            var limit = result.length -1 ;
            var radian = 0;
            if((result.length)%2==0) {limit =  result.length};
            for (i = 0; i< limit ; i+=2 ){
                radian = radian +result[i] -result[i+1]
            }
            car1.log(">"+car2.ID + " radian:" + radian );
            var radLimit = 150;
            if (radian < radLimit && radian> (radLimit*(-1)) ){
                car1.log("BINGO - car "+ car2.ID + " can be used for chain for next " + distances[distances.length-1]/1000 + "km");
                var comparePoint = 800;
                var dist1 = car1.locationAt(comparePoint);
                var dist2 = car2.locationAt(comparePoint);
                if (dist1<dist2){
                    car1.log("i'll wait for :" + car2.ID);
                    car2.following = true;
                }
                else{
                    car1.log("i'll rush to :" + car2.ID);
                    car1.following = true;
                }
            }
        }

    }

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

function operateSimulation(){
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
            if (!route.visible && route.readyToDrive){
                    route.drawRoute(route);
                }
            if (route.readyToDrive)
                route.move();
        })
    }
}

function range(start, stop, step) {
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }

    if (typeof step == 'undefined') {
        step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
};
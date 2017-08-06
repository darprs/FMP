
var express = require('express');
var log = require('../system/fmLog');
// var fmService = require('../system/fmService');
// var HashMap = require('hashmap');
var fmGlobal = require('../system/fmGlobal');
// 32.119257, 34.836756
// 31.886633, 34.781138

var globalService = new fmGlobal();
//adding test services
globalService.addService(32.119257, 34.836756,100,"");
// globalService.addService(31.886633, 34.781138,100,"");
// globalService.addService(31.845123, 34.796507,100,"");

var router = express.Router();


//var servicesHash = new Object();
//servicesHash["1"] = new fmService(31.845123, 34.796507,100);
// var servicesHash = new HashMap();
// servicesHash.set(1,new fmService(31.845123, 34.796507,100));


// var fms_requests = new Object();
// fms_requests.counter = 0;
// fms_requests.next = function (func) {
//     log("GET FMS/");
//     this.counter ++;
//     func();
// };



router.get('/:long/:lat', function(req, res, next) {

    // fms_requests.next( function(){
    //     res.send(JSON.stringify(fms_requests, null, 3))
    // });
    res.send(globalService.getServers());
});


router.post('/services/:serviceID',function(req, res, next){
    var sid = parseInt(req.params.serviceID);
    log("fmSID:" + sid + "  requested");
    log("Requester: " + JSON.stringify(req.body));
    //res.send(servicesHash.get(1));
     if (globalService.servicesHash.get(sid)){
         log("fmSID:" + sid + " found");
         globalService.servicesHash.get(sid).processCar(req.body);
         res.send(globalService.servicesHash.get(sid).getCars(req.body.id));
     }
     else{
         log("fmSID:" + sid + " not found");
         res.send(null);
     }
});

router.post('/log/:carID',function(req, res, next){
    var sid = parseInt(req.params.carID);

    //log("Requester: " + JSON.stringify(req.body));
    //res.send(servicesHash.get(1));
    // if (globalService.servicesHash.get(sid)){
    //     log("fmSID:" + sid + " found");
    //     globalService.servicesHash.get(sid).processCar(req.body);
    //     res.send(globalService.servicesHash.get(sid).getCars(req.body.id));
    // }
    // else{
    //     log("fmSID:" + sid + " not found");
    //     res.send(null);
    // }
});

module.exports = router;
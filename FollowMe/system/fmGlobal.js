var distance = require('./fmDist');
var config = require('./config.json');
var log = require('../system/fmLog');
var HashMap = require('hashmap');
var fmService = require('../system/fmService');
var ArrayList = require('arraylist');

function fmGlobal(){
    this.servicesHash = new HashMap();
    this.currentID = 1;
};

fmGlobal.prototype.addService =function(geox,geoy,radius,address) {
    var id = this.currentID++;
    if (address === "")
        address = config.hosting_service + id;
    this.servicesHash.set(id,new fmService(geox, geoy,radius,address));
    log("fmSID:" + id + " created (" + address + ")");
};


//function returns up to 6 closest service points
fmGlobal.prototype.getServers = function (x,y) {
    var res = new ArrayList();
    this.servicesHash.forEach(function (service, index) {
        //if (distance(,))
        //to-do limit by distance
        res.add(service.address);
    });
    return res;
};

module.exports = fmGlobal;
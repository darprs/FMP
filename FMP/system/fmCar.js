var time = require('./fmTime');
var log = require('../system/fmLog');
var ArrayList = require('arraylist');

function fmCar(id ,geoX , geoY ) {
    this.id = id;
    this.loc = new ArrayList();
    this.loc.add({'x':geoX,'y':geoY});
    this.stamp = new Date().getTime();
    log("fmCarID:" + this.id + " created :" + JSON.stringify(this));
}

fmCar.prototype.set = function (geoX , geoY ) {
    this.loc.add({'x':geoX,'y':geoY});
    this.stamp = new Date().getTime();
    log("fmCarID:" + this.id + " updated");
};

fmCar.prototype.get = function () {
    var c = new Object();
    c.id = this.id;
    c.loc = this.loc.get(0);
    c.stamp = this.stamp;
    return c;
};

module.exports = fmCar;